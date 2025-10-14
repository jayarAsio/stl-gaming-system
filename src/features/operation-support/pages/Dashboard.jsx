// ============================================
// File: src/features/operation-support/pages/Dashboard.jsx
// Operation Support Dashboard Layout - Premium Design
// Matches Game Administrator structure with OS colors
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/operation-support.css';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/operation-support' },
  { key: 'ledger-management', label: 'Ledger Management', icon: '📚', path: '/operation-support/ledger-management' },
  { key: 'reconciliation', label: 'Reconciliation', icon: '⚖️', path: '/operation-support/reconciliation' },
  { key: 'discrepancy-handling', label: 'Discrepancy Handling', icon: '🔍', path: '/operation-support/discrepancy-handling' },
  { key: 'oversight', label: 'Oversight', icon: '👁️', path: '/operation-support/oversight' },
  { key: 'reports', label: 'Reports', icon: '📈', path: '/operation-support/reports' }
];

const OperationSupportLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const [user] = useState({
    initials: 'OS',
    name: 'Operations Staff',
    role: 'Operation Support Staff'
  });

  // Close sidebar and profile menu on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const isActivePath = (path) => {
    if (path === '/operation-support') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(prev => !prev);
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
  };

  return (
    <>
      <div className={`os-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Enhanced Mobile Menu Button */}
        <button
          className={`os-mobile-menu-btn ${sidebarOpen ? 'is-active' : ''}`}
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
          aria-controls="osSidebar"
        >
          <span className="os-menu-icon">
            <span className="os-menu-line os-menu-line-1"></span>
            <span className="os-menu-line os-menu-line-2"></span>
            <span className="os-menu-line os-menu-line-3"></span>
          </span>
          <span className="os-menu-text">{sidebarOpen ? 'Close' : 'Menu'}</span>
        </button>

        {/* Scrim/Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            className="os-scrim" 
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Enhanced Sidebar */}
        <aside 
          ref={sidebarRef}
          className={`os-sidebar ${sidebarOpen ? 'is-open' : ''}`}
          id="osSidebar" 
          aria-hidden={!sidebarOpen && window.innerWidth <= 768}
        >
          <div className="os-sidebar-header">
            <Link to="/operation-support" className="os-brand" onClick={handleNavClick}>
              <div className="os-brand-glow"></div>
              <span className="os-brand-text">Operation Support</span>
            </Link>
          </div>
          
          <nav className="os-nav" aria-label="Primary navigation">
            <ul className="os-nav-menu">
              {navigationItems.map((item) => (
                <li key={item.key} className="os-nav-item">
                  <Link
                    to={item.path}
                    className={`os-nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                    onClick={handleNavClick}
                  >
                    <span className="os-nav-icon">{item.icon}</span>
                    <span className="os-nav-label">{item.label}</span>
                    {isActivePath(item.path) && <span className="os-nav-indicator"></span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className="os-sidebar-footer">
            <div 
              ref={profileRef}
              className={`os-sidebar-profile ${profileMenuOpen ? 'menu-open' : ''}`}
              onClick={toggleProfileMenu}
              role="button"
              tabIndex={0}
              aria-expanded={profileMenuOpen}
              aria-label="User profile menu"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleProfileMenu();
                }
              }}
            >
              <div className="os-profile-main">
                <div className="os-profile-avatar">
                  <span>{user.initials}</span>
                  <div className="os-avatar-ring"></div>
                </div>
                <div className="os-profile-info">
                  <div className="os-profile-name">{user.name}</div>
                  <div className="os-profile-role">{user.role}</div>
                </div>
                <span className="os-profile-chevron">
                  {profileMenuOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="os-profile-menu">
                  <button className="os-profile-menu-item" onClick={(e) => {
                    e.stopPropagation();
                    console.log('Settings clicked');
                  }}>
                    <span className="os-profile-menu-icon">⚙️</span>
                    <span>Settings</span>
                  </button>
                  <button className="os-profile-menu-item" onClick={(e) => {
                    e.stopPropagation();
                    console.log('Profile clicked');
                  }}>
                    <span className="os-profile-menu-icon">👤</span>
                    <span>Profile</span>
                  </button>
                  <div className="os-profile-menu-divider"></div>
                  <button className="os-profile-menu-item danger" onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}>
                    <span className="os-profile-menu-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="os-main">
          <div className="os-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default OperationSupportLayout;