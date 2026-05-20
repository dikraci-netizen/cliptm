package com.cliptm.socialmedia.data.api

import com.cliptm.socialmedia.data.model.ChatCompletionRequest
import com.cliptm.socialmedia.data.model.ChatCompletionResponse
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

/**
 * Retrofit interface for OpenAI API (compatible with any OpenAI-compatible API)
 */
interface OpenAIService {

    @POST("v1/chat/completions")
    suspend fun createChatCompletion(
        @Header("Authorization") authorization: String,
        @Body request: ChatCompletionRequest
    ): ChatCompletionResponse
}
