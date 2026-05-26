import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Download, FileText, TrendingUp, TrendingDown,
  CreditCard, CheckCircle, AlertCircle, X, Send, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

/* ─── Types ──────────────────────────────────────────────── */
interface Payslip {
  id: string;
  month: string;
  year: number;
  basic: number;
  hra: number;
  allowances: number;
  pf: number;
  tax: number;
  net: number;
  status: 'Paid' | 'Processing' | 'Pending';
}

interface Toast { id: string; msg: string; ok: boolean; }

/* ─── Mock data ──────────────────────────────────────────── */
const PAYSLIPS: Payslip[] = [
  { id:'PS-001', month:'April',    year:2026, basic:55000, hra:22000, allowances:8500, pf:6600,  tax:4200, net:74700, status:'Paid' },
  { id:'PS-002', month:'March',    year:2026, basic:55000, hra:22000, allowances:8500, pf:6600,  tax:4200, net:74700, status:'Paid' },
  { id:'PS-003', month:'February', year:2026, basic:55000, hra:22000, allowances:7800, pf:6600,  tax:4200, net:74000, status:'Paid' },
  { id:'PS-004', month:'January',  year:2026, basic:52000, hra:20800, allowances:7800, pf:6240,  tax:3900, net:70460, status:'Paid' },
  { id:'PS-005', month:'December', year:2025, basic:52000, hra:20800, allowances:7800, pf:6240,  tax:3900, net:70460, status:'Paid' },
  { id:'PS-006', month:'May',      year:2026, basic:55000, hra:22000, allowances:8500, pf:6600,  tax:4200, net:74700, status:'Processing' },
];

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* ─── Breakdown ring ─────────────────────────────────────── */
const Ring = ({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) => {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeDasharray={circ}
        />
      </svg>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>{value}</span>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────── */
const HR_QUERY_OPTIONS = [
  'Payslip Correction',
  'Salary Certificate Request',
  'Tax Declaration Update',
  'Reimbursement Claim',
  'Other Payroll Issue',
];

const PayrollPortal: React.FC = () => {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hrForm, setHrForm] = useState({ type: 'Payslip Correction', message: '' });
  const [hrSent, setHrSent] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (msg: string, ok = true) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, msg, ok }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const handleDownload = (ps: Payslip) => {
    if (downloading) return;
    setDownloading(ps.id);
    setTimeout(() => {
      setDownloading(null);
      addToast(`${ps.month} ${ps.year} payslip downloaded successfully`);
    }, 1800);
  };

  const handleHrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrForm.message.trim()) return;
    setHrSent(true);
    addToast('Your HR query has been submitted. Expect a response within 2 business days.');
    setTimeout(() => setHrSent(false), 4000);
    setHrForm(p => ({ ...p, message: '' }));
  };

  const latest = PAYSLIPS[0];
  const gross = latest.basic + latest.hra + latest.allowances;
  const deductions = latest.pf + latest.tax;

  const METRICS = [
    { label: 'Net Salary',    value: fmt(latest.net),     icon: DollarSign,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Gross Salary',  value: fmt(gross),          icon: TrendingUp,   color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Total Deductions', value: fmt(deductions),  icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
    { label: 'YTD Earnings',  value: fmt(latest.net * 5), icon: CreditCard,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  ];

  return (
    <div style={{ padding: 'var(--content-padding)', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
          Payroll Portal
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Welcome, <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.name || 'Employee'}</span> — manage your salary, payslips and HR queries.
        </p>
      </motion.div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {METRICS.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: m.bg, border: `1px solid ${m.color}33`, borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={20} color={m.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Payslips list */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Payslip History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {PAYSLIPS.map((ps, i) => (
              <motion.div key={ps.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === ps.id ? null : ps.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} color="#f59e0b" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{ps.month} {ps.year}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ps.id}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'white' }}>{fmt(ps.net)}</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                        backgroundColor: ps.status === 'Paid' ? 'rgba(16,185,129,0.1)' : ps.status === 'Processing' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: ps.status === 'Paid' ? '#10b981' : ps.status === 'Processing' ? '#f59e0b' : '#ef4444' }}>
                        {ps.status}
                      </span>
                    </div>
                    <motion.div animate={{ rotate: expandedId === ps.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} color="var(--text-dim)" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded breakdown */}
                <AnimatePresence>
                  {expandedId === ps.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { l: 'Basic Pay',    v: ps.basic,      c: '#10b981' },
                          { l: 'HRA',          v: ps.hra,        c: '#8b5cf6' },
                          { l: 'Allowances',   v: ps.allowances, c: '#3b82f6' },
                          { l: 'PF (Employee)',v: ps.pf,         c: '#ef4444' },
                          { l: 'Income Tax',   v: ps.tax,        c: '#f59e0b' },
                          { l: 'Net Pay',      v: ps.net,        c: '#f59e0b' },
                        ].map(item => (
                          <div key={item.l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.625rem' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>{item.l}</p>
                            <p style={{ fontWeight: 700, color: item.c, fontSize: '0.9rem' }}>{fmt(item.v)}</p>
                          </div>
                        ))}
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(ps)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px',
                          background: 'var(--grad-primary)', color: '#000', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
                        {downloading === ps.id
                          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                              style={{ width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          : <Download size={15} />}
                        {downloading === ps.id ? 'Generating PDF…' : 'Download PDF'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Salary Breakdown rings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <Ring pct={Math.round((latest.basic / gross) * 100)} color="#f59e0b" label="Basic Pay" value={fmt(latest.basic)} />
              <Ring pct={Math.round((latest.hra / gross) * 100)} color="#8b5cf6" label="HRA" value={fmt(latest.hra)} />
              <Ring pct={Math.round((latest.allowances / gross) * 100)} color="#3b82f6" label="Allowances" value={fmt(latest.allowances)} />
              <Ring pct={Math.round((deductions / gross) * 100)} color="#ef4444" label="Deductions" value={fmt(deductions)} />
            </div>
          </motion.div>

          {/* HR Query Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HR Payroll Query</h3>
            <form onSubmit={handleHrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Custom Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  onClick={() => setIsDropdownOpen(p => !p)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${isDropdownOpen ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '0.625rem 0.875rem',
                    color: 'white', fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    boxShadow: isDropdownOpen ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
                  }}
                >
                  <span>{hrForm.type}</span>
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} color="var(--text-dim)" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                        background: 'rgba(18, 18, 22, 0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        zIndex: 999,
                        overflow: 'hidden',
                        padding: '4px',
                      }}
                    >
                      {HR_QUERY_OPTIONS.map(opt => (
                        <motion.div
                          key={opt}
                          whileHover={{ backgroundColor: 'rgba(245,158,11,0.08)' }}
                          onClick={() => { setHrForm(p => ({ ...p, type: opt })); setIsDropdownOpen(false); }}
                          style={{
                            padding: '0.625rem 0.875rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            color: hrForm.type === opt ? '#f59e0b' : 'var(--text-muted)',
                            fontWeight: hrForm.type === opt ? 700 : 400,
                            backgroundColor: hrForm.type === opt ? 'rgba(245,158,11,0.06)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all 0.15s',
                          }}
                        >
                          {opt}
                          {hrForm.type === opt && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea rows={4} placeholder="Describe your query in detail…"
                value={hrForm.message} onChange={e => setHrForm(p => ({ ...p, message: e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.625rem', color: 'white', fontSize: '0.85rem', resize: 'none' }} />
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px',
                  background: hrSent ? 'rgba(16,185,129,0.15)' : 'var(--grad-primary)', color: hrSent ? '#10b981' : '#000',
                  fontWeight: 700, fontSize: '0.85rem', border: hrSent ? '1px solid #10b981' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
                {hrSent ? <><CheckCircle size={15} /> Submitted!</> : <><Send size={15} /> Submit Query</>}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 200 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(20,20,24,0.95)',
                border: `1px solid ${t.ok ? '#10b981' : '#ef4444'}`, borderRadius: '12px', padding: '0.75rem 1rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '280px' }}>
              {t.ok ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
              <span style={{ fontSize: '0.85rem', color: 'white', flex: 1 }}>{t.msg}</span>
              <X size={14} color="var(--text-dim)" style={{ cursor: 'pointer' }} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PayrollPortal;
