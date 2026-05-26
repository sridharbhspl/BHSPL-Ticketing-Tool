import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MessageSquare,
  Layers,
  X
} from 'lucide-react';
import { useNotificationStore, type AppNotification } from '../store/useNotificationStore';


const ToastAvatar = ({ avatar, name }: { avatar?: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  
  useEffect(() => {
    setFailed(false);
  }, [avatar]);

  return avatar && !failed ? (
    <img 
      src={avatar} 
      onError={() => setFailed(true)}
      style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} 
      alt="" 
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
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
      textTransform: 'uppercase',
      userSelect: 'none'
    }}>
      {name ? name.trim().charAt(0).toUpperCase() : 'U'}
    </div>
  );
};


const NotificationToast: React.FC = () => {
  const { notifications } = useNotificationStore();
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  
  // Track IDs of notifications that have already been toasted/notified
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(() => {
    // On initial mount, treat all existing notifications as already notified
    // so we don't spam the user with old notifications on page load/refresh.
    return new Set(useNotificationStore.getState().notifications.map(n => n.id));
  });

  useEffect(() => {
    // Find unread notifications that haven't been shown as a toast yet
    const newUnread = notifications.filter(n => !n.isRead && !notifiedIds.has(n.id));

    if (newUnread.length > 0) {
      // Add new notifications to the active toasts display
      setActiveToasts(prev => {
        // Prepend and limit to maximum 3 active toasts at a time
        const combined = [...newUnread, ...prev];
        return combined.slice(0, 3);
      });

      // Mark these IDs as notified so we don't show them again
      setNotifiedIds(prev => {
        const next = new Set(prev);
        newUnread.forEach(n => next.add(n.id));
        return next;
      });
    }
  }, [notifications, notifiedIds]);

  // Handle individual toast auto-dismissal
  useEffect(() => {
    if (activeToasts.length > 0) {
      const timer = setTimeout(() => {
        // Dismiss the oldest active toast (last one in the array)
        setActiveToasts(prev => prev.slice(0, -1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToasts]);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'CREATE': return <Layers size={18} color="var(--success)" />;
      case 'UPDATE': return <AlertCircle size={18} color="var(--info)" />;
      case 'STATUS': return <Clock size={18} color="var(--primary)" />;
      case 'WORKLOG': return <MessageSquare size={18} color="#a855f7" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '24px', 
      right: '24px', 
      zIndex: 9999, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {activeToasts.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            style={{ 
              pointerEvents: 'auto',
              minWidth: '340px',
              maxWidth: '400px'
            }}
          >
            <div className="glass" style={{
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(20, 20, 24, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <ToastAvatar avatar={notif.actorAvatar} name={notif.actorName} />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-4px', 
                    right: '-4px', 
                    backgroundColor: 'rgba(10, 10, 12, 0.9)', 
                    borderRadius: '50%', 
                    padding: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{notif.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>Just Now</span>
                      <button 
                        onClick={() => {
                          setActiveToasts(prev => prev.filter(t => t.id !== notif.id));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 800, color: 'white' }}>{notif.actorName}</span> {notif.message}
                  </p>
                </div>
              </div>

              {/* Automated Briefing Feedback */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: '8px', 
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderLeft: '3px solid var(--primary)'
                }}
              >
                <Mail size={14} color="var(--primary)" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>EMAIL SENT:</span>
                  <span style={{ fontSize: '0.7rem', color: 'white', opacity: 0.8 }}>Project & Team scopes updated.</span>
                </div>
                <CheckCircle2 size={14} color="var(--success)" style={{ marginLeft: 'auto' }} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
