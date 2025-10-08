// ============================================
// File: src/features/game-administrator/pages/Dashboard.jsx
// Updated: Profile in sidebar, no header
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/game-administrator.css';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/game-administrator' },
  { key: 'configuration', label: 'Configuration', icon: '⚙️', path: '/game-administrator/configuration' },
  { key: 'user-management', label: 'User Management', icon: '👥', path: '/game-administrator/user-management' },
  { key: 'daily-operations', label: 'Daily Operations', icon: '📋', path: '/game-administrator/daily-operations' },
  { key: 'draw-management', label: 'Draw Management', icon: '🎲', path: '/game-administrator/draw-management' },
  { key: 'enforcement', label: 'Enforcement', icon: '🛡️', path: '/game-administrator/enforcement' },
  { key: 'reports', label: 'Reports', icon: '📈', path: '/game-administrator/reports' }
];

const GameAdministratorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  
  const [user] = useState({
    initials: 'GA',
    name: 'Game Admin',
    role: 'Game Administrator'
  });

  // Close profile menu on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent body scroll when sidebar open
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

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (profileMenuOpen) {
          setProfileMenuOpen(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, profileMenuOpen]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  const isActivePath = (path) => {
    if (path === '/game-administrator') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: redirect to login page
    // window.location.href = '/login';
  };

  return (
    <>
      <div className={`ga-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Enhanced Sidebar */}
        <aside className="ga-sidebar" id="gaSidebar" aria-hidden={!sidebarOpen}>
          <div className="ga-sidebar-header">
            <Link to="/game-administrator" className="ga-brand">
              <div className="ga-brand-glow"></div>
              <span className="ga-brand-text">Game Administrator</span>
            </Link>
          </div>
          
          <nav className="ga-nav" aria-label="Primary">
            <ul className="ga-nav-menu">
              {navigationItems.map((item) => (
                <li key={item.key} className="ga-nav-item">
                  <Link
                    to={item.path}
                    className={`ga-nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                  >
                    <span className="ga-nav-icon">{item.icon}</span>
                    <span className="ga-nav-label">{item.label}</span>
                    {isActivePath(item.path) && <span className="ga-nav-indicator"></span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className="ga-sidebar-footer">
            <div 
              ref={profileRef}
              className={`ga-sidebar-profile ${profileMenuOpen ? 'menu-open' : ''}`}
              onClick={toggleProfileMenu}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleProfileMenu();
                }
              }}
            >
              <div className="ga-profile-main">
                <div className="ga-profile-avatar">
                  <span>{user.initials}</span>
                  <div className="ga-avatar-ring"></div>
                </div>
                <div className="ga-profile-info">
                  <div className="ga-profile-name">{user.name}</div>
                  <div className="ga-profile-role">{user.role}</div>
                </div>
                <span className="ga-profile-chevron">
                  {profileMenuOpen ? '▲' : '▼'}
                </span>
              </div>
              
              {/* Logout Menu */}
              {profileMenuOpen && (
                <div className="ga-profile-menu">
                  <button 
                    className="ga-profile-menu-item ga-logout-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    <span className="ga-logout-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ga-main" id="gaMain">
          {/* Mobile Menu Button */}
          <button
            className="ga-mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            aria-controls="gaSidebar"
          >
            <span className="ga-menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <section className="ga-content" role="region">
            <Outlet />
          </section>
        </main>
      </div>

      {/* Scrim */}
      {sidebarOpen && (
        <div
          className="ga-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default GameAdministratorLayout;