package com.cliptm.socialmedia.ui.screens

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliptm.socialmedia.data.social.ConnectedAccount
import com.cliptm.socialmedia.data.social.SocialPlatform
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConnectedAccountsScreen(
    connectedAccounts: List<ConnectedAccount>,
    onNavigateBack: () -> Unit,
    onConnectPlatform: (SocialPlatform) -> Unit,
    onDisconnect: (ConnectedAccount) -> Unit,
    onPublishTo: (ConnectedAccount) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Connected Accounts", fontWeight = FontWeight.Bold)
                        Text("${connectedAccounts.size} connected", fontSize = 12.sp,
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
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Connected accounts section
            if (connectedAccounts.isNotEmpty()) {
                item {
                    Text("Active Connections", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                }
                items(connectedAccounts) { account ->
                    ConnectedAccountCard(account, onDisconnect = { onDisconnect(account) },
                        onPublish = { onPublishTo(account) })
                }
                item { Spacer(Modifier.height(16.dp)) }
            }

            // Available platforms
            item {
                Text("Connect a Platform", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
            items(SocialPlatform.entries.toList()) { platform ->
                val isConnected = connectedAccounts.any { it.platform == platform }
                PlatformConnectCard(platform, isConnected, onClick = {
                    if (!isConnected) onConnectPlatform(platform)
                })
            }
        }
    }
}

@Composable
fun ConnectedAccountCard(
    account: ConnectedAccount,
    onDisconnect: () -> Unit,
    onPublish: () -> Unit
) {
    val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
    Card(shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            // Platform icon
            Box(
                Modifier.size(44.dp).clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(0.1f)),
                contentAlignment = Alignment.Center
            ) { Text(account.platform.icon, fontSize = 22.sp) }

            Spacer(Modifier.width(12.dp))

            Column(Modifier.weight(1f)) {
                Text(account.displayName.ifBlank { account.username },
                    fontWeight = FontWeight.Medium, fontSize = 15.sp)
                Text("${account.platform.displayName} • Connected ${dateFormat.format(Date(account.connectedAt))}",
                    fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }

            // Actions
            IconButton(onClick = onPublish, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.Send, contentDescription = "Publish",
                    tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
            }
            IconButton(onClick = onDisconnect, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.LinkOff, contentDescription = "Disconnect",
                    tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
fun PlatformConnectCard(platform: SocialPlatform, isConnected: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(enabled = !isConnected) { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isConnected) Color(0xFF4CAF50).copy(0.05f)
            else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(platform.icon, fontSize = 24.sp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(platform.displayName, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                Text(if (isConnected) "Connected" else "Tap to connect",
                    fontSize = 11.sp,
                    color = if (isConnected) Color(0xFF4CAF50) else MaterialTheme.colorScheme.onSurface.copy(0.5f))
            }
            if (isConnected) {
                Icon(Icons.Default.CheckCircle, contentDescription = "Connected",
                    tint = Color(0xFF4CAF50), modifier = Modifier.size(20.dp))
            } else {
                Icon(Icons.Default.AddCircleOutline, contentDescription = "Connect",
                    tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
            }
        }
    }
}
