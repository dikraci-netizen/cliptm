package com.cliptm.socialmedia.data.repository

import com.cliptm.socialmedia.data.api.OpenAIService
import com.cliptm.socialmedia.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val openAIService: OpenAIService
) {
    private val conversationHistory = mutableListOf<ApiMessage>()

    fun getSystemPrompt(config: ContentConfig): String {
        val languagesList = config.languages.joinToString(", ") { it.nativeName }
        val platformsList = config.platforms.joinToString(", ") { it.displayName }

        return """
You are an expert social media content creator and digital marketing strategist specialized in crafting engaging, high-converting content.

## Your Identity
- Role: Senior Social Media Strategist & Copywriter
- Languages: $languagesList
- Platforms: $platformsList
- Content Type: ${config.contentType.displayName}
${if (config.brandName.isNotBlank()) "- Brand: ${config.brandName}" else ""}
${if (config.targetAudience.isNotBlank()) "- Target Audience: ${config.targetAudience}" else ""}
- Tone: ${config.toneOfVoice}

## Capabilities
- Generate content in ALL requested languages (not translations - culturally adapted versions)
- Apply copywriting frameworks: AIDA, PAS, BAB, 4Ps, Hook-Story-Offer
- Optimize for each platform's best practices
- Include relevant hashtags, CTAs, and posting time recommendations

## Language-Specific Guidelines

### Darija (الدارجة المغربية)
- Use Arabizi OR Arabic script based on context
- Arabizi: 3=ع, 7=ح, 9=ق, 5=خ, 8=غ, 2=ء
- Mix Darija with French naturally (code-switching)
- Use Moroccan expressions: "Wach 3jbkom?", "Diroulha partage!", "Ktbo lina f les commentaires"
- Moroccan hashtags: #المغرب #مغاربة #الدارجة

### Arabic (العربية الفصحى)
- Write in Arabic script (RTL)
- Keep concise and impactful
- CTAs: "شاركونا آراءكم", "تابعونا للمزيد", "لا تنسوا الإعجاب والمشاركة"

### French
- Culturally adapted for Francophone audience
- Natural and engaging tone

### English
- Global audience optimization
- SEO-friendly when applicable

## Output Format
Structure clearly with sections per language, include:
- Caption/Copy
- Hashtags
- CTA
- Best posting time
- Pro tips

Always provide 2-3 variations per language. Use emojis appropriately.
""".trimIndent()
    }

    suspend fun sendMessage(
        userMessage: String,
        config: ContentConfig,
        apiKey: String,
        baseUrl: String
    ): Result<String> {
        return try {
            // Initialize with system prompt if first message
            if (conversationHistory.isEmpty()) {
                conversationHistory.add(
                    ApiMessage(role = "system", content = getSystemPrompt(config))
                )
            }

            // Add user message
            conversationHistory.add(ApiMessage(role = "user", content = userMessage))

            // Make API call
            val request = ChatCompletionRequest(
                messages = conversationHistory.toList(),
                temperature = 0.8,
                max_tokens = 3000
            )

            val response = openAIService.createChatCompletion(
                authorization = "Bearer $apiKey",
                request = request
            )

            val assistantMessage = response.choices.firstOrNull()?.message?.content
                ?: "No response generated"

            // Add assistant response to history
            conversationHistory.add(ApiMessage(role = "assistant", content = assistantMessage))

            Result.success(assistantMessage)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun clearConversation() {
        conversationHistory.clear()
    }

    fun updateSystemPrompt(config: ContentConfig) {
        conversationHistory.clear()
        conversationHistory.add(
            ApiMessage(role = "system", content = getSystemPrompt(config))
        )
    }
}
