import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  AlignLeft, 
  Send
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import type { Ticket, TicketStatus, TicketPriority } from '../types';
import ConfirmationModal from './common/ConfirmationModal';
import { useAuthStore } from '../store/useAuthStore';
import { useRBACStore } from '../store/useRBACStore';

const TicketDetailsDrawer: React.FC = () => {
  const { 
    tickets, 
    projects, 
    users, 
    comments,
    selectedTicketId, 
    setSelectedTicketId, 
    updateTicket, 
    deleteTicket,
    addComment,
    currentUser,
    drawerMode
  } = useTicketStore();

  const { user: authUser, simulatedRole } = useAuthStore();
  const currentRole = simulatedRole || authUser?.role || 'Developer';
  const { hasActionAccess } = useRBACStore();

  const canEdit = hasActionAccess(currentRole, 'edit_ticket');
  const canDelete = hasActionAccess(currentRole, 'delete_ticket');

  const activeMode = drawerMode === 'edit' && canEdit ? 'edit' : 'view';

  const ticket = tickets.find(t => t.id === selectedTicketId);
  const ticketComments = comments.filter(c => c.ticketId === selectedTicketId);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Ticket>>({});
  const [activeTab, setActiveTab] = useState<'comments' | 'activity' | 'attachments'>('comments');
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicketId || !currentUser) return;
    addComment(selectedTicketId, newComment.trim());
    setNewComment('');
  };

  const [isSaving, setIsSaving] = useState(false);
  const lastIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Optimization: Only re-sync from store if we are NOT currently editing
    // or if the ticket ID has actually changed.
    const hasIdChanged = selectedTicketId !== lastIdRef.current;
    
    if (selectedTicketId && (hasIdChanged || !isEditing)) {
      const currentTicket = tickets.find(t => t.id === selectedTicketId);
      if (currentTicket) {
        setEditData(prev => {
          // Only update if the data is actually different to avoid unnecessary renders
          if (hasIdChanged || JSON.stringify(prev) !== JSON.stringify(currentTicket)) {
            return currentTicket;
          }
          return prev;
        });
        
        if (hasIdChanged) {
          setIsEditing(false);
          lastIdRef.current = selectedTicketId;
        }
      }
    }
    
    if (!selectedTicketId) {
      lastIdRef.current = null;
    }
  }, [selectedTicketId, tickets, isEditing]);


  const handleSave = () => {
    setIsConfirmingSave(true);
  };

  const handleFinalSave = () => {
    if (selectedTicketId && ticket) {
      setIsSaving(true);
      // Simulate network delay for industry feel
      setTimeout(() => {
        updateTicket(selectedTicketId, editData, ticket.status);
        setIsEditing(false);
        setIsSaving(false);
        setIsConfirmingSave(false);
      }, 600);
    }
  };

  const handleDelete = () => {
    setIsConfirmingDelete(true);
  };

  const handleFinalDelete = () => {
    if (ticket) {
      deleteTicket(ticket.id);
      setSelectedTicketId(null);
      setIsConfirmingDelete(false);
    }
  };

  const statusOptions: TicketStatus[] = ['Open', 'In Progress', 'In Review', 'Resolved', 'Closed'];
  const priorityOptions: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  return (
    <AnimatePresence mode="wait">
      {selectedTicketId && ticket && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicketId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 998
            }}
          />

          {/* Drawer Container */}
          <motion.div
            key="ticket-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              right: 0, top: 0, bottom: 0,
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#0f0f12',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--border)'
            }}
          >
            {/* Header */}
             <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '6px', letterSpacing: '1px' }}>
                  {ticket.id}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {canDelete && (
                    <button onClick={handleDelete} className="btn-icon" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTicketId(null)} className="btn-icon"><X size={20} /></button>
            </div>

            {/* Scrollable Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {/* Title Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <textarea 
                  value={editData.title || ''}
                  onChange={(e) => {
                    if (activeMode === 'view') return;
                    setEditData({ ...editData, title: e.target.value });
                    setIsEditing(true);
                  }}
                   readOnly={activeMode === 'view'}
                  placeholder="Ticket Title"
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'white',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: '1.3',
                    marginBottom: '1rem',
                    cursor: activeMode === 'view' ? 'default' : 'text'
                  }}
                  rows={2}
                />

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                    <select 
                      value={editData.status} 
                      disabled={activeMode === 'view'}
                      onChange={(e) => {
                        setEditData({ ...editData, status: e.target.value as TicketStatus });
                        setIsEditing(true);
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.85rem', cursor: activeMode === 'view' ? 'default' : 'pointer' }}
                    >
                      {statusOptions.map(opt => <option key={opt} value={opt} style={{ backgroundColor: '#0f0f12' }}>{opt}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Project</span>
                    <select 
                      value={editData.projectId || ''} 
                      disabled={activeMode === 'view'}
                      onChange={(e) => {
                        setEditData({ ...editData, projectId: e.target.value });
                        setIsEditing(true);
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.85rem', cursor: activeMode === 'view' ? 'default' : 'pointer' }}
                    >
                      <option value="" style={{ backgroundColor: '#0f0f12' }}>Select Project...</option>
                      {projects.map(opt => <option key={opt.id} value={opt.id} style={{ backgroundColor: '#0f0f12' }}>{opt.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Priority</span>
                    <select 
                      value={editData.priority} 
                      disabled={activeMode === 'view'}
                      onChange={(e) => {
                        setEditData({ ...editData, priority: e.target.value as TicketPriority });
                        setIsEditing(true);
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.85rem', cursor: activeMode === 'view' ? 'default' : 'pointer' }}
                    >
                      {priorityOptions.map(opt => <option key={opt} value={opt} style={{ backgroundColor: '#0f0f12' }}>{opt}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Team</span>
                    <select 
                      value={editData.assignedTeam || 'Support Engineering'} 
                      disabled={activeMode === 'view'}
                      onChange={(e) => {
                        setEditData({ ...editData, assignedTeam: e.target.value });
                        setIsEditing(true);
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.85rem', cursor: activeMode === 'view' ? 'default' : 'pointer' }}
                    >
                      <option value="Support Engineering" style={{ backgroundColor: '#0f0f12' }}>Support Engineering</option>
                      <option value="Platform Engineering" style={{ backgroundColor: '#0f0f12' }}>Platform Engineering</option>
                      <option value="UI/UX Core" style={{ backgroundColor: '#0f0f12' }}>UI/UX Core</option>
                      <option value="Database Ops" style={{ backgroundColor: '#0f0f12' }}>Database Ops</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Assignee</span>
                    <select 
                      value={editData.assigneeId || ''} 
                      disabled={activeMode === 'view'}
                      onChange={(e) => {
                        setEditData({ ...editData, assigneeId: e.target.value });
                        setIsEditing(true);
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.85rem', cursor: activeMode === 'view' ? 'default' : 'pointer' }}
                    >
                      <option value="" style={{ backgroundColor: '#0f0f12' }}>Unassigned</option>
                      {users.map(opt => <option key={opt.id} value={opt.id} style={{ backgroundColor: '#0f0f12' }}>{opt.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-dim)' }}>
                  <AlignLeft size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea 
                    value={editData.description || ''}
                    readOnly={activeMode === 'view'}
                    onChange={(e) => {
                      if (activeMode === 'view') return;
                      setEditData({ ...editData, description: e.target.value });
                      setIsEditing(true);
                    }}
                    placeholder="Describe the objective or issue in detail..."
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      outline: 'none',
                      resize: activeMode === 'view' ? 'none' : 'vertical',
                      cursor: activeMode === 'view' ? 'default' : 'text'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '0.7rem', color: 'var(--text-dim)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    {(editData.description || '').length} characters
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                {(['comments', 'activity', 'attachments'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.75rem 0',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: activeTab === tab ? 'var(--primary)' : 'var(--text-dim)',
                      borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
                      textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Areas */}
              <AnimatePresence mode="wait">
                {activeTab === 'comments' && (
                  <motion.div key="comments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                      <img 
                        src={currentUser?.avatar || 'https://i.pravatar.cc/150?u=default'} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                        alt={currentUser?.name} 
                      />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                          placeholder="Add a comment..."
                          className="input-field"
                        />
                        <button 
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: newComment.trim() ? 'var(--primary)' : 'var(--text-dim)' }}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {ticketComments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((c) => {
                        const author = users.find(u => u.id === c.authorId);
                        return (
                          <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                            <img src={author?.avatar || 'https://i.pravatar.cc/150?u=anon'} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{author?.name || 'Unknown'}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0 12px 12px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {c.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ borderLeft: '2px solid var(--border)', marginLeft: '18px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-31px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid #0f0f12' }} />
                        <p style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>System</span> moved to <span style={{ color: 'var(--primary)' }}>{ticket?.status}</span>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ticket?.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ''}</p>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-31px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid #0f0f12' }} />
                        <p style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>System</span> created ticket
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.01)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setSelectedTicketId(null)} className="btn-secondary">Close</button>
              {activeMode === 'edit' && (
                <button 
                  disabled={!isEditing || isSaving}
                  onClick={handleSave}
                  className="btn-primary"
                  style={{ opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </motion.div>

          <ConfirmationModal
            isOpen={isConfirmingSave}
            onClose={() => setIsConfirmingSave(false)}
            onConfirm={handleFinalSave}
            title="Confirm Changes"
            message="Apply all modifications to this ticket?"
            confirmText="Save"
            type="primary"
          />

          <ConfirmationModal
            isOpen={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={handleFinalDelete}
            title="Delete Ticket?"
            message={`Permanently remove ticket ${ticket?.id}?`}
            confirmText="Delete"
            type="danger"
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default TicketDetailsDrawer;
