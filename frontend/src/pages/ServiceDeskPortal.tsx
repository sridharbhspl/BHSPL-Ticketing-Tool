import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Key, Package, Wifi, Printer, Phone, HelpCircle,
  CheckCircle, Clock, AlertCircle, X, Send,
  Search
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

/* ─── Types ──────────────────────────────────────────────── */
type RequestStatus = 'Under Review' | 'In Progress' | 'Fulfilled' | 'Rejected';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface ServiceRequest {
  id: string;
  category: string;
  title: string;
  priority: Priority;
  status: RequestStatus;
  assignee: string;
  createdAt: string;
  eta: string;
}

interface Toast { id: string; msg: string; ok: boolean; }

/* ─── Mock requests ──────────────────────────────────────── */
const INITIAL_REQUESTS: ServiceRequest[] = [
  { id:'SR-1042', category:'Software', title:'Adobe Creative Suite License',   priority:'Medium',   status:'In Progress',  assignee:'Ravi Kumar',  createdAt:'24 May 2026', eta:'27 May 2026' },
  { id:'SR-1039', category:'Hardware', title:'Secondary Monitor Setup',        priority:'Low',      status:'Fulfilled',    assignee:'Priya M.',    createdAt:'21 May 2026', eta:'23 May 2026' },
  { id:'SR-1035', category:'Access',   title:'GitHub Enterprise Org Access',   priority:'High',     status:'Under Review', assignee:'Unassigned',  createdAt:'19 May 2026', eta:'TBD'         },
  { id:'SR-1028', category:'Network',  title:'VPN Client Configuration',       priority:'Critical', status:'Fulfilled',    assignee:'Anand S.',    createdAt:'14 May 2026', eta:'14 May 2026' },
];

/* ─── Category cards ─────────────────────────────────────── */
const CATEGORIES = [
  { id:'hardware',  icon: Monitor,  label: 'Hardware',         sub: 'Laptops, monitors, peripherals',   color: '#3b82f6' },
  { id:'software',  icon: Package,  label: 'Software & Licenses', sub: 'Apps, subscriptions, tools',    color: '#8b5cf6' },
  { id:'access',    icon: Key,      label: 'Access & SSO',      sub: 'Accounts, permissions, VPN',      color: '#f59e0b' },
  { id:'network',   icon: Wifi,     label: 'Network',           sub: 'WiFi, firewall, VPN configs',     color: '#10b981' },
  { id:'printing',  icon: Printer,  label: 'Printing',          sub: 'Printers, MFD, toner requests',  color: '#ef4444' },
  { id:'comms',     icon: Phone,    label: 'Communication',     sub: 'IP phones, headsets, Teams DID',  color: '#06b6d4' },
];

/* ─── Helpers ────────────────────────────────────────────── */
const statusColor: Record<RequestStatus, string> = {
  'Under Review': '#f59e0b',
  'In Progress':  '#3b82f6',
  'Fulfilled':    '#10b981',
  'Rejected':     '#ef4444',
};
const priorityColor: Record<Priority, string> = {
  Low:      '#6b7280',
  Medium:   '#3b82f6',
  High:     '#f59e0b',
  Critical: '#ef4444',
};

