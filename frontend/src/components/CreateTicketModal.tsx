import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import type { TicketPriority, TicketType, Ticket, TicketStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  AlertCircle, 
  User, 
  AlignLeft, 
  Heading, 
  ChevronDown,
  Settings,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Plus,
  Check,
  X,
  Globe,
  Monitor,
  HardDrive,
  Mail,
  Zap
} from 'lucide-react';
import ConfirmationModal from './common/ConfirmationModal';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { 
    projects, 
    users, 
    addTicket,
    categories: storeCategories,
    subcategories: storeSubcategories,
    ticketTypes: storeTicketTypes,
    environments: storeEnvironments,
    addProject,
    addCategory,
    addSubcategory,
    addTicketType,
    addEnvironment
  } = useTicketStore();
  const { user: currentUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const totalSteps = 4;

  // Ticket Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task' as TicketType,
    category: 'Technical',
    subcategory: '',
    service: projects[0]?.name || 'Nebula Portal',
    impact: 'Medium' as 'Low' | 'Medium' | 'High',
    usersAffected: 1,
    priority: 'Medium' as TicketPriority,
    environment: 'Prod' as any,
    projectId: projects[0]?.id || '',
    assigneeId: '',
    assignedTeam: 'Support Engineering',
    requesterName: currentUser?.name || '',
    requesterEmail: currentUser?.email || '',
    requesterPhone: '',
    attachments: [] as string[],
    status: 'Open' as TicketStatus,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Inline DB Option Adds
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isSavingSubcategory, setIsSavingSubcategory] = useState(false);

  const [addingTicketType, setAddingTicketType] = useState(false);
  const [newTicketTypeName, setNewTicketTypeName] = useState('');
  const [isSavingTicketType, setIsSavingTicketType] = useState(false);

  const [addingEnvironment, setAddingEnvironment] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [isSavingEnvironment, setIsSavingEnvironment] = useState(false);
  
  // Technical details
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

  // Priority Auto-Calculator logic
  useEffect(() => {
    let calculatedPriority: TicketPriority = 'Medium';
    if (formData.impact === 'High') {
      calculatedPriority = formData.usersAffected > 10 ? 'Urgent' : 'High';
    } else if (formData.impact === 'Low') {
      calculatedPriority = 'Low';
    }
    setFormData(prev => ({ ...prev, priority: calculatedPriority }));
  }, [formData.impact, formData.usersAffected]);

  // Sync state variables and defaults when opened
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlProjectId = urlParams.get('projectId');
      const activeProject = projects.find(p => p.id === urlProjectId) || projects[0];
      const activeProjId = activeProject?.id || '';
      
      setFormData(prev => ({
        ...prev,
        projectId: activeProjId,
        service: activeProject?.name || '',
        title: '',
        description: '',
        subcategory: '',
        assigneeId: '',
        status: 'Open' as TicketStatus,
        requesterName: currentUser?.name || '',
        requesterEmail: currentUser?.email || '',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      setStep(1);
    }
  }, [isOpen, projects, currentUser]);

  const defaultCategories: Record<string, string[]> = {
    'Technical': ['API Error', 'Database', 'Integration', 'System Crash', 'UI/UX'],
    'Access': ['Password Reset', 'New Account', 'Permissions', 'SSO Issue'],
    'Billing': ['Invoice', 'Payment Failure', 'Refund', 'Subscription'],
    'Other': ['Feedback', 'Feature Request', 'General Inquiry']
  };

  const categoriesList = storeCategories.length > 0 
    ? storeCategories.map(c => c.name) 
    : Object.keys(defaultCategories);

  const getSubcategoriesList = () => {
    if (storeCategories.length > 0 && storeSubcategories.length > 0) {
      const selectedCatObj = storeCategories.find(c => c.name === formData.category);
      if (selectedCatObj) {
        return storeSubcategories
          .filter(sub => String(sub.category) === String(selectedCatObj.id))
          .map(sub => sub.name);
      }
      return [];
    }
    return defaultCategories[formData.category] || [];
  };
  const subcategoriesList = getSubcategoriesList();

  const ticketTypesList = storeTicketTypes.length > 0
    ? storeTicketTypes.map(t => t.name)
    : ['Incident', 'Bug', 'Task', 'Improvement'];

  const environmentsList = storeEnvironments.length > 0
    ? storeEnvironments.map(e => e.name)
    : ['Prod', 'UAT', 'Test', 'Dev'];

  const statusList: TicketStatus[] = ['Open', 'In Progress', 'Blocked', 'In Review', 'Resolved', 'Closed'];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Blocked': return '#ef4444';
      case 'In Review': return '#a855f7';
      case 'Resolved': return '#10b981';
      case 'Closed': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  // Inline DB adds
  const handleSaveProject = async () => {
    if (!newProjectName.trim()) return;
    setIsSavingProject(true);
    try {
      const projId = newProjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const code = newProjectName.substring(0, 3).toUpperCase();
      await addProject({
        id: projId,
        name: newProjectName,
        code,
        color: '#f59e0b',
        description: 'Dynamically added project workspace.'
      });
      setFormData(prev => ({ ...prev, projectId: projId, service: newProjectName }));
      setNewProjectName('');
      setAddingProject(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const newCat = await addCategory({ name: newCategoryName });
      setFormData(prev => ({ ...prev, category: newCat.name, subcategory: '' }));
      setNewCategoryName('');
      setAddingCategory(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSaveSubcategory = async () => {
    if (!newSubcategoryName.trim()) return;
    const selectedCatObj = storeCategories.find(c => c.name === formData.category);
    if (!selectedCatObj) {
      alert("Please select a Category first before adding a new Subcategory!");
      return;
    }
    setIsSavingSubcategory(true);
    try {
      const newSub = await addSubcategory({ category: selectedCatObj.id, name: newSubcategoryName });
      setFormData(prev => ({ ...prev, subcategory: newSub.name }));
      setNewSubcategoryName('');
      setAddingSubcategory(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSubcategory(false);
    }
  };

  const handleSaveTicketType = async () => {
    if (!newTicketTypeName.trim()) return;
    setIsSavingTicketType(true);
    try {
      const newType = await addTicketType({ name: newTicketTypeName });
      setFormData(prev => ({ ...prev, type: newType.name as TicketType }));
      setNewTicketTypeName('');
      setAddingTicketType(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTicketType(false);
    }
  };

  const handleSaveEnvironment = async () => {
    if (!newEnvironmentName.trim()) return;
    setIsSavingEnvironment(true);
    try {
      const newEnv = await addEnvironment({ name: newEnvironmentName });
      setFormData(prev => ({ ...prev, environment: newEnv.name as any }));
      setNewEnvironmentName('');
      setAddingEnvironment(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEnvironment(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsConfirming(true);
    }
  };

  const handleFinalConfirm = async () => {
    try {
      const newTicket: Ticket = {
        ...formData,
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        status: formData.status,
        reporterId: currentUser?.id || 'u1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        slaDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [formData.type, formData.category],
        technicalInfo,
      } as Ticket;
      
      await addTicket(newTicket);
      onClose();
      setStep(1);
      setIsConfirming(false);
    } catch (err) {
      console.error(err);
      alert("Submission error. Please check backend response or constraint rules.");
    }
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
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Task Title / Summary</label>
              <div style={{ position: 'relative' }}>
                <Heading size={18} style={iconStyle} />
                <input required type="text" placeholder="Short issue summary..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} className="search-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Project Workspace</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Layers size={18} style={iconStyle} />
                    <select 
                      value={formData.projectId} 
                      onChange={(e) => {
                        const selectedProj = projects.find(p => p.id === e.target.value);
                        setFormData({ ...formData, projectId: e.target.value, service: selectedProj ? selectedProj.name : '' });
                      }} 
                      style={{ ...inputStyle, paddingRight: '40px' }} 
                      className="search-input"
                    >
                      {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#1a1a1e' }}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                  </div>
                  <button
                    type="button" onClick={() => setAddingProject(!addingProject)}
                    style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <AnimatePresence>
                  {addingProject && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--primary)' }}>
                        <input type="text" placeholder="New Project..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem' }} />
                        {isSavingProject ? (
                          <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <button type="button" onClick={handleSaveProject} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={16} /></button>
                            <button type="button" onClick={() => setAddingProject(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Tag size={18} style={iconStyle} />
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })} style={{ ...inputStyle, paddingRight: '40px' }} className="search-input">
                      {categoriesList.map(cat => <option key={cat} value={cat} style={{ background: '#1a1a1e' }}>{cat}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                  </div>
                  <button
                    type="button" onClick={() => setAddingCategory(!addingCategory)}
                    style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <AnimatePresence>
                  {addingCategory && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                       <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--primary)' }}>
                         <input type="text" placeholder="New Category..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem' }} />
                         {isSavingCategory ? (
                           <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                         ) : (
                           <>
                             <button type="button" onClick={handleSaveCategory} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={16} /></button>
                             <button type="button" onClick={() => setAddingCategory(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                           </>
                         )}
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Subcategory</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Settings size={18} style={iconStyle} />
                    <select required value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} style={{ ...inputStyle, paddingRight: '40px' }} className="search-input">
                      <option value="" style={{ background: '#1a1a1e' }}>Select subcategory...</option>
                      {subcategoriesList.map(sub => <option key={sub} value={sub} style={{ background: '#1a1a1e' }}>{sub}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                  </div>
                  <button
                    type="button" onClick={() => setAddingSubcategory(!addingSubcategory)}
                    style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <AnimatePresence>
                  {addingSubcategory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--primary)' }}>
                        <input type="text" placeholder="New Subcategory..." value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem' }} />
                        {isSavingSubcategory ? (
                          <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <button type="button" onClick={handleSaveSubcategory} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={16} /></button>
                            <button type="button" onClick={() => setAddingSubcategory(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label style={labelStyle}>Task Type</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Shield size={18} style={iconStyle} />
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })} style={{ ...inputStyle, paddingRight: '40px' }} className="search-input">
                      {ticketTypesList.map(type => <option key={type} value={type} style={{ background: '#1a1a1e' }}>{type}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                  </div>
                  <button
                    type="button" onClick={() => setAddingTicketType(!addingTicketType)}
                    style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <AnimatePresence>
                  {addingTicketType && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--primary)' }}>
                        <input type="text" placeholder="New Type..." value={newTicketTypeName} onChange={(e) => setNewTicketTypeName(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem' }} />
                        {isSavingTicketType ? (
                          <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <button type="button" onClick={handleSaveTicketType} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={16} /></button>
                            <button type="button" onClick={() => setAddingTicketType(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Ticket Status Column</label>
                <div style={{ position: 'relative' }}>
                  <Zap size={18} style={iconStyle} />
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })} 
                    style={{ ...inputStyle, paddingRight: '40px' }} 
                    className="search-input"
                  >
                    {statusList.map(status => (
                      <option key={status} value={status} style={{ background: '#1a1a1e' }}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                  <div style={{ 
                    position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: getStatusColor(formData.status),
                    boxShadow: `0 0 8px ${getStatusColor(formData.status)}`
                  }} />
                </div>
              </div>

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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Users Affected</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <input type="number" min="1" value={formData.usersAffected} onChange={(e) => setFormData({ ...formData, usersAffected: parseInt(e.target.value) || 1 })} style={inputStyle} className="search-input" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Calculated Priority</label>
                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', height: '48px' }}>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    backgroundColor: formData.priority === 'Urgent' ? '#ef4444' : formData.priority === 'High' ? '#f59e0b' : '#3b82f6',
                    boxShadow: `0 0 10px ${formData.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`
                  }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formData.priority.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Environment Target</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                {environmentsList.map(env => (
                  <button
                    key={env} type="button" onClick={() => setFormData({ ...formData, environment: env as any })}
                    style={{
                      padding: '10px 16px', borderRadius: '10px',
                      backgroundColor: formData.environment === env ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.environment === env ? 'var(--primary)' : 'var(--border)'}`,
                      color: formData.environment === env ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {env}
                  </button>
                ))}
                <button
                  type="button" onClick={() => setAddingEnvironment(!addingEnvironment)}
                  style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <AnimatePresence>
                {addingEnvironment && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--primary)' }}>
                      <input type="text" placeholder="New Env..." value={newEnvironmentName} onChange={(e) => setNewEnvironmentName(e.target.value)} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem' }} />
                      {isSavingEnvironment ? (
                        <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <button type="button" onClick={handleSaveEnvironment} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={16} /></button>
                          <button type="button" onClick={() => setAddingEnvironment(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Requester Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={iconStyle} />
                  <input readOnly value={formData.requesterName} style={{ ...inputStyle, color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Requester Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={iconStyle} />
                  <input readOnly value={formData.requesterEmail} style={{ ...inputStyle, color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Task / Ticket Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <textarea required placeholder="Explain detailed task objectives, steps to reproduce, or project milestones..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, minHeight: '100px', paddingTop: '12px', resize: 'none' }} className="search-input" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Technical Fingerprint (Auto-captured)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                  <Globe size={16} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Browser</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{technicalInfo.browser}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                  <Monitor size={16} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OS</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{technicalInfo.os}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                  <HardDrive size={16} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Device</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{technicalInfo.device}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
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
                <label style={labelStyle}>Assignee</label>
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
              <label style={labelStyle}>Target Due Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={iconStyle} />
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={inputStyle} className="search-input" />
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px dashed var(--primary)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <Clock size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Forecasted Resolution Duration: 24h SLA</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>Standard priority task will start its resolution timer immediately.</div>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid var(--border)', textAlign: 'center', marginTop: '10px' }}>
              <CheckCircle2 size={32} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Ready for Verification</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Task metrics, assigned environment, and priority calculation successfully verified.</p>
            </div>
          </motion.div>
        );
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create New Task (Step ${step} of 4)`}>
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
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                onClick={() => setStep(step - 1)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ChevronLeft size={18} /> Back
              </motion.button>
            )}
            
            {step < totalSteps ? (
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                onClick={() => {
                  if (step === 1 && !formData.title.trim()) { alert('Title is required.'); return; }
                  setStep(step + 1);
                }}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'var(--grad-primary)', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Next Step <ChevronRight size={18} />
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
                whileTap={{ scale: 0.98 }} type="submit"
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
        message={`Are you sure you want to submit this ticket in the '${formData.status}' column? This will place the task directly into the active workflow status.`}
        confirmText="Confirm & Save"
        type="primary"
      />
    </Modal>
  );
};

export default CreateTicketModal;
