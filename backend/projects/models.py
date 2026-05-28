from django.db import models
from django.conf import settings

class Project(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    code = models.CharField(max_length=10, unique=True, db_index=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['name']

    def __str__(self):
        return self.name


class ProjectMember(models.Model):
    """
    Industry Pattern: Explicit M2M through-table for project access control.
    Allows fine-grained role assignment per user per project.
    """
    ROLE_CHOICES = (
        ('Owner', 'Owner'),
        ('Member', 'Member'),
        ('Viewer', 'Viewer'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members', db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='project_memberships', db_index=True
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')
        ordering = ['-joined_at']
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'
        indexes = [
            # Project team page — all members of a project by role
            models.Index(fields=['project', 'role'], name='idx_projectmember_project_role'),
        ]

    def __str__(self):
        return f"{self.user.name} → {self.project.name} ({self.role})"
