package com.cliptm.socialmedia.data.model

/**
 * Supported languages for content generation
 */
enum class Language(val displayName: String, val code: String, val nativeName: String) {
    ENGLISH("English", "en", "English"),
    FRENCH("Français", "fr", "Français"),
    ARABIC_MSA("Arabic (MSA)", "ar", "العربية الفصحى"),
    DARIJA("Moroccan Darija", "darija", "الدارجة المغربية")
}

/**
 * Supported social media platforms
 */
enum class Platform(val displayName: String, val icon: String) {
    FACEBOOK("Facebook", "📘"),
    INSTAGRAM("Instagram", "📸"),
    TIKTOK("TikTok", "🎵"),
    TWITTER("Twitter/X", "🐦"),
    LINKEDIN("LinkedIn", "💼"),
    YOUTUBE("YouTube", "🎬"),
    PINTEREST("Pinterest", "📌")
}

/**
 * Content types that can be generated (text-based)
 */
enum class ContentType(val displayName: String, val description: String, val icon: String) {
    POST("Post / Caption", "Standard social media post with caption", "📝"),
    VIDEO_SCRIPT("Video Script", "Script for Reels, TikTok, Shorts", "🎬"),
    CAROUSEL("Carousel", "Multi-slide educational content", "📊"),
    AD_COPY("Ad Copy", "Advertising copy for paid campaigns", "📢"),
    STORY("Story", "Instagram/Facebook story content", "📱"),
    THREAD("Thread", "Twitter/X thread format", "🧵"),
    EMAIL("Email", "Email marketing copy", "📧"),
    CONTENT_CALENDAR("Content Calendar", "Weekly/monthly content plan", "📅")
}

/**
 * Media generation types (non-text content)
 */
enum class MediaType(val displayName: String, val description: String, val icon: String) {
    IMAGE("Image", "Generate images for posts, ads, thumbnails", "🎨"),
    AUDIO("Audio", "Voiceovers, music, sound effects", "🎵"),
    VIDEO("Video", "Short videos, reels, ads, avatars", "🎬"),
    THUMBNAIL("Thumbnail", "YouTube/video thumbnails", "🖼️"),
    ANIMATION("Animation", "Animated graphics and GIFs", "✨")
}

/**
 * Image generation configuration
 */
data class ImageGenerationRequest(
    val prompt: String,
    val negativePrompt: String = "",
    val size: ImageSize = ImageSize.SQUARE_1080,
    val style: ImageStyle = ImageStyle.PHOTOREALISTIC,
    val numberOfImages: Int = 1,
    val platform: Platform? = null
)

/**
 * Predefined image sizes optimized for social media
 */
enum class ImageSize(val displayName: String, val width: Int, val height: Int) {
    SQUARE_1080("Square (1080x1080)", 1080, 1080),
    PORTRAIT_1080("Portrait (1080x1350)", 1080, 1350),
    STORY_1080("Story/Reel (1080x1920)", 1080, 1920),
    LANDSCAPE_1200("Landscape (1200x630)", 1200, 630),
    TWITTER_1600("Twitter (1600x900)", 1600, 900),
    YOUTUBE_THUMB("YouTube Thumbnail (1280x720)", 1280, 720),
    PINTEREST_1000("Pinterest (1000x1500)", 1000, 1500),
    LINKEDIN_1200("LinkedIn (1200x627)", 1200, 627);

    val sizeString: String get() = "${width}x${height}"

    companion object {
        fun forPlatform(platform: Platform): ImageSize {
            return when (platform) {
                Platform.INSTAGRAM -> SQUARE_1080
                Platform.TIKTOK -> STORY_1080
                Platform.FACEBOOK -> LANDSCAPE_1200
                Platform.TWITTER -> TWITTER_1600
                Platform.LINKEDIN -> LINKEDIN_1200
                Platform.YOUTUBE -> YOUTUBE_THUMB
                Platform.PINTEREST -> PINTEREST_1000
            }
        }
    }
}

/**
 * Image generation styles
 */
enum class ImageStyle(val displayName: String, val promptSuffix: String) {
    PHOTOREALISTIC("Photorealistic", "photorealistic, high quality, 4k"),
    ILLUSTRATION("Illustration", "digital illustration, clean lines, colorful"),
    MINIMALIST("Minimalist", "minimalist design, clean, simple, modern"),
    THREE_D("3D Render", "3d render, cinema 4d, octane render"),
    CARTOON("Cartoon", "cartoon style, fun, animated, vibrant colors"),
    WATERCOLOR("Watercolor", "watercolor painting, artistic, soft colors"),
    FLAT_DESIGN("Flat Design", "flat design, vector art, modern, bold colors"),
    VINTAGE("Vintage", "vintage aesthetic, retro, film grain, nostalgic"),
    NEON("Neon", "neon lights, glowing, dark background, cyberpunk"),
    PROFESSIONAL("Professional/Corporate", "professional, corporate, clean, business")
}

/**
 * Audio generation configuration
 */
data class AudioGenerationRequest(
    val text: String,
    val voice: VoiceType = VoiceType.NEUTRAL_FEMALE,
    val language: Language = Language.FRENCH,
    val speed: Float = 1.0f,
    val format: AudioFormat = AudioFormat.MP3,
    val useCase: AudioUseCase = AudioUseCase.VOICEOVER
)

/**
 * Voice types for audio generation
 */
enum class VoiceType(val displayName: String, val id: String) {
    NEUTRAL_FEMALE("Female (Neutral)", "alloy"),
    NEUTRAL_MALE("Male (Neutral)", "echo"),
    WARM_FEMALE("Female (Warm)", "shimmer"),
    DEEP_MALE("Male (Deep)", "onyx"),
    YOUNG_FEMALE("Female (Young)", "nova"),
    ENERGETIC_MALE("Male (Energetic)", "fable")
}

