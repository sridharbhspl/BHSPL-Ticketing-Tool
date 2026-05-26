from rest_framework import serializers
from .models import Team, TeamMember
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    userId = serializers.IntegerField(source='user_id')
    teamId = serializers.IntegerField(source='team_id')
    joinedAt = serializers.DateTimeField(source='joined_at', read_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'teamId', 'userId', 'user', 'role', 'joinedAt']

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    project = ProjectSerializer(read_only=True)
    projectId = serializers.CharField(source='project_id', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'color', 'icon', 'project', 'projectId', 'members', 'createdAt', 'updatedAt']
