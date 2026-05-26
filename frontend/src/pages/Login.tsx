import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo_Bavya1.png.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('remembered-email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered-email'));
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically trigger database seeding of testing users in bavyadb
    fetch('http://127.0.0.1:8000/api/auth/seed-test-users/')
      .then(res => res.json())
      .then(data => {
        console.log('🌱 [SEEDING] Test users seeded successfully in bavyadb:', data);
      })
      .catch(err => {
        console.warn('⚠️ [SEEDING] Seeding fetch warning:', err);
      });
  }, []);

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /^[a-zA-Z0-9._-]+$/.test(email); // Allow email or employee ID
  };

  // Validate inputs before submission
  const validateInputs = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email or Employee ID is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email or employee ID';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 [LOGIN] Form submitted with email:', email);
    
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate before submitting
    if (!validateInputs()) {
      console.log('⚠️ [LOGIN] Validation failed');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 [LOGIN] Calling login function...');
      await login(email, password);
      console.log('✅ [LOGIN] Login succeeded, showing success message...');

      // ── Remember Me: persist email + set 30-day token expiry marker ──
      if (rememberMe) {
        localStorage.setItem('remembered-email', email);
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        localStorage.setItem('remember-me-expiry', String(expiry));
      } else {
        localStorage.removeItem('remembered-email');
        localStorage.removeItem('remember-me-expiry');
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        console.log('🚀 [LOGIN] Navigating to dashboard...');
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      const errorMessage = err?.message || 'Invalid credentials. Please try again.';
      console.error('❌ [LOGIN] Login failed:', errorMessage);
      
      // Provide specific error messages
      if (errorMessage.includes('Invalid email') || errorMessage.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check and try again.');
      } else if (errorMessage.includes('Session expired')) {
        setError('Session expired. Please log in again.');
      } else {
        setError(errorMessage);
      }

      console.error('Login error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear validation error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
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
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'var(--primary)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'var(--accent)',
          filter: 'blur(150px)',
          borderRadius: '50%',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          zIndex: 1
        }}
      >
        <div className="glass" style={{
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          backgroundColor: 'rgba(15, 15, 18, 0.7)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '180px',
              height: '65px',
              margin: '0 auto 16px auto',
              overflow: 'hidden',
              borderRadius: '16px',
              backgroundColor: '#000',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 35px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.2)'
            }}>
              <motion.img 
                src={logoImg} 
                alt="BavyaTicketingTool" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.6)' }}
                whileHover={{ scale: 2.8 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Sign in to manage your tickets and projects
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginLeft: '4px' }}>
                Mail ID or Employee ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Enter your Mail ID or Employee ID"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: validationErrors.email ? '1.5px solid #ef4444' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  className="search-input"
                />
              </div>
              {validationErrors.email && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '4px' }}>
                  ⚠ {validationErrors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginLeft: '4px' }}>
                  Password
                </label>
                <a href="#" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: validationErrors.password ? '1.5px solid #ef4444' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  className="search-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '4px' }}>
                  ⚠ {validationErrors.password}
                </span>
              )}
            </div>

            {/* Remember Me — fully interactive custom checkbox */}
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: 'fit-content', userSelect: 'none' }}
              onClick={() => setRememberMe(p => !p)}
            >
              <motion.div
                animate={{
                  backgroundColor: rememberMe ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  borderColor: rememberMe ? 'var(--primary)' : 'var(--border)',
                  scale: rememberMe ? [1, 0.88, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  border: '1.5px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: rememberMe ? '0 0 10px rgba(245,158,11,0.35)' : 'none',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {rememberMe && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.15 }}
                    width="11" height="9" viewBox="0 0 11 9" fill="none"
                  >
                    <path d="M1 4L4 7.5L10 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </motion.div>
              <span style={{ color: rememberMe ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.85rem', transition: 'color 0.2s' }}>
                Remember for 30 days
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#ef4444', fontSize: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#10b981', fontSize: '0.85rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <CheckCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading || Object.keys(validationErrors).length > 0}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: Object.keys(validationErrors).length > 0 ? '#6b7280' : 'var(--primary)',
                color: '#000',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                cursor: isLoading || Object.keys(validationErrors).length > 0 ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                border: 'none',
              }}
            >
              {isLoading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>


          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register Now</Link>
          </p>
        </div>
      </motion.div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
