import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../api/apiClient';

export interface AttendanceSession {
  id: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  totalWorkTime: string; // e.g. "08h 15m"
  totalBreakTime: string; // e.g. "00h 45m"
  status: 'Completed' | 'Active';
}

interface AttendanceState {
  isPunchedIn: boolean;
  isOnBreak: boolean;
  punchInTime: number | null; // Timestamp
  totalWorkedBeforeBreak: number; // accumulated milliseconds
  breakStartTime: number | null; // Timestamp
  totalBreakDuration: number; // accumulated milliseconds
  history: AttendanceSession[];
  isLoading: boolean;
  error: string | null;
  
  fetchAttendanceHistory: () => Promise<void>;
  punchIn: () => void;
  startBreak: () => void;
  endBreak: () => void;
  punchOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      isPunchedIn: false,
      isOnBreak: false,
      punchInTime: null,
      totalWorkedBeforeBreak: 0,
      breakStartTime: null,
      totalBreakDuration: 0,
      isLoading: false,
      error: null,
      history: [
        {
          id: 'ATT-001',
          date: '2026-05-22',
          punchInTime: '09:00 AM',
          punchOutTime: '06:00 PM',
          totalWorkTime: '08h 15m',
          totalBreakTime: '00h 45m',
          status: 'Completed'
        },
        {
          id: 'ATT-002',
          date: '2026-05-23',
          punchInTime: '08:45 AM',
          punchOutTime: '05:30 PM',
          totalWorkTime: '07h 45m',
          totalBreakTime: '01h 00m',
          status: 'Completed'
        }
      ],

      fetchAttendanceHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔄 [STORE] Fetching attendance logs from Django...');
          const data = await apiRequest<AttendanceSession[]>('attendance-sessions/');
          if (data && data.length > 0) {
            set({ history: data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          console.log('✅ [STORE] Attendance history synced successfully.');
        } catch (err: any) {
          console.warn('⚠️ [STORE] Django fetch failed. Operating in local storage fallback:', err.message);
          set({ isLoading: false });
        }
      },

      punchIn: () => set({
        isPunchedIn: true,
        isOnBreak: false,
        punchInTime: Date.now(),
        totalWorkedBeforeBreak: 0,
        breakStartTime: null,
        totalBreakDuration: 0
      }),

      startBreak: () => set((state) => {
        if (!state.punchInTime) return {};
        const elapsedSinceLastPunch = Date.now() - state.punchInTime;
        return {
          isOnBreak: true,
          breakStartTime: Date.now(),
          totalWorkedBeforeBreak: state.totalWorkedBeforeBreak + elapsedSinceLastPunch,
          punchInTime: null
        };
      }),

      endBreak: () => set((state) => {
        if (!state.breakStartTime) return {};
        const elapsedBreak = Date.now() - state.breakStartTime;
        return {
          isOnBreak: false,
          punchInTime: Date.now(),
          totalBreakDuration: state.totalBreakDuration + elapsedBreak,
          breakStartTime: null
        };
      }),

      punchOut: async () => {
        const state = get();
        let finalWorkMs = state.totalWorkedBeforeBreak;
        let finalBreakMs = state.totalBreakDuration;
        const now = Date.now();

        if (state.isPunchedIn && state.punchInTime) {
          finalWorkMs += (now - state.punchInTime);
        }
        if (state.isOnBreak && state.breakStartTime) {
          finalBreakMs += (now - state.breakStartTime);
        }

        const formatMs = (ms: number) => {
          const totalSecs = Math.floor(ms / 1000);
          const hrs = Math.floor(totalSecs / 3600);
          const mins = Math.floor((totalSecs % 3600) / 60);
          return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
        };

        const formatTime = (timestamp: number) => {
          return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const startTimeStamp = state.punchInTime || now - finalWorkMs - finalBreakMs;
        const tempId = `ATT-00${state.history.length + 1}`;

        const newSession: AttendanceSession = {
          id: tempId,
          date: new Date().toISOString().split('T')[0],
          punchInTime: formatTime(startTimeStamp),
          punchOutTime: formatTime(now),
          totalWorkTime: formatMs(finalWorkMs),
          totalBreakTime: formatMs(finalBreakMs),
          status: 'Completed'
        };

        // 1. Optimistic Local updates
        set({
          isPunchedIn: false,
          isOnBreak: false,
          punchInTime: null,
          totalWorkedBeforeBreak: 0,
          breakStartTime: null,
          totalBreakDuration: 0,
          history: [newSession, ...state.history]
        });

        // 2. Persist to Django PostgreSQL
        try {
          console.log('📤 [STORE] Submitting shift logs to Django attendance endpoint...');
          const payload = {
            punch_in_time: newSession.punchInTime,
            punch_out_time: newSession.punchOutTime,
            total_work_time: newSession.totalWorkTime,
            total_break_time: newSession.totalBreakTime,
            status: 'Completed'
          };
          const backendResponse = await apiRequest<AttendanceSession>('attendance-sessions/', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          if (backendResponse && backendResponse.id) {
            set((currentState) => ({
              history: currentState.history.map(s => s.id === tempId ? backendResponse : s)
            }));
            console.log('✅ [STORE] Shift Attendance persisted successfully in PostgreSQL.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Django attendance persistence failed. Retained session in fallback storage:', err.message);
        }
      }
    }),
    {
      name: 'attendance-storage'
    }
  )
);
