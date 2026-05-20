package com.cliptm.socialmedia.service

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.cliptm.socialmedia.R
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Service for scheduling post reminders and auto-posting notifications.
 */
@Singleton
class SchedulerService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val CHANNEL_ID = "cliptm_scheduler"
        const val CHANNEL_NAME = "Post Reminders"
        const val EXTRA_POST_ID = "post_id"
        const val EXTRA_PLATFORM = "platform"
        const val EXTRA_CONTENT = "content_preview"
    }

    init { createNotificationChannel() }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Reminders for scheduled social media posts" }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    fun scheduleReminder(postId: String, platform: String, content: String, timeMillis: Long) {
        val intent = Intent(context, PostReminderReceiver::class.java).apply {
            putExtra(EXTRA_POST_ID, postId)
            putExtra(EXTRA_PLATFORM, platform)
            putExtra(EXTRA_CONTENT, content.take(100))
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, postId.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val alarmManager = context.getSystemService(AlarmManager::class.java)
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMillis, pendingIntent)
    }

    fun cancelReminder(postId: String) {
        val intent = Intent(context, PostReminderReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context, postId.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val alarmManager = context.getSystemService(AlarmManager::class.java)
        alarmManager.cancel(pendingIntent)
    }
}

class PostReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val postId = intent.getStringExtra(SchedulerService.EXTRA_POST_ID) ?: return
        val platform = intent.getStringExtra(SchedulerService.EXTRA_PLATFORM) ?: ""
        val content = intent.getStringExtra(SchedulerService.EXTRA_CONTENT) ?: ""

        val notification = NotificationCompat.Builder(context, SchedulerService.CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Time to post on $platform!")
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(postId.hashCode(), notification)
    }
}
