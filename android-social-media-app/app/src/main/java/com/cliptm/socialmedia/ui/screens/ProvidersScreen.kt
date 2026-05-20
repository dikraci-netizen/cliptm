package com.cliptm.socialmedia.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.api.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProvidersScreen(onNavigateBack: () -> Unit) {
    var selectedTab by remember { mutableStateOf(0) }
    var showAddProviderDialog by remember { mutableStateOf(false) }
    var editingProvider by remember { mutableStateOf<ApiProvider?>(null) }

    val tabs = listOf(
        "All" to "🌐",
        "Text" to "📝",
        "Image" to "🎨",
        "Audio" to "🎵",
        "Video" to "🎬"
    )

    val allProviders = DefaultProviders.getAll()
    val filteredProviders = when (selectedTab) {
        1 -> allProviders.filter { it.type == ProviderType.TEXT || it.type == ProviderType.MULTI_MODAL }
        2 -> allProviders.filter { it.type == ProviderType.IMAGE || it.type == ProviderType.MULTI_MODAL }
        3 -> allProviders.filter { it.type == ProviderType.AUDIO }
        4 -> allProviders.filter { it.type == ProviderType.VIDEO }
        else -> allProviders
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("API Providers", fontWeight = FontWeight.Bold)
                        Text(
                            "${allProviders.size} providers available",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showAddProviderDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Provider")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Filter Tabs
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                edgePadding = 16.dp
            ) {
                tabs.forEachIndexed { index, (title, icon) ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text("$icon $title", fontSize = 13.sp) }
                    )
                }
            }

            // Free providers banner
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF4CAF50).copy(alpha = 0.1f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("🟢", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            "Free APIs Available",
                            fontWeight = FontWeight.Medium,
                            fontSize = 14.sp
                        )
                        Text(
                            "Groq, Gemini, HuggingFace, Stability AI, ElevenLabs & more",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                }
            }

            // Provider List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredProviders) { provider ->
                    ProviderCard(
                        provider = provider,
                        onClick = { editingProvider = provider }
                    )
                }
            }
        }

        // Edit Provider Dialog
        editingProvider?.let { provider ->
            EditProviderDialog(
                provider = provider,
                onDismiss = { editingProvider = null },
                onSave = { updatedProvider ->
                    // Save logic handled by ViewModel
                    editingProvider = null
                }
            )
        }

        // Add Custom Provider Dialog
        if (showAddProviderDialog) {
            AddProviderDialog(
                onDismiss = { showAddProviderDialog = false },
                onSave = { newProvider ->
                    showAddProviderDialog = false
                }
            )
        }
    }
}

