package com.cliptm.socialmedia.data.repository

import com.cliptm.socialmedia.data.api.ApiProvider
import com.cliptm.socialmedia.data.api.MultiProviderService
import com.cliptm.socialmedia.data.api.ProviderType
import com.cliptm.socialmedia.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for managing chat conversations and multi-modal content generation.
 * Supports text, image, audio, and video generation via any configured API provider.
 */
@Singleton
class ChatRepository @Inject constructor(
    private val multiProviderService: MultiProviderService
) {
    private val conversationHistory = mutableListOf<Map<String, String>>()

    /**
     * Build the system prompt based on content configuration
     */
    fun getSystemPrompt(config: ContentConfig): String {
        val languagesList = config.languages.joinToString(", ") { it.nativeName }
        val platformsList = config.platforms.joinToString(", ") { it.displayName }
        val mediaCapabilities = buildList {
            if (config.generateImage) add("Image Generation (provide DALL-E/Stable Diffusion prompts)")
            if (config.generateAudio) add("Audio/Voiceover (provide TTS scripts)")
            if (config.generateVideo) add("Video (provide storyboards and scripts)")
        }.joinToString(", ").ifEmpty { "Text only" }

        return """
You are an expert social media content creator and digital marketing strategist. You create multi-modal content (text, images, audio, video) for all platforms.

## Your Identity
- Role: Senior Social Media Strategist & Multi-Media Content Director
- Languages: $languagesList
- Platforms: $platformsList
- Content Type: ${config.contentType.displayName}
- Media Capabilities: $mediaCapabilities
${if (config.brandName.isNotBlank()) "- Brand: ${config.brandName}" else ""}
${if (config.targetAudience.isNotBlank()) "- Target Audience: ${config.targetAudience}" else ""}
- Tone: ${config.toneOfVoice}

## Content Generation Rules

### Text Content
- Generate content in ALL requested languages (culturally adapted, not translations)
- Apply copywriting frameworks: AIDA, PAS, BAB, 4Ps, Hook-Story-Offer
- Include hashtags, CTAs, and posting time recommendations
- Provide 2-3 variations per language

### Image Generation (when requested)
When the user asks for images, provide detailed prompts in this format:
```
[IMAGE_PROMPT]
Description: [Detailed visual description]
Style: ${config.imageStyle.displayName}
Size: [Platform-optimized size]
Negative: [What to avoid]
[/IMAGE_PROMPT]
```

### Audio Generation (when requested)
When voiceovers or audio are needed, provide:
```
[AUDIO_SCRIPT]
Text: [Full script to be spoken]
Voice: [Male/Female, tone, emotion]
Language: [Language code]
Duration: [Estimated duration]
[/AUDIO_SCRIPT]
```

### Video Generation (when requested)
When video content is needed, provide storyboards:
```
[VIDEO_STORYBOARD]
Concept: [Brief description]
Duration: [Length]
Style: ${config.videoStyle.displayName}
Scene 1 (0:00-0:03): [Hook - visual + text overlay]
Scene 2 (0:03-0:10): [Setup - what happens]
Scene 3 (0:10-0:45): [Body - main content]
Scene 4 (0:45-0:60): [CTA - call to action]
Audio: [Voiceover/music description]
[/VIDEO_STORYBOARD]
```

## Language-Specific Guidelines

### Darija (الدارجة المغربية)
- Use Arabizi OR Arabic script based on context
- Arabizi: 3=ع, 7=ح, 9=ق, 5=خ, 8=غ, 2=ء
- Mix Darija with French naturally (code-switching)
- Moroccan expressions: "Wach 3jbkom?", "Diroulha partage!"
- Hashtags: #المغرب #مغاربة #الدارجة

### Arabic (العربية الفصحى)
- Arabic script (RTL), concise and impactful
- CTAs: "شاركونا آراءكم", "تابعونا للمزيد"

### French
- Culturally adapted for Francophone audience

### English
- Global audience, SEO-friendly

## Output Format
Structure clearly with sections per language:
- Caption/Copy with emojis
- Hashtags (20-30 for Instagram, 3-5 for TikTok)
- CTA
- Best posting time
- Image/Audio/Video prompts if media generation is enabled
""".trimIndent()
    }

    /**
     * Send a text message using the configured text provider
     */
    suspend fun sendMessage(
        userMessage: String,
        config: ContentConfig,
        textProvider: ApiProvider
    ): Result<String> {
        return try {
            if (conversationHistory.isEmpty()) {
                conversationHistory.add(mapOf("role" to "system", "content" to getSystemPrompt(config)))
            }

            conversationHistory.add(mapOf("role" to "user", "content" to userMessage))

            val result = multiProviderService.generateText(
                provider = textProvider,
                messages = conversationHistory,
                temperature = 0.8,
                maxTokens = 3000
            )

            result.fold(
                onSuccess = { response ->
                    conversationHistory.add(mapOf("role" to "assistant", "content" to response))
                    Result.success(response)
                },
                onFailure = { error ->
                    // Remove the failed user message from history
                    conversationHistory.removeLastOrNull()
                    Result.failure(error)
                }
            )
        } catch (e: Exception) {
            conversationHistory.removeLastOrNull()
            Result.failure(e)
        }
    }

    /**
     * Generate an image using the configured image provider
     */
    suspend fun generateImage(
        request: ImageGenerationRequest,
        imageProvider: ApiProvider
    ): Result<List<String>> {
        val fullPrompt = buildString {
            append(request.prompt)
            if (request.style != ImageStyle.PHOTOREALISTIC) {
                append(", ${request.style.promptSuffix}")
            }
        }

        return multiProviderService.generateImage(
            provider = imageProvider,
            prompt = fullPrompt,
            size = request.size.sizeString,
            n = request.numberOfImages
        )
    }

    /**
     * Generate audio using the configured audio provider
     */
    suspend fun generateAudio(
        request: AudioGenerationRequest,
        audioProvider: ApiProvider
    ): Result<ByteArray> {
        return multiProviderService.generateAudio(
            provider = audioProvider,
            text = request.text,
            voice = request.voice.id,
            language = request.language.code
        )
    }

    /**
     * Generate a complete content package (text + optional media)
     */
    suspend fun generateContentPackage(
        userPrompt: String,
        config: ContentConfig,
        textProvider: ApiProvider,
        imageProvider: ApiProvider? = null,
        audioProvider: ApiProvider? = null
    ): Result<ContentPackage> {
        return try {
            // Step 1: Generate text content
            val textResult = sendMessage(userPrompt, config, textProvider)
            val textContent = textResult.getOrThrow()

            // Step 2: Generate image if requested
            val mediaAttachments = mutableListOf<MediaAttachment>()

            if (config.generateImage && imageProvider != null) {
                val imagePrompt = extractImagePrompt(textContent) ?: buildImagePrompt(userPrompt, config)
                val imageResult = generateImage(
                    ImageGenerationRequest(
                        prompt = imagePrompt,
                        size = ImageSize.forPlatform(config.platforms.first()),
                        style = config.imageStyle
                    ),
                    imageProvider
                )
                imageResult.onSuccess { urls ->
                    urls.forEach { url ->
                        mediaAttachments.add(
                            MediaAttachment(
                                type = MediaType.IMAGE,
                                url = url,
                                size = ImageSize.forPlatform(config.platforms.first()).sizeString
                            )
                        )
                    }
                }
            }

            // Step 3: Generate audio if requested
            if (config.generateAudio && audioProvider != null) {
                val audioScript = extractAudioScript(textContent) ?: textContent.take(500)
                val audioResult = generateAudio(
                    AudioGenerationRequest(
                        text = audioScript,
                        language = config.languages.first()
                    ),
                    audioProvider
                )
                audioResult.onSuccess { bytes ->
                    mediaAttachments.add(
                        MediaAttachment(
                            type = MediaType.AUDIO,
                            mimeType = "audio/mpeg",
                            duration = estimateAudioDuration(audioScript)
                        )
                    )
                }
            }

            Result.success(
                ContentPackage(
                    textContent = textContent,
                    language = config.languages.first(),
                    platform = config.platforms.first(),
                    contentType = config.contentType,
                    mediaAttachments = mediaAttachments
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Clear conversation history
     */
    fun clearConversation() {
        conversationHistory.clear()
    }

    /**
     * Update system prompt (clears history and sets new system message)
     */
    fun updateSystemPrompt(config: ContentConfig) {
        conversationHistory.clear()
        conversationHistory.add(mapOf("role" to "system", "content" to getSystemPrompt(config)))
    }

    // ===== Helper Methods =====

    /**
     * Extract image prompt from AI response (between [IMAGE_PROMPT] tags)
     */
    private fun extractImagePrompt(text: String): String? {
        val regex = """\[IMAGE_PROMPT\](.*?)\[/IMAGE_PROMPT\]""".toRegex(RegexOption.DOT_MATCHES_ALL)
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.trim()?.let { block ->
            val descLine = block.lines().find { it.startsWith("Description:") }
            descLine?.removePrefix("Description:")?.trim() ?: block
        }
    }

    /**
     * Extract audio script from AI response (between [AUDIO_SCRIPT] tags)
     */
    private fun extractAudioScript(text: String): String? {
        val regex = """\[AUDIO_SCRIPT\](.*?)\[/AUDIO_SCRIPT\]""".toRegex(RegexOption.DOT_MATCHES_ALL)
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.trim()?.let { block ->
            val textLine = block.lines().find { it.startsWith("Text:") }
            textLine?.removePrefix("Text:")?.trim() ?: block
        }
    }

    /**
     * Build a default image prompt from user request and config
     */
    private fun buildImagePrompt(userPrompt: String, config: ContentConfig): String {
        return buildString {
            append("Social media post image for ${config.platforms.first().displayName}. ")
            if (config.brandName.isNotBlank()) append("Brand: ${config.brandName}. ")
            append("Theme: $userPrompt. ")
            append(config.imageStyle.promptSuffix)
        }
    }

    /**
     * Estimate audio duration based on text length (avg 150 words/min)
     */
    private fun estimateAudioDuration(text: String): Int {
        val wordCount = text.split("\\s+".toRegex()).size
        return (wordCount / 2.5).toInt() // ~150 words/min = 2.5 words/sec
    }
}
