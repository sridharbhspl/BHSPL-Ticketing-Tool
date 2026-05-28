/**
 * API Debug Utilities
 * Helps troubleshoot frontend-backend connection issues.
 * Uses the shared BASE_URL from apiClient to avoid URL drift.
 */

import { BASE_URL } from './apiClient';

export const API_DEBUG = {
  get API_URL() { return BASE_URL; },
  
  async testConnection() {
    console.group('🔍 [DEBUG] Testing API Connection...');
    console.log('API URL:', BASE_URL);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(BASE_URL, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      console.log('✅ Connection successful', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      console.groupEnd();
      return { connected: true, status: response.status, url: BASE_URL };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Connection TIMED OUT after 5s', { url: BASE_URL });
      } else {
        console.error('❌ Connection FAILED', {
          message: error.message,
          url: BASE_URL,
          hint: 'Ensure Django is running: python manage.py runserver',
        });
      }
      console.groupEnd();
      return { connected: false, error: error.message, url: BASE_URL };
    }
  },

  async testLogin(email: string, password: string) {
    console.group('🔐 [DEBUG] Testing Login Endpoint...');
    console.log('Email:', email);
    
    try {
      const response = await fetch(`${BASE_URL}auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Login successful', {
          status: response.status,
          user: data.user?.name || data.user?.email,
          hasAccessToken: !!data.access,
          hasRefreshToken: !!data.refresh,
        });
      } else {
        console.error('❌ Login failed', {
          status: response.status,
          message: data.detail || data.message || 'Unknown error',
          errors: data.errors,
        });
      }
      
      console.groupEnd();
      return { ok: response.ok, data, status: response.status };
    } catch (error: any) {
      console.error('❌ Login request failed', {
        message: error.message,
        url: `${BASE_URL}auth/login/`,
      });
      console.groupEnd();
      return { ok: false, error: error.message };
    }
  },

  async testEndpoint(endpoint: string) {
    console.group(`🔍 [DEBUG] Testing endpoint: ${endpoint}`);
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.warn('⚠️ No auth token found. Endpoint may return 401.');
    }
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => null);
      console.log(res.ok ? '✅ OK' : '❌ FAILED', { status: res.status, data });
      console.groupEnd();
      return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
      console.error('❌ Request failed', err.message);
      console.groupEnd();
      return { ok: false, error: err.message };
    }
  },

  logAuthState(state: any) {
    console.log('📊 Auth State:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.name || state.user?.email,
      hasToken: !!localStorage.getItem('auth-token'),
      hasRefreshToken: !!localStorage.getItem('refresh-token'),
      error: state.error,
      apiUrl: BASE_URL,
    });
  },

  logNetworkError(error: any, context: string) {
    console.error(`Network Error [${context}]`, {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type,
      timestamp: new Date().toISOString(),
    });
  },

  logApiResponse(endpoint: string, response: any, isError: boolean = false) {
    const prefix = isError ? '❌' : '✅';
    console.log(`${prefix} API Response [${endpoint}]`, {
      status: response.status,
      data: response.data || response.message,
      timestamp: new Date().toISOString(),
    });
  },
};

// Enable debug mode globally for development
if (import.meta.env.DEV) {
  (window as any).API_DEBUG = API_DEBUG;
  console.log('🐛 API Debug mode enabled. Use window.API_DEBUG in console.');
  console.log(`   → window.API_DEBUG.testConnection()`);
  console.log(`   → window.API_DEBUG.testLogin('admin@bhspl.in', 'test@123')`);
  console.log(`   → window.API_DEBUG.testEndpoint('tickets/')`);
}
