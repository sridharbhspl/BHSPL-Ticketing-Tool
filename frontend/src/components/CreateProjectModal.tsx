import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderKanban, Type, AlignLeft, Code } from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import Button from './common/Button';

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject } = useTicketStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#f59e0b'
  });

  const colors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setIsSubmitting(true);
    try {
      await addProject({
        id: formData.code.toLowerCase(),
        ...formData
      });
      setFormData({ name: '', code: '', description: '', color: '#f59e0b' });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
          zIndex: 1000,
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)'
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
              border: '1px solid var(--border)',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{
              padding: '1.75rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                  <FolderKanban size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Initialize New Project</h3>
              </div>
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                style={{ color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                className="hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Identity</label>
                  <div style={{ position: 'relative' }}>
                    <Type size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="text"
                      placeholder="e.g. Skyline Architecture"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '2.75rem' }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Short Code</label>
                  <div style={{ position: 'relative' }}>
                    <Code size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="text"
                      placeholder="SA"
                      maxLength={4}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="input-field"
                      style={{ paddingLeft: '2.75rem' }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mission Description</label>
                <div style={{ position: 'relative' }}>
                  <AlignLeft size={16} style={{ position: 'absolute', left: '1rem', top: '1.125rem', color: 'var(--text-dim)' }} />
                  <textarea 
                    placeholder="Briefly describe the project objectives..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: '2.75rem', minHeight: '100px', resize: 'none' }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visual Branding</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {colors.map(color => (
                    <motion.button
                      key={color.value}
                      type="button"
                      whileHover={!isSubmitting ? { scale: 1.1 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.9 } : {}}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      disabled={isSubmitting}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: color.value,
                        border: formData.color === color.value ? '3px solid white' : '3px solid transparent',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: formData.color === color.value ? `0 0 15px ${color.value}80` : 'none',
                        transition: 'border 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                >
                  Confirm Initialization
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
