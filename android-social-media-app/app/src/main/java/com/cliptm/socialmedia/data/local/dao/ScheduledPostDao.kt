package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.ScheduledPostEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ScheduledPostDao {
    @Query("SELECT * FROM scheduled_posts WHERE status = 'pending' ORDER BY scheduledTime ASC")
    fun getPendingPosts(): Flow<List<ScheduledPostEntity>>

    @Query("SELECT * FROM scheduled_posts ORDER BY scheduledTime DESC")
    fun getAllPosts(): Flow<List<ScheduledPostEntity>>

    @Query("SELECT * FROM scheduled_posts WHERE scheduledTime BETWEEN :start AND :end")
    fun getPostsInRange(start: Long, end: Long): Flow<List<ScheduledPostEntity>>

    @Query("SELECT * FROM scheduled_posts WHERE id = :id")
    suspend fun getById(id: String): ScheduledPostEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(post: ScheduledPostEntity)

    @Update
    suspend fun update(post: ScheduledPostEntity)

    @Query("UPDATE scheduled_posts SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: String, status: String)

    @Delete
    suspend fun delete(post: ScheduledPostEntity)

    @Query("SELECT COUNT(*) FROM scheduled_posts WHERE status = 'pending'")
    fun getPendingCount(): Flow<Int>
}
