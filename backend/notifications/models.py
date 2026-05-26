from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor_name = models.CharField(max_length=255)
    actor_avatar = models.URLField(max_length=500, blank=True, null=True)
    message = models.TextField()
    type = models.CharField(max_length=50) # STATUS | CREATE | WORKLOG | UPDATE
    is_read = models.BooleanField(default=False)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.name}: {str(self.message)[:20]}"
