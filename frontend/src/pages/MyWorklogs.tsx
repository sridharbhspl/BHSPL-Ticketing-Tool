import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  History,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateSubTaskModal from '../components/CreateSubTaskModal';
import Modal from '../components/Modal';

const MyWorklogs: React.FC = () => {
  const { subTasks, tickets, projects, setSelectedTicketId, isSubTaskModalOpen, setSubTaskModalOpen } = useTicketStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Break modal states & history toggles
  const [isBreakModalOpen, setBreakModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [breakDescription, setBreakDescription] = useState('');
  const [expandedShifts, setExpandedShifts] = useState<Record<string, boolean>>({});
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Collapsible container toggles
  const [isMonthlyOverviewOpen, setMonthlyOverviewOpen] = useState(true);
  const [isShiftHistoryOpen, setShiftHistoryOpen] = useState(true);
  const [isActivityHistoryOpen, setActivityHistoryOpen] = useState(true);

  // Pagination states
  const [shiftPage, setShiftPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  // Premium Calendar states & helpers
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const formatMsToHHMM = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateObj: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i)
      });
    }
    
    const totalGridCells = 42;
    const remainingCells = totalGridCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const getAttendanceForDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    return history.find(session => session.date === formatted);
  };

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
    fetchAttendanceHistory,
    activeBreak,
    history,
    currentBreaks
  } = useAttendanceStore();

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  useEffect(() => {
    setShiftPage(1);
  }, [filterFromDate, filterToDate]);

  useEffect(() => {
    setActivityPage(1);
  }, [searchTerm]);

  const toggleShiftExpand = (id: string) => {
    setExpandedShifts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartBreakSubmit = () => {
    if (!selectedCategory) return;
    startBreak(selectedCategory, breakDescription);
    setBreakModalOpen(false);
    setSelectedCategory('');
    setBreakDescription('');
  };

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

  // Filter attendance history by date range
  const filteredHistory = history.filter((session) => {
    if (!session.date) return true;
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    if (filterFromDate) {
      const from = new Date(filterFromDate);
      from.setHours(0, 0, 0, 0);
      if (sessionDate < from) return false;
    }

    if (filterToDate) {
      const to = new Date(filterToDate);
      to.setHours(0, 0, 0, 0);
      if (sessionDate > to) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalHours = myWorklogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
  const avgHours = myWorklogs.length > 0 ? (totalHours / myWorklogs.length).toFixed(1) : '0';
  const averageCompletion = myWorklogs.length > 0 
    ? Math.round(myWorklogs.reduce((sum, log) => sum + (log.completionPercentage || 0), 0) / myWorklogs.length)
    : 0;

  const renderPagination = (
    currentPage: number,
    totalCount: number,
    pageSize: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalCount);

    const getPageNumbers = () => {
      const pageNumbers = [];
      const delta = 1;
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
          pageNumbers.push(i);
        } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
          pageNumbers.push('...');
        }
      }
      return pageNumbers;
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Showing <strong style={{ color: 'white' }}>{startIdx}</strong> to <strong style={{ color: 'white' }}>{endIdx}</strong> of <strong style={{ color: 'white' }}>{totalCount}</strong> entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
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

          {getPageNumbers().map((num, idx) => {
            if (num === '...') {
              return (
                <span key={idx} style={{ color: 'var(--text-dim)', padding: '0 4px', fontSize: '0.8rem' }}>
                  ...
                </span>
              );
            }
            const isActive = num === currentPage;
            return (
              <button
                key={idx}
                onClick={() => setPage(num as number)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                  color: isActive ? '#000' : 'white',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {num}
              </button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
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
            {isOnBreak && activeBreak && (
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={12} style={{ flexShrink: 0 }} />
                <span><strong>{activeBreak.category}</strong>{activeBreak.description ? `: ${activeBreak.description}` : ''}</span>
              </div>
            )}
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
                  onClick={() => setBreakModalOpen(true)}
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

      {/* Monthly Attendance Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{
          borderRadius: '18px',
          padding: '2rem',
          border: '1px solid var(--border)',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Monthly Attendance Overview</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Quick summary of daily working & break times per month.</p>
            </div>
          </div>

          {/* Month/Year Selection controls with toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '6px 12px' }}>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                }}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} color="var(--text-dim)" />
              </motion.button>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', minWidth: '130px', textAlign: 'center', textTransform: 'capitalize' }}>
                {currentCalendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                }}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={18} color="var(--text-dim)" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMonthlyOverviewOpen(!isMonthlyOverviewOpen)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {isMonthlyOverviewOpen ? '▲' : '▼'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMonthlyOverviewOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >

        {/* Calendar Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '10px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {getDaysInMonth(currentCalendarDate).map((cell, idx) => {
            const attendance = getAttendanceForDate(cell.dateObj);
            const isToday = cell.dateObj.toDateString() === new Date().toDateString();
            
            // Dynamic Work / Break / Break Count calculations based on active status vs completed status
            let workHoursStr = '';
            let breakHoursStr = '';
            let breakCount = 0;
            
            if (attendance) {
              if (attendance.status === 'Active') {
                workHoursStr = formatMsToHHMM(workTimeMs);
                breakHoursStr = formatMsToHHMM(breakTimeMs);
                breakCount = currentBreaks ? currentBreaks.filter(b => b.endTime).length : 0;
              } else {
                workHoursStr = attendance.totalWorkTime;
                breakHoursStr = attendance.totalBreakTime;
                breakCount = attendance.breakDetails ? attendance.breakDetails.length : 0;
              }
            }
            
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -2, zIndex: 10 }}
                title={attendance ? `Date: ${cell.dateObj.toDateString()}\nTotal Work Time: ${workHoursStr}\nTotal Break Time: ${breakHoursStr}\nTotal Breaks: ${breakCount} ${breakCount === 1 ? 'break' : 'breaks'}` : undefined}
                style={{
                  minHeight: '90px',
                  borderRadius: '12px',
                  border: isToday 
                    ? '1.5px solid var(--primary)' 
                    : attendance 
                      ? '1px solid rgba(16, 185, 129, 0.25)' 
                      : '1px solid var(--border)',
                  background: isToday
                    ? 'rgba(245, 158, 11, 0.03)'
                    : attendance
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.01) 100%)'
                      : 'rgba(255, 255, 255, 0.01)',
                  padding: '8px',
                  opacity: cell.isCurrentMonth ? 1 : 0.35,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxShadow: isToday ? '0 0 15px rgba(245, 158, 11, 0.05)' : 'none'
                }}
              >
                {/* Day Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isToday ? 900 : 700, 
                    color: isToday ? 'var(--primary)' : 'white',
                    backgroundColor: isToday ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    width: isToday ? '22px' : 'auto',
                    height: isToday ? '22px' : 'auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Outfit, Inter, sans-serif'
                  }}>
                    {cell.dayNum}
                  </span>
                  
                  {attendance && (
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: attendance.status === 'Active' ? '#fbbf24' : '#10b981',
                      boxShadow: attendance.status === 'Active' ? '0 0 8px #fbbf24' : '0 0 8px #10b981'
                    }} />
                  )}
                </div>

                {/* Day Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  {attendance ? (
                    <>
                      {/* Total Working Hours */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: attendance.status === 'Active' ? '#fbbf24' : '#34d399',
                        backgroundColor: attendance.status === 'Active' ? 'rgba(251, 191, 36, 0.06)' : 'rgba(52, 211, 153, 0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        maxWidth: 'fit-content'
                      }}>
                        <span style={{ transform: 'scale(0.85)', display: 'inline-block' }}>💼</span>
                        <span>{workHoursStr}</span>
                      </div>

                      {/* Total Break Hours and Count */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        color: 'rgba(255,255,255,0.7)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        maxWidth: 'fit-content'
                      }}>
                        <span style={{ transform: 'scale(0.85)', display: 'inline-block' }}>☕</span>
                        <span>{breakHoursStr} ({breakCount} {breakCount === 1 ? 'brk' : 'brks'})</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ height: '24px' }} /> // Spacer to preserve grid cell size symmetry
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Premium Shift & Break History Logs */}
      <div className="glass" style={{ borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Shift & Break History Logs</h3>
          </div>
          
          {/* Industry standard date range filter controls with toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</span>
                <input 
                  type="date" 
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'white',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer'
                  }}
                  className="search-input"
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>To</span>
                <input 
                  type="date" 
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'white',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer'
                  }}
                  className="search-input"
                />
              </div>

              {(filterFromDate || filterToDate) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setFilterFromDate('');
                    setFilterToDate('');
                  }}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    color: '#ef4444',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear Filters
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShiftHistoryOpen(!isShiftHistoryOpen)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {isShiftHistoryOpen ? '▲' : '▼'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isShiftHistoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflowX: 'hidden' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.75rem' }}>
                {filteredHistory && filteredHistory.length > 0 ? (
                  filteredHistory.slice((shiftPage - 1) * 10, shiftPage * 10).map((session) => {
              const isExpanded = !!expandedShifts[session.id];
              const breaksCount = session.breakDetails?.length || 0;
              const formattedDate = new Date(session.date).toLocaleDateString(undefined, { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });

              return (
                <div 
                  key={session.id} 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => toggleShiftExpand(session.id)}
                    style={{ 
                      padding: '1rem 1.25rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: 'var(--primary)',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(245, 158, 11, 0.15)'
                      }}>
                        {session.id}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'white' }}>{formattedDate}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Punch: <strong style={{ color: '#fff' }}>{session.punchInTime}</strong> — <strong style={{ color: '#fff' }}>{session.punchOutTime || 'Active'}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Work Hours: <strong style={{ color: 'var(--primary)' }}>{session.totalWorkTime}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Breaks: <strong style={{ color: '#fbbf24' }}>{session.totalBreakTime}</strong> 
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({breaksCount} log{breaksCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breaks Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Detailed Break Records
                          </h4>
                          {session.breakDetails && session.breakDetails.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {session.breakDetails.map((brk: any, idx: number) => {
                                const startFormatted = brk.startTime ? new Date(brk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
                                const endFormatted = brk.endTime ? new Date(brk.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
                                
                                return (
                                  <div 
                                    key={brk.id || idx} 
                                    style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      padding: '0.75rem 1rem', 
                                      backgroundColor: 'rgba(255,255,255,0.02)', 
                                      border: '1px solid rgba(255,255,255,0.04)', 
                                      borderRadius: '8px',
                                      flexWrap: 'wrap',
                                      gap: '0.75rem'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '1.1rem' }}>
                                        {brk.category.includes('Lunch') ? '🍱' : 
                                         brk.category.includes('Tea') ? '☕' : 
                                         brk.category.includes('Restroom') ? '🚻' : 
                                         brk.category.includes('Meeting') ? '🤝' : 
                                         brk.category.includes('Walk') ? '🚶' : '🚨'}
                                      </span>
                                      <div>
                                        <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block' }}>
                                          {brk.category}
                                        </strong>
                                        {brk.description && (
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                            "{brk.description}"
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        {startFormatted} – {endFormatted}
                                      </span>
                                      <span style={{ 
                                        fontWeight: 700, 
                                        color: '#fbbf24', 
                                        backgroundColor: 'rgba(251, 191, 36, 0.08)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        border: '1px solid rgba(251, 191, 36, 0.15)'
                                      }}>
                                        {brk.duration}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                              No breaks recorded during this shift.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              No punch session history found yet. Your punches will appear here chronologically.
            </div>
          )}
        </div>
        {renderPagination(shiftPage, filteredHistory.length, 10, setShiftPage)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="glass" style={{ borderRadius: '18px', padding: '1.5rem', border: '1px solid var(--border)' }}>
        
        {/* Header Search controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Activity Logs History</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivityHistoryOpen(!isActivityHistoryOpen)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {isActivityHistoryOpen ? '▲' : '▼'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isActivityHistoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Worklogs Activity Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredWorklogs.length > 0 ? (
                  filteredWorklogs.slice((activityPage - 1) * 10, activityPage * 10).map((log) => {
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
              {renderPagination(activityPage, filteredWorklogs.length, 10, setActivityPage)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateSubTaskModal 
        isOpen={isSubTaskModalOpen} 
        onClose={() => setSubTaskModalOpen(false)} 
      />

      {/* Sleek Industry Gold Standard Break Category & Description Modal */}
      <Modal 
        isOpen={isBreakModalOpen} 
        onClose={() => {
          setBreakModalOpen(false);
          setSelectedCategory('');
          setBreakDescription('');
        }} 
        title="Initiate Break Session"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
              SELECT BREAK CATEGORY <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {[
                { name: 'Lunch / Dinner', emoji: '🍱', desc: 'Standard meal break' },
                { name: 'Tea / Coffee', emoji: '☕', desc: 'Quick hot beverage' },
                { name: 'Restroom / Relief', emoji: '🚻', desc: 'Personal quick relief' },
                { name: 'Internal Sync / Chat', emoji: '🤝', desc: 'Quick developer sync' },
                { name: 'Short Walk / Rest', emoji: '🚶', desc: 'Breather or stretching' },
                { name: 'Emergency / Personal', emoji: '🚨', desc: 'Critical urgent break' }
              ].map((cat) => {
                const isCatSelected = selectedCategory === cat.name;
                return (
                  <motion.div
                    key={cat.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: isCatSelected ? '1px solid #fbbf24' : '1px solid var(--border)',
                      background: isCatSelected ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.01)',
                      boxShadow: isCatSelected ? '0 0 10px rgba(251, 191, 36, 0.1)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>{cat.emoji}</span>
                    <strong style={{ fontSize: '0.8rem', color: isCatSelected ? '#fbbf24' : '#fff', display: 'block' }}>{cat.name}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{cat.desc}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              BREAK DESCRIPTION / NOTES {selectedCategory === 'Emergency / Personal' && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              placeholder={
                selectedCategory === 'Emergency / Personal' 
                  ? "Emergency breaks require a brief reason (e.g. power cut, family issue)..."
                  : "Enter additional notes about your break activity (optional)..."
              }
              value={breakDescription}
              onChange={(e) => setBreakDescription(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
                transition: 'all 0.3s'
              }}
              className="search-input"
            />
            {selectedCategory === 'Emergency / Personal' && !breakDescription.trim() && (
              <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                * Exemption details are required for security/operational transparency during emergency breaks.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setBreakModalOpen(false);
                setSelectedCategory('');
                setBreakDescription('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStartBreakSubmit}
              disabled={!selectedCategory || (selectedCategory === 'Emergency / Personal' && !breakDescription.trim())}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                backgroundColor: (!selectedCategory || (selectedCategory === 'Emergency / Personal' && !breakDescription.trim())) ? 'rgba(251, 191, 36, 0.2)' : '#fbbf24',
                color: 'black',
                fontWeight: 800,
                border: 'none',
                cursor: (!selectedCategory || (selectedCategory === 'Emergency / Personal' && !breakDescription.trim())) ? 'not-allowed' : 'pointer',
                opacity: (!selectedCategory || (selectedCategory === 'Emergency / Personal' && !breakDescription.trim())) ? 0.5 : 1
              }}
            >
              Start Break Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyWorklogs;