/**
 * Audio output formats
 */
enum class AudioFormat(val displayName: String, val extension: String, val mimeType: String) {
    MP3("MP3", "mp3", "audio/mpeg"),
    WAV("WAV", "wav", "audio/wav"),
    OGG("OGG", "ogg", "audio/ogg"),
    AAC("AAC", "aac", "audio/aac")
}

/**
 * Audio content use cases
 */
enum class AudioUseCase(val displayName: String, val icon: String) {
    VOICEOVER("Voiceover", "🎙️"),
    AD_NARRATION("Ad Narration", "📢"),
    PODCAST_INTRO("Podcast Intro", "🎧"),
    MUSIC("Music/Jingle", "🎶"),
    NOTIFICATION("Notification Sound", "🔔")
}

/**
 * Video generation configuration
 */
data class VideoGenerationRequest(
    val concept: String,
    val duration: VideoDuration = VideoDuration.SHORT_15,
    val aspectRatio: VideoAspectRatio = VideoAspectRatio.VERTICAL_9_16,
    val style: VideoStyle = VideoStyle.CINEMATIC,
    val script: String = "",
    val includeVoiceover: Boolean = false,
    val voiceoverLanguage: Language = Language.FRENCH,
    val platform: Platform = Platform.INSTAGRAM
)

/**
 * Video duration presets
 */
enum class VideoDuration(val displayName: String, val seconds: Int) {
    SHORT_5("5 seconds", 5),
    SHORT_15("15 seconds", 15),
    MEDIUM_30("30 seconds", 30),
    MEDIUM_60("60 seconds", 60),
    LONG_90("90 seconds", 90)
}

/**
 * Video aspect ratios
 */
enum class VideoAspectRatio(val displayName: String, val ratio: String) {
    VERTICAL_9_16("Vertical (9:16)", "9:16"),
    HORIZONTAL_16_9("Horizontal (16:9)", "16:9"),
    SQUARE_1_1("Square (1:1)", "1:1");

    companion object {
        fun forPlatform(platform: Platform): VideoAspectRatio {
            return when (platform) {
                Platform.TIKTOK, Platform.INSTAGRAM -> VERTICAL_9_16
                Platform.YOUTUBE -> HORIZONTAL_16_9
                Platform.FACEBOOK -> HORIZONTAL_16_9
                Platform.LINKEDIN -> HORIZONTAL_16_9
                Platform.TWITTER -> HORIZONTAL_16_9
                Platform.PINTEREST -> VERTICAL_9_16
            }
        }
    }
}

/**
 * Video generation styles
 */
enum class VideoStyle(val displayName: String) {
    CINEMATIC("Cinematic"),
    ANIMATED("Animated/Motion Graphics"),
    TALKING_HEAD("Talking Head (AI Avatar)"),
    PRODUCT_SHOWCASE("Product Showcase"),
    SLIDESHOW("Slideshow"),
    BEFORE_AFTER("Before/After"),
    TUTORIAL("Tutorial/How-To"),
    TESTIMONIAL("Testimonial")
}

/**
 * Chat message in the conversation - now supports multi-modal content
 */
data class ChatMessage(
    val id: String = System.currentTimeMillis().toString(),
    val content: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val mediaAttachments: List<MediaAttachment> = emptyList(),
    val generationStatus: GenerationStatus = GenerationStatus.COMPLETED
)

/**
 * Media attachment in a message (image, audio, video URLs/data)
 */
data class MediaAttachment(
    val type: MediaType,
    val url: String = "",
    val localPath: String = "",
    val thumbnailUrl: String = "",
    val duration: Int = 0, // seconds for audio/video
    val size: String = "", // dimensions for images
    val mimeType: String = "",
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Status of content generation
 */
enum class GenerationStatus(val displayName: String) {
    PENDING("Pending"),
    IN_PROGRESS("Generating..."),
    COMPLETED("Completed"),
    FAILED("Failed"),
    CANCELLED("Cancelled")
}

/**
 * Content generation request configuration - updated for multi-modal
 */
data class ContentConfig(
    val languages: List<Language> = listOf(Language.FRENCH, Language.DARIJA),
    val platforms: List<Platform> = listOf(Platform.INSTAGRAM),
    val contentType: ContentType = ContentType.POST,
    val mediaTypes: List<MediaType> = emptyList(),
    val brandName: String = "",
    val targetAudience: String = "",
    val toneOfVoice: String = "Professional yet casual",
    val generateImage: Boolean = false,
    val generateAudio: Boolean = false,
    val generateVideo: Boolean = false,
    val imageStyle: ImageStyle = ImageStyle.PHOTOREALISTIC,
    val videoStyle: VideoStyle = VideoStyle.CINEMATIC
)

/**
 * Complete content package (text + media) generated for a single post
 */
data class ContentPackage(
    val id: String = System.currentTimeMillis().toString(),
    val textContent: String,
    val language: Language,
    val platform: Platform,
    val contentType: ContentType,
    val hashtags: List<String> = emptyList(),
    val mediaAttachments: List<MediaAttachment> = emptyList(),
    val bestPostingTime: String = "",
    val cta: String = "",
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * OpenAI API request/response models (kept for backward compatibility)
 */
data class ChatCompletionRequest(
    val model: String = "gpt-4o-mini",
    val messages: List<ApiMessage>,
    val temperature: Double = 0.8,
    val max_tokens: Int = 2000
)

data class ApiMessage(
    val role: String,
    val content: String
)

data class ChatCompletionResponse(
    val id: String,
    val choices: List<Choice>
)

data class Choice(
    val index: Int,
    val message: ApiMessage,
    val finish_reason: String?
)
