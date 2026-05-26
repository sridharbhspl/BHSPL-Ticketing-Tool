import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Plus, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Filter,
  BarChart3,
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateSubTaskModal from '../components/CreateSubTaskModal';
import type { TicketStatus, Ticket } from '../types';

const statuses: TicketStatus[] = ['Open', 'In Progress', 'In Review', 'Resolved'];

const KanbanCard: React.FC<{ ticket: Ticket; index: number }> = ({ ticket, index }) => {
  const { users, setSelectedTicketId } = useTicketStore();
  const assignee = users.find(u => u.id === ticket.assigneeId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#3b82f6';
      case 'Low': return '#10b981';
      default: return 'var(--text-dim)';
    }
  };

  const getCountdown = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'OVERDUE', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)' };
    if (diffDays === 0) return { text: 'DUE TODAY', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' };
    if (diffDays === 1) return { text: 'T-1 DAY', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.15)' };
    return { text: `T-${diffDays} DAYS`, color: 'var(--text-dim)', glow: 'transparent' };
  };

  const reporter = users.find(u => u.id === ticket.reporterId);
  const countdown = getCountdown(ticket.dueDate);

  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedTicketId(ticket.id)}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '0.75rem',
            opacity: snapshot.isDragging ? 0.9 : 1,
          }}
        >
          <motion.div
            animate={{
              rotate: snapshot.isDragging ? 3 : 0,
              scale: snapshot.isDragging ? 1.04 : 1,
              boxShadow: snapshot.isDragging 
                ? '0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 20px var(--primary-glow)' 
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
            whileHover={{ y: -2, border: '1px solid rgba(255, 255, 255, 0.15)' }}
            className="glass"
            style={{
              padding: '0.875rem',
              borderRadius: '12px',
              backgroundColor: snapshot.isDragging ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              border: snapshot.isDragging ? '1px solid var(--primary)' : '1px solid var(--border)',
              cursor: snapshot.isDragging ? 'grabbing' : 'grab',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'background-color 0.2s, border-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  color: 'var(--text-dim)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  letterSpacing: '0.5px'
                }}>
                  {ticket.id}
                </span>
                {countdown && (
                  <motion.span 
                    animate={countdown.text.includes('DUE') ? { opacity: [0.6, 1, 0.6] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 800, 
                      color: countdown.color, 
                      backgroundColor: countdown.glow !== 'transparent' ? countdown.glow : 'rgba(255, 255, 255, 0.03)',
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {countdown.text}
                  </motion.span>
                )}
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getPriorityColor(ticket.priority) }} />
            </div>
            
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.4', color: 'white' }}>{ticket.title}</h4>
            
            {ticket.description && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-dim)', 
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginTop: '-0.25rem'
              }}>
                {ticket.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {ticket.tags.map(tag => (
                <span key={tag} style={{ fontSize: '0.6rem', color: 'var(--text-dim)', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '1px 5px', borderRadius: '3px' }}>
                  #{tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  {assignee ? (
                    <img src={assignee.avatar} style={{ width: '24px', height: '24px', borderRadius: '8px', border: '1px solid var(--border)' }} alt="" />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={12} color="var(--text-dim)" />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                    {assignee ? assignee.name : 'Unassigned'}
                  </span>
                  {reporter && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                      By {reporter.name}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', color: 'var(--text-dim)', opacity: 0.5 }}>
                <BarChart3 size={14} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

const Kanban: React.FC = () => {
  const { tickets, projects, setTickets, updateTicket, setCreateModalOpen, isSubTaskModalOpen, setSubTaskModalOpen } = useTicketStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get('projectId') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const normalise = (s: string) => s.toLowerCase();

  const matchesSearch = useCallback((ticket: Ticket) => {
    if (!searchQuery.trim()) return true;
    const q = normalise(searchQuery);
    return (
      normalise(ticket.title).includes(q) ||
      normalise(ticket.id).includes(q) ||
      normalise(ticket.description || '').includes(q) ||
      ticket.tags.some(tag => normalise(tag).includes(q)) ||
      normalise(ticket.priority).includes(q)
    );
  }, [searchQuery]);

  const projectFiltered = selectedProjectId === 'all'
    ? tickets
    : tickets.filter(t => t.projectId === selectedProjectId);

  const filteredTickets = projectFiltered.filter(matchesSearch);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Best Industry Exp: Reordering logic that preserves local order across global array
    const movedTicket = tickets.find(t => t.id === draggableId);
    if (!movedTicket) return;

    // 1. Remove the ticket from current position
    const otherTickets = tickets.filter(t => t.id !== draggableId);
    
    // 2. Identify destination status
    const newStatus = destination.droppableId as TicketStatus;
    const updatedTicket = { ...movedTicket, status: newStatus, updatedAt: new Date().toISOString() };

    // 3. Find tickets in destination column
    const destColumnTickets = otherTickets.filter(t => t.status === newStatus);
    const otherColumnTickets = otherTickets.filter(t => t.status !== newStatus);

    // 4. Insert into destination column at correct index
    destColumnTickets.splice(destination.index, 0, updatedTicket);

    // 5. Reconstruct global array & save to backend database
    setTickets([...otherColumnTickets, ...destColumnTickets]);
    updateTicket(movedTicket.id, { status: newStatus }, movedTicket.status);
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return <Clock size={18} color="#fbbf24" />;
      case 'In Progress': return <AlertCircle size={18} color="#ea580c" />;
      case 'In Review': return <BarChart3 size={18} color="#3b82f6" />;
      case 'Resolved': return <CheckCircle2 size={18} color="#10b981" />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div style={{ 
      padding: '2rem 2.5rem', 
      height: 'calc(100vh - 80px)', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent body scroll
    }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ticket Status Board</h2>
          <p style={{ color: 'var(--text-dim)' }}>Manage your team's progress with agile precision.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              className="btn-secondary"
              style={{
                appearance: 'none',
                paddingRight: '2.5rem',
                cursor: 'pointer',
                outline: 'none',
                color: selectedProjectId === 'all' ? 'var(--text-dim)' : 'white',
                minWidth: '200px'
              }}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} style={{ backgroundColor: '#0a0a0c', color: 'white' }}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
          </div>

          {/* Live Search Bar */}
          <motion.div
            animate={{ width: searchFocused ? 260 : 200 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: searchFocused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${searchFocused ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
              borderRadius: '12px', padding: '8px 12px',
              boxShadow: searchFocused ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              overflow: 'hidden',
            }}
          >
            <Search size={15} color={searchFocused ? '#f59e0b' : 'var(--text-dim)'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'white', fontSize: '0.85rem',
                '::placeholder': { color: 'var(--text-dim)' }
              } as React.CSSProperties}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0, flexShrink: 0 }}
              >
                <X size={13} />
              </motion.button>
            )}
          </motion.div>

          <button className="btn-secondary" onClick={() => setSubTaskModalOpen(true)}>
            <Plus size={18} />
            Add Work Log
          </button>
          <button className="btn-secondary">
            <Filter size={18} />
            Filters
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            Add Task
          </motion.button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div 
          className="kanban-board-container"
          style={{ 
            display: 'flex', 
            gap: '1.25rem',
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '1rem',
            paddingRight: '1rem',
            // Custom horizontal scrollbar for best industry exp
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent'
          }}
        >
          {statuses.map((status) => (
            <div key={status} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              minWidth: '320px', // Ensure consistent column width
              maxWidth: '360px',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderRadius: '20px',
              padding: '1.25rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 0.5rem',
                marginBottom: '1.5rem',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)'
                  }}>
                    {getStatusIcon(status)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>{status}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: searchQuery.trim() && filteredTickets.filter(t => t.status === status).length === 0 ? '#ef4444' : 'var(--text-dim)' }}>
                      {filteredTickets.filter(t => t.status === status).length} {searchQuery.trim() ? 'match' : 'Task'}{filteredTickets.filter(t => t.status === status).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button style={{ color: 'var(--text-dim)', padding: '6px', borderRadius: '8px' }} className="hover:bg-white/5">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="custom-scrollbar"
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      borderRadius: '14px',
                      padding: '4px',
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '100px'
                    }}
                  >
                    {filteredTickets
                      .filter((t) => t.status === status)
                      .map((ticket, index) => (
                        <KanbanCard key={ticket.id} ticket={ticket} index={index} />
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <CreateSubTaskModal 
        isOpen={isSubTaskModalOpen} 
        onClose={() => setSubTaskModalOpen(false)} 
      />
    </div>
  );
};

export default Kanban;
