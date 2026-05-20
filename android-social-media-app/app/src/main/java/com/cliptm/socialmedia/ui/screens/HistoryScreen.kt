package com.cliptm.socialmedia.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.local.entity.ContentEntity
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    contents: List<ContentEntity>,
    onNavigateBack: () -> Unit,
    onToggleFavorite: (String, Boolean) -> Unit,
    onDelete: (String) -> Unit,
    onShare: (ContentEntity) -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    val tabs = listOf("All", "Favorites", "Instagram", "TikTok", "Facebook")

    val filteredContents = when (selectedTab) {
        1 -> contents.filter { it.isFavorite }
        2 -> contents.filter { it.platform == "INSTAGRAM" }
        3 -> contents.filter { it.platform == "TIKTOK" }
        4 -> contents.filter { it.platform == "FACEBOOK" }
        else -> contents
    }.filter {
        searchQuery.isBlank() || it.textContent.contains(searchQuery, ignoreCase = true)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("History", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Search
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search content...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(24.dp),
                singleLine = true
            )

            // Tabs
            ScrollableTabRow(selectedTabIndex = selectedTab, edgePadding = 16.dp) {
                tabs.forEachIndexed { index, title ->
                    Tab(selected = selectedTab == index, onClick = { selectedTab = index },
                        text = { Text(title) })
                }
            }

            // Content List
            if (filteredContents.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("📭", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("No content yet", color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filteredContents, key = { it.id }) { content ->
                        ContentHistoryCard(
                            content = content,
                            onToggleFavorite = { onToggleFavorite(content.id, !content.isFavorite) },
                            onDelete = { onDelete(content.id) },
                            onShare = { onShare(content) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ContentHistoryCard(
    content: ContentEntity,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit,
    onShare: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    val dateFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
    val favoriteColor by animateColorAsState(
        if (content.isFavorite) Color(0xFFFF6584) else Color.Gray
    )

    Card(shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primary.copy(0.1f)) {
                    Text(content.platform, fontSize = 11.sp, fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
                Spacer(Modifier.width(8.dp))
                Surface(shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.secondary.copy(0.1f)) {
                    Text(content.language, fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
                Spacer(Modifier.weight(1f))
                Text(dateFormat.format(Date(content.createdAt)), fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }

            Spacer(Modifier.height(8.dp))

            // Content preview
            Text(content.textContent, maxLines = 4, overflow = TextOverflow.Ellipsis, fontSize = 14.sp)

            // Hashtags
            if (content.hashtags.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Text(content.hashtags.take(5).joinToString(" "), fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary)
            }

            Spacer(Modifier.height(8.dp))

            // Actions
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = onToggleFavorite, modifier = Modifier.size(32.dp)) {
                    Icon(if (content.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favorite", tint = favoriteColor, modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = { clipboardManager.setText(AnnotatedString(content.textContent)) },
                    modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onShare, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(18.dp))
                }
                Spacer(Modifier.weight(1f))
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}
