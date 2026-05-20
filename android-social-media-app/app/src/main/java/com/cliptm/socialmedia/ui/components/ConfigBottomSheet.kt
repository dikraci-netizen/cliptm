package com.cliptm.socialmedia.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConfigBottomSheet(
    config: ContentConfig,
    apiKey: String,
    onConfigUpdate: (ContentConfig) -> Unit,
    onApiKeyUpdate: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var selectedLanguages by remember { mutableStateOf(config.languages) }
    var selectedPlatforms by remember { mutableStateOf(config.platforms) }
    var selectedContentType by remember { mutableStateOf(config.contentType) }
    var brandName by remember { mutableStateOf(config.brandName) }
    var targetAudience by remember { mutableStateOf(config.targetAudience) }
    var toneOfVoice by remember { mutableStateOf(config.toneOfVoice) }
    var localApiKey by remember { mutableStateOf(apiKey) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                "⚙️ Configuration",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 20.dp)
            )

            // API Key
            Text("🔑 Clé API (OpenAI)", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = localApiKey,
                onValueChange = { localApiKey = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("sk-...") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Languages
            Text("🌍 Langues", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Language.entries.forEach { language ->
                    FilterChip(
                        selected = language in selectedLanguages,
                        onClick = {
                            selectedLanguages = if (language in selectedLanguages)
                                selectedLanguages - language
                            else
                                selectedLanguages + language
                        },
                        label = { Text(language.displayName, fontSize = 12.sp) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Platforms
            Text("📱 Plateformes", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Platform.entries.forEach { platform ->
                    FilterChip(
                        selected = platform in selectedPlatforms,
                        onClick = {
                            selectedPlatforms = if (platform in selectedPlatforms)
                                selectedPlatforms - platform
                            else
                                selectedPlatforms + platform
                        },
                        label = { Text("${platform.icon} ${platform.displayName}", fontSize = 12.sp) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Content Type
            Text("📝 Type de contenu", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                ContentType.entries.forEach { contentType ->
                    FilterChip(
                        selected = contentType == selectedContentType,
                        onClick = { selectedContentType = contentType },
                        label = { Text(contentType.displayName, fontSize = 12.sp) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Brand Name
            Text("🏷️ Marque / Business", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = brandName,
                onValueChange = { brandName = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Ex: Ma Pâtisserie Marocaine") },
                singleLine = true
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Target Audience
            Text("🎯 Audience cible", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = targetAudience,
                onValueChange = { targetAudience = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Ex: Femmes 25-45 ans au Maroc") },
                singleLine = true
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Tone of Voice
            Text("🎭 Ton de voix", fontWeight = FontWeight.Medium, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = toneOfVoice,
                onValueChange = { toneOfVoice = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Ex: Professionnel, chaleureux, humoristique") },
                singleLine = true
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Save Button
            Button(
                onClick = {
                    onApiKeyUpdate(localApiKey)
                    onConfigUpdate(
                        ContentConfig(
                            languages = selectedLanguages,
                            platforms = selectedPlatforms,
                            contentType = selectedContentType,
                            brandName = brandName,
                            targetAudience = targetAudience,
                            toneOfVoice = toneOfVoice
                        )
                    )
                    onDismiss()
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("✅ Sauvegarder la configuration")
            }
        }
    }
}
