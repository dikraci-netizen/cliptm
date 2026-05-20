package com.cliptm.socialmedia.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.local.entity.BrandKitEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrandKitScreen(
    brandKits: List<BrandKitEntity>,
    onNavigateBack: () -> Unit,
    onAddBrandKit: () -> Unit,
    onSelectBrandKit: (BrandKitEntity) -> Unit,
    onDeleteBrandKit: (BrandKitEntity) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Brand Kits", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onAddBrandKit) {
                        Icon(Icons.Default.Add, contentDescription = "Add Brand")
                    }
                }
            )
        }
    ) { padding ->
        if (brandKits.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🏷️", fontSize = 48.sp)
                    Spacer(Modifier.height(16.dp))
                    Text("No brand kits yet", fontWeight = FontWeight.Medium)
                    Spacer(Modifier.height(8.dp))
                    Text("Add your brand to generate consistent content",
                        fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    Spacer(Modifier.height(24.dp))
                    Button(onClick = onAddBrandKit) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Create Brand Kit")
                    }
                }
            }
        } else {
            LazyColumn(
                Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(brandKits) { brand ->
                    BrandKitCard(brand, onSelect = { onSelectBrandKit(brand) },
                        onDelete = { onDeleteBrandKit(brand) })
                }
            }
        }
    }
}

@Composable
fun BrandKitCard(brand: BrandKitEntity, onSelect: () -> Unit, onDelete: () -> Unit) {
    val primaryColor = try { Color(android.graphics.Color.parseColor(brand.primaryColor)) }
        catch (e: Exception) { Color(0xFF6C63FF) }
    val secondaryColor = try { Color(android.graphics.Color.parseColor(brand.secondaryColor)) }
        catch (e: Exception) { Color(0xFFFF6584) }

    Card(
        Modifier.fillMaxWidth().clickable { onSelect() },
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Color circles
                Row(horizontalArrangement = Arrangement.spacedBy((-8).dp)) {
                    Box(Modifier.size(32.dp).clip(CircleShape).background(primaryColor)
                        .border(2.dp, Color.White, CircleShape))
                    Box(Modifier.size(32.dp).clip(CircleShape).background(secondaryColor)
                        .border(2.dp, Color.White, CircleShape))
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(brand.name, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                        if (brand.isDefault) {
                            Spacer(Modifier.width(8.dp))
                            Surface(shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF4CAF50).copy(0.15f)) {
                                Text("Default", fontSize = 10.sp, fontWeight = FontWeight.Medium,
                                    color = Color(0xFF4CAF50),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                    }
                    if (brand.targetAudience.isNotBlank()) {
                        Text(brand.targetAudience, fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    }
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.MoreVert, contentDescription = "More")
                }
            }
            if (brand.voiceGuidelines.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                Text("Voice: ${brand.voiceGuidelines}", fontSize = 12.sp, maxLines = 1,
                    color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }
            if (brand.hashtags.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                Text(brand.hashtags.take(4).joinToString(" "), fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}