/* ─── Component ──────────────────────────────────────────── */
const ServiceDeskPortal: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [toasts, setToasts]     = useState<Toast[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All');
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium' as Priority, location: '', urgency: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const addToast = (msg: string, ok = true) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg, ok }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handleCategoryClick = (id: string) => {
    setSelectedCat(id);
    setShowForm(true);
    const cat = CATEGORIES.find(c => c.id === id)!;
    setForm(p => ({ ...p, title: '', description: '' }));
    // prefill category context
    setForm({ title: '', description: '', priority: 'Medium', location: '', urgency: `${cat.label} request` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const cat = CATEGORIES.find(c => c.id === selectedCat)!;
      const newReq: ServiceRequest = {
        id: `SR-${1043 + requests.length}`,
        category: cat.label,
        title: form.title,
        priority: form.priority,
        status: 'Under Review',
        assignee: 'Unassigned',
        createdAt: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
        eta: 'TBD',
      };
      setRequests(p => [newReq, ...p]);
      setSubmitting(false);
      setShowForm(false);
      setSelectedCat(null);
      setForm({ title:'', description:'', priority:'Medium', location:'', urgency:'' });
      addToast(`Service request ${newReq.id} submitted successfully. Expected response within 4 business hours.`);
    }, 1800);
  };

  const filtered = requests
    .filter(r => filterStatus === 'All' || r.status === filterStatus)
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    open:      requests.filter(r => r.status === 'Under Review' || r.status === 'In Progress').length,
    fulfilled: requests.filter(r => r.status === 'Fulfilled').length,
    total:     requests.length,
  };

  return (
    <div 
      id="servicedesk-portal-root"
      className="servicedesk-portal-view"
      style={{ padding: 'var(--content-padding)', maxWidth: '1100px', margin: '0 auto' }}
    >
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'1.75rem', fontWeight:800, color:'white', marginBottom:'4px' }}>Service Desk Portal</h1>
        <p style={{ color:'var(--text-dim)', fontSize:'0.9rem' }}>
          Welcome, <span style={{ color:'var(--primary)', fontWeight:600 }}>{user?.name || 'Employee'}</span> — submit IT requests, track fulfillment, and access self-service resources.
        </p>
      </motion.div>

      {/* Stats */}
      <div 
        id="servicedesk-stats-grid"
        className="servicedesk-stats-container"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1rem', marginBottom:'2rem' }}
      >
        {[
          { label:'Open Requests',    value: stats.open,      color:'#f59e0b', icon: Clock        },
          { label:'Fulfilled',        value: stats.fulfilled,  color:'#10b981', icon: CheckCircle  },
          { label:'Total Submitted',  value: stats.total,      color:'#8b5cf6', icon: HelpCircle   },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            id={`servicedesk-stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="servicedesk-stat-card"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}
            style={{ background:`${s.color}0d`, border:`1px solid ${s.color}33`, borderRadius:'16px', padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}
          >
            <div style={{ width:44, height:44, borderRadius:'12px', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize:'0.7rem', color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</p>
              <p style={{ fontSize:'1.5rem', fontWeight:800, color:'white' }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category grid */}
      <h2 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'1rem' }}>
        New Request — Select Category
      </h2>
      <div 
        id="servicedesk-category-grid"
        className="servicedesk-category-container"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'0.875rem', marginBottom:'2rem' }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.div 
            key={cat.id}
            id={`servicedesk-category-card-${cat.id}`}
            className="servicedesk-category-card"
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale:1.04, borderColor: cat.color }}
            whileTap={{ scale:0.97 }}
            onClick={() => handleCategoryClick(cat.id)}
            style={{ background: selectedCat === cat.id ? `${cat.color}15` : 'var(--bg-card)',
              border: `1px solid ${selectedCat === cat.id ? cat.color : 'var(--border)'}`,
              borderRadius:'16px', padding:'1.25rem', cursor:'pointer',
              transition:'all 0.2s ease' }}
          >
            <div style={{ width:40, height:40, borderRadius:'12px', background:`${cat.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.875rem' }}>
              <cat.icon size={20} color={cat.color} />
            </div>
            <p style={{ fontWeight:700, color:'white', fontSize:'0.875rem', marginBottom:'2px' }}>{cat.label}</p>
            <p style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>{cat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Request form drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            id="servicedesk-request-form-card"
            className="servicedesk-request-form-panel"
            initial={{ opacity:0, y:20, scale:0.98 }} 
            animate={{ opacity:1, y:0, scale:1 }} 
            exit={{ opacity:0, y:20, scale:0.98 }}
            style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'1.5rem', marginBottom:'2rem',
              boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontWeight:700, color:'white', fontSize:'1rem' }}>
                {CATEGORIES.find(c => c.id === selectedCat)?.label} Request
              </h3>
              <motion.button whileHover={{ scale:1.1 }} onClick={() => setShowForm(false)}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px', cursor:'pointer', color:'var(--text-dim)', display:'flex' }}>
                <X size={16} />
              </motion.button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
              <input 
                id="servicedesk-form-title-input"
                className="servicedesk-form-input"
                required placeholder="Request Title *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.75rem', color:'white', fontSize:'0.875rem' }} 
              />
              <textarea 
                id="servicedesk-form-description-textarea"
                className="servicedesk-form-textarea"
                required rows={3} placeholder="Describe your requirement in detail *" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.75rem', color:'white', fontSize:'0.875rem', resize:'none' }} 
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div>
                  <label htmlFor="servicedesk-form-priority-select" style={{ fontSize:'0.75rem', color:'var(--text-dim)', fontWeight:600 }}>Priority</label>
                  <select 
                    id="servicedesk-form-priority-select"
                    className="servicedesk-form-select"
                    value={form.priority} 
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                    style={{ width:'100%', marginTop:'4px', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.625rem', color:'white', fontSize:'0.875rem' }}
                  >
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="servicedesk-form-location-input" style={{ fontSize:'0.75rem', color:'var(--text-dim)', fontWeight:600 }}>Location / Desk No.</label>
                  <input 
                    id="servicedesk-form-location-input"
                    className="servicedesk-form-input"
                    placeholder="e.g. Block A - Desk 14" value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    style={{ width:'100%', marginTop:'4px', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.625rem', color:'white', fontSize:'0.875rem' }} 
                  />
                </div>
              </div>
              <motion.button 
                id="servicedesk-form-submit-btn"
                className="servicedesk-form-submit-button"
                type="submit" 
                whileHover={{ scale:1.02, boxShadow:'0 8px 25px var(--primary-glow)' }} 
                whileTap={{ scale:0.98 }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'12px', borderRadius:'12px',
                  background:'var(--grad-primary)', color:'#000', fontWeight:700, fontSize:'0.9rem', border:'none', cursor:'pointer' }}
              >
                {submitting
                  ? <><motion.div animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                      style={{ width:16, height:16, border:'2px solid #000', borderTopColor:'transparent', borderRadius:'50%' }} /> Submitting…</>
                  : <><Send size={16} /> Submit Request</>}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request tracker */}
      <div 
        id="servicedesk-tracker-header"
        className="servicedesk-tracker-controls"
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}
      >
        <h2 style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'1px' }}>My Requests</h2>
        <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'10px', padding:'6px 12px' }}>
            <Search size={14} color="var(--text-dim)" />
            <input 
              id="servicedesk-tracker-search-input"
              className="servicedesk-tracker-search-field"
              placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ background:'transparent', border:'none', color:'white', fontSize:'0.85rem', outline:'none', width:'140px' }} 
            />
          </div>
          <select 
            id="servicedesk-tracker-status-select"
            className="servicedesk-tracker-status-filter"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value as RequestStatus | 'All')}
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'10px', padding:'6px 12px', color:'white', fontSize:'0.85rem' }}
          >
            <option value="All">All Status</option>
            <option>Under Review</option>
            <option>In Progress</option>
            <option>Fulfilled</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div 
        id="servicedesk-requests-list-container"
        className="servicedesk-requests-list"
        style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}
      >
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-dim)', fontSize:'0.9rem' }}>
            No requests found
          </div>
        )}
        {filtered.map((req, i) => (
          <motion.div 
            key={req.id}
            id={`servicedesk-request-row-${req.id}`}
            className="servicedesk-request-row"
            initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}
            style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto auto', alignItems:'center', gap:'1rem',
              background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'1rem 1.25rem' }}
          >
            {/* ID */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:'10px', background:'rgba(245,158,11,0.08)' }}>
              <HelpCircle size={18} color="#f59e0b" />
            </div>
            {/* Title */}
            <div>
              <p style={{ fontWeight:700, color:'white', fontSize:'0.9rem' }}>{req.title}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>{req.id} · {req.category} · Submitted {req.createdAt}</p>
            </div>
            {/* Priority */}
            <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 8px', borderRadius:'6px',
              background:`${priorityColor[req.priority]}18`, color: priorityColor[req.priority] }}>
              {req.priority}
            </span>
            {/* Assignee */}
            <span style={{ fontSize:'0.75rem', color:'var(--text-dim)', whiteSpace:'nowrap' }}>{req.assignee}</span>
            {/* Status */}
            <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'3px 10px', borderRadius:'6px',
              background:`${statusColor[req.status]}18`, color: statusColor[req.status], whiteSpace:'nowrap' }}>
              {req.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Toast stack */}
      <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem', zIndex:200 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:60 }}
              style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(20,20,24,0.95)',
                border:`1px solid ${t.ok ? '#10b981' : '#ef4444'}`, borderRadius:'12px', padding:'0.75rem 1rem',
                boxShadow:'0 8px 24px rgba(0,0,0,0.4)', minWidth:'300px' }}>
              {t.ok ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
              <span style={{ fontSize:'0.85rem', color:'white', flex:1 }}>{t.msg}</span>
              <X size={14} color="var(--text-dim)" style={{ cursor:'pointer' }} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceDeskPortal;
