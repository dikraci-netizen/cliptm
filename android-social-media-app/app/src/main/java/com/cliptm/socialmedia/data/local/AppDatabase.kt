package com.cliptm.socialmedia.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.cliptm.socialmedia.data.local.dao.*
import com.cliptm.socialmedia.data.local.entity.*

@Database(
    entities = [
        ContentEntity::class,
        ScheduledPostEntity::class,
        TemplateEntity::class,
        BrandKitEntity::class,
        HashtagSetEntity::class,
        AnalyticsEventEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun contentDao(): ContentDao
    abstract fun scheduledPostDao(): ScheduledPostDao
    abstract fun templateDao(): TemplateDao
    abstract fun brandKitDao(): BrandKitDao
    abstract fun hashtagSetDao(): HashtagSetDao
    abstract fun analyticsDao(): AnalyticsDao
}
