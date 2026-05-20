package com.cliptm.socialmedia.util

/**
 * A/B Testing content generator - creates multiple variations
 * with scoring and recommendations.
 */
object ABTestGenerator {

    data class ContentVariation(
        val id: String = System.currentTimeMillis().toString(),
        val label: String, // "A", "B", "C"
        val content: String,
        val score: Int = 0, // 0-100 engagement prediction
        val hooks: List<String> = emptyList(),
        val reasoning: String = ""
    )

    data class ABTestResult(
        val variations: List<ContentVariation>,
        val recommendation: String,
        val testingTips: List<String>
    )

    /**
     * Build prompt for generating A/B test variations
     */
    fun buildABTestPrompt(
        originalContent: String,
        numberOfVariations: Int = 3,
        platform: String,
        goal: String = "engagement"
    ): String {
        return """
Generate $numberOfVariations A/B test variations of this content for $platform.
Goal: maximize $goal

Original content:
\"\"\"
$originalContent
\"\"\"

For each variation, provide:
1. The modified content
2. What was changed and why
3. Predicted engagement score (0-100)
4. The hook/first line

Format as:
[VARIATION_A]
Content: ...
Changes: ...
Score: ...
Hook: ...
[/VARIATION_A]

[VARIATION_B]
...

Also provide:
[RECOMMENDATION]
Which variation to try first and why
[/RECOMMENDATION]

[TESTING_TIPS]
- Tip 1
- Tip 2
[/TESTING_TIPS]
""".trimIndent()
    }

    /**
     * Parse A/B test results from AI response
     */
    fun parseABTestResponse(response: String): ABTestResult {
        val variations = mutableListOf<ContentVariation>()
        val labels = listOf("A", "B", "C", "D", "E")

        val variationRegex = """\[VARIATION_([A-E])\](.*?)\[/VARIATION_\1\]"""
            .toRegex(RegexOption.DOT_MATCHES_ALL)
        
        variationRegex.findAll(response).forEachIndexed { index, match ->
            val label = match.groupValues[1]
            val block = match.groupValues[2].trim()
            
            val content = extractField(block, "Content") ?: block
            val score = extractField(block, "Score")?.filter { it.isDigit() }?.toIntOrNull() ?: 50
            val hook = extractField(block, "Hook") ?: content.lines().first()

            variations.add(ContentVariation(
                label = label,
                content = content,
                score = score,
                hooks = listOf(hook),
                reasoning = extractField(block, "Changes") ?: ""
            ))
        }

        val recommendation = extractBlock(response, "RECOMMENDATION") ?: "Try Variation A first"
        val tipsBlock = extractBlock(response, "TESTING_TIPS") ?: ""
        val tips = tipsBlock.lines().filter { it.trim().startsWith("-") }
            .map { it.trim().removePrefix("-").trim() }

        return ABTestResult(
            variations = variations.ifEmpty {
                listOf(ContentVariation(label = "A", content = response, score = 50))
            },
            recommendation = recommendation,
            testingTips = tips.ifEmpty { listOf("Post at different times", "Test for 24-48 hours") }
        )
    }

    private fun extractField(block: String, field: String): String? {
        val line = block.lines().find { it.trim().startsWith("$field:", ignoreCase = true) }
        return line?.substringAfter(":")?.trim()
    }

    private fun extractBlock(text: String, tag: String): String? {
        val regex = """\[$tag\](.*?)\[/$tag\]""".toRegex(RegexOption.DOT_MATCHES_ALL)
        return regex.find(text)?.groupValues?.get(1)?.trim()
    }
}
