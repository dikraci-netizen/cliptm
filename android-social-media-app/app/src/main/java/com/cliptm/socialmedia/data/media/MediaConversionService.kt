package com.cliptm.socialmedia.data.media

import com.cliptm.socialmedia.data.api.ApiProvider
import com.cliptm.socialmedia.data.api.MultiProviderService
import com.cliptm.socialmedia.data.model.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Conversion pipeline result
 */
data class ConversionResult(
    val success: Boolean,
    val outputType: String, // "image", "audio", "video"
    val urls: List<String> = emptyList(),
    val data: ByteArray? = null,
    val metadata: Map<String, String> = emptyMap(),
    val error: String = ""
)

/**
 * Service for converting text content into other media formats.
 * Supports: Text -> Image, Text -> Audio, Text -> Video, Image -> Video
 */
@Singleton
class MediaConversionService @Inject constructor(
    private val multiProviderService: MultiProviderService
) {
    /**
     * Convert text to image(s)
     */
    suspend fun textToImage(
        text: String,
        imageProvider: ApiProvider,
        style: ImageStyle = ImageStyle.PHOTOREALISTIC,
        size: ImageSize = ImageSize.SQUARE_1080,
        count: Int = 1
    ): ConversionResult {
        val prompt = buildImagePromptFromText(text, style)
        val result = multiProviderService.generateImage(imageProvider, prompt, size.sizeString, count)
        return result.fold(
            onSuccess = { urls -> ConversionResult(true, "image", urls = urls, metadata = mapOf("prompt" to prompt, "style" to style.displayName)) },
            onFailure = { e -> ConversionResult(false, "image", error = e.message ?: "Image generation failed") }
        )
    }

    /**
     * Convert text to audio (voiceover)
     */
    suspend fun textToAudio(
        text: String,
        audioProvider: ApiProvider,
        voice: String = "alloy",
        language: String = "fr",
        speed: Float = 1.0f
    ): ConversionResult {
        val result = multiProviderService.generateAudio(audioProvider, text, voice, language)
        return result.fold(
            onSuccess = { bytes -> ConversionResult(true, "audio", data = bytes, metadata = mapOf("voice" to voice, "language" to language, "duration" to estimateDuration(text).toString())) },
            onFailure = { e -> ConversionResult(false, "audio", error = e.message ?: "Audio generation failed") }
        )
    }

    /**
     * Convert text to video (generates storyboard prompt for video API)
     */
    suspend fun textToVideo(
        text: String,
        textProvider: ApiProvider,
        platform: Platform = Platform.INSTAGRAM,
        duration: Int = 30,
        style: String = "cinematic"
    ): ConversionResult {
        val storyboardPrompt = buildVideoStoryboardPrompt(text, platform, duration, style)
        val messages = listOf(
            mapOf("role" to "system", "content" to "You are a professional video director. Create detailed storyboards for short-form video content."),
            mapOf("role" to "user", "content" to storyboardPrompt)
        )
        val result = multiProviderService.generateText(textProvider, messages, 0.8, 2000)
        return result.fold(
            onSuccess = { storyboard -> ConversionResult(true, "video", metadata = mapOf("storyboard" to storyboard, "duration" to "${duration}s", "platform" to platform.displayName)) },
            onFailure = { e -> ConversionResult(false, "video", error = e.message ?: "Video script generation failed") }
        )
    }

    /**
     * Full pipeline: Text -> Image -> Video (with voiceover)
     */
    suspend fun textToFullVideo(
        text: String,
        textProvider: ApiProvider,
        imageProvider: ApiProvider,
        audioProvider: ApiProvider,
        platform: Platform = Platform.INSTAGRAM
    ): ConversionResult {
        // Step 1: Generate storyboard
        val videoResult = textToVideo(text, textProvider, platform)
        if (!videoResult.success) return videoResult

        // Step 2: Generate thumbnail/cover image
        val imageResult = textToImage(text, imageProvider, ImageStyle.PHOTOREALISTIC, ImageSize.forPlatform(platform))

        // Step 3: Generate voiceover
        val audioResult = textToAudio(text.take(500), audioProvider)

        return ConversionResult(
            success = true,
            outputType = "video_package",
            urls = imageResult.urls,
            data = audioResult.data,
            metadata = mapOf(
                "storyboard" to (videoResult.metadata["storyboard"] ?: ""),
                "thumbnail" to (imageResult.urls.firstOrNull() ?: ""),
                "has_voiceover" to audioResult.success.toString(),
                "platform" to platform.displayName
            )
        )
    }

    /**
     * Batch convert: text to multiple formats at once
     */
    suspend fun convertToAll(
        text: String,
        textProvider: ApiProvider,
        imageProvider: ApiProvider? = null,
        audioProvider: ApiProvider? = null,
        platform: Platform = Platform.INSTAGRAM
    ): Map<String, ConversionResult> {
        val results = mutableMapOf<String, ConversionResult>()

        if (imageProvider != null) {
            results["image"] = textToImage(text, imageProvider, size = ImageSize.forPlatform(platform))
        }
        if (audioProvider != null) {
            results["audio"] = textToAudio(text.take(500), audioProvider)
        }
        results["video"] = textToVideo(text, textProvider, platform)

        return results
    }

    // ===== Helpers =====

    private fun buildImagePromptFromText(text: String, style: ImageStyle): String {
        val cleanText = text.replace(Regex("#\\w+"), "").replace(Regex("[\\n\\r]+"), " ").take(200)
        return "Create a social media visual about: $cleanText. Style: ${style.promptSuffix}. High quality, engaging, scroll-stopping."
    }

    private fun buildVideoStoryboardPrompt(text: String, platform: Platform, duration: Int, style: String): String {
        return """
Create a detailed video storyboard for ${platform.displayName} based on this content:
"$text"

Requirements:
- Duration: ${duration} seconds
- Style: $style
- Aspect ratio: ${if (platform in listOf(Platform.TIKTOK, Platform.INSTAGRAM)) "9:16 vertical" else "16:9 horizontal"}
- Hook in first 2 seconds

Provide:
1. Scene-by-scene breakdown with timestamps
2. Visual descriptions for each scene
3. Text overlays/captions
4. Suggested music mood
5. Voiceover script (if applicable)
6. CTA at end

Format:
[Scene 1 - 0:00-0:02] HOOK
Visual: ...
Text Overlay: ...

[Scene 2 - 0:02-0:08] SETUP
Visual: ...
Text Overlay: ...
...
""".trimIndent()
    }

    private fun estimateDuration(text: String): Int {
        val words = text.split("\\s+".toRegex()).size
        return (words / 2.5).toInt().coerceAtLeast(3)
    }
}
