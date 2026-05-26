import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bell, Mail, Smartphone, Moon, Shield, 
  MessageSquare, UserCheck, AlertTriangle, PhoneCall,
  Check, Info
} from 'lucide-react';
import { useNotificationStore, type NotificationSettings, type NotificationPreference } from '../store/useNotificationStore';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Toggle: React.FC<{ 
  active: boolean; 
  onChange: (val: boolean) => void;
  icon?: React.ReactNode;
  label: string;
}> = ({ active, onChange, icon, label }) => (
  <div 
    onClick={() => onChange(!active)}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '12px 16px',
      borderRadius: '12px',
      backgroundColor: active ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
      border: active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
    className="hover-glass"
  >
    <div style={{ 
      color: active ? 'var(--primary)' : 'var(--text-dim)',
      transition: 'color 0.2s'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? 'white' : 'var(--text-main)' }}>{label}</p>
    </div>
    <div style={{ 
      width: '36px', 
      height: '20px', 
      borderRadius: '10px', 
      backgroundColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
      position: 'relative',
      transition: 'background-color 0.2s'
    }}>
      <motion.div 
        animate={{ x: active ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ 
          width: '16px', 
          height: '16px', 
          borderRadius: '50%', 
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px'
        }} 
      />
    </div>
  </div>
);

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ marginBottom: '1.25rem' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{description}</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      {children}
    </div>
  </div>
);

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, toggleDND } = useNotificationStore();

  const categories: { key: keyof NotificationSettings; label: string; desc: string; icon: any }[] = [
    { key: 'mentions', label: 'Direct Mentions', desc: 'When someone @mentions you in a chat or ticket', icon: MessageSquare },
    { key: 'assignments', label: 'New Assignments', desc: 'When you are assigned as an owner or collaborator', icon: UserCheck },
    { key: 'comments', label: 'Comment Updates', desc: 'Activity on tickets you are following', icon: Shield },
    { key: 'calls', label: 'Voice & Video Calls', desc: 'Incoming call requests and meeting invites', icon: PhoneCall },
    { key: 'systemAlerts', label: 'System Announcements', desc: 'Security alerts and platform updates', icon: AlertTriangle }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '10vh',
              left: '50%',
              x: '-50%',
              width: 'min(900px, 95vw)',
              maxHeight: '80vh',
              backgroundColor: 'rgba(15, 15, 18, 0.98)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, rgba(245, 158, 11, 0.03), transparent)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
                  <Bell size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Notification Settings</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Configure how and when you receive updates</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '10px', 
                  cursor: 'pointer' 
                }}
                className="hover-glass"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
              
              {/* DND Toggle */}
              <div style={{ 
                marginBottom: '3rem', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                backgroundColor: settings.dndMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                border: settings.dndMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: settings.dndMode ? '#3b82f6' : 'var(--text-dim)' }}>
                    <Moon size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Do Not Disturb</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Silence all notifications temporarily</p>
                  </div>
                </div>
                <div 
                  onClick={toggleDND}
                  style={{ 
                    width: '56px', 
                    height: '30px', 
                    borderRadius: '15px', 
                    backgroundColor: settings.dndMode ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <motion.div 
                    animate={{ x: settings.dndMode ? 28 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px'
                    }} 
                  />
                </div>
              </div>

              {/* Granular Categories */}
              {categories.map((cat) => (
                <Section key={cat.key} title={cat.label} description={cat.desc}>
                  <Toggle 
                    label="In-App Toast" 
                    icon={<Bell size={18} />}
                    active={(settings[cat.key] as NotificationPreference).inApp} 
                    onChange={(v) => updateSetting(cat.key, 'inApp', v)} 
                  />
                  <Toggle 
                    label="Email Summary" 
                    icon={<Mail size={18} />}
                    active={(settings[cat.key] as NotificationPreference).email} 
                    onChange={(v) => updateSetting(cat.key, 'email', v)} 
                  />
                  <Toggle 
                    label="Push Notification" 
                    icon={<Smartphone size={18} />}
                    active={(settings[cat.key] as NotificationPreference).push} 
                    onChange={(v) => updateSetting(cat.key, 'push', v)} 
                  />
                </Section>
              ))}

              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(245, 158, 11, 0.05)', 
                border: '1px solid rgba(245, 158, 11, 0.1)',
                display: 'flex',
                gap: '12px'
              }}>
                <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                  Industry Best Practice: We recommend keeping <strong style={{ color: 'white' }}>In-App</strong> and <strong style={{ color: 'white' }}>Push</strong> notifications enabled for <strong style={{ color: 'white' }}>Direct Mentions</strong> to ensure real-time responsiveness.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '1.5rem 2rem', 
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert('Preferences saved successfully!');
                  onClose();
                }}
                className="btn-primary"
                style={{ padding: '0.75rem 2.5rem' }}
              >
                <Check size={18} /> Save Preferences
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSettingsModal;
