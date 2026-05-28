import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ClipboardList,
  Inbox
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import Breadcrumbs from '../components/Breadcrumbs';
import type { TicketStatus, TicketPriority } from '../types';

const MyTickets: React.FC = () => {
  const { tickets, projects, users, setSelectedTicketId } = useTicketStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'created'>('assigned');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const currentUserId = user?.id;

  // Filter based on active tab and search
  const filteredTickets = tickets.filter(t => {
    // 1. Tab filtering
    if (activeTab === 'assigned' && t.assigneeId !== currentUserId) return false;
    if (activeTab === 'created' && t.reporterId !== currentUserId) return false;
    if (activeTab === 'all' && t.assigneeId !== currentUserId && t.reporterId !== currentUserId) return false;

    // 2. Status filtering
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // 3. Search query filtering
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

  // Calculate Metrics
  const myAssignedTickets = tickets.filter(t => t.assigneeId === currentUserId);
  const myCreatedTickets = tickets.filter(t => t.reporterId === currentUserId);
  const activeTickets = myAssignedTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const urgentTickets = myAssignedTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High');
  const resolvedTickets = myAssignedTickets.filter(t => t.status === 'Resolved');

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
      case 'Blocked': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'In Review': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'Open': return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-dim)' };
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Tickets</h2>
        <p style={{ color: 'var(--text-dim)' }}>Manage your personal assignments, tasks, and reporter queues.</p>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned to Me</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{myAssignedTickets.length}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#ea580c" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Tasks</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeTickets.length}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} color="#ef4444" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urgent Tasks</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{urgentTickets.length}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved By Me</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{resolvedTickets.length}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="glass" style={{ borderRadius: '18px', overflow: 'hidden' }}>
        
        {/* Filters and Tabs */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.01)'
        }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setActiveTab('assigned')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'assigned' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'assigned' ? '#000' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Assigned to Me ({myAssignedTickets.length})
            </button>
            <button 
              onClick={() => setActiveTab('created')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'created' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'created' ? '#000' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Created by Me ({myCreatedTickets.length})
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'all' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'all' ? '#000' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All Associated
            </button>
          </div>

          {/* Search and filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }} />
              <input 
                type="text" 
                placeholder="Find personal tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  width: '240px',
                  transition: 'all 0.3s'
                }}
                className="search-input"
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="search-input"
                style={{
                  appearance: 'none',
                  padding: '0.625rem 2.5rem 0.625rem 1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: statusFilter === 'all' ? 'var(--text-dim)' : 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="all" style={{ backgroundColor: '#0f0f12', color: 'var(--text-dim)' }}>All Statuses</option>
                <option value="Open" style={{ backgroundColor: '#0f0f12', color: 'white' }}>Open</option>
                <option value="In Progress" style={{ backgroundColor: '#0f0f12', color: 'white' }}>In Progress</option>
                <option value="Blocked" style={{ backgroundColor: '#0f0f12', color: 'white' }}>Blocked</option>
                <option value="In Review" style={{ backgroundColor: '#0f0f12', color: 'white' }}>In Review</option>
                <option value="Resolved" style={{ backgroundColor: '#0f0f12', color: 'white' }}>Resolved</option>
                <option value="Closed" style={{ backgroundColor: '#0f0f12', color: 'white' }}>Closed</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Project</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Role Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const statusStyle = getStatusStyle(ticket.status);
                  const project = projects.find(p => p.id === ticket.projectId);
                  const isAssignee = ticket.assigneeId === currentUserId;
                  
                  return (
                    <motion.tr 
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 500 }}>{ticket.id}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'white' }}>{ticket.title}</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: project?.color }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{project?.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: isAssignee ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: isAssignee ? 'var(--primary)' : '#10b981',
                          border: isAssignee ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          {isAssignee ? 'Assignee' : 'Reporter'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Inbox size={48} style={{ opacity: 0.2 }} />
                      <span>No matching personal tickets found in your workspace queues.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default MyTickets;
