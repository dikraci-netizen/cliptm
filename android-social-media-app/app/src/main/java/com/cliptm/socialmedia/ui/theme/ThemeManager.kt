package com.cliptm.socialmedia.ui.theme

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.themeDataStore by preferencesDataStore(name = "theme_prefs")

/**
 * Manages app theme preferences including dark mode, RTL, and language.
 */
class ThemeManager(private val context: Context) {

    companion object {
        private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")
        private val FORCE_RTL_KEY = booleanPreferencesKey("force_rtl")
        private val APP_LANGUAGE_KEY = stringPreferencesKey("app_language")
        private val DYNAMIC_COLORS_KEY = booleanPreferencesKey("dynamic_colors")
        private val ONBOARDING_DONE_KEY = booleanPreferencesKey("onboarding_done")
        private val BIOMETRIC_ENABLED_KEY = booleanPreferencesKey("biometric_enabled")
    }

    val isDarkMode: Flow<Boolean> = context.themeDataStore.data
        .map { it[DARK_MODE_KEY] ?: false }

    val isForceRtl: Flow<Boolean> = context.themeDataStore.data
        .map { it[FORCE_RTL_KEY] ?: false }

    val appLanguage: Flow<String> = context.themeDataStore.data
        .map { it[APP_LANGUAGE_KEY] ?: "fr" }

    val isDynamicColors: Flow<Boolean> = context.themeDataStore.data
        .map { it[DYNAMIC_COLORS_KEY] ?: true }

    val isOnboardingDone: Flow<Boolean> = context.themeDataStore.data
        .map { it[ONBOARDING_DONE_KEY] ?: false }

    val isBiometricEnabled: Flow<Boolean> = context.themeDataStore.data
        .map { it[BIOMETRIC_ENABLED_KEY] ?: false }

    suspend fun setDarkMode(enabled: Boolean) {
        context.themeDataStore.edit { it[DARK_MODE_KEY] = enabled }
    }

    suspend fun setForceRtl(enabled: Boolean) {
        context.themeDataStore.edit { it[FORCE_RTL_KEY] = enabled }
    }

    suspend fun setAppLanguage(language: String) {
        context.themeDataStore.edit { it[APP_LANGUAGE_KEY] = language }
    }

    suspend fun setDynamicColors(enabled: Boolean) {
        context.themeDataStore.edit { it[DYNAMIC_COLORS_KEY] = enabled }
    }

    suspend fun setOnboardingDone(done: Boolean) {
        context.themeDataStore.edit { it[ONBOARDING_DONE_KEY] = done }
    }

    suspend fun setBiometricEnabled(enabled: Boolean) {
        context.themeDataStore.edit { it[BIOMETRIC_ENABLED_KEY] = enabled }
    }
}
