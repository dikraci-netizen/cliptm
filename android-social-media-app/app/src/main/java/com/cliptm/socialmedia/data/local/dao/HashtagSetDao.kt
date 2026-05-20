package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.HashtagSetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HashtagSetDao {
    @Query("SELECT * FROM hashtag_sets ORDER BY lastUpdated DESC")
    fun getAllSets(): Flow<List<HashtagSetEntity>>

    @Query("SELECT * FROM hashtag_sets WHERE category = :category")
    fun getByCategory(category: String): Flow<List<HashtagSetEntity>>

    @Query("SELECT * FROM hashtag_sets WHERE isTrending = 1")
    fun getTrending(): Flow<List<HashtagSetEntity>>

    @Query("SELECT * FROM hashtag_sets WHERE platform = :platform")
    fun getByPlatform(platform: String): Flow<List<HashtagSetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(hashtagSet: HashtagSetEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(sets: List<HashtagSetEntity>)

    @Update
    suspend fun update(hashtagSet: HashtagSetEntity)

    @Delete
    suspend fun delete(hashtagSet: HashtagSetEntity)
}
