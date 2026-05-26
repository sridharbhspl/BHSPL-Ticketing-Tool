import { apiRequest } from './apiClient';
import { API_DEBUG } from './apiDebug';
import type { User } from '../types';

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; access: string; refresh: string }> => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      console.log('🔐 [AUTH] Attempting login for:', email);
      
      const data = await apiRequest<AuthResponse>('auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Store both tokens
      localStorage.setItem('auth-token', data.access);
      localStorage.setItem('refresh-token', data.refresh);
      
      console.log('✅ [AUTH] Login successful for:', data.user?.name || email);
      API_DEBUG.logApiResponse('auth/login/', { status: 200, data: data.user }, false);

      return {
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Login failed:', error.message);
      API_DEBUG.logNetworkError(error, 'auth/login/');
      throw error;
    }
  },
  
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh-token');
    
    if (!refreshToken) {
      console.warn('⚠️ [AUTH] No refresh token available');
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 [AUTH] Attempting token refresh...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/'}auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error('❌ [AUTH] Token refresh failed with status:', response.status);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        throw new Error('Token refresh failed');
      }

      const data = await response.json() as { access: string };
      localStorage.setItem('auth-token', data.access);
      
      console.log('✅ [AUTH] Token refreshed successfully');
      return data.access;
    } catch (error: any) {
      console.error('❌ [AUTH] Token refresh error:', error.message);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      throw error;
    }
  },
  
  register: async (userData: { name: string; email: string; password: string; role?: string; avatar?: string }) => {
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Name, email, and password are required');
    }

    try {
      console.log('👤 [AUTH] Attempting registration for:', userData.email);
      
      const result = await apiRequest<User>('auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          role: userData.role || 'Developer',
          avatar: userData.avatar || '',
        }),
      });

      console.log('✅ [AUTH] Registration successful for:', userData.email);
      return result;
    } catch (error: any) {
      console.error('❌ [AUTH] Registration failed:', error.message);
      throw error;
    }
  },
  
  getMe: async () => {
    try {
      console.log('👤 [AUTH] Fetching current user...');
      
      const user = await apiRequest<User>('auth/me/');
      
      console.log('✅ [AUTH] User fetched:', user?.name || user?.email);
      return user;
    } catch (error: any) {
      console.error('❌ [AUTH] Failed to fetch user:', error.message);
      throw error;
    }
  },
  
  updateProfile: async (userData: Partial<User>) => {
    try {
      console.log('✏️ [AUTH] Updating user profile...');
      
      const result = await apiRequest<User>('auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });

      console.log('✅ [AUTH] Profile updated successfully');
      return result;
    } catch (error: any) {
      console.error('❌ [AUTH] Profile update failed:', error.message);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    try {
      console.log('🔑 [AUTH] Changing password...');
      const result = await apiRequest<{ message: string }>('auth/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      console.log('✅ [AUTH] Password changed successfully');
      return result;
    } catch (error: any) {
      console.error('❌ [AUTH] Password change failed:', error.message);
      throw error;
    }
  },

  logout: () => {
    console.log('🚪 [AUTH] User logging out...');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    console.log('✅ [AUTH] Tokens cleared');
  },
};
