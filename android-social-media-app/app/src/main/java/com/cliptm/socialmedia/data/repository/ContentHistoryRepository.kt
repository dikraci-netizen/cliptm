package com.cliptm.socialmedia.data.repository

import com.cliptm.socialmedia.data.local.dao.ContentDao
import com.cliptm.socialmedia.data.local.entity.ContentEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContentHistoryRepository @Inject constructor(
    private val contentDao: ContentDao
) {
    fun getAllContent(): Flow<List<ContentEntity>> = contentDao.getAllContent()
    fun getFavorites(): Flow<List<ContentEntity>> = contentDao.getFavorites()
    fun getByPlatform(platform: String): Flow<List<ContentEntity>> = contentDao.getByPlatform(platform)
    fun getByLanguage(language: String): Flow<List<ContentEntity>> = contentDao.getByLanguage(language)
    fun searchContent(query: String): Flow<List<ContentEntity>> = contentDao.searchContent(query)
    fun getContentCount(): Flow<Int> = contentDao.getContentCount()

    suspend fun saveContent(content: ContentEntity) = contentDao.insert(content)
    suspend fun saveAll(contents: List<ContentEntity>) = contentDao.insertAll(contents)
    suspend fun toggleFavorite(id: String, isFavorite: Boolean) = contentDao.toggleFavorite(id, isFavorite)
    suspend fun deleteContent(id: String) = contentDao.softDelete(id)
    suspend fun getById(id: String): ContentEntity? = contentDao.getById(id)
}
