// ============================================
// File: src/features/super-admin/pages/Dashboard.jsx
// Super Admin Layout - CLEAN VERSION (Logout only in user dropdown)
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import '../styles/super-admin.css';

const navigationItems = [
  { key: 'dashboard', label: 'System Control Center', icon: '🎛️', path: '/super-admin' },
  { key: 'module-control', label: 'Module Control', icon: '🔧', path: '/super-admin/module-control' },
  { key: 'user-management', label: 'User Management', icon: '👥', path: '/super-admin/user-management' },
  { key: 'game-configuration', label: 'Game Configuration', icon: '🎮', path: '/super-admin/game-configuration' },
  { key: 'sales-transactions', label: 'Sales & Transactions', icon: '💰', path: '/super-admin/sales-transactions' },
  { key: 'draw-management', label: 'Draw Management', icon: '🎲', path: '/super-admin/draw-management' },
  { key: 'escalations', label: 'Alerts & Escalations', icon: '🚨', path: '/super-admin/escalations', badge: 8 },
  { key: 'security-audit', label: 'Security & Audit', icon: '🛡️', path: '/super-admin/security-audit' },
];

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);
  
  // Auth hook
  const { logout, user: authUser } = useAuth();
  
  const [user] = useState({
    initials: authUser?.fullName?.split(' ').map(n => n[0]).join('') || 'SA',
    name: authUser?.fullName || 'Super Admin',
    role: 'System Controller'
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
    setShowUserMenu(false);
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
      if (e.key === 'Escape') {
        if (showUserMenu) {
          setShowUserMenu(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, showUserMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Logout handler
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
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
                <span className="sa-notification-badge">8</span>
              </button>

              {/* User Section with Dropdown - ONLY PLACE WITH LOGOUT */}
              <div className="sa-user-section" ref={userMenuRef}>
                <button 
                  className="sa-user"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="sa-user-avatar">
                    <span>{user.initials}</span>
                    <div className="sa-avatar-ring"></div>
                    <div className="sa-avatar-ring sa-avatar-ring-2"></div>
                  </div>
                  <div className="sa-user-info">
                    <div className="sa-user-name">{user.name}</div>
                    <div className="sa-user-role">{user.role}</div>
                  </div>
                  <span className="sa-dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
                </button>

                {/* Dropdown Menu - ONLY LOGOUT */}
                {showUserMenu && (
                  <div className="sa-user-dropdown">
                    <div className="sa-dropdown-header">
                      <div className="sa-dropdown-avatar">👑</div>
                      <div className="sa-dropdown-info">
                        <p className="sa-dropdown-name">{authUser?.fullName}</p>
                        <p className="sa-dropdown-email">{authUser?.email}</p>
                        <span className="sa-dropdown-role-badge">Super Admin</span>
                      </div>
                    </div>

                    <div className="sa-dropdown-divider"></div>

                    <button 
                      className="sa-dropdown-item sa-logout-item"
                      onClick={handleLogout}
                    >
                      <span className="sa-dropdown-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
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