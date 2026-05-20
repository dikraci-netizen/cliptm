package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.AnalyticsEventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AnalyticsDao {
    @Query("SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentEvents(limit: Int = 100): Flow<List<AnalyticsEventEntity>>

    @Query("SELECT COUNT(*) FROM analytics_events WHERE eventType = :type")
    fun getEventCount(type: String): Flow<Int>

    @Query("SELECT COUNT(*) FROM analytics_events WHERE timestamp > :since")
    fun getEventCountSince(since: Long): Flow<Int>

    @Query("SELECT platform, COUNT(*) as count FROM analytics_events WHERE eventType = 'content_generated' GROUP BY platform ORDER BY count DESC")
    fun getTopPlatforms(): Flow<List<PlatformCount>>

    @Query("SELECT language, COUNT(*) as count FROM analytics_events WHERE eventType = 'content_generated' GROUP BY language ORDER BY count DESC")
    fun getTopLanguages(): Flow<List<LanguageCount>>

    @Query("SELECT provider, COUNT(*) as count FROM analytics_events GROUP BY provider ORDER BY count DESC")
    fun getProviderUsage(): Flow<List<ProviderCount>>

    @Query("SELECT SUM(tokensUsed) FROM analytics_events WHERE timestamp > :since")
    fun getTotalTokensSince(since: Long): Flow<Int?>

    @Query("SELECT AVG(responseTime) FROM analytics_events WHERE success = 1 AND timestamp > :since")
    fun getAvgResponseTime(since: Long): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(event: AnalyticsEventEntity)

    @Query("DELETE FROM analytics_events WHERE timestamp < :before")
    suspend fun deleteOlderThan(before: Long)
}

data class PlatformCount(val platform: String, val count: Int)
data class LanguageCount(val language: String, val count: Int)
data class ProviderCount(val provider: String, val count: Int)
