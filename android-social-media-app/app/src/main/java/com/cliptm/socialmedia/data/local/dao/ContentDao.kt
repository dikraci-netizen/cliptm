package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.ContentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContentDao {
    @Query("SELECT * FROM content WHERE isDeleted = 0 ORDER BY createdAt DESC")
    fun getAllContent(): Flow<List<ContentEntity>>

    @Query("SELECT * FROM content WHERE isFavorite = 1 AND isDeleted = 0 ORDER BY createdAt DESC")
    fun getFavorites(): Flow<List<ContentEntity>>

    @Query("SELECT * FROM content WHERE platform = :platform AND isDeleted = 0 ORDER BY createdAt DESC")
    fun getByPlatform(platform: String): Flow<List<ContentEntity>>

    @Query("SELECT * FROM content WHERE language = :language AND isDeleted = 0 ORDER BY createdAt DESC")
    fun getByLanguage(language: String): Flow<List<ContentEntity>>

    @Query("SELECT * FROM content WHERE textContent LIKE '%' || :query || '%' AND isDeleted = 0")
    fun searchContent(query: String): Flow<List<ContentEntity>>

    @Query("SELECT * FROM content WHERE id = :id")
    suspend fun getById(id: String): ContentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(content: ContentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(contents: List<ContentEntity>)

    @Update
    suspend fun update(content: ContentEntity)

    @Query("UPDATE content SET isFavorite = :isFavorite WHERE id = :id")
    suspend fun toggleFavorite(id: String, isFavorite: Boolean)

    @Query("UPDATE content SET isDeleted = 1 WHERE id = :id")
    suspend fun softDelete(id: String)

    @Query("DELETE FROM content WHERE isDeleted = 1")
    suspend fun clearDeleted()

    @Query("SELECT COUNT(*) FROM content WHERE isDeleted = 0")
    fun getContentCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM content WHERE createdAt > :since AND isDeleted = 0")
    fun getContentCountSince(since: Long): Flow<Int>
}
