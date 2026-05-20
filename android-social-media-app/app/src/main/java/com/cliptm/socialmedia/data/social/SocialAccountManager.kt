package com.cliptm.socialmedia.data.social

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.socialDataStore by preferencesDataStore(name = "social_accounts")

/**
 * Supported social media platforms with OAuth2 configuration.
 */
enum class SocialPlatform(
    val displayName: String,
    val icon: String,
    val authUrl: String,
    val tokenUrl: String,
    val scopes: List<String>,
    val publishEndpoint: String,
    val packageName: String = ""
) {
    INSTAGRAM(
        "Instagram", "📸",
        "https://api.instagram.com/oauth/authorize",
        "https://api.instagram.com/oauth/access_token",
        listOf("instagram_basic", "instagram_content_publish", "pages_show_list"),
        "https://graph.instagram.com/v18.0/{user_id}/media",
        "com.instagram.android"
    ),
    FACEBOOK(
        "Facebook", "📘",
        "https://www.facebook.com/v18.0/dialog/oauth",
        "https://graph.facebook.com/v18.0/oauth/access_token",
        listOf("pages_manage_posts", "pages_read_engagement", "publish_to_groups"),
        "https://graph.facebook.com/v18.0/{page_id}/feed",
        "com.facebook.katana"
    ),
    TIKTOK(
        "TikTok", "🎵",
        "https://www.tiktok.com/v2/auth/authorize/",
        "https://open.tiktokapis.com/v2/oauth/token/",
        listOf("video.publish", "video.upload", "user.info.basic"),
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        "com.zhiliaoapp.musically"
    ),
    TWITTER(
        "Twitter/X", "🐦",
        "https://twitter.com/i/oauth2/authorize",
        "https://api.twitter.com/2/oauth2/token",
        listOf("tweet.read", "tweet.write", "users.read", "offline.access"),
        "https://api.twitter.com/2/tweets",
        "com.twitter.android"
    ),
    LINKEDIN(
        "LinkedIn", "💼",
        "https://www.linkedin.com/oauth/v2/authorization",
        "https://www.linkedin.com/oauth/v2/accessToken",
        listOf("w_member_social", "r_liteprofile", "r_emailaddress"),
        "https://api.linkedin.com/v2/ugcPosts",
        "com.linkedin.android"
    ),
    YOUTUBE(
        "YouTube", "🎬",
        "https://accounts.google.com/o/oauth2/v2/auth",
        "https://oauth2.googleapis.com/token",
        listOf("https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"),
        "https://www.googleapis.com/upload/youtube/v3/videos",
        "com.google.android.youtube"
    ),
    PINTEREST(
        "Pinterest", "📌",
        "https://api.pinterest.com/oauth/",
        "https://api.pinterest.com/v5/oauth/token",
        listOf("boards:read", "pins:read", "pins:write"),
        "https://api.pinterest.com/v5/pins",
        ""
    ),
    SNAPCHAT(
        "Snapchat", "👻",
        "https://accounts.snapchat.com/login/oauth2/authorize",
        "https://accounts.snapchat.com/login/oauth2/access_token",
        listOf("snapchat-marketing-api"),
        "https://adsapi.snapchat.com/v1/adaccounts/{ad_account_id}/creatives",
        "com.snapchat.android"
    ),
    THREADS(
        "Threads", "🧵",
        "https://threads.net/oauth/authorize",
        "https://graph.threads.net/oauth/access_token",
        listOf("threads_basic", "threads_content_publish"),
        "https://graph.threads.net/v1.0/{user_id}/threads",
        "com.instagram.barcelona"
    ),
    WHATSAPP(
        "WhatsApp Business", "💬",
        "",
        "",
        listOf(),
        "https://graph.facebook.com/v18.0/{phone_number_id}/messages",
        "com.whatsapp.w4b"
    ),
    TELEGRAM(
        "Telegram", "✈️",
        "",
        "",
        listOf(),
        "https://api.telegram.org/bot{token}/sendMessage",
        "org.telegram.messenger"
    )
}

/**
 * Connected social media account
 */
data class ConnectedAccount(
    val id: String = System.currentTimeMillis().toString(),
    val platform: SocialPlatform,
    val username: String = "",
    val displayName: String = "",
    val profileImageUrl: String = "",
    val accessToken: String = "",
    val refreshToken: String = "",
    val tokenExpiry: Long = 0L,
    val pageId: String = "",
    val userId: String = "",
    val isActive: Boolean = true,
    val connectedAt: Long = System.currentTimeMillis(),
    val lastPublishedAt: Long = 0L,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Manages social media account connections via OAuth2.
 */
@Singleton
class SocialAccountManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson
) {
    private val ACCOUNTS_KEY = stringPreferencesKey("connected_accounts")

    /**
     * Get all connected accounts
     */
    fun getConnectedAccounts(): Flow<List<ConnectedAccount>> {
        return context.socialDataStore.data.map { prefs ->
            val json = prefs[ACCOUNTS_KEY] ?: "[]"
            gson.fromJson(json, object : TypeToken<List<ConnectedAccount>>() {}.type) ?: emptyList()
        }
    }

    /**
     * Save a connected account
     */
    suspend fun saveAccount(account: ConnectedAccount) {
        context.socialDataStore.edit { prefs ->
            val json = prefs[ACCOUNTS_KEY] ?: "[]"
            val accounts: MutableList<ConnectedAccount> = gson.fromJson(
                json, object : TypeToken<MutableList<ConnectedAccount>>() {}.type
            ) ?: mutableListOf()
            accounts.removeAll { it.platform == account.platform && it.userId == account.userId }
            accounts.add(account)
            prefs[ACCOUNTS_KEY] = gson.toJson(accounts)
        }
    }

    /**
     * Remove a connected account
     */
    suspend fun removeAccount(accountId: String) {
        context.socialDataStore.edit { prefs ->
            val json = prefs[ACCOUNTS_KEY] ?: "[]"
            val accounts: MutableList<ConnectedAccount> = gson.fromJson(
                json, object : TypeToken<MutableList<ConnectedAccount>>() {}.type
            ) ?: mutableListOf()
            accounts.removeAll { it.id == accountId }
            prefs[ACCOUNTS_KEY] = gson.toJson(accounts)
        }
    }

    /**
     * Build OAuth2 authorization URL for a platform
     */
    fun buildAuthUrl(platform: SocialPlatform, clientId: String, redirectUri: String): String {
        val state = "cliptm_${System.currentTimeMillis()}"
        return when (platform) {
            SocialPlatform.TIKTOK -> "${platform.authUrl}?client_key=$clientId&response_type=code&scope=${platform.scopes.joinToString(",")}&redirect_uri=$redirectUri&state=$state"
            SocialPlatform.TWITTER -> "${platform.authUrl}?response_type=code&client_id=$clientId&redirect_uri=$redirectUri&scope=${platform.scopes.joinToString("%20")}&state=$state&code_challenge=challenge&code_challenge_method=plain"
            else -> "${platform.authUrl}?client_id=$clientId&redirect_uri=$redirectUri&scope=${platform.scopes.joinToString(",")}&response_type=code&state=$state"
        }
    }

    /**
     * Launch OAuth flow in browser
     */
    fun launchOAuth(platform: SocialPlatform, clientId: String, redirectUri: String) {
        val url = buildAuthUrl(platform, clientId, redirectUri)
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    /**
     * Check if token needs refresh
     */
    fun isTokenExpired(account: ConnectedAccount): Boolean {
        return account.tokenExpiry > 0 && System.currentTimeMillis() > account.tokenExpiry
    }
}
