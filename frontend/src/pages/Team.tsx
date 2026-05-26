import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Zap, 
  Mail, 
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateTeamModal from '../components/CreateTeamModal';
import EditTeamModal from '../components/EditTeamModal';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import type { Team as TeamType, User } from '../types';

const TeamCard = ({ user, tickets, subTasks, onEdit, onDelete }: any) => {
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [user.avatar]);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isDropdownOpen]);

  const userTickets = tickets.filter((t: any) => t.assigneeId === user.id);

  const hoursWorked = subTasks
    .filter((st: any) => st.assignedEngineerId === user.id)
    .reduce((sum: number, st: any) => sum + st.hoursWorked, 0);
    
  // Industry Experience: Mocking status for visual richness
  const statuses: ('Online' | 'Focused' | 'Away' | 'Offline')[] = ['Online', 'Focused', 'Away'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return (
    <motion.div 
      whileHover={{ 
        y: -4, 
        borderColor: 'var(--primary)',
        boxShadow: '0 12px 24px -10px rgba(245, 158, 11, 0.15), 0 0 1px 1px rgba(245, 158, 11, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="glass"
      style={{
        padding: '1.15rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.avatar && !avatarFailed ? (
              <img 
                src={user.avatar} 
                alt="" 
                onError={() => setAvatarFailed(true)}
                style={{ width: '48px', height: '48px', borderRadius: '12px', border: '2px solid var(--border)', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)',
                color: '#0a0a0c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.2rem',
                border: '2px solid var(--border)',
                boxShadow: '0 3px 8px rgba(245, 158, 11, 0.15)',
                textTransform: 'uppercase',
                userSelect: 'none'
              }}>
                {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ 
              position: 'absolute', 
              bottom: '-3px', 
              right: '-3px', 
              width: '11px', 
              height: '11px', 
              borderRadius: '50%', 
              backgroundColor: status === 'Online' ? 'var(--success)' : status === 'Focused' ? 'var(--primary)' : '#f59e0b',
              border: '2px solid #000'
            }} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0 }}>{user.name}</h4>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)', margin: 0 }}>{user.role}</p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
          >
            <MoreVertical size={16} />
          </button>
          
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: '#111827',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '6px',
              zIndex: 50,
              minWidth: '140px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                  setIsDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  width: '100%',
                  transition: 'background-color 0.2s'
                }}
                className="hover:bg-white/5"
              >
                Edit Member
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  width: '100%',
                  transition: 'background-color 0.2s'
                }}
                className="hover:bg-white/5"
              >
                Delete Member
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="stat-mini" style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px 0' }}>Capacity</p>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{userTickets.length}/5</p>
        </div>
        <div className="stat-mini" style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px 0' }}>Logged</p>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{hoursWorked}h</p>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.675rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-dim)' }}>Current Workload</span>
          <span style={{ color: userTickets.length > 3 ? '#ef4444' : 'var(--success)' }}>
            {userTickets.length > 3 ? 'High Load' : 'Optimal'}
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((userTickets.length / 5) * 100, 100)}%` }}
            style={{ height: '100%', backgroundColor: userTickets.length > 3 ? '#ef4444' : 'var(--primary)', borderRadius: '10px' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
        <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.725rem' }}>
          <Mail size={12} style={{ marginRight: '4px' }} />
          Ping
        </button>
        <button className="btn-secondary" style={{ padding: '0.5rem' }}>
          <ExternalLink size={12} />
        </button>
      </div>
    </motion.div>
  );
};

const ProjectTeamsCarousel = ({ section, teamMembers, tickets, setEditTeamData, setIsEditTeamOpen, setDeleteTeamId, setIsDeleteTeamConfirmOpen, activeTeamDropdownId, setActiveTeamDropdownId }: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -256, behavior: 'smooth' }); // 240px card + 16px gap
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 256, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-group" style={{ position: 'relative', width: '100%' }}>
      {/* Left Arrow Button */}
      <button 
        onClick={scrollLeft} 
        style={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(10, 10, 12, 0.85)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          color: section.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
        className="carousel-btn hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef} 
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '6px',
          margin: '0 -6px',
        }}
        className="hide-scrollbar"
      >
        {section.teams.map((t: any) => {
          const membersCount = teamMembers.filter((m: any) => m.teamId === t.id).length;
          const teamTickets = tickets.filter((tk: any) => tk.assignedTeam === t.name);
          const loadPercent = Math.min(Math.round((teamTickets.length / Math.max(membersCount * 5, 5)) * 100), 100);

          return (
            <motion.div 
              key={t.id} 
              whileHover={{ 
                y: -4, 
                borderColor: t.color,
                boxShadow: `0 12px 24px -10px ${t.color}25, 0 0 1px 1px ${t.color}40`,
                backgroundColor: 'rgba(255, 255, 255, 0.04)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="glass" 
              style={{
                flex: '0 0 240px',
                padding: '0.9rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: `${t.color}15`,
                    color: t.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 800, fontSize: '0.825rem', margin: 0 }}>{t.name}</h5>
                    <p style={{ fontSize: '0.675rem', color: 'var(--text-dim)', margin: 0 }}>
                      Group Code: <strong style={{ color: t.color }}>{t.name.split(' ').map((w: any) => w[0]).join('').toUpperCase()}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTeamDropdownId(activeTeamDropdownId === t.id ? null : t.id);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeTeamDropdownId === t.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: '#111827',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '6px',
                      zIndex: 50,
                      minWidth: '150px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTeamData(t);
                          setIsEditTeamOpen(true);
                          setActiveTeamDropdownId(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          width: '100%',
                          transition: 'background-color 0.2s'
                        }}
                        className="hover:bg-white/5"
                      >
                        Edit Team
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTeamId(t.id);
                          setIsDeleteTeamConfirmOpen(true);
                          setActiveTeamDropdownId(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          width: '100%',
                          transition: 'background-color 0.2s'
                        }}
                        className="hover:bg-white/5"
                      >
                        Delete Team
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', lineHeight: '1.4', margin: 0, height: '2.8em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || 'No objectives specified.'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '0.525rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px 0' }}>Members</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: t.color, margin: 0 }}>{membersCount} Assigned</p>
                </div>
                <div style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '0.525rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px 0' }}>Active Load</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>{teamTickets.length} Tickets</p>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.625rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-dim)' }}>Capacity Limit ({membersCount * 5 || 5} max)</span>
                  <span style={{ color: loadPercent > 80 ? '#ef4444' : 'var(--success)' }}>{loadPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ width: `${loadPercent}%`, height: '100%', backgroundColor: t.color, borderRadius: '20px' }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Arrow Button */}
      <button 
        onClick={scrollRight} 
        style={{
          position: 'absolute',
          right: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(10, 10, 12, 0.85)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          color: section.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
        className="carousel-btn hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const Team: React.FC = () => {
  const { users, tickets, subTasks, teams, projects, teamMembers, deleteTeam, deleteUser } = useTicketStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('q') || '';
  const activeFilter = searchParams.get('role') || 'All';

  // Modal & Dropdown States for Team
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editTeamData, setEditTeamData] = useState<TeamType | null>(null);
  const [isDeleteTeamConfirmOpen, setIsDeleteTeamConfirmOpen] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [activeTeamDropdownId, setActiveTeamDropdownId] = useState<string | null>(null);

  // Modal & Dropdown States for User
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -296, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 296, behavior: 'smooth' });
    }
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClose = () => {
      setActiveTeamDropdownId(null);
      setIsFilterDropdownOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const updateSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) prev.set('q', query);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const updateFilter = (role: string) => {
    setSearchParams(prev => {
      if (role !== 'All') prev.set('role', role);
      else prev.delete('role');
      return prev;
    }, { replace: true });
  };

  const handleDeleteTeamConfirm = async () => {
    if (deleteTeamId) {
      try {
        await deleteTeam(deleteTeamId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (deleteUserId) {
      try {
        await deleteUser(deleteUserId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const name = String(user.name || '').toLowerCase();
    const role = String(user.role || '').toLowerCase();
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = name.includes(normalizedQuery) || role.includes(normalizedQuery);
    const matchesFilter = activeFilter === 'All' || (user.role && user.role === activeFilter);
    return matchesSearch && matchesFilter;
  });

  const totalHours = subTasks.reduce((sum, st) => sum + st.hoursWorked, 0);
  const activeEngineers = filteredUsers.length; // Dynamic based on filters
  const avgEfficiency = 94; // Mock value

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Team Command Center</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Global workforce oversight and resource distribution metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Filter by name, role..." 
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              style={{ 
                padding: '12px 12px 12px 42px', 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                color: 'white',
                fontSize: '0.9rem',
                width: '240px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
              }}
              style={{ minWidth: '130px', justifyContent: 'center' }}
            >
              <Filter size={18} />
              {activeFilter === 'All' ? 'Role: All' : activeFilter}
            </button>
            
            {isFilterDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: '#111827',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '8px',
                zIndex: 60,
                minWidth: '220px',
                maxHeight: '320px',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <p style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '6px 12px 4px 12px'
                }}>
                  Select Operational Role
                </p>
                {[
                  'All', 
                  'Admin', 
                  'Project Manager', 
                  'Developer', 
                  'Frontend Developer', 
                  'Backend Developer', 
                  'Fullstack Developer', 
                  'Senior Developer', 
                  'Junior Developer', 
                  'Senior Tester', 
                  'Junior Tester', 
                  'QA Tester', 
                  'Client'
                ].map(r => {
                  const isSelected = activeFilter === r;
                  return (
                    <button
                      key={r}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFilter(r);
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'none',
                        border: 'none',
                        color: isSelected ? '#3b82f6' : '#fff',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        width: '100%',
                        transition: 'all 0.2s'
                      }}
                      className="hover:bg-white/5"
                    >
                      <span>{r === 'All' ? 'All Roles' : r}</span>
                      {isSelected && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateUserOpen(true)}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--success) 0%, #047857 100%)', border: 'none' }}
          >
            <Plus size={18} />
            Add Member
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateTeamOpen(true)}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            Initialize Team
          </motion.button>
        </div>
      </header>

      {/* Modals for team CRUD */}
      <CreateTeamModal 
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />

      <EditTeamModal 
        isOpen={isEditTeamOpen}
        onClose={() => {
          setIsEditTeamOpen(false);
          setEditTeamData(null);
        }}
        team={editTeamData}
      />

      <ConfirmationModal 
        isOpen={isDeleteTeamConfirmOpen}
        onClose={() => {
          setIsDeleteTeamConfirmOpen(false);
          setDeleteTeamId(null);
        }}
        onConfirm={handleDeleteTeamConfirm}
        title="Delete Team Workspace"
        message="Are you sure you want to permanently delete this team? This action will remove the team definition from all projects."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Modals for user CRUD */}
      <CreateUserModal 
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />

      <EditUserModal 
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          setEditUserData(null);
        }}
        user={editUserData}
      />

      <ConfirmationModal 
        isOpen={isDeleteUserConfirmOpen}
        onClose={() => {
          setIsDeleteUserConfirmOpen(false);
          setDeleteUserId(null);
        }}
        onConfirm={handleDeleteUserConfirm}
        title="Revoke Member Provisioning"
        message="Are you sure you want to permanently delete this user? All their ticket assignments and workspace statistics will be cleared."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        type="danger"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>
            <Activity size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Active Units</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activeEngineers} Engineers</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Clock size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Total Velocity</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{totalHours} Man-Hours</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Zap size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>SLA Health</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{avgEfficiency}% Efficiency</h3>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .carousel-group .carousel-btn {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-50%) scale(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .carousel-group:hover .carousel-btn {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(-50%) scale(1);
        }
        .carousel-btn:hover {
          background-color: rgba(245, 158, 11, 0.15) !important;
          border-color: rgba(245, 158, 11, 0.6) !important;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.35) !important;
        }
      `}</style>

      {filteredUsers.length > 0 ? (
        <div className="carousel-group" style={{ position: 'relative', width: '100%', marginBottom: '3rem' }}>
          {/* Left Arrow Button */}
          <button 
            onClick={scrollLeft} 
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(10, 10, 12, 0.85)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
            }}
            className="carousel-btn hover:scale-110"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable Row */}
          <div 
            ref={scrollRef} 
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              padding: '6px',
              margin: '0 -6px',
            }}
            className="hide-scrollbar"
          >
            {filteredUsers.map(user => (
              <div key={user.id} style={{ flex: '0 0 280px' }}>
                <TeamCard 
                  user={user} 
                  tickets={tickets} 
                  subTasks={subTasks} 
                  onEdit={(u: User) => {
                    setEditUserData(u);
                    setIsEditUserOpen(true);
                  }}
                  onDelete={(id: string) => {
                    setDeleteUserId(id);
                    setIsDeleteUserConfirmOpen(true);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={scrollRight} 
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(10, 10, 12, 0.85)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
            }}
            className="carousel-btn hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: 600 }}>No team members match your criteria.</p>
        </div>
      )}

      {/* Resource Planning & Heatmap upgrading to Collaborative Team Cards */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Workspace Teams heatmaps</h4>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Visualizing operational metrics and capacity distributions across collaborative teams.</p>
          </div>
          <button className="btn-secondary">Download Report</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Loop over all projects to render their teams, plus one for Global / Unassigned teams */}
          {(() => {
            const groupedSections = [
              ...projects.map(p => ({
                id: p.id,
                name: p.name,
                code: p.code,
                color: p.color || 'var(--primary)',
                description: p.description,
                teams: teams.filter(t => t.projectId === p.id)
              })),
              {
                id: 'global',
                name: 'Global / Unassigned Workspace',
                code: 'GLOBAL',
                color: '#6b7280',
                description: 'Cross-project global teams and general operational units.',
                teams: teams.filter(t => !t.projectId)
              }
            ].filter(section => section.teams.length > 0);

            if (groupedSections.length === 0) {
              return (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '20px' }}>
                  No active teams initialized. Click 'Initialize Team' to start.
                </div>
              );
            }

            return groupedSections.map(section => (
              <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Project Level Header and Stats Chart */}
                <div className="glass" style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  borderLeft: `4px solid ${section.color}`,
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: section.color,
                        backgroundColor: `${section.color}15`,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        {section.code}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{section.name}</h4>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {section.description || 'Enterprise workspace containing functional sub-teams.'}
                    </p>
                  </div>
                  
                  {/* Project-Level Team Load Charts */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Teams</span>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{section.teams.length} Active</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Project Velocity</span>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: section.color }}>
                        {section.teams.reduce((sum, t) => sum + teamMembers.filter(m => m.teamId === t.id).length, 0)} Members
                      </p>
                    </div>
                  </div>
                </div>

                {/* Carousel of Team Cards for this Project */}
                <ProjectTeamsCarousel 
                  section={section}
                  teamMembers={teamMembers}
                  tickets={tickets}
                  setEditTeamData={setEditTeamData}
                  setIsEditTeamOpen={setIsEditTeamOpen}
                  setDeleteTeamId={setDeleteTeamId}
                  setIsDeleteTeamConfirmOpen={setIsDeleteTeamConfirmOpen}
                  activeTeamDropdownId={activeTeamDropdownId}
                  setActiveTeamDropdownId={setActiveTeamDropdownId}
                />
              </div>
            ));
          })()}
        </div>
      </section>
    </div>
  );
};

export default Team;
