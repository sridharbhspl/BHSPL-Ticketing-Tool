import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Shield, ArrowLeft, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo_Bavya1.png.png';
import { authApi } from '../api/auth.api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Developer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: formData.role
      });
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1a1a1e, #0a0a0c)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Background Decorative Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'var(--primary)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ width: '100%', maxWidth: '450px', zIndex: 1 }}
      >
        <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', backgroundColor: 'rgba(15, 15, 18, 0.7)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '160px',
              height: '55px',
              margin: '0 auto 16px auto',
              overflow: 'hidden',
              borderRadius: '14px',
              backgroundColor: '#000',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(245,158,11,0.15)'
            }}>
              <img src={logoImg} alt="BavyaTicketingTool" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.6)' }} />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '8px' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the Bavya Ticketing Tool workspace</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Workspace Role</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 42px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    color: 'white', 
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Developer</option>
                  <option value="Frontend Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Frontend Developer</option>
                  <option value="Backend Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Backend Developer</option>
                  <option value="Fullstack Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Fullstack Developer</option>
                  <option value="Senior Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Senior Developer</option>
                  <option value="Junior Developer" style={{ backgroundColor: '#141416', color: 'white' }}>Junior Developer</option>
                  <option value="Senior Tester" style={{ backgroundColor: '#141416', color: 'white' }}>Senior QA Tester</option>
                  <option value="Junior Tester" style={{ backgroundColor: '#141416', color: 'white' }}>Junior QA Tester</option>
                  <option value="QA Tester" style={{ backgroundColor: '#141416', color: 'white' }}>QA Automation Engineer</option>
                  <option value="Project Manager" style={{ backgroundColor: '#141416', color: 'white' }}>Project Manager</option>
                  <option value="Client" style={{ backgroundColor: '#141416', color: 'white' }}>Client / Stakeholder</option>
                  <option value="Viewer" style={{ backgroundColor: '#141416', color: 'white' }}>Executive Viewer / Stakeholder</option>
                  <option value="Admin" style={{ backgroundColor: '#141416', color: 'white' }}>System Admin</option>
                </select>
                <div style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  pointerEvents: 'none', 
                  borderLeft: '5px solid transparent', 
                  borderRight: '5px solid transparent', 
                  borderTop: '5px solid var(--text-dim)' 
                }} />
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: '#000', fontWeight: 700, borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '10px' }}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </motion.button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
