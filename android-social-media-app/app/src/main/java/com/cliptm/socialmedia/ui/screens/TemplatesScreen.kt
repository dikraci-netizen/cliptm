package com.cliptm.socialmedia.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.local.entity.TemplateEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TemplatesScreen(
    templates: List<TemplateEntity>,
    onNavigateBack: () -> Unit,
    onUseTemplate: (TemplateEntity) -> Unit,
    onDeleteTemplate: (TemplateEntity) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "E-commerce", "Food", "Fitness", "Beauty", "Tech", "Education", "Custom")

    val filteredTemplates = if (selectedCategory == "All") templates
        else templates.filter { it.category.equals(selectedCategory, true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Templates", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Add template */ }) {
                        Icon(Icons.Default.Add, contentDescription = "Add")
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Category filter
            ScrollableTabRow(
                selectedTabIndex = categories.indexOf(selectedCategory).coerceAtLeast(0),
                edgePadding = 16.dp
            ) {
                categories.forEachIndexed { _, category ->
                    Tab(selected = selectedCategory == category,
                        onClick = { selectedCategory = category },
                        text = { Text(category, fontSize = 13.sp) })
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredTemplates) { template ->
                    TemplateCard(template, onUse = { onUseTemplate(template) },
                        onDelete = { onDeleteTemplate(template) })
                }
            }
        }
    }
}

@Composable
fun TemplateCard(template: TemplateEntity, onUse: () -> Unit, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onUse() },
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(template.name, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                    Text(template.description, fontSize = 12.sp, maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                }
                if (template.isBuiltIn) {
                    Surface(shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primary.copy(0.1f)) {
                        Text("Built-in", fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                AssistChip(onClick = {}, label = { Text(template.platform, fontSize = 11.sp) })
                AssistChip(onClick = {}, label = { Text(template.category, fontSize = 11.sp) })
                Spacer(Modifier.weight(1f))
                Text("Used ${template.usageCount}x", fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }
            Spacer(Modifier.height(8.dp))
            Text(template.templateText, fontSize = 13.sp, maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurface.copy(0.8f))
            Spacer(Modifier.height(8.dp))
            Row {
                Button(onClick = onUse, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Use", fontSize = 13.sp)
                }
                if (!template.isBuiltIn) {
                    Spacer(Modifier.width(8.dp))
                    OutlinedButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
