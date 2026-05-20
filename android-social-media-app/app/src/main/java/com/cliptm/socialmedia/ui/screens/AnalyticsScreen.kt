package com.cliptm.socialmedia.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class AnalyticsStat(
    val title: String,
    val value: String,
    val icon: ImageVector,
    val color: Color,
    val change: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    totalContent: Int,
    weeklyContent: Int,
    totalTokens: Int,
    avgResponseTime: Double,
    topPlatforms: List<Pair<String, Int>>,
    topLanguages: List<Pair<String, Int>>,
    onNavigateBack: () -> Unit
) {
    val stats = listOf(
        AnalyticsStat("Total Content", "$totalContent", Icons.Default.Article, Color(0xFF6C63FF)),
        AnalyticsStat("This Week", "$weeklyContent", Icons.Default.TrendingUp, Color(0xFF4CAF50)),
        AnalyticsStat("Tokens Used", "$totalTokens", Icons.Default.Token, Color(0xFFFF9800)),
        AnalyticsStat("Avg Speed", "${avgResponseTime.toInt()}ms", Icons.Default.Speed, Color(0xFF03DAC6))
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Analytics", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Stats Grid
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    stats.take(2).forEach { stat ->
                        StatCard(stat, Modifier.weight(1f))
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    stats.drop(2).forEach { stat ->
                        StatCard(stat, Modifier.weight(1f))
                    }
                }
            }

            // Top Platforms
            item {
                Text("Top Platforms", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
            item {
                Card(shape = RoundedCornerShape(12.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        if (topPlatforms.isEmpty()) {
                            Text("No data yet", color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                        } else {
                            topPlatforms.forEach { (platform, count) ->
                                Row(
                                    Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(platform, modifier = Modifier.weight(1f), fontSize = 14.sp)
                                    LinearProgressIndicator(
                                        progress = { count.toFloat() / (topPlatforms.maxOf { it.second }).toFloat() },
                                        modifier = Modifier.weight(2f).height(8.dp).clip(RoundedCornerShape(4.dp))
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Text("$count", fontWeight = FontWeight.Medium, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                }
            }

            // Top Languages
            item {
                Text("Top Languages", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
            item {
                Card(shape = RoundedCornerShape(12.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        if (topLanguages.isEmpty()) {
                            Text("No data yet", color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                        } else {
                            topLanguages.forEach { (language, count) ->
                                Row(
                                    Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(language, modifier = Modifier.weight(1f), fontSize = 14.sp)
                                    Text("$count posts", fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(stat: AnalyticsStat, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Box(
                Modifier.size(36.dp).clip(CircleShape).background(stat.color.copy(0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(stat.icon, contentDescription = null, tint = stat.color, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.height(12.dp))
            Text(stat.value, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text(stat.title, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
        }
    }
}
