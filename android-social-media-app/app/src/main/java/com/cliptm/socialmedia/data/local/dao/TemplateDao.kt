package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.TemplateEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TemplateDao {
    @Query("SELECT * FROM templates ORDER BY usageCount DESC")
    fun getAllTemplates(): Flow<List<TemplateEntity>>

    @Query("SELECT * FROM templates WHERE category = :category")
    fun getByCategory(category: String): Flow<List<TemplateEntity>>

    @Query("SELECT * FROM templates WHERE platform = :platform")
    fun getByPlatform(platform: String): Flow<List<TemplateEntity>>

    @Query("SELECT * FROM templates WHERE isBuiltIn = 1")
    fun getBuiltInTemplates(): Flow<List<TemplateEntity>>

    @Query("SELECT * FROM templates WHERE isBuiltIn = 0")
    fun getCustomTemplates(): Flow<List<TemplateEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(template: TemplateEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(templates: List<TemplateEntity>)

    @Update
    suspend fun update(template: TemplateEntity)

    @Query("UPDATE templates SET usageCount = usageCount + 1 WHERE id = :id")
    suspend fun incrementUsage(id: String)

    @Delete
    suspend fun delete(template: TemplateEntity)
}
