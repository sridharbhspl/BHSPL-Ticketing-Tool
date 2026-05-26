#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import subprocess


def bootstrap_venv():
    """Auto-bootstrap the virtual environment if run from a global Python."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Locate the virtual environment executable
    if os.name == 'nt':
        venv_python = os.path.join(current_dir, 'venv', 'Scripts', 'python.exe')
    else:
        venv_python = os.path.join(current_dir, 'venv', 'bin', 'python')

    # If the venv exists, check if we're already running inside it
    if os.path.exists(venv_python):
        real_current_exe = os.path.realpath(sys.executable)
        real_venv_exe = os.path.realpath(venv_python)

        if real_current_exe != real_venv_exe:
            # Re-execute the command using the virtual environment interpreter
            cmd = [venv_python] + sys.argv
            try:
                sys.exit(subprocess.call(cmd))
            except Exception as e:
                print(f"⚠️ Failed to auto-switch to virtual environment: {e}", file=sys.stderr)


# Auto-bootstrap before doing anything else
bootstrap_venv()

class LoggerTee:
    def __init__(self, filename, original_stream):
        self.file = open(filename, 'a', encoding='utf-8')
        self.original_stream = original_stream

    def write(self, message):
        self.file.write(message)
        self.file.flush()
        self.original_stream.write(message)
        self.original_stream.flush()

    def flush(self):
        self.file.flush()
        self.original_stream.flush()

# Create startup_debug.log and Tee output
current_dir = os.path.dirname(os.path.abspath(__file__))
log_path = os.path.join(current_dir, 'startup_debug.log')
with open(log_path, 'w', encoding='utf-8') as f:
    f.write("=== Django Startup Debug Log ===\n")

sys.stdout = LoggerTee(log_path, sys.stdout)
sys.stderr = LoggerTee(log_path, sys.stderr)

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Programmatic migrations to keep DB sync transparent and self-healing
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        if os.environ.get('RUN_MAIN') == 'true':
            try:
                import django
                django.setup()
                from django.core.management import call_command
                print("🔄 [Auto-Migration] Checking and applying database updates...")
                call_command('makemigrations', 'users', 'projects', 'tickets', 'chat', 'notifications')
                call_command('migrate')
                print("✅ [Auto-Migration] Database is fully up-to-date!")
                
                # Auto-setup target user in PostgreSQL DB
                try:
                    from users.models import User
                    target_email = "sri_moparthi@yahoo.com"
                    if not User.objects.filter(email=target_email).exists():
                        User.objects.create_user(
                            email=target_email,
                            password="Test@123",
                            name="Sri Moparthi",
                            role="Developer"
                        )
                        print(f"🎯 [Auto-User] Automatically registered '{target_email}' with password 'Test@123'!")
                    else:
                        u = User.objects.get(email=target_email)
                        u.set_password("Test@123")
                        u.save()
                        print(f"🎯 [Auto-User] Verified '{target_email}' exists and password is set to 'Test@123'!")
                except Exception as user_e:
                    print(f"⚠️ [Auto-User] Failed to setup user: {user_e}", file=sys.stderr)
            except Exception as e:
                print(f"⚠️ [Auto-Migration] Migration check failed: {e}", file=sys.stderr)

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
