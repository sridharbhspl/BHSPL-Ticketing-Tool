import os
import django
import sys

# Defensively reconfigure console encoding to prevent charmap crashes on Windows with emojis
if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(errors='replace')
    except Exception:
        pass

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from projects.models import Project, ProjectMember
from tickets.models import Ticket, AuditLog, WorkLog, CustomerSatisfaction, SLABreachLog, TicketType, Category, Subcategory, Environment
from teams.models import Team, TeamMember

User = get_user_model()

def seed_data():
    print("🌱 Starting database seeding...")

    # Seed Categories and Subcategories
    print("🌱 Seeding Categories and Subcategories...")
    initial_categories = {
        'Technical': ['API Error', 'Database', 'Integration', 'System Crash', 'UI/UX'],
        'Access': ['Password Reset', 'New Account', 'Permissions', 'SSO Issue'],
        'Billing': ['Invoice', 'Payment Failure', 'Refund', 'Subscription'],
        'Other': ['Feedback', 'Feature Request', 'General Inquiry']
    }
    for cat_name, subcats in initial_categories.items():
        cat, _ = Category.objects.get_or_create(name=cat_name)
        for sub_name in subcats:
            Subcategory.objects.get_or_create(category=cat, name=sub_name)

    # Seed Ticket Types
    print("🌱 Seeding Ticket Types...")
    initial_types = ['Incident', 'Bug', 'Task', 'Improvement']
    for type_name in initial_types:
        TicketType.objects.get_or_create(name=type_name)

    # Seed Environments
    print("🌱 Seeding Environments...")
    initial_environments = ['Prod', 'UAT', 'Test', 'Dev']
    for env_name in initial_environments:
        Environment.objects.get_or_create(name=env_name)


    # 1. Create a Default Project
    project, created = Project.objects.get_or_create(
        id="general-support",
        defaults={
            "name": "General Support",
            "description": "Default project for general IT support tickets.",
            "code": "GS",
            "color": "#3b82f6",
            "icon": "LifeBuoy"
        }
    )
    if created:
        print(f"✅ Created Project: {project.name}")
    else:
        print(f"ℹ️ Project {project.name} already exists.")

    # 2. Create a Default Admin User
    admin_email = "admin@example.com"
    admin_user = None
    if not User.objects.filter(email=admin_email).exists():
        admin_user = User.objects.create_superuser(
            email=admin_email,
            password="adminpassword123",
            name="System Admin",
            role="Admin"
        )
        print(f"✅ Created Superuser: {admin_email} (Password: adminpassword123)")
    else:
        admin_user = User.objects.get(email=admin_email)
        print(f"ℹ️ Superuser {admin_email} already exists.")

    # 3. Create Project Membership
    pm, pm_created = ProjectMember.objects.get_or_create(
        project=project,
        user=admin_user,
        defaults={"role": "Owner"}
    )
    if pm_created:
        print("✅ Added Admin as Project Owner")

    # 4. Create a Default Team
    team, team_created = Team.objects.get_or_create(
        name="L1 Support",
        defaults={
            "project": project,
            "description": "First-line customer support team.",
            "color": "#10b981",
            "icon": "Users"
        }
    )
    if team_created:
        print(f"✅ Created Team: {team.name}")

    # 5. Create Team Membership
    tm, tm_created = TeamMember.objects.get_or_create(
        team=team,
        user=admin_user,
        defaults={"role": "Lead"}
    )
    if tm_created:
        print("✅ Added Admin as Team Lead of L1 Support")

    # 6. Create a Sample Ticket
    if not Ticket.objects.filter(id="TKT-001").exists():
        ticket = Ticket.objects.create(
            id="TKT-001",
            title="Initial System Setup",
            description="Welcome to your new Ticketing Tool! This is a sample ticket.",
            status="Open",
            priority="Low",
            type="Task",
            category="System",
            subcategory="Setup",
            service="Core",
            project=project,
            reporter=admin_user,
            requester_name="System",
            requester_email="system@internal.local"
        )
        print("✅ Created Sample Ticket: TKT-001")
        
        # Initial Audit Log
        AuditLog.objects.create(
            ticket=ticket,
            actor=admin_user,
            action="ticket_created",
            field_changed="id",
            old_value="",
            new_value=ticket.id
        )

        # 7. Create Work Logs
        from datetime import date
        wl1 = WorkLog.objects.create(
            ticket=ticket,
            user=admin_user,
            hours=4.5,
            date_logged=date(2026, 5, 20),
            description="Initial system research, architecture design, and database configuration outline."
        )
        wl2 = WorkLog.objects.create(
            ticket=ticket,
            user=admin_user,
            hours=2.0,
            date_logged=date(2026, 5, 21),
            description="Configuring environment files and initial Django model declarations."
        )
        print("✅ Created Sample Work Logs for TKT-001")

        # 8. Create SLA Breach Log
        from django.utils import timezone
        sla = SLABreachLog.objects.create(
            ticket=ticket,
            sla_type="Response",
            breached_at=timezone.now(),
            is_excused=True,
            reason="Response was delayed because of client authentication credentials verification delay."
        )
        print("✅ Created Sample SLA Breach Log for TKT-001")

        # 9. Create Customer Satisfaction Feedback (CSAT)
        csat = CustomerSatisfaction.objects.create(
            ticket=ticket,
            rating=5,
            feedback="Extremely fast response and resolution. The support engineer was very knowledgeable and solved the initial setup flawlessly!",
            submitted_by=admin_user
        )
        print("✅ Created Sample Customer Satisfaction Survey for TKT-001")

    print("🏁 Seeding complete! You can now log in with admin@example.com")

if __name__ == "__main__":
    seed_data()

