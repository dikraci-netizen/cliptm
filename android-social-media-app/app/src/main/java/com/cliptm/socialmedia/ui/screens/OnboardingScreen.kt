package com.cliptm.socialmedia.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

data class OnboardingPage(
    val emoji: String,
    val title: String,
    val description: String,
    val color: Color
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(onComplete: () -> Unit) {
    val pages = listOf(
        OnboardingPage("🚀", "Welcome to ClipTM Social",
            "Your AI-powered social media content creator.\nCreate viral content in seconds!",
            Color(0xFF6C63FF)),
        OnboardingPage("🌍", "4 Languages",
            "Generate content in English, French, Arabic (MSA), and Moroccan Darija.\nCulturally adapted, not translated!",
            Color(0xFF03DAC6)),
        OnboardingPage("📱", "All Platforms",
            "Instagram, TikTok, Facebook, YouTube, LinkedIn, Twitter/X, Pinterest.\nOptimized for each platform!",
            Color(0xFFFF6584)),
        OnboardingPage("🎨", "Multi-Modal",
            "Text, Images, Audio, Video.\nUse 17+ AI APIs (free & paid): OpenAI, Groq, Stability AI, ElevenLabs...",
            Color(0xFFFF9800)),
        OnboardingPage("⚡", "Get Started",
            "Configure your API key and start creating!\nGroq is FREE and fast.",
            Color(0xFF4CAF50))
    )

    val pagerState = rememberPagerState(pageCount = { pages.size })
    val coroutineScope = rememberCoroutineScope()

    Box(modifier = Modifier.fillMaxSize()) {
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            OnboardingPageContent(pages[page])
        }

        // Indicators + Button at bottom
        Column(
            modifier = Modifier.align(Alignment.BottomCenter).padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Page indicators
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                pages.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .size(if (pagerState.currentPage == index) 24.dp else 8.dp, 8.dp)
                            .clip(CircleShape)
                            .background(
                                if (pagerState.currentPage == index) pages[index].color
                                else Color.Gray.copy(0.3f)
                            )
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // Button
            if (pagerState.currentPage == pages.size - 1) {
                Button(
                    onClick = onComplete,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Let's Go! 🚀", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            } else {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    TextButton(onClick = onComplete) { Text("Skip") }
                    Button(onClick = {
                        coroutineScope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                    }) { Text("Next") }
                }
            }
        }
    }
}

@Composable
fun OnboardingPageContent(page: OnboardingPage) {
    Column(
        modifier = Modifier.fillMaxSize().padding(48.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(page.emoji, fontSize = 72.sp)
        Spacer(Modifier.height(32.dp))
        Text(page.title, fontSize = 24.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(16.dp))
        Text(page.description, fontSize = 16.sp, textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurface.copy(0.7f), lineHeight = 24.sp)
    }
}
