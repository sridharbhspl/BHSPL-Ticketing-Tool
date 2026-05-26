/**
 * API Debug Utilities
 * Helps troubleshoot frontend-backend connection issues
 */

export const API_DEBUG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  
  async testConnection() {
    console.log('🔍 Testing API Connection...');
    console.log('API URL:', this.API_URL);
    
    try {
      const response = await fetch(this.API_URL, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Connection successful', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      return { connected: true, status: response.status };
    } catch (error: any) {
      console.error('❌ Connection failed', {
        message: error.message,
        cause: error.cause,
        type: error.type,
      });
      return { connected: false, error: error.message };
    }
  },

  async testLogin(email: string, password: string) {
    console.log('🔐 Testing Login Endpoint...');
    console.log('Email:', email);
    
    try {
      const response = await fetch(`${this.API_URL}auth/login/`, {
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
      
      return { ok: response.ok, data, status: response.status };
    } catch (error: any) {
      console.error('❌ Login request failed', {
        message: error.message,
        url: `${this.API_URL}auth/login/`,
      });
      return { ok: false, error: error.message };
    }
  },

  logAuthState(state: any) {
    console.log('📊 Auth State:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.name || state.user?.email,
      hasToken: !!localStorage.getItem('auth-token'),
      hasRefreshToken: !!localStorage.getItem('refresh-token'),
      error: state.error,
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
}
