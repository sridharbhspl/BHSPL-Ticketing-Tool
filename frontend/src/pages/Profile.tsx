import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Activity,
  Edit3,
  KeyRound
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import Breadcrumbs from '../components/Breadcrumbs';
import Button from '../components/common/Button';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets } = useTicketStore();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isChangePwdOpen, setIsChangePwdOpen] = React.useState(false);

  const userTickets = tickets.filter(t => t.assigneeId === user?.id);
  const resolvedCount = userTickets.filter(t => t.status === 'Resolved').length;
  const progressPercent = userTickets.length > 0 ? Math.round((resolvedCount / userTickets.length) * 100) : 0;

  const stats = [
    { label: 'Tasks Resolved', value: resolvedCount, icon: CheckCircle2, color: '#10b981' },
    { label: 'Active Sprints', value: 3, icon: Activity, color: '#f59e0b' },
    { label: 'Avg. Completion', value: '2.4d', icon: Clock, color: '#ea580c' },
  ];

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <Breadcrumbs />

      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={user?.avatar}
              alt={user?.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                objectFit: 'cover',
                border: '4px solid var(--border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              backgroundColor: 'var(--success)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '4px solid var(--bg-dark)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'white'
            }}>
              ONLINE
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} /> {user?.role.toUpperCase()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> HQ - Bavya Ticketing Tool</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Joined May 2024</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsChangePwdOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 16px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <KeyRound size={16} /> Change Password
          </motion.button>
          <Button
            variant="secondary"
            leftIcon={<Edit3 size={18} />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white' }}>Contact Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', color: 'var(--text-dim)' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', color: 'var(--text-dim)' }}>
                  <User size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Full Name</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white' }}>Efficiency Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Workload Capacity</span>
                  <span style={{ fontWeight: 700 }}>{progressPercent}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    style={{ height: '100%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Performance & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass"
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  borderRadius: '24px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ padding: '10px', width: 'fit-content', borderRadius: '12px', backgroundColor: `${stat.color}10`, color: stat.color }}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <section className="glass" style={{ flex: 1, padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Assigned Stream Performance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userTickets.slice(0, 4).map(ticket => (
                <div key={ticket.id} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ticket.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ticket.id} • Active</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-dim)'
                  }}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
              ))}
              {userTickets.length === 0 && (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No active tickets assigned to you.</p>
              )}
            </div>
          </section>
        </div>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePwdOpen}
        onClose={() => setIsChangePwdOpen(false)}
      />
    </div>
  );
};

export default Profile;
