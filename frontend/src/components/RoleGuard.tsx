import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useRBACStore } from '../store/useRBACStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  moduleName: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, moduleName }) => {
  const navigate = useNavigate();
  const { user, simulatedRole, setSimulatedRole } = useAuthStore();
  const { hasModuleAccess } = useRBACStore();
  const currentRole = simulatedRole || user?.role || 'Developer';
  
  const hasAccess = hasModuleAccess(currentRole, moduleName.toLowerCase());

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleElevate = () => {
    // Elevate to Admin temporarily for testing
    setSimulatedRole('Admin');
  };

  const systemRoles = ['Admin', 'Project Manager', 'Senior Developer', 'Fullstack Developer', 'Developer', 'QA Tester', 'Client'];
  const dynamicAllowedRoles = systemRoles.filter(role => hasModuleAccess(role, moduleName.toLowerCase()));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--header-height))',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow decorative items */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem',
          borderRadius: '24px',
          backgroundColor: 'rgba(15, 15, 18, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          zIndex: 1
        }}
      >
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: 'var(--primary)',
          boxShadow: '0 0 25px rgba(245,158,11,0.1)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <h2 className="gradient-text" style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Clearance Level Required
        </h2>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          The <strong style={{ color: 'white' }}>{moduleName}</strong> module contains sensitive operational summaries and backend parameters. Your current clearance tier is <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentRole}</span>.
        </p>

        {/* Requirements summary */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.75rem' }}>
            Authorized Clearances
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dynamicAllowedRoles.map(role => (
              <div
                key={role}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.12)',
                  fontSize: '0.8rem',
                  color: '#fbbf24',
                  fontWeight: 600
                }}
              >
                <KeyRound size={12} />
                {role}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons / Simulation Trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleElevate}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)'
            }}
          >
            <KeyRound size={16} />
            Simulate Admin Clearance
          </button>

          <button
            onClick={() => navigate('/tickets')}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={16} />
            Return to Ticketing
          </button>
        </div>
      </motion.div>
    </div>
  );
};
