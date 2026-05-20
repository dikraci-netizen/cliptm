package com.cliptm.socialmedia.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "content")
data class ContentEntity(
    @PrimaryKey val id: String,
    val textContent: String,
    val language: String,
    val platform: String,
    val contentType: String,
    val hashtags: List<String> = emptyList(),
    val mediaUrls: List<String> = emptyList(),
    val isFavorite: Boolean = false,
    val brandId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isDeleted: Boolean = false
)

@Entity(tableName = "scheduled_posts")
data class ScheduledPostEntity(
    @PrimaryKey val id: String,
    val contentId: String,
    val platform: String,
    val scheduledTime: Long,
    val status: String = "pending", // pending, posted, failed, cancelled
    val notifyBefore: Int = 15, // minutes before
    val recurrence: String? = null, // daily, weekly, monthly, null
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "templates")
data class TemplateEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val category: String, // niche category
    val platform: String,
    val language: String,
    val contentType: String,
    val templateText: String,
    val variables: List<String> = emptyList(), // {{brand}}, {{product}}, etc.
    val isBuiltIn: Boolean = false,
    val usageCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "brand_kits")
data class BrandKitEntity(
    @PrimaryKey val id: String,
    val name: String,
    val logoUrl: String = "",
    val primaryColor: String = "#6C63FF",
    val secondaryColor: String = "#FF6584",
    val fontFamily: String = "Default",
    val voiceGuidelines: String = "",
    val targetAudience: String = "",
    val toneOfVoice: String = "",
    val hashtags: List<String> = emptyList(),
    val isDefault: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "hashtag_sets")
data class HashtagSetEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val hashtags: List<String>,
    val platform: String,
    val engagement: String = "medium", // low, medium, high
    val isTrending: Boolean = false,
    val lastUpdated: Long = System.currentTimeMillis()
)

@Entity(tableName = "analytics_events")
data class AnalyticsEventEntity(
    @PrimaryKey val id: String,
    val eventType: String, // content_generated, image_generated, etc.
    val platform: String = "",
    val language: String = "",
    val contentType: String = "",
    val provider: String = "",
    val tokensUsed: Int = 0,
    val responseTime: Long = 0, // milliseconds
    val success: Boolean = true,
    val timestamp: Long = System.currentTimeMillis()
)
