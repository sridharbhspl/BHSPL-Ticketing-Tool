import os
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
from .models import Notification
from projects.models import ProjectMember
from teams.models import Team, TeamMember

STATUS_LABELS = {
    'Open': 'Open',
    'InProgress': 'In Progress',
    'Blocked': 'Blocked',
    'InReview': 'In Review',
    'Resolved': 'Resolved',
    'Closed': 'Closed'
}

def send_ticket_notification(ticket, event_type, actor, changes=None):
    """
    Gold Standard Unified Notification System.
    1. Creates dynamic in-app database notifications for key ticket users.
    2. Compiles and sends premium, visually stunning HTML transactional emails dynamically.
    """
    recipients = set()
    if ticket.assignee:
        recipients.add(ticket.assignee)
    if ticket.reporter:
        recipients.add(ticket.reporter)
        
    # Project-level members (Owners & Members)
    try:
        project_members = ProjectMember.objects.filter(project=ticket.project).select_related('user')
        for member in project_members:
            if member.user:
                recipients.add(member.user)
    except Exception as e:
        print(f"⚠️ Error retrieving project members: {e}")
        
    # Team-level members (Leads & Members of the ticket's assigned team)
    if ticket.assigned_team:
        try:
            team = Team.objects.filter(project=ticket.project, name=ticket.assigned_team).first()
            if team:
                team_members = TeamMember.objects.filter(team=team).select_related('user')
                for member in team_members:
                    if member.user:
                        recipients.add(member.user)
        except Exception as e:
            print(f"⚠️ Error retrieving team members: {e}")

    # Exclude the initiating actor to prevent self-notification spam
    if actor in recipients:
        recipients.remove(actor)
        
    # Filter out recipients without valid emails
    recipients = {r for r in recipients if r.email}

    # Format event-specific details
    actor_display = actor.name or actor.email
    
    # Map DB choice statuses to human-readable labels
    readable_status = STATUS_LABELS.get(ticket.status, ticket.status)
    readable_priority = ticket.priority

    if event_type == 'CREATE':
        subject_suffix = "Created"
        message_text = f"created ticket {ticket.id}: \"{ticket.title}\""
        description_section = f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Description:</strong> {ticket.description}</p>"
        status_info = f"<span class='meta-badge'>Status: {readable_status}</span> <span class='meta-badge'>Priority: {readable_priority}</span>"
    elif event_type == 'STATUS':
        old_status_raw = "Open"
        new_status_raw = ticket.status
        if changes:
            for field, old, new in changes:
                if field == 'status':
                    old_status_raw = old
                    new_status_raw = new
                    
        old_status = STATUS_LABELS.get(old_status_raw, old_status_raw)
        new_status = STATUS_LABELS.get(new_status_raw, new_status_raw)
        
        subject_suffix = f"Status Transitioned to {new_status}"
        message_text = f"moved ticket {ticket.id} from \"{old_status}\" to \"{new_status}\""
        description_section = f"<p style='color: #cbd5e1; font-size: 14px;'><strong>Ticket:</strong> {ticket.title}</p>"
        status_info = (
            f"<span class='meta-badge' style='background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'>{old_status}</span> "
            f"➡️ "
            f"<span class='meta-badge' style='background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);'>{new_status}</span>"
        )
    else:
        subject_suffix = "Updated"
        change_details = []
        if changes:
            for field, old, new in changes:
                # Clean presentation formatting
                field_label = field.replace('_', ' ').title()
                old_val = STATUS_LABELS.get(old, old)
                new_val = STATUS_LABELS.get(new, new)
                change_details.append(
                    f"<li style='margin-bottom: 8px;'><strong>{field_label}:</strong> "
                    f"<span style='color: #ef4444; text-decoration: line-through; margin-right: 8px;'>{old_val}</span> "
                    f"➡️ <span style='color: #10b981; font-weight: bold;'>{new_val}</span></li>"
                )
        
        changes_html = "".join(change_details) if change_details else "<li style='color: #718096;'>General ticket updates applied.</li>"
        message_text = f"updated details for ticket {ticket.id}"
        description_section = f"""
        <div style='margin-top: 15px;'>
            <h4 style='color: #ffffff; margin-bottom: 10px; font-size: 14px;'>Applied Modifications:</h4>
            <ul style='color: #cbd5e1; padding-left: 20px; font-size: 13px; margin-top: 0;'>
                {changes_html}
            </ul>
        </div>
        """
        status_info = f"<span class='meta-badge'>Status: {readable_status}</span> <span class='meta-badge'>Priority: {readable_priority}</span>"

    subject = f"[Sri Jaya Veda Flow] Ticket #{ticket.id} - {subject_suffix}"

    for recipient in recipients:
        # 1. Save in-app notification to PostgreSQL DB
        try:
            Notification.objects.create(
                user=recipient,
                actor_name=actor_display,
                actor_avatar=getattr(actor, 'avatar', '') or '',
                message=f"{actor_display} {message_text}",
                type=event_type,
                target_id=ticket.id
            )
            print(f"✅ Created in-app notification for {recipient.email}")
        except Exception as e:
            print(f"⚠️ Failed to create in-app notification for {recipient.email}: {e}")

        # 2. Render visually stunning premium HTML Email
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #e2e8f0;
                    margin: 0;
                    padding: 40px 20px;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: #111827;
                    border: 1px solid #1f2937;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                }}
                .email-header {{
                    background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                    padding: 30px;
                    text-align: center;
                }}
                .email-header h1 {{
                    margin: 0;
                    font-size: 22px;
                    color: #000000;
                    font-weight: 800;
                    letter-spacing: 1px;
                }}
                .email-body {{
                    padding: 30px;
                    line-height: 1.6;
                }}
                .user-badge {{
                    display: inline-block;
                    background: #1f2937;
                    border: 1px solid #374151;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    color: #cbd5e1;
                }}
                .ticket-details {{
                    background: #1f2937;
                    border-left: 4px solid #f59e0b;
                    padding: 20px;
                    border-radius: 0 12px 12px 0;
                    margin: 25px 0;
                }}
                .meta-badge {{
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: bold;
                    margin-right: 8px;
                    display: inline-block;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                }}
                .email-footer {{
                    text-align: center;
                    padding: 24px;
                    background: #0b0f19;
                    border-top: 1px solid #1f2937;
                    font-size: 12px;
                    color: #6b7280;
                }}
                .btn-container {{
                    text-align: center;
                    margin: 30px 0 10px;
                }}
                a.btn {{
                    display: inline-block;
                    background: #f59e0b;
                    color: #000000;
                    font-weight: 800;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                    transition: transform 0.2s;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>SRI JAYA VEDA FLOW DIRECTIVE</h1>
                </div>
                <div class="email-body">
                    <p style="margin-top: 0; font-size: 15px; color: #cbd5e1;">Dear <strong>{recipient.name or recipient.email}</strong>,</p>
                    <div class="user-badge">
                        <span>Initiator: <strong>{actor_display}</strong></span>
                    </div>
                    <p style="color: #cbd5e1; font-size: 14px;">The following dynamic update was performed on your work assignment ticket:</p>
                    
                    <div class="ticket-details">
                        <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; margin-bottom: 12px;">Ticket #{ticket.id}</h3>
                        <p style="color: #ffffff; font-weight: bold; margin-bottom: 10px; font-size: 15px;">{ticket.title}</p>
                        {description_section}
                        <div style="margin-top: 15px;">
                            {status_info}
                        </div>
                    </div>

                    <p style="color: #9ca3af; font-size: 13px;">To inspect the task details, add a worklog, or discuss with the project unit, visit your Command Center.</p>
                    
                    <div class="btn-container">
                        <a href="http://localhost:5173/tickets" class="btn">Open Command Center</a>
                    </div>
                </div>
                <div class="email-footer">
                    <p>© 2026 Sri Jaya Veda Flow Ticketing Ecosystem. Confidential & Automated.</p>
                </div>
            </div>
        </body>
        </html>
        """
        plain_message = strip_tags(html_message)

        # 3. Send via Django Core Mail Backend
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@srijayavedaflow.com'),
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False
            )
            print(f"📧 Notification email successfully sent to {recipient.email}")
        except Exception as e:
            print(f"⚠️ Email dispatch failed to {recipient.email}: {e}")

def send_generic_notification(event_type, actor, title, message_text, recipients, target_id=None, extra_html=""):
    """
    Sends generic, high-fidelity in-app and email notifications.
    Supports Project, Team, Worklog, and other systems.
    """
    from django.utils.html import strip_tags
    from django.core.mail import send_mail
    from django.conf import settings
    from .models import Notification

    actor_display = actor.name or actor.email if actor else 'System'
    subject = f"[Sri Jaya Veda Flow] - {title}"

    for recipient in recipients:
        # Filter out recipients without valid emails
        if not recipient or not getattr(recipient, 'email', None):
            continue

        # Exclude the initiating actor to prevent self-notification spam
        if actor and recipient == actor:
            continue

        # 1. Save in-app notification to PostgreSQL DB
        try:
            Notification.objects.create(
                user=recipient,
                actor_name=actor_display,
                actor_avatar=getattr(actor, 'avatar', '') or '',
                message=message_text,
                type=event_type,
                target_id=target_id
            )
            print(f"✅ Created generic in-app notification for {recipient.email}")
        except Exception as e:
            print(f"⚠️ Failed to create generic in-app notification for {recipient.email}: {e}")

        # 2. Render visually stunning premium HTML Email
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #e2e8f0;
                    margin: 0;
                    padding: 40px 20px;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: #111827;
                    border: 1px solid #1f2937;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                }}
                .email-header {{
                    background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                    padding: 30px;
                    text-align: center;
                }}
                .email-header h1 {{
                    margin: 0;
                    font-size: 22px;
                    color: #000000;
                    font-weight: 800;
                    letter-spacing: 1px;
                }}
                .email-body {{
                    padding: 30px;
                    line-height: 1.6;
                }}
                .user-badge {{
                    display: inline-block;
                    background: #1f2937;
                    border: 1px solid #374151;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    color: #cbd5e1;
                }}
                .ticket-details {{
                    background: #1f2937;
                    border-left: 4px solid #f59e0b;
                    padding: 20px;
                    border-radius: 0 12px 12px 0;
                    margin: 25px 0;
                }}
                .email-footer {{
                    text-align: center;
                    padding: 24px;
                    background: #0b0f19;
                    border-top: 1px solid #1f2937;
                    font-size: 12px;
                    color: #6b7280;
                }}
                .btn-container {{
                    text-align: center;
                    margin: 30px 0 10px;
                }}
                a.btn {{
                    display: inline-block;
                    background: #f59e0b;
                    color: #000000;
                    font-weight: 800;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                    transition: transform 0.2s;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>SRI JAYA VEDA FLOW DIRECTIVE</h1>
                </div>
                <div class="email-body">
                    <p style="margin-top: 0; font-size: 15px; color: #cbd5e1;">Dear <strong>{recipient.name or recipient.email}</strong>,</p>
                    <div class="user-badge">
                        <span>Initiator: <strong>{actor_display}</strong></span>
                    </div>
                    <p style="color: #cbd5e1; font-size: 14px;">The following dynamic update was performed on your Sri Jaya Veda Flow ecosystem:</p>
                    
                    <div class="ticket-details">
                        <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; margin-bottom: 12px;">{title}</h3>
                        <p style="color: #ffffff; font-size: 15px; line-height: 1.5;">{message_text}</p>
                        {extra_html}
                    </div>

                    <p style="color: #9ca3af; font-size: 13px;">To inspect the update details or manage your workspace, visit your Command Center.</p>
                    
                    <div class="btn-container">
                        <a href="http://localhost:5173/" class="btn">Open Command Center</a>
                    </div>
                </div>
                <div class="email-footer">
                    <p>© 2026 Sri Jaya Veda Flow Ticketing Ecosystem. Confidential & Automated.</p>
                </div>
            </div>
        </body>
        </html>
        """
        plain_message = strip_tags(html_message)

        # 3. Send via Django Core Mail Backend
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@srijayavedaflow.com'),
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False
            )
            print(f"📧 Generic notification email successfully sent to {recipient.email}")
        except Exception as e:
            print(f"⚠️ Generic email dispatch failed to {recipient.email}: {e}")
