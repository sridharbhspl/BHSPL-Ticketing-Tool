import { create } from 'zustand';
import type { Ticket, SubTask, Project, User, TicketFilters, Comment, Team, TeamMember } from '../types';
import { useNotificationStore } from './useNotificationStore';
import { ticketsApi } from '../api/tickets.api';
import { useAuthStore } from './useAuthStore';

interface TicketState {
  tickets: Ticket[];
  subTasks: SubTask[];
  projects: Project[];
  users: User[];
  teams: Team[];
  teamMembers: TeamMember[];
  comments: Comment[];
  currentUser: User | null;
  filters: TicketFilters;
  isCreateModalOpen: boolean;
  isSubTaskModalOpen: boolean;
  selectedTicketId: string | null;
  drawerMode: 'view' | 'edit';
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchInitialData: () => Promise<void>;
  addTicket: (ticket: Partial<Ticket>) => Promise<void>;
  addSubTask: (subTask: Partial<SubTask>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>, oldStatus?: string) => Promise<void>;
  updateSubTask: (id: string, updates: Partial<SubTask>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addComment: (ticketId: string, content: string) => Promise<void>;
  setFilters: (filters: TicketFilters) => void;
  setCreateModalOpen: (open: boolean) => void;
  setSubTaskModalOpen: (open: boolean) => void;
  setSelectedTicketId: (id: string | null) => void;
  setDrawerMode: (mode: 'view' | 'edit') => void;
  setTickets: (tickets: Ticket[]) => void;
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTeam: (team: Partial<Team>) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  addUser: (userInput: Partial<User> & { password?: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTeamMember: (memberInput: { teamId: string | number; userId: string | number; role?: string }) => Promise<void>;
  removeTeamMember: (id: string | number) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  subTasks: [],
  projects: [],
  users: [],
  teams: [],
  teamMembers: [],
  comments: [],
  currentUser: null,
  filters: {},
  isCreateModalOpen: false,
  isSubTaskModalOpen: false,
  selectedTicketId: null,
  drawerMode: 'view',
  isLoading: false,
  error: null,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [tickets, projects, users, subTasks, teams, teamMembers] = await Promise.all([
        ticketsApi.getTickets(),
        ticketsApi.getProjects(),
        ticketsApi.getUsers(),
        ticketsApi.getSubTasks(),
        ticketsApi.getTeams(),
        ticketsApi.getTeamMembers(),
      ]);
      const currentUser = useAuthStore.getState().user;
      set({ tickets, projects, users, subTasks, teams, teamMembers, currentUser, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addTicket: async (ticketInput) => {
    try {
      const newTicket = await ticketsApi.createTicket(ticketInput);
      set((state) => ({ tickets: [newTicket, ...state.tickets] }));
      
      const currentUser = useAuthStore.getState().user;
      useNotificationStore.getState().addNotification({
        type: 'CREATE',
        title: 'New Ticket Created',
        message: `created task ${newTicket.id}: "${newTicket.title}"`,
        actorName: currentUser?.name || 'System',
        actorAvatar: currentUser?.avatar || '',
        targetId: newTicket.id,
        projectLevel: true,
        teamLevel: true
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addSubTask: async (subTaskInput) => {
    try {
      if (!subTaskInput.parentTicketId) throw new Error('Parent Ticket ID is required');
      const newSubTask = await ticketsApi.addSubTask(subTaskInput.parentTicketId, subTaskInput);
      set((state) => ({ subTasks: [newSubTask, ...state.subTasks] }));
      
      const currentUser = useAuthStore.getState().user;
      useNotificationStore.getState().addNotification({
        type: 'WORKLOG',
        title: 'Worklog Entry Added',
        message: `added a worklog for ${newSubTask.parentTicketId}`,
        actorName: currentUser?.name || 'System',
        actorAvatar: currentUser?.avatar || '',
        targetId: newSubTask.id,
        teamLevel: true
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addComment: async (ticketId, content) => {
    try {
      const newComment = await ticketsApi.addComment(ticketId, content);
      set((state) => ({ comments: [...state.comments, newComment] }));
      
      const currentUser = useAuthStore.getState().user;
      useNotificationStore.getState().addNotification({
        type: 'UPDATE',
        title: 'New Comment Added',
        message: `commented on ${ticketId}`,
        actorName: currentUser?.name || 'System',
        actorAvatar: currentUser?.avatar || '',
        targetId: ticketId,
        teamLevel: true
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateTicket: async (id, updates, oldStatus) => {
    try {
      const oldTicket = useTicketStore.getState().tickets.find(t => t.id === id);
      const prevStatus = oldStatus || oldTicket?.status;
      const updatedTicket = await ticketsApi.updateTicket(id, updates);
      set((state) => {
        const currentUser = useAuthStore.getState().user;
        if (updates.status && prevStatus && prevStatus !== updates.status) {
          useNotificationStore.getState().addNotification({
            type: 'STATUS',
            title: 'Workflow Status Updated',
            message: `moved ${id} from "${prevStatus}" to "${updates.status}"`,
            actorName: currentUser?.name || 'System',
            actorAvatar: currentUser?.avatar || '',
            targetId: id,
            projectLevel: true,
            teamLevel: true
          });
        } else {
          // General parameter updates (priority, description, assignee, etc.)
          useNotificationStore.getState().addNotification({
            type: 'UPDATE',
            title: 'Ticket Parameters Updated',
            message: `updated parameters/details for ticket ${id}: "${updatedTicket.title}"`,
            actorName: currentUser?.name || 'System',
            actorAvatar: currentUser?.avatar || '',
            targetId: id,
            projectLevel: true,
            teamLevel: true
          });
        }
        return {
          tickets: state.tickets.map((t) => (t.id === id ? updatedTicket : t))
        };
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateSubTask: async (id, updates) => {
    try {
      // Assuming subtasks can be updated via a generic endpoint if needed, 
      // but for now updating local state if API success is implied or would need a separate subtask update endpoint.
      // Since we don't have a direct subtask update endpoint in ticketsApi yet, I'll update local for now or add one.
      set((state) => ({
        subTasks: state.subTasks.map((st) => (st.id === id ? { ...st, ...updates, updatedAt: new Date().toISOString() } : st))
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTicket: async (id) => {
    try {
      await ticketsApi.deleteTicket(id);
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  setFilters: (filters) => set({ filters }),
  
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSubTaskModalOpen: (open) => set({ isSubTaskModalOpen: open }),
  setSelectedTicketId: (id: string | null) => set({ selectedTicketId: id }),
  setDrawerMode: (mode: 'view' | 'edit') => set({ drawerMode: mode }),
  setTickets: (tickets) => set({ tickets }),
  addProject: async (projectInput) => {
    try {
      const newProject = await ticketsApi.createProject(projectInput);
      set((state) => ({ projects: [...state.projects, newProject] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  updateProject: async (id, updates) => {
    try {
      const updatedProject = await ticketsApi.updateProject(id, updates);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p))
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  deleteProject: async (id) => {
    try {
      await ticketsApi.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  addTeam: async (teamInput) => {
    try {
      const newTeam = await ticketsApi.createTeam(teamInput);
      set((state) => ({ teams: [...state.teams, newTeam] }));
      return newTeam;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  updateTeam: async (id, updates) => {
    try {
      const updatedTeam = await ticketsApi.updateTeam(id, updates);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? updatedTeam : t))
      }));
      return updatedTeam;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  deleteTeam: async (id) => {
    try {
      await ticketsApi.deleteTeam(id);
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  addUser: async (userInput) => {
    try {
      const newUser = await ticketsApi.createUser(userInput);
      set((state) => ({ users: [...state.users, newUser] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  updateUser: async (id, updates) => {
    try {
      const updatedUser = await ticketsApi.updateUser(id, updates);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u))
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  deleteUser: async (id) => {
    try {
      await ticketsApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  addTeamMember: async (memberInput: { teamId: string | number; userId: string | number; role?: string }) => {
    try {
      const newMember = await ticketsApi.createTeamMember(memberInput);
      set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
  removeTeamMember: async (id: string | number) => {
    try {
      await ticketsApi.deleteTeamMember(id);
      set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
