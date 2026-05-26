import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '../api/apiClient';
import { useNotificationStore } from './useNotificationStore';

export interface WorkflowLog {
  id: string;
  stage: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  message: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  leaveType: 'Full Day Leave' | 'Short Leave' | 'Sick Leave' | 'Casual Leave';
  startDate: string;
  endDate: string;
  duration: string;
  reason: string;
  status: 'Pending L1 Approval' | 'Pending L2 (HR) Approval' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  workflowLogs: WorkflowLog[];
}

interface LeaveState {
  leaveRequests: LeaveRequest[];
  emailLogs: EmailLog[];
  isLoading: boolean;
  error: string | null;
  fetchLeaveRequests: () => Promise<void>;
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'workflowLogs'>) => Promise<void>;
  cancelLeave: (id: string, userName: string, userRole: string) => Promise<void>;
  updateLeave: (id: string, updatedFields: Partial<LeaveRequest>, userName: string, userRole: string) => Promise<void>;
  approveL1: (id: string, pmName: string) => Promise<void>;
  approveL2: (id: string, hrName: string) => Promise<void>;
  rejectLeave: (id: string, reviewerName: string, reviewerRole: string) => Promise<void>;
  clearEmailLogs: () => void;
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'LV-001',
    userId: '2',
    userName: 'Dev User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    leaveType: 'Short Leave',
    startDate: '2026-05-26',
    endDate: '2026-05-26',
    duration: '3 Hours',
    reason: 'Dental appointment in the afternoon.',
    status: 'Pending L1 Approval',
    createdAt: '2026-05-25T08:30:00Z',
    workflowLogs: [
      {
        id: 'WFL-001',
        stage: 'Request Submitted',
        actorName: 'Dev User',
        actorRole: 'Senior Developer',
        timestamp: '2026-05-25T08:30:00Z',
        message: 'Leave request applied. Auto-routed to Project Manager for L1 approval.'
      }
    ]
  },
  {
    id: 'LV-002',
    userId: '3',
    userName: 'QA User',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    leaveType: 'Full Day Leave',
    startDate: '2026-06-02',
    endDate: '2026-06-05',
    duration: '4 Days',
    reason: 'Family wedding event.',
    status: 'Pending L2 (HR) Approval',
    createdAt: '2026-05-24T14:20:00Z',
    workflowLogs: [
      {
        id: 'WFL-002',
        stage: 'Request Submitted',
        actorName: 'QA User',
        actorRole: 'QA Engineer',
        timestamp: '2026-05-24T14:20:00Z',
        message: 'Leave request applied. Auto-routed to Project Manager for L1 approval.'
      },
      {
        id: 'WFL-003',
        stage: 'L1 Approved',
        actorName: 'Bavya Manager',
        actorRole: 'Project Manager',
        timestamp: '2026-05-24T17:45:00Z',
        message: 'L1 Approval completed by Project Manager. Awaiting final HR L2 compliance review.'
      }
    ]
  }
];

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      leaveRequests: initialLeaveRequests,
      emailLogs: [
        {
          id: 'EML-001',
          to: 'pm@bhspl.in',
          subject: 'New Leave Request [LV-001] awaiting L1 Approval',
          body: 'Hello Manager,\n\nA new Short Leave request has been submitted by Dev User.\nReason: Dental appointment in the afternoon.\nDuration: 3 Hours\n\nPlease log into the BHSPL Ticketing Portal to approve/reject.',
          timestamp: '2026-05-25T08:30:00Z'
        }
      ],
      isLoading: false,
      error: null,

      fetchLeaveRequests: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔄 [STORE] Fetching leave requests from Django backend...');
          const data = await apiRequest<LeaveRequest[]>('leave-requests/');
          // Fallback seeding if database returned empty but we have local mockups
          if (data && data.length > 0) {
            set({ leaveRequests: data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          console.log('✅ [STORE] Leave requests fetched successfully.');
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend fetch failed, running in persistent offline fallback mode:', err.message);
          set({ isLoading: false }); // keep local storage data intact on fallback
        }
      },

      applyLeave: async (req) => {
        set({ isLoading: true, error: null });
        const nowStr = new Date().toISOString();
        const tempId = `LV-00${get().leaveRequests.length + 1}`;

        // Local state mockup for optimistic updates & offline fallbacks
        const newLocalRequest: LeaveRequest = {
          ...req,
          id: tempId,
          status: 'Pending L1 Approval',
          createdAt: nowStr,
          workflowLogs: [
            {
              id: `WFL-SUB-${Date.now()}`,
              stage: 'Request Submitted',
              actorName: req.userName,
              actorRole: 'Resource Member',
              timestamp: nowStr,
              message: 'Leave request applied. Auto-routed to Project Manager for L1 approval.'
            }
          ]
        };

        const managerEmail = 'pm@bhspl.in';
        const newEmail: EmailLog = {
          id: `EML-${Date.now()}`,
          to: managerEmail,
          subject: `[BHSPL Alert] New Leave Request [${tempId}] - Awaiting L1 Review`,
          body: `Hello Project Manager,\n\nResource ${req.userName} has applied for a ${req.leaveType}.\nDuration: ${req.duration}\nReason: ${req.reason}\n\nThis request is currently pending L1 Approval.\n\nBest regards,\nBHSPL HR Automations Portal`,
          timestamp: nowStr
        };

        const teammateEmail1: EmailLog = {
          id: `EML-TEAM-1-${Date.now()}`,
          to: 'lead_developer@bhspl.in',
          subject: `[Teammate Leave Notice] ${req.userName} is on ${req.leaveType}`,
          body: `Hello Team Lead,\n\nPlease be informed that your project team member ${req.userName} has submitted a ${req.leaveType} request for L1 approval.\nLeave Dates: ${req.startDate} to ${req.endDate}\nDuration: ${req.duration}\nReason: ${req.reason}\n\nPlease sync sprint coverages and adjust resource schedules accordingly.\n\nBest regards,\nBHSPL HR Automations Portal`,
          timestamp: nowStr
        };

        const teammateEmail2: EmailLog = {
          id: `EML-TEAM-2-${Date.now()}`,
          to: 'qa_engineer@bhspl.in',
          subject: `[Teammate Leave Notice] ${req.userName} is on ${req.leaveType}`,
          body: `Hello Quality Analyst,\n\nPlease be informed that your project team member ${req.userName} has submitted a ${req.leaveType} request for L1 approval.\nLeave Dates: ${req.startDate} to ${req.endDate}\nDuration: ${req.duration}\nReason: ${req.reason}\n\nPlease sync sprint coverages and adjust resource schedules accordingly.\n\nBest regards,\nBHSPL HR Automations Portal`,
          timestamp: nowStr
        };

        // Trigger teammate database notifications
        try {
          useNotificationStore.getState().addNotification({
            type: 'UPDATE',
            title: 'Teammate Leave Applied',
            message: `${req.userName} has applied for ${req.leaveType} (${req.duration}) starting ${req.startDate}`,
            actorName: req.userName,
            actorAvatar: req.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
            targetId: tempId,
            projectLevel: true,
            teamLevel: true
          });
        } catch (notifErr) {
          console.warn('⚠️ Teammate notification trigger warning:', notifErr);
        }

        // First, apply to local storage optimistically
        set((state) => ({
          leaveRequests: [newLocalRequest, ...state.leaveRequests],
          emailLogs: [newEmail, teammateEmail1, teammateEmail2, ...state.emailLogs],
          isLoading: false
        }));

        try {
          console.log('📤 [STORE] Submitting leave request to PostgreSQL...');
          // Map to Django Model properties
          const payload = {
            leave_type: req.leaveType,
            start_date: req.startDate,
            end_date: req.endDate,
            duration: req.duration,
            reason: req.reason
          };
          const backendResponse = await apiRequest<LeaveRequest>('leave-requests/', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          if (backendResponse && backendResponse.id) {
            // Replace the optimistic request with actual backend data
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === tempId ? backendResponse : r)
            }));
            console.log('✅ [STORE] Leave request persisted successfully in PostgreSQL.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Django persistence failed:', err.message);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      approveL1: async (id, pmName) => {
        const nowStr = new Date().toISOString();
        const hrEmail = 'hr@bhspl.in';

        // 1. Optimistic Local update
        set((state) => {
          const updatedRequests = state.leaveRequests.map(r => {
            if (r.id !== id) return r;
            const newLogs = [
              ...r.workflowLogs,
              {
                id: `WFL-L1-${Date.now()}`,
                stage: 'L1 Approved',
                actorName: pmName,
                actorRole: 'Project Manager',
                timestamp: nowStr,
                message: 'L1 Approval completed. Forwarded to Human Resources (L2) for final compliance check.'
              }
            ];
            return {
              ...r,
              status: 'Pending L2 (HR) Approval' as const,
              workflowLogs: newLogs
            };
          });

          const currentReq = state.leaveRequests.find(r => r.id === id);
          if (!currentReq) return {};

          const emailLogs = [
            {
              id: `EML-L1-HR-${Date.now()}`,
              to: hrEmail,
              subject: `[HR Action Needed] Leave Request [${id}] - Awaiting L2 Final Approval`,
              body: `Hello HR Department,\n\nLeave request [${id}] from ${currentReq.userName} has been L1-Approved by Project Manager ${pmName}.\n\nPlease review and provide final L2 Sign-off in the portal.\n\nBest regards,\nBHSPL HR Automations Portal`,
              timestamp: nowStr
            },
            {
              id: `EML-L1-USER-${Date.now()}`,
              to: `${currentReq.userName.toLowerCase().replace(/\s+/g, '')}@bhspl.in`,
              subject: `[Notification] Your Leave Request [${id}] is L1-Approved`,
              body: `Hello ${currentReq.userName},\n\nYour ${currentReq.leaveType} has been approved by your Project Manager (${pmName}).\nIt has now progressed to Stage 2: Final HR (L2) compliance check.\n\nBest regards,\nBHSPL HR Automations Portal`,
              timestamp: nowStr
            },
            ...state.emailLogs
          ];

          return { leaveRequests: updatedRequests, emailLogs };
        });

        // 2. Sync to Django
        try {
          console.log(`📤 [STORE] Triggering L1 Approval for LV-${id} in backend...`);
          const backendResponse = await apiRequest<LeaveRequest>(`leave-requests/${id}/approve-l1/`, {
            method: 'POST'
          });
          if (backendResponse) {
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? backendResponse : r)
            }));
            console.log('✅ [STORE] L1 Approval persisted successfully.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend sync failed, keeping offline PM approval state:', err.message);
        }
      },

      approveL2: async (id, hrName) => {
        const nowStr = new Date().toISOString();

        // 1. Optimistic Local update
        set((state) => {
          const updatedRequests = state.leaveRequests.map(r => {
            if (r.id !== id) return r;
            const newLogs = [
              ...r.workflowLogs,
              {
                id: `WFL-L2-${Date.now()}`,
                stage: 'L2 Final Approval',
                actorName: hrName,
                actorRole: 'HR Generalist',
                timestamp: nowStr,
                message: 'L2 compliance review completed. Full approval finalized and shift logs updated.'
              }
            ];
            return {
              ...r,
              status: 'Approved' as const,
              workflowLogs: newLogs
            };
          });

          const currentReq = state.leaveRequests.find(r => r.id === id);
          if (!currentReq) return {};

          const emailLogs = [
            {
              id: `EML-L2-USER-${Date.now()}`,
              to: `${currentReq.userName.toLowerCase().replace(/\s+/g, '')}@bhspl.in`,
              subject: `🎉 [Fully Approved] Your Leave Request [${id}] is Finalized!`,
              body: `Hello ${currentReq.userName},\n\nGood news! Your ${currentReq.leaveType} has been fully approved by HR (${hrName}).\nYour attendance register and resource calendar have been dynamically updated.\n\nBest regards,\nBHSPL HR Automations Portal`,
              timestamp: nowStr
            },
            {
              id: `EML-L2-TEAM-${Date.now()}`,
              to: 'billing@bhspl.in',
              subject: `[Calendar Sync] Approved Leave Notification - ${currentReq.userName}`,
              body: `Hello Billing & Workforce Management,\n\nPlease note that ${currentReq.userName} will be on ${currentReq.leaveType} from ${currentReq.startDate} to ${currentReq.endDate}.\nDuration: ${currentReq.duration}.\n\nBest regards,\nBHSPL HR Automations Portal`,
              timestamp: nowStr
            },
            ...state.emailLogs
          ];

          return { leaveRequests: updatedRequests, emailLogs };
        });

        // 2. Sync to Django
        try {
          console.log(`📤 [STORE] Triggering L2 Final Sign-off for LV-${id} in backend...`);
          const backendResponse = await apiRequest<LeaveRequest>(`leave-requests/${id}/approve-l2/`, {
            method: 'POST'
          });
          if (backendResponse) {
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? backendResponse : r)
            }));
            console.log('✅ [STORE] L2 Sign-off persisted successfully.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend sync failed, keeping offline L2 final state:', err.message);
        }
      },

      rejectLeave: async (id, reviewerName, reviewerRole) => {
        const nowStr = new Date().toISOString();

        // 1. Optimistic Local update
        set((state) => {
          const updatedRequests = state.leaveRequests.map(r => {
            if (r.id !== id) return r;
            const newLogs = [
              ...r.workflowLogs,
              {
                id: `WFL-REJ-${Date.now()}`,
                stage: 'Leave Rejected',
                actorName: reviewerName,
                actorRole: reviewerRole,
                timestamp: nowStr,
                message: `Request was rejected by ${reviewerName} (${reviewerRole}).`
              }
            ];
            return {
              ...r,
              status: 'Rejected' as const,
              workflowLogs: newLogs
            };
          });

          const currentReq = state.leaveRequests.find(r => r.id === id);
          if (!currentReq) return {};

          const emailLogs = [
            {
              id: `EML-REJ-USER-${Date.now()}`,
              to: `${currentReq.userName.toLowerCase().replace(/\s+/g, '')}@bhspl.in`,
              subject: `[Notification] Leave Request [${id}] - Rejected`,
              body: `Hello ${currentReq.userName},\n\nWe regret to inform you that your request for ${currentReq.leaveType} has been rejected by ${reviewerName} (${reviewerRole}).\n\nPlease get in touch with your lead if you have any questions.\n\nBest regards,\nBHSPL HR Automations Portal`,
              timestamp: nowStr
            },
            ...state.emailLogs
          ];

          return { leaveRequests: updatedRequests, emailLogs };
        });

        // 2. Sync to Django
        try {
          console.log(`📤 [STORE] Triggering rejection for LV-${id} in backend...`);
          const backendResponse = await apiRequest<LeaveRequest>(`leave-requests/${id}/reject/`, {
            method: 'POST'
          });
          if (backendResponse) {
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? backendResponse : r)
            }));
            console.log('✅ [STORE] Rejection persisted successfully.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend sync failed, keeping offline rejection state:', err.message);
        }
      },

      cancelLeave: async (id, userName, userRole) => {
        const nowStr = new Date().toISOString();
        set((state) => {
          const updatedRequests = state.leaveRequests.map(r => {
            if (r.id !== id) return r;
            const newLogs = [
              ...r.workflowLogs,
              {
                id: `WFL-CAN-${Date.now()}`,
                stage: 'Request Cancelled',
                actorName: userName,
                actorRole: userRole,
                timestamp: nowStr,
                message: `Leave request retract initiated. Cancelled by ${userName}.`
              }
            ];
            return {
              ...r,
              status: 'Cancelled' as const,
              workflowLogs: newLogs
            };
          });

          const currentReq = state.leaveRequests.find(r => r.id === id);
          if (!currentReq) return {};

          const newEmail = {
            id: `EML-CAN-${Date.now()}`,
            to: 'pm@bhspl.in',
            subject: `[Leave Cancelled] Retracted Request [${id}] - ${currentReq.userName}`,
            body: `Hello Project Manager,\n\nPlease note that ${currentReq.userName} has retracted/cancelled their leave request [${id}].\n\nBest regards,\nBHSPL HR Automations Portal`,
            timestamp: nowStr
          };

          return { leaveRequests: updatedRequests, emailLogs: [newEmail, ...state.emailLogs] };
        });

        try {
          console.log(`📤 [STORE] Cancelling leave request ${id} in backend...`);
          const backendResponse = await apiRequest<LeaveRequest>(`leave-requests/${id}/cancel/`, {
            method: 'POST'
          });
          if (backendResponse) {
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? backendResponse : r)
            }));
            console.log('✅ [STORE] Cancellation persisted successfully.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend sync failed, keeping offline cancelled state:', err.message);
        }
      },

      updateLeave: async (id, updatedFields, userName, userRole) => {
        const nowStr = new Date().toISOString();
        set((state) => {
          const updatedRequests = state.leaveRequests.map(r => {
            if (r.id !== id) return r;
            const originalStatus = r.status;
            const editLog = {
              id: `WFL-EDIT-${Date.now()}`,
              stage: 'Request Modified',
              actorName: userName,
              actorRole: userRole,
              timestamp: nowStr,
              message: originalStatus === 'Pending L2 (HR) Approval'
                ? `Leave request details modified. Approval vetting flow reset to L1 Manager Vetting.`
                : `Leave request details modified.`
            };
            return {
              ...r,
              ...updatedFields,
              status: 'Pending L1 Approval' as const,
              workflowLogs: [...r.workflowLogs, editLog]
            };
          });

          return { leaveRequests: updatedRequests };
        });

        try {
          console.log(`📤 [STORE] Patching leave request ${id} in backend...`);
          const backendResponse = await apiRequest<LeaveRequest>(`leave-requests/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(updatedFields)
          });
          if (backendResponse) {
            set((state) => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? backendResponse : r)
            }));
            console.log('✅ [STORE] Edit persisted successfully.');
          }
        } catch (err: any) {
          console.warn('⚠️ [STORE] Backend sync failed:', err.message);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      clearEmailLogs: () => set({ emailLogs: [] })
    }),
    {
      name: 'leave-requests-level-storage'
    }
  )
);
