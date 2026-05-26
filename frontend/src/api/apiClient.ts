const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

console.log('📍 API Base URL:', BASE_URL);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh-token');
  if (!refreshToken) {
    console.error('❌ [API] No refresh token available for refresh');
    throw new Error('No refresh token available');
  }

  console.log('🔄 [API] Refreshing access token...');

  const response = await fetch(`${BASE_URL}auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    console.error('❌ [API] Token refresh failed with status:', response.status);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    if (!window.location.pathname.includes('/login')) {
      console.log('🚪 [API] Redirecting to login...');
      window.location.href = '/login';
    }
    throw new Error('Token refresh failed');
  }

  const data = await response.json() as { access: string };
  localStorage.setItem('auth-token', data.access);
  console.log('✅ [API] Access token refreshed successfully');
  return data.access;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem('auth-token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = `${BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  console.log(`📤 [API] ${options.method || 'GET'} ${endpoint}`);

  let response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    console.warn(`⚠️ [API] Received 401 for ${endpoint}, attempting token refresh...`);
    
    if (isRefreshing) {
      console.log(`⏳ [API] Token already refreshing, queueing request...`);
      // Wait for token refresh to complete
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken: string) => {
          console.log(`✅ [API] Token refreshed, retrying ${endpoint}...`);
          headers['Authorization'] = `Bearer ${newToken}`;
          fetch(fullUrl, {
            ...options,
            headers,
          })
            .then((res) => {
              if (!res.ok) {
                console.error(`❌ [API] Retry failed with status ${res.status}`);
                throw new Error('API request failed');
              }
              return res.json();
            })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      onRefreshed(newToken);

      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(fullUrl, {
        ...options,
        headers,
      });
    } catch (error) {
      isRefreshing = false;
      console.error('❌ [API] Token refresh failed, redirecting to login...');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }
    
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    // Support the new industry-standard error structure
    if (errorData.status === 'error') {
        errorMessage = errorData.message || errorMessage;
        
        // If there are specific field errors, log them or append them
        if (errorData.errors && typeof errorData.errors === 'object') {
            const fieldErrors = Object.entries(errorData.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' | ');
            if (fieldErrors) {
              console.error('🔴 [API] Field Errors:', fieldErrors);
              errorMessage = fieldErrors;
            }
        }
    } else if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (typeof errorData === 'object') {
      const firstError = Object.values(errorData)[0];
      if (Array.isArray(firstError)) {
        errorMessage = firstError[0] as string;
      } else if (typeof firstError === 'string') {
        errorMessage = firstError;
      }
    }
    
    console.error(`❌ [API] ${response.status} ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    console.log(`✅ [API] ${response.status} ${endpoint}`);
    return {} as T;
  }

  const data = await response.json();
  console.log(`✅ [API] ${response.status} ${endpoint}`);
  return data;
}
