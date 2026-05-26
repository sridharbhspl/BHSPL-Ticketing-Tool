# Authentication System Documentation

## Overview
This document describes the complete authentication flow implemented in the Work Assignment Ticket Tool, connecting the Django backend with the React/TypeScript frontend.

---

## 🔐 Backend Authentication (Django)

### JWT Configuration
**Location:** `backend/backend_project/settings.py`

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),      # Tokens expire after 1 day
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # Refresh tokens expire after 7 days
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Database Model
**Location:** `backend/users/models.py`

- Uses `email` as the unique username field
- Supports roles: Admin, Developer, Client
- Stores user name, avatar, and role

### API Endpoints

#### 1. **Login Endpoint**
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Developer",
    "avatar": ""
  }
}
```

#### 2. **Register Endpoint**
```
POST /api/auth/register/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "Developer",  // Optional, defaults to "Developer"
  "avatar": ""          // Optional
}
```

#### 3. **Refresh Token Endpoint**
```
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 4. **Get Current User**
```
GET /api/auth/me/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "id": "1",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "Developer",
  "avatar": ""
}
```

#### 5. **Update Current User Profile**
```
PATCH /api/auth/me/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar": "https://..."
}
```

### Error Responses

#### Invalid Credentials
```json
{
  "status": "error",
  "message": "Invalid email or password. Please try again.",
  "errors": {},
  "code": "authentication_failed"
}
```

#### Missing Fields
```json
{
  "status": "error",
  "message": "Validation failed. Please check your input.",
  "errors": {
    "email": ["This field may not be blank."],
    "password": ["This field may not be blank."]
  },
  "code": "validation_error"
}
```

---

## 🎨 Frontend Authentication (React)

### 1. API Client (`frontend/src/api/auth.api.ts`)

Main authentication functions:

```typescript
// Login
authApi.login(email, password)
// Returns: { user, access, refresh }

// Register
authApi.register(userData)

// Get Current User
authApi.getMe()

// Update Profile
authApi.updateProfile(updates)

// Refresh Token
authApi.refreshToken()

// Logout
authApi.logout()
```

### 2. HTTP Client (`frontend/src/api/apiClient.ts`)

Features:
- ✅ **Automatic Token Refresh**: Refreshes access token when it expires (401)
- ✅ **Token Queue**: Prevents multiple simultaneous refresh requests
- ✅ **Error Handling**: Structured error responses
- ✅ **CORS Support**: Configured for cross-origin requests

### 3. Auth Store (`frontend/src/store/useAuthStore.ts`)

Zustand store managing:
- User state (logged in or not)
- Authentication status
- Error messages
- Token persistence in localStorage

### 4. Login Component (`frontend/src/pages/Login.tsx`)

Features:
- ✅ **Input Validation**: Email/Employee ID and password validation
- ✅ **Real-time Error Feedback**: Shows validation errors as user types
- ✅ **Specific Error Messages**: Different messages for different error types
- ✅ **Loading States**: Disables button and shows spinner during login
- ✅ **Success Message**: Shows confirmation before redirect
- ✅ **Responsive Design**: Works on mobile and desktop

---

## 📝 Token Storage

### localStorage Keys
```
auth-token       // JWT access token (1 day lifetime)
refresh-token    // JWT refresh token (7 day lifetime)
```

### Automatic Cleanup
- Tokens are cleared on logout
- Tokens are cleared on 401 error
- User is redirected to login if tokens expire

---

## 🔄 Authentication Flow Diagram

```
1. User enters email and password
   ↓
2. Frontend validates inputs
   ↓
3. POST /api/auth/login/ with credentials
   ↓
4. Backend validates and returns tokens + user data
   ↓
5. Frontend stores tokens and user in localStorage + Zustand
   ↓
6. User redirected to /dashboard
   ↓
7. For subsequent requests:
   - Add Authorization: Bearer {access_token} header
   - If 401: Refresh token using refresh token
   - If refresh fails: Redirect to /login
```

---

## 🛡️ Security Features

1. **CORS Configuration**: Properly configured in Django settings
2. **JWT Signing**: Uses HS256 algorithm with SECRET_KEY
3. **Token Expiration**: Access tokens expire after 1 day
4. **Refresh Token Rotation**: Separate refresh tokens for extended sessions
5. **Email as Username**: More user-friendly than generic usernames
6. **Password Hashing**: Django's default PBKDF2 hasher

---

## 🧪 Testing the Authentication

### 1. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Test Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer {access_token}"
```

### 3. Test Token Refresh
```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"{refresh_token}"}'
```

---

## 🚀 Deployment Checklist

- [ ] Set `DEBUG = False` in Django settings
- [ ] Update `SECRET_KEY` with a secure random key
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up environment variables (.env file)
- [ ] Test token refresh flow
- [ ] Verify CORS settings for production domain
- [ ] Enable HTTPS in production
- [ ] Set up database backups
- [ ] Configure JWT signing key rotation (optional)

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `backend/users/models.py` | User model definition |
| `backend/users/serializers.py` | JWT and User serializers |
| `backend/users/views.py` | Auth endpoints |
| `backend/backend_project/urls.py` | URL routing |
| `backend/backend_project/settings.py` | JWT configuration |
| `backend/backend_project/exceptions.py` | Error handling |
| `frontend/src/api/auth.api.ts` | Frontend auth API |
| `frontend/src/api/apiClient.ts` | HTTP client with refresh logic |
| `frontend/src/store/useAuthStore.ts` | Zustand auth store |
| `frontend/src/pages/Login.tsx` | Login page component |

---

## 🆘 Troubleshooting

### "Invalid email or password"
- Verify credentials are correct
- Check if user exists in database
- Ensure database is running

### "Session expired"
- Access token lifetime may have passed
- Refresh token flow should automatically handle this
- Check token expiration time in settings

### "CORS Error"
- Verify CORS_ALLOW_ALL_ORIGINS is True in settings
- Check CORS_ALLOW_HEADERS includes 'authorization'
- Verify frontend API URL matches backend domain

### "Token not persisting"
- Check localStorage is enabled in browser
- Verify auth-storage and refresh-storage keys in localStorage
- Check browser privacy settings

---

Generated: 2024-05-18
Version: 1.0
