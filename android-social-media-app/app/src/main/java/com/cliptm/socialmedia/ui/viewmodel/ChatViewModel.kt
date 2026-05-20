package com.cliptm.socialmedia.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cliptm.socialmedia.data.model.*
import com.cliptm.socialmedia.data.repository.ChatRepository
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
    val apiKey: String = "",
    val showConfigSheet: Boolean = false
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMessage = ChatMessage(content = text, isUser = true)
        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMessage,
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            val result = chatRepository.sendMessage(
                userMessage = text,
                config = _uiState.value.config,
                apiKey = _uiState.value.apiKey,
                baseUrl = "https://api.openai.com/"
            )

            result.fold(
                onSuccess = { response ->
                    val assistantMessage = ChatMessage(content = response, isUser = false)
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + assistantMessage,
                        isLoading = false
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Unknown error occurred"
                    )
                }
            )
        }
    }

    fun updateConfig(config: ContentConfig) {
        _uiState.value = _uiState.value.copy(config = config)
        chatRepository.updateSystemPrompt(config)
    }

    fun updateApiKey(key: String) {
        _uiState.value = _uiState.value.copy(apiKey = key)
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
}
