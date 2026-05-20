package com.cliptm.socialmedia.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cliptm.socialmedia.data.api.ApiProvider
import com.cliptm.socialmedia.data.api.DefaultProviders
import com.cliptm.socialmedia.data.api.ProviderType
import com.cliptm.socialmedia.data.model.*
import com.cliptm.socialmedia.data.repository.ChatRepository
import com.cliptm.socialmedia.data.repository.ProviderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val config: ContentConfig = ContentConfig(),
    val showConfigSheet: Boolean = false,
    val activeTextProvider: ApiProvider = DefaultProviders.groq,
    val activeImageProvider: ApiProvider = DefaultProviders.stabilityAI,
    val activeAudioProvider: ApiProvider = DefaultProviders.elevenLabs,
    val activeVideoProvider: ApiProvider = DefaultProviders.lumaAI,
    val generationStatus: GenerationStatus = GenerationStatus.COMPLETED
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val providerRepository: ProviderRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    /**
     * Send a message and generate text content (+ optional media)
     */
    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMessage = ChatMessage(content = text, isUser = true)
        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMessage,
            isLoading = true,
            error = null,
            generationStatus = GenerationStatus.IN_PROGRESS
        )

        viewModelScope.launch {
            val config = _uiState.value.config
            val textProvider = _uiState.value.activeTextProvider

            // Check if API key is configured
            if (textProvider.apiKey.isBlank()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Please configure your API key for ${textProvider.name} in the Providers section.",
                    generationStatus = GenerationStatus.FAILED
                )
                return@launch
            }

            val result = chatRepository.sendMessage(
                userMessage = text,
                config = config,
                textProvider = textProvider
            )

            result.fold(
                onSuccess = { response ->
                    val mediaAttachments = mutableListOf<MediaAttachment>()

                    // Generate image if enabled and provider configured
                    if (config.generateImage) {
                        val imageProvider = _uiState.value.activeImageProvider
                        if (imageProvider.apiKey.isNotBlank()) {
                            val imageResult = chatRepository.generateImage(
                                request = ImageGenerationRequest(
                                    prompt = extractOrBuildImagePrompt(response, text, config),
                                    size = ImageSize.forPlatform(config.platforms.first()),
                                    style = config.imageStyle
                                ),
                                imageProvider = imageProvider
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
                    }

                    val assistantMessage = ChatMessage(
                        content = response,
                        isUser = false,
                        mediaAttachments = mediaAttachments,
                        generationStatus = GenerationStatus.COMPLETED
                    )
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + assistantMessage,
                        isLoading = false,
                        generationStatus = GenerationStatus.COMPLETED
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Unknown error occurred",
                        generationStatus = GenerationStatus.FAILED
                    )
                }
            )
        }
    }

    /**
     * Generate image standalone
     */
    fun generateImage(prompt: String) {
        viewModelScope.launch {
            val config = _uiState.value.config
            val imageProvider = _uiState.value.activeImageProvider

            if (imageProvider.apiKey.isBlank()) {
                _uiState.value = _uiState.value.copy(
                    error = "Configure your API key for ${imageProvider.name} first."
                )
                return@launch
            }

            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = chatRepository.generateImage(
                request = ImageGenerationRequest(
                    prompt = prompt,
                    size = ImageSize.forPlatform(config.platforms.first()),
                    style = config.imageStyle
                ),
                imageProvider = imageProvider
            )

            result.fold(
                onSuccess = { urls ->
                    val attachments = urls.map { url ->
                        MediaAttachment(type = MediaType.IMAGE, url = url)
                    }
                    val message = ChatMessage(
                        content = "Generated image(s) for: \"$prompt\"",
                        isUser = false,
                        mediaAttachments = attachments
                    )
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + message,
                        isLoading = false
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Image generation failed: ${error.message}"
                    )
                }
            )
        }
    }

    /**
     * Generate audio standalone
     */
    fun generateAudio(text: String, language: Language = Language.FRENCH) {
        viewModelScope.launch {
            val audioProvider = _uiState.value.activeAudioProvider

            if (audioProvider.apiKey.isBlank()) {
                _uiState.value = _uiState.value.copy(
                    error = "Configure your API key for ${audioProvider.name} first."
                )
                return@launch
            }

            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = chatRepository.generateAudio(
                request = AudioGenerationRequest(text = text, language = language),
                audioProvider = audioProvider
            )

            result.fold(
                onSuccess = {
                    val message = ChatMessage(
                        content = "Audio generated for: \"${text.take(100)}...\"",
                        isUser = false,
                        mediaAttachments = listOf(
                            MediaAttachment(
                                type = MediaType.AUDIO,
                                mimeType = "audio/mpeg"
                            )
                        )
                    )
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + message,
                        isLoading = false
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Audio generation failed: ${error.message}"
                    )
                }
            )
        }
    }

    // ===== Configuration =====

    fun updateConfig(config: ContentConfig) {
        _uiState.value = _uiState.value.copy(config = config)
        chatRepository.updateSystemPrompt(config)
    }

    fun setTextProvider(provider: ApiProvider) {
        _uiState.value = _uiState.value.copy(activeTextProvider = provider)
    }

    fun setImageProvider(provider: ApiProvider) {
        _uiState.value = _uiState.value.copy(activeImageProvider = provider)
    }

    fun setAudioProvider(provider: ApiProvider) {
        _uiState.value = _uiState.value.copy(activeAudioProvider = provider)
    }

    fun setVideoProvider(provider: ApiProvider) {
        _uiState.value = _uiState.value.copy(activeVideoProvider = provider)
    }

    fun toggleConfigSheet() {
        _uiState.value = _uiState.value.copy(
            showConfigSheet = !_uiState.value.showConfigSheet
        )
    }

    fun clearChat() {
        _uiState.value = _uiState.value.copy(messages = emptyList())
        chatRepository.clearConversation()
    }

    fun dismissError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    // ===== Helpers =====

    private fun extractOrBuildImagePrompt(response: String, userPrompt: String, config: ContentConfig): String {
        // Try to extract from [IMAGE_PROMPT] tags in response
        val regex = """\[IMAGE_PROMPT\](.*?)\[/IMAGE_PROMPT\]""".toRegex(RegexOption.DOT_MATCHES_ALL)
        val match = regex.find(response)
        if (match != null) {
            val block = match.groupValues[1].trim()
            val descLine = block.lines().find { it.startsWith("Description:") }
            return descLine?.removePrefix("Description:")?.trim() ?: block
        }

        // Build a default prompt
        return buildString {
            append("Social media visual for ${config.platforms.first().displayName}. ")
            if (config.brandName.isNotBlank()) append("Brand: ${config.brandName}. ")
            append("Theme: $userPrompt. ")
            append(config.imageStyle.promptSuffix)
        }
    }
}
