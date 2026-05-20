package com.cliptm.socialmedia.data.api

import com.google.gson.annotations.SerializedName

/**
 * Represents a configurable AI API provider.
 * Supports any OpenAI-compatible or custom API (free or paid).
 */
data class ApiProvider(
    val id: String = System.currentTimeMillis().toString(),
    val name: String,
    val type: ProviderType,
    val baseUrl: String,
    val apiKey: String = "",
    val model: String,
    val pricing: Pricing = Pricing.FREE,
    val isEnabled: Boolean = true,
    val isDefault: Boolean = false,
    val requestFormat: RequestFormat = RequestFormat.OPENAI_COMPATIBLE,
    val headers: Map<String, String> = emptyMap(),
    val endpoints: ProviderEndpoints = ProviderEndpoints()
)

/**
 * Type of content the provider can generate
 */
enum class ProviderType(val displayName: String, val icon: String) {
    TEXT("Text", "📝"),
    IMAGE("Image", "🎨"),
    AUDIO("Audio", "🎵"),
    VIDEO("Video", "🎬"),
    MULTI_MODAL("Multi-Modal", "🌐")
}

/**
 * Pricing model of the provider
 */
enum class Pricing(val displayName: String, val badge: String) {
    FREE("Free", "🟢"),
    FREEMIUM("Freemium", "🟡"),
    PAID("Paid", "🔴"),
    PAY_PER_USE("Pay per use", "🟠")
}

/**
 * Request format compatibility
 */
enum class RequestFormat {
    OPENAI_COMPATIBLE,  // /v1/chat/completions format
    GOOGLE_GEMINI,      // Gemini API format
    ANTHROPIC,          // Claude API format
    STABILITY_AI,       // Stability API format
    ELEVENLABS,         // ElevenLabs API format
    REPLICATE,          // Replicate API format
    HUGGINGFACE,        // HuggingFace Inference format
    CUSTOM              // User-defined format
}

/**
 * API endpoints for different content types
 */
data class ProviderEndpoints(
    val chat: String = "/v1/chat/completions",
    val image: String = "/v1/images/generations",
    val audio: String = "/v1/audio/speech",
    val video: String = "/v1/video/generations",
    val embeddings: String = "/v1/embeddings"
)

/**
 * Pre-configured providers that users can quickly enable
 */
object DefaultProviders {

    // ===== TEXT PROVIDERS =====

    val openAI = ApiProvider(
        id = "openai",
        name = "OpenAI",
        type = ProviderType.MULTI_MODAL,
        baseUrl = "https://api.openai.com",
        model = "gpt-4o-mini",
        pricing = Pricing.PAID,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(
            chat = "/v1/chat/completions",
            image = "/v1/images/generations",
            audio = "/v1/audio/speech"
        )
    )

    val groq = ApiProvider(
        id = "groq",
        name = "Groq",
        type = ProviderType.TEXT,
        baseUrl = "https://api.groq.com/openai",
        model = "llama-3.1-70b-versatile",
        pricing = Pricing.FREE,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(chat = "/v1/chat/completions")
    )

    val gemini = ApiProvider(
        id = "gemini",
        name = "Google Gemini",
        type = ProviderType.MULTI_MODAL,
        baseUrl = "https://generativelanguage.googleapis.com",
        model = "gemini-1.5-flash",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.GOOGLE_GEMINI,
        endpoints = ProviderEndpoints(
            chat = "/v1beta/models/{model}:generateContent"
        )
    )

    val claude = ApiProvider(
        id = "claude",
        name = "Anthropic Claude",
        type = ProviderType.TEXT,
        baseUrl = "https://api.anthropic.com",
        model = "claude-3-5-sonnet-20241022",
        pricing = Pricing.PAID,
        requestFormat = RequestFormat.ANTHROPIC,
        endpoints = ProviderEndpoints(chat = "/v1/messages")
    )

    val deepSeek = ApiProvider(
        id = "deepseek",
        name = "DeepSeek",
        type = ProviderType.TEXT,
        baseUrl = "https://api.deepseek.com",
        model = "deepseek-chat",
        pricing = Pricing.PAID,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(chat = "/v1/chat/completions")
    )

    val mistral = ApiProvider(
        id = "mistral",
        name = "Mistral AI",
        type = ProviderType.TEXT,
        baseUrl = "https://api.mistral.ai",
        model = "mistral-large-latest",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(chat = "/v1/chat/completions")
    )

    val togetherAI = ApiProvider(
        id = "together",
        name = "Together AI",
        type = ProviderType.TEXT,
        baseUrl = "https://api.together.xyz",
        model = "meta-llama/Llama-3-70b-chat-hf",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(chat = "/v1/chat/completions")
    )

