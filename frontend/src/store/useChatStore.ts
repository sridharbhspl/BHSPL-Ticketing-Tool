import { create } from 'zustand';

export type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'system' | 'file';
  attachments?: string[];
};

export type ChatChannel = {
  id: string;
  name: string;
  type: 'public' | 'private' | 'project' | 'team';
  projectId?: string;
  teamName?: string;
  description: string;
  unreadCount: number;
  memberIds?: string[];
};

interface ChatState {
  channels: ChatChannel[];
  activeTargetId: string;
  messages: Record<string, Message[]>; // Key is channelId or userId
  typingUsers: string[];
  activeCall: {
    isActive: boolean;
    type: 'audio' | 'video';
    startTime?: string;
    isScreenSharing: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  } | null;
  
  // Actions
  setActiveTarget: (id: string) => void;
  sendMessage: (content: string, senderId: string) => void;
  markAsRead: (targetId: string) => void;
  addSystemMessage: (targetId: string, content: string) => void;
  addChannel: (channel: Omit<ChatChannel, 'unreadCount'>) => void;
  addMemberToChannel: (channelId: string, userId: string, userName: string, actorName: string) => void;
  startCall: (type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channels: [
    { id: 'ch-general', name: 'general', type: 'public', description: 'Company-wide announcements', unreadCount: 0, memberIds: ['u1', 'u2', 'u3', 'u4'] },
    // Project: Nebula Portal
    { id: 'ch-p1-hq', name: 'nebula-hq', type: 'project', projectId: 'p1', description: 'Nebula Portal main coordination', unreadCount: 0, memberIds: ['u1', 'u2', 'u3'] },
    { id: 'ch-p1-platform', name: 'platform-eng', type: 'team', projectId: 'p1', teamName: 'Platform Engineering', description: 'Core infrastructure team', unreadCount: 2, memberIds: ['u1', 'u3'] },
    { id: 'ch-p1-ui', name: 'ui-design', type: 'team', projectId: 'p1', teamName: 'UI Engineering', description: 'Design and frontend discussions', unreadCount: 0, memberIds: ['u2', 'u4'] },
    // Project: Skyline API
    { id: 'ch-p2-hq', name: 'skyline-ops', type: 'project', projectId: 'p2', description: 'Skyline API operations', unreadCount: 1, memberIds: ['u1', 'u4'] },
    { id: 'ch-p2-backend', name: 'backend-core', type: 'team', projectId: 'p2', teamName: 'Backend Systems', description: 'API architecture and database', unreadCount: 0, memberIds: ['u1', 'u2'] },
    
    { id: 'ch-incidents', name: 'incident-response', type: 'private', description: 'Active high-priority incident coordination', unreadCount: 0, memberIds: ['u1', 'u2', 'u3'] },
  ],
  activeTargetId: 'ch-general',
  messages: {
    'ch-general': [
      { id: 'm1', senderId: 'u1', content: 'Good morning team! Let\'s finalize the sprint goals today.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'read', type: 'text' },
      { id: 'm2', senderId: 'system', content: 'Sarah Chen joined the channel', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), status: 'read', type: 'system' },
      { id: 'm3', senderId: 'u2', content: 'Will do. I\'ve updated the Kanban board with the new tasks.', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read', type: 'text' },
    ],
    'ch-dev': [
      { id: 'm4', senderId: 'u3', content: 'The new OAuth implementation is ready for review.', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'read', type: 'text' },
      { id: 'm5', senderId: 'u2', content: 'Awesome, I\'ll take a look after the standup.', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'read', type: 'text' },
    ],
    'u2': [ // DM with Sarah Chen
      { id: 'm6', senderId: 'u2', content: 'Hey Alex, do you have a minute to discuss the database migration?', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'read', type: 'text' },
    ]
  },
  typingUsers: [],
  activeCall: null,

  setActiveTarget: (id) => set({ activeTargetId: id }),
  
  sendMessage: (content, senderId) => set((state) => {
    const newMessage: Message = {
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    };
    
    return {
      messages: {
        ...state.messages,
        [state.activeTargetId]: [...(state.messages[state.activeTargetId] || []), newMessage]
      }
    };
  }),

  markAsRead: (targetId) => set((state) => ({
    channels: state.channels.map(c => c.id === targetId ? { ...c, unreadCount: 0 } : c)
  })),

  addSystemMessage: (targetId, content) => set((state) => {
    const sysMsg: Message = {
      id: `sys-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      content,
      timestamp: new Date().toISOString(),
      status: 'read',
      type: 'system'
    };
    return {
      messages: {
        ...state.messages,
        [targetId]: [...(state.messages[targetId] || []), sysMsg]
      }
    };
  }),

  addChannel: (channel) => set((state) => ({
    channels: [...state.channels, { ...channel, unreadCount: 0, memberIds: channel.memberIds || ['u1'] }]
  })),

  addMemberToChannel: (channelId, userId, userName, actorName) => set((state) => {
    const updatedChannels = state.channels.map(c => {
      if (c.id === channelId) {
        const currentMembers = c.memberIds || [];
        if (!currentMembers.includes(userId)) {
          return { ...c, memberIds: [...currentMembers, userId] };
        }
      }
      return c;
    });

    const sysMsg: Message = {
      id: `sys-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      content: `${actorName} added ${userName} to the channel`,
      timestamp: new Date().toISOString(),
      status: 'read',
      type: 'system'
    };

    return {
      channels: updatedChannels,
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] || []), sysMsg]
      }
    };
  }),

  startCall: (type) => set({
    activeCall: {
      isActive: true,
      type,
      startTime: new Date().toISOString(),
      isScreenSharing: false,
      isMuted: false,
      isVideoOff: false
    }
  }),

  endCall: () => set({ activeCall: null }),

  toggleMute: () => set((state) => ({
    activeCall: state.activeCall ? { ...state.activeCall, isMuted: !state.activeCall.isMuted } : null
  })),

  toggleVideo: () => set((state) => ({
    activeCall: state.activeCall ? { ...state.activeCall, isVideoOff: !state.activeCall.isVideoOff } : null
  })),

  toggleScreenShare: () => set((state) => ({
    activeCall: state.activeCall ? { ...state.activeCall, isScreenSharing: !state.activeCall.isScreenSharing } : null
  }))
}));
