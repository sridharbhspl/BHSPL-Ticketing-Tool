from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actorName = serializers.CharField(source='actor_name')
    actorAvatar = serializers.URLField(source='actor_avatar', allow_blank=True, allow_null=True, required=False)
    isRead = serializers.BooleanField(source='is_read')
    targetId = serializers.CharField(source='target_id', allow_blank=True, allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actorName', 'actorAvatar', 'message', 'type', 'isRead', 'targetId', 'timestamp', 'createdAt']
