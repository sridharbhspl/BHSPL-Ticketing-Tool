import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Search, Send, Plus, Paperclip, Smile, Info,
  Phone, Video, Shield, Circle, Layers, Users as UsersIcon,
  ChevronRight, FolderKanban, MessageSquare, Monitor, UserPlus,
  PlusCircle, Image, FileText, Download, Sparkles, Mic,
  BarChart2, Code, Link, X, Brain
} from 'lucide-react';
import { useChatStore, type Message } from '../store/useChatStore';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRBACStore } from '../store/useRBACStore';
import CallOverlay from '../components/CallOverlay';


const ChatAvatar = ({ avatar, name, size, borderRadius = '8px', border }: { avatar?: string; name: string; size: number; borderRadius?: string; border?: string }) => {
  const [failed, setFailed] = useState(false);
  
  useEffect(() => {
    setFailed(false);
  }, [avatar]);

  return avatar && !failed ? (
    <img 
      src={avatar} 
      onError={() => setFailed(true)}
      style={{ width: `${size}px`, height: `${size}px`, borderRadius, border, objectFit: 'cover' }} 
      alt="" 
    />
  ) : (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius,
      background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)',
      color: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: size > 40 ? '2rem' : '0.9rem',
      border: border || '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
      textTransform: 'uppercase',
      userSelect: 'none'
    }}>
      {name ? name.trim().charAt(0).toUpperCase() : 'U'}
    </div>
  );
};

const isImageContent = (content: string) => {
  const lower = content.toLowerCase();
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const isUrl = lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:image/');
  const hasImgExt = extensions.some(ext => lower.includes(ext));
  return (isUrl && hasImgExt) || (lower.startsWith('shared file:') && hasImgExt) || lower.startsWith('data:image/');
};

