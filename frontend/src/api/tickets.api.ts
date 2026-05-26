import { apiRequest } from './apiClient';
import type { Ticket, SubTask, Project, User, Comment, Team, TeamMember, AppNotification } from '../types';

export const ticketsApi = {
  // Tickets
  getTickets: () => apiRequest<Ticket[]>('tickets/'),
  createTicket: (ticket: Partial<Ticket>) => apiRequest<Ticket>('tickets/', {
    method: 'POST',
    body: JSON.stringify(ticket),
  }),
  updateTicket: (id: string, updates: Partial<Ticket>) => apiRequest<Ticket>(`tickets/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteTicket: (id: string) => apiRequest<void>(`tickets/${id}/`, {
    method: 'DELETE',
  }),

  // Projects
  getProjects: () => apiRequest<Project[]>('projects/'),
  createProject: (project: Partial<Project>) => apiRequest<Project>('projects/', {
    method: 'POST',
    body: JSON.stringify(project),
  }),
  updateProject: (id: string, updates: Partial<Project>) => apiRequest<Project>(`projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteProject: (id: string) => apiRequest<void>(`projects/${id}/`, {
    method: 'DELETE',
  }),
  
  // Users (for assignment and management)
  getUsers: () => apiRequest<User[]>('users/'),
  createUser: (user: Partial<User> & { password?: string }) => apiRequest<User>('users/', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  updateUser: (id: string, updates: Partial<User>) => apiRequest<User>(`users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteUser: (id: string) => apiRequest<void>(`users/${id}/`, {
    method: 'DELETE',
  }),

  // Comments
  addComment: (ticketId: string, content: string) => apiRequest<Comment>(`tickets/${ticketId}/add_comment/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Subtasks
  addSubTask: (ticketId: string, subTask: Partial<SubTask>) => apiRequest<SubTask>(`tickets/${ticketId}/add_subtask/`, {
    method: 'POST',
    body: JSON.stringify(subTask),
  }),
  getSubTasks: () => apiRequest<SubTask[]>('subtasks/'),
  
  // Teams
  getTeams: () => apiRequest<Team[]>('teams/'),
  createTeam: (team: Partial<Team>) => apiRequest<Team>('teams/', {
    method: 'POST',
    body: JSON.stringify(team),
  }),
  updateTeam: (id: string, updates: Partial<Team>) => apiRequest<Team>(`teams/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteTeam: (id: string) => apiRequest<void>(`teams/${id}/`, {
    method: 'DELETE',
  }),
  getTeamMembers: () => apiRequest<TeamMember[]>('team-members/'),
  createTeamMember: (member: { teamId: string | number; userId: string | number; role?: string }) => apiRequest<TeamMember>('team-members/', {
    method: 'POST',
    body: JSON.stringify({
      teamId: member.teamId,
      userId: member.userId,
      role: member.role || 'Member'
    }),
  }),
  deleteTeamMember: (id: string | number) => apiRequest<void>(`team-members/${id}/`, {
    method: 'DELETE',
  }),

  // Notifications
  getNotifications: () => apiRequest<AppNotification[]>('notifications/'),
  markNotificationAsRead: (id: string | number) => apiRequest<AppNotification>(`notifications/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead: true }),
  }),
  markAllNotificationsAsRead: () => apiRequest<{ status: string; message: string }>('notifications/mark_all_as_read/', {
    method: 'POST',
  }),
};
