import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authApi } from '../api/auth.api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  error: string | null;
  simulatedRole: string | null;
  setSimulatedRole: (role: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      error: null,
      simulatedRole: null,
      setSimulatedRole: (role) => set({ simulatedRole: role }),

      login: async (email, password) => {
        try {
          console.log('🔐 [STORE] Attempting login...');
          set({ error: null });
          const { user } = await authApi.login(email, password);
          console.log('✅ [STORE] Login successful for:', user?.name || user?.email);
          set({ user, isAuthenticated: true, error: null });
        } catch (err: any) {
          const errorMessage = err?.message || 'Login failed';
          console.error('❌ [STORE] Login failed:', errorMessage);
          set({ error: errorMessage, isAuthenticated: false, user: null });
          throw err;
        }
      },

      initialize: async () => {
        set({ isInitializing: true });

        // ── Enforce 30-day Remember Me expiry ──
        const rememberExpiry = localStorage.getItem('remember-me-expiry');
        if (rememberExpiry && Date.now() > Number(rememberExpiry)) {
          console.log('⏰ [STORE] Remember Me session expired, clearing credentials...');
          localStorage.removeItem('remembered-email');
          localStorage.removeItem('remember-me-expiry');
          localStorage.removeItem('auth-token');
          set({ user: null, isAuthenticated: false, error: null, isInitializing: false });
          return;
        }

        const token = localStorage.getItem('auth-token');
        
        console.log('🚀 [STORE] Initializing auth store...');
        console.log('📍 [STORE] Token exists:', !!token);
        
        if (token) {
          try {
            console.log('👤 [STORE] Attempting to fetch user...');
            const user = await authApi.getMe();
            console.log('✅ [STORE] User fetched successfully:', user?.name || user?.email);
            set({ user, isAuthenticated: true, error: null, isInitializing: false });
          } catch (err: any) {
            console.warn('⚠️ [STORE] Failed to fetch user, attempting token refresh...');
            // Token might be invalid, try to refresh
            try {
              await authApi.refreshToken();
              console.log('🔄 [STORE] Token refreshed, attempting to fetch user again...');
              const user = await authApi.getMe();
              console.log('✅ [STORE] User fetched after refresh:', user?.name || user?.email);
              set({ user, isAuthenticated: true, error: null, isInitializing: false });
            } catch (refreshErr) {
              console.error('❌ [STORE] Failed to refresh token:', refreshErr);
              authApi.logout();
              set({ user: null, isAuthenticated: false, error: null, isInitializing: false });
            }
          }
        } else {
          console.log('ℹ️ [STORE] No token found, user is not authenticated');
          set({ user: null, isAuthenticated: false, error: null, isInitializing: false });
        }
      },

      logout: () => {
        authApi.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: async (updates) => {
        try {
          set({ error: null });
          const updatedUser = await authApi.updateProfile(updates);
          set({ user: updatedUser });
        } catch (err: any) {
          const errorMessage = err?.message || 'Failed to update profile';
          set({ error: errorMessage });
          throw err;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
