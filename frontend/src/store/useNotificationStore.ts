import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ticketsApi } from '../api/tickets.api';
import type { AppNotification } from '../types';

export type { AppNotification };

export interface NotificationPreference {
  inApp: boolean;
  email: boolean;
  push: boolean;
}

export interface NotificationSettings {
  mentions: NotificationPreference;
  assignments: NotificationPreference;
  comments: NotificationPreference;
  statusChanges: NotificationPreference;
  systemAlerts: NotificationPreference;
  calls: NotificationPreference;
  dndMode: boolean;
}

interface NotificationStore {
  settings: NotificationSettings;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  updateSetting: (category: keyof NotificationSettings, channel: keyof NotificationPreference, value: boolean) => void;
  toggleDND: () => void;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

const defaultPreference: NotificationPreference = { inApp: true, email: true, push: false };

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      settings: {
        mentions: { ...defaultPreference, push: true },
        assignments: { ...defaultPreference, push: true },
        comments: defaultPreference,
        statusChanges: { ...defaultPreference, email: false },
        systemAlerts: { inApp: true, email: true, push: true },
        calls: { inApp: true, email: false, push: true },
        dndMode: false,
      },
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      
      updateSetting: (category, channel, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category as keyof NotificationSettings] as NotificationPreference,
              [channel]: value,
            },
          },
        }));
      },
      
      toggleDND: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            dndMode: !state.settings.dndMode,
          },
        }));
      },

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const fetched = await ticketsApi.getNotifications();
          set((state) => {
            // Keep local notifications that have not been loaded from the server (e.g. self-actions)
            const localNotifs = state.notifications.filter(n => n.id.toString().startsWith('notif-'));
            
            // Filter fetched notifications to make sure we don't duplicate any
            const nonDuplicateFetched = fetched.filter(fn => 
              !localNotifs.some(ln => ln.targetId === fn.targetId && ln.message === fn.message)
            );
            
            // Combine them, placing local notifications at the top
            const combined = [...localNotifs, ...nonDuplicateFetched];
            
            // Sort by timestamp descending so the latest notification is ALWAYS at the absolute top of the list!
            combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            const unreadCount = combined.filter(n => !n.isRead).length;
            
            return {
              notifications: combined.slice(0, 50),
              unreadCount,
              isLoading: false
            };
          });
        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
        }
      },

      addNotification: (n) => {
        const newNotification: AppNotification = {
          ...n,
          id: `notif-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1
        }));
      },

      markAsRead: async (id) => {
        try {
          await ticketsApi.markNotificationAsRead(id);
          set((state) => ({
            notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      },

      markAllAsRead: async () => {
        try {
          await ticketsApi.markAllNotificationsAsRead();
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0
          }));
        } catch (err) {
          console.error('Failed to mark all notifications as read:', err);
        }
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      }
    }),
    {
      name: 'notification-storage-v2',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
