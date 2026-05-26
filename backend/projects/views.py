from rest_framework import viewsets, permissions
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not Project.objects.exists():
            Project.objects.get_or_create(
                id="general-support",
                defaults={
                    "name": "General Support",
                    "description": "Default project for general IT support tickets.",
                    "code": "GS",
                    "color": "#3b82f6",
                    "icon": "LifeBuoy"
                }
            )
        return Project.objects.prefetch_related('members__user').all().order_by('name')

    def perform_create(self, serializer):
        project = serializer.save()
        
        # Add creator as Owner dynamically
        ProjectMember.objects.get_or_create(
            project=project,
            user=self.request.user,
            defaults={"role": "Owner"}
        )
        
        # Trigger dynamic notification and beautiful transactional email
        try:
            from django.contrib.auth import get_user_model
            from notifications.utils import send_generic_notification
            User = get_user_model()
            recipients = User.objects.filter(is_active=True)
            send_generic_notification(
                event_type='CREATE',
                actor=self.request.user,
                title="New Project Workspace Spawned",
                message_text=f"created the project \"{project.name}\" ({project.code})",
                recipients=recipients,
                target_id=project.id,
                extra_html=f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Description:</strong> {project.description}</p>"
            )
        except Exception as e:
            print(f"⚠️ Project create notification failed: {e}")

    def perform_update(self, serializer):
        project = serializer.save()
        
        # Trigger dynamic notification and email to all users
        try:
            from django.contrib.auth import get_user_model
            from notifications.utils import send_generic_notification
            User = get_user_model()
            recipients = User.objects.filter(is_active=True)
            send_generic_notification(
                event_type='UPDATE',
                actor=self.request.user,
                title="Project Parameters Updated",
                message_text=f"updated settings/details for project \"{project.name}\"",
                recipients=recipients,
                target_id=project.id,
                extra_html=f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Description:</strong> {project.description}</p>"
            )
        except Exception as e:
            print(f"⚠️ Project update notification failed: {e}")

class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.select_related('project', 'user').all()
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

