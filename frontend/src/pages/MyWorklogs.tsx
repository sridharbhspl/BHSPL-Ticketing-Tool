import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  GitBranch,
  Inbox,
  Coffee,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateSubTaskModal from '../components/CreateSubTaskModal';

const MyWorklogs: React.FC = () => {
  const { subTasks, tickets, projects, setSelectedTicketId, isSubTaskModalOpen, setSubTaskModalOpen } = useTicketStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Attendance store & timer ticking loop
  const { 
    isPunchedIn, 
    isOnBreak, 
    punchInTime, 
    totalWorkedBeforeBreak, 
    breakStartTime, 
    totalBreakDuration,
    punchIn,
    startBreak,
    endBreak,
    punchOut,
    fetchAttendanceHistory
  } = useAttendanceStore();

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const [workTimeMs, setWorkTimeMs] = useState(0);
  const [breakTimeMs, setBreakTimeMs] = useState(0);

  useEffect(() => {
    let interval: any;
    
    const updateTimers = () => {
      const now = Date.now();
      
      // Calculate active work time
      if (isPunchedIn && punchInTime) {
        setWorkTimeMs(totalWorkedBeforeBreak + (now - punchInTime));
      } else {
        setWorkTimeMs(totalWorkedBeforeBreak);
      }
      
      // Calculate break time
      if (isOnBreak && breakStartTime) {
        setBreakTimeMs(totalBreakDuration + (now - breakStartTime));
      } else {
        setBreakTimeMs(totalBreakDuration);
      }
    };
    
    updateTimers();
    interval = setInterval(updateTimers, 1000);
    
    return () => clearInterval(interval);
  }, [isPunchedIn, isOnBreak, punchInTime, breakStartTime, totalWorkedBeforeBreak, totalBreakDuration]);

  const formatTimeHHMMSS = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentUserId = user?.id;

  // Filter user's worklogs
  const myWorklogs = subTasks.filter(st => st.assignedEngineerId === currentUserId);

  const filteredWorklogs = myWorklogs.filter(log => {
    const q = searchTerm.toLowerCase();
    const parentTicket = tickets.find(t => t.id === log.parentTicketId);
    
    return (
      log.title.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q) ||
      log.workDoneToday.toLowerCase().includes(q) ||
      (log.codeBranch && log.codeBranch.toLowerCase().includes(q)) ||
      (parentTicket && parentTicket.title.toLowerCase().includes(q)) ||
      log.parentTicketId.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalHours = myWorklogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
  const avgHours = myWorklogs.length > 0 ? (totalHours / myWorklogs.length).toFixed(1) : '0';
  const averageCompletion = myWorklogs.length > 0 
    ? Math.round(myWorklogs.reduce((sum, log) => sum + (log.completionPercentage || 0), 0) / myWorklogs.length)
    : 0;

  // Handle clicking "Log Hours"
  const handleLogHoursClick = () => {
    // Select first ticket or currently viewed ticket if available to bind the worklog modal
    if (tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
    setSubTaskModalOpen(true);
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Daily Timesheet</h2>
          <p style={{ color: 'var(--text-dim)' }}>Track your logged hours, development progress, and timesheets.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogHoursClick}
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
          Log Hours
        </motion.button>
      </header>

      {/* Industrial Attendance Shift Manager */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ 
          padding: '1.75rem 2rem', 
          borderRadius: '20px', 
          border: '1px solid var(--border)', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Shift Attendance Tracker</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: isOnBreak ? '#fbbf24' : isPunchedIn ? '#10b981' : '#6b7280',
                boxShadow: isOnBreak ? '0 0 10px #fbbf24' : isPunchedIn ? '0 0 10px #10b981' : 'none'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isOnBreak ? '#fbbf24' : isPunchedIn ? '#10b981' : 'var(--text-dim)' }}>
                {isOnBreak ? 'ON BREAK' : isPunchedIn ? 'ACTIVE ON SHIFT' : 'OFFLINE (NOT PUNCHED IN)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>SHIFT HOUR TIMER</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: isPunchedIn ? 'var(--primary)' : 'white', fontFamily: 'monospace' }}>
                {formatTimeHHMMSS(workTimeMs)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>BREAK TIMER</span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: isOnBreak ? '#fbbf24' : 'var(--text-dim)', fontFamily: 'monospace' }}>
                {formatTimeHHMMSS(breakTimeMs)}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!isPunchedIn && !isOnBreak ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={punchIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.85rem 1.75rem',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                color: 'black',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px var(--primary-glow)'
              }}
            >
              <Play size={16} fill="black" /> Punch In
            </motion.button>
          ) : (
            <>
              {!isOnBreak ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startBreak}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Coffee size={16} /> Start Break
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={endBreak}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '12px',
                    backgroundColor: '#fbbf24',
                    color: 'black',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)'
                  }}
                >
                  <RefreshCw size={16} /> End Break
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={punchOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Square size={16} fill="#ef4444" /> Punch Out
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Hours Logged</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalHours} hrs</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#3b82f6" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Worklog Entries</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{myWorklogs.length}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Hours/Log</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgHours} hrs</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#a855f7" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg. Completion</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{averageCompletion}%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="glass" style={{ borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border)' }}>
        
        {/* Header Search controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Activity Logs History</h3>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }} />
            <input 
              type="text" 
              placeholder="Search worklogs..." 
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
                width: '260px',
                transition: 'all 0.3s'
              }}
              className="search-input"
            />
          </div>
        </div>

        {/* Worklogs Activity Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredWorklogs.length > 0 ? (
            filteredWorklogs.map((log) => {
              const parentTicket = tickets.find(t => t.id === log.parentTicketId);
              const project = parentTicket ? projects.find(p => p.id === parentTicket.projectId) : null;
              
              return (
                <motion.div 
                  key={log.id} 
                  whileHover={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span 
                        onClick={() => setSelectedTicketId(log.parentTicketId)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.15)'
                        }}
                      >
                        {log.parentTicketId}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{log.title}</h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {log.type}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        {log.hoursWorked} hrs
                      </span>
                    </div>
                  </div>

                  {/* Log description info */}
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                    {log.workDoneToday}
                  </p>

                  {/* Metadata line */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: '1rem', 
                    paddingTop: '0.75rem', 
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} />
                        <span>{new Date(log.workDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {log.codeBranch && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GitBranch size={13} />
                          <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{log.codeBranch}</span>
                        </div>
                      )}
                      {project && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: project.color }} />
                          <span>{project.name}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Progress: {log.completionPercentage}%</span>
                      <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${log.completionPercentage}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>

                  {log.blockers && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginTop: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#ef4444'
                    }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span><strong>Blockers: </strong>{log.blockers}</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Inbox size={48} style={{ opacity: 0.2 }} />
                <span>No logged timesheets/worklogs found matching search keywords.</span>
              </div>
            </div>
          )}
        </div>

      </div>

      <CreateSubTaskModal 
        isOpen={isSubTaskModalOpen} 
        onClose={() => setSubTaskModalOpen(false)} 
      />
    </div>
  );
};

export default MyWorklogs;
