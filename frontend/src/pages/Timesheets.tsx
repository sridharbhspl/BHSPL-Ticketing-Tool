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
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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

  const toggleExpandUser = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
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

      {/* User Timesheets List */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.25rem' }}>Resource Hours Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {userTimesheets.map((ut) => (
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
          ))}
        </div>
      </section>

      {/* Global Activity Log Search */}
      <section className="glass" style={{ borderRadius: '18px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Global Timesheets Explorer</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }} />
              <input 
                type="text" 
                placeholder="Search global logs..." 
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
                  width: '260px'
                }}
                className="search-input"
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
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
                  minWidth: '160px'
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

        {/* Global logs list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredWorklogs.length > 0 ? (
            filteredWorklogs.map((log) => {
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
      </section>
    </div>
  );
};

export default Timesheets;
