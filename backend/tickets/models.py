from django.db import models
from django.conf import settings
from projects.models import Project

class TicketType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return str(self.name)

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return str(self.name)

class Subcategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('category', 'name')
        verbose_name_plural = 'Subcategories'
        ordering = ['name']

    def __str__(self):
        return f"{self.category.name} -> {self.name}"

class Environment(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return str(self.name)

class Ticket(models.Model):
    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('InProgress', 'In Progress'),
        ('Blocked', 'Blocked'),
        ('InReview', 'In Review'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    )
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )
    TYPE_CHOICES = (
        ('Bug', 'Bug'),
        ('Feature', 'Feature'),
        ('Task', 'Task'),
        ('Improvement', 'Improvement'),
    )
    ENV_CHOICES = (
        ('Prod', 'Prod'),
        ('UAT', 'UAT'),
        ('Test', 'Test'),
        ('Dev', 'Dev'),
    )
    IMPACT_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )

    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium', db_index=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Task')
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100)
    service = models.CharField(max_length=100)
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES, default='Medium')
    users_affected = models.IntegerField(default=1)
    environment = models.CharField(max_length=20, choices=ENV_CHOICES, default='Dev')

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tickets', db_index=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_tickets', db_index=True
    )
    assigned_team = models.CharField(max_length=100, blank=True, null=True)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reported_tickets', db_index=True
    )

    requester_name = models.CharField(max_length=255)
    requester_email = models.EmailField()
    requester_phone = models.CharField(max_length=20, blank=True, null=True)

    due_date = models.DateTimeField(null=True, blank=True, db_index=True)
    sla_due_date = models.DateTimeField(null=True, blank=True)

    tags = models.JSONField(default=list)
    attachments = models.JSONField(default=list)

    # Technical fingerprint
    browser = models.CharField(max_length=100, blank=True, null=True)
    os = models.CharField(max_length=100, blank=True, null=True)
    device = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'
        ordering = ['-created_at']
        indexes = [
            # Compound index: most common query pattern — my open tickets by priority
            models.Index(fields=['assignee', 'status'], name='idx_ticket_assignee_status'),
            # Project dashboard — all tickets in a project sorted by priority
            models.Index(fields=['project', 'priority'], name='idx_ticket_project_priority'),
            # SLA breach detection — open/in-progress tickets approaching due date
            models.Index(fields=['status', 'due_date'], name='idx_ticket_status_due'),
        ]

    def __str__(self):
        return f"{self.id}: {self.title}"

class SubTask(models.Model):
    TYPE_CHOICES = (
        ('Analysis', 'Analysis'),
        ('Development', 'Development'),
        ('Testing', 'Testing'),
        ('Documentation', 'Documentation'),
        ('Review', 'Review'),
    )
    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('InProgress', 'In Progress'),
        ('Done', 'Done'),
    )

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='subtasks', db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    assigned_engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='subtasks', db_index=True
    )
    team = models.CharField(max_length=100)

    work_date = models.DateField(db_index=True)
    hours_worked = models.FloatField()
    work_done_today = models.TextField()
    pending_work = models.TextField(blank=True, null=True)
    blockers = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open', db_index=True)
    completion_percentage = models.IntegerField(default=0)

    code_branch = models.CharField(max_length=255, blank=True, null=True)
    build_version = models.CharField(max_length=100, blank=True, null=True)
    testing_status = models.CharField(max_length=50, blank=True, null=True)
    reviewed_by = models.CharField(max_length=255, blank=True, null=True)
    approval_status = models.CharField(max_length=50, blank=True, null=True)
    resolution_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Worklog / Sub-Task'
        verbose_name_plural = 'Worklogs / Sub-Tasks'
        ordering = ['-work_date', '-created_at']
        indexes = [
            # Engineer timesheet view — my worklogs by date
            models.Index(fields=['assigned_engineer', 'work_date'], name='idx_subtask_engineer_date'),
            # Ticket drill-down — all subtasks for a ticket
            models.Index(fields=['ticket', 'status'], name='idx_subtask_ticket_status'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(hours_worked__gt=0),
                name='chk_subtask_hours_positive',
                violation_error_message='Hours worked must be greater than zero.'
            ),
            models.CheckConstraint(
                condition=models.Q(completion_percentage__gte=0) & models.Q(completion_percentage__lte=100),
                name='chk_subtask_completion_range',
                violation_error_message='Completion percentage must be between 0 and 100.'
            ),
        ]

class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments', db_index=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        ordering = ['created_at']

class Attachment(models.Model):
    """
    Industry Pattern: Relational file attachment table.
    Replaces static arrays with a robust structured metadata schema.
    """
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='ticket_attachments', null=True, blank=True)
    file_url = models.URLField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes", null=True, blank=True)
    file_type = models.CharField(max_length=100, help_text="MIME type", null=True, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.file_name)

class AuditLog(models.Model):
    """
    Industry Pattern: Standard operational audit trail / event log.
    Tracks chronological modifications on resources for accountability.
    """
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    action = models.CharField(max_length=100, help_text="e.g. status_changed, priority_changed, assignee_assigned")
    field_changed = models.CharField(max_length=100, blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ticket.id} - {self.action} by {self.actor.email if self.actor else 'System'}"


