# 🔐 Authentication Debug Guide

This guide helps troubleshoot frontend-backend authentication connection issues.

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
python manage.py runserver
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

### 3. Open Console
- Open your browser console (F12 or Ctrl+Shift+I)
- Look for 📍 API Base URL log to confirm frontend can see backend

---

## 🔍 Debug Steps

### Step 1: Verify Backend is Running

Check these endpoints:

#### Django Admin
```
http://localhost:8000/admin/
```
Should see Django admin interface

#### API Root
```
http://localhost:8000/api/
```
Should return API list (might be restricted without token)

### Step 2: Test API Connection from Frontend

Open browser console and run:

```javascript
// Test basic connectivity
window.API_DEBUG.testConnection()

// Test login endpoint
window.API_DEBUG.testLogin('test@example.com', 'password123')
```

You should see detailed logs for each test.

### Step 3: Test Backend Directly

Run the debug script:
```bash
cd backend
python test_auth_debug.py
```

This will:
- ✅ Verify database connection
- ✅ Check CORS configuration  
- ✅ Test user creation
- ✅ Test authentication
- ✅ Test JWT generation
- ✅ Create a test user you can use

### Step 4: Manually Test API

Using curl (or Postman):

```bash
# 1. Login to get tokens
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Response should include:
# {
#   "access": "eyJ0eXAi...",
#   "refresh": "eyJ0eXAi...",
#   "user": {...}
# }

# 2. Use access token to get user info
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer {access_token_from_above}"

# 3. Test token refresh
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"{refresh_token_from_above}"}'
```

---

## 🐛 Common Issues & Fixes

### Issue: "Connection refused" or "Network error"

**Cause**: Backend not running or wrong URL

**Fix**:
1. Verify backend running: `python manage.py runserver`
2. Check `.env` file has correct URL
3. Check frontend logs show correct API_URL

```javascript
// In browser console, check:
console.log(import.meta.env.VITE_API_URL)
```

### Issue: CORS Error

**Cause**: CORS not configured

**Fix** - In `backend/backend_project/settings.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True  # For development only
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
```

### Issue: "Invalid email or password"

**Cause**: User doesn't exist or wrong credentials

**Fix**:
1. Create test user: `python test_auth_debug.py`
2. Check users exist: `python manage.py shell`
   ```python
   from users.models import User
   User.objects.all().values('email', 'name')
   ```

### Issue: Login works but no redirect to dashboard

**Cause**: Token not being stored or auth state not updating

**Fix** - Check browser console logs for:
1. "✅ [AUTH] Login successful" - token received
2. "✅ [STORE] Login successful" - state updated
3. "🚀 [LOGIN] Navigating to dashboard" - redirect attempted

If any step is missing, the issue is in that component.

### Issue: "Session expired" immediately after login

**Cause**: Token refresh endpoint not working

**Fix**:
1. Test `/api/auth/refresh/` manually (see curl examples above)
2. Check refresh token is being stored in localStorage
3. Verify JWT settings in Django config

---

## 📊 Debug Logs Location

### Frontend Console Logs

Look for these prefixes:

| Prefix | Meaning |
|--------|---------|
| 🔐 [AUTH] | Auth API calls |
| 📤 [API] | HTTP requests |
| ✅ [AUTH] | Success |
| ❌ [AUTH] | Error |
| 🔄 [API] | Token refresh |
| 📊 [STORE] | Zustand store updates |
| 🚀 [LOGIN] | Login component flow |

### Example Console Output

```
📍 API Base URL: http://localhost:8000/api/
🚀 [STORE] Initializing auth store...
📍 [STORE] Token exists: false
ℹ️  [STORE] No token found, user is not authenticated
📝 [LOGIN] Form submitted with email: test@example.com
🔐 [LOGIN] Calling login function...
🔐 [AUTH] Attempting login for: test@example.com
📤 [API] POST auth/login/
✅ [API] 200 auth/login/
✅ [AUTH] Login successful for: Test User
✅ [STORE] Login successful for: Test User
✅ [LOGIN] Login succeeded, showing success message...
🚀 [LOGIN] Navigating to dashboard...
```

---

## 🛠️ Advanced Debugging

### Check localStorage

In browser console:
```javascript
// View all tokens
localStorage.getItem('auth-token')
localStorage.getItem('refresh-token')

// Clear all auth data
localStorage.removeItem('auth-token')
localStorage.removeItem('refresh-token')
```

### Check Zustand Store

In browser console:
```javascript
// If you exported useAuthStore globally:
useAuthStore.getState()

// Or check:
localStorage.getItem('auth-storage')  // Persisted state
```

### Test Individual Functions

```javascript
// Test login
const { authApi } = await import('/frontend/src/api/auth.api.ts')
await authApi.login('test@example.com', 'password123')

// Test get current user
await authApi.getMe()

// Test refresh token
await authApi.refreshToken()
```

### Enable Network Tab

1. Open DevTools → Network tab
2. Try login
3. Look at the POST request to `auth/login/`
4. Check:
   - Status code (should be 200)
   - Response headers (contains access & refresh tokens)
   - Request headers (contains Content-Type)

---

## ✅ Testing Checklist

Before considering authentication "fixed", verify:

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend can reach backend (check API Base URL log)
- [ ] Database has test user
- [ ] Login endpoint returns 200 with tokens
- [ ] Tokens stored in localStorage
- [ ] Auth store shows isAuthenticated: true
- [ ] Redirect to dashboard occurs
- [ ] Token refresh works (if token expires)
- [ ] CORS headers present in responses
- [ ] Console shows all ✅ success logs

---

## 📞 Still Having Issues?

Check the following files for configuration:

| File | Purpose |
|------|---------|
| `frontend/.env` | API URL configuration |
| `backend/backend_project/settings.py` | CORS, JWT config |
| `backend/users/serializers.py` | Login serializer |
| `backend/users/views.py` | Auth endpoints |
| `frontend/src/api/apiClient.ts` | HTTP client |
| `frontend/src/api/auth.api.ts` | Auth API functions |
| `frontend/src/store/useAuthStore.ts` | Auth state |

---

Generated: 2024-05-18
Version: 1.0
