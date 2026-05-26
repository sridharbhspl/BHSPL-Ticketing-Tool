from django.db import models
from django.conf import settings
from projects.models import Project


class Team(models.Model):
    """
    Industry Pattern: Organizational unit within a project.
    Teams group users together for collaborative work on specific areas.
    """
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True, related_name='teams'
    )
    description = models.TextField(blank=True, default='')
    color = models.CharField(max_length=20, default='#3b82f6')
    icon = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.project.name if self.project else 'Global'})"


class TeamMember(models.Model):
    """
    Industry Pattern: Explicit team membership with role hierarchy.
    Supports Lead (for escalation) and Member (for standard work).
    """
    ROLE_CHOICES = (
        ('Lead', 'Lead'),
        ('Member', 'Member'),
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('team', 'user')
        ordering = ['role', 'user__name']

    def __str__(self):
        return f"{self.user.name} → {self.team.name} ({self.role})"