class WorkLog(models.Model):
    """
    Industry Pattern: Timesheet / Work logging entry.
    Allows engineers to record hours spent, dates, and activity details per ticket.
    """
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='worklogs', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='worklogs', db_index=True)
    hours = models.FloatField(help_text='Hours worked on this task')
    date_logged = models.DateField(help_text='Date the work was done', db_index=True)
    description = models.TextField(help_text='Detailed description of activity performed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Work Log'
        verbose_name_plural = 'Work Logs'
        ordering = ['-date_logged', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date_logged'], name='idx_worklog_user_date'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(hours__gt=0),
                name='chk_worklog_hours_positive',
                violation_error_message='Hours must be greater than zero.'
            ),
        ]

    def __str__(self):
        return f"{self.user.name} logged {self.hours}h on {self.ticket.id} ({self.date_logged})"


class CustomerSatisfaction(models.Model):
    """
    Industry Pattern: CSAT Survey.
    Enables clients or requesters to rate agent performance on resolved tickets.
    """
    RATING_CHOICES = (
        (1, '1 Star - Very Poor'),
        (2, '2 Stars - Poor'),
        (3, '3 Stars - Average'),
        (4, '4 Stars - Good'),
        (5, '5 Stars - Excellent'),
    )
    ticket = models.OneToOneField(Ticket, on_delete=models.CASCADE, related_name='csat')
    rating = models.IntegerField(choices=RATING_CHOICES, help_text='Customer satisfaction rating (1-5)')
    feedback = models.TextField(blank=True, null=True, help_text='Detailed qualitative client feedback')
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='csat_submissions'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Customer Satisfaction Survey'
        verbose_name_plural = 'Customer Satisfaction Surveys'
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name='chk_csat_rating_range',
                violation_error_message='CSAT rating must be between 1 and 5.'
            ),
        ]

    def __str__(self):
        return f'CSAT {self.rating}/5 for Ticket {self.ticket.id}'


class SLABreachLog(models.Model):
    """
    Industry Pattern: Service Level Agreement Breach auditing tracker.
    Chronologically tracks and stores response/resolution SLA violations.
    """
    SLA_TYPE_CHOICES = (
        ('Response', 'Response Time SLA'),
        ('Resolution', 'Resolution Time SLA'),
    )
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='sla_breaches')
    sla_type = models.CharField(max_length=20, choices=SLA_TYPE_CHOICES)
    breached_at = models.DateTimeField(help_text="Timestamp of the SLA violation")
    is_excused = models.BooleanField(default=False, help_text="True if breach is officially excused due to external factors")
    reason = models.TextField(blank=True, null=True, help_text="Reason for SLA breach or excuse details")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-breached_at']
        verbose_name = "SLA Breach Log"
        verbose_name_plural = "SLA Breach Logs"

    def __str__(self):
        status_str = "EXCUSED" if self.is_excused else "ACTIVE"
        return f"SLA Breach [{self.sla_type}] on {self.ticket.id} - Status: {status_str}"


class LeaveRequest(models.Model):
    LEAVE_TYPES = (
        ('Casual Leave', 'Casual Leave'),
        ('Sick Leave', 'Sick Leave'),
        ('Full Day Leave', 'Full Day Leave'),
        ('Short Leave', 'Short Leave (Hourly)'),
    )
    STATUS_CHOICES = (
        ('Pending L1 Approval', 'Pending L1 Approval'),
        ('Pending L2 (HR) Approval', 'Pending L2 (HR) Approval'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='leave_requests', db_index=True
    )
    leave_type = models.CharField(max_length=30, choices=LEAVE_TYPES, default='Casual Leave')
    start_date = models.DateField(db_index=True)
    end_date = models.DateField()
    duration = models.CharField(max_length=50)
    reason = models.TextField()
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='Pending L1 Approval', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    workflow_logs = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        ordering = ['-created_at']
        indexes = [
            # HR dashboard — pending leaves by user
            models.Index(fields=['user', 'status'], name='idx_leave_user_status'),
            # Calendar view — leaves in a date range
            models.Index(fields=['start_date', 'end_date'], name='idx_leave_date_range'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F('start_date')),
                name='chk_leave_end_after_start',
                violation_error_message='End date must be on or after start date.'
            ),
        ]

    def __str__(self):
        return f"{self.user.name or self.user.email} - {self.leave_type} ({self.start_date} to {self.end_date})"


class AttendanceSession(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='attendance_sessions', db_index=True
    )
    date = models.DateField(auto_now_add=True, db_index=True)
    punch_in_time = models.CharField(max_length=50)
    punch_out_time = models.CharField(max_length=50, blank=True, null=True)
    total_work_time = models.CharField(max_length=50, default='00h 00m')
    total_break_time = models.CharField(max_length=50, default='00h 00m')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Completed', db_index=True)
    break_details = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Attendance Session'
        verbose_name_plural = 'Attendance Sessions'
        ordering = ['-date', '-created_at']
        indexes = [
            # My timesheet — user's sessions on a given date
            models.Index(fields=['user', 'date'], name='idx_attendance_user_date'),
            # HR overview — all active sessions
            models.Index(fields=['status', 'date'], name='idx_attendance_status_date'),
        ]

    def __str__(self):
        return f"{(self.user.name or self.user.email)} Shift - {self.date} ({self.total_work_time})"


