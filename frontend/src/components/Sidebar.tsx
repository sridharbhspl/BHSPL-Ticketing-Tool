import React from 'react';
import { 
  LayoutDashboard, 
  Ticket as TicketIcon, 
  FolderKanban, 
  Users, 
  Settings, 
  PlusCircle,
  LogOut,
  BarChart3,
  MessageSquare,
  Lock,
  Clock,
  UserCheck,
  Calendar,
  HeartPulse,
  Coins,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useRBACStore } from '../store/useRBACStore';

import logoImg from '../assets/logo_Bavya1.png.png';


const CollaboratorAvatar = ({ user }: { user: any }) => {
  const [failed, setFailed] = React.useState(false);
  
  React.useEffect(() => {
    setFailed(false);
  }, [user.avatar]);

  return user.avatar && !failed ? (
    <img
      src={user.avatar}
      onError={() => setFailed(true)}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: '2px solid #000',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        objectFit: 'cover'
      }}
      alt=""
    />
  ) : (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)',
      color: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '0.85rem',
      border: '2px solid #000',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      textTransform: 'uppercase',
      userSelect: 'none'
    }}>
      {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
    </div>
  );
};


interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCreateModalOpen, users } = useTicketStore();
  const { user, logout, simulatedRole } = useAuthStore();
  const { channels } = useChatStore();
  const { hasModuleAccess, hasActionAccess } = useRBACStore();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  const currentRole = simulatedRole || user?.role || 'Developer';

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

  const totalUnread = React.useMemo(() => 
    channels.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  , [channels]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',          id: 'dashboard',   path: '/dashboard' },
    { icon: UserCheck,       label: 'My Tickets',         id: 'my-tickets',  path: '/my-tickets' },
    { icon: Clock,           label: 'Daily Timesheet',    id: 'my-worklogs', path: '/my-worklogs' },
    { icon: Calendar,        label: 'Timesheets',         id: 'timesheets',  path: '/timesheets' },
    { icon: HeartPulse,      label: 'Leave & Short Leave',id: 'leaves',      path: '/leaves' },
    { icon: TicketIcon,      label: 'Tickets List',       id: 'tickets',     path: '/tickets' },
    { icon: BarChart3,       label: 'Ticket Status Board',id: 'board',       path: '/board' },
    { icon: FolderKanban,    label: 'Projects',           id: 'projects',    path: '/projects' },
    { icon: Users,           label: 'Team',               id: 'team',        path: '/team' },
    { icon: MessageSquare,   label: 'Communications',     id: 'chat',        path: '/chat', badge: totalUnread },
  ];

  const portalItems = [
    { icon: Coins,       label: 'Payroll Portal',      id: 'payroll',       path: '/payroll',      color: '#10b981' },
    { icon: Headphones,  label: 'Service Desk Portal', id: 'service-desk',  path: '/service-desk', color: '#8b5cf6' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          id="sidebar-overlay-mobile"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          className="mobile-only sidebar-mobile-overlay"
        />
      )}
      
      <aside 
        id="sidebar-container"
        className={className || `sidebar glass custom-scrollbar ${isOpen ? 'open' : ''}`} 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          borderRight: '1px solid var(--border)',
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
      <motion.div
        id="sidebar-logo-container"
        className="sidebar-logo-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : '1.25rem',
          marginBottom: isCollapsed ? '1.5rem' : '3rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.3s',
          flexShrink: 0,
        }}
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
        onClick={() => navigate('/dashboard')}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={isCollapsed ? {
            width: '44px',
            height: '44px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            borderRadius: '12px',
            backgroundColor: '#000',
            border: '1px solid rgba(255,255,255,0.05)'
          } : {
            width: '150px',
            height: '44px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            borderRadius: '12px',
            backgroundColor: '#000',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0) 75%)', borderRadius: '50%', zIndex: -1 }} />
          <img 
            src={logoImg} 
            alt="Bavya Logo" 
            style={isCollapsed ? {
              width: '260%',
              height: '100%',
              objectFit: 'contain',
              transform: 'scale(3.0) translateX(-17%)', // focuses perfectly on the colored squares icon
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            } : {
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: 'scale(2.6) translateY(-1px)', // scales up to crop out the empty black borders
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }} 
          />
        </motion.div>
        {!isCollapsed && (
          <div className="sidebar-logo-text" style={{ display: 'flex', flexDirection: 'column', marginLeft: '-5px' }}>
            <h1 style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Ticketing<br />
              <span className="gradient-text" style={{ fontSize: '1.05rem', fontWeight: 900 }}>Portal</span>
            </h1>
          </div>
        )}
      </motion.div>

      <nav style={{ flex: 1 }}>
        {!isCollapsed && (
          <p 
            id="sidebar-menu-title"
            className="sidebar-section-title sidebar-menu-title" 
            style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '0.5rem' }}
          >
            Menu
          </p>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isRestricted = !hasModuleAccess(currentRole, item.id);
            return (
              <motion.div
                key={item.id}
                id={`sidebar-menu-item-${item.id}`}
                className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item-active' : ''}`}
                title={isCollapsed ? `${item.label}${isRestricted ? ' (Restricted)' : ''}` : undefined}
                whileHover={{ x: isCollapsed ? 0 : 5, scale: isCollapsed ? 1.08 : 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '0.875rem' : '0.875rem 1.25rem',
                  borderRadius: '14px',
                  backgroundColor: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  opacity: isRestricted ? (isActive ? 1 : 0.65) : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '1.25rem' }}>
                  <item.icon size={20} style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span className="sidebar-label" style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isRestricted && (
                      <Lock size={12} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.4))' }} />
                    )}
                    {item.badge > 0 && !isActive && (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* High-visibility pulse for unread messages */}
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            zIndex: 0
                          }}
                        />
                        <span style={{ 
                          position: 'relative',
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          minWidth: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 5px', 
                          borderRadius: '9px', 
                          boxShadow: '0 0 15px rgba(239,68,68,0.5)',
                          zIndex: 1
                        }}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      </div>
                    )}
                    {isActive && <motion.div layoutId="activeTab" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary-glow)' }} />}
                  </div>
                )}
                {isCollapsed && item.badge > 0 && !isActive && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.6)', border: '2px solid var(--bg-dark)' }}>
                    <motion.div
                      animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#ef4444' }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Portals Divider ── */}
        <div 
          id="sidebar-portals-divider"
          className="sidebar-portals-divider-container"
          style={{ margin: '1.5rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          {!isCollapsed && (
            <span 
              id="sidebar-portals-title"
              className="sidebar-portals-section-title"
              style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              Portals
            </span>
          )}
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {portalItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.id}
                id={`sidebar-portal-item-${item.id}`}
                className={`sidebar-portal-item ${isActive ? 'sidebar-portal-item-active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                whileHover={{ x: isCollapsed ? 0 : 5, scale: isCollapsed ? 1.08 : 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '0.875rem' : '0.75rem 1.25rem',
                  borderRadius: '14px',
                  backgroundColor: isActive ? `${item.color}12` : 'transparent',
                  color: isActive ? item.color : 'var(--text-muted)',
                  border: isActive ? `1px solid ${item.color}33` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '1.25rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px',
                    backgroundColor: isActive ? `${item.color}20` : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${isActive ? `${item.color}40` : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <item.icon size={15} color={isActive ? item.color : 'var(--text-dim)'} />
                  </div>
                  {!isCollapsed && (
                    <span className="sidebar-label" style={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <motion.div layoutId="activePortalTab"
                    style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {hasActionAccess(currentRole, 'create_ticket') && (
          <motion.button
            id="sidebar-button-new-ticket"
            className="sidebar-btn-new-ticket"
            title={isCollapsed ? 'New Ticket' : undefined}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateModalOpen(true)}
            style={{
              width: '100%',
              marginTop: '2.5rem',
              padding: isCollapsed ? '0.875rem' : '1.125rem',
              borderRadius: '14px',
              background: 'var(--grad-primary)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              boxShadow: '0 4px 15px var(--primary-glow)',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={20} />
            {!isCollapsed && <span>New Ticket</span>}
          </motion.button>
        )}

        {!isCollapsed && (
          <div className="sidebar-bottom-panel" style={{
            marginTop: '2rem',
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Collaborators Active</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(() => {
                const maxVisible = 5;
                const visibleUsers = users.slice(0, maxVisible);
                const remaining = users.length - maxVisible;

                return (
                  <>
                    <div style={{ display: 'flex', marginLeft: '4px' }}>
                      {visibleUsers.map((user, i) => (
                        <motion.div
                          key={user.id}
                          whileHover={{ y: -4, zIndex: 10 }}
                          style={{
                            marginLeft: i === 0 ? 0 : '-10px',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                        >
                          <CollaboratorAvatar user={user} />
                          <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: i === 0 ? 'var(--success)' : i === 1 ? 'var(--primary)' : '#f59e0b',
                            border: '2px solid #000'
                          }} />
                        </motion.div>
                      ))}
                    </div>
                    {remaining > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px', fontWeight: 600 }}>+{remaining} More</span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}


        {!isCollapsed && (
          <div className="sidebar-bottom-panel" style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Stats</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SLA Compliance</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>98.4%</span>
            </div>
          </div>
        )}
      </nav>

      <div style={{ 
        marginTop: 'auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative'
      }}>
        {/* Quick Settings Popover */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '1rem',
                backgroundColor: 'rgba(20, 20, 23, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '0.75rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 101,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div 
                onClick={() => { navigate('/profile'); setIsSettingsOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                className="hover-glass"
              >
                <Users size={16} color="var(--text-dim)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>View Profile</span>
              </div>
              {(() => {
                const isSettingsRestricted = !hasModuleAccess(currentRole, 'settings');
                return (
                  <div 
                    onClick={() => { navigate('/settings'); setIsSettingsOpen(false); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.75rem', 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      opacity: isSettingsRestricted ? 0.75 : 1
                    }}
                    className="hover-glass"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Settings size={16} color="var(--text-dim)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Preferences</span>
                    </div>
                    {isSettingsRestricted && (
                      <Lock size={12} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.3))' }} />
                    )}
                  </div>
                );
              })()}
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
              <div 
                onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', color: '#ef4444' }}
                className="hover-glass"
              >
                <LogOut size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sign Out</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Health Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '0.25rem 0.5rem', 
          fontSize: '0.65rem', 
          color: 'var(--success)', 
          fontWeight: 700, 
          letterSpacing: '0.5px' 
        }}>
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} 
          />
          SYSTEM OPERATIONAL
        </div>

        {/* User Identity Hub */}
        <motion.div 
          id="sidebar-user-hub"
          className="sidebar-user-identity-hub"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            borderRadius: '16px',
            cursor: 'pointer',
            backgroundColor: isSettingsOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: '1px solid',
            borderColor: isSettingsOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {user?.avatar && !avatarFailed ? (
              <img 
                src={user.avatar} 
                alt="" 
                onError={() => setAvatarFailed(true)}
                style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid var(--border)' }}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)',
                color: '#0a0a0c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.1rem',
                border: '1.5px solid var(--border)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                textTransform: 'uppercase',
                userSelect: 'none'
              }}>
                {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{user?.name || 'Guest'}</span>
              <span style={{ fontSize: '0.7rem', color: simulatedRole ? '#fbbf24' : 'var(--text-dim)', fontWeight: 600 }}>
                {simulatedRole ? `Simulated ${currentRole}` : currentRole}
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isSettingsOpen ? 180 : 0 }}
            style={{ color: 'var(--text-dim)' }}
          >
            <Settings size={18} />
          </motion.div>
        </motion.div>
      </div>
    </aside>

    {/* Dynamic Collapse/Expand Floating Trigger */}
    {!isOpen && onToggleCollapse && (
      <motion.button
        id="sidebar-toggle-collapse-btn"
        className="sidebar-toggle-btn"
        whileHover={{ scale: 1.1, backgroundColor: 'var(--primary)', color: '#000', borderColor: 'var(--primary)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleCollapse}
        style={{
          position: 'fixed',
          top: '38px',
          left: 'calc(var(--sidebar-width) - 14px)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#0a0a0c',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          zIndex: 105,
          transition: 'border-color 0.2s ease, left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, color 0.2s ease',
        }}
        title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
      >
        {isCollapsed ? (
          <span id="sidebar-toggle-arrow-right" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginLeft: '1px', lineHeight: 1 }}>⮞</span>
        ) : (
          <span id="sidebar-toggle-arrow-left" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginRight: '1px', lineHeight: 1 }}>⮜</span>
        )}
      </motion.button>
    )}
    </>
  );
};

export default Sidebar;

