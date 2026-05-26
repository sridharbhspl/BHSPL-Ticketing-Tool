import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Kanban from './pages/Kanban';
import Team from './pages/Team';
import Chat from './pages/Chat';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsDrawer from './components/TicketDetailsDrawer';
import { useTicketStore } from './store/useTicketStore';
import { useAuthStore } from './store/useAuthStore';
import logoImg from './assets/logo_Bavya1.png.png';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import MyWorklogs from './pages/MyWorklogs';
import Timesheets from './pages/Timesheets';
import Leaves from './pages/Leaves';
import PayrollPortal from './pages/PayrollPortal';
import ServiceDeskPortal from './pages/ServiceDeskPortal';
import { useResponsive, applyCSSResponsiveVars } from './hooks/useResponsive';
import NotificationToast from './components/NotificationToast';

import { RoleGuard } from './components/RoleGuard';

const App: React.FC = () => {
  const { isCreateModalOpen, setCreateModalOpen, fetchInitialData } = useTicketStore();
  const { isAuthenticated, initialize } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  // ── Initialization: Restore session and load data ────────────────────────
  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  // ── Responsive hook: fires on every resize ──────────────────────────────
  const responsive = useResponsive();

  // Push computed layout values into CSS custom properties every render
  React.useLayoutEffect(() => {
    const effectiveResponsive = {
      ...responsive,
      sidebarWidth: responsive.isMobile
        ? 280
        : (responsive.isTablet || isSidebarCollapsed)
          ? 72
          : responsive.sidebarWidth,
      sidebarCollapsed: responsive.isTablet || isSidebarCollapsed
    };
    applyCSSResponsiveVars(effectiveResponsive);
  }, [responsive, isSidebarCollapsed]);

  // Close mobile sidebar when moving to tablet/desktop
  React.useEffect(() => {
    if (!responsive.isMobile) setIsMobileSidebarOpen(false);
  }, [responsive.isMobile]);

  // Toggle handler
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  // Determine sidebar CSS classes based on current breakpoint
  const sidebarClasses = [
    'sidebar glass custom-scrollbar',
    responsive.isMobile   ? 'hidden' : '',
    (responsive.isTablet || isSidebarCollapsed) ? 'collapsed' : '',
    isMobileSidebarOpen   ? 'open' : '',
  ].filter(Boolean).join(' ');

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-dark)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          {/* Subtle brand watermark */}
          <div style={{
            position: 'fixed',
            bottom: '-100px', right: '-100px',
            width: '600px', height: '600px',
            opacity: 0.03, pointerEvents: 'none', zIndex: 0,
            filter: 'grayscale(1) brightness(2)',
          }}>
            <img src={logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Mobile backdrop */}
          {responsive.isMobile && (
            <div
              className={`sidebar-backdrop ${isMobileSidebarOpen ? 'visible' : ''}`}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <Sidebar
            className={sidebarClasses}
            isCollapsed={responsive.isTablet || isSidebarCollapsed}
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            onToggleCollapse={toggleSidebar}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} responsive={responsive} />

            <main className="main-content">
              <Routes>
                <Route path="/"          element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <RoleGuard allowedRoles={['Admin', 'Project Manager', 'Senior Developer', 'Fullstack Developer']} moduleName="Dashboard">
                    <Dashboard />
                  </RoleGuard>
                } />
                <Route path="/tickets"   element={<Tickets />} />
                <Route path="/my-tickets"  element={<MyTickets />} />
                <Route path="/my-worklogs" element={<MyWorklogs />} />
                <Route path="/timesheets"  element={<Timesheets />} />
                <Route path="/leaves"      element={<Leaves />} />
                <Route path="/payroll"     element={<PayrollPortal />} />
                <Route path="/service-desk" element={<ServiceDeskPortal />} />
                <Route path="/board"     element={<Kanban />} />
                <Route path="/projects"  element={<Projects />} />
                <Route path="/team"      element={<Team />} />
                <Route path="/chat"      element={<Chat />} />
                <Route path="/profile"   element={<Profile />} />
                <Route path="/settings"  element={
                  <RoleGuard allowedRoles={['Admin', 'Project Manager', 'Senior Developer', 'Fullstack Developer']} moduleName="Settings">
                    <Settings />
                  </RoleGuard>
                } />
                <Route path="*"          element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>

          <CreateTicketModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
          />
          <TicketDetailsDrawer />
          <NotificationToast />
        </div>
      )}
    </Router>
  );
};

export default App;
