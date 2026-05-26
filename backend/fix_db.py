import os
import sys
import subprocess

def run_command(command):
    print(f"Running: {command}")
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        print(stdout.decode())
    if stderr:
        print(stderr.decode())
    return process.returncode

if __name__ == "__main__":
    # 1. Create migrations
    run_command("python manage.py makemigrations users projects tickets chat notifications")
    
    # 2. Apply migrations
    run_command("python manage.py migrate")
    
    print("Database sync complete.")
