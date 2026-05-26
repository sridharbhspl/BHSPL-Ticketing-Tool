import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# List of users to create
test_users = [
    {
        "email": "admin@bhspl.in",
        "name": "Bavya Admin",
        "role": "Admin"
    },
    {
        "email": "projectmanager@bhspl.in",
        "name": "Bavya Project Manager",
        "role": "Project Manager"
    },
    {
        "email": "seniordeveloper@bhspl.in",
        "name": "Bavya Senior Developer",
        "role": "Senior Developer"
    },
    {
        "email": "fullstackdeveloper@bhspl.in",
        "name": "Bavya Fullstack Developer",
        "role": "Fullstack Developer"
    },
    {
        "email": "developer@bhspl.in",
        "name": "Bavya Developer",
        "role": "Developer"
    },
    {
        "email": "qatester@bhspl.in",
        "name": "Bavya QA Tester",
        "role": "QA Tester"
    },
    {
        "email": "client@bhspl.in",
        "name": "Bavya Client",
        "role": "Client"
    },
    {
        "email": "viewer@bhspl.in",
        "name": "Bavya Viewer",
        "role": "Viewer"
    }
]

password = "test@123"

def create_users():
    print("🚀 Seeding role-wise testing users into database...")
    for user_info in test_users:
        email = user_info["email"]
        name = user_info["name"]
        role = user_info["role"]
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "name": name,
                "role": role,
                "username": email
            }
        )
        
        user.set_password(password)
        user.name = name
        user.role = role
        user.save()
        
        status = "Created" if created else "Updated (Password/Info Reset)"
        print(f"✅ {status} User: {email} | Name: {name} | Role: {role}")
        
    print("🏁 Seeding complete! All users are set up with password: test@123")

if __name__ == "__main__":
    create_users()
