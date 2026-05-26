from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return notifications for the logged-in user
        return self.request.user.notifications.all().order_by('-created_at')

    def perform_create(self, serializer):
        # Fallback for programmatic creation via API (though typically created via backend triggers)
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all unread notifications for the active user as read."""
        unread_notifications = request.user.notifications.filter(is_read=False)
        unread_notifications.update(is_read=True)
        return Response(
            {'status': 'success', 'message': 'All notifications marked as read'},
            status=status.HTTP_200_OK
        )
