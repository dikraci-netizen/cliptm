package com.cliptm.socialmedia.util

import com.cliptm.socialmedia.data.model.ContentType
import com.cliptm.socialmedia.data.model.Language
import com.cliptm.socialmedia.data.model.Platform

/**
 * Batch content generation - generate multiple posts at once.
 */
object BatchGenerator {

    data class BatchRequest(
        val numberOfPosts: Int = 7,
        val platforms: List<Platform>,
        val languages: List<Language>,
        val contentType: ContentType = ContentType.POST,
        val theme: String = "",
        val brandName: String = "",
        val audience: String = "",
        val includeCalendar: Boolean = true
    )

    /**
     * Build prompt for batch generation (e.g., a week of content)
     */
    fun buildBatchPrompt(request: BatchRequest): String {
        val platformList = request.platforms.joinToString(", ") { it.displayName }
        val languageList = request.languages.joinToString(", ") { it.nativeName }

        return """
Generate ${request.numberOfPosts} unique ${request.contentType.displayName} posts.

Configuration:
- Platforms: $platformList
- Languages: $languageList
${if (request.brandName.isNotBlank()) "- Brand: ${request.brandName}" else ""}
${if (request.audience.isNotBlank()) "- Audience: ${request.audience}" else ""}
${if (request.theme.isNotBlank()) "- Theme/Topic: ${request.theme}" else ""}

Requirements:
- Each post should be different and cover varied angles
- Include hashtags, CTA, and best posting day/time for each
- Generate in ALL specified languages (culturally adapted)
- Mix content styles: educational, entertaining, promotional, storytelling
- Number each post clearly

${if (request.includeCalendar) """
Also provide a weekly content calendar at the end:
| Day | Platform | Type | Topic | Time |
|-----|----------|------|-------|------|
""" else ""}

Format each post as:
---
POST #[number]
Platform: [platform]
Day: [best day to post]
Time: [best time]

[Language 1 - Caption]
[Hashtags]
[CTA]

[Language 2 - Caption]
[Hashtags]
[CTA]
---
""".trimIndent()
    }

    /**
     * Build prompt for content calendar generation
     */
    fun buildCalendarPrompt(
        weeks: Int = 1,
        platforms: List<Platform>,
        languages: List<Language>,
        brandName: String = "",
        contentPillars: List<String> = emptyList()
    ): String {
        return """
Create a ${weeks}-week content calendar.

Platforms: ${platforms.joinToString(", ") { it.displayName }}
Languages: ${languages.joinToString(", ") { it.nativeName }}
${if (brandName.isNotBlank()) "Brand: $brandName" else ""}
${if (contentPillars.isNotEmpty()) "Content Pillars: ${contentPillars.joinToString(", ")}" else ""}

For each day provide:
- Platform
- Content type (Post, Reel, Story, Carousel, Thread)
- Topic/hook
- Best posting time
- Content pillar it belongs to
- Brief caption idea

Format as a table:
| Day | Date | Platform | Type | Topic | Time | Pillar |
|-----|------|----------|------|-------|------|--------|

Then provide 2-3 full post examples from the calendar.
""".trimIndent()
    }
}
