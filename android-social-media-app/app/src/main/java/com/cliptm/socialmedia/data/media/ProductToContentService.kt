package com.cliptm.socialmedia.data.media

import com.cliptm.socialmedia.data.api.ApiProvider
import com.cliptm.socialmedia.data.api.MultiProviderService
import com.cliptm.socialmedia.data.model.Language
import com.cliptm.socialmedia.data.model.Platform
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Product content generation result
 */
data class ProductContentResult(
    val success: Boolean,
    val productName: String = "",
    val ugcScript: String = "",
    val landingPageHtml: String = "",
    val socialPosts: Map<String, String> = emptyMap(),
    val imagePrompts: List<String> = emptyList(),
    val error: String = ""
)

/**
 * Converts any product URL into marketing content:
 * - UGC Video Scripts
 * - Landing Pages (HTML)
 * - Social Media Posts (multi-platform, multi-language)
 * - Image generation prompts
 *
 * Supports product links from: Amazon, AliExpress, Shopify, Etsy, eBay,
 * Jumia, Avito, WooCommerce, or any URL.
 */
@Singleton
class ProductToContentService @Inject constructor(
    private val multiProviderService: MultiProviderService
) {
    /**
     * Generate UGC video script from product URL
     */
    suspend fun productToUGCScript(
        productUrl: String,
        productDescription: String = "",
        textProvider: ApiProvider,
        languages: List<Language> = listOf(Language.FRENCH, Language.DARIJA),
        platform: Platform = Platform.TIKTOK,
        duration: Int = 30,
        style: String = "authentic, relatable, testimonial"
    ): ProductContentResult {
        val prompt = buildUGCPrompt(productUrl, productDescription, languages, platform, duration, style)
        val messages = listOf(
            mapOf("role" to "system", "content" to UGC_SYSTEM_PROMPT),
            mapOf("role" to "user", "content" to prompt)
        )
        val result = multiProviderService.generateText(textProvider, messages, 0.85, 4000)
        return result.fold(
            onSuccess = { script -> ProductContentResult(success = true, ugcScript = script, productName = extractProductName(script)) },
            onFailure = { e -> ProductContentResult(success = false, error = e.message ?: "Failed to generate UGC script") }
        )
    }

    /**
     * Generate landing page HTML from product URL
     */
    suspend fun productToLandingPage(
        productUrl: String,
        productDescription: String = "",
        textProvider: ApiProvider,
        language: Language = Language.FRENCH,
        style: String = "modern, conversion-focused",
        includeCountdown: Boolean = true,
        includeTestimonials: Boolean = true
    ): ProductContentResult {
        val prompt = buildLandingPagePrompt(productUrl, productDescription, language, style, includeCountdown, includeTestimonials)
        val messages = listOf(
            mapOf("role" to "system", "content" to LANDING_PAGE_SYSTEM_PROMPT),
            mapOf("role" to "user", "content" to prompt)
        )
        val result = multiProviderService.generateText(textProvider, messages, 0.7, 6000)
        return result.fold(
            onSuccess = { html -> ProductContentResult(success = true, landingPageHtml = html) },
            onFailure = { e -> ProductContentResult(success = false, error = e.message ?: "Failed to generate landing page") }
        )
    }

    /**
     * Generate full marketing package from product URL
     */
    suspend fun productToFullPackage(
        productUrl: String,
        productDescription: String = "",
        textProvider: ApiProvider,
        languages: List<Language> = listOf(Language.ENGLISH, Language.FRENCH, Language.ARABIC_MSA, Language.DARIJA),
        platforms: List<Platform> = listOf(Platform.INSTAGRAM, Platform.TIKTOK, Platform.FACEBOOK)
    ): ProductContentResult {
        val prompt = buildFullPackagePrompt(productUrl, productDescription, languages, platforms)
        val messages = listOf(
            mapOf("role" to "system", "content" to FULL_PACKAGE_SYSTEM_PROMPT),
            mapOf("role" to "user", "content" to prompt)
        )
        val result = multiProviderService.generateText(textProvider, messages, 0.8, 5000)
        return result.fold(
            onSuccess = { content ->
                ProductContentResult(
                    success = true,
                    ugcScript = extractSection(content, "UGC_SCRIPT"),
                    socialPosts = extractSocialPosts(content),
                    imagePrompts = extractImagePrompts(content)
                )
            },
            onFailure = { e -> ProductContentResult(success = false, error = e.message ?: "Failed") }
        )
    }

    // ===== Prompt Builders =====

    private fun buildUGCPrompt(url: String, desc: String, languages: List<Language>, platform: Platform, duration: Int, style: String): String {
        return """
Product URL: $url
${if (desc.isNotBlank()) "Product Description: $desc" else ""}

Create a UGC (User-Generated Content) video script for ${platform.displayName}.
Duration: ${duration} seconds
Style: $style
Languages: ${languages.joinToString(", ") { it.nativeName }}

The script should feel authentic and relatable, like a real person reviewing the product.
Include:
1. Hook (first 2 seconds - attention grabber)
2. Problem statement (what issue does this solve?)
3. Product reveal + demo
4. Benefits (3 key points)
5. Social proof / personal experience
6. CTA (where to buy, link in bio, etc.)

For EACH language, provide the full script with:
- Spoken text with emotions [excited], [whisper], [confident]
- Visual directions for each scene
- Text overlays
- Sound/music suggestions

If Darija: use natural code-switching with French, Arabizi format.
""".trimIndent()
    }

    private fun buildLandingPagePrompt(url: String, desc: String, language: Language, style: String, countdown: Boolean, testimonials: Boolean): String {
        return """
Product URL: $url
${if (desc.isNotBlank()) "Product Description: $desc" else ""}
Language: ${language.nativeName}
Style: $style

Generate a complete, responsive HTML landing page for this product.
${if (language == Language.ARABIC_MSA || language == Language.DARIJA) "Direction: RTL" else "Direction: LTR"}

Include:
- Hero section with headline + subheadline + CTA button
- Product benefits (3-5 with icons)
- Product images section (placeholder divs)
${if (countdown) "- Countdown timer (JavaScript)" else ""}
${if (testimonials) "- 3 fake testimonials section" else ""}
- FAQ accordion
- Final CTA section with urgency
- Mobile responsive design
- Modern CSS (gradients, shadows, animations)
- Colors: primary #6C63FF, accent #FF6584

Output ONLY the complete HTML code (single file with inline CSS/JS).
""".trimIndent()
    }

    private fun buildFullPackagePrompt(url: String, desc: String, languages: List<Language>, platforms: List<Platform>): String {
        return """
Product URL: $url
${if (desc.isNotBlank()) "Product Description: $desc" else ""}

Generate a COMPLETE marketing package:

## 1. [UGC_SCRIPT]
30-second TikTok/Reels script (authentic testimonial style)
In: ${languages.first().nativeName}
[/UGC_SCRIPT]

## 2. [SOCIAL_POSTS]
For each platform (${platforms.joinToString(", ") { it.displayName }}):
For each language (${languages.joinToString(", ") { it.nativeName }}):
- Engaging caption
- Hashtags
- CTA
[/SOCIAL_POSTS]

## 3. [IMAGE_PROMPTS]
3 image generation prompts for product visuals:
- Product showcase
- Lifestyle/usage
- Before/After or testimonial graphic
[/IMAGE_PROMPTS]

## 4. [AD_COPY]
Facebook/Instagram ad copy (primary text + headline + description)
In ${languages.first().nativeName}
[/AD_COPY]
""".trimIndent()
    }

    // ===== Parsers =====

    private fun extractSection(text: String, tag: String): String {
        val regex = """\[$tag\](.*?)\[/$tag\]""".toRegex(RegexOption.DOT_MATCHES_ALL)
        return regex.find(text)?.groupValues?.get(1)?.trim() ?: ""
    }

    private fun extractSocialPosts(text: String): Map<String, String> {
        val section = extractSection(text, "SOCIAL_POSTS")
        return if (section.isNotBlank()) mapOf("all" to section) else emptyMap()
    }

    private fun extractImagePrompts(text: String): List<String> {
        val section = extractSection(text, "IMAGE_PROMPTS")
        return section.lines().filter { it.trim().startsWith("-") }.map { it.trim().removePrefix("-").trim() }
    }

    private fun extractProductName(text: String): String {
        val line = text.lines().find { it.contains("product", ignoreCase = true) || it.contains("produit", ignoreCase = true) }
        return line?.take(50) ?: "Product"
    }

    companion object {
        const val UGC_SYSTEM_PROMPT = """You are a UGC (User-Generated Content) video script writer specializing in authentic, relatable product reviews for social media. You create scripts that feel natural, not scripted - like a real person genuinely excited about a product. You speak multiple languages fluently including Moroccan Darija with French code-switching."""

        const val LANDING_PAGE_SYSTEM_PROMPT = """You are a conversion-focused web developer and copywriter. You create beautiful, high-converting landing pages with modern design. Output complete, valid HTML with inline CSS and JavaScript. Support RTL languages (Arabic, Hebrew). Focus on mobile-first responsive design."""

        const val FULL_PACKAGE_SYSTEM_PROMPT = """You are a full-stack digital marketing expert. You create complete marketing packages for products including UGC scripts, social media posts, ad copy, and image prompts. You work in multiple languages and adapt content culturally (not just translate). You know Moroccan Darija, Arabic MSA, French, English, and more."""
    }
}
