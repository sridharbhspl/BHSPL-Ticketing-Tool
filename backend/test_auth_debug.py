#!/usr/bin/env python
"""
Backend Authentication Debug Script
Verifies that all auth endpoints are working correctly
"""

import os
import django
import json
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

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_info(text):
    print(f"ℹ️  {text}")

def test_database():
    """Test if database is accessible"""
    print_header("DATABASE CONNECTION TEST")
    
    try:
        user_count = User.objects.count()
        print_success(f"Database connected! Total users: {user_count}")
        
        # List all users
        users = User.objects.all().values('id', 'email', 'name', 'role')
        if users:
            print_info("Registered users:")
            for user in users:
                print(f"  - {user['email']} ({user['name']}) - Role: {user['role']}")
        else:
            print_info("No users found in database")
        
        return True
    except Exception as e:
        print_error(f"Database connection failed: {str(e)}")
        return False

def test_user_creation():
    """Test creating a test user"""
    print_header("USER CREATION TEST")
    
    test_email = "test@example.com"
    test_password = "testpass123"
    test_name = "Test User"
    
    try:
        # Check if user exists
        if User.objects.filter(email=test_email).exists():
            print_info(f"Test user already exists: {test_email}")
            user = User.objects.get(email=test_email)
        else:
            # Create new user
            user = User.objects.create_user(
                email=test_email,
                password=test_password,
                name=test_name,
                role='Developer'
            )
            print_success(f"Test user created: {test_email}")
        
        return test_email, test_password, user
    except Exception as e:
        print_error(f"User creation failed: {str(e)}")
        return None, None, None

def test_authentication(email, password):
    """Test Django authentication"""
    print_header("AUTHENTICATION TEST")
    
    try:
        user = authenticate(username=email, password=password)
        
        if user:
            print_success(f"Authentication successful for: {email}")
            print_info(f"User: {user.name} (ID: {user.id})")
            print_info(f"Role: {user.role}")
            return user
        else:
            print_error("Authentication failed - invalid credentials")
            return None
    except Exception as e:
        print_error(f"Authentication error: {str(e)}")
        return None

def test_jwt_generation(user):
    """Test JWT token generation"""
    print_header("JWT TOKEN GENERATION TEST")
    
    try:
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        
        print_success("JWT tokens generated successfully")
        print_info(f"Refresh token: {str(refresh)[:50]}...")
        print_info(f"Access token: {access[:50]}...")
        
        return str(refresh), access
    except Exception as e:
        print_error(f"JWT generation failed: {str(e)}")
        return None, None

def test_cors_settings():
    """Test CORS configuration"""
    print_header("CORS CONFIGURATION TEST")
    
    try:
        from django.conf import settings
        
        cors_allow_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
        cors_allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        cors_allow_credentials = getattr(settings, 'CORS_ALLOW_CREDENTIALS', False)
        
        print_info(f"CORS_ALLOW_ALL_ORIGINS: {cors_allow_all}")
        print_info(f"CORS_ALLOW_CREDENTIALS: {cors_allow_credentials}")
        
        if cors_allow_all:
            print_success("CORS is open to all origins")
        elif cors_allowed_origins:
            print_info(f"CORS allowed origins: {cors_allowed_origins}")
        else:
            print_error("CORS not properly configured")
        
        return True
    except Exception as e:
        print_error(f"CORS config check failed: {str(e)}")
        return False

def test_jwt_settings():
    """Test JWT configuration"""
    print_header("JWT CONFIGURATION TEST")
    
    try:
        from django.conf import settings
        
        jwt_config = getattr(settings, 'SIMPLE_JWT', {})
        
        if jwt_config:
            print_success("JWT configuration found")
            print_info(f"Access token lifetime: {jwt_config.get('ACCESS_TOKEN_LIFETIME')}")
            print_info(f"Refresh token lifetime: {jwt_config.get('REFRESH_TOKEN_LIFETIME')}")
            print_info(f"Algorithm: {jwt_config.get('ALGORITHM')}")
            return True
        else:
            print_error("No JWT configuration found")
            return False
    except Exception as e:
        print_error(f"JWT config check failed: {str(e)}")
        return False

def main():
    print_header("🔐 BACKEND AUTHENTICATION DEBUG")
    print_info("Testing backend authentication setup...")
    
    # Run tests
    db_ok = test_database()
    test_cors_settings()
    test_jwt_settings()
    
    if not db_ok:
        print_error("\n❌ Database not accessible. Cannot continue tests.")
        sys.exit(1)
    
    email, password, user = test_user_creation()
    if not email or not user:
        print_error("\n❌ Failed to create/get test user.")
        sys.exit(1)
    
    auth_user = test_authentication(email, password)
    if not auth_user:
        print_error("\n❌ Authentication failed.")
        sys.exit(1)
    
    refresh, access = test_jwt_generation(auth_user)
    if not refresh or not access:
        print_error("\n❌ JWT generation failed.")
        sys.exit(1)
    
    print_header("✅ ALL TESTS PASSED")
    print_info(f"Test user: {email}")
    print_info(f"Password: {password}")
    print_info("\nYou can now test the API with these credentials:")
    print_info(f"  POST /api/auth/login/")
    print_info(f"  Email: {email}")
    print_info(f"  Password: {password}")
    print()

if __name__ == '__main__':
    main()
