import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from tickets.models import AttendanceSession
from django.contrib.auth import get_user_model

User = get_user_model()
print("Total users:", User.objects.count())
print("Total attendance sessions:", AttendanceSession.objects.count())
for session in AttendanceSession.objects.all():
    print(f"ID: {session.id}, User: {session.user.email}, Date: {session.date}, Punch In: {session.punch_in_time}, Punch Out: {session.punch_out_time}")
