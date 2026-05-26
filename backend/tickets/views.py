from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Ticket, SubTask, Comment, Attachment, AuditLog, LeaveRequest, AttendanceSession
from .serializers import (
    TicketSerializer, SubTaskSerializer, CommentSerializer, AttachmentSerializer, AuditLogSerializer,
    LeaveRequestSerializer, AttendanceSessionSerializer
)
from projects.models import Project
from notifications.utils import send_ticket_notification

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('project', 'assignee', 'reporter').prefetch_related('comments', 'subtasks', 'ticket_attachments', 'audit_logs').all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _map_camel_to_snake(self, data):
        """Map frontend camelCase fields to backend snake_case fields."""
        mapping = {
            'projectId': 'project_id',
            'assigneeId': 'assignee_id',
            'reporterId': 'reporter_id',
            'assignedTeam': 'assigned_team',
            'requesterName': 'requester_name',
            'requesterEmail': 'requester_email',
            'requesterPhone': 'requester_phone',
            'usersAffected': 'users_affected',
            'dueDate': 'due_date',
            'slaDueDate': 'sla_due_date',
        }
        mapped = {}
        for key, value in data.items():
            mapped[mapping.get(key, key)] = value

        # Clean empty foreign key relation IDs to None
        for fk in ['assignee_id', 'reporter_id', 'project_id']:
            if fk in mapped and (mapped[fk] == '' or mapped[fk] is None):
                mapped[fk] = None

        # Map frontend status with spaces to database choices keys
        if 'status' in mapped:
            status_map = {
                'In Progress': 'InProgress',
                'In Review': 'InReview',
            }
            mapped['status'] = status_map.get(mapped['status'], mapped['status'])

        # Remove read-only / nested fields
        for field in ['technicalInfo', 'assignee', 'reporter', 'commentsCount', 'subtasksCount', 'createdAt', 'updatedAt', 'ticketAttachments', 'auditLogs']:
            mapped.pop(field, None)
        return mapped

    def create(self, request, *args, **kwargs):
        mapped_data = self._map_camel_to_snake(request.data.copy())
        mapped_data['reporter_id'] = request.user.id

        # Fallback self-healing: if project_id is missing or doesn't exist, auto-assign default GS project
        if not mapped_data.get('project_id') or not Project.objects.filter(id=mapped_data['project_id']).exists():
            default_proj, _ = Project.objects.get_or_create(
                id="general-support",
                defaults={
                    "name": "General Support",
                    "description": "Default project for general IT support tickets.",
                    "code": "GS",
                    "color": "#3b82f6",
                    "icon": "LifeBuoy"
                }
            )
            mapped_data['project_id'] = default_proj.id

        # Save technical fingerprint if present in request
        tech_info = request.data.get('technicalInfo', {})
        if tech_info:
            mapped_data['browser'] = tech_info.get('browser')
            mapped_data['os'] = tech_info.get('os')
            mapped_data['device'] = tech_info.get('device')

        ticket = Ticket(**{k: v for k, v in mapped_data.items()})
        ticket.save()
        
        # Log initial creation
        AuditLog.objects.create(
            ticket=ticket,
            actor=request.user,
            action="ticket_created",
            field_changed="id",
            old_value="",
            new_value=ticket.id
        )
        
        # Trigger dynamic emails & in-app database notifications
        try:
            send_ticket_notification(ticket, 'CREATE', request.user)
        except Exception as notif_exc:
            print(f"⚠️ Notification trigger failed: {notif_exc}")

        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        mapped_data = self._map_camel_to_snake(request.data.copy())
        instance = self.get_object()
        
        # Audit Log Tracking
        tracked_fields = ['status', 'priority', 'assignee_id', 'title', 'description', 'due_date']
        changes = []
        for field in tracked_fields:
            if field in mapped_data:
                old_val = str(getattr(instance, field) or '')
                new_val = str(mapped_data[field] or '')
                if old_val != new_val:
                    changes.append((field, old_val, new_val))

        for attr, value in mapped_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Save changes to AuditLog
        for field, old_val, new_val in changes:
            AuditLog.objects.create(
                ticket=instance,
                actor=request.user,
                action=f"{field}_updated",
                field_changed=field,
                old_value=old_val,
                new_value=new_val
            )

        # Trigger dynamic emails & in-app database notifications
        if changes:
            try:
                has_status_change = any(c[0] == 'status' for c in changes)
                event_type = 'STATUS' if has_status_change else 'UPDATE'
                send_ticket_notification(instance, event_type, request.user, changes=changes)
            except Exception as notif_exc:
                print(f"⚠️ Notification trigger failed: {notif_exc}")

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        ticket = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(author=request.user, ticket=ticket)
            
            # Trigger dynamic in-app and email notifications
            try:
                from notifications.utils import send_generic_notification
                recipients = set()
                if ticket.assignee:
                    recipients.add(ticket.assignee)
                if ticket.reporter:
                    recipients.add(ticket.reporter)
                for m in ticket.project.members.all():
                    if m.user:
                        recipients.add(m.user)
                
                comment_content = serializer.validated_data.get('content', '')
                send_generic_notification(
                    event_type='WORKLOG',
                    actor=request.user,
                    title=f"New Comment on Ticket #{ticket.id}",
                    message_text=f"commented on ticket {ticket.id}: \"{comment_content[:100]}...\"",
                    recipients=recipients,
                    target_id=ticket.id,
                    extra_html=f"<blockquote style='border-left: 4px solid #f59e0b; padding-left: 15px; margin: 15px 0; color: #cbd5e1; font-style: italic;'>\"{comment_content}\"</blockquote>"
                )
            except Exception as e:
                print(f"⚠️ Comment notification failed: {e}")
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_subtask(self, request, pk=None):
        ticket = self.get_object()
        serializer = SubTaskSerializer(data=request.data)
        if serializer.is_valid():
            subtask = serializer.save(ticket=ticket)
            
            # Trigger dynamic in-app and email notifications (Worklogs)
            try:
                from notifications.utils import send_generic_notification
                recipients = set()
                if ticket.assignee:
                    recipients.add(ticket.assignee)
                if ticket.reporter:
                    recipients.add(ticket.reporter)
                for m in ticket.project.members.all():
                    if m.user:
                        recipients.add(m.user)
                
                subtask_title = serializer.validated_data.get('title', 'SubTask')
                hours = serializer.validated_data.get('hours_worked', 0)
                work_done = serializer.validated_data.get('work_done_today', '')
                
                send_generic_notification(
                    event_type='WORKLOG',
                    actor=request.user,
                    title=f"New Worklog Added to Ticket #{ticket.id}",
                    message_text=f"logged {hours} hours on ticket {ticket.id}: \"{subtask_title}\"",
                    recipients=recipients,
                    target_id=ticket.id,
                    extra_html=f"""
                    <div style='margin-top: 15px;'>
                        <p style='color: #cbd5e1; font-size: 14px;'><strong>Hours Logged:</strong> {hours} hrs</p>
                        <p style='color: #cbd5e1; font-size: 14px;'><strong>Activities:</strong> {work_done}</p>
                    </div>
                    """
                )
            except Exception as e:
                print(f"⚠️ Subtask/Worklog notification failed: {e}")
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubTaskViewSet(viewsets.ModelViewSet):
    queryset = SubTask.objects.select_related('ticket', 'assigned_engineer').all()
    serializer_class = SubTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('ticket', 'author').all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.select_related('ticket', 'uploaded_by').all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('ticket', 'actor').all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('user').all().order_by('-created_at')
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role not in ['Admin', 'Project Manager']:
            return qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        import datetime
        initial_log = {
            "id": f"WFL-SUB-{int(datetime.datetime.now().timestamp())}",
            "stage": "Request Submitted",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": datetime.datetime.now().isoformat(),
            "message": "Leave request applied. Auto-routed to Project Manager for L1 approval."
        }
        serializer.save(user=user, workflow_logs=[initial_log])

    @action(detail=True, methods=['post'], url_path='approve-l1')
    def approve_l1(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if user.role not in ['Admin', 'Project Manager']:
            return Response({"detail": "Only managers/admins can L1-approve."}, status=status.HTTP_403_FORBIDDEN)
        
        import datetime
        now_str = datetime.datetime.now().isoformat()
        new_log = {
            "id": f"WFL-L1-{int(datetime.datetime.now().timestamp())}",
            "stage": "L1 Approved",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": now_str,
            "message": f"L1 Approval completed by {user.name or user.email}. Forwarded to HR L2 check."
        }
        
        leave.status = 'Pending L2 (HR) Approval'
        if not isinstance(leave.workflow_logs, list):
            leave.workflow_logs = []
        leave.workflow_logs.append(new_log)
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['post'], url_path='approve-l2')
    def approve_l2(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if user.role != 'Admin':
            return Response({"detail": "Only HR admins can L2-sign-off."}, status=status.HTTP_403_FORBIDDEN)
        
        import datetime
        now_str = datetime.datetime.now().isoformat()
        new_log = {
            "id": f"WFL-L2-{int(datetime.datetime.now().timestamp())}",
            "stage": "L2 Final Approval",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": now_str,
            "message": f"L2 compliance sign-off finalized by HR admin {user.name or user.email}."
        }
        
        leave.status = 'Approved'
        if not isinstance(leave.workflow_logs, list):
            leave.workflow_logs = []
        leave.workflow_logs.append(new_log)
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_leave(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if user.role not in ['Admin', 'Project Manager']:
            return Response({"detail": "Unauthorized to reject requests."}, status=status.HTTP_403_FORBIDDEN)
        
        import datetime
        now_str = datetime.datetime.now().isoformat()
        new_log = {
            "id": f"WFL-REJ-{int(datetime.datetime.now().timestamp())}",
            "stage": "Leave Rejected",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": now_str,
            "message": f"Request was officially rejected by {user.name or user.email}."
        }
        
        leave.status = 'Rejected'
        if not isinstance(leave.workflow_logs, list):
            leave.workflow_logs = []
        leave.workflow_logs.append(new_log)
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_leave(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if leave.user != user and user.role != 'Admin':
            return Response({"detail": "You do not have permission to cancel this leave request."}, status=status.HTTP_403_FORBIDDEN)
        if leave.status not in ['Pending L1 Approval', 'Pending L2 (HR) Approval']:
            return Response({"detail": "Only pending leave requests can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        import datetime
        now_str = datetime.datetime.now().isoformat()
        new_log = {
            "id": f"WFL-CAN-{int(datetime.datetime.now().timestamp())}",
            "stage": "Request Cancelled",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": now_str,
            "message": f"Leave request retract initiated. Cancelled by {user.name or user.email}."
        }
        leave.status = 'Cancelled'
        if not isinstance(leave.workflow_logs, list):
            leave.workflow_logs = []
        leave.workflow_logs.append(new_log)
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    def partial_update(self, request, *args, **kwargs):
        leave = self.get_object()
        user = request.user
        if leave.user != user and user.role != 'Admin':
            return Response({"detail": "You do not have permission to edit this leave request."}, status=status.HTTP_403_FORBIDDEN)
        if leave.status not in ['Pending L1 Approval', 'Pending L2 (HR) Approval']:
            return Response({"detail": "Only pending leave requests can be modified."}, status=status.HTTP_400_BAD_REQUEST)
        
        import datetime
        now_str = datetime.datetime.now().isoformat()
        original_status = leave.status
        new_status = 'Pending L1 Approval'
        
        edit_log = {
            "id": f"WFL-EDIT-{int(datetime.datetime.now().timestamp())}",
            "stage": "Request Modified",
            "actorName": user.name or user.email,
            "actorRole": user.role,
            "timestamp": now_str,
            "message": f"Leave request details modified. Approval vetting flow reset to L1 Manager Vetting." if original_status == 'Pending L2 (HR) Approval' else "Leave request details modified."
        }
        
        # Keep track of updated fields and map camelCase to snake_case if frontend passes camelCase
        data = request.data.copy()
        mapped_data = {}
        mapping = {
            'leaveType': 'leave_type',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'duration': 'duration',
            'reason': 'reason'
        }
        for k, v in data.items():
            mapped_data[mapping.get(k, k)] = v

        serializer = self.get_serializer(leave, data=mapped_data, partial=True)
        if serializer.is_valid():
            updated_logs = list(leave.workflow_logs) if isinstance(leave.workflow_logs, list) else []
            updated_logs.append(edit_log)
            serializer.save(status=new_status, workflow_logs=updated_logs)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.select_related('user').all().order_by('-created_at')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role not in ['Admin', 'Project Manager']:
            return qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


