import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Breadcrumbs from '../components/Breadcrumbs';
import ConfirmationModal from '../components/common/ConfirmationModal';
import type { TicketStatus, TicketPriority } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useRBACStore } from '../store/useRBACStore';

const Tickets: React.FC = () => {
  const { tickets, projects, users, setCreateModalOpen, setSelectedTicketId, setDrawerMode, deleteTicket } = useTicketStore();
  const { user: authUser, simulatedRole } = useAuthStore();
  const currentRole = simulatedRole || authUser?.role || 'Developer';
  const { hasActionAccess } = useRBACStore();

  const canCreate = hasActionAccess(currentRole, 'create_ticket');
  const canView = hasActionAccess(currentRole, 'view_ticket');
  const canEdit = hasActionAccess(currentRole, 'edit_ticket');
  const canDelete = hasActionAccess(currentRole, 'delete_ticket');
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketToDelete, setTicketToDelete] = React.useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const searchTerm = searchParams.get('q') || '';

  const updateSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) prev.set('q', query);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const selectedProjectId = searchParams.get('projectId') || 'all';

  const filteredTickets = tickets.filter(t => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) {
      return false;
    }

    const q = searchTerm.toLowerCase();
    const assignee = users.find(u => u.id === t.assigneeId);
    const project = projects.find(p => p.id === t.projectId);
    
    return (
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      (assignee && assignee.name.toLowerCase().includes(q)) ||
      (project && project.name.toLowerCase().includes(q)) ||
      t.status.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q)
    );
  });

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#3b82f6';
      case 'Low': return '#10b981';
      default: return 'var(--text-dim)';
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Resolved': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'In Progress': return { bg: 'rgba(234, 88, 12, 0.1)', text: '#ea580c' };
      case 'In Review': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'Open': return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-dim)' };
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tickets</h2>
          <p style={{ color: 'var(--text-dim)' }}>Manage and track all work assignments across projects.</p>
        </div>
        {canCreate && (
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '14px',
              background: 'var(--grad-primary)',
              color: '#000',
              fontWeight: 700,
              boxShadow: '0 4px 15px var(--primary-glow)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} />
            Create Ticket
          </motion.button>
        )}
      </header>

      <div className="glass" style={{ borderRadius: '18px', overflow: 'hidden' }}>
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }} />
              <input 
                type="text" 
                placeholder="Quick find..." 
                value={searchTerm}
                onChange={(e) => updateSearch(e.target.value)}
                style={{
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  width: '280px',
                  transition: 'all 0.3s'
                }}
                className="search-input"
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSearchParams(prev => {
                    if (e.target.value === 'all') prev.delete('projectId');
                    else prev.set('projectId', e.target.value);
                    return prev;
                  }, { replace: true });
                }}
                className="search-input"
                style={{
                  appearance: 'none',
                  padding: '0.625rem 2.5rem 0.625rem 1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: selectedProjectId === 'all' ? 'var(--text-dim)' : 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '180px',
                  transition: 'all 0.3s'
                }}
              >
                <option value="all" style={{ backgroundColor: '#0f0f12', color: 'var(--text-dim)' }}>All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: '#0f0f12', color: 'white' }}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
            </div>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
              <Filter size={16} />
              Refine
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Showing {filteredTickets.length} tickets</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Assignee</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Project</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const statusStyle = getStatusStyle(ticket.status);
                const assignee = users.find(u => u.id === ticket.assigneeId);
                const project = projects.find(p => p.id === ticket.projectId);
                
                return (
                  <motion.tr 
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    onClick={() => { setDrawerMode('view'); setSelectedTicketId(ticket.id); }}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 500 }}>{ticket.id}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ticket.title}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {ticket.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--text-dim)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPriorityColor(ticket.priority) }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ticket.priority}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={assignee.avatar} style={{ width: '24px', height: '24px', borderRadius: '6px' }} alt="" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{assignee.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: project?.color }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{project?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {canView && (
                          <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setDrawerMode('view'); setSelectedTicketId(ticket.id); }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(59, 130, 246, 0.05)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                        )}
                        {canEdit && (
                          <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setDrawerMode('edit'); setSelectedTicketId(ticket.id); }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                          >
                            <Edit size={14} />
                            Edit
                          </motion.button>
                        )}
                        {canDelete && (
                          <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setTicketToDelete(ticket.id);
                              setIsDeleteConfirmOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              outline: 'none'
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setTicketToDelete(null);
        }}
        onConfirm={async () => {
          if (ticketToDelete) {
            try {
              await deleteTicket(ticketToDelete);
            } catch (err) {
              console.error('Error deleting ticket:', err);
            }
          }
        }}
        title="Delete Ticket?"
        message={`Are you sure you want to permanently delete ticket ${ticketToDelete}?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Tickets;
