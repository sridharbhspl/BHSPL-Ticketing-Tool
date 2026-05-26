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
  FolderKanban
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import Breadcrumbs from '../components/Breadcrumbs';

const WorkLogCard = ({ log, parent, updateSubTask, setSelectedTicketId }: any) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(log.title);
  const [editDesc, setEditDesc] = React.useState(log.workDoneToday);
  const [editHours, setEditHours] = React.useState(log.hoursWorked);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
  const { tickets, subTasks, projects, users, setSelectedTicketId, updateSubTask, isLoading, error } = useTicketStore();
  const { user: authUser, simulatedRole } = useAuthStore();
  const currentRole = simulatedRole || authUser?.role || 'Developer';
  const roleArray = currentRole.split(',').map(r => r.trim().toLowerCase());
  const isAdmin = roleArray.includes('admin');
  const isViewer = roleArray.includes('viewer') && !roleArray.includes('admin') && !roleArray.includes('project manager') && !roleArray.some(r => r.includes('developer'));
  
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
                    const statuses = ['Open', 'In Progress', 'In Review', 'Resolved', 'Closed'] as const;
                    const colors = {
                      Open: 'var(--primary)',
                      'In Progress': '#fbbf24',
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
                  {['Open', 'In Progress', 'In Review', 'Resolved', 'Closed'].map((status) => {
                    const colors = {
                      Open: 'var(--primary)',
                      'In Progress': '#fbbf24',
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
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderKanban size={20} color="var(--primary)" /> Project Workload Distribution
        </h4>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px' }}>
              {projects.length} ACTIVE UNITS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>Project Unit</span>
              <span>Total Workload</span>
              <span>Completion</span>
              <span>Timeline Health</span>
            </div>
            
            {projectStats.map((project) => (
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
            ))}
          </div>
        </section>

        {/* Team Workload Section */}
        {(isAdmin || isViewer) && (
          <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.75rem' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '10px' }}>
                <Users size={20} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Team Workload</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teamStats.map((teamUser) => (
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
              ))}
            </div>

            <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.8125rem' }}>
              Resource Planning
            </button>
          </section>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Recent Work Activity Stream */}
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px' }}>
                <MessageSquare size={20} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Work Log Stream</h4>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Recent Entries</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subTasks.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map(log => {
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
            })}
          </div>
        </section>

        {/* High Priority Stream */}
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px' }}>
              <Activity size={20} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Urgent Directives</h4>
          </div>
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
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