@Composable
fun ProviderCard(provider: ApiProvider, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Type icon
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(
                        when (provider.type) {
                            ProviderType.TEXT -> Color(0xFF6C63FF).copy(alpha = 0.15f)
                            ProviderType.IMAGE -> Color(0xFFFF6584).copy(alpha = 0.15f)
                            ProviderType.AUDIO -> Color(0xFF03DAC6).copy(alpha = 0.15f)
                            ProviderType.VIDEO -> Color(0xFFFF9800).copy(alpha = 0.15f)
                            ProviderType.MULTI_MODAL -> Color(0xFF9C27B0).copy(alpha = 0.15f)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(provider.type.icon, fontSize = 20.sp)
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Provider info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    provider.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp
                )
                Text(
                    provider.model,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            // Pricing badge
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = when (provider.pricing) {
                    Pricing.FREE -> Color(0xFF4CAF50).copy(alpha = 0.15f)
                    Pricing.FREEMIUM -> Color(0xFFFFC107).copy(alpha = 0.15f)
                    Pricing.PAID -> Color(0xFFF44336).copy(alpha = 0.15f)
                    Pricing.PAY_PER_USE -> Color(0xFFFF9800).copy(alpha = 0.15f)
                }
            ) {
                Text(
                    "${provider.pricing.badge} ${provider.pricing.displayName}",
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Configure arrow
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = "Configure",
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProviderDialog(
    provider: ApiProvider,
    onDismiss: () -> Unit,
    onSave: (ApiProvider) -> Unit
) {
    var apiKey by remember { mutableStateOf(provider.apiKey) }
    var showApiKey by remember { mutableStateOf(false) }
    var model by remember { mutableStateOf(provider.model) }
    var baseUrl by remember { mutableStateOf(provider.baseUrl) }
    var isEnabled by remember { mutableStateOf(provider.isEnabled) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(provider.type.icon, fontSize = 24.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Configure ${provider.name}", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Pricing info
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("${provider.pricing.badge}", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(provider.pricing.displayName, fontWeight = FontWeight.Medium, fontSize = 13.sp)
                            Text(provider.type.displayName, fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                    }
                }

                // API Key
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key") },
                    placeholder = { Text("Enter your API key") },
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (showApiKey) VisualTransformation.None
                        else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { showApiKey = !showApiKey }) {
                            Icon(
                                if (showApiKey) Icons.Default.VisibilityOff
                                else Icons.Default.Visibility,
                                contentDescription = "Toggle"
                            )
                        }
                    },
                    singleLine = true
                )

                // Model
                OutlinedTextField(
                    value = model,
                    onValueChange = { model = it },
                    label = { Text("Model") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Base URL
                OutlinedTextField(
                    value = baseUrl,
                    onValueChange = { baseUrl = it },
                    label = { Text("Base URL") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Enable/Disable
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Enabled", fontWeight = FontWeight.Medium)
                    Switch(checked = isEnabled, onCheckedChange = { isEnabled = it })
                }
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(provider.copy(
                    apiKey = apiKey,
                    model = model,
                    baseUrl = baseUrl,
                    isEnabled = isEnabled
                ))
            }) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddProviderDialog(
    onDismiss: () -> Unit,
    onSave: (ApiProvider) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var baseUrl by remember { mutableStateOf("") }
    var apiKey by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf(ProviderType.TEXT) }
    var selectedFormat by remember { mutableStateOf(RequestFormat.OPENAI_COMPATIBLE) }
    var showApiKey by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Custom API Provider", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Provider Name
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Provider Name") },
                    placeholder = { Text("e.g., My Local Ollama") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Type selection
                Text("Content Type", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    ProviderType.entries.forEach { type ->
                        FilterChip(
                            selected = type == selectedType,
                            onClick = { selectedType = type },
                            label = { Text("${type.icon} ${type.displayName}", fontSize = 11.sp) }
                        )
                    }
                }

                // Format selection
                Text("API Format", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    listOf(
                        RequestFormat.OPENAI_COMPATIBLE to "OpenAI",
                        RequestFormat.GOOGLE_GEMINI to "Gemini",
                        RequestFormat.ANTHROPIC to "Claude",
                        RequestFormat.CUSTOM to "Custom"
                    ).forEach { (format, label) ->
                        FilterChip(
                            selected = format == selectedFormat,
                            onClick = { selectedFormat = format },
                            label = { Text(label, fontSize = 11.sp) }
                        )
                    }
                }

                // Base URL
                OutlinedTextField(
                    value = baseUrl,
                    onValueChange = { baseUrl = it },
                    label = { Text("Base URL") },
                    placeholder = { Text("https://api.example.com") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Model
                OutlinedTextField(
                    value = model,
                    onValueChange = { model = it },
                    label = { Text("Model Name") },
                    placeholder = { Text("e.g., gpt-4o-mini") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // API Key
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (showApiKey) VisualTransformation.None
                        else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { showApiKey = !showApiKey }) {
                            Icon(
                                if (showApiKey) Icons.Default.VisibilityOff
                                else Icons.Default.Visibility,
                                contentDescription = "Toggle"
                            )
                        }
                    },
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank() && baseUrl.isNotBlank()) {
                        onSave(ApiProvider(
                            name = name,
                            type = selectedType,
                            baseUrl = baseUrl,
                            apiKey = apiKey,
                            model = model,
                            requestFormat = selectedFormat
                        ))
                    }
                },
                enabled = name.isNotBlank() && baseUrl.isNotBlank()
            ) {
                Text("Add Provider")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
