from rest_framework import viewsets, permissions
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.prefetch_related('members__user', 'project').all().order_by('name')
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        team = serializer.save()
        
        # Auto-add creator as Lead dynamically
        TeamMember.objects.get_or_create(
            team=team,
            user=self.request.user,
            defaults={"role": "Lead"}
        )
        
        # Trigger dynamic notification and email
        try:
            from notifications.utils import send_generic_notification
            recipients = []
            if team.project:
                recipients = [m.user for m in team.project.members.all() if m.user]
            send_generic_notification(
                event_type='CREATE',
                actor=self.request.user,
                title="New Collaborative Team Formed",
                message_text=f"created the team \"{team.name}\" inside project \"{team.project.name if team.project else 'Global'}\"",
                recipients=recipients,
                target_id=team.id,
                extra_html=f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Description:</strong> {team.description}</p>"
            )
        except Exception as e:
            print(f"⚠️ Team create notification failed: {e}")

    def perform_update(self, serializer):
        team = serializer.save()
        
        # Trigger dynamic notification and email
        try:
            from notifications.utils import send_generic_notification
            recipients = []
            if team.project:
                recipients = [m.user for m in team.project.members.all() if m.user]
            send_generic_notification(
                event_type='UPDATE',
                actor=self.request.user,
                title="Team Operational Parameters Updated",
                message_text=f"updated settings/details for team \"{team.name}\" inside project \"{team.project.name if team.project else 'Global'}\"",
                recipients=recipients,
                target_id=team.id,
                extra_html=f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Description:</strong> {team.description}</p>"
            )
        except Exception as e:
            print(f"⚠️ Team update notification failed: {e}")

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.select_related('team', 'user').all()
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
