package com.cliptm.socialmedia.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class ConversionOption(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val gradient: List<Color>,
    val type: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MediaStudioScreen(
    onNavigateBack: () -> Unit,
    onConvert: (type: String, text: String) -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    val options = listOf(
        ConversionOption("Text → Image", "Generate visuals from your caption",
            Icons.Default.Image, listOf(Color(0xFF6C63FF), Color(0xFF9C27B0)), "image"),
        ConversionOption("Text → Audio", "Create voiceover from text",
            Icons.Default.Mic, listOf(Color(0xFF03DAC6), Color(0xFF00BCD4)), "audio"),
        ConversionOption("Text → Video", "Generate video storyboard",
            Icons.Default.Videocam, listOf(Color(0xFFFF6584), Color(0xFFFF9800)), "video"),
        ConversionOption("Text → Full Package", "Image + Audio + Video at once",
            Icons.Default.AutoAwesome, listOf(Color(0xFF4CAF50), Color(0xFF8BC34A)), "full")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Media Studio", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Input
            item {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    modifier = Modifier.fillMaxWidth().height(150.dp),
                    placeholder = { Text("Paste your text content, caption, or script here...") },
                    shape = RoundedCornerShape(16.dp),
                    maxLines = 8
                )
            }

            item {
                Text("Convert To", fontWeight = FontWeight.SemiBold, fontSize = 16.sp,
                    modifier = Modifier.padding(top = 8.dp))
            }

            // Conversion options
            items(options.size) { index ->
                val option = options[index]
                ConversionCard(
                    option = option,
                    isSelected = selectedType == option.type,
                    onClick = { selectedType = option.type }
                )
            }

            // Convert button
            item {
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = {
                        if (inputText.isNotBlank() && selectedType.isNotBlank()) {
                            isLoading = true
                            onConvert(selectedType, inputText)
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = inputText.isNotBlank() && selectedType.isNotBlank() && !isLoading,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = Color.White)
                        Spacer(Modifier.width(8.dp))
                        Text("Converting...")
                    } else {
                        Icon(Icons.Default.Transform, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Convert Now", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun ConversionCard(option: ConversionOption, isSelected: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        border = if (isSelected) CardDefaults.outlinedCardBorder() else null,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) option.gradient.first().copy(0.1f) else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(48.dp).background(
                    brush = Brush.linearGradient(option.gradient),
                    shape = RoundedCornerShape(12.dp)
                ),
                contentAlignment = Alignment.Center
            ) {
                Icon(option.icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(option.title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                Text(option.subtitle, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
            }
            if (isSelected) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = option.gradient.first())
            }
        }
    }
}
