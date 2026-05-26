import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, X, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Password strength engine ───────────────────────────── */
const getStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0–5
};
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#10b981'];

/* ─── Requirement row ────────────────────────────────────── */
const Req = ({ met, label }: { met: boolean; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
    <motion.div
      animate={{ scale: met ? [1.3, 1] : 1, backgroundColor: met ? '#10b981' : 'rgba(255,255,255,0.1)' }}
      transition={{ duration: 0.2 }}
      style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {met && <span style={{ fontSize: '0.55rem', color: '#000', fontWeight: 900 }}>✓</span>}
    </motion.div>
    <span style={{ color: met ? '#10b981' : 'var(--text-dim)', transition: 'color 0.2s' }}>{label}</span>
  </div>
);

/* ─── Password field ─────────────────────────────────────── */
const PwdField = ({
  label, value, onChange, show, onToggle, id, error
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; id: string; error?: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label htmlFor={id} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="new-password"
        style={{
          width: '100%',
          padding: '10px 40px 10px 36px',
          boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
          borderRadius: '10px',
          color: 'white',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
      />
      <button type="button" onClick={onToggle}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 0 }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
    {error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>⚠ {error}</span>}
  </div>
);

/* ─── Component ──────────────────────────────────────────── */
const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();

  const [current, setCurrent]   = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [success, setSuccess]       = useState(false);

  const strength   = getStrength(newPwd);
  const strengthPct = (strength / 5) * 100;

  const requirements = [
    { met: newPwd.length >= 8,         label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPwd),       label: 'One uppercase letter' },
    { met: /[0-9]/.test(newPwd),       label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(newPwd),label: 'One special character (optional but recommended)' },
    { met: newPwd === confirm && confirm.length > 0, label: 'Passwords match' },
  ];

  const isReady = current.length > 0 && strength >= 3 && newPwd === confirm;

  const handleClose = () => {
    setCurrent(''); setNewPwd(''); setConfirm('');
    setApiError(''); setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || submitting) return;
    setApiError('');
    setSubmitting(true);
    try {
      await authApi.changePassword(current, newPwd, confirm);
      setSuccess(true);
      // Force re-login after 2.5s for security
      setTimeout(() => {
        logout();
        handleClose();
      }, 2500);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: '440px',
              background: 'rgba(14,14,18,0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              zIndex: 201,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#f59e0b" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Change Password</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>All fields are required</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }} onClick={handleClose}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
                <X size={16} />
              </motion.button>
            </div>

            {/* Success State */}
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981' }}>Password changed successfully!</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Redirecting you to login for security…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <PwdField label="Current Password" id="cp-current" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />

                <div style={{ height: '1px', background: 'var(--border)' }} />

                <PwdField label="New Password" id="cp-new" value={newPwd} onChange={setNewPwd} show={showNew} onToggle={() => setShowNew(p => !p)} />

                {/* Strength bar */}
                {newPwd.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Password Strength</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        animate={{ width: `${strengthPct}%`, backgroundColor: STRENGTH_COLORS[strength] }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                      {requirements.slice(0, 4).map(r => <Req key={r.label} met={r.met} label={r.label} />)}
                    </div>
                  </motion.div>
                )}

                <PwdField label="Confirm New Password" id="cp-confirm" value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm(p => !p)}
                  error={confirm.length > 0 && newPwd !== confirm ? 'Passwords do not match' : undefined} />

                {/* API Error */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', color: '#ef4444' }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      {apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={!isReady || submitting}
                  whileHover={isReady ? { scale: 1.02, boxShadow: '0 8px 25px rgba(245,158,11,0.25)' } : {}}
                  whileTap={isReady ? { scale: 0.98 } : {}}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '12px',
                    background: isReady ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                    color: isReady ? '#000' : 'var(--text-dim)',
                    fontWeight: 700, fontSize: '0.9rem', border: 'none',
                    cursor: isReady ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    marginTop: '4px',
                  }}
                >
                  {submitting
                    ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} /> Updating…</>
                    : <><ShieldCheck size={16} /> Update Password</>}
                </motion.button>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  🔒 You will be automatically signed out after changing your password.
                </p>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
