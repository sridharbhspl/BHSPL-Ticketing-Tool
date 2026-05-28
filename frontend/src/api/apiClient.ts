/**
 * apiClient.ts — Industry-Grade Fetch Wrapper
 * ─────────────────────────────────────────────
 * Features:
 *  • Centralised BASE_URL (single source of truth)
 *  • Request timeout via AbortController (10 s default)
 *  • JWT Bearer auth + automatic silent token refresh on 401
 *  • Refresh-queue: concurrent requests don't each trigger a refresh
 *  • Consistent structured error parsing
 *  • Dev-mode request/response logging
 */

export const BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const REQUEST_TIMEOUT_MS = 10_000; // 10 seconds

// ── Refresh-queue state ─────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const drainRefreshQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// ── Token helpers ───────────────────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('auth-token');
const getRefreshToken = () => localStorage.getItem('refresh-token');
const setAccessToken = (t: string) => localStorage.setItem('auth-token', t);
const clearTokens = () => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('refresh-token');
};

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.error('❌ [API] No refresh token available');
    throw new Error('No refresh token available');
  }

  console.log('🔄 [API] Refreshing access token...');

  // Use BASE_URL — no inline URL duplication
  const response = await fetch(`${BASE_URL}auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    console.error('❌ [API] Token refresh failed:', response.status);
    clearTokens();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Token refresh failed');
  }

  const data = await response.json() as { access: string };
  setAccessToken(data.access);
  console.log('✅ [API] Access token refreshed successfully');
  return data.access;
}

// ── Core request function ───────────────────────────────────────────────────
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined ?? {}),
  };

  // Normalise endpoint — strip leading slash to avoid double-slash
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${BASE_URL}${path}`;

  if (import.meta.env.DEV) {
    console.log(`📤 [API] ${options.method ?? 'GET'} /${path}`);
  }

  // ── AbortController timeout ─────────────────────────────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const executeRequest = async (authHeader: string | null) => {
    const reqHeaders = { ...headers };
    if (authHeader) reqHeaders['Authorization'] = authHeader;

    try {
      const res = await fetch(fullUrl, {
        ...options,
        headers: reqHeaders,
        signal: controller.signal,
      });
      return res;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${endpoint}`);
      }
      throw err;
    }
  };

  let response = await executeRequest(token ? `Bearer ${token}` : null);
  clearTimeout(timeoutId);

  // ── Handle 401: silent token refresh ────────────────────────────────────
  if (response.status === 401) {
    console.warn(`⚠️ [API] 401 on ${endpoint} — attempting token refresh...`);

    if (isRefreshing) {
      // Queue this request until the ongoing refresh finishes
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken) => {
          try {
            const retryRes = await executeRequest(`Bearer ${newToken}`);
            const retryData = await parseResponse<T>(retryRes, endpoint);
            resolve(retryData);
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      drainRefreshQueue(newToken);
      // Retry the original request with fresh token
      response = await executeRequest(`Bearer ${newToken}`);
    } catch (refreshErr) {
      isRefreshing = false;
      clearTokens();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  return parseResponse<T>(response, endpoint);
}

// ── Response parser ─────────────────────────────────────────────────────────
async function parseResponse<T>(response: Response, endpoint: string): Promise<T> {
  if (response.status === 204) {
    if (import.meta.env.DEV) console.log(`✅ [API] 204 ${endpoint}`);
    return {} as T;
  }

  if (!response.ok) {
    let errorData: any = {};
    try { errorData = await response.json(); } catch { /* non-JSON body */ }

    let errorMessage = `API Error ${response.status}: ${response.statusText}`;

    if (errorData?.status === 'error') {
      // Our custom exception handler format
      errorMessage = errorData.message || errorMessage;
      if (errorData.errors && typeof errorData.errors === 'object') {
        const fieldErrors = Object.entries(errorData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        if (fieldErrors) errorMessage = fieldErrors;
      }
    } else if (errorData?.detail) {
      errorMessage = errorData.detail;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (typeof errorData === 'object' && errorData !== null) {
      const firstVal = Object.values(errorData)[0];
      if (Array.isArray(firstVal)) errorMessage = firstVal[0] as string;
      else if (typeof firstVal === 'string') errorMessage = firstVal;
    }

    console.error(`❌ [API] ${response.status} ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  const data: T = await response.json();
  if (import.meta.env.DEV) console.log(`✅ [API] ${response.status} ${endpoint}`);
  return data;
}
