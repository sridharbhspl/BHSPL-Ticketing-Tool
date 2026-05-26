import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Inbox,
  HeartPulse,
  Send,
  Mail,
  ListTodo,
  History,
  Eye,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { useLeaveStore, type LeaveRequest } from '../store/useLeaveStore';
import { useAuthStore } from '../store/useAuthStore';
import Breadcrumbs from '../components/Breadcrumbs';

const Leaves: React.FC = () => {
  const { 
    leaveRequests, 
    emailLogs, 
    applyLeave, 
    cancelLeave,
    updateLeave,
    approveL1, 
    approveL2, 
    rejectLeave, 
    clearEmailLogs, 
    fetchLeaveRequests 
  } = useLeaveStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'my' | 'team' | 'emails'>('my');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedReqForTimeline, setSelectedReqForTimeline] = useState<LeaveRequest | null>(null);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [cancelConfirmRequest, setCancelConfirmRequest] = useState<LeaveRequest | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Request Form State
  const [leaveType, setLeaveType] = useState<'Full Day Leave' | 'Short Leave' | 'Sick Leave' | 'Casual Leave'>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shortLeaveDuration, setShortLeaveDuration] = useState('2 Hours');
  const [reason, setReason] = useState('');

  const currentUserId = user?.id || '1';
  const userRole = user?.role || 'Senior Developer';
  const isPM = userRole === 'Project Manager';
  const isAdmin = userRole === 'Admin';

  // Filter lists
  const myLeaves = leaveRequests.filter(req => req.userId === currentUserId);
  const teamLeaves = leaveRequests;

  // Metrics
  const approvedLeaves = myLeaves.filter(req => req.status === 'Approved');
  const totalDaysTaken = approvedLeaves
    .filter(req => req.leaveType !== 'Short Leave')
    .reduce((sum, req) => {
      const dur = parseInt(req.duration) || 1;
      return sum + dur;
    }, 0);

  const shortLeavesCount = approvedLeaves.filter(req => req.leaveType === 'Short Leave').length;

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(leaveType === 'Short Leave' ? startDate : (endDate || startDate));
    if (start > end) {
      setFormError("End date cannot be before start date.");
      return;
    }

    const hasOverlap = myLeaves.some(req => {
      if (req.status === 'Cancelled' || req.status === 'Rejected') return false;
      if (editingLeaveRequest && req.id === editingLeaveRequest.id) return false;

      const reqStart = new Date(req.startDate);
      const reqEnd = new Date(req.endDate);

      return start <= reqEnd && end >= reqStart;
    });

    if (hasOverlap) {
      setFormError("Date conflict: You already have an active leave request covering these dates.");
      return;
    }

    setFormError(null);

    let calculatedDuration = '1 Day';
    if (leaveType === 'Short Leave') {
      calculatedDuration = shortLeaveDuration;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedDuration = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    }

    try {
      if (editingLeaveRequest) {
        await updateLeave(
          editingLeaveRequest.id,
          {
            leaveType,
            startDate,
            endDate: leaveType === 'Short Leave' ? startDate : (endDate || startDate),
            duration: calculatedDuration,
            reason
          },
          user?.name || 'Unknown User',
          userRole
        );
      } else {
        await applyLeave({
          userId: currentUserId,
          userName: user?.name || 'Unknown User',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          leaveType,
          startDate,
          endDate: leaveType === 'Short Leave' ? startDate : (endDate || startDate),
          duration: calculatedDuration,
          reason
        });
      }

      // Reset Form
      setLeaveType('Casual Leave');
      setStartDate('');
      setEndDate('');
      setShortLeaveDuration('2 Hours');
      setReason('');
      setShowApplyModal(false);
      setEditingLeaveRequest(null);
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving your leave request. Please try again.");
    }
  };

  const handleOpenNewLeaveModal = () => {
    setFormError(null);
    setShowApplyModal(true);
  };

  const handleStartEdit = (req: LeaveRequest) => {
    setFormError(null);
    setEditingLeaveRequest(req);
    setLeaveType(req.leaveType);
    setStartDate(req.startDate);
    setEndDate(req.endDate);
    if (req.leaveType === 'Short Leave') {
      setShortLeaveDuration(req.duration);
    }
    setReason(req.reason);
    setShowApplyModal(true);
  };

  const handleStartCancel = (req: LeaveRequest) => {
    setCancelConfirmRequest(req);
  };

  const handleCancelConfirmSubmit = () => {
    if (cancelConfirmRequest) {
      cancelLeave(cancelConfirmRequest.id, user?.name || 'Unknown User', userRole);
      setCancelConfirmRequest(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': 
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)', label: 'Approved' };
      case 'Rejected': 
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)', label: 'Rejected' };
      case 'Cancelled': 
        return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.2)', label: 'Cancelled' };
      case 'Pending L2 (HR) Approval': 
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)', label: 'HR Final Review' };
      default: 
        return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)', label: 'L1 Manager Review' };
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Leave & Short Leave</h2>
          <p style={{ color: 'var(--text-dim)' }}>Level-Wise Approval Hub: Manager L1 vetting, HR L2 sign-offs, and automated notification logging.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 8px 25px var(--primary-glow)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenNewLeaveModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            borderRadius: '14px',
            background: 'var(--grad-primary)',
            color: '#000',
            fontWeight: 700,
            boxShadow: '0 4px 15px var(--primary-glow)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Apply for Leave
        </motion.button>
      </header>

      {/* Corporate Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Casual Leaves Taken</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalDaysTaken} Days</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#3b82f6" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Short Leaves Taken</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{shortLeavesCount} Leaves</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={22} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Balance</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Math.max(18 - totalDaysTaken, 0)} Days</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} color="#a78bfa" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Notifications</h4>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{emailLogs.length} Outbox</span>
          </div>
        </motion.div>
      </div>

      {/* Main Tab Controller Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Core Leave Board */}
        <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          
          {/* Tab Navigation header */}
          <div style={{ 
            padding: '1.25rem 1.75rem', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }}>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setActiveTab('my')}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'my' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'my' ? '#000' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <ListTodo size={14} /> My Requests ({myLeaves.length})
              </button>
              
              <button 
                onClick={() => setActiveTab('team')}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'team' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'team' ? '#000' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <ShieldCheck size={14} /> Level Approval Board ({teamLeaves.length})
              </button>

              <button 
                onClick={() => setActiveTab('emails')}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'emails' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'emails' ? '#000' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Mail size={14} /> Automated Notification Log ({emailLogs.length})
              </button>
            </div>
            
            {activeTab === 'emails' && emailLogs.length > 0 && (
              <button 
                onClick={clearEmailLogs}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={12} /> Clear Logs
              </button>
            )}
          </div>

          {/* Tab 1 & Tab 2: Leaves tables */}
          {activeTab !== 'emails' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Resource</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Leave Category</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Date Range</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Approval Stage</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Audit Timeline</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Level Decision Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'my' ? myLeaves : teamLeaves).length > 0 ? (
                    (activeTab === 'my' ? myLeaves : teamLeaves).map((req) => {
                      const style = getStatusStyle(req.status);
                      
                      // Check reviewer capability
                      const canApproveL1 = req.status === 'Pending L1 Approval' && (isPM || isAdmin);
                      const canApproveL2 = req.status === 'Pending L2 (HR) Approval' && isAdmin;

                      return (
                        <tr 
                          key={req.id}
                          style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.005)' }}
                        >
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={req.avatar} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)' }} alt="" />
                              <div>
                                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem', display: 'block' }}>{req.userName}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {req.id}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: req.leaveType === 'Short Leave' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                              color: req.leaveType === 'Short Leave' ? '#60a5fa' : 'white',
                              border: req.leaveType === 'Short Leave' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                              {req.leaveType}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>
                            {req.duration}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                            {req.startDate === req.endDate ? req.startDate : `${req.startDate} to ${req.endDate}`}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              backgroundColor: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: style.text }} />
                              {style.label}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <button
                              onClick={() => setSelectedReqForTimeline(req)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text-dim)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              className="hover-glass"
                            >
                              <Eye size={12} /> Audit Trail ({req.workflowLogs.length})
                            </button>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            {activeTab === 'my' && (req.status === 'Pending L1 Approval' || req.status === 'Pending L2 (HR) Approval') && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleStartEdit(req)}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                  }}
                                  className="hover-glass"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleStartCancel(req)}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                  }}
                                  className="hover-glass"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {activeTab !== 'my' && canApproveL1 && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => approveL1(req.id, user?.name || 'Bavya Manager')}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                  }}
                                >
                                  L1 Approve
                                </button>
                                <button 
                                  onClick={() => rejectLeave(req.id, user?.name || 'Bavya Reviewer', 'Project Manager')}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {activeTab !== 'my' && canApproveL2 && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => approveL2(req.id, user?.name || 'HR Specialist')}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'var(--grad-primary)',
                                    color: 'black',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 800
                                  }}
                                >
                                  HR L2 Sign-off
                                </button>
                                <button 
                                  onClick={() => rejectLeave(req.id, user?.name || 'Bavya Reviewer', 'HR Manager')}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.75rem',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {((activeTab === 'my' && req.status !== 'Pending L1 Approval' && req.status !== 'Pending L2 (HR) Approval') || 
                              (activeTab !== 'my' && !canApproveL1 && !canApproveL2)) && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {req.status === 'Approved' ? '✅ Full Sign-off Completed' : 
                                 req.status === 'Rejected' ? '❌ Request Terminated' : 
                                 req.status === 'Cancelled' ? '↩️ Request Cancelled' : '🔒 Pending Vetting Stage'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <Inbox size={48} style={{ opacity: 0.15 }} />
                          <span>No leave requests logged in this category.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            
            /* Tab 3: Interactive Corporate Automated Email Terminal */
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <Mail size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Automated HR Outbox Console</h4>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  SMTP: bhspl.in | Active Dispatcher
                </span>
              </div>

              {emailLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {emailLogs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        padding: '1.25rem', 
                        borderRadius: '10px', 
                        border: '1px solid var(--border)', 
                        backgroundColor: 'rgba(10,10,12,0.85)',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--text-dim)' }}>
                        <div>
                          <strong style={{ color: 'var(--primary)' }}>TO:</strong> {log.to}
                        </div>
                        <div>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: 'white' }}>SUBJECT:</strong> {log.subject}
                      </div>

                      <div style={{ 
                        backgroundColor: 'rgba(0,0,0,0.2)', 
                        padding: '10px', 
                        borderRadius: '6px', 
                        color: '#60a5fa', 
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {log.body}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <Mail size={36} style={{ opacity: 0.15, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.8rem' }}>Outbox is currently idle. Submit or approve requests to trigger SMTP activities.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Audit Timeline Drawer Modal */}
      <AnimatePresence>
        {selectedReqForTimeline && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '540px',
                borderRadius: '24px',
                padding: '2.25rem',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(10, 10, 12, 0.96)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="var(--primary)" /> Request Audit Trail [{selectedReqForTimeline.id}]
                </h3>
                <button 
                  onClick={() => setSelectedReqForTimeline(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px dashed rgba(255,255,255,0.05)' }}>
                {selectedReqForTimeline.workflowLogs.map((log) => (
                  <div key={log.id} style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-31px', 
                      top: '2px', 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      backgroundColor: log.stage.includes('Approved') ? '#10b981' : log.stage.includes('Rejected') ? '#ef4444' : 'var(--primary)',
                      border: '3px solid #0a0a0c',
                      boxShadow: '0 0 8px rgba(255,255,255,0.05)'
                    }} />
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{log.stage}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Actioned By: <strong>{log.actorName}</strong> ({log.actorRole})
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#60a5fa', lineHeight: '1.4' }}>{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Leave Modal Form */}
      <AnimatePresence>
        {showApplyModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(10, 10, 12, 0.95)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={20} color="var(--primary)" /> {editingLeaveRequest ? 'Edit Leave Request Details' : 'Apply for Leave / Short Leave'}
              </h3>

              {formError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <span>{formError}</span>
                </motion.div>
              )}

              <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>LEAVE CATEGORY</label>
                  <select 
                     value={leaveType}
                     onChange={(e) => setLeaveType(e.target.value as any)}
                     className="search-input"
                     style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Casual Leave" style={{ backgroundColor: '#0a0a0c' }}>Casual Leave</option>
                    <option value="Sick Leave" style={{ backgroundColor: '#0a0a0c' }}>Sick Leave</option>
                    <option value="Full Day Leave" style={{ backgroundColor: '#0a0a0c' }}>Full Day Leave</option>
                    <option value="Short Leave" style={{ backgroundColor: '#0a0a0c' }}>Short Leave (Hourly)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                      {leaveType === 'Short Leave' ? 'LEAVE DATE' : 'START DATE'}
                    </label>
                    <input 
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch (err) {} }}
                      className="search-input"
                      style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', outline: 'none', cursor: 'pointer' }}
                    />
                  </div>

                  {leaveType !== 'Short Leave' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>END DATE</label>
                      <input 
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch (err) {} }}
                        className="search-input"
                        style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', outline: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>DURATION</label>
                      <select 
                        value={shortLeaveDuration}
                        onChange={(e) => setShortLeaveDuration(e.target.value)}
                        className="search-input"
                        style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="1 Hour" style={{ backgroundColor: '#0a0a0c' }}>1 Hour</option>
                        <option value="2 Hours" style={{ backgroundColor: '#0a0a0c' }}>2 Hours</option>
                        <option value="3 Hours" style={{ backgroundColor: '#0a0a0c' }}>3 Hours</option>
                        <option value="4 Hours" style={{ backgroundColor: '#0a0a0c' }}>4 Hours</option>
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>REASON / PURPOSE</label>
                  <textarea 
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide details about your leave request..."
                    className="search-input"
                    style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', outline: 'none', minHeight: '100px', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setEditingLeaveRequest(null);
                      setLeaveType('Casual Leave');
                      setStartDate('');
                      setEndDate('');
                      setShortLeaveDuration('2 Hours');
                      setReason('');
                    }}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'var(--primary)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {editingLeaveRequest ? 'Save Changes' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(10, 10, 12, 0.95)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Trash2 size={24} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Retract Leave Request?</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                Are you sure you want to cancel your leave request <strong>{cancelConfirmRequest.id}</strong>? This action will cancel the approval workflow.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => setCancelConfirmRequest(null)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
                >
                  No, Keep it
                </button>
                <button 
                  onClick={handleCancelConfirmSubmit}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaves;
