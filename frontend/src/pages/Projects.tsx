import React from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  MoreHorizontal, 
  Users, 
  BarChart3, 
  Plus
} from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import Breadcrumbs from '../components/Breadcrumbs';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import CreateTeamModal from '../components/CreateTeamModal';
import type { Project } from '../types';

const Projects: React.FC = () => {
  const { projects, tickets, teams, deleteProject } = useTicketStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Dropdown & Edit & Delete States
  const [activeDropdownId, setActiveDropdownId] = React.useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editProjectData, setEditProjectData] = React.useState<Project | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [deleteProjectId, setDeleteProjectId] = React.useState<string | null>(null);

  // Add Team directly from Project Level states
  const [isCreateTeamOpen, setIsCreateTeamOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(undefined);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClose = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleDeleteConfirm = async () => {
    if (deleteProjectId) {
      try {
        await deleteProject(deleteProjectId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <Breadcrumbs />
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workspace Units</h2>
          <p style={{ color: 'var(--text-dim)' }}>Manage your workspace projects and their progress metrics.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Initialize Project
        </motion.button>
      </header>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditProjectData(null);
        }}
        project={editProjectData}
      />

      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteProjectId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Workspace"
        message="Are you sure you want to permanently delete this project workspace? This will also remove all associated tickets and members."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        type="danger"
      />

      <CreateTeamModal 
        isOpen={isCreateTeamOpen}
        onClose={() => {
          setIsCreateTeamOpen(false);
          setSelectedProjectId(undefined);
        }}
        defaultProjectId={selectedProjectId}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {projects.map((project) => {
          const projectTickets = tickets.filter(t => t.projectId === project.id);
          const projectTeams = teams.filter(t => t.projectId === project.id);
          const resolvedCount = projectTickets.filter(t => t.status === 'Resolved').length;
          const progress = projectTickets.length > 0 ? (resolvedCount / projectTickets.length) * 100 : 0;

          return (
            <motion.div
              key={project.id}
              whileHover={{ y: -5 }}
              className="glass"
              style={{
                padding: '1.5rem',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: `${project.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: project.color
                }}>
                  <FolderKanban size={24} />
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === project.id ? null : project.id);
                    }}
                    style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {activeDropdownId === project.id && (
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
                          setEditProjectData(project);
                          setIsEditModalOpen(true);
                          setActiveDropdownId(null);
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
                        Edit Project
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(project.id);
                          setIsCreateTeamOpen(true);
                          setActiveDropdownId(null);
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
                        Add Team
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteProjectId(project.id);
                          setIsDeleteConfirmOpen(true);
                          setActiveDropdownId(null);
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
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, padding: '2px 6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>{project.code}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>{project.description}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Progress</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: '100%', backgroundColor: project.color, borderRadius: '10px' }} 
                  />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                    <BarChart3 size={14} />
                    <span>{projectTickets.length} Tickets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                    <Users size={14} />
                    <span>{projectTeams.length} {projectTeams.length === 1 ? 'Team' : 'Teams'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {[1, 2, 3].map(i => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/150?u=${project.id}${i}`} 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        border: '2px solid var(--bg-dark)',
                        marginLeft: i > 1 ? '-8px' : 0
                      }} 
                      alt="" 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
