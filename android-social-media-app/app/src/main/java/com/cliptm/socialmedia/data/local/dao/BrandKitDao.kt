package com.cliptm.socialmedia.data.local.dao

import androidx.room.*
import com.cliptm.socialmedia.data.local.entity.BrandKitEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BrandKitDao {
    @Query("SELECT * FROM brand_kits ORDER BY isDefault DESC, createdAt DESC")
    fun getAllBrandKits(): Flow<List<BrandKitEntity>>

    @Query("SELECT * FROM brand_kits WHERE isDefault = 1 LIMIT 1")
    suspend fun getDefaultBrandKit(): BrandKitEntity?

    @Query("SELECT * FROM brand_kits WHERE id = :id")
    suspend fun getById(id: String): BrandKitEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(brandKit: BrandKitEntity)

    @Update
    suspend fun update(brandKit: BrandKitEntity)

    @Query("UPDATE brand_kits SET isDefault = 0")
    suspend fun clearDefaults()

    @Query("UPDATE brand_kits SET isDefault = 1 WHERE id = :id")
    suspend fun setDefault(id: String)

    @Delete
    suspend fun delete(brandKit: BrandKitEntity)
}
