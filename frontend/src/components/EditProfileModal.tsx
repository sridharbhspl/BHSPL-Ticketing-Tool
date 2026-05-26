import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Button from './common/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  // Sync state when modal opens to ensure we have latest industry data
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      });
      setError(null);
      setUploadProgress(0);
    }
  }, [isOpen, user]);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file protocol.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Identity package exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Industrial-grade progress simulation
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    
    try {
      await updateProfile(formData);
      // Dynamically import and refresh the ticket store's user list to update the Team and Sidebar views instantly
      const { useTicketStore } = await import('../store/useTicketStore');
      await useTicketStore.getState().fetchInitialData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to deploy changes to identity registry.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: `https://ui-avatars.com/api/?name=${formData.name}&background=random` });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(12px)'
            }}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-dark)',
              border: dragActive ? '2px dashed var(--primary)' : '1px solid var(--border)',
              borderRadius: '32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.7)',
              transition: 'all 0.2s'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Identity Configuration</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Manage your professional profile data.</p>
              </div>
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                style={{ color: 'var(--text-dim)', padding: '8px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                className="hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    border: '4px solid var(--border)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    position: 'relative'
                  }} onClick={() => fileInputRef.current?.click()}>
                    <img 
                      src={formData.avatar} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: dragActive ? 1 : 0,
                      transition: 'opacity 0.2s',
                      gap: '8px',
                      color: 'white',
                      pointerEvents: 'none'
                    }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>UPDATE</span>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={removeAvatar}
                    disabled={isSubmitting}
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      right: '-10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      width: '44px',
                      height: '44px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid var(--bg-dark)',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Identity Image</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    Drag and drop or click to upload. <br />
                    Supported: JPG, PNG. Max 2MB.
                  </p>
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="small" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isSubmitting}
                  >
                    Select New File
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {error}
                </motion.div>
              )}

              {uploadProgress > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                    <span>ENCRYPTING IDENTITY</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${uploadProgress}%`, boxShadow: '0 0 10px var(--primary-glow)' }} 
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Identity Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '2.75rem' }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Communication Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '2.75rem' }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <Button 
                  type="button" 
                  onClick={onClose}
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  leftIcon={<Upload size={18} />}
                >
                  {isSubmitting ? 'Saving...' : 'Deploy Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
