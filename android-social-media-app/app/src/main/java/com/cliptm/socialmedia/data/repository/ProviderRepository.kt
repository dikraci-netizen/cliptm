package com.cliptm.socialmedia.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.cliptm.socialmedia.data.api.ApiProvider
import com.cliptm.socialmedia.data.api.DefaultProviders
import com.cliptm.socialmedia.data.api.ProviderType
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "providers")

/**
 * Repository for managing API providers.
 * Stores custom provider configurations in DataStore.
 */
@Singleton
class ProviderRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson
) {
    private val PROVIDERS_KEY = stringPreferencesKey("custom_providers")
    private val ACTIVE_TEXT_KEY = stringPreferencesKey("active_text_provider")
    private val ACTIVE_IMAGE_KEY = stringPreferencesKey("active_image_provider")
    private val ACTIVE_AUDIO_KEY = stringPreferencesKey("active_audio_provider")
    private val ACTIVE_VIDEO_KEY = stringPreferencesKey("active_video_provider")

    /**
     * Get all providers (defaults + custom)
     */
    fun getAllProviders(): Flow<List<ApiProvider>> {
        return context.dataStore.data.map { preferences ->
            val customJson = preferences[PROVIDERS_KEY] ?: "[]"
            val customProviders: List<ApiProvider> = gson.fromJson(
                customJson,
                object : TypeToken<List<ApiProvider>>() {}.type
            )
            DefaultProviders.getAll() + customProviders
        }
    }

    /**
     * Get providers filtered by type
     */
    fun getProvidersByType(type: ProviderType): Flow<List<ApiProvider>> {
        return getAllProviders().map { providers ->
            providers.filter { it.type == type || it.type == ProviderType.MULTI_MODAL }
        }
    }

    /**
     * Add a custom provider
     */
    suspend fun addProvider(provider: ApiProvider) {
        context.dataStore.edit { preferences ->
            val currentJson = preferences[PROVIDERS_KEY] ?: "[]"
            val currentList: MutableList<ApiProvider> = gson.fromJson(
                currentJson,
                object : TypeToken<MutableList<ApiProvider>>() {}.type
            )
            currentList.add(provider)
            preferences[PROVIDERS_KEY] = gson.toJson(currentList)
        }
    }

    /**
     * Update an existing provider (custom or default with API key)
     */
    suspend fun updateProvider(provider: ApiProvider) {
        context.dataStore.edit { preferences ->
            val currentJson = preferences[PROVIDERS_KEY] ?: "[]"
            val currentList: MutableList<ApiProvider> = gson.fromJson(
                currentJson,
                object : TypeToken<MutableList<ApiProvider>>() {}.type
            )
            val index = currentList.indexOfFirst { it.id == provider.id }
            if (index >= 0) {
                currentList[index] = provider
            } else {
                currentList.add(provider)
            }
            preferences[PROVIDERS_KEY] = gson.toJson(currentList)
        }
    }

    /**
     * Remove a custom provider
     */
    suspend fun removeProvider(providerId: String) {
        context.dataStore.edit { preferences ->
            val currentJson = preferences[PROVIDERS_KEY] ?: "[]"
            val currentList: MutableList<ApiProvider> = gson.fromJson(
                currentJson,
                object : TypeToken<MutableList<ApiProvider>>() {}.type
            )
            currentList.removeAll { it.id == providerId }
            preferences[PROVIDERS_KEY] = gson.toJson(currentList)
        }
    }

    /**
     * Set active provider for a content type
     */
    suspend fun setActiveProvider(type: ProviderType, providerId: String) {
        context.dataStore.edit { preferences ->
            val key = when (type) {
                ProviderType.TEXT -> ACTIVE_TEXT_KEY
                ProviderType.IMAGE -> ACTIVE_IMAGE_KEY
                ProviderType.AUDIO -> ACTIVE_AUDIO_KEY
                ProviderType.VIDEO -> ACTIVE_VIDEO_KEY
                ProviderType.MULTI_MODAL -> ACTIVE_TEXT_KEY
            }
            preferences[key] = providerId
        }
    }

    /**
     * Get active provider ID for a content type
     */
    fun getActiveProviderId(type: ProviderType): Flow<String> {
        return context.dataStore.data.map { preferences ->
            val key = when (type) {
                ProviderType.TEXT -> ACTIVE_TEXT_KEY
                ProviderType.IMAGE -> ACTIVE_IMAGE_KEY
                ProviderType.AUDIO -> ACTIVE_AUDIO_KEY
                ProviderType.VIDEO -> ACTIVE_VIDEO_KEY
                ProviderType.MULTI_MODAL -> ACTIVE_TEXT_KEY
            }
            preferences[key] ?: getDefaultProviderId(type)
        }
    }

    private fun getDefaultProviderId(type: ProviderType): String {
        return when (type) {
            ProviderType.TEXT -> "groq"  // Free by default
            ProviderType.IMAGE -> "stability"
            ProviderType.AUDIO -> "elevenlabs"
            ProviderType.VIDEO -> "luma"
            ProviderType.MULTI_MODAL -> "openai"
        }
    }
}
