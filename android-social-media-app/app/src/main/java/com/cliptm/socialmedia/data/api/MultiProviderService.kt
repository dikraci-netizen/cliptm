package com.cliptm.socialmedia.data.api

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
 * Universal API service that can call ANY provider's API.
 * Handles different request formats (OpenAI, Gemini, Claude, etc.)
 */
@Singleton
class MultiProviderService @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val gson: Gson
) {

    /**
     * Send a text generation request to any provider
     */
    suspend fun generateText(
        provider: ApiProvider,
        messages: List<Map<String, String>>,
        temperature: Double = 0.8,
        maxTokens: Int = 3000
    ): Result<String> {
        return when (provider.requestFormat) {
            RequestFormat.OPENAI_COMPATIBLE -> callOpenAIFormat(provider, messages, temperature, maxTokens)
            RequestFormat.GOOGLE_GEMINI -> callGeminiFormat(provider, messages, temperature, maxTokens)
            RequestFormat.ANTHROPIC -> callAnthropicFormat(provider, messages, temperature, maxTokens)
            RequestFormat.HUGGINGFACE -> callHuggingFaceFormat(provider, messages)
            else -> callOpenAIFormat(provider, messages, temperature, maxTokens)
        }
    }

    /**
     * Send an image generation request
     */
    suspend fun generateImage(
        provider: ApiProvider,
        prompt: String,
        size: String = "1024x1024",
        n: Int = 1
    ): Result<List<String>> {
        return when (provider.requestFormat) {
            RequestFormat.OPENAI_COMPATIBLE -> callOpenAIImageFormat(provider, prompt, size, n)
            RequestFormat.STABILITY_AI -> callStabilityImageFormat(provider, prompt, size)
            RequestFormat.REPLICATE -> callReplicateImageFormat(provider, prompt)
            else -> callOpenAIImageFormat(provider, prompt, size, n)
        }
    }

    /**
     * Send an audio generation request
     */
    suspend fun generateAudio(
        provider: ApiProvider,
        text: String,
        voice: String = "alloy",
        language: String = "en"
    ): Result<ByteArray> {
        return when (provider.requestFormat) {
            RequestFormat.OPENAI_COMPATIBLE -> callOpenAIAudioFormat(provider, text, voice)
            RequestFormat.ELEVENLABS -> callElevenLabsFormat(provider, text, voice, language)
            else -> callOpenAIAudioFormat(provider, text, voice)
        }
    }

    // ===== OpenAI-Compatible Format =====

    private suspend fun callOpenAIFormat(
        provider: ApiProvider,
        messages: List<Map<String, String>>,
        temperature: Double,
        maxTokens: Int
    ): Result<String> {
        val body = JsonObject().apply {
            addProperty("model", provider.model)
            add("messages", gson.toJsonTree(messages))
            addProperty("temperature", temperature)
            addProperty("max_tokens", maxTokens)
        }

        val url = "${provider.baseUrl}${provider.endpoints.chat}"
        val response = makeRequest(url, body.toString(), provider)

        return try {
            val json = gson.fromJson(response, JsonObject::class.java)
            val content = json.getAsJsonArray("choices")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("message")
                ?.get("content")?.asString
                ?: "No response"
            Result.success(content)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== Google Gemini Format =====

    private suspend fun callGeminiFormat(
        provider: ApiProvider,
        messages: List<Map<String, String>>,
        temperature: Double,
        maxTokens: Int
    ): Result<String> {
        val contents = messages.filter { it["role"] != "system" }.map { msg ->
            mapOf(
                "role" to if (msg["role"] == "user") "user" else "model",
                "parts" to listOf(mapOf("text" to (msg["content"] ?: "")))
            )
        }

        val systemInstruction = messages.find { it["role"] == "system" }?.let { msg ->
            mapOf("parts" to listOf(mapOf("text" to (msg["content"] ?: ""))))
        }

        val body = JsonObject().apply {
            add("contents", gson.toJsonTree(contents))
            if (systemInstruction != null) {
                add("systemInstruction", gson.toJsonTree(systemInstruction))
            }
            add("generationConfig", gson.toJsonTree(mapOf(
                "temperature" to temperature,
                "maxOutputTokens" to maxTokens
            )))
        }

        val endpoint = provider.endpoints.chat.replace("{model}", provider.model)
        val url = "${provider.baseUrl}${endpoint}?key=${provider.apiKey}"

        return try {
            val response = makeRequestNoAuth(url, body.toString())
            val json = gson.fromJson(response, JsonObject::class.java)
            val content = json.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString
                ?: "No response"
            Result.success(content)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== Anthropic Claude Format =====

    private suspend fun callAnthropicFormat(
        provider: ApiProvider,
        messages: List<Map<String, String>>,
        temperature: Double,
        maxTokens: Int
    ): Result<String> {
        val systemMsg = messages.find { it["role"] == "system" }?.get("content") ?: ""
        val chatMessages = messages.filter { it["role"] != "system" }.map { msg ->
            mapOf(
                "role" to (msg["role"] ?: "user"),
                "content" to (msg["content"] ?: "")
            )
        }

        val body = JsonObject().apply {
            addProperty("model", provider.model)
            addProperty("max_tokens", maxTokens)
            addProperty("temperature", temperature)
            if (systemMsg.isNotEmpty()) addProperty("system", systemMsg)
            add("messages", gson.toJsonTree(chatMessages))
        }

        val url = "${provider.baseUrl}${provider.endpoints.chat}"

        return try {
            val response = makeRequestWithHeaders(
                url, body.toString(),
                mapOf(
                    "x-api-key" to provider.apiKey,
                    "anthropic-version" to "2023-06-01",
                    "Content-Type" to "application/json"
                )
            )
            val json = gson.fromJson(response, JsonObject::class.java)
            val content = json.getAsJsonArray("content")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString
                ?: "No response"
            Result.success(content)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== HuggingFace Format =====

    private suspend fun callHuggingFaceFormat(
        provider: ApiProvider,
        messages: List<Map<String, String>>
    ): Result<String> {
        val prompt = messages.joinToString("\n") { "${it["role"]}: ${it["content"]}" }

        val body = JsonObject().apply {
            addProperty("inputs", prompt)
            add("parameters", gson.toJsonTree(mapOf(
                "max_new_tokens" to 2000,
                "temperature" to 0.8
            )))
        }

        val endpoint = provider.endpoints.chat.replace("{model}", provider.model)
        val url = "${provider.baseUrl}${endpoint}"

        return try {
            val response = makeRequest(url, body.toString(), provider)
            val jsonArray = gson.fromJson(response, com.google.gson.JsonArray::class.java)
            val content = jsonArray?.get(0)?.asJsonObject
                ?.get("generated_text")?.asString
                ?: "No response"
            Result.success(content)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== Image Generation =====

    private suspend fun callOpenAIImageFormat(
        provider: ApiProvider,
        prompt: String,
        size: String,
        n: Int
    ): Result<List<String>> {
        val body = JsonObject().apply {
            addProperty("model", provider.model)
            addProperty("prompt", prompt)
            addProperty("size", size)
            addProperty("n", n)
            addProperty("response_format", "url")
        }

        val url = "${provider.baseUrl}${provider.endpoints.image}"

        return try {
            val response = makeRequest(url, body.toString(), provider)
            val json = gson.fromJson(response, JsonObject::class.java)
            val urls = json.getAsJsonArray("data")?.map {
                it.asJsonObject.get("url")?.asString ?: ""
            } ?: emptyList()
            Result.success(urls)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun callStabilityImageFormat(
        provider: ApiProvider,
        prompt: String,
        size: String
    ): Result<List<String>> {
        val (width, height) = size.split("x").let {
            it[0].toInt() to it[1].toInt()
        }

        val body = JsonObject().apply {
            add("text_prompts", gson.toJsonTree(listOf(
                mapOf("text" to prompt, "weight" to 1)
            )))
            addProperty("cfg_scale", 7)
            addProperty("width", width)
            addProperty("height", height)
            addProperty("samples", 1)
        }

        val endpoint = provider.endpoints.image.replace("{model}", provider.model)
        val url = "${provider.baseUrl}${endpoint}"

        return try {
            val response = makeRequest(url, body.toString(), provider)
            val json = gson.fromJson(response, JsonObject::class.java)
            val images = json.getAsJsonArray("artifacts")?.map {
                it.asJsonObject.get("base64")?.asString ?: ""
            } ?: emptyList()
            Result.success(images)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun callReplicateImageFormat(
        provider: ApiProvider,
        prompt: String
    ): Result<List<String>> {
        val body = JsonObject().apply {
            addProperty("version", provider.model)
            add("input", gson.toJsonTree(mapOf("prompt" to prompt)))
        }

        val url = "${provider.baseUrl}${provider.endpoints.image}"

        return try {
            val response = makeRequest(url, body.toString(), provider)
            val json = gson.fromJson(response, JsonObject::class.java)
            val output = json.getAsJsonArray("output")?.map {
                it.asString
            } ?: emptyList()
            Result.success(output)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== Audio Generation =====

    private suspend fun callOpenAIAudioFormat(
        provider: ApiProvider,
        text: String,
        voice: String
    ): Result<ByteArray> {
        val body = JsonObject().apply {
            addProperty("model", provider.model)
            addProperty("input", text)
            addProperty("voice", voice)
            addProperty("response_format", "mp3")
        }

        val url = "${provider.baseUrl}${provider.endpoints.audio}"

        return try {
            val bytes = makeRequestBytes(url, body.toString(), provider)
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun callElevenLabsFormat(
        provider: ApiProvider,
        text: String,
        voiceId: String,
        language: String
    ): Result<ByteArray> {
        val body = JsonObject().apply {
            addProperty("text", text)
            addProperty("model_id", provider.model)
            add("voice_settings", gson.toJsonTree(mapOf(
                "stability" to 0.5,
                "similarity_boost" to 0.75
            )))
        }

        val endpoint = provider.endpoints.audio.replace("{voice_id}", voiceId)
        val url = "${provider.baseUrl}${endpoint}"

        return try {
            val bytes = makeRequestWithHeadersBytes(
                url, body.toString(),
                mapOf(
                    "xi-api-key" to provider.apiKey,
                    "Content-Type" to "application/json"
                )
            )
            Result.success(bytes)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== HTTP Helpers =====

    private suspend fun makeRequest(url: String, body: String, provider: ApiProvider): String {
        return suspendCoroutine { continuation ->
            val request = Request.Builder()
                .url(url)
                .post(body.toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${provider.apiKey}")
                .addHeader("Content-Type", "application/json")
                .build()

            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        continuation.resume(responseBody)
                    } else {
                        continuation.resumeWithException(
                            Exception("API Error ${response.code}: $responseBody")
                        )
                    }
                }
            })
        }
    }

    private suspend fun makeRequestNoAuth(url: String, body: String): String {
        return suspendCoroutine { continuation ->
            val request = Request.Builder()
                .url(url)
                .post(body.toRequestBody("application/json".toMediaType()))
                .addHeader("Content-Type", "application/json")
                .build()

            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        continuation.resume(responseBody)
                    } else {
                        continuation.resumeWithException(
                            Exception("API Error ${response.code}: $responseBody")
                        )
                    }
                }
            })
        }
    }

    private suspend fun makeRequestWithHeaders(
        url: String,
        body: String,
        headers: Map<String, String>
    ): String {
        return suspendCoroutine { continuation ->
            val requestBuilder = Request.Builder()
                .url(url)
                .post(body.toRequestBody("application/json".toMediaType()))

            headers.forEach { (key, value) -> requestBuilder.addHeader(key, value) }

            okHttpClient.newCall(requestBuilder.build()).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        continuation.resume(responseBody)
                    } else {
                        continuation.resumeWithException(
                            Exception("API Error ${response.code}: $responseBody")
                        )
                    }
                }
            })
        }
    }

    private suspend fun makeRequestBytes(url: String, body: String, provider: ApiProvider): ByteArray {
        return suspendCoroutine { continuation ->
            val request = Request.Builder()
                .url(url)
                .post(body.toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${provider.apiKey}")
                .addHeader("Content-Type", "application/json")
                .build()

            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    if (response.isSuccessful) {
                        continuation.resume(response.body?.bytes() ?: ByteArray(0))
                    } else {
                        continuation.resumeWithException(
                            Exception("API Error ${response.code}")
                        )
                    }
                }
            })
        }
    }

    private suspend fun makeRequestWithHeadersBytes(
        url: String,
        body: String,
        headers: Map<String, String>
    ): ByteArray {
        return suspendCoroutine { continuation ->
            val requestBuilder = Request.Builder()
                .url(url)
                .post(body.toRequestBody("application/json".toMediaType()))

            headers.forEach { (key, value) -> requestBuilder.addHeader(key, value) }

            okHttpClient.newCall(requestBuilder.build()).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    continuation.resumeWithException(e)
                }

                override fun onResponse(call: Call, response: Response) {
                    if (response.isSuccessful) {
                        continuation.resume(response.body?.bytes() ?: ByteArray(0))
                    } else {
                        continuation.resumeWithException(
                            Exception("API Error ${response.code}")
                        )
                    }
                }
            })
        }
    }
}
