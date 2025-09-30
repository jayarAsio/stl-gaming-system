// ============================================
// File: src/features/super-admin/pages/Dashboard.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/super-admin.css';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/super-admin' },
  { key: 'draw-management', label: 'Draw Management', icon: '🎲', path: '/super-admin/draw-management' },
  { key: 'results-winners', label: 'Results & Winners', icon: '🏆', path: '/super-admin/results-winners' },
  { key: 'sales-analytics', label: 'Sales Analytics', icon: '📈', path: '/super-admin/sales-analytics' },
  { key: 'user-management', label: 'User Management', icon: '👥', path: '/super-admin/user-management' },
  { key: 'escalations', label: 'Escalations', icon: '⚠️', path: '/super-admin/escalations', badge: 3 },
  { key: 'security-audit', label: 'Security & Audit', icon: '🛡️', path: '/super-admin/security-audit' },
  { key: 'system-settings', label: 'System Settings', icon: '⚙️', path: '/super-admin/system-settings' }
];

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  
  const [user] = useState({
    initials: 'SA',
    name: 'Super Admin',
    role: 'Full Access'
  });

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const isActivePath = (path) => {
    if (path === '/super-admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="sa-wrapper">
      {/* Animated Background */}
      <div className="sa-bg-animation">
        <div className="sa-bg-blob sa-bg-blob-1"></div>
        <div className="sa-bg-blob sa-bg-blob-2"></div>
        <div className="sa-bg-blob sa-bg-blob-3"></div>
      </div>

      {/* Main Container */}
      <div className="sa-container">
        {/* Header */}
        <header className="sa-header">
          <div className="sa-header-content">
            <div className="sa-header-left">
              <button
                className="sa-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              
              <h1 className="sa-header-title">Super Admin</h1>
            </div>

            <div className="sa-header-right">
              <div className="sa-status-live">
                <span className="sa-status-dot"></span>
                <span>LIVE</span>
              </div>

              <div className="sa-clock">
                <div className="sa-clock-time">{formatTime(currentTime)}</div>
                <div className="sa-clock-label">Manila Time</div>
              </div>

              <button className="sa-notification-btn">
                <span>🔔</span>
                <span className="sa-notification-badge">5</span>
              </button>

              <div className="sa-user">
                <div className="sa-user-avatar">
                  <span>{user.initials}</span>
                  <div className="sa-avatar-ring"></div>
                  <div className="sa-avatar-ring sa-avatar-ring-2"></div>
                </div>
                <div className="sa-user-info">
                  <div className="sa-user-name">{user.name}</div>
                  <div className="sa-user-role">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Layout Wrapper */}
        <div className="sa-layout">
          {/* Sidebar */}
          <aside className={`sa-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
            <div className="sa-sidebar-header">
              <h2 className="sa-sidebar-title">Super Admin</h2>
            </div>
            
            <nav className="sa-nav">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`sa-nav-link ${isActivePath(item.path) ? 'is-active' : ''}`}
                >
                  <span className="sa-nav-icon">{item.icon}</span>
                  <span className="sa-nav-label">{item.label}</span>
                  {item.badge && <span className="sa-nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="sa-main">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Overlay/Scrim */}
      {sidebarOpen && (
        <div
          className="sa-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminLayout;