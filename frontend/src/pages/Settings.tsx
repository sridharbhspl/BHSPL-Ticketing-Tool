import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useRBACStore } from '../store/useRBACStore';
import { useTicketStore } from '../store/useTicketStore';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Globe,
  Save,
  Trash2,
  Lock,
  Smartphone,
  Mail,
  Monitor,
  Type,
  Activity
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';

const Settings: React.FC = () => {
  const { user, simulatedRole } = useAuthStore();
  const currentRole = simulatedRole || user?.role || 'Developer';
  const { permissions, updateModuleAccess, updateActionAccess, resetToDefaults } = useRBACStore();
  const { users, updateUser } = useTicketStore();

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleUpdateNotification, setRoleUpdateNotification] = useState<string | null>(null);
  const [activePopoverUserId, setActivePopoverUserId] = useState<string | null>(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  const allRoles = [
    'Admin',
    'Project Manager',
    'Developer',
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'Senior Developer',
    'Junior Developer',
    'Senior Tester',
    'Junior Tester',
    'QA Tester',
    'Client',
    'Viewer'
  ];

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);
  const [isConfirmingAccountDelete, setIsConfirmingAccountDelete] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    system: false
  });
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [fontScale, setFontScale] = useState(65);
  const [workspaceSettings, setWorkspaceSettings] = useState({
    maintenanceMode: false,
    apiAccess: true,
    domain: 'bavyaticketing'
  });
  const [selectedAccent, setSelectedAccent] = useState('#f59e0b');
  const [selectedBackground, setSelectedBackground] = useState('#0a0a0c');

  const accentColors = [
    { name: 'Veda Gold', value: '#f59e0b', hover: '#ea580c', glow: 'rgba(245, 158, 11, 0.4)', grad: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    { name: 'Ocean Blue', value: '#3b82f6', hover: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)', grad: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
    { name: 'Emerald Green', value: '#10b981', hover: '#059669', glow: 'rgba(16, 185, 129, 0.4)', grad: 'linear-gradient(135deg, #34d399, #10b981)' },
    { name: 'Royal Purple', value: '#8b5cf6', hover: '#7c3aed', glow: 'rgba(139, 92, 246, 0.4)', grad: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
    { name: 'Crimson Red', value: '#ef4444', hover: '#dc2626', glow: 'rgba(239, 68, 68, 0.4)', grad: 'linear-gradient(135deg, #f87171, #ef4444)' },
  ];

  const backgroundOptions = [
    { name: 'Midnight', value: '#0a0a0c', desc: 'Default system black' },
    { name: 'Slate', value: '#1e293b', desc: 'Professional blue-grey' },
    { name: 'Deep Navy', value: '#0f172a', desc: 'Corporate high-contrast' },
    { name: 'Charcoal', value: '#171717', desc: 'Balanced neutral dark' },
  ];

  useEffect(() => {
    const root = document.documentElement;
    const accent = accentColors.find(c => c.value === selectedAccent) || accentColors[0];
    
    root.style.setProperty('--primary', accent.value);
    root.style.setProperty('--primary-hover', accent.hover);
    root.style.setProperty('--primary-glow', accent.glow);
    root.style.setProperty('--grad-primary', accent.grad);
    root.style.setProperty('--bg-dark', selectedBackground);
    root.style.setProperty('--border-focus', `${accent.value}80`); // 50% opacity
  }, [selectedAccent, selectedBackground]);

  const Switch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px',
        height: '24px',
        backgroundColor: enabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: enabled ? '0 0 15px var(--primary-glow)' : 'none'
      }}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 4 }}
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );

  const sections = [
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  if (currentRole === 'Admin') {
    sections.push({ id: 'rbac', label: 'RBAC Control', icon: Shield });
  }

  const handleSave = () => {
    setIsConfirmingSave(true);
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    // Simulate complex persistence logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsConfirmingSave(false);
  };

  const handleAccountDelete = () => {
    setIsConfirmingAccountDelete(true);
  };

  const handleFinalAccountDelete = () => {
    // Perform actual deletion logic here
    console.log("Account deleted");
    setIsConfirmingAccountDelete(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Configuration</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Update your personal identity and public information.</p>
                </div>
                <Button variant="primary" leftIcon={<Save size={18} />} isLoading={isSaving} onClick={handleSave}>Save Changes</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Full Identity Name</label>
                    <input type="text" className="input-field" defaultValue="Alex Rivera" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Public Email</label>
                    <input type="email" className="input-field" defaultValue="alex@nebula.com" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Professional Bio</label>
                  <textarea 
                    className="input-field" 
                    style={{ minHeight: '100px', resize: 'none' }}
                    defaultValue="Senior Product Engineer at Bavya Ticketing Tool. Specializing in high-performance enterprise architectures."
                  />
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'workspace':
        return (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Brand Watermark */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                fontSize: '5rem',
                fontWeight: 900,
                color: 'white',
                opacity: 0.02,
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: '-0.05em',
                lineHeight: 1
              }}>
                BAVYA TICKETING TOOL
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Environment Control</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>Manage your workspace domain and regional protocols.</p>
                  </div>
                  <Button variant="primary" leftIcon={<Save size={18} />} isLoading={isSaving} onClick={handleSave}>Apply Protocol</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Workspace Domain</label>
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.65rem', fontWeight: 800 }}
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                        VERIFIED
                      </motion.div>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Globe size={18} style={{ position: 'absolute', left: '1.25rem', color: 'var(--text-dim)' }} />
                      <input 
                        type="text" 
                        className="input-field" 
                        value={workspaceSettings.domain} 
                        onChange={(e) => setWorkspaceSettings(prev => ({ ...prev, domain: e.target.value }))}
                        style={{ paddingLeft: '3rem', flex: 1 }} 
                      />
                      <div style={{ position: 'absolute', right: '1.25rem', color: 'var(--text-dim)', fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none' }}>.nebula.com</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary Language</label>
                      <div style={{ position: 'relative' }}>
                        <select className="input-field" style={{ backgroundColor: 'var(--bg-dark)', width: '100%', appearance: 'none', cursor: 'pointer' }}>
                          <option>English (United States)</option>
                          <option>Hindi (India)</option>
                          <option>Telugu (India)</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }}>
                          <Type size={16} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Zone</label>
                      <div style={{ position: 'relative' }}>
                        <select className="input-field" style={{ backgroundColor: 'var(--bg-dark)', width: '100%', appearance: 'none', cursor: 'pointer' }}>
                          <option>(GMT+05:30) India Standard Time</option>
                          <option>(GMT+00:00) UTC</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }}>
                          <Globe size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Operational Protocol</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: workspaceSettings.maintenanceMode ? 'var(--primary)' : 'var(--text-dim)' }}>
                          <Activity size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Maintenance Mode</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Restricts workspace access for scheduled maintenance.</p>
                        </div>
                      </div>
                      <Switch 
                        enabled={workspaceSettings.maintenanceMode} 
                        onChange={() => setWorkspaceSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} 
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: workspaceSettings.apiAccess ? 'var(--success)' : 'var(--text-dim)' }}>
                          <Monitor size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Developer API Access</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Enable external API integration and documentation access.</p>
                        </div>
                      </div>
                      <Switch 
                        enabled={workspaceSettings.apiAccess} 
                        onChange={() => setWorkspaceSettings(prev => ({ ...prev, apiAccess: !prev.apiAccess }))} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security Protocol</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Manage your authentication and security layers.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px' }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Two-Factor Authentication</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Add an extra layer of security via mobile authenticator.</p>
                    </div>
                  </div>
                  <div style={{ width: '44px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', right: '4px', top: '4px', width: '16px', height: '16px', backgroundColor: 'black', borderRadius: '50%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ padding: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Active Session Management</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Manage your signed-in devices and terminate access.</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="small">Manage</Button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '16px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444' }}>Terminate Workspace Identity</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Permanently delete your account and associated data.</p>
                  </div>
                  <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={handleAccountDelete}>Delete Account</Button>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Brand Watermark */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                fontSize: '5rem',
                fontWeight: 900,
                color: 'white',
                opacity: 0.02,
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: '-0.05em',
                lineHeight: 1
              }}>
                BAVYA TICKETING TOOL
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Communication Stream</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>Configure how you receive system alerts and updates.</p>
                  </div>
                  <Button variant="primary" leftIcon={<Save size={18} />} isLoading={isSaving} onClick={handleSave}>Sync Stream</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { id: 'email', icon: Mail, label: 'Email Notifications', desc: 'Critical alerts and daily project summaries.' },
                    { id: 'push', icon: Bell, label: 'Push Notifications', desc: 'Real-time updates on ticket status changes.' },
                    { id: 'system', icon: Activity, label: 'System Activity', desc: 'Alerts regarding workspace maintenance.' }
                  ].map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1.25rem 1.5rem', 
                        borderRadius: '20px', 
                        backgroundColor: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '14px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: notificationSettings[item.id as keyof typeof notificationSettings] ? 'var(--primary)' : 'var(--text-dim)',
                          transition: 'color 0.3s'
                        }}>
                          <item.icon size={22} />
                        </div>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{item.label}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.desc}</p>
                        </div>
                      </div>
                      <Switch 
                        enabled={notificationSettings[item.id as keyof typeof notificationSettings]} 
                        onChange={() => setNotificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notificationSettings] }))} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'appearance':
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <style>{`
                .custom-range {
                  -webkit-appearance: none;
                  width: 100%;
                  height: 4px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 2px;
                  outline: none;
                  cursor: pointer;
                }
                .custom-range::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  background: var(--primary);
                  border-radius: 50%;
                  cursor: pointer;
                  box-shadow: 0 0 10px var(--primary-glow);
                  transition: transform 0.2s;
                }
                .custom-range::-webkit-slider-thumb:hover {
                  transform: scale(1.15);
                }
              `}</style>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Visual Interface</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>Personalize the look and feel of your portal.</p>
                  </div>
                  <Button variant="primary" leftIcon={<Save size={18} />} isLoading={isSaving} onClick={handleSave}>Persist Look</Button>
                </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Theme Protocol</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <motion.div 
                      onClick={() => setSelectedTheme('dark')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        padding: '1.5rem 1rem', 
                        borderRadius: '20px', 
                        border: selectedTheme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                        backgroundColor: selectedTheme === 'dark' ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255,255,255,0.01)', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <Monitor size={22} style={{ color: selectedTheme === 'dark' ? 'var(--primary)' : 'var(--text-dim)' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: selectedTheme === 'dark' ? 'white' : 'var(--text-dim)' }}>DARK MODE</p>
                    </motion.div>

                    <motion.div 
                      onClick={() => setSelectedTheme('light')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        padding: '1.5rem 1rem', 
                        borderRadius: '20px', 
                        border: selectedTheme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                        backgroundColor: selectedTheme === 'light' ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255,255,255,0.01)', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <Eye size={22} style={{ color: selectedTheme === 'light' ? 'var(--primary)' : 'var(--text-dim)' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: selectedTheme === 'light' ? 'white' : 'var(--text-dim)' }}>LIGHT MODE</p>
                    </motion.div>

                    <motion.div 
                      onClick={() => setSelectedTheme('system')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        padding: '1.5rem 1rem', 
                        borderRadius: '20px', 
                        border: selectedTheme === 'system' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                        backgroundColor: selectedTheme === 'system' ? 'rgba(245, 158, 11, 0.03)' : 'rgba(255,255,255,0.01)', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <Smartphone size={22} style={{ color: selectedTheme === 'system' ? 'var(--primary)' : 'var(--text-dim)' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: selectedTheme === 'system' ? 'white' : 'var(--text-dim)' }}>SYSTEM</p>
                    </motion.div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', fontStyle: 'italic' }}>
                    {selectedTheme === 'system' ? "Synchronizing interface with your operating system preferences." : "Personalize your visual environment."}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Font Scalability</label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem', 
                    padding: '1.5rem', 
                    borderRadius: '20px', 
                    border: '1px solid var(--border)',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>T</span>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        height: '4px',
                        width: `${fontScale}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px',
                        pointerEvents: 'none'
                      }} />
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        value={fontScale}
                        onChange={(e) => setFontScale(parseInt(e.target.value))}
                        className="custom-range" 
                      />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>T</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '1.5rem' }}>Accent Protocol</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {accentColors.map((color) => (
                      <motion.div
                        key={color.value}
                        onClick={() => setSelectedAccent(color.value)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: color.value,
                          cursor: 'pointer',
                          position: 'relative',
                          boxShadow: selectedAccent === color.value ? `0 0 20px ${color.glow}` : 'none',
                          border: selectedAccent === color.value ? '2px solid white' : '1px solid var(--border)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>
                    {accentColors.find(c => c.value === selectedAccent)?.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>— Brand configuration</span>
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '1.5rem' }}>Environment Protocol</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {backgroundOptions.map((bg) => (
                      <motion.div
                        key={bg.value}
                        onClick={() => setSelectedBackground(bg.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          flex: 1,
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: bg.value,
                          cursor: 'pointer',
                          border: selectedBackground === bg.value ? '2px solid var(--primary)' : '1px solid var(--border)',
                          boxShadow: selectedBackground === bg.value ? '0 0 15px var(--primary-glow)' : 'none',
                          transition: 'all 0.3s'
                        }}
                        title={bg.name}
                      />
                    ))}
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>
                    {backgroundOptions.find(b => b.value === selectedBackground)?.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>— {backgroundOptions.find(b => b.value === selectedBackground)?.desc}</span>
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case 'rbac':
        return (
          <motion.div
            key="rbac"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <section className="glass" style={{ 
              padding: '2.5rem', 
              borderRadius: '32px', 
              border: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Brand Watermark */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                fontSize: '5rem',
                fontWeight: 900,
                color: 'white',
                opacity: 0.02,
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: '-0.05em',
                lineHeight: 1
              }}>
                BAVYA RBAC
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>RBAC Control Terminal</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>Manage live page authorization and action controls globally.</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="small" 
                    onClick={() => {
                      if (window.confirm("Reset all permission matrices to default factory states?")) {
                        resetToDefaults();
                      }
                    }}
                  >
                    Reset Defaults
                  </Button>
                </div>

                {/* Modules Grid Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Module Authorization Matrix
                  </h4>
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '1.25rem' }}>Role Tier</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Dashboard</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Tickets</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Kanban</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Projects</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Team</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Chat</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Settings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(permissions).map((role) => (
                          <tr key={role} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }} className="hover-glass-row">
                            <td style={{ padding: '1.25rem', fontWeight: 700 }}>{role}</td>
                            {(['dashboard', 'tickets', 'board', 'projects', 'team', 'chat', 'settings'] as const).map((mod) => (
                              <td key={mod} style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <Switch 
                                    enabled={permissions[role]?.modules[mod] ?? false}
                                    onChange={() => updateModuleAccess(role, mod, !(permissions[role]?.modules[mod] ?? false))}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions Grid Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Action & Button Authorization Matrix
                  </h4>
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '1.25rem' }}>Role Tier</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Create Ticket</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Edit Ticket</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Delete Ticket</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>View Ticket</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Add Team Member</th>
                          <th style={{ padding: '1.25rem', textAlign: 'center' }}>Clearance Simulator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(permissions).map((role) => (
                          <tr key={role} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '1.25rem', fontWeight: 700 }}>{role}</td>
                            {(['create_ticket', 'edit_ticket', 'delete_ticket', 'view_ticket', 'add_member', 'simulate_clearance'] as const).map((act) => (
                              <td key={act} style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <Switch 
                                    enabled={permissions[role]?.actions[act] ?? false}
                                    onChange={() => updateActionAccess(role, act as any, !(permissions[role]?.actions[act] ?? false))}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Directory & Role Assignment Console */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>
                      User Directory & Live Role Assignment
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Search registered team accounts and change their security clearances dynamically in the database.
                    </p>
                  </div>

                  {/* Search Bar & Toast Alert */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <input 
                      type="text"
                      placeholder="Search accounts by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="input-field"
                      style={{ maxWidth: '400px', flex: 1, fontSize: '0.85rem' }}
                    />
                    <AnimatePresence>
                      {roleUpdateNotification && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: 'var(--success)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          ✓ {roleUpdateNotification}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Directory Table */}
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '1.1rem 1.25rem' }}>Team Member</th>
                          <th style={{ padding: '1.1rem 1.25rem' }}>Email Address</th>
                          <th style={{ padding: '1.1rem 1.25rem' }}>Clearance / Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                              No users match the search parameters.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img 
                                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`} 
                                    alt="" 
                                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                                  />
                                  <span style={{ fontWeight: 700 }}>{u.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.25rem', color: 'var(--text-dim)' }}>
                                {u.email}
                              </td>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                {(() => {
                                  const userRoles = u.role ? u.role.split(',').map(r => r.trim()) : [];
                                  return (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                      <button 
                                        onClick={() => {
                                          if (activePopoverUserId === u.id) {
                                            setActivePopoverUserId(null);
                                          } else {
                                            setActivePopoverUserId(u.id);
                                            setRoleSearchQuery('');
                                          }
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '0.5rem 1rem',
                                          backgroundColor: 'rgba(255,255,255,0.02)',
                                          border: '1px solid var(--border)',
                                          borderRadius: '10px',
                                          color: 'white',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          minWidth: '220px',
                                          justifyContent: 'space-between',
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                                          {userRoles.length === 0 ? (
                                            <span style={{ color: 'var(--text-dim)' }}>Assign Roles...</span>
                                          ) : (
                                            userRoles.map((r) => (
                                              <span 
                                                key={r} 
                                                style={{ 
                                                  fontSize: '0.625rem', 
                                                  fontWeight: 800, 
                                                  backgroundColor: r === 'Admin' ? 'rgba(239, 68, 68, 0.15)' : r === 'Viewer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                  color: r === 'Admin' ? '#ef4444' : r === 'Viewer' ? 'var(--success)' : 'var(--primary)',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  border: `1px solid ${r === 'Admin' ? 'rgba(239, 68, 68, 0.3)' : r === 'Viewer' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                                }}
                                              >
                                                {r}
                                              </span>
                                            ))
                                          )}
                                        </div>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>▼</span>
                                      </button>

                                      {activePopoverUserId === u.id && (
                                        <>
                                          <div 
                                            onClick={() => setActivePopoverUserId(null)} 
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                                          />
                                          <div 
                                            style={{
                                              position: 'absolute',
                                              top: '110%',
                                              right: 0,
                                              backgroundColor: '#0c0c0f',
                                              border: '1px solid var(--border)',
                                              borderRadius: '14px',
                                              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                                              padding: '10px',
                                              zIndex: 1000,
                                              minWidth: '240px',
                                              maxHeight: '320px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '4px'
                                            }}
                                          >
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                                              Active Clearance Roles
                                            </div>
                                            
                                            {/* Search Input Box */}
                                            <div style={{ position: 'relative', marginBottom: '8px', padding: '0 4px' }}>
                                              <input 
                                                type="text"
                                                placeholder="Filter roles..."
                                                value={roleSearchQuery}
                                                onChange={(e) => setRoleSearchQuery(e.target.value)}
                                                style={{
                                                  width: '100%',
                                                  backgroundColor: 'rgba(255,255,255,0.04)',
                                                  border: '1px solid rgba(255,255,255,0.08)',
                                                  borderRadius: '8px',
                                                  padding: '6px 10px',
                                                  color: 'white',
                                                  fontSize: '0.75rem',
                                                  outline: 'none',
                                                  transition: 'all 0.2s'
                                                }}
                                              />
                                            </div>

                                            {/* Scrollable Checkbox List */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', padding: '0 4px' }}>
                                              {(() => {
                                                const filteredRoles = allRoles.filter(r => r.toLowerCase().includes(roleSearchQuery.toLowerCase()));
                                                if (filteredRoles.length === 0) {
                                                  return (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                                                      No matching roles found.
                                                    </div>
                                                  );
                                                }
                                                return filteredRoles.map((r) => {
                                                  const isSelected = userRoles.includes(r);
                                                  return (
                                                    <label 
                                                      key={r}
                                                      style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '6px 8px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: isSelected ? 'white' : 'var(--text-dim)',
                                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                                                        transition: 'all 0.15s'
                                                      }}
                                                    >
                                                      <input 
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={async () => {
                                                          let updatedRoles;
                                                          if (isSelected) {
                                                            updatedRoles = userRoles.filter(x => x !== r);
                                                          } else {
                                                            updatedRoles = [...userRoles, r];
                                                          }
                                                          if (updatedRoles.length === 0) {
                                                            updatedRoles = ['Developer'];
                                                          }
                                                          const joined = updatedRoles.join(',');
                                                          try {
                                                            await updateUser(u.id, { role: joined });
                                                            setRoleUpdateNotification(`Updated clearance roles for ${u.name}!`);
                                                            setTimeout(() => setRoleUpdateNotification(null), 3000);
                                                          } catch (err: any) {
                                                            setRoleUpdateNotification(`Error: ${err.message}`);
                                                            setTimeout(() => setRoleUpdateNotification(null), 5000);
                                                          }
                                                        }}
                                                        style={{
                                                          accentColor: 'var(--primary)',
                                                          cursor: 'pointer',
                                                          width: '14px',
                                                          height: '14px'
                                                        }}
                                                      />
                                                      {r}
                                                    </label>
                                                  );
                                                });
                                              })()}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </section>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <Breadcrumbs />
      
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>System Terminal</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>High-level configuration and environment management.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
        {/* Navigation Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sections.map(section => (
            <motion.div
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: activeTab === section.id ? 'white' : 'var(--text-dim)',
                backgroundColor: activeTab === section.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: activeTab === section.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                fontWeight: activeTab === section.id ? 700 : 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <section.icon size={20} />
              <span style={{ fontSize: '0.9375rem' }}>{section.label}</span>
              {activeTab === section.id && (
                <motion.div 
                  layoutId="active-indicator"
                  style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} 
                />
              )}
            </motion.div>
          ))}
        </aside>

        {/* Content Area */}
        <div style={{ minHeight: '600px' }}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmingSave}
        onClose={() => setIsConfirmingSave(false)}
        onConfirm={handleFinalSave}
        title="Confirm System Update"
        message="Are you sure you want to apply these system configuration changes? This will update your profile across all connected devices."
        confirmText="Confirm & Apply"
        type="primary"
      />

      <ConfirmationModal
        isOpen={isConfirmingAccountDelete}
        onClose={() => setIsConfirmingAccountDelete(false)}
        onConfirm={handleFinalAccountDelete}
        title="Destroy Identity Forever?"
        message="This is a destructive action. You will lose all access to your tickets, projects, and collaboration history. This cannot be undone."
        confirmText="Terminate Account"
        type="danger"
      />
    </div>
  );
};

export default Settings;
