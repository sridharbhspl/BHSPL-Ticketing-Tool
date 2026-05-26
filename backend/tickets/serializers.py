from rest_framework import serializers
from .models import Ticket, SubTask, Comment, Attachment, AuditLog, LeaveRequest, AttendanceSession
from users.serializers import UserSerializer
from projects.models import Project

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    ticketId = serializers.CharField(source='ticket_id', read_only=True)
    authorId = serializers.IntegerField(source='author_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'ticketId', 'authorId', 'author', 'content', 'createdAt']

class SubTaskSerializer(serializers.ModelSerializer):
    assigned_engineer = UserSerializer(read_only=True)
    assignedEngineerId = serializers.IntegerField(source='assigned_engineer_id')
    parentTicketId = serializers.CharField(source='ticket_id', read_only=True)
    workDate = serializers.DateField(source='work_date')
    hoursWorked = serializers.FloatField(source='hours_worked')
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    workDoneToday = serializers.CharField(source='work_done_today', allow_blank=True)
    pendingWork = serializers.CharField(source='pending_work', allow_blank=True, allow_null=True, required=False)
    blockers = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    completionPercentage = serializers.IntegerField(source='completion_percentage')
    codeBranch = serializers.CharField(source='code_branch', allow_blank=True, allow_null=True, required=False)
    buildVersion = serializers.CharField(source='build_version', allow_blank=True, allow_null=True, required=False)
    testingStatus = serializers.CharField(source='testing_status', allow_blank=True, allow_null=True, required=False)
    reviewedBy = serializers.CharField(source='reviewed_by', allow_blank=True, allow_null=True, required=False)
    approvalStatus = serializers.CharField(source='approval_status', allow_blank=True, allow_null=True, required=False)
    resolutionNotes = serializers.CharField(source='resolution_notes', allow_blank=True, allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    def to_internal_value(self, data):
        # Map frontend "In Progress" to backend choice "InProgress"
        if 'status' in data and data['status'] == 'In Progress':
            data = data.copy()
            data['status'] = 'InProgress'
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Map backend "InProgress" to frontend "In Progress"
        if 'status' in data and data['status'] == 'InProgress':
            data['status'] = 'In Progress'
        return data

    class Meta:
        model = SubTask
        fields = [
            'id', 'parentTicketId', 'title', 'description', 'type', 'team', 'status',
            'assigned_engineer', 'assignedEngineerId',
            'workDate', 'hoursWorked', 'workDoneToday', 'pendingWork', 'blockers',
            'completionPercentage', 'codeBranch', 'buildVersion',
            'testingStatus', 'reviewedBy', 'approvalStatus', 'resolutionNotes',
            'createdAt', 'updatedAt'
        ]

class AttachmentSerializer(serializers.ModelSerializer):
    uploadedBy = UserSerializer(source='uploaded_by', read_only=True)
    uploadedById = serializers.IntegerField(source='uploaded_by_id', read_only=True)
    ticketId = serializers.CharField(source='ticket_id')
    fileName = serializers.CharField(source='file_name')
    fileUrl = serializers.URLField(source='file_url')
    fileSize = serializers.IntegerField(source='file_size', required=False, allow_null=True)
    fileType = serializers.CharField(source='file_type', required=False, allow_null=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    class Meta:
        model = Attachment
        fields = ['id', 'ticketId', 'fileUrl', 'fileName', 'fileSize', 'fileType', 'uploadedBy', 'uploadedById', 'uploadedAt']

class AuditLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    actorId = serializers.IntegerField(source='actor_id', read_only=True)
    ticketId = serializers.CharField(source='ticket_id', read_only=True)
    fieldChanged = serializers.CharField(source='field_changed', read_only=True)
    oldValue = serializers.CharField(source='old_value', read_only=True)
    newValue = serializers.CharField(source='new_value', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'ticketId', 'actor', 'actorId', 'action', 'fieldChanged', 'oldValue', 'newValue', 'timestamp']

class TicketSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    reporter = UserSerializer(read_only=True)
    commentsCount = serializers.IntegerField(source='comments.count', read_only=True)
    subtasksCount = serializers.IntegerField(source='subtasks.count', read_only=True)
    projectId = serializers.CharField(source='project_id', read_only=True)
    assigneeId = serializers.IntegerField(source='assignee_id', read_only=True, allow_null=True)
    reporterId = serializers.IntegerField(source='reporter_id', read_only=True)
    assignedTeam = serializers.CharField(source='assigned_team', allow_null=True, required=False)
    requesterName = serializers.CharField(source='requester_name')
    requesterEmail = serializers.EmailField(source='requester_email')
    requesterPhone = serializers.CharField(source='requester_phone', allow_null=True, required=False)
    usersAffected = serializers.IntegerField(source='users_affected', default=1)
    dueDate = serializers.DateTimeField(source='due_date', allow_null=True, required=False)
    slaDueDate = serializers.DateTimeField(source='sla_due_date', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    technicalInfo = serializers.SerializerMethodField()
    ticketAttachments = AttachmentSerializer(source='ticket_attachments', many=True, read_only=True)
    auditLogs = AuditLogSerializer(source='audit_logs', many=True, read_only=True)

    def get_technicalInfo(self, obj):
        return {
            'browser': obj.browser or '',
            'os': obj.os or '',
            'device': obj.device or '',
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        status_map = {
            'InProgress': 'In Progress',
            'InReview': 'In Review',
        }
        if 'status' in data:
            data['status'] = status_map.get(data['status'], data['status'])
        return data

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'type',
            'category', 'subcategory', 'service', 'impact', 'usersAffected',
            'environment', 'tags', 'attachments', 'ticketAttachments', 'auditLogs',
            'projectId', 'assignee', 'assigneeId', 'assignedTeam',
            'reporter', 'reporterId',
            'requesterName', 'requesterEmail', 'requesterPhone',
            'dueDate', 'slaDueDate',
            'commentsCount', 'subtasksCount',
            'technicalInfo',
            'createdAt', 'updatedAt',
        ]


class LeaveRequestSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.name', read_only=True)
    userId = serializers.IntegerField(source='user_id', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)
    leaveType = serializers.CharField(source='leave_type')
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    workflowLogs = serializers.JSONField(source='workflow_logs', read_only=True)

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if self.instance:
            if not start_date:
                start_date = self.instance.start_date
            if not end_date:
                end_date = self.instance.end_date

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({"endDate": "End date cannot be before start date."})

        request = self.context.get('request')
        user = request.user if request else None
        if not user and self.instance:
            user = self.instance.user

        if user and start_date and end_date:
            overlapping = LeaveRequest.objects.filter(
                user=user,
                status__in=['Pending L1 Approval', 'Pending L2 (HR) Approval', 'Approved']
            )
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)

            for req in overlapping:
                if start_date <= req.end_date and end_date >= req.start_date:
                    raise serializers.ValidationError(
                        f"Date conflict: You already have an active leave request ({req.leave_type}) from {req.start_date} to {req.end_date}."
                    )

        return attrs

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'userId', 'userName', 'avatar', 'leaveType', 'startDate', 'endDate',
            'duration', 'reason', 'status', 'createdAt', 'workflowLogs'
        ]


class AttendanceSessionSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.name', read_only=True)
    userId = serializers.IntegerField(source='user_id', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)
    punchInTime = serializers.CharField(source='punch_in_time')
    punchOutTime = serializers.CharField(source='punch_out_time', required=False, allow_null=True)
    totalWorkTime = serializers.CharField(source='total_work_time')
    totalBreakTime = serializers.CharField(source='total_break_time')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'userId', 'userName', 'avatar', 'date', 'punchInTime', 'punchOutTime',
            'totalWorkTime', 'totalBreakTime', 'status', 'createdAt'
        ]


