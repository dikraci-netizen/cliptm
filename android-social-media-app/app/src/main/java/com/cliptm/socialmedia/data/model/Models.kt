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
 * Content types that can be generated
 */
enum class ContentType(val displayName: String, val description: String) {
    POST("Post / Caption", "Standard social media post with caption"),
    VIDEO_SCRIPT("Video Script", "Script for Reels, TikTok, Shorts"),
    CAROUSEL("Carousel", "Multi-slide educational content"),
    AD_COPY("Ad Copy", "Advertising copy for paid campaigns"),
    STORY("Story", "Instagram/Facebook story content"),
    THREAD("Thread", "Twitter/X thread format"),
    EMAIL("Email", "Email marketing copy"),
    CONTENT_CALENDAR("Content Calendar", "Weekly/monthly content plan")
}

/**
 * Chat message in the conversation
 */
data class ChatMessage(
    val id: String = System.currentTimeMillis().toString(),
    val content: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Content generation request configuration
 */
data class ContentConfig(
    val languages: List<Language> = listOf(Language.FRENCH, Language.DARIJA),
    val platforms: List<Platform> = listOf(Platform.INSTAGRAM),
    val contentType: ContentType = ContentType.POST,
    val brandName: String = "",
    val targetAudience: String = "",
    val toneOfVoice: String = "Professional yet casual"
)

/**
 * OpenAI API request/response models
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
