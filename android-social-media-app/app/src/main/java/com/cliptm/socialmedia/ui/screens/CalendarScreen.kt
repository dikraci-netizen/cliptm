package com.cliptm.socialmedia.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.local.entity.ScheduledPostEntity
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(
    scheduledPosts: List<ScheduledPostEntity>,
    onNavigateBack: () -> Unit,
    onDayClick: (Long) -> Unit,
    onGenerateCalendar: () -> Unit
) {
    val calendar = Calendar.getInstance()
    var currentMonth by remember { mutableStateOf(calendar.get(Calendar.MONTH)) }
    var currentYear by remember { mutableStateOf(calendar.get(Calendar.YEAR)) }

    val daysInMonth = remember(currentMonth, currentYear) {
        val cal = Calendar.getInstance()
        cal.set(currentYear, currentMonth, 1)
        cal.getActualMaximum(Calendar.DAY_OF_MONTH)
    }

    val firstDayOfWeek = remember(currentMonth, currentYear) {
        val cal = Calendar.getInstance()
        cal.set(currentYear, currentMonth, 1)
        (cal.get(Calendar.DAY_OF_WEEK) - 1) % 7
    }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Content Calendar", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onGenerateCalendar) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = "Generate")
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
            // Month navigation
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {
                    if (currentMonth == 0) { currentMonth = 11; currentYear-- }
                    else currentMonth--
                }) { Icon(Icons.Default.ChevronLeft, contentDescription = "Previous") }

                Text("${monthNames[currentMonth]} $currentYear",
                    fontSize = 18.sp, fontWeight = FontWeight.SemiBold)

                IconButton(onClick = {
                    if (currentMonth == 11) { currentMonth = 0; currentYear++ }
                    else currentMonth++
                }) { Icon(Icons.Default.ChevronRight, contentDescription = "Next") }
            }

            Spacer(Modifier.height(16.dp))

            // Day headers
            Row(Modifier.fillMaxWidth()) {
                listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                    Text(day, modifier = Modifier.weight(1f), textAlign = TextAlign.Center,
                        fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                }
            }

            Spacer(Modifier.height(8.dp))

            // Calendar grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(7),
                modifier = Modifier.height(280.dp),
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                // Empty cells before first day
                items(firstDayOfWeek) { Box(Modifier.aspectRatio(1f)) }

                // Day cells
                items(daysInMonth) { dayIndex ->
                    val day = dayIndex + 1
                    val cal = Calendar.getInstance()
                    cal.set(currentYear, currentMonth, day, 0, 0, 0)
                    val dayStart = cal.timeInMillis
                    cal.add(Calendar.DAY_OF_MONTH, 1)
                    val dayEnd = cal.timeInMillis

                    val postsForDay = scheduledPosts.filter {
                        it.scheduledTime in dayStart until dayEnd
                    }
                    val isToday = Calendar.getInstance().let {
                        it.get(Calendar.DAY_OF_MONTH) == day &&
                        it.get(Calendar.MONTH) == currentMonth &&
                        it.get(Calendar.YEAR) == currentYear
                    }

                    CalendarDayCell(
                        day = day,
                        postCount = postsForDay.size,
                        isToday = isToday,
                        onClick = { onDayClick(dayStart) }
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Upcoming posts
            Text("Upcoming Posts", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Spacer(Modifier.height(8.dp))

            val upcomingPosts = scheduledPosts
                .filter { it.scheduledTime > System.currentTimeMillis() && it.status == "pending" }
                .sortedBy { it.scheduledTime }
                .take(5)

            if (upcomingPosts.isEmpty()) {
                Text("No upcoming posts scheduled",
                    color = MaterialTheme.colorScheme.onSurface.copy(0.5f), fontSize = 13.sp)
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(upcomingPosts) { post ->
                        val dateFormat = SimpleDateFormat("EEE, dd MMM • HH:mm", Locale.getDefault())
                        Card(shape = RoundedCornerShape(8.dp)) {
                            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(post.platform, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                                    Text(dateFormat.format(Date(post.scheduledTime)),
                                        fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                                }
                                Surface(shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFF4CAF50).copy(0.1f)) {
                                    Text(post.status, fontSize = 11.sp,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
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
fun CalendarDayCell(day: Int, postCount: Int, isToday: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .background(
                when {
                    isToday -> MaterialTheme.colorScheme.primary.copy(0.15f)
                    postCount > 0 -> MaterialTheme.colorScheme.secondary.copy(0.1f)
                    else -> Color.Transparent
                }
            )
            .then(if (isToday) Modifier.border(1.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(8.dp))
                else Modifier)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$day", fontSize = 13.sp,
                fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal)
            if (postCount > 0) {
                Box(Modifier.size(6.dp).clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary))
            }
        }
    }
}