const renderMessageContent = (content: string) => {
  if (isImageContent(content)) {
    let imgSrc = content;
    let label = '';
    
    if (content.startsWith('Shared file:')) {
      const fileNameMatch = content.match(/Shared file:\s*([^\s]+)/);
      const fileName = fileNameMatch ? fileNameMatch[1] : 'Image';
      label = fileName;
      
      if (fileName.toLowerCase().includes('chart') || fileName.toLowerCase().includes('report') || fileName.toLowerCase().includes('analytics')) {
        imgSrc = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
      } else {
        imgSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
      }
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        {label && <span style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'monospace' }}>📄 {label}</span>}
        <motion.img 
          whileHover={{ scale: 1.02 }}
          src={imgSrc} 
          alt="Shared Image" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '280px', 
            borderRadius: '12px', 
            objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            cursor: 'zoom-in'
          }} 
          onClick={() => {
            const win = window.open();
            if (win) win.document.write(`<img src="${imgSrc}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
          }}
        />
      </div>
    );
  }
  return <span>{content}</span>;
};


const Chat: React.FC = () => {
  const { 
    channels, 
    activeTargetId, 
    messages, 
    setActiveTarget, 
    sendMessage,
    activeCall,
    startCall,
    addChannel,
    addMemberToChannel
  } = useChatStore();
  const { users, projects, tickets, addProject } = useTicketStore();
  const { user: currentUser, simulatedRole } = useAuthStore();
  const { hasActionAccess } = useRBACStore();
  const currentRole = simulatedRole || currentUser?.role || 'Developer';
  const [inputValue, setInputValue] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isDialing, setIsDialing] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>(['p1', 'p2']);
  const [isVideoMenuOpen, setIsVideoMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'files' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // High-Fidelity Functional States
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMicMenuOpen, setIsMicMenuOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);


  // Simulation of a dialing phase for industry feel
  useEffect(() => {
    if (activeCall && !activeCall.startTime) {
      setIsDialing(true);
      const timer = setTimeout(() => {
        setIsDialing(false);
        // Start time is already set by store, but we can sync locally
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setIsDialing(false);
    }
  }, [activeCall]);

  const activeTarget = useMemo(() => {
    return channels.find(c => c.id === activeTargetId) || users.find(u => u.id === activeTargetId);
  }, [channels, users, activeTargetId]);

  const activeMessages = useMemo(() => {
    return messages[activeTargetId] || [];
  }, [messages, activeTargetId]);

  // Scoped members based on active target
  const activeMembers = useMemo(() => {
    if (!activeTarget) return users;
    
    if ('memberIds' in activeTarget && activeTarget.memberIds) {
      return users.filter(u => activeTarget.memberIds?.includes(u.id));
    }
    
    if (activeTarget && 'type' in activeTarget) {
      if (activeTarget.type === 'project' && activeTarget.projectId) {
        const pId = String(activeTarget.projectId);
        const memberIds = new Set(tickets.filter(t => String(t.projectId) === pId).map(t => t.assigneeId));
        return users.filter(u => memberIds.has(u.id));
      }
      if (activeTarget.type === 'team' && activeTarget.teamName) {
        const tName = String(activeTarget.teamName).toLowerCase();
        const memberIds = new Set(tickets.filter(t => String(t.assignedTeam).toLowerCase() === tName).map(t => t.assigneeId));
        return users.filter(u => memberIds.has(u.id));
      }
      if (activeTarget.type === 'public') return users;
    }
    
    return users;
  }, [activeTarget, users, tickets]);

  const toggleProject = (pid: string) => {
    setExpandedProjects(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue, currentUser?.id || 'u1');
    setInputValue('');
  };

  const getSender = (senderId: string) => {
    if (senderId === 'system') return { name: 'System', avatar: '' };
    return users.find(u => u.id === senderId) || { name: 'Unknown User', avatar: '' };
  };

  const [showProjectInput, setShowProjectInput] = useState(false);
  const [showTeamInput, setShowTeamInput] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p => {
    const q = chatSearchQuery.toLowerCase();
    if (p.name.toLowerCase().includes(q)) return true;
    
    const projectChannels = channels.filter(ch => String(ch.projectId) === String(p.id));
    return projectChannels.some(ch => 
      (ch.teamName && ch.teamName.toLowerCase().includes(q)) || 
      (ch.name && ch.name.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = {
      id: `p-${Math.random().toString(36).substr(2, 5)}`,
      name: newProjectName,
      description: 'Newly created project',
      code: newProjectName.substring(0, 2).toUpperCase(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    };
    addProject(newProject as any);
    setNewProjectName('');
    setShowProjectInput(false);
  };

  const handleAddTeam = (projectId: string) => {
    if (!newTeamName.trim()) return;
    addChannel({
      id: `ch-${Math.random().toString(36).substr(2, 5)}`,
      name: newTeamName.toLowerCase().replace(/\s+/g, '-'),
      type: 'team',
      projectId,
      teamName: newTeamName,
      description: `${newTeamName} coordination`
    });
    setNewTeamName('');
    setShowTeamInput(null);
  };

  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedInviteUserId, setSelectedInviteUserId] = useState<string | null>(null);

  const handleAddMember = () => {
    setSelectedInviteUserId(null);
    setInviteSearchQuery('');
    setIsAddMemberModalOpen(true);
  };

  const candidates = useMemo(() => {
    if (!activeTarget) return [];
    const currentMemberIds = activeMembers.map(m => m.id);
    return users.filter(user => {
      const isNotAlreadyMember = !currentMemberIds.includes(user.id);
      const matchesSearch = user.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) || 
                            (user.role && user.role.toLowerCase().includes(inviteSearchQuery.toLowerCase()));
      return isNotAlreadyMember && matchesSearch;
    });
  }, [users, activeMembers, inviteSearchQuery, activeTarget]);

  const submitInvite = () => {
    if (!selectedInviteUserId || !activeTargetId) return;
    const targetUser = users.find(u => u.id === selectedInviteUserId);
    if (!targetUser) return;

    addMemberToChannel(activeTargetId, selectedInviteUserId, targetUser.name, currentUser?.name || 'Admin');
    
    setSelectedInviteUserId(null);
    setInviteSearchQuery('');
    setIsAddMemberModalOpen(false);
  };

  // --- Button Futures Logic ---
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // In a real app, you'd upload this blob (new Blob(audioChunksRef.current, { type: 'audio/webm' })). For now, we simulate sending it.
        sendMessage(`Voice Note (${formatTime(recordingTime)})`, currentUser?.id || 'u1');
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent sending
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const simulateUpload = (file?: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            if (file) {
              sendMessage(`Shared file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, currentUser?.id || 'u1');
            }
          }, 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const aiPrompts = [
    { label: "Summarize channel", prompt: "Can you summarize the recent key decisions in this channel?" },
    { label: "Draft status update", prompt: "I've completed the initial design phase for the new portal components. Ready for review." },
    { label: "Suggest reply", prompt: "That sounds like a solid plan. Let's proceed with the modular approach." },
    { label: "Check for blockers", prompt: "Are there any pending blockers for the Bavya Ticketing Tool integration?" }
  ];

  return (
    <>
      <AnimatePresence>
        {activeCall && (
          <CallOverlay 
            targetName={activeTarget?.name || 'Team'} 
            targetAvatar={activeTarget && 'avatar' in activeTarget ? activeTarget.avatar : undefined}
            isDialing={isDialing}
          />
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `340px 1fr ${isInfoOpen ? '300px' : '0px'}`, 
        flex: 1, 
        minHeight: 0, // important for flex children to not overflow 
        backgroundColor: 'rgba(10, 10, 12, 0.4)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Sidebar: Navigation Directory */}
        <aside style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Channels</h2>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProjectInput(!showProjectInput)}
                style={{ color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none' }}
                title="Add Project"
              >
                <PlusCircle size={20} />
              </motion.button>
            </div>

            <AnimatePresence>
              {showProjectInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <input 
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                    placeholder="New project name..."
                    style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', scrollBehavior: 'smooth' }} className="custom-scrollbar hover-scroll">
            {/* Public Channels */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ 
                position: 'sticky', 
                top: 0,
                zIndex: 10, 
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(12px)',
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: 'var(--text-dim)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                padding: '8px 12px', 
                display: 'block', 
                marginBottom: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>General</span>
              {filteredChannels.filter(ch => ch.type === 'public' || ch.type === 'private').map(ch => (
                <motion.div
                  key={ch.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => setActiveTarget(ch.id)}
                  style={{
                    padding: '0.7rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: activeTargetId === ch.id ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    color: activeTargetId === ch.id ? 'var(--primary)' : 'var(--text-muted)',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {ch.type === 'private' ? <Shield size={14} /> : <Hash size={14} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: activeTargetId === ch.id ? 600 : 500 }}>{ch.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project Hierarchy */}
            {filteredProjects.map(project => (
              <div key={project.id} style={{ marginBottom: '1rem' }}>
                <div 
                  onClick={() => toggleProject(project.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.5rem', 
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <motion.div animate={{ rotate: expandedProjects.includes(project.id) || chatSearchQuery ? 90 : 0 }}>
                      <ChevronRight size={14} color="var(--text-dim)" />
                    </motion.div>
                    <FolderKanban size={14} color={project.color} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>{project.name}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2, color: 'var(--primary)' }}
                    onClick={(e) => { e.stopPropagation(); setShowTeamInput(showTeamInput === project.id ? null : project.id); }}
                    style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Add Team Channel"
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showTeamInput === project.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', paddingLeft: '2rem', marginBottom: '0.5rem' }}
                    >
                      <input 
                        autoFocus
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTeam(project.id)}
                        placeholder="Team name..."
                        style={{ width: '100%', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary)', borderRadius: '6px', color: 'white', fontSize: '0.75rem', outline: 'none' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {(expandedProjects.includes(project.id) || chatSearchQuery) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', paddingLeft: '0.5rem' }}
                    >
                      {/* Project Level Channel */}
                      {channels.filter(ch => String(ch.projectId) === String(project.id) && ch.type === 'project').map(ch => (
                        <div
                          key={ch.id}
                          onClick={() => setActiveTarget(ch.id)}
                          style={{
                            padding: '0.6rem 0.75rem 0.6rem 2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: activeTargetId === ch.id ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                            color: activeTargetId === ch.id ? 'var(--primary)' : 'var(--text-muted)',
                            marginTop: '2px'
                          }}
                        >
                          <Layers size={14} />
                          <span style={{ fontSize: '0.85rem', fontWeight: activeTargetId === ch.id ? 600 : 500 }}>HQ / General</span>
                        </div>
                      ))}
                      {/* Team Level Channels */}
                      {channels.filter(ch => {
                        if (String(ch.projectId) !== String(project.id) || ch.type !== 'team') return false;
                        if (!chatSearchQuery) return true;
                        
                        const q = chatSearchQuery.toLowerCase();
                        const projectMatches = project.name.toLowerCase().includes(q);
                        if (projectMatches) return true;
                        
                        return (ch.teamName && ch.teamName.toLowerCase().includes(q)) || 
                               (ch.name && ch.name.toLowerCase().includes(q));
                      }).map(ch => (
                        <div
                          key={ch.id}
                          onClick={() => setActiveTarget(ch.id)}
                          style={{
                            padding: '0.6rem 0.75rem 0.6rem 2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: activeTargetId === ch.id ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                            color: activeTargetId === ch.id ? 'var(--primary)' : 'var(--text-muted)',
                            marginTop: '2px'
                          }}
                        >
                          <UsersIcon size={14} />
                          <span style={{ fontSize: '0.85rem', fontWeight: activeTargetId === ch.id ? 600 : 500 }}>{ch.teamName}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Direct Messages */}
            <div style={{ marginTop: '2rem' }}>
              <span style={{ 
                position: 'sticky', 
                top: 0,
                zIndex: 10, 
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(12px)',
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: 'var(--text-dim)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                padding: '8px 12px', 
                display: 'block', 
                marginBottom: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>Direct Messages</span>
              {filteredUsers.map(u => (
                <motion.div
                  key={u.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => setActiveTarget(u.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: activeTargetId === u.id ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    color: activeTargetId === u.id ? 'var(--primary)' : 'var(--text-muted)',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <ChatAvatar avatar={u.avatar} name={u.name} size={28} borderRadius="8px" />
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid #000' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: activeTargetId === u.id ? 600 : 500 }}>{u.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.05)' }}>
          {/* Chat Header */}
          <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
                {activeTarget && 'type' in activeTarget ? (
                  activeTarget.type === 'project' ? <Layers size={20} /> : 
                  activeTarget.type === 'team' ? <UsersIcon size={20} /> : <Hash size={20} />
                ) : <Circle size={10} fill="var(--success)" stroke="none" />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeTarget && 'projectId' in activeTarget && activeTarget.projectId && (
                    <>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{projects.find(p => p.id === activeTarget.projectId)?.name}</span>
                      <ChevronRight size={12} color="var(--text-dim)" />
                    </>
                  )}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{activeTarget?.name || (activeTarget && 'teamName' in activeTarget ? activeTarget.teamName : '')}</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {activeTarget && 'description' in activeTarget ? activeTarget.description : 'Active Now'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dim)' }}>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => startCall('audio')} 
                className="btn-icon" 
                style={{ width: '40px', height: '40px', borderRadius: '12px' }}
                title="Start Audio Call"
              >
                <Phone size={18} />
              </motion.button>
              
              <div style={{ position: 'relative' }}>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: isVideoMenuOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVideoMenuOpen(!isVideoMenuOpen)} 
                  className="btn-icon" 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px',
                    backgroundColor: isVideoMenuOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: isVideoMenuOpen ? 'white' : 'inherit'
                  }}
                  title="Video Call Options"
                >
                  <Video size={18} />
                </motion.button>
                
                <AnimatePresence>
                  {isVideoMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: 0,
                        backgroundColor: 'rgba(20, 20, 24, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '8px',
                        minWidth: '240px',
                        zIndex: 1000,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      <div 
                        onClick={() => { startCall('video'); setIsVideoMenuOpen(false); }}
                        className="hover-glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
                      >
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                          <Video size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Start Video Call</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Instantly notify members</span>
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => { startCall('video'); setIsVideoMenuOpen(false); }}
                        className="hover-glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
                      >
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '8px' }}>
                          <Monitor size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Share Screen First</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Start broadcasting immediately</span>
                        </div>
                      </div>
                      
                      <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', margin: '4px 8px' }} />
                      
                      <div 
                        onClick={() => { alert('Invite link copied to clipboard!'); setIsVideoMenuOpen(false); }}
                        className="hover-glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
                      >
                        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '8px' }}>
                          <UserPlus size={16} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Copy Invite Link</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Share with external guests</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
              
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: isInfoOpen ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="btn-icon" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px',
                  color: isInfoOpen ? 'var(--primary)' : 'var(--text-dim)',
                  backgroundColor: isInfoOpen ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                }}
                title={isInfoOpen ? "Hide Details" : "Show Details"}
              >
                <Info size={18} />
              </motion.button>
            </div>
          </header>

          {/* Message Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="custom-scrollbar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                  <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                activeMessages.map((msg: Message) => {
                  const sender = getSender(msg.senderId);
                  const isCurrentUser = msg.senderId === currentUser?.id;
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '200px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: isCurrentUser ? 'row-reverse' : 'row' }}>
                      <ChatAvatar avatar={sender.avatar} name={sender.name} size={36} borderRadius="10px" />
                      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sender.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="glass" style={{
                          padding: '0.875rem 1.125rem',
                          borderRadius: isCurrentUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          backgroundColor: isCurrentUser ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                          color: isCurrentUser ? '#000' : 'white',
                          border: isCurrentUser ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.9375rem',
                          lineHeight: '1.5',
                          boxShadow: isCurrentUser ? '0 4px 15px var(--primary-glow)' : 'none'
                        }}>
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Composer: Industrial High-Fidelity Interface */}
          <div style={{ 
            padding: '1.5rem 2rem', 
            borderTop: '1px solid var(--border)', 
            backgroundColor: 'rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Subtle top elevation glow */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '1px', 
              background: 'linear-gradient(90deg, transparent, var(--primary-glow), transparent)', 
              opacity: 0.4 
            }} />

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                
                {/* Creation Tools (Left Group) */}
                <div style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '2px',
                  zIndex: 100
                }}>
                  <div style={{ position: 'relative' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                      type="button" 
                      title="Add Media or Apps"
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '10px', 
                        color: isPlusMenuOpen ? 'var(--primary)' : 'var(--text-dim)',
                        backgroundColor: isPlusMenuOpen ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
                      }}
                    >
                      {isPlusMenuOpen ? <X size={19} /> : <Plus size={19} />}
                    </motion.button>

                    <AnimatePresence>
                      {isPlusMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            left: 0,
                            backgroundColor: 'rgba(20, 20, 24, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '8px',
                            minWidth: '220px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {[
                            { icon: <Image size={16} />, label: "Upload Image", color: "var(--info)", action: () => {
                              const mockFile = { name: 'analytics_chart.png', size: 1.5 * 1024 * 1024 } as File;
                              simulateUpload(mockFile);
                            } },
                            { icon: <BarChart2 size={16} />, label: "Create Poll", color: "var(--success)", action: () => alert('Poll creation UI would open here.') },
                            { icon: <Code size={16} />, label: "Share Code", color: "var(--primary)", action: () => setInputValue(v => v + '```\n\n```') },
                            { icon: <Link size={16} />, label: "Link Ticket", color: "var(--warning)", action: () => alert('Ticket directory would open here.') }
                          ].map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => { item.action(); setIsPlusMenuOpen(false); }}
                              className="hover-glass"
                              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'white' }}
                            >
                              <div style={{ color: item.color }}>{item.icon}</div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)', margin: '0 2px' }} />
                  
                  <div style={{ position: 'relative' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--primary)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      type="button" 
                      title="Insert Emoji"
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '10px', 
                        color: isEmojiPickerOpen ? 'var(--primary)' : 'var(--text-dim)',
                        backgroundColor: isEmojiPickerOpen ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
                      }}
                    >
                      <Smile size={19} />
                    </motion.button>

                    <AnimatePresence>
                      {isEmojiPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            left: 0,
                            backgroundColor: 'rgba(20, 20, 24, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '8px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          {['😊', '😂', '🔥', '👍', '❤️', '🚀', '👀', '🎉', '💡', '✅', '⚠️', '📈'].map(emoji => (
                            <motion.span 
                              key={emoji}
                              whileHover={{ scale: 1.3 }}
                              onClick={() => { setInputValue(v => v + emoji); setIsEmojiPickerOpen(false); }}
                              style={{ fontSize: '1.25rem', cursor: 'pointer' }}
                            >
                              {emoji}
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)', color: isRecording ? 'var(--error)' : 'var(--primary)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (isRecording) {
                          stopRecording();
                        } else {
                          setIsMicMenuOpen(!isMicMenuOpen);
                        }
                      }}
                      type="button" 
                      title={isRecording ? "Stop Recording" : "Voice Options"}
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '10px', 
                        color: isRecording ? 'var(--error)' : (isMicMenuOpen ? 'var(--primary)' : 'var(--text-dim)'),
                        backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.1)' : (isMicMenuOpen ? 'rgba(245, 158, 11, 0.1)' : 'transparent')
                      }}
                    >
                      <Mic size={18} />
                    </motion.button>

                    <AnimatePresence>
                      {isMicMenuOpen && !isRecording && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            left: 0,
                            backgroundColor: 'rgba(20, 20, 24, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '8px',
                            minWidth: '200px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            zIndex: 1000
                          }}
                        >
                          <div 
                            onClick={() => { startRecording(); setIsMicMenuOpen(false); }}
                            className="hover-glass"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'white' }}
                          >
                            <div style={{ color: 'var(--error)' }}><Mic size={16} /></div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Record Voice</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Speak your message</span>
                            </div>
                          </div>
                          
                          <div 
                            onClick={() => { setIsMicMenuOpen(false); document.querySelector<HTMLInputElement>('input[type="text"]')?.focus(); }}
                            className="hover-glass"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'white' }}
                          >
                            <div style={{ color: 'var(--primary)' }}><FileText size={16} /></div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Write Text</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Type in input field</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                  {isRecording ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ 
                        width: '100%', 
                        height: '52px',
                        padding: '0 124px',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid var(--error)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--error)' }} 
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--error)', minWidth: '40px' }}>{formatTime(recordingTime)}</span>
                      
                      {/* Waveform Visualization Placeholder */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
                        {[...Array(24)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ height: [8, Math.random() * 20 + 4, 8] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                            style={{ width: '3px', backgroundColor: 'var(--error)', borderRadius: '2px', opacity: 0.6 }}
                          />
                        ))}
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={cancelRecording}
                        style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Cancel
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1, color: 'var(--success)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={stopRecording}
                        style={{ backgroundColor: 'var(--error)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        Done
                      </motion.button>
                    </motion.div>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Message ${activeTarget?.name || 'Channel'}...`} 
                        style={{ 
                          width: '100%', 
                          padding: '16px 140px 16px 124px', 
                          backgroundColor: 'rgba(255,255,255,0.02)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '16px', 
                          color: 'white', 
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.boxShadow = '0 0 20px var(--primary-glow), inset 0 2px 4px rgba(0,0,0,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      />
                      
                      {isUploading && (
                        <div style={{ position: 'absolute', bottom: '-2px', left: '16px', right: '16px', height: '2px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            style={{ height: '100%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Intelligence & Sending (Right Group) */}
                <div style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  display: 'flex', 
                  gap: '6px', 
                  alignItems: 'center',
                  zIndex: 100
                }}>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    multiple
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1, color: 'white' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    type="button" 
                    title="Attach Files"
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      color: isUploading ? 'var(--primary)' : 'var(--text-dim)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    {isUploading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><PlusCircle size={19} /></motion.div> : <Paperclip size={19} />}
                  </motion.button>

                  <div style={{ position: 'relative' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsAIModalOpen(!isAIModalOpen)}
                      type="button" 
                      title="AI Draft Assistant"
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        color: isAIModalOpen ? 'var(--primary)' : 'var(--text-dim)', 
                        opacity: 0.8,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: isAIModalOpen ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                        borderRadius: '10px'
                      }}
                    >
                      <Sparkles size={18} />
                    </motion.button>

                    <AnimatePresence>
                      {isAIModalOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, x: -100 }}
                          animate={{ opacity: 1, y: 0, x: -180 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 12px)',
                            backgroundColor: 'rgba(20, 20, 24, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '12px',
                            minWidth: '280px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
                            <Brain size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)' }}>AI Command Palette</span>
                          </div>
                          
                          {aiPrompts.map((p, idx) => (
                            <div 
                              key={idx}
                              onClick={() => { setInputValue(p.prompt); setIsAIModalOpen(false); }}
                              className="hover-glass"
                              style={{ padding: '10px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px' }}
                            >
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', color: 'white' }}>{p.label}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.prompt}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

                  <motion.button 
                    animate={{ 
                      scale: inputValue.trim() ? 1.05 : 1,
                      backgroundColor: inputValue.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      color: inputValue.trim() ? '#000' : 'var(--text-dim)',
                      boxShadow: inputValue.trim() ? '0 0 20px var(--primary-glow)' : 'none'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    disabled={!inputValue.trim()}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: inputValue.trim() ? 'none' : '1px solid var(--border)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
              
              {/* Contextual Pro-Tip Footer */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px', 
                opacity: 0.5,
                marginTop: '4px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <Info size={10} color="var(--primary)" />
                  <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pro-Tip</span>
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Use <span style={{ color: 'var(--text-main)' }}>@</span> to mention team members or <span style={{ color: 'var(--text-main)' }}>#</span> to link tickets.
                </p>
              </div>
            </form>
          </div>
        </main>

        {/* Right Sidebar: Context Panel */}
        <aside style={{ 
          borderLeft: '1px solid var(--border)', 
          backgroundColor: 'rgba(0,0,0,0.15)', 
          display: 'flex', 
          flexDirection: 'column',
          width: '300px',
          opacity: isInfoOpen ? 1 : 0,
          visibility: isInfoOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              {activeTarget && 'avatar' in activeTarget ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <ChatAvatar avatar={activeTarget.avatar} name={activeTarget.name} size={80} borderRadius="24px" border="2px solid var(--border)" />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeTarget.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{activeTarget.role}</p>
                </>
              ) : (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    {activeTarget && 'type' in activeTarget && activeTarget.type === 'project' ? <Layers size={40} /> : <UsersIcon size={40} />}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeTarget?.name || (activeTarget && 'teamName' in activeTarget ? activeTarget.teamName : 'Channel')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {activeTarget && 'type' in activeTarget && activeTarget.type === 'project' ? 'Project Coordination Hub' : 'Dedicated Team Workspace'}
                  </p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {activeTarget && 'type' in activeTarget ? (activeTarget.type === 'project' ? 'Project Members' : 'Team Members') : 'Conversation Participants'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{activeMembers.length}</span>
                    {hasActionAccess(currentRole, 'add_member') && (
                      <motion.button 
                        whileHover={{ scale: 1.2, color: 'var(--primary)' }}
                        onClick={handleAddMember}
                        style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <UserPlus size={14} />
                      </motion.button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <ChatAvatar avatar={m.avatar} name={m.name} size={32} borderRadius="10px" />
                        <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid #141418' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Actions</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => setActiveTab(activeTab === 'media' ? null : 'media')}
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.75rem', 
                      fontSize: '0.75rem', 
                      width: '100%',
                      backgroundColor: activeTab === 'media' ? 'rgba(245, 158, 11, 0.15)' : undefined,
                      borderColor: activeTab === 'media' ? 'var(--primary)' : undefined,
                      color: activeTab === 'media' ? 'var(--primary)' : undefined
                    }}
                  >
                    <Image size={14} /> Shared Media
                  </button>
                  <button 
                    onClick={() => setActiveTab(activeTab === 'files' ? null : 'files')}
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.75rem', 
                      fontSize: '0.75rem', 
                      width: '100%',
                      backgroundColor: activeTab === 'files' ? 'rgba(245, 158, 11, 0.15)' : undefined,
                      borderColor: activeTab === 'files' ? 'var(--primary)' : undefined,
                      color: activeTab === 'files' ? 'var(--primary)' : undefined
                    }}
                  >
                    <FileText size={14} /> Pinned Files
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'media' && (
                    <motion.div
                      key="media"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginTop: '1rem' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <motion.div 
                            key={i} 
                            whileHover={{ scale: 1.05 }}
                            style={{ 
                              aspectRatio: '1', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              cursor: 'pointer', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              position: 'relative'
                            }}
                          >
                            <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000}?auto=format&fit=crop&q=80&w=200`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'files' && (
                    <motion.div
                      key="files"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      {[
                        { name: 'Sprint_Q3_Planning.pdf', size: '2.4 MB', type: 'pdf' },
                        { name: 'API_Documentation_v2.docx', size: '1.1 MB', type: 'doc' },
                        { name: 'Design_System_Assets.zip', size: '15.8 MB', type: 'zip' }
                      ].map((f, i) => (
                        <div key={i} className="hover-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
                              <FileText size={16} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{f.name}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{f.size} • Pinned today</span>
                            </div>
                          </div>
                          <Download size={14} color="var(--text-dim)" />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {activeCall && (
          <CallOverlay 
            targetName={activeTarget?.name || 'User'} 
            targetAvatar={activeTarget && 'avatar' in activeTarget ? activeTarget.avatar : undefined}
            isDialing={isDialing}
          />
        )}

        {isAddMemberModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setIsAddMemberModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'rgba(15, 15, 18, 0.95)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Add User to Team</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Invite to {activeTarget?.name || (activeTarget && 'teamName' in activeTarget ? activeTarget.teamName : 'Channel')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search colleagues to add..."
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Candidate Users List */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '20px'
                }}
                className="custom-scrollbar"
              >
                {candidates.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', padding: '20px 0' }}>
                    No users available to add. All coworkers are already in this channel scope!
                  </p>
                ) : (
                  candidates.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      onClick={() => setSelectedInviteUserId(user.id === selectedInviteUserId ? null : user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '12px',
                        border: selectedInviteUserId === user.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.03)',
                        backgroundColor: selectedInviteUserId === user.id ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ChatAvatar avatar={user.avatar} name={user.name} size={36} borderRadius="10px" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{user.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{user.role}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: selectedInviteUserId === user.id ? '5px solid var(--primary)' : '2px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.15s'
                        }}
                      />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitInvite}
                  disabled={!selectedInviteUserId}
                  className="btn-primary"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    opacity: selectedInviteUserId ? 1 : 0.5,
                    cursor: selectedInviteUserId ? 'pointer' : 'not-allowed',
                    fontWeight: 700
                  }}
                >
                  Add to Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chat;
