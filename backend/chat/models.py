from django.db import models
from django.conf import settings
from projects.models import Project

class Channel(models.Model):
    TYPE_CHOICES = (
        ('public', 'public'),
        ('private', 'private'),
        ('project', 'project'),
        ('team', 'team'),
    )
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='channels')
    team_name = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    TYPE_CHOICES = (
        ('text', 'text'),
        ('system', 'system'),
        ('file', 'file'),
    )
    
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    status = models.CharField(max_length=20, default='sent') # sent | delivered | read
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='text')
    attachments = models.JSONField(default=list)
    timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.name}: {self.content[:20]}"
