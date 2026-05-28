export type TicketStatus = 'Open' | 'In Progress' | 'Blocked' | 'In Review' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketType = 'Bug' | 'Feature' | 'Task' | 'Improvement';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Admin' | 'Project Manager' | 'Developer' | 'Frontend Developer' | 'Backend Developer' | 'Fullstack Developer' | 'Senior Developer' | 'Junior Developer' | 'Senior Tester' | 'Junior Tester' | 'QA Tester' | 'Client' | 'Viewer';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  code: string;
  icon?: string;
  color: string;
};

export type Comment = {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category: string;
  subcategory: string;
  service: string;
  impact: 'Low' | 'Medium' | 'High';
  usersAffected: number;
  environment: 'Prod' | 'UAT' | 'Test' | 'Dev';
  projectId: string;
  assigneeId?: string;
  assignedTeam?: string;
  reporterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  slaDueDate?: string;
  tags: string[];
  attachments: string[];
  technicalInfo: {
    browser: string;
    os: string;
    device: string;
  };
};

export type TicketFilters = {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  projectId?: string;
  search?: string;
  assigneeId?: string;
};

export type SubTask = {
  id: string;
  parentTicketId: string;
  title: string;
  description: string;
  type: 'Analysis' | 'Development' | 'Testing' | 'Documentation' | 'Review';
  assignedEngineerId: string;
  team: string;
  workDate: string;
  hoursWorked: number;
  workDoneToday: string;
  pendingWork?: string;
  blockers?: string;
  status: 'Open' | 'In Progress' | 'Done';
  completionPercentage: number;
  codeBranch?: string;
  buildVersion?: string;
  testingStatus?: 'Pending' | 'Passed' | 'Failed';
  reviewedBy?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  id: string;
  name: string;
  projectId?: string;
  description: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: 'Lead' | 'Member';
  joinedAt: string;
};

export type AppNotification = {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'STATUS' | 'WORKLOG';
  title: string;
  message: string;
  actorName: string;
  actorAvatar: string;
  targetId: string;
  timestamp: string;
  isRead: boolean;
  projectLevel?: boolean;
  teamLevel?: boolean;
};

export type Category = {
  id: string | number;
  name: string;
};

export type Subcategory = {
  id: string | number;
  category: string | number;
  name: string;
};

export type TicketTypeOption = {
  id: string | number;
  name: string;
};

export type EnvironmentOption = {
  id: string | number;
  name: string;
};

