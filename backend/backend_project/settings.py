import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Defensively reconfigure console encoding to prevent charmap crashes on Windows with emojis
if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(errors='replace')
    except Exception:
        pass

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-t-tool-key-change-this')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    
    # Local apps
    'users',
    'projects',
    'tickets',
    'chat',
    'notifications',
    'teams',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_project.wsgi.application'

# Database Configuration
# Industry Best Practice: Use environment variables for DB configurations, defaulting to user credentials
# Database Configuration
# Industry Gold Standard: Dynamic Database Connection with Graceful SQLite Failover
import sys
import psycopg2

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'T Tool DB'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'Sridhar'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,
    }
}

postgres_connected = False
db_name = DATABASES['default']['NAME']
db_user = DATABASES['default']['USER']

# Try 1: Configured DB Name (usually 'bavyadb')
try:
    # Defensively probe connection with 2s timeout
    _conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=DATABASES['default']['PASSWORD'],
        host=DATABASES['default']['HOST'],
        port=DATABASES['default']['PORT'],
        connect_timeout=2
    )
    _conn.close()
    print(f"🐘 [PostgreSQL] Connected successfully to '{db_name}'.")
    postgres_connected = True
except Exception as db_exc:
    print(f"\n⚠️  [PostgreSQL] Initial connection failed for '{db_name}': {db_exc}", file=sys.stderr)
    
    # Try 2: Database doesn't exist? Connect to 'postgres' fallback and auto-create it!
    if db_name != 'postgres':
        print(f"🔄 [PostgreSQL] Attempting to connect to fallback 'postgres' database to check/create '{db_name}'...", file=sys.stderr)
        try:
            # Connect to admin/fallback database 'postgres'
            _conn = psycopg2.connect(
                dbname='postgres',
                user=db_user,
                password=DATABASES['default']['PASSWORD'],
                host=DATABASES['default']['HOST'],
                port=DATABASES['default']['PORT'],
                connect_timeout=2
            )
            _conn.autocommit = True
            _cursor = _conn.cursor()
            
            # Check if target db already exists
            _cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s;", (db_name,))
            exists = _cursor.fetchone()
            
            if not exists:
                print(f"🔨 [PostgreSQL] Target database '{db_name}' does not exist. Creating it now...", file=sys.stderr)
                # Sanitize name/owner safely to prevent syntax/quoting issues
                safe_db_name = "".join([c for c in db_name if c.isalnum() or c == '_'])
                safe_db_owner = "".join([c for c in db_user if c.isalnum() or c == '_'])
                _cursor.execute(f"CREATE DATABASE {safe_db_name} OWNER {safe_db_owner};")
                print(f"🎉 [PostgreSQL] Database '{db_name}' created successfully with owner '{db_user}'!", file=sys.stderr)
            else:
                print(f"ℹ️  [PostgreSQL] Target database '{db_name}' exists, but initial connection failed. Credentials or schema issue?", file=sys.stderr)
            
            _cursor.close()
            _conn.close()
            
            # Retry connection to the target database
            print(f"🔄 [PostgreSQL] Retrying connection to target database '{db_name}'...", file=sys.stderr)
            _conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=DATABASES['default']['PASSWORD'],
                host=DATABASES['default']['HOST'],
                port=DATABASES['default']['PORT'],
                connect_timeout=2
            )
            _conn.close()
            print(f"🐘 [PostgreSQL] Connected successfully to '{db_name}' after auto-creation/verification.")
            postgres_connected = True
        except Exception as prov_exc:
            print(f"❌ [PostgreSQL] Auto-provisioning flow failed: {prov_exc}", file=sys.stderr)
            
            # Try 3: Fallback database 'postgres' as ultimate fallback
            print("🔄 [PostgreSQL] Attempting connection to ultimate fallback database 'postgres'...", file=sys.stderr)
            try:
                _conn = psycopg2.connect(
                    dbname='postgres',
                    user=db_user,
                    password=DATABASES['default']['PASSWORD'],
                    host=DATABASES['default']['HOST'],
                    port=DATABASES['default']['PORT'],
                    connect_timeout=2
                )
                _conn.close()
                DATABASES['default']['NAME'] = 'postgres'
                print("🐘 [PostgreSQL] Connected successfully to ultimate fallback database 'postgres'.")
                postgres_connected = True
            except Exception as fallback_exc:
                print(f"❌ [PostgreSQL] Fallback connection to 'postgres' failed: {fallback_exc}", file=sys.stderr)

if not postgres_connected:
    raise RuntimeError(f"❌ [PostgreSQL] Connection failed! Fatal: Unable to connect or auto-provision target database '{db_name}'. Please verify your local PostgreSQL service and credentials.")

AUTH_PASSWORD_VALIDATORS = []

AUTH_USER_MODEL = 'users.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow all origins in development. For production, override via .env:
#   CORS_ALLOW_ALL_ORIGINS=False
#   CORS_ALLOWED_ORIGINS=https://yourdomain.com
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'EXCEPTION_HANDLER': 'backend_project.exceptions.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    # NOTE: BLACKLIST_AFTER_ROTATION requires 'rest_framework_simplejwt.token_blacklist'
    # in INSTALLED_APPS + its own migration. Not installed here — keep both False.
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Email Settings (Gold Standard Console & SMTP dynamic routing)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@srijayavedaflow.com')

