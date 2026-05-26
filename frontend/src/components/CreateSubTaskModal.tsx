import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import type { SubTask } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Heading,
  Tag,
  User,
  Layers,
  Calendar,
  Clock,
  MessageSquare,
  AlertTriangle,
  Zap,
  GitBranch,
  Terminal,
  ShieldCheck,
  Search,
  FileText,
  Percent
} from 'lucide-react';
import ConfirmationModal from './common/ConfirmationModal';

interface CreateSubTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSubTaskModal: React.FC<CreateSubTaskModalProps> = ({ isOpen, onClose }) => {
  const { tickets, users, addSubTask } = useTicketStore();
  const { user: currentUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    parentTicketId: '',
    title: '',
    description: '',
    type: 'Development' as any,
    assignedEngineerId: currentUser?.id || '',
    team: 'Engineering',
    workDate: new Date().toISOString().split('T')[0],
    hoursWorked: 0,
    workDoneToday: '',
    pendingWork: '',
    blockers: '',
    status: 'In Progress' as any,
    completionPercentage: 0,
    codeBranch: '',
    buildVersion: '',
    testingStatus: 'Pending' as any,
    reviewedBy: '',
    approvalStatus: 'Pending' as any,
    resolutionNotes: ''
  });

  // Synchronize and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeTicketId = useTicketStore.getState().selectedTicketId || (tickets.length > 0 ? tickets[0].id : '');
      setFormData({
        parentTicketId: activeTicketId,
        title: '',
        description: '',
        type: 'Development',
        assignedEngineerId: currentUser?.id || '',
        team: 'Engineering',
        workDate: new Date().toISOString().split('T')[0],
        hoursWorked: 0,
        workDoneToday: '',
        pendingWork: '',
        blockers: '',
        status: 'In Progress',
        completionPercentage: 0,
        codeBranch: '',
        buildVersion: '',
        testingStatus: 'Pending',
        reviewedBy: '',
        approvalStatus: 'Pending',
        resolutionNotes: ''
      });
      setStep(1);
    }
  }, [isOpen, tickets, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirming(true);
  };

  const handleFinalConfirm = () => {
    const newSubTask: SubTask = {
      ...formData,
      id: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SubTask;

    addSubTask(newSubTask);
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
            <div>
              <label style={labelStyle}>Parent Ticket</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={iconStyle} />
                <select required value={formData.parentTicketId} onChange={(e) => setFormData({ ...formData, parentTicketId: e.target.value })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                  <option value="" style={{ background: '#1a1a1e' }}>Select Parent Ticket...</option>
                  {tickets.map(t => <option key={t.id} value={t.id} style={{ background: '#1a1a1e' }}>[{t.id}] {t.title}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Task Title</label>
              <div style={{ position: 'relative' }}>
                <Heading size={18} style={iconStyle} />
                <input required type="text" placeholder="Specific work item..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} className="search-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Work Type</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={iconStyle} />
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                    <option value="Analysis" style={{ background: '#1a1a1e' }}>Analysis</option>
                    <option value="Development" style={{ background: '#1a1a1e' }}>Development</option>
                    <option value="Testing" style={{ background: '#1a1a1e' }}>Testing</option>
                    <option value="Review" style={{ background: '#1a1a1e' }}>Review</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Team</label>
                <div style={{ position: 'relative' }}>
                  <Layers size={18} style={iconStyle} />
                  <input value={formData.team} onChange={(e) => setFormData({ ...formData, team: e.target.value })} style={inputStyle} className="search-input" />
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
                <label style={labelStyle}>Work Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={iconStyle} />
                  <input type="date" value={formData.workDate} onChange={(e) => setFormData({ ...formData, workDate: e.target.value })} style={inputStyle} className="search-input" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hours Worked</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={iconStyle} />
                  <input type="number" step="0.5" value={formData.hoursWorked} onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) })} style={inputStyle} className="search-input" />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Work Done Today</label>
              <div style={{ position: 'relative' }}>
                <MessageSquare size={18} style={{ ...iconStyle, top: '14px', transform: 'none' }} />
                <textarea required placeholder="What progress was made today?" value={formData.workDoneToday} onChange={(e) => setFormData({ ...formData, workDoneToday: e.target.value })} style={{ ...inputStyle, minHeight: '80px', paddingTop: '12px', resize: 'none' }} className="search-input" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Blockers / Risks</label>
              <div style={{ position: 'relative' }}>
                <AlertTriangle size={18} style={iconStyle} />
                <input placeholder="Any issues holding you back?" value={formData.blockers} onChange={(e) => setFormData({ ...formData, blockers: e.target.value })} style={inputStyle} className="search-input" />
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
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Current Status</label>
                <div style={{ position: 'relative' }}>
                  <Zap size={18} style={iconStyle} />
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                    <option value="Open" style={{ background: '#1a1a1e' }}>Open / Planned</option>
                    <option value="In Progress" style={{ background: '#1a1a1e' }}>In Progress</option>
                    <option value="Done" style={{ background: '#1a1a1e' }}>Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Completion %</label>
                <div style={{ position: 'relative' }}>
                  <Percent size={18} style={iconStyle} />
                  <input type="number" min="0" max="100" value={formData.completionPercentage} onChange={(e) => setFormData({ ...formData, completionPercentage: parseInt(e.target.value) })} style={inputStyle} className="search-input" />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Assigned Engineer</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={iconStyle} />
                <select value={formData.assignedEngineerId} onChange={(e) => setFormData({ ...formData, assignedEngineerId: e.target.value })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                  {users.map(u => <option key={u.id} value={u.id} style={{ background: '#1a1a1e' }}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Code Branch</label>
                <div style={{ position: 'relative' }}>
                  <GitBranch size={18} style={iconStyle} />
                  <input placeholder="feature/ticket-123" value={formData.codeBranch} onChange={(e) => setFormData({ ...formData, codeBranch: e.target.value })} style={inputStyle} className="search-input" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Build / Version</label>
                <div style={{ position: 'relative' }}>
                  <Terminal size={18} style={iconStyle} />
                  <input placeholder="v1.2.0-rc1" value={formData.buildVersion} onChange={(e) => setFormData({ ...formData, buildVersion: e.target.value })} style={inputStyle} className="search-input" />
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
                <label style={labelStyle}>Testing Status</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={18} style={iconStyle} />
                  <select value={formData.testingStatus} onChange={(e) => setFormData({ ...formData, testingStatus: e.target.value as any })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                    <option value="Pending" style={{ background: '#1a1a1e' }}>Pending</option>
                    <option value="Passed" style={{ background: '#1a1a1e' }}>Passed</option>
                    <option value="Failed" style={{ background: '#1a1a1e' }}>Failed</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Approval Status</label>
                <div style={{ position: 'relative' }}>
                  <CheckCircle2 size={18} style={iconStyle} />
                  <select value={formData.approvalStatus} onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as any })} style={{ ...inputStyle, appearance: 'none' }} className="search-input">
                    <option value="Pending" style={{ background: '#1a1a1e' }}>Pending Review</option>
                    <option value="Approved" style={{ background: '#1a1a1e' }}>Approved</option>
                    <option value="Rejected" style={{ background: '#1a1a1e' }}>Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Resolution Notes</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ ...iconStyle, top: '14px', transform: 'none' }} />
                <textarea placeholder="Final solution details..." value={formData.resolutionNotes} onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })} style={{ ...inputStyle, minHeight: '100px', paddingTop: '12px', resize: 'none' }} className="search-input" />
              </div>
            </div>

            <div style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>AUDIT READY: Automated timestamping will be applied upon submission.</p>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Task / Work Log">
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

        <form onSubmit={handleSubmit} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                <CheckCircle2 size={18} /> Complete Entry
              </motion.button>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleFinalConfirm}
        title="Confirm Work Log Entry"
        message="Are you sure you want to save this work log entry? This will be recorded as a permanent part of the ticket history."
        confirmText="Confirm & Save"
        type="success"
      />
    </Modal>
  );
};

export default CreateSubTaskModal;
