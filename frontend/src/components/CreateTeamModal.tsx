import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Type, AlignLeft, FolderKanban, Check } from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Button from './common/Button';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, defaultProjectId }) => {
  const { addTeam, addTeamMember, projects, users } = useTicketStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; role: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    description: '',
    color: '#3b82f6'
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        projectId: defaultProjectId || '',
        description: '',
        color: '#3b82f6'
      });
      setSelectedUsers([]);
    }
  }, [isOpen, defaultProjectId]);

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Red', value: '#ef4444' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const createdTeam = await addTeam({
        name: formData.name,
        projectId: formData.projectId || undefined,
        description: formData.description,
        color: formData.color,
        icon: 'Users'
      });

      // Dynamically link selected members
      if (createdTeam && selectedUsers.length > 0) {
        await Promise.all(
          selectedUsers.map(su => 
            addTeamMember({
              teamId: createdTeam.id,
              userId: su.userId,
              role: su.role
            })
          )
        );
      }

      setFormData({ name: '', projectId: '', description: '', color: '#3b82f6' });
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
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
              maxHeight: '90vh',
              overflowY: 'auto',
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
                <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                  <Users size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Initialize New Team</h3>
              </div>
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                style={{ color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', background: 'none', border: 'none' }}
                className="hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Name</label>
                <div style={{ position: 'relative' }}>
                  <Type size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    type="text"
                    placeholder="e.g. Support Engineering"
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
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Associated Workspace Project</label>
                <div style={{ position: 'relative' }}>
                  <FolderKanban size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: '2.75rem', appearance: 'none', WebkitAppearance: 'none' }}
                    disabled={isSubmitting}
                  >
                    <option value="" style={{ backgroundColor: '#0a0b0d' }}>None - General / Leave Unassigned</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id} style={{ backgroundColor: '#0a0b0d' }}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mission Objective</label>
                <div style={{ position: 'relative' }}>
                  <AlignLeft size={16} style={{ position: 'absolute', left: '1rem', top: '1.125rem', color: 'var(--text-dim)' }} />
                  <textarea 
                    placeholder="Describe team responsibilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: '2.75rem', minHeight: '100px', resize: 'none' }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branding Identity</label>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign Team Members</label>
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {users.length > 0 ? (
                    users.map(u => {
                      const assignment = selectedUsers.find(su => su.userId === u.id);
                      const isChecked = !!assignment;
                      
                      return (
                        <div 
                          key={u.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: isChecked ? 'rgba(255,255,255,0.02)' : 'transparent',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isChecked ? 'rgba(255,255,255,0.08)' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => {
                            if (isChecked) {
                              setSelectedUsers(selectedUsers.filter(su => su.userId !== u.id));
                            } else {
                              setSelectedUsers([...selectedUsers, { userId: u.id, role: 'Member' }]);
                            }
                          }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: '2px solid',
                              borderColor: isChecked ? 'var(--primary)' : 'var(--text-dim)',
                              backgroundColor: isChecked ? 'var(--primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              transition: 'all 0.2s'
                            }}>
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  color: '#fff',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {u.name[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: isChecked ? '#fff' : 'var(--text-dim)', margin: 0 }}>{u.name}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{u.role}</p>
                              </div>
                            </div>
                          </div>
                          
                          {isChecked && (
                            <select
                              value={assignment.role}
                              onChange={(e) => {
                                setSelectedUsers(selectedUsers.map(su => su.userId === u.id ? { ...su, role: e.target.value } : su));
                              }}
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="Lead" style={{ backgroundColor: '#0a0b0d' }}>Lead</option>
                              <option value="Member" style={{ backgroundColor: '#0a0b0d' }}>Member</option>
                            </select>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', margin: '1rem 0' }}>No platform users available.</p>
                  )}
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
                  Initialize Team
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateTeamModal;
