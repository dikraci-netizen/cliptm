package com.cliptm.socialmedia.data.social

import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

/**
 * Result of a publish operation
 */
data class PublishResult(
    val success: Boolean,
    val platform: SocialPlatform,
    val postId: String = "",
    val postUrl: String = "",
    val error: String = ""
)

/**
 * Service for publishing content directly to connected social media accounts.
 */
@Singleton
class DirectPublishService @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val gson: Gson
) {
    /**
     * Publish text content to a connected account
     */
    suspend fun publishText(
        account: ConnectedAccount,
        text: String,
        mediaUrls: List<String> = emptyList(),
        hashtags: List<String> = emptyList()
    ): PublishResult {
        return when (account.platform) {
            SocialPlatform.FACEBOOK -> publishToFacebook(account, text, mediaUrls)
            SocialPlatform.TWITTER -> publishToTwitter(account, text, mediaUrls)
            SocialPlatform.LINKEDIN -> publishToLinkedIn(account, text, mediaUrls)
            SocialPlatform.INSTAGRAM -> publishToInstagram(account, text, mediaUrls)
            SocialPlatform.THREADS -> publishToThreads(account, text, mediaUrls)
            SocialPlatform.PINTEREST -> publishToPinterest(account, text, mediaUrls)
            SocialPlatform.TELEGRAM -> publishToTelegram(account, text)
            else -> PublishResult(false, account.platform, error = "Platform not supported for direct publishing yet")
        }
    }

    /**
     * Publish to multiple platforms at once
     */
    suspend fun publishToMultiple(
        accounts: List<ConnectedAccount>,
        text: String,
        mediaUrls: List<String> = emptyList(),
        hashtags: List<String> = emptyList()
    ): List<PublishResult> {
        return accounts.map { account ->
            try {
                publishText(account, text, mediaUrls, hashtags)
            } catch (e: Exception) {
                PublishResult(false, account.platform, error = e.message ?: "Unknown error")
            }
        }
    }

    // ===== Platform-Specific Publishing =====

    private suspend fun publishToFacebook(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        val endpoint = account.platform.publishEndpoint.replace("{page_id}", account.pageId)
        val body = JsonObject().apply {
            addProperty("message", text)
            addProperty("access_token", account.accessToken)
            if (mediaUrls.isNotEmpty()) addProperty("link", mediaUrls.first())
        }
        return postJson(endpoint, body, account.platform)
    }

    private suspend fun publishToTwitter(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        val body = JsonObject().apply { addProperty("text", text.take(280)) }
        return postJsonWithBearer(
            "https://api.twitter.com/2/tweets", body,
            account.accessToken, account.platform
        )
    }

    private suspend fun publishToLinkedIn(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        val body = JsonObject().apply {
            addProperty("author", "urn:li:person:${account.userId}")
            addProperty("lifecycleState", "PUBLISHED")
            add("specificContent", gson.toJsonTree(mapOf(
                "com.linkedin.ugc.ShareContent" to mapOf(
                    "shareCommentary" to mapOf("text" to text),
                    "shareMediaCategory" to if (mediaUrls.isEmpty()) "NONE" else "ARTICLE"
                )
            )))
            add("visibility", gson.toJsonTree(mapOf("com.linkedin.ugc.MemberNetworkVisibility" to "PUBLIC")))
        }
        return postJsonWithBearer(
            "https://api.linkedin.com/v2/ugcPosts", body,
            account.accessToken, account.platform
        )
    }

    private suspend fun publishToInstagram(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        if (mediaUrls.isEmpty()) {
            return PublishResult(false, SocialPlatform.INSTAGRAM, error = "Instagram requires an image or video")
        }
        // Step 1: Create media container
        val containerBody = JsonObject().apply {
            addProperty("image_url", mediaUrls.first())
            addProperty("caption", text)
            addProperty("access_token", account.accessToken)
        }
        val containerUrl = "https://graph.instagram.com/v18.0/${account.userId}/media"
        val containerResult = postJson(containerUrl, containerBody, SocialPlatform.INSTAGRAM)
        if (!containerResult.success) return containerResult

        // Step 2: Publish container
        val publishBody = JsonObject().apply {
            addProperty("creation_id", containerResult.postId)
            addProperty("access_token", account.accessToken)
        }
        val publishUrl = "https://graph.instagram.com/v18.0/${account.userId}/media_publish"
        return postJson(publishUrl, publishBody, SocialPlatform.INSTAGRAM)
    }

    private suspend fun publishToThreads(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        val body = JsonObject().apply {
            addProperty("text", text)
            addProperty("media_type", if (mediaUrls.isEmpty()) "TEXT" else "IMAGE")
            if (mediaUrls.isNotEmpty()) addProperty("image_url", mediaUrls.first())
            addProperty("access_token", account.accessToken)
        }
        val endpoint = "https://graph.threads.net/v1.0/${account.userId}/threads"
        return postJson(endpoint, body, SocialPlatform.THREADS)
    }

    private suspend fun publishToPinterest(account: ConnectedAccount, text: String, mediaUrls: List<String>): PublishResult {
        if (mediaUrls.isEmpty()) return PublishResult(false, SocialPlatform.PINTEREST, error = "Pinterest requires an image")
        val body = JsonObject().apply {
            addProperty("title", text.take(100))
            addProperty("description", text)
            add("media_source", gson.toJsonTree(mapOf("source_type" to "image_url", "url" to mediaUrls.first())))
        }
        return postJsonWithBearer("https://api.pinterest.com/v5/pins", body, account.accessToken, SocialPlatform.PINTEREST)
    }

    private suspend fun publishToTelegram(account: ConnectedAccount, text: String): PublishResult {
        val botToken = account.accessToken
        val chatId = account.pageId // channel ID
        val body = JsonObject().apply {
            addProperty("chat_id", chatId)
            addProperty("text", text)
            addProperty("parse_mode", "HTML")
        }
        return postJson("https://api.telegram.org/bot$botToken/sendMessage", body, SocialPlatform.TELEGRAM)
    }

    // ===== HTTP Helpers =====

    private suspend fun postJson(url: String, body: JsonObject, platform: SocialPlatform): PublishResult {
        return suspendCoroutine { cont ->
            val request = Request.Builder()
                .url(url)
                .post(body.toString().toRequestBody("application/json".toMediaType()))
                .addHeader("Content-Type", "application/json")
                .build()
            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    cont.resume(PublishResult(false, platform, error = e.message ?: "Network error"))
                }
                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val json = try { gson.fromJson(responseBody, JsonObject::class.java) } catch (e: Exception) { null }
                        val postId = json?.get("id")?.asString ?: json?.get("result")?.asJsonObject?.get("message_id")?.asString ?: ""
                        cont.resume(PublishResult(true, platform, postId = postId))
                    } else {
                        cont.resume(PublishResult(false, platform, error = "Error ${response.code}: $responseBody"))
                    }
                }
            })
        }
    }

    private suspend fun postJsonWithBearer(url: String, body: JsonObject, token: String, platform: SocialPlatform): PublishResult {
        return suspendCoroutine { cont ->
            val request = Request.Builder()
                .url(url)
                .post(body.toString().toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .build()
            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    cont.resume(PublishResult(false, platform, error = e.message ?: "Network error"))
                }
                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val json = try { gson.fromJson(responseBody, JsonObject::class.java) } catch (e: Exception) { null }
                        val postId = json?.get("id")?.asString ?: json?.getAsJsonObject("data")?.get("id")?.asString ?: ""
                        cont.resume(PublishResult(true, platform, postId = postId))
                    } else {
                        cont.resume(PublishResult(false, platform, error = "Error ${response.code}: $responseBody"))
                    }
                }
            })
        }
    }
}
