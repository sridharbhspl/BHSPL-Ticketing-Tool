from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = (
        ('STATUS', 'Status Change'),
        ('CREATE', 'New Ticket'),
        ('WORKLOG', 'Worklog Entry'),
        ('UPDATE', 'Ticket Update'),
        ('COMMENT', 'New Comment'),
        ('LEAVE', 'Leave Request'),
        ('SYSTEM', 'System Alert'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications', db_index=True
    )
    actor_name = models.CharField(max_length=255)
    actor_avatar = models.URLField(max_length=500, blank=True, null=True)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    # NOTE: `timestamp` removed — duplicate of `created_at` (both were auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            # Bell dropdown — unread notifications for a user
            models.Index(fields=['user', 'is_read'], name='idx_notification_user_read'),
            # Filter by type (STATUS, WORKLOG, etc.)
            models.Index(fields=['user', 'type'], name='idx_notification_user_type'),
        ]

    def __str__(self):
        return f"Notification for {self.user.name}: {str(self.message)[:40]}"

