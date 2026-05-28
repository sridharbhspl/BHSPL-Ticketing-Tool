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

    # ── Auto-Migration on runserver ───────────────────────────────────────────
    # KEY FIX: execute_from_command_line() calls django.setup() internally.
    # Calling django.setup() manually BEFORE it triggers:
    #   "RuntimeError: populate() isn't reentrant"
    # which crashes the server thread and blocks ALL login / API requests.
    #
    # SOLUTION: Run `migrate` as a subprocess in the PARENT process only
    # (RUN_MAIN != 'true'), before the auto-reloader forks the child.
    # The child process (RUN_MAIN == 'true') is left alone — execute_from_command_line
    # handles its own single clean django.setup() call.
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        try:
            print("🔄 [Auto-Migration] Auto-generating migrations...")
            subprocess.call(
                [sys.executable, __file__, 'makemigrations', 'tickets', '--no-input'],
                timeout=60,
            )
            print("🔄 [Auto-Migration] Applying pending migrations...")
            ret = subprocess.call(
                [sys.executable, __file__, 'migrate', '--no-input'],
                timeout=60,
            )
            if ret == 0:
                print("✅ [Auto-Migration] Database is fully up-to-date!")
                try:
                    print("🌱 [Auto-Seed] Populating initial lookup data...")
                    subprocess.call(
                        [sys.executable, 'seed.py'],
                        timeout=30,
                    )
                    print("✅ [Auto-Seed] Lookup database successfully populated!")
                except Exception as seed_exc:
                    print(f"⚠️ [Auto-Seed] Seeding failed: {seed_exc}", file=sys.stderr)
            else:
                print(
                    f"⚠️ [Auto-Migration] migrate exited with code {ret}.",
                    file=sys.stderr,
                )
        except Exception as mig_exc:
            print(f"⚠️ [Auto-Migration] Subprocess failed: {mig_exc}", file=sys.stderr)

    # ── Start Django (single django.setup() happens inside here) ─────────────
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
