import os
import django
from django.core.management import call_command

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    django.setup()
    
    print("🔄 [Django DB Sync] Starting automated database migration flow...")
    
    # 1. Makemigrations for all apps
    print("🔨 [Django DB Sync] Compiling migrations...")
    call_command('makemigrations', 'users', 'projects', 'tickets', 'chat', 'notifications')
    
    # 2. Run migrate
    print("🚀 [Django DB Sync] Applying migrations to PostgreSQL...")
    call_command('migrate')
    
    print("🎉 [Django DB Sync] Migration successfully executed on PostgreSQL database!")