    val huggingFaceText = ApiProvider(
        id = "huggingface-text",
        name = "HuggingFace (Text)",
        type = ProviderType.TEXT,
        baseUrl = "https://api-inference.huggingface.co",
        model = "meta-llama/Meta-Llama-3-8B-Instruct",
        pricing = Pricing.FREE,
        requestFormat = RequestFormat.HUGGINGFACE,
        endpoints = ProviderEndpoints(chat = "/models/{model}")
    )

    // ===== IMAGE PROVIDERS =====

    val dalleOpenAI = ApiProvider(
        id = "dalle",
        name = "DALL-E (OpenAI)",
        type = ProviderType.IMAGE,
        baseUrl = "https://api.openai.com",
        model = "dall-e-3",
        pricing = Pricing.PAID,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(image = "/v1/images/generations")
    )

    val stabilityAI = ApiProvider(
        id = "stability",
        name = "Stability AI",
        type = ProviderType.IMAGE,
        baseUrl = "https://api.stability.ai",
        model = "stable-diffusion-xl-1024-v1-0",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.STABILITY_AI,
        endpoints = ProviderEndpoints(
            image = "/v1/generation/{model}/text-to-image"
        )
    )

    val leonardoAI = ApiProvider(
        id = "leonardo",
        name = "Leonardo AI",
        type = ProviderType.IMAGE,
        baseUrl = "https://cloud.leonardo.ai/api/rest",
        model = "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.CUSTOM,
        endpoints = ProviderEndpoints(image = "/v1/generations")
    )

    val replicateImage = ApiProvider(
        id = "replicate-image",
        name = "Replicate (Image)",
        type = ProviderType.IMAGE,
        baseUrl = "https://api.replicate.com",
        model = "black-forest-labs/flux-schnell",
        pricing = Pricing.PAY_PER_USE,
        requestFormat = RequestFormat.REPLICATE,
        endpoints = ProviderEndpoints(image = "/v1/predictions")
    )

    // ===== AUDIO PROVIDERS =====

    val elevenLabs = ApiProvider(
        id = "elevenlabs",
        name = "ElevenLabs",
        type = ProviderType.AUDIO,
        baseUrl = "https://api.elevenlabs.io",
        model = "eleven_multilingual_v2",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.ELEVENLABS,
        endpoints = ProviderEndpoints(audio = "/v1/text-to-speech/{voice_id}")
    )

    val openAITTS = ApiProvider(
        id = "openai-tts",
        name = "OpenAI TTS",
        type = ProviderType.AUDIO,
        baseUrl = "https://api.openai.com",
        model = "tts-1",
        pricing = Pricing.PAID,
        requestFormat = RequestFormat.OPENAI_COMPATIBLE,
        endpoints = ProviderEndpoints(audio = "/v1/audio/speech")
    )

    // ===== VIDEO PROVIDERS =====

    val runwayML = ApiProvider(
        id = "runway",
        name = "Runway ML",
        type = ProviderType.VIDEO,
        baseUrl = "https://api.dev.runwayml.com",
        model = "gen3a_turbo",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.CUSTOM,
        endpoints = ProviderEndpoints(video = "/v1/image_to_video")
    )

    val lumaAI = ApiProvider(
        id = "luma",
        name = "Luma AI (Dream Machine)",
        type = ProviderType.VIDEO,
        baseUrl = "https://api.lumalabs.ai",
        model = "dream-machine",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.CUSTOM,
        endpoints = ProviderEndpoints(video = "/dream-machine/v1/generations")
    )

    val heyGen = ApiProvider(
        id = "heygen",
        name = "HeyGen",
        type = ProviderType.VIDEO,
        baseUrl = "https://api.heygen.com",
        model = "avatar-v2",
        pricing = Pricing.FREEMIUM,
        requestFormat = RequestFormat.CUSTOM,
        endpoints = ProviderEndpoints(video = "/v2/video/generate")
    )

    /**
     * Get all pre-configured providers
     */
    fun getAll(): List<ApiProvider> = listOf(
        openAI, groq, gemini, claude, deepSeek, mistral, togetherAI, huggingFaceText,
        dalleOpenAI, stabilityAI, leonardoAI, replicateImage,
        elevenLabs, openAITTS,
        runwayML, lumaAI, heyGen
    )

    /**
     * Get providers by type
     */
    fun getByType(type: ProviderType): List<ApiProvider> =
        getAll().filter { it.type == type || it.type == ProviderType.MULTI_MODAL }

    /**
     * Get free providers only
     */
    fun getFree(): List<ApiProvider> =
        getAll().filter { it.pricing == Pricing.FREE || it.pricing == Pricing.FREEMIUM }

    /**
     * Get free providers by type
     */
    fun getFreeByType(type: ProviderType): List<ApiProvider> =
        getFree().filter { it.type == type || it.type == ProviderType.MULTI_MODAL }
}
