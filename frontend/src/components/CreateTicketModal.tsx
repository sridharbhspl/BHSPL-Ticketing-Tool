import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import type { TicketPriority, TicketType, Ticket } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  AlertCircle, 
  User, 
  AlignLeft, 
  Heading, 
  ChevronDown,
  Monitor,
  Globe,
  Settings,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mail,
  HardDrive,
  Calendar
} from 'lucide-react';
import ConfirmationModal from './common/ConfirmationModal';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { projects, users, addTicket } = useTicketStore();
  const { user: currentUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Incident' as TicketType,
    category: 'Technical',
    subcategory: '',
    service: projects[0]?.name || 'Nebula Portal',
    impact: 'Medium' as 'Low' | 'Medium' | 'High',
    usersAffected: 1,
    priority: 'Medium' as TicketPriority,
    environment: 'Prod' as 'Prod' | 'UAT' | 'Test' | 'Dev',
    projectId: projects[0]?.id || '',
    assigneeId: '',
    assignedTeam: 'Support Engineering',
    requesterName: currentUser?.name || '',
    requesterEmail: currentUser?.email || '',
    requesterPhone: '',
    attachments: [] as string[],
    status: 'Open' as const,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Auto-capture technical info
  const [technicalInfo, setTechnicalInfo] = useState({
    browser: '',
    os: '',
    device: 'Desktop'
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS")) os = "iOS";

    setTechnicalInfo({
      browser,
      os,
      device: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop'
    });
  }, []);

  // Priority Matrix Logic
  useEffect(() => {
    let calculatedPriority: TicketPriority = 'Medium';
    if (formData.impact === 'High') {
      calculatedPriority = formData.usersAffected > 10 ? 'Urgent' : 'High';
    } else if (formData.impact === 'Low') {
      calculatedPriority = 'Low';
    }
    setFormData(prev => ({ ...prev, priority: calculatedPriority }));
  }, [formData.impact, formData.usersAffected]);

  // Synchronize active project from URL and reset fields when modal opens
  useEffect(() => {
    if (isOpen && projects.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlProjectId = urlParams.get('projectId');
      const activeProject = projects.find(p => p.id === urlProjectId) || projects[0];
      
      setFormData(prev => ({
        ...prev,
        projectId: activeProject.id,
        service: activeProject.name,
        title: '',
        description: '',
        subcategory: '',
        assigneeId: '',
        requesterName: currentUser?.name || '',
        requesterEmail: currentUser?.email || '',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
      setStep(1);
    }
  }, [isOpen, projects, currentUser]);

  const categories: Record<string, string[]> = {
    'Technical': ['API Error', 'Database', 'Integration', 'System Crash', 'UI/UX'],
    'Access': ['Password Reset', 'New Account', 'Permissions', 'SSO Issue'],
    'Billing': ['Invoice', 'Payment Failure', 'Refund', 'Subscription'],
    'Other': ['Feedback', 'Feature Request', 'General Inquiry']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsConfirming(true);
    }
  };

  const handleFinalConfirm = () => {
    const newTicket: Ticket = {
      ...formData,
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      reporterId: currentUser?.id || 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      slaDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: [formData.type, formData.category],
      technicalInfo,
    } as Ticket;

    addTicket(newTicket);
    onClose();
    setStep(1);
    setIsConfirming(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 12px 12px 42px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    appearance: 'none'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    marginLeft: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-dim)',
    pointerEvents: 'none'
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Subject / Summary</label>
              <div style={{ position: 'relative' }}>
                <Heading size={18} style={iconStyle} />
                <input required type="text" placeholder="Short issue summary..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} className="search-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Ticket Type</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={iconStyle} />
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })} style={inputStyle} className="search-input">
                    <option value="Incident" style={{ background: '#1a1a1e' }}>Incident</option>
                    <option value="Bug" style={{ background: '#1a1a1e' }}>Bug</option>
                    <option value="Task" style={{ background: '#1a1a1e' }}>Task</option>
                    <option value="Improvement" style={{ background: '#1a1a1e' }}>Improvement</option>
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Project</label>
                <div style={{ position: 'relative' }}>
                  <Layers size={18} style={iconStyle} />
                  <select 
                    value={formData.projectId} 
                    onChange={(e) => {
                      const selectedProj = projects.find(p => p.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        projectId: e.target.value,
                        service: selectedProj ? selectedProj.name : ''
                      });
                    }} 
                    style={inputStyle} 
                    className="search-input"
                  >
                    {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1e' }}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={iconStyle} />
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })} style={inputStyle} className="search-input">
                    {Object.keys(categories).map(cat => <option key={cat} value={cat} style={{ background: '#1a1a1e' }}>{cat}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Subcategory</label>
                <div style={{ position: 'relative' }}>
                  <Settings size={18} style={iconStyle} />
                  <select required value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} style={inputStyle} className="search-input">
                    <option value="" style={{ background: '#1a1a1e' }}>Select subcategory...</option>
                    {categories[formData.category].map(sub => <option key={sub} value={sub} style={{ background: '#1a1a1e' }}>{sub}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Impact Level</label>
                <div style={{ position: 'relative' }}>
                  <AlertCircle size={18} style={iconStyle} />
                  <select value={formData.impact} onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })} style={inputStyle} className="search-input">
                    <option value="Low" style={{ background: '#1a1a1e' }}>Low - Minor</option>
                    <option value="Medium" style={{ background: '#1a1a1e' }}>Medium - Partial</option>
                    <option value="High" style={{ background: '#1a1a1e' }}>High - Critical</option>
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Users Affected</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <input type="number" min="1" value={formData.usersAffected} onChange={(e) => setFormData({ ...formData, usersAffected: parseInt(e.target.value) })} style={inputStyle} className="search-input" />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Calculated Priority</label>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: formData.priority === 'Urgent' ? '#ef4444' : formData.priority === 'High' ? '#f59e0b' : '#3b82f6',
                  boxShadow: `0 0 10px ${formData.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`
                }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formData.priority.toUpperCase()}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Auto-calculated based on Impact/Users)</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Environment</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['Prod', 'UAT', 'Test', 'Dev'].map(env => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setFormData({ ...formData, environment: env as any })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: formData.environment === env ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.environment === env ? 'var(--primary)' : 'var(--border)'}`,
                      color: formData.environment === env ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Requester</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <input readOnly value={formData.requesterName} style={{ ...inputStyle, color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={iconStyle} />
                  <input readOnly value={formData.requesterEmail} style={{ ...inputStyle, color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <textarea required placeholder="Detailed explanation of the issue..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, minHeight: '100px', paddingTop: '12px', resize: 'none' }} className="search-input" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Technical Fingerprint (Auto-captured)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="glass" style={{ padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem' }}>
                  <Globe size={14} style={{ marginBottom: '4px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>Browser</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{technicalInfo.browser}</div>
                </div>
                <div className="glass" style={{ padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem' }}>
                  <Monitor size={14} style={{ marginBottom: '4px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>OS</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{technicalInfo.os}</div>
                </div>
                <div className="glass" style={{ padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem' }}>
                  <HardDrive size={14} style={{ marginBottom: '4px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>Device</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{technicalInfo.device}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Assigned Team</label>
                <div style={{ position: 'relative' }}>
                  <Layers size={18} style={iconStyle} />
                  <select value={formData.assignedTeam} onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })} style={inputStyle} className="search-input">
                    <option value="Support Engineering" style={{ background: '#1a1a1e' }}>Support Engineering</option>
                    <option value="Platform Engineering" style={{ background: '#1a1a1e' }}>Platform Engineering</option>
                    <option value="UI/UX Core" style={{ background: '#1a1a1e' }}>UI/UX Core</option>
                    <option value="Database Ops" style={{ background: '#1a1a1e' }}>Database Ops</option>
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Engineer (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} style={inputStyle} className="search-input">
                    <option value="" style={{ background: '#1a1a1e' }}>Auto-assign</option>
                    {users.map(u => <option key={u.id} value={u.id} style={{ background: '#1a1a1e' }}>{u.name}</option>)}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Target Due Date (Optional Override)</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={iconStyle} />
                <input 
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch (err) {} }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  className="search-input"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>SLA Forecast</label>
              <div style={{ 
                padding: '16px', 
                borderRadius: '14px', 
                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                border: '1px dashed var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Clock size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>Predicted Resolution: 24 Hours</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Due Date: {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Ready for Submission</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>All required audit and classification data has been validated.</p>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Ticket Intake">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '10px', right: '10px', height: '2px', background: 'var(--border)', zIndex: 0 }} />
          <motion.div style={{ position: 'absolute', top: '15px', left: '10px', width: `${((step - 1) / (totalSteps - 1)) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1 }} />
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <motion.div 
                animate={{ 
                  backgroundColor: step >= s ? 'var(--primary)' : '#1a1a1e',
                  borderColor: step >= s ? 'var(--primary)' : 'var(--border)',
                  scale: step === s ? 1.2 : 1
                }}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => s < step && setStep(s)}
              >
                {step > s ? <CheckCircle2 size={16} color="#000" /> : <span style={{ fontSize: '0.8rem', fontWeight: 700, color: step >= s ? '#000' : 'var(--text-dim)' }}>{s}</span>}
              </motion.div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            {step > 1 && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep(step - 1)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ChevronLeft size={18} /> Back
              </motion.button>
            )}
            
            {step < totalSteps ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep(step + 1)}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'var(--grad-primary)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Next Step <ChevronRight size={18} />
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'var(--grad-primary)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={18} /> Submit Ticket
              </motion.button>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleFinalConfirm}
        title="Confirm Ticket Submission"
        message="Are you sure you want to submit this ticket? This will initiate the SLA clock and assign it to the selected team."
        confirmText="Confirm & Save"
        type="primary"
      />
    </Modal>
  );
};

export default CreateTicketModal;
