import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  FileText, 
  Users,
  ChevronDown,
  ChevronUp,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Breadcrumbs from '../components/Breadcrumbs';

const Timesheets: React.FC = () => {
  const { subTasks, tickets, users, setSelectedTicketId } = useTicketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Collapse/Expand state
  const [isResourceSummaryOpen, setIsResourceSummaryOpen] = useState(true);
  const [isGlobalExplorerOpen, setIsGlobalExplorerOpen] = useState(true);

  // Pagination state
  const [resourcePage, setResourcePage] = useState(1);
  const [globalPage, setGlobalPage] = useState(1);

  // Group worklogs by user
  const userTimesheets = users.map(u => {
    const userLogs = subTasks.filter(st => st.assignedEngineerId === u.id);
    const totalHours = userLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
    const averageCompletion = userLogs.length > 0 
      ? Math.round(userLogs.reduce((sum, log) => sum + (log.completionPercentage || 0), 0) / userLogs.length)
      : 0;

    return {
      ...u,
      logs: userLogs,
      totalHours,
      averageCompletion
    };
  }).sort((a, b) => b.totalHours - a.totalHours); // Show top logging users first

  const filteredUserTimesheets = userTimesheets.filter(ut => {
    const q = resourceSearch.toLowerCase().trim();
    if (!q) return true;
    return ut.name.toLowerCase().includes(q) || (ut.role && ut.role.toLowerCase().includes(q));
  });

  const paginatedUserTimesheets = filteredUserTimesheets.slice((resourcePage - 1) * 10, resourcePage * 10);

  // Total global metrics
  const totalGlobalHours = subTasks.reduce((sum, st) => sum + (st.hoursWorked || 0), 0);
  const totalLogEntries = subTasks.length;
  const activeLoggersCount = userTimesheets.filter(ut => ut.totalHours > 0).length;

  // Filter global worklogs list based on search and user filter
  const filteredWorklogs = subTasks.filter(log => {
    // User filter
    if (selectedUserFilter !== 'all' && log.assignedEngineerId !== selectedUserFilter) return false;

    const q = searchTerm.toLowerCase();
    const parentTicket = tickets.find(t => t.id === log.parentTicketId);
    const logUser = users.find(u => u.id === log.assignedEngineerId);
    
    return (
      log.title.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q) ||
      log.workDoneToday.toLowerCase().includes(q) ||
      (logUser && logUser.name.toLowerCase().includes(q)) ||
      (parentTicket && parentTicket.title.toLowerCase().includes(q)) ||
      log.parentTicketId.toLowerCase().includes(q)
    );
  });

  const paginatedWorklogs = filteredWorklogs.slice((globalPage - 1) * 10, globalPage * 10);

  const toggleExpandUser = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const renderPagination = (
    currentPage: number, 
    totalItems: number, 
    itemsPerPage: number, 
    onPageChange: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const startIdx = (currentPage - 1) * itemsPerPage + 1;
    const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '1.5rem', 
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Showing <strong>{startIdx}</strong>-<strong>{endIdx}</strong> of <strong>{totalItems}</strong> entries
        </span>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              color: currentPage === 1 ? 'var(--text-dim)' : 'white',
              fontSize: '0.75rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          {pages.map(page => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: currentPage === page ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${currentPage === page ? 'var(--primary)' : 'var(--border)'}`,
                color: currentPage === page ? '#1a1a1e' : 'white',
                fontSize: '0.75rem',
                fontWeight: currentPage === page ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              color: currentPage === totalPages ? 'var(--text-dim)' : 'white',
              fontSize: '0.75rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Timesheets</h2>
        <p style={{ color: 'var(--text-dim)' }}>Monitor project resource distribution, track user hours, and review log submissions.</p>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Team Hours</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalGlobalHours} hrs</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#3b82f6" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Loggers</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeLoggersCount} / {users.length}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Submissions</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalLogEntries} Logs</span>
          </div>
        </motion.div>
      </div>

      {/* Columns Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '2rem', 
        alignItems: 'start',
        marginBottom: '3rem'
      }}>
        {/* User Timesheets List */}
        <section className="glass" style={{ borderRadius: '18px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Resource Hours Summary</h3>
              <button 
                type="button" 
                onClick={() => setIsResourceSummaryOpen(!isResourceSummaryOpen)} 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-glow)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <motion.div
                  animate={{ rotate: isResourceSummaryOpen ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronUp size={16} />
                </motion.div>
              </button>
            </div>
            
            {/* Resource search input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 auto' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input 
                type="text"
                placeholder="Search resource or role..."
                value={resourceSearch}
                onChange={(e) => {
                  setResourceSearch(e.target.value);
                  setResourcePage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
              {resourceSearch && (
                <button 
                  onClick={() => {
                    setResourceSearch('');
                    setResourcePage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isResourceSummaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {paginatedUserTimesheets.length > 0 ? (
                    paginatedUserTimesheets.map((ut) => (
                      <div 
                        key={ut.id} 
                        className="glass" 
                        style={{ 
                          borderRadius: '16px', 
                          border: '1px solid var(--border)', 
                          overflow: 'hidden', 
                          backgroundColor: 'rgba(255, 255, 255, 0.01)' 
                        }}
                      >
                        <div 
                          onClick={() => toggleExpandUser(ut.id)}
                          style={{ 
                            padding: '1.25rem 1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            cursor: 'pointer',
                            backgroundColor: expandedUser === ut.id ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={ut.avatar} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)' }} alt="" />
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{ut.name}</h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ut.role}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total Logged</span>
                              <strong style={{ fontSize: '1.1rem', color: ut.totalHours > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>
                                {ut.totalHours} hrs
                              </strong>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Avg. Completion</span>
                              <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{ut.averageCompletion}%</strong>
                            </div>

                            {expandedUser === ut.id ? <ChevronUp size={20} color="var(--text-dim)" /> : <ChevronDown size={20} color="var(--text-dim)" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedUser === ut.id && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                {ut.logs.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {ut.logs.map(log => {
                                      return (
                                        <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedTicketId(log.parentTicketId);
                                                }}
                                                style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
                                              >
                                                {log.parentTicketId}
                                              </span>
                                              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{log.title}</h5>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>{log.hoursWorked} hrs</span>
                                          </div>
                                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>{log.workDoneToday}</p>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '4px' }}>
                                            <span>Logged: {new Date(log.workDate).toLocaleDateString()}</span>
                                            <span>Task completion: {log.completionPercentage}%</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1rem' }}>
                                    <AlertCircle size={24} style={{ opacity: 0.2, marginBottom: '6px' }} />
                                    <p style={{ fontSize: '0.8rem' }}>No timesheet submissions logged for this resource yet.</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="glass" style={{ padding: '3rem', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-dim)' }}>
                      <Users size={32} style={{ marginBottom: '10px', opacity: 0.5, display: 'inline-block' }} />
                      <p style={{ fontSize: '0.85rem' }}>No matching resources found.</p>
                    </div>
                  )}
                </div>
                {renderPagination(resourcePage, filteredUserTimesheets.length, 10, setResourcePage)}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Global Activity Log Search */}
        <section className="glass" style={{ borderRadius: '18px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Global Timesheets Explorer</h3>
              <button 
                type="button" 
                onClick={() => setIsGlobalExplorerOpen(!isGlobalExplorerOpen)} 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-glow)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <motion.div
                  animate={{ rotate: isGlobalExplorerOpen ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronUp size={16} />
                </motion.div>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', minWidth: '200px', flex: '1 1 auto' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }} />
                <input 
                  type="text" 
                  placeholder="Search global logs..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setGlobalPage(1);
                  }}
                  style={{
                    padding: '0.625rem 1rem 0.625rem 2.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  className="search-input"
                />
              </div>
              
              <div style={{ position: 'relative', minWidth: '150px' }}>
                <select
                  value={selectedUserFilter}
                  onChange={(e) => {
                    setSelectedUserFilter(e.target.value);
                    setGlobalPage(1);
                  }}
                  className="search-input"
                  style={{
                    appearance: 'none',
                    padding: '0.625rem 2.5rem 0.625rem 1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: selectedUserFilter === 'all' ? 'var(--text-dim)' : 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="all" style={{ backgroundColor: '#0f0f12', color: 'var(--text-dim)' }}>All Users</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id} style={{ backgroundColor: '#0f0f12', color: 'white' }}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isGlobalExplorerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                {/* Global logs list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {paginatedWorklogs.length > 0 ? (
                    paginatedWorklogs.map((log) => {
                      const logUser = users.find(u => u.id === log.assignedEngineerId);
                      return (
                        <div key={log.id} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={logUser?.avatar} style={{ width: '28px', height: '28px', borderRadius: '8px' }} alt="" />
                              <div>
                                <strong style={{ fontSize: '0.85rem', color: 'white' }}>{logUser?.name}</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '8px' }}>({logUser?.role})</span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{log.hoursWorked} hrs</span>
                          </div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                            <span 
                              onClick={() => setSelectedTicketId(log.parentTicketId)}
                              style={{ cursor: 'pointer', color: 'var(--primary)', marginRight: '8px' }}
                            >
                              [{log.parentTicketId}]
                            </span>
                            {log.title}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{log.workDoneToday}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                      <Inbox size={36} style={{ opacity: 0.2, marginBottom: '6px' }} />
                      <p style={{ fontSize: '0.85rem' }}>No logged entries match your search filters.</p>
                    </div>
                  )}
                </div>
                {renderPagination(globalPage, filteredWorklogs.length, 10, setGlobalPage)}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default Timesheets;
