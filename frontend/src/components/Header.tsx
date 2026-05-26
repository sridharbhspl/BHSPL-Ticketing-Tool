import React from 'react';
import { Search, Bell, ChevronDown, Menu, User, Shield, LogOut, Settings, MessageSquare, AlertCircle, Clock, CheckCircle2, Layers } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/useAuthStore';
import { useTicketStore } from '../store/useTicketStore';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationSettingsModal from './NotificationSettingsModal';
import { useRBACStore } from '../store/useRBACStore';

import type { ResponsiveState } from '../hooks/useResponsive';

interface HeaderProps {
  onMenuClick?: () => void;
  responsive?: ResponsiveState;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, responsive }) => {
  const { logout, user, simulatedRole, setSimulatedRole } = useAuthStore();
  const { hasActionAccess } = useRBACStore();
  const currentRole = simulatedRole || user?.role || 'Developer';
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = React.useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = React.useState<'all' | 'unread'>('all');
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

  const { tickets, projects, users, setSelectedTicketId } = useTicketStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { tickets: [], projects: [], users: [] };
    const q = searchQuery.trim().toLowerCase();
    return {
      tickets: tickets.filter(t => {
        if (!t) return false;
        const title = String(t.title || '').toLowerCase();
        const id = String(t.id || '').toLowerCase();
        return title.includes(q) || id.includes(q);
      }).slice(0, 3),
      projects: projects.filter(p => {
        if (!p) return false;
        const name = String(p.name || '').toLowerCase();
        return name.includes(q);
      }).slice(0, 2),
      users: users.filter(u => {
        if (!u) return false;
        const name = String(u.name || '').toLowerCase();
        const role = String(u.role || '').toLowerCase();
        return name.includes(q) || role.includes(q);
      }).slice(0, 2)
    };
  }, [searchQuery, tickets, projects, users]);

  const filteredNotifications = [...notifications]
    .filter(n => activeNotificationTab === 'all' || !n.isRead)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="main-header" style={{
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(10, 10, 12, 0.8)',
      backdropFilter: 'blur(12px)',
      zIndex: 90,
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
        {(responsive?.isMobile) && (
          <button
            onClick={onMenuClick}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              padding: '8px',
              borderRadius: '10px',
              color: 'white',
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, minWidth: '80px', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{getPageTitle()}</h2>
        {!responsive?.isMobile && (
          <div style={{ position: 'relative', width: responsive?.isTablet ? '220px' : '380px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 1 }}
            />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3.25rem',
              backgroundColor: isSearchFocused ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
              border: isSearchFocused ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '14px',
              color: 'white',
              outline: 'none',
              fontSize: '0.9rem',
              transition: 'all 0.3s',
              boxShadow: isSearchFocused ? '0 0 0 4px rgba(245, 158, 11, 0.1)' : 'none'
            }}
            className="search-input"
          />

          {/* Global Search Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '100%',
                  backgroundColor: 'rgba(15, 15, 18, 0.98)',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  zIndex: 100,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                {searchResults.tickets.length === 0 && searchResults.projects.length === 0 && searchResults.users.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <Search size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.85rem' }}>No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem' }}>
                    {searchResults.tickets.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tickets</div>
                        {searchResults.tickets.map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => { setSelectedTicketId(t.id); navigate('/'); setSearchQuery(''); }}
                            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '10px' }}
                            className="hover-glass"
                          >
                            <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}>
                              <AlertCircle size={16} />
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>{t.id}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.projects.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</div>
                        {searchResults.projects.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { navigate('/dashboard'); setSearchQuery(''); }}
                            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '10px' }}
                            className="hover-glass"
                          >
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: p.color }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.users.length > 0 && (
                      <div>
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team</div>
                        {searchResults.users.map(u => (
                          <div 
                            key={u.id} 
                            onClick={() => { navigate('/team'); setSearchQuery(''); }}
                            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '10px' }}
                            className="hover-glass"
                          >
                            <img src={u.avatar} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{u.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (isProfileOpen) setIsProfileOpen(false);
            }}
            style={{ 
              position: 'relative',
              padding: '0.625rem',
              borderRadius: '12px',
              backgroundColor: isNotificationsOpen ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: isNotificationsOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
              cursor: 'pointer',
              color: isNotificationsOpen ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
              boxShadow: isNotificationsOpen ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'none'
            }} className="glow-on-hover">
            <Bell size={20} />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  backgroundColor: 'var(--primary)',
                  color: '#000',
                  borderRadius: '9px',
                  border: '2px solid var(--bg-dark)',
                  boxShadow: '0 0 10px var(--primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  zIndex: 2
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '380px',
                  backgroundColor: 'rgba(15, 15, 18, 0.98)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} 
                    className="hover-glass"
                  >
                    <CheckCircle2 size={14} /> Mark all read
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.25rem' }}>
                  <button 
                    onClick={() => setActiveNotificationTab('all')}
                    style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', color: activeNotificationTab === 'all' ? 'white' : 'var(--text-dim)', borderBottom: activeNotificationTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveNotificationTab('unread')}
                    style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', color: activeNotificationTab === 'unread' ? 'white' : 'var(--text-dim)', borderBottom: activeNotificationTab === 'unread' ? '2px solid var(--primary)' : '2px solid transparent', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Unread
                  </button>
                </div>

                {/* List */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={async () => {
                          if (notif.targetId) {
                            setSelectedTicketId(notif.targetId);
                            navigate('/tickets');
                          }
                          if (!notif.isRead) {
                            await markAsRead(notif.id);
                          }
                          setIsNotificationsOpen(false);
                        }}
                        style={{ 
                          padding: '1rem 1.25rem', 
                          borderBottom: '1px solid var(--border)', 
                          display: 'flex', 
                          gap: '1rem', 
                          backgroundColor: !notif.isRead ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        className="hover-glass"
                      >
                        <div style={{ position: 'relative' }}>
                          <img src={notif.actorAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0f0f12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {notif.type === 'STATUS' && <Clock size={12} color="var(--primary)" />}
                            {notif.type === 'CREATE' && <Layers size={12} color="var(--success)" />}
                            {notif.type === 'WORKLOG' && <MessageSquare size={12} color="#a855f7" />}
                            {notif.type === 'UPDATE' && <AlertCircle size={12} color="var(--info)" />}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: 700, color: 'white' }}>{notif.actorName}</span> {notif.message}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: 'var(--text-dim)' }}>
                            <Clock size={12} />
                            <span style={{ fontSize: '0.75rem' }}>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>All caught up!</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Check back later for new notifications.</p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <button 
                    onClick={() => {
                      setIsNotificationSettingsOpen(true);
                      setIsNotificationsOpen(false);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }} 
                    className="hover-glass"
                  >
                    View Notification Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--border)' }} />

        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              if (isNotificationsOpen) setIsNotificationsOpen(false);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.875rem', 
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              backgroundColor: isProfileOpen ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              border: isProfileOpen ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s'
            }} 
            className="hover:border-white/10 hover:bg-white/5"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.avatar && !avatarFailed ? (
                <img 
                  src={user.avatar} 
                  alt="" 
                  onError={() => setAvatarFailed(true)}
                  style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
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
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                  textTransform: 'uppercase',
                  userSelect: 'none'
                }}>
                  {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ 
                position: 'absolute', 
                bottom: '-2px', 
                right: '-2px', 
                width: '12px', 
                height: '12px', 
                backgroundColor: 'var(--success)', 
                borderRadius: '50%', 
                border: '2px solid var(--bg-dark)' 
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="desktop-only">
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{user?.name}</p>
              <p style={{ fontSize: '0.75rem', color: simulatedRole ? '#fbbf24' : 'var(--text-dim)', fontWeight: 500 }}>
                {simulatedRole ? `Simulated ${simulatedRole}` : user?.role}
              </p>
            </div>
            <ChevronDown size={16} color="var(--text-dim)" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '0.75rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  zIndex: 1000
                }}
                className="glass"
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}>{user?.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{user?.email}</p>
                </div>
                
                {[
                  { icon: User, label: 'Profile View', detail: 'View personal stats', path: '/profile' },
                  { icon: Settings, label: 'Account Settings', detail: 'Security & Profile', path: '/settings' },
                  { icon: Shield, label: 'Workspace Preferences', detail: 'UI & Notifications', path: '/settings' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    onClick={() => {
                      if (item.label === 'Workspace Preferences') {
                        setIsNotificationSettingsOpen(true);
                      } else {
                        navigate(item.path);
                      }
                      setIsProfileOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ color: 'var(--text-dim)' }}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'white' }}>{item.label}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{item.detail}</p>
                    </div>
                  </motion.div>
                ))}

                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
                
                {hasActionAccess(currentRole, 'simulate_clearance') && (
                  <>
                    {/* Clearance Simulator Selection */}
                    <div style={{ padding: '0.5rem 0.75rem' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 700 }}>
                        Clearance Simulator
                      </p>
                      <select
                        value={simulatedRole || user?.role || 'Developer'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSimulatedRole(val === user?.role ? null : val);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: '#fbbf24',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="QA Tester">QA Tester</option>
                        <option value="Client">Client</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
                  </>
                )}
                
                <motion.div
                  onClick={logout}
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', x: 4 }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#ef4444'
                  }}
                >
                  <LogOut size={18} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Sign Out</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <NotificationSettingsModal 
        isOpen={isNotificationSettingsOpen} 
        onClose={() => setIsNotificationSettingsOpen(false)} 
      />
    </header>
  );
};

export default Header;
