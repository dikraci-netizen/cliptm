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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.model.Language
import com.cliptm.socialmedia.data.model.Platform

enum class ProductOutputType(val displayName: String, val icon: String, val description: String) {
    UGC_VIDEO("UGC Video Script", "🎬", "Authentic testimonial-style video script"),
    LANDING_PAGE("Landing Page", "🌐", "Complete HTML landing page with CTA"),
    SOCIAL_POSTS("Social Media Posts", "📱", "Posts for all platforms in all languages"),
    AD_COPY("Ad Copy", "📢", "Facebook/Instagram/Google ad copy"),
    FULL_PACKAGE("Full Package", "🎁", "Everything: UGC + Posts + Ads + Landing Page")
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ProductConverterScreen(
    onNavigateBack: () -> Unit,
    onConvert: (url: String, outputType: ProductOutputType, languages: List<Language>, platforms: List<Platform>) -> Unit,
    isLoading: Boolean = false,
    result: String = ""
) {
    var productUrl by remember { mutableStateOf("") }
    var productDescription by remember { mutableStateOf("") }
    var selectedOutput by remember { mutableStateOf(ProductOutputType.FULL_PACKAGE) }
    var selectedLanguages by remember { mutableStateOf(listOf(Language.FRENCH, Language.DARIJA, Language.ARABIC_MSA)) }
    var selectedPlatforms by remember { mutableStateOf(listOf(Platform.INSTAGRAM, Platform.TIKTOK, Platform.FACEBOOK)) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Product Converter", fontWeight = FontWeight.Bold)
                        Text("Link → Content Magic", fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    }
                },
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Supported stores info
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF6C63FF).copy(0.08f))
                ) {
                    Column(Modifier.padding(12.dp)) {
                        Text("Supported Sources", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                        Text("Amazon • AliExpress • Shopify • Etsy • eBay • Jumia • Avito • WooCommerce • Any URL",
                            fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    }
                }
            }

            // Product URL input
            item {
                OutlinedTextField(
                    value = productUrl,
                    onValueChange = { productUrl = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Product URL") },
                    placeholder = { Text("https://www.amazon.com/product/...") },
                    leadingIcon = { Icon(Icons.Default.Link, contentDescription = null) },
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )
            }

            // Optional description
            item {
                OutlinedTextField(
                    value = productDescription,
                    onValueChange = { productDescription = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Description (optional)") },
                    placeholder = { Text("Add details about the product if the URL is not enough...") },
                    shape = RoundedCornerShape(12.dp),
                    maxLines = 3
                )
            }

            // Output type selection
            item { Text("Output Type", fontWeight = FontWeight.SemiBold, fontSize = 15.sp) }
            items(ProductOutputType.entries.size) { index ->
                val type = ProductOutputType.entries[index]
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { selectedOutput = type },
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (selectedOutput == type) MaterialTheme.colorScheme.primary.copy(0.1f)
                        else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(type.icon, fontSize = 22.sp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(type.displayName, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                            Text(type.description, fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                        }
                        if (selectedOutput == type) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        }
                    }
                }
            }

            // Languages
            item {
                Text("Languages", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                Spacer(Modifier.height(8.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Language.entries.take(15).forEach { lang ->
                        FilterChip(
                            selected = lang in selectedLanguages,
                            onClick = {
                                selectedLanguages = if (lang in selectedLanguages)
                                    selectedLanguages - lang else selectedLanguages + lang
                            },
                            label = { Text(lang.displayName, fontSize = 11.sp) }
                        )
                    }
                }
            }

            // Platforms
            item {
                Text("Platforms", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                Spacer(Modifier.height(8.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Platform.entries.forEach { platform ->
                        FilterChip(
                            selected = platform in selectedPlatforms,
                            onClick = {
                                selectedPlatforms = if (platform in selectedPlatforms)
                                    selectedPlatforms - platform else selectedPlatforms + platform
                            },
                            label = { Text("${platform.icon} ${platform.displayName}", fontSize = 11.sp) }
                        )
                    }
                }
            }

            // Convert button
            item {
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = { onConvert(productUrl, selectedOutput, selectedLanguages, selectedPlatforms) },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = productUrl.isNotBlank() && !isLoading,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = Color.White)
                        Spacer(Modifier.width(8.dp))
                        Text("Generating...")
                    } else {
                        Icon(Icons.Default.Rocket, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Convert Product", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Result
            if (result.isNotBlank()) {
                item {
                    Card(shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50).copy(0.05f))) {
                        Column(Modifier.padding(16.dp)) {
                            Text("Generated Content", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                            Spacer(Modifier.height(8.dp))
                            Text(result, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}
