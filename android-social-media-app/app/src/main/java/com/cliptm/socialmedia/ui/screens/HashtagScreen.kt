package com.cliptm.socialmedia.ui.screens

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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.local.entity.HashtagSetEntity

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun HashtagScreen(
    hashtagSets: List<HashtagSetEntity>,
    onNavigateBack: () -> Unit,
    onResearch: (String) -> Unit,
    onSaveSet: (HashtagSetEntity) -> Unit
) {
    var searchNiche by remember { mutableStateOf("") }
    val clipboardManager = LocalClipboardManager.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hashtags", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
            // Research input
            OutlinedTextField(
                value = searchNiche,
                onValueChange = { searchNiche = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Enter niche (e.g., fitness, food, beauty)...") },
                trailingIcon = {
                    IconButton(onClick = { if (searchNiche.isNotBlank()) onResearch(searchNiche) }) {
                        Icon(Icons.Default.Search, contentDescription = "Research")
                    }
                },
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )

            Spacer(Modifier.height(16.dp))

            // Saved hashtag sets
            Text("Saved Sets", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Spacer(Modifier.height(8.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(hashtagSets) { set ->
                    Card(shape = RoundedCornerShape(12.dp)) {
                        Column(Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(set.name, fontWeight = FontWeight.Medium)
                                    Text("${set.category} • ${set.platform} • ${set.hashtags.size} tags",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                                }
                                if (set.isTrending) {
                                    Surface(shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.error.copy(0.1f)) {
                                        Text("🔥 Trending", fontSize = 10.sp,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                    }
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                set.hashtags.take(10).forEach { tag ->
                                    SuggestionChip(
                                        onClick = { clipboardManager.setText(AnnotatedString(tag)) },
                                        label = { Text(tag, fontSize = 11.sp) }
                                    )
                                }
                                if (set.hashtags.size > 10) {
                                    SuggestionChip(onClick = {},
                                        label = { Text("+${set.hashtags.size - 10} more", fontSize = 11.sp) })
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                            OutlinedButton(
                                onClick = { clipboardManager.setText(AnnotatedString(set.hashtags.joinToString(" "))) },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = null, Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Copy All", fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
