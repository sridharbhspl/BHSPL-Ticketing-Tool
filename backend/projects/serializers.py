from rest_framework import serializers
from .models import Project, ProjectMember
from users.serializers import UserSerializer

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    userId = serializers.IntegerField(source='user_id')
    projectId = serializers.CharField(source='project_id')
    joinedAt = serializers.DateTimeField(source='joined_at', read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'projectId', 'userId', 'user', 'role', 'joinedAt']

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'code', 'icon', 'color', 'members', 'createdAt', 'updatedAt']

