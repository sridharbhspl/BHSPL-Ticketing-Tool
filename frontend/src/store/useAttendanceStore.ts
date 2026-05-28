import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../api/apiClient';

export interface AttendanceSession {
  id: string;
  userId?: string | number;
  userName?: string;
  avatar?: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  totalWorkTime: string; // e.g. "08h 15m"
  totalBreakTime: string; // e.g. "00h 45m"
  status: 'Completed' | 'Active';
  breakDetails?: any[];
  createdAt?: string;
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
  activeBreak: { category: string; description: string; startTime: number; } | null;
  currentBreaks: any[];
  activeSessionId: string | number | null;
  
  fetchAttendanceHistory: () => Promise<void>;
  punchIn: () => Promise<void>;
  startBreak: (category: string, description: string) => Promise<void>;
  endBreak: () => Promise<void>;
  punchOut: () => Promise<void>;
}

// Utility parser for "XXh YYm" string format to milliseconds
const parseMs = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)h\s+(\d+)m/);
  if (!match) return 0;
  return (parseInt(match[1]) * 3600 + parseInt(match[2]) * 60) * 1000;
};

const formatMs = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMsToHHMMSS = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      isPunchedIn: false,
      isOnBreak: false,
      punchInTime: null,
      totalWorkedBeforeBreak: 0,
      breakStartTime: null,
      totalBreakDuration: 0,
      activeBreak: null,
      currentBreaks: [],
      activeSessionId: null,
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
          status: 'Completed',
          breakDetails: [
            {
              id: 'brk-mock1',
              category: 'Lunch / Dinner',
              description: 'Quick lunch break at cafeteria',
              startTime: '2026-05-22T13:00:00.000Z',
              endTime: '2026-05-22T13:30:00.000Z',
              duration: '00:30:00'
            },
            {
              id: 'brk-mock2',
              category: 'Tea / Coffee',
              description: 'Got tea',
              startTime: '2026-05-22T16:00:00.000Z',
              endTime: '2026-05-22T16:15:00.000Z',
              duration: '00:15:00'
            }
          ]
        },
        {
          id: 'ATT-002',
          date: '2026-05-23',
          punchInTime: '08:45 AM',
          punchOutTime: '05:30 PM',
          totalWorkTime: '07h 45m',
          totalBreakTime: '01h 00m',
          status: 'Completed',
          breakDetails: [
            {
              id: 'brk-mock3',
              category: 'Lunch / Dinner',
              description: 'Standard lunch break',
              startTime: '2026-05-23T13:00:00.000Z',
              endTime: '2026-05-23T13:45:00.000Z',
              duration: '00:45:00'
            },
            {
              id: 'brk-mock4',
              category: 'Restroom / Washroom',
              description: 'Short washroom trip',
              startTime: '2026-05-23T15:30:00.000Z',
              endTime: '2026-05-23T15:45:00.000Z',
              duration: '00:15:00'
            }
          ]
        }
      ],

      fetchAttendanceHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔄 [STORE] Fetching attendance logs from Django...');
          const data = await apiRequest<AttendanceSession[]>('attendance-sessions/');
          if (data && data.length > 0) {
            // Check if there is an active session
            const activeSession = data.find(s => s.status === 'Active');
            if (activeSession) {
              const punchInTime = activeSession.createdAt ? new Date(activeSession.createdAt).getTime() : Date.now();
              const totalWorkedBeforeBreak = parseMs(activeSession.totalWorkTime);
              const totalBreakDuration = parseMs(activeSession.totalBreakTime);
              
              // Find if currently on break (any break log with no endTime)
              const breakDetails = activeSession.breakDetails || [];
              const activeBreakLog = breakDetails.find(b => !b.endTime);
              const isOnBreak = !!activeBreakLog;
              
              let breakStartTime: number | null = null;
              let activeBreak = null;
              if (isOnBreak && activeBreakLog) {
                breakStartTime = new Date(activeBreakLog.startTime).getTime();
                activeBreak = {
                  category: activeBreakLog.category,
                  description: activeBreakLog.description || '',
                  startTime: breakStartTime
                };
              }

              set({
                activeSessionId: activeSession.id,
                isPunchedIn: !isOnBreak,
                isOnBreak,
                punchInTime: isOnBreak ? null : punchInTime,
                breakStartTime,
                activeBreak,
                totalWorkedBeforeBreak,
                totalBreakDuration,
                currentBreaks: breakDetails,
                history: data,
                isLoading: false
              });
              console.log('✅ [STORE] Restored active session state from DB:', activeSession.id);
            } else {
              const state = get();
              if (state.activeSessionId) {
                // If activeSessionId was set but DB has no active session, clear local active state
                set({
                  activeSessionId: null,
                  isPunchedIn: false,
                  isOnBreak: false,
                  punchInTime: null,
                  breakStartTime: null,
                  activeBreak: null,
                  totalWorkedBeforeBreak: 0,
                  totalBreakDuration: 0,
                  currentBreaks: [],
                  history: data,
                  isLoading: false
                });
              } else {
                set({ history: data, isLoading: false });
              }
            }
          } else {
            set({ isLoading: false });
          }
          console.log('✅ [STORE] Attendance history synced successfully.');
        } catch (err: any) {
          console.warn('⚠️ [STORE] Django fetch failed. Operating in local storage fallback:', err.message);
          set({ isLoading: false });
        }
      },

      punchIn: async () => {
        const now = Date.now();
        const punchInTimeString = formatTime(now);
        
        // 1. Optimistic local updates
        set({
          isPunchedIn: true,
          isOnBreak: false,
          punchInTime: now,
          totalWorkedBeforeBreak: 0,
          breakStartTime: null,
          totalBreakDuration: 0,
          activeBreak: null,
          currentBreaks: [],
          activeSessionId: null
        });

        // 2. Synchronize to database
        try {
          console.log('📤 [STORE] Creating active shift session in Django...');
          const payload = {
            punchInTime: punchInTimeString,
            punchOutTime: null,
            totalWorkTime: '00h 00m',
            totalBreakTime: '00h 00m',
            status: 'Active',
            breakDetails: []
          };
          const backendResponse = await apiRequest<AttendanceSession>('attendance-sessions/', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          if (backendResponse && backendResponse.id) {
            set((state) => ({
              activeSessionId: backendResponse.id,
              history: [backendResponse, ...state.history.filter(s => s.status !== 'Active')]
            }));
            console.log('✅ [STORE] Active shift session created successfully in PostgreSQL. Session ID:', backendResponse.id);
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Django active shift creation failed. Shift active locally:', err.message);
        }
      },

      startBreak: async (category: string, description: string) => {
        const state = get();
        if (!state.punchInTime) return;
        const now = Date.now();
        const elapsedSinceLastPunch = now - state.punchInTime;
        const newTotalWorked = state.totalWorkedBeforeBreak + elapsedSinceLastPunch;
        
        const activeBreakLog = {
          id: `brk-${now}`,
          category,
          description,
          startTime: new Date(now).toISOString(),
          endTime: null,
          duration: '00:00:00'
        };

        const updatedBreaks = [...state.currentBreaks, activeBreakLog];

        // 1. Local updates
        set({
          isOnBreak: true,
          breakStartTime: now,
          totalWorkedBeforeBreak: newTotalWorked,
          punchInTime: null,
          activeBreak: {
            category,
            description,
            startTime: now
          },
          currentBreaks: updatedBreaks
        });

        // 2. Persist to database
        if (state.activeSessionId) {
          try {
            console.log('📤 [STORE] Syncing active break start to database...', state.activeSessionId);
            const payload = {
              totalWorkTime: formatMs(newTotalWorked),
              totalBreakTime: formatMs(state.totalBreakDuration),
              breakDetails: updatedBreaks,
              status: 'Active'
            };
            await apiRequest<AttendanceSession>(`attendance-sessions/${state.activeSessionId}/`, {
              method: 'PATCH',
              body: JSON.stringify(payload)
            });
            console.log('✅ [STORE] Break start successfully stored in database.');
          } catch (err: any) {
            console.warn('⚠️ [STORE] Django break start sync failed:', err.message);
          }
        }
      },

      endBreak: async () => {
        const state = get();
        if (!state.breakStartTime) return;
        const now = Date.now();
        const elapsedBreak = now - state.breakStartTime;
        const newTotalBreakDuration = state.totalBreakDuration + elapsedBreak;

        const updatedBreaks = state.currentBreaks.map(brk => {
          if (!brk.endTime) {
            return {
              ...brk,
              endTime: new Date(now).toISOString(),
              duration: formatMsToHHMMSS(elapsedBreak)
            };
          }
          return brk;
        });

        // 1. Local updates
        set({
          isOnBreak: false,
          punchInTime: now,
          totalBreakDuration: newTotalBreakDuration,
          breakStartTime: null,
          activeBreak: null,
          currentBreaks: updatedBreaks
        });

        // 2. Persist to database
        if (state.activeSessionId) {
          try {
            console.log('📤 [STORE] Syncing break end to database...', state.activeSessionId);
            const payload = {
              totalWorkTime: formatMs(state.totalWorkedBeforeBreak),
              totalBreakTime: formatMs(newTotalBreakDuration),
              breakDetails: updatedBreaks,
              status: 'Active'
            };
            await apiRequest<AttendanceSession>(`attendance-sessions/${state.activeSessionId}/`, {
              method: 'PATCH',
              body: JSON.stringify(payload)
            });
            console.log('✅ [STORE] Break end successfully stored in database.');
          } catch (err: any) {
            console.warn('⚠️ [STORE] Django break end sync failed:', err.message);
          }
        }
      },

      punchOut: async () => {
        const state = get();
        let finalWorkMs = state.totalWorkedBeforeBreak;
        let finalBreakMs = state.totalBreakDuration;
        const now = Date.now();

        if (state.isPunchedIn && state.punchInTime) {
          finalWorkMs += (now - state.punchInTime);
        }
        
        let updatedBreaks = [...state.currentBreaks];
        if (state.isOnBreak && state.breakStartTime && state.activeBreak) {
          const elapsedBreak = now - state.breakStartTime;
          finalBreakMs += elapsedBreak;
          updatedBreaks = state.currentBreaks.map(brk => {
            if (!brk.endTime) {
              return {
                ...brk,
                endTime: new Date(now).toISOString(),
                duration: formatMsToHHMMSS(elapsedBreak)
              };
            }
            return brk;
          });
        }

        const startTimeStamp = state.punchInTime || now - finalWorkMs - finalBreakMs;
        const tempId = state.activeSessionId || `ATT-00${state.history.length + 1}`;

        const newSession: AttendanceSession = {
          id: String(tempId),
          date: new Date().toISOString().split('T')[0],
          punchInTime: formatTime(startTimeStamp),
          punchOutTime: formatTime(now),
          totalWorkTime: formatMs(finalWorkMs),
          totalBreakTime: formatMs(finalBreakMs),
          status: 'Completed',
          breakDetails: updatedBreaks
        };

        // 1. Local updates
        set({
          isPunchedIn: false,
          isOnBreak: false,
          punchInTime: null,
          totalWorkedBeforeBreak: 0,
          breakStartTime: null,
          totalBreakDuration: 0,
          activeBreak: null,
          currentBreaks: [],
          activeSessionId: null,
          history: [newSession, ...state.history.filter(s => s.id !== String(tempId))]
        });

        // 2. Persist to Django PostgreSQL
        try {
          console.log('📤 [STORE] Submitting shift punch-out to Django attendance endpoint...');
          const payload = {
            punchInTime: newSession.punchInTime,
            punchOutTime: newSession.punchOutTime,
            totalWorkTime: newSession.totalWorkTime,
            totalBreakTime: newSession.totalBreakTime,
            status: 'Completed',
            breakDetails: updatedBreaks
          };
          
          let backendResponse: AttendanceSession;
          if (state.activeSessionId) {
            backendResponse = await apiRequest<AttendanceSession>(`attendance-sessions/${state.activeSessionId}/`, {
              method: 'PATCH',
              body: JSON.stringify(payload)
            });
          } else {
            backendResponse = await apiRequest<AttendanceSession>('attendance-sessions/', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
          }

          if (backendResponse && backendResponse.id) {
            set((currentState) => ({
              history: [backendResponse, ...currentState.history.filter(s => s.id !== String(tempId) && s.id !== backendResponse.id)]
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
