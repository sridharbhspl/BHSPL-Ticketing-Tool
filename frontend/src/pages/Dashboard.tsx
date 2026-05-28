import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Filter,
  BarChart3,
  Users,
  Activity,
  Clock,
  Zap,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Edit2,
  Save,
  X,
  FolderKanban,
  History,
  ChevronDown,
  ChevronUp,
  Coffee,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import Breadcrumbs from '../components/Breadcrumbs';

const WorkLogCard = ({ log, parent, updateSubTask, setSelectedTicketId }: any) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(log.title);
  const [editDesc, setEditDesc] = React.useState(log.workDoneToday);
  const [editHours, setEditHours] = React.useState(log.hoursWorked);

  const { users } = useTicketStore();
  const engineer = users.find(u => u.id === log.assignedEngineerId);

  const { user: authUser, simulatedRole } = useAuthStore();
  const userRoles = (simulatedRole || authUser?.role || 'Developer').split(',').map(r => r.trim().toLowerCase());
  const isViewer = userRoles.includes('viewer') && !userRoles.includes('admin') && !userRoles.includes('project manager') && !userRoles.some(r => r.includes('developer'));

  const handleSave = () => {
    updateSubTask(log.id, {
      title: editTitle,
      workDoneToday: editDesc,
      hoursWorked: Number(editHours)
    });
    setIsEditing(false);
  };

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        padding: '1rem', 
        borderRadius: '14px', 
        backgroundColor: isEditing ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s'
      }}
    >
      {log.blockers && !isEditing && (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', backgroundColor: '#f59e0b' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {engineer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
              <img src={engineer.avatar} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} alt="" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{engineer.name}</span>
            </div>
          )}
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              <input 
                type="number" 
                value={editHours} 
                onChange={(e) => setEditHours(e.target.value)}
                style={{ width: '40px', padding: '0', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                step="0.5"
                min="0"
              />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)' }}>HRS</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {log.hoursWorked} HRS
            </span>
          )}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditing && !isViewer && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}
            >
              <Edit2 size={14} />
            </button>
          )}
          {log.blockers && !isEditing && <AlertTriangle size={14} color="#f59e0b" />}
        </div>
      </div>
      
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <input 
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ fontSize: '0.85rem', fontWeight: 700, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none' }}
            placeholder="Log Title"
          />
          <textarea 
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', minHeight: '60px', resize: 'none', outline: 'none' }}
            placeholder="What did you work on?"
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditTitle(log.title);
                setEditDesc(log.workDoneToday);
                setEditHours(log.hoursWorked);
              }} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border)', cursor: 'pointer' }}
              className="hover-glass"
            >
              <X size={12} /> Cancel
            </button>
            <button 
              onClick={handleSave} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'var(--primary)', color: 'black', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              <Save size={12} /> Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <h6 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{log.title}</h6>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{log.workDoneToday}</p>
        </>
      )}
      
      {!isEditing && (
        <div 
          onClick={() => parent && setSelectedTicketId(parent.id)}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.65rem', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            border: '1px solid var(--border)',
            padding: '2px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          className="hover-glass"
        >
          <ArrowUpRight size={10} />
          {parent?.id}: {parent?.title}
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5, border: '1px solid var(--primary-glow)' }}
    className="glass"
    style={{
      padding: '1.25rem',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      flex: 1,
      minWidth: '240px',
      border: '1px solid var(--border)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        padding: '0.625rem',
        borderRadius: '10px',
        backgroundColor: `${color}10`,
        color: color,
        border: `1px solid ${color}20`
      }}>
        <Icon size={20} />
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        fontSize: '0.7rem', 
        color: 'var(--success)',
        padding: '2px 8px',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: '20px',
        fontWeight: 700
      }}>
        <ArrowUpRight size={12} />
        {trend}%
      </div>
    </div>
    <div>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { tickets, subTasks, projects, users, teams, teamMembers, setSelectedTicketId, updateSubTask, isLoading, error } = useTicketStore();
  const { user: authUser, simulatedRole } = useAuthStore();
  const currentRole = simulatedRole || authUser?.role || 'Developer';
  const roleArray = currentRole.split(',').map(r => r.trim().toLowerCase());
  const isAdmin = roleArray.includes('admin');
  const isViewer = roleArray.includes('viewer') && !roleArray.includes('admin') && !roleArray.includes('project manager') && !roleArray.some(r => r.includes('developer'));

  // Daily timesheet log filtering states
  const [logSearchTerm, setLogSearchTerm] = React.useState('');
  const [projectFilter, setProjectFilter] = React.useState('all');
  const [teamFilter, setTeamFilter] = React.useState('all');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  // Attendance history states
  const { 
    history, 
    fetchAttendanceHistory,
    isPunchedIn, 
    isOnBreak, 
    punchInTime, 
    totalWorkedBeforeBreak, 
    breakStartTime, 
    totalBreakDuration,
    currentBreaks
  } = useAttendanceStore();

  const [attendanceSearchTerm, setAttendanceSearchTerm] = React.useState('');
  const [attendanceFromDate, setAttendanceFromDate] = React.useState('');
  const [attendanceToDate, setAttendanceToDate] = React.useState('');
  const [expandedSessions, setExpandedSessions] = React.useState<Record<string, boolean>>({});

  // Premium Calendar states & helpers
  const [currentCalendarDate, setCurrentCalendarDate] = React.useState(new Date());
  const [calSearch, setCalSearch] = React.useState('');
  const [calProjectFilter, setCalProjectFilter] = React.useState('all');
  const [calTeamFilter, setCalTeamFilter] = React.useState('all');

  // Pagination states
  const [dailyLogsPage, setDailyLogsPage] = React.useState(1);
  const [historyPage, setHistoryPage] = React.useState(1);
  const [performancePage, setPerformancePage] = React.useState(1);
  const [teamWorkloadPage, setTeamWorkloadPage] = React.useState(1);
  const ROWS_PER_PAGE = 10;

  // Collapsible containers state
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({
    workload: false,
    performance: false,
    teamWorkload: false,
    dailyLogs: false,
    directives: false,
    calendar: false,
    historyLogs: false
  });

  const toggleSectionCollapse = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const CollapseToggle: React.FC<{ isCollapsed: boolean; onClick: () => void }> = ({ isCollapsed, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        transition: 'all 0.2s',
        backgroundColor: 'rgba(255,255,255,0.02)',
        flexShrink: 0
      }}
    >
      {isCollapsed ? '▼' : '▲'}
    </motion.button>
  );

  const [workTimeMs, setWorkTimeMs] = React.useState(0);
  const [breakTimeMs, setBreakTimeMs] = React.useState(0);

  React.useEffect(() => {
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

  const formatMsToHHMM = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    const matchAlt = timeStr.match(/(\d+):(\d+)/);
    if (matchAlt) {
      return parseInt(matchAlt[1]) * 60 + parseInt(matchAlt[2]);
    }
    return 0;
  };

  const formatMinutesToHHMM = (totalMin: number) => {
    const hours = Math.floor(totalMin / 60);
    const minutes = totalMin % 60;
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

  React.useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const toggleSessionExpand = (id: string) => {
    setExpandedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(245, 158, 11, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>Initializing Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'inline-block' }}>
          <AlertTriangle color="#ef4444" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Connection Issue</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '1rem' }}>Retry Connection</button>
        </div>
      </div>
    );
  }

  const projectStats = projects.map(project => {
    const projectTickets = tickets.filter(t => t.projectId === project.id);
    const resolved = projectTickets.filter(t => t.status === 'Resolved').length;
    const progress = projectTickets.length > 0 ? Math.round((resolved / projectTickets.length) * 100) : 0;
    return { ...project, total: projectTickets.length, resolved, progress };
  });

  const teamStats = users.map(user => {
    const assignedTickets = tickets.filter(t => t.assigneeId === user.id);
    const inProgress = assignedTickets.filter(t => t.status === 'In Progress').length;
    const userHours = subTasks
      .filter(st => st.assignedEngineerId === user.id)
      .reduce((sum, st) => sum + st.hoursWorked, 0);
    return { ...user, count: assignedTickets.length, inProgress, hours: userHours };
  });

  const totalHours = subTasks.reduce((sum, st) => sum + st.hoursWorked, 0);
  const avgCompletion = subTasks.length > 0 
    ? Math.round(subTasks.reduce((sum, st) => sum + st.completionPercentage, 0) / subTasks.length) 
    : 0;

  const mainStats = isViewer ? [
    { title: 'Executive Incidents', value: tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length, icon: Activity, color: '#f59e0b', trend: 8 },
    { title: 'Total Logged Effort', value: `${totalHours} hrs`, icon: Clock, color: '#fbbf24', trend: 15 },
    { title: 'SLA Adherence', value: '98.4%', icon: CheckCircle2, color: '#10b981', trend: 100 },
    { title: 'Executive CSAT', value: '4.8 / 5.0', icon: Zap, color: '#ea580c', trend: 96 }
  ] : [
    { title: 'System Load', value: tickets.length, icon: Activity, color: '#f59e0b', trend: 12 },
    { title: 'Logged Effort', value: `${totalHours} hrs`, icon: Clock, color: '#fbbf24', trend: 15 },
    { title: 'Team Velocity', value: `${avgCompletion}%`, icon: Zap, color: '#ea580c', trend: 5 },
    { title: 'SLA Health', value: tickets.length > 0 ? '98.2%' : '---', icon: CheckCircle2, color: '#10b981', trend: 0 },
  ];

  const isManager = roleArray.includes('project manager') || roleArray.some(r => r.includes('manager'));
  const isTeamLead = roleArray.includes('team lead') || roleArray.some(r => r.includes('lead'));
  const isLeadOrManager = isAdmin || isManager || isTeamLead;

  // 1. Role-based filtering for logs
  const visibleLogs = subTasks.filter(log => {
    if (isLeadOrManager) return true; // Admins, Managers, and Team Leads see everyone's logs
    return log.assignedEngineerId === authUser?.id; // Standard users only see their own logs
  });

  // 2. Filter logs by search query, project, team, and date range
  const filteredLogs = visibleLogs.filter(log => {
    const parentTicket = tickets.find(t => t.id === log.parentTicketId);
    const engineer = users.find(u => u.id === log.assignedEngineerId);
    const engineerName = engineer ? engineer.name.toLowerCase() : '';
    
    // Search Term Filter (Name, Title, or workDoneToday)
    if (logSearchTerm.trim()) {
      const q = logSearchTerm.toLowerCase();
      const matchName = engineerName.includes(q);
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchDesc = log.workDoneToday.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchDesc) return false;
    }

    // Project Filter
    if (projectFilter !== 'all') {
      if (!parentTicket || parentTicket.projectId !== projectFilter) return false;
    }

    // Team Filter
    if (teamFilter !== 'all') {
      const logTeam = log.team || (parentTicket && parentTicket.assignedTeam) || '';
      if (logTeam.toLowerCase() !== teamFilter.toLowerCase()) return false;
    }

    // Date Filters
    const logDateStr = log.workDate || log.createdAt.split('T')[0];
    if (fromDate && logDateStr < fromDate) return false;
    if (toDate && logDateStr > toDate) return false;

    return true;
  });

  // 3. Filter attendance history sessions by date range and search term
  const filteredHistory = (history || []).filter(session => {
    if (!isLeadOrManager && session.userId && session.userId.toString() !== authUser?.id.toString()) {
      return false; // Non-admin/non-manager only sees their own sessions
    }

    // Name or Session ID search filter
    if (attendanceSearchTerm.trim()) {
      const q = attendanceSearchTerm.toLowerCase();
      const matchName = session.userName && session.userName.toLowerCase().includes(q);
      const matchId = session.id.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }

    // From and To Date range filters
    if (session.date) {
      const sessionDateStr = session.date; // YYYY-MM-DD
      if (attendanceFromDate && sessionDateStr < attendanceFromDate) return false;
      if (attendanceToDate && sessionDateStr > attendanceToDate) return false;
    }

    return true;
  });

  // 4. Filter attendance history for the calendar based on roles & filters
  const filteredCalendarHistory = (history || []).filter(session => {
    // Role-based visibility
    if (!isLeadOrManager && session.userId && session.userId.toString() !== authUser?.id.toString()) {
      return false; // Non-admin/non-manager only sees their own sessions
    }

    // Name Search Filter
    if (calSearch.trim()) {
      const q = calSearch.toLowerCase();
      if (!session.userName || !session.userName.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Project Filter
    if (calProjectFilter !== 'all') {
      const projectTeams = teams.filter(t => t.projectId === calProjectFilter).map(t => t.id);
      const projectUserIds = teamMembers.filter(tm => projectTeams.includes(tm.teamId)).map(tm => tm.userId.toString());
      if (!session.userId || !projectUserIds.includes(session.userId.toString())) {
        return false;
      }
    }

    // Team Filter
    if (calTeamFilter !== 'all') {
      const teamUserIds = teamMembers.filter(tm => tm.teamId === calTeamFilter).map(tm => tm.userId.toString());
      if (!session.userId || !teamUserIds.includes(session.userId.toString())) {
        return false;
      }
    }

    return true;
  });

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {isViewer ? 'Executive Stakeholder BI Command Center' : isAdmin ? 'Operational Command Center' : 'Personal Performance Hub'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9375rem' }}>
            {isViewer ? 'High-level service intelligence, SLA statistics, and operational KPI summaries.' : isAdmin ? 'Global project overview and team distribution metrics.' : 'Your active projects and personal ticket metrics.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary">
            <Filter size={18} />
            Analytics Filter
          </button>
        </div>
      </header>

      {tickets.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border)', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Zap size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Welcome to Bavya Ticketing Tool</h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Your command center is ready. To begin tracking projects and managing work assignments, please create your first ticket or project unit.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => useTicketStore.getState().setCreateModalOpen(true)} className="btn-primary" style={{ padding: '12px 24px' }}>
              Create First Ticket
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {mainStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {isViewer && (
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {/* Radial SLA Gauge Card */}
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: '320px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
                    <circle cx="50" cy="50" r="40" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="8" fill="transparent" />
                    <motion.circle 
                      cx="50" cy="50" r="40" stroke="var(--success)" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset="4.0"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 4.0 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>98.4%</span>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>SLA Compliance Health</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                    Percentage of active tickets resolved within corporate support SLA deadlines. Adherence remains high.
                  </p>
                </div>
              </div>

              {/* CSAT Satisfaction Index Card */}
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '320px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', padding: '12px 18px', border: '1px solid rgba(245, 158, 11, 0.15)', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>4.8</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', marginTop: '2px' }}>OUT OF 5</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Executive CSAT Index</h4>
                  <div style={{ display: 'flex', gap: '2px', margin: '4px 0', color: 'var(--primary)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ fontSize: '0.9rem' }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                    Average score based on client feedback and automated resolution surveys completed this period.
                  </p>
                </div>
              </div>

              {/* Dynamic Stacked Distribution Bar Card */}
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Operational Workload Status</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>{tickets.length} ACTIVE INCIDENTS</span>
                </div>
                <div style={{ display: 'flex', width: '100%', height: '14px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  {(() => {
                    const statuses = ['Open', 'In Progress', 'Blocked', 'In Review', 'Resolved', 'Closed'] as const;
                    const colors = {
                      Open: 'var(--primary)',
                      'In Progress': '#fbbf24',
                      Blocked: '#ef4444',
                      'In Review': '#a855f7',
                      Resolved: 'var(--success)',
                      Closed: 'var(--text-muted)'
                    };
                    return statuses.map((status) => {
                      const count = tickets.filter(t => t.status === status).length;
                      const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                      if (pct === 0) return null;
                      return (
                        <div 
                           key={status}
                           title={`${status}: ${count} (${pct.toFixed(0)}%)`}
                           style={{
                             width: `${pct}%`,
                             backgroundColor: colors[status],
                             height: '100%',
                             transition: 'width 0.5s ease-in-out'
                           }}
                        />
                      );
                    });
                  })()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '4px' }}>
                  {['Open', 'In Progress', 'Blocked', 'In Review', 'Resolved', 'Closed'].map((status) => {
                    const colors = {
                      Open: 'var(--primary)',
                      'In Progress': '#fbbf24',
                      Blocked: '#ef4444',
                      'In Review': '#a855f7',
                      Resolved: 'var(--success)',
                      Closed: 'var(--text-muted)'
                    };
                    const count = tickets.filter(t => t.status === status).length;
                    return (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[status as keyof typeof colors] }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                          {status}: <span style={{ color: 'white' }}>{count}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FolderKanban size={20} color="var(--primary)" /> Project Workload Distribution
          </h4>
          <CollapseToggle 
            isCollapsed={collapsedSections.workload} 
            onClick={() => toggleSectionCollapse('workload')} 
          />
        </div>
        {!collapsedSections.workload && (
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {projectStats.map((project, i) => (
              <StatCard 
                key={i}
                title={project.name}
                value={`${project.total} Tickets`}
                icon={FolderKanban}
                color={project.color}
                trend={project.progress}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: (isAdmin || isViewer) ? '1.8fr 1.2fr' : '1fr', gap: '1.5rem' }}>
        {/* Project Performance Section */}
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                <BarChart3 size={20} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Project Performance</h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px' }}>
                {projects.length} ACTIVE UNITS
              </span>
              <CollapseToggle 
                isCollapsed={collapsedSections.performance} 
                onClick={() => toggleSectionCollapse('performance')} 
              />
            </div>
          </div>

          {!collapsedSections.performance && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Project Unit</span>
                  <span>Total Workload</span>
                  <span>Completion</span>
                  <span>Timeline Health</span>
                </div>
                
                {(() => {
                  const sortedProjects = [...projectStats];
                  const pagedProjects = sortedProjects.slice((performancePage - 1) * ROWS_PER_PAGE, performancePage * ROWS_PER_PAGE);
                  return pagedProjects.map((project) => (
                    <motion.div 
                      key={project.id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
                        alignItems: 'center',
                        padding: '1.25rem 1rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.03)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}50` }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{project.name}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{project.code}-SYS</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{project.total} Tickets</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>{project.resolved} Done</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--text-dim)' }}>Efficiency</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            style={{ height: '100%', backgroundColor: project.color, borderRadius: '10px' }} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Project Performance Pagination Panel */}
              {(() => {
                const totalPerformancePages = Math.ceil(projectStats.length / ROWS_PER_PAGE);
                if (totalPerformancePages <= 1) return null;
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <motion.button
                      whileHover={performancePage > 1 ? { scale: 1.05 } : {}}
                      whileTap={performancePage > 1 ? { scale: 0.95 } : {}}
                      disabled={performancePage === 1}
                      onClick={() => setPerformancePage(prev => Math.max(prev - 1, 1))}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: performancePage === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: performancePage === 1 ? 'var(--text-muted)' : 'white',
                        cursor: performancePage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      Previous
                    </motion.button>
                    
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                      Page <span style={{ color: 'white' }}>{performancePage}</span> of {totalPerformancePages}
                    </span>

                    <motion.button
                      whileHover={performancePage < totalPerformancePages ? { scale: 1.05 } : {}}
                      whileTap={performancePage < totalPerformancePages ? { scale: 0.95 } : {}}
                      disabled={performancePage === totalPerformancePages}
                      onClick={() => setPerformancePage(prev => Math.min(prev + 1, totalPerformancePages))}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: performancePage === totalPerformancePages ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: performancePage === totalPerformancePages ? 'var(--text-muted)' : 'white',
                        cursor: performancePage === totalPerformancePages ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      Next
                    </motion.button>
                  </div>
                );
              })()}
            </>
          )}
        </section>

        {/* Team Workload Section */}
        {(isAdmin || isViewer) && (
          <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '10px' }}>
                  <Users size={20} />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Team Workload</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px' }}>
                  {teamStats.length} MEMBERS
                </span>
                <CollapseToggle 
                  isCollapsed={collapsedSections.teamWorkload} 
                  onClick={() => toggleSectionCollapse('teamWorkload')} 
                />
              </div>
            </div>

            {!collapsedSections.teamWorkload && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(() => {
                    const sortedTeam = [...teamStats];
                    const pagedTeam = sortedTeam.slice((teamWorkloadPage - 1) * ROWS_PER_PAGE, teamWorkloadPage * ROWS_PER_PAGE);
                    return pagedTeam.map((teamUser) => (
                      <div key={teamUser.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={teamUser.avatar} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)' }} alt="" />
                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid #000' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{teamUser.name}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{teamUser.role}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{teamUser.hours}h</p>
                          <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>LOGGED</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Team Workload Pagination Panel */}
                {(() => {
                  const totalTeamPages = Math.ceil(teamStats.length / ROWS_PER_PAGE);
                  if (totalTeamPages <= 1) return null;
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <motion.button
                        whileHover={teamWorkloadPage > 1 ? { scale: 1.05 } : {}}
                        whileTap={teamWorkloadPage > 1 ? { scale: 0.95 } : {}}
                        disabled={teamWorkloadPage === 1}
                        onClick={() => setTeamWorkloadPage(prev => Math.max(prev - 1, 1))}
                        style={{
                          padding: '5px 12px',
                          backgroundColor: teamWorkloadPage === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: teamWorkloadPage === 1 ? 'var(--text-muted)' : 'white',
                          cursor: teamWorkloadPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        Previous
                      </motion.button>
                      
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                        Page <span style={{ color: 'white' }}>{teamWorkloadPage}</span> of {totalTeamPages}
                      </span>

                      <motion.button
                        whileHover={teamWorkloadPage < totalTeamPages ? { scale: 1.05 } : {}}
                        whileTap={teamWorkloadPage < totalTeamPages ? { scale: 0.95 } : {}}
                        disabled={teamWorkloadPage === totalTeamPages}
                        onClick={() => setTeamWorkloadPage(prev => Math.min(prev + 1, totalTeamPages))}
                        style={{
                          padding: '5px 12px',
                          backgroundColor: teamWorkloadPage === totalTeamPages ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: teamWorkloadPage === totalTeamPages ? 'var(--text-muted)' : 'white',
                          cursor: teamWorkloadPage === totalTeamPages ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        Next
                      </motion.button>
                    </div>
                  );
                })()}

                <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.8125rem' }}>
                  Resource Planning
                </button>
              </>
            )}
          </section>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Recent Work Activity Stream */}
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Daily Timesheet Logs</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {isLeadOrManager ? "Global team timesheet command view" : "Your personal timesheet logs"}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>
                {filteredLogs.length} Entr{filteredLogs.length === 1 ? 'y' : 'ies'}
              </span>
              <CollapseToggle 
                isCollapsed={collapsedSections.dailyLogs} 
                onClick={() => toggleSectionCollapse('dailyLogs')} 
              />
            </div>
          </div>

          {!collapsedSections.dailyLogs && (
            <>
              {/* Timesheet Filter Panel */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                {/* Search Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Search</label>
                  <input 
                    type="text"
                    placeholder={isLeadOrManager ? "Name, title..." : "Search logs..."}
                    value={logSearchTerm}
                    onChange={(e) => {
                      setLogSearchTerm(e.target.value);
                      setDailyLogsPage(1);
                    }}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Project Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Project</label>
                  <select
                    value={projectFilter}
                    onChange={(e) => {
                      setProjectFilter(e.target.value);
                      setDailyLogsPage(1);
                    }}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: '#0f0f12',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      outline: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Team Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Team</label>
                  <select
                    value={teamFilter}
                    onChange={(e) => {
                      setTeamFilter(e.target.value);
                      setDailyLogsPage(1);
                    }}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: '#0f0f12',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      outline: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">All Teams</option>
                    <option value="Support Engineering">Support Eng</option>
                    <option value="Platform Engineering">Platform Eng</option>
                    <option value="UI/UX Core">UI/UX Core</option>
                    <option value="Database Ops">Database Ops</option>
                  </select>
                </div>

                {/* From Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>From Date</label>
                  <input 
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setDailyLogsPage(1);
                    }}
                    style={{
                      padding: '4px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.75rem',
                      outline: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* To Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>To Date</label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input 
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setDailyLogsPage(1);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.75rem',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: 0
                      }}
                    />
                    {(fromDate || toDate || logSearchTerm || projectFilter !== 'all' || teamFilter !== 'all') && (
                      <button 
                        onClick={() => {
                          setLogSearchTerm('');
                          setProjectFilter('all');
                          setTeamFilter('all');
                          setFromDate('');
                          setToDate('');
                          setDailyLogsPage(1);
                        }}
                        title="Clear Filters"
                        style={{
                          padding: '5px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logs List Area with Custom Scrollbar */}
              <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredLogs.length > 0 ? (
                  (() => {
                    const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const pagedLogs = sortedLogs.slice((dailyLogsPage - 1) * ROWS_PER_PAGE, dailyLogsPage * ROWS_PER_PAGE);
                    return pagedLogs.map(log => {
                      const parent = tickets.find(t => t.id === log.parentTicketId);
                      return (
                        <WorkLogCard 
                          key={log.id} 
                          log={log} 
                          parent={parent} 
                          updateSubTask={updateSubTask} 
                          setSelectedTicketId={setSelectedTicketId} 
                        />
                      );
                    });
                  })()
                ) : (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    No matching daily timesheet logs found for selected filters.
                  </div>
                )}
              </div>

              {/* Daily Logs Pagination Panel */}
              {(() => {
                const totalDailyLogsPages = Math.ceil(filteredLogs.length / ROWS_PER_PAGE);
                if (totalDailyLogsPages <= 1) return null;
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <motion.button
                      whileHover={dailyLogsPage > 1 ? { scale: 1.05 } : {}}
                      whileTap={dailyLogsPage > 1 ? { scale: 0.95 } : {}}
                      disabled={dailyLogsPage === 1}
                      onClick={() => setDailyLogsPage(prev => Math.max(prev - 1, 1))}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: dailyLogsPage === 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: dailyLogsPage === 1 ? 'var(--text-muted)' : 'white',
                        cursor: dailyLogsPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      Previous
                    </motion.button>
                    
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                      Page <span style={{ color: 'white' }}>{dailyLogsPage}</span> of {totalDailyLogsPages}
                    </span>

                    <motion.button
                      whileHover={dailyLogsPage < totalDailyLogsPages ? { scale: 1.05 } : {}}
                      whileTap={dailyLogsPage < totalDailyLogsPages ? { scale: 0.95 } : {}}
                      disabled={dailyLogsPage === totalDailyLogsPages}
                      onClick={() => setDailyLogsPage(prev => Math.min(prev + 1, totalDailyLogsPages))}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: dailyLogsPage === totalDailyLogsPages ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: dailyLogsPage === totalDailyLogsPages ? 'var(--text-muted)' : 'white',
                        cursor: dailyLogsPage === totalDailyLogsPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      Next
                    </motion.button>
                  </div>
                );
              })()}
            </>
          )}
        </section>

        {/* High Priority Stream */}
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px' }}>
                <Activity size={20} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Urgent Directives</h4>
            </div>
            <CollapseToggle 
              isCollapsed={collapsedSections.directives} 
              onClick={() => toggleSectionCollapse('directives')} 
            />
          </div>
          
          {!collapsedSections.directives && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tickets.filter(t => t.priority === 'High' || t.priority === 'Urgent').slice(0, 3).map(ticket => (
                  <motion.div 
                    key={ticket.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(239, 68, 68, 0.03)',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444' }}>{ticket.id}</span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{ticket.type.toUpperCase()}</span>
                      </div>
                      <h5 style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{ticket.title}</h5>
                    </div>
                    <ChevronRight size={16} color="var(--text-dim)" />
                  </motion.div>
                ))}
              </div>
              
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.01))',
                border: '1px dashed var(--primary)'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>PRO-TIP:</span> Use the "Add Work Log" button on the board to track granular daily progress and synchronize with these metrics.
                </p>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Premium Monthly Attendance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid var(--border)',
          marginTop: '2rem',
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {isLeadOrManager ? 'Quick view of team-wide attendance calendar summaries.' : 'Quick summary of daily working & break times per month.'}
              </p>
            </div>
          </div>

          {/* Month/Year Selection controls and Collapse button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

            <CollapseToggle 
              isCollapsed={collapsedSections.calendar} 
              onClick={() => toggleSectionCollapse('calendar')} 
            />
          </div>
        </div>

        {!collapsedSections.calendar && (
          <>

        {/* Role-wise Search and Filters Section (Only displayed for Admins, Managers, and Leads) */}
        {isLeadOrManager && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '14px',
            border: '1px solid var(--border)'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Search Team Member</label>
              <input 
                type="text"
                placeholder="Search engineer name..."
                value={calSearch}
                onChange={(e) => setCalSearch(e.target.value)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Project Dropdown Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Filter Project</label>
              <select
                value={calProjectFilter}
                onChange={(e) => setCalProjectFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#0f0f12',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Team Dropdown Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Filter Team</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={calTeamFilter}
                  onChange={(e) => setCalTeamFilter(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    backgroundColor: '#0f0f12',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: 0
                  }}
                >
                  <option value="all">All Teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {(calSearch || calProjectFilter !== 'all' || calTeamFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setCalSearch('');
                      setCalProjectFilter('all');
                      setCalTeamFilter('all');
                    }}
                    title="Clear Filters"
                    style={{
                      padding: '7px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
            const year = cell.dateObj.getFullYear();
            const month = String(cell.dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(cell.dateObj.getDate()).padStart(2, '0');
            const formattedDateStr = `${year}-${month}-${day}`;

            const daySessions = filteredCalendarHistory.filter(session => session.date === formattedDateStr);
            const isToday = cell.dateObj.toDateString() === new Date().toDateString();
            
            // Metrics aggregation
            let totalMins = 0;
            let totalBreakMins = 0;
            let totalBreaksCount = 0;
            let hasActiveSession = false;

            if (daySessions.length > 0) {
              daySessions.forEach(s => {
                if (s.status === 'Active') {
                  totalMins += Math.floor(workTimeMs / 60000);
                  totalBreakMins += Math.floor(breakTimeMs / 60000);
                  totalBreaksCount += currentBreaks ? currentBreaks.filter(b => b.endTime).length : 0;
                  hasActiveSession = true;
                } else {
                  totalMins += parseTimeToMinutes(s.totalWorkTime);
                  totalBreakMins += parseTimeToMinutes(s.totalBreakTime);
                  totalBreaksCount += s.breakDetails ? s.breakDetails.length : 0;
                }
              });
            }

            const workHoursStr = formatMinutesToHHMM(totalMins);
            const breakHoursStr = formatMinutesToHHMM(totalBreakMins);

            // Construct rich multiline hover tooltip for complete team transparency
            let tooltipText = undefined;
            if (daySessions.length > 0) {
              if (daySessions.length === 1) {
                const s = daySessions[0];
                const w = s.status === 'Active' ? formatMsToHHMM(workTimeMs) : s.totalWorkTime;
                const b = s.status === 'Active' ? formatMsToHHMM(breakTimeMs) : s.totalBreakTime;
                const bc = s.status === 'Active' ? (currentBreaks ? currentBreaks.filter(b => b.endTime).length : 0) : (s.breakDetails ? s.breakDetails.length : 0);
                tooltipText = `Date: ${cell.dateObj.toDateString()}\nEmployee: ${s.userName || 'Unknown'}\nTotal Work Time: ${w}\nTotal Break Time: ${b}\nBreaks: ${bc} break${bc === 1 ? '' : 's'}`;
              } else {
                tooltipText = `Date: ${cell.dateObj.toDateString()}\nTotal Team Logged: ${daySessions.length} members\n` + 
                  daySessions.map(s => {
                    const w = s.status === 'Active' ? formatMsToHHMM(workTimeMs) : s.totalWorkTime;
                    const b = s.status === 'Active' ? formatMsToHHMM(breakTimeMs) : s.totalBreakTime;
                    const bc = s.status === 'Active' ? (currentBreaks ? currentBreaks.filter(b => b.endTime).length : 0) : (s.breakDetails ? s.breakDetails.length : 0);
                    return `• ${s.userName || 'Unknown'}: 💼 ${w} | ☕ ${b} (${bc} break${bc === 1 ? '' : 's'})`;
                  }).join('\n');
              }
            }

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -2, zIndex: 10 }}
                title={tooltipText}
                style={{
                  minHeight: '90px',
                  borderRadius: '12px',
                  border: isToday 
                    ? '1.5px solid var(--primary)' 
                    : daySessions.length > 0 
                      ? '1px solid rgba(16, 185, 129, 0.25)' 
                      : '1px solid var(--border)',
                  background: isToday
                    ? 'rgba(245, 158, 11, 0.03)'
                    : daySessions.length > 0
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
                  
                  {daySessions.length > 0 && (
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: hasActiveSession ? '#fbbf24' : '#10b981',
                      boxShadow: hasActiveSession ? '0 0 8px #fbbf24' : '0 0 8px #10b981'
                    }} />
                  )}
                </div>

                {/* Day Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  {daySessions.length > 0 ? (
                    <>
                      {/* Total Working Hours */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: hasActiveSession ? '#fbbf24' : '#34d399',
                        backgroundColor: hasActiveSession ? 'rgba(251, 191, 36, 0.06)' : 'rgba(52, 211, 153, 0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        maxWidth: 'fit-content'
                      }}>
                        <span style={{ transform: 'scale(0.85)', display: 'inline-block' }}>💼</span>
                        <span>{daySessions.length > 1 ? `Tot: ${workHoursStr}` : workHoursStr}</span>
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
                        <span>{breakHoursStr} ({totalBreaksCount} brk{totalBreaksCount === 1 ? '' : 's'})</span>
                      </div>

                      {/* Dynamic user names list */}
                      {isLeadOrManager && (
                        <div style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: 600, 
                          color: 'var(--text-dim)',
                          marginTop: '2.5px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          paddingTop: '3px'
                        }}>
                          👤 {Array.from(new Set(daySessions.map(s => s.userName?.split(' ')[0] || 'Unknown'))).join(', ')}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ height: '24px' }} /> // Spacer to preserve grid cell size symmetry
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        </>
        )}
      </motion.div>

      {/* Shift & Break History Logs */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
              <History size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Shift & Break History Logs</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {isLeadOrManager ? 'Comprehensive audit trail of team shifts, break reasons, and durations.' : 'Track your chronological work shifts, breaks, and justifications.'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'rgba(245,158,11,0.08)', padding: '5px 10px', borderRadius: '8px' }}>
              {filteredHistory.length} SESSION{filteredHistory.length === 1 ? '' : 'S'}
            </span>
            <CollapseToggle 
              isCollapsed={collapsedSections.historyLogs} 
              onClick={() => toggleSectionCollapse('historyLogs')} 
            />
          </div>
        </div>

        {!collapsedSections.historyLogs && (
          <>
            {/* Filters Panel */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem', 
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderRadius: '14px',
              border: '1px solid var(--border)'
            }}>
              {/* Search bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Search</label>
                <input 
                  type="text"
                  placeholder={isLeadOrManager ? "Search engineer name..." : "Search shift ID..."}
                  value={attendanceSearchTerm}
                  onChange={(e) => {
                    setAttendanceSearchTerm(e.target.value);
                    setHistoryPage(1);
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* From Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>From Date</label>
                <input 
                  type="date"
                  value={attendanceFromDate}
                  onChange={(e) => {
                    setAttendanceFromDate(e.target.value);
                    setHistoryPage(1);
                  }}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* To Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>To Date</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    type="date"
                    value={attendanceToDate}
                    onChange={(e) => {
                      setAttendanceToDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: 0
                    }}
                  />
                  {(attendanceSearchTerm || attendanceFromDate || attendanceToDate) && (
                    <button 
                      onClick={() => {
                        setAttendanceSearchTerm('');
                        setAttendanceFromDate('');
                        setAttendanceToDate('');
                        setHistoryPage(1);
                      }}
                      title="Clear Filters"
                      style={{
                        padding: '7px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sessions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filteredHistory.length > 0 ? (
                (() => {
                  const pagedHistory = filteredHistory.slice((historyPage - 1) * ROWS_PER_PAGE, historyPage * ROWS_PER_PAGE);
                  return pagedHistory.map((session) => {
                    const isExpanded = !!expandedSessions[session.id];
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
                          borderRadius: '14px', 
                          overflow: 'hidden', 
                          backgroundColor: 'rgba(255, 255, 255, 0.01)',
                          transition: 'all 0.3s',
                          flexShrink: 0
                        }}
                      >
                        {/* Summary row */}
                        <div 
                          onClick={() => toggleSessionExpand(session.id)}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            {/* Optional User profile for lead views */}
                            {isLeadOrManager && session.userName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img 
                                  src={session.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'} 
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }} 
                                  alt="" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{session.userName}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>ID: {session.id}</span>
                                </div>
                              </div>
                            )}
                            
                            {!isLeadOrManager && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '3px 8px', borderRadius: '6px' }}>
                                {session.id}
                              </span>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{formattedDate}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                Shift: {session.punchInTime} to {session.punchOutTime || 'Active'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--success)' }}>{session.totalWorkTime || '00h 00m'}</span>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Time</span>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>{session.totalBreakTime || '00h 00m'}</span>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Break ({breaksCount})</span>
                              </div>
                            </div>

                            <div style={{ 
                              color: 'var(--text-dim)', 
                              padding: '6px', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              backgroundColor: 'rgba(255,255,255,0.02)'
                            }}>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded timeline block */}
                        {isExpanded && (
                          <div style={{ 
                            padding: '1.25rem', 
                            backgroundColor: 'rgba(0, 0, 0, 0.15)', 
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.875rem'
                          }}>
                            <h5 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-dim)', margin: 0 }}>
                              Chronological Break Logs
                            </h5>
                            
                            {session.breakDetails && session.breakDetails.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', paddingLeft: '1rem' }}>
                                {/* Left boundary timeline line */}
                                <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '2px', width: '1px', backgroundColor: 'var(--border)' }} />
                                
                                {session.breakDetails.map((brk: any, idx: number) => (
                                  <div key={brk.id || idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {/* Left timeline dot */}
                                    <div style={{ 
                                      position: 'absolute', 
                                      left: '-17px', 
                                      top: '4px', 
                                      width: '7px', 
                                      height: '7px', 
                                      borderRadius: '50%', 
                                      backgroundColor: '#fbbf24',
                                      border: '2px solid #000'
                                    }} />
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{brk.category}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                          ({new Date(brk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {brk.endTime ? new Date(brk.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'})
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {brk.duration || 'Running'}
                                      </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '2px 0 0 0', lineHeight: 1.4, fontStyle: brk.description ? 'normal' : 'italic' }}>
                                      {brk.description || 'No description provided.'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.75rem', padding: '4px 0' }}>
                                <Coffee size={14} />
                                <span>No breaks taken during this shift.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              ) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                  No matching shift & break history logs found for selected filters.
                </div>
              )}
            </div>

            {/* Shift Logs Pagination Panel */}
            {(() => {
              const totalHistoryPages = Math.ceil(filteredHistory.length / ROWS_PER_PAGE);
              if (totalHistoryPages <= 1) return null;
              const startIdx = (historyPage - 1) * ROWS_PER_PAGE + 1;
              const endIdx = Math.min(historyPage * ROWS_PER_PAGE, filteredHistory.length);
              const getPageNumbers = () => {
                const pages: (number | string)[] = [];
                for (let i = 1; i <= totalHistoryPages; i++) {
                  if (i === 1 || i === totalHistoryPages || (i >= historyPage - 1 && i <= historyPage + 1)) {
                    pages.push(i);
                  } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...');
                  }
                }
                return pages;
              };
              return (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Showing <strong style={{ color: 'white' }}>{startIdx}</strong> to <strong style={{ color: 'white' }}>{endIdx}</strong> of <strong style={{ color: 'white' }}>{filteredHistory.length}</strong> sessions
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <motion.button
                      whileHover={historyPage > 1 ? { scale: 1.05 } : {}}
                      whileTap={historyPage > 1 ? { scale: 0.95 } : {}}
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: historyPage === 1 ? 'var(--text-dim)' : 'white',
                        cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        opacity: historyPage === 1 ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      Previous
                    </motion.button>

                    {getPageNumbers().map((page, idx) => {
                      if (page === '...') {
                        return <span key={idx} style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: '0 2px' }}>...</span>;
                      }
                      const isActive = page === historyPage;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={!isActive ? { scale: 1.1 } : {}}
                          whileTap={!isActive ? { scale: 0.95 } : {}}
                          onClick={() => setHistoryPage(page as number)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                            color: isActive ? '#000' : 'white',
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 800 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          {page}
                        </motion.button>
                      );
                    })}

                    <motion.button
                      whileHover={historyPage < totalHistoryPages ? { scale: 1.05 } : {}}
                      whileTap={historyPage < totalHistoryPages ? { scale: 0.95 } : {}}
                      disabled={historyPage === totalHistoryPages}
                      onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: historyPage === totalHistoryPages ? 'var(--text-dim)' : 'white',
                        cursor: historyPage === totalHistoryPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        opacity: historyPage === totalHistoryPages ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
