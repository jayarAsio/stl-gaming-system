// ============================================
// File: src/features/operation-support/pages/Dashboard.jsx
// Operation Support Dashboard Layout - Exact GA Structure
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/operation-support.css';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/operation-support' },
  { key: 'balances', label: 'Balances', icon: '💰', path: '/operation-support/balances' },
  { key: 'daily-ledgers', label: 'Daily Ledgers', icon: '📋', path: '/operation-support/daily-ledgers' },
  { key: 'reports', label: 'Reports', icon: '📈', path: '/operation-support/reports' }
];

const OperationSupportLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const [user] = useState({
    initials: 'OS',
    name: 'Operations Staff',
    role: 'Operation Support Staff'
  });

  // Auto-hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const isActivePath = (path) => {
    if (path === '/operation-support') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(prev => !prev);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/operation-support') return 'Dashboard';
    if (path.includes('balances')) return 'Balances';
    if (path.includes('daily-ledgers')) return 'Daily Ledgers';
    if (path.includes('reports')) return 'Reports';
    return 'Operation Support';
  };

  return (
    <div className={`os-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Auto-hide Header - Only visible when sidebar is CLOSED */}
      {!sidebarOpen && (
        <header className={`os-header ${headerVisible ? 'os-header-visible' : 'os-header-hidden'}`}>
          <div className="os-header-container">
            <button 
              className="os-header-menu-btn"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <span className="os-hamburger-line"></span>
              <span className="os-hamburger-line"></span>
              <span className="os-hamburger-line"></span>
            </button>

            <div className="os-header-content">
              <h1 className="os-header-title">{getPageTitle()}</h1>
              <p className="os-header-subtitle">Operation Support</p>
            </div>
          </div>
        </header>
      )}

      {/* Scrim/Backdrop */}
      {sidebarOpen && (
        <div 
          className="os-scrim" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
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
            
            {profileMenuOpen && (
              <div className="os-profile-menu">
                <Link to="/" className="os-profile-menu-item logout">
                  <span>🚪</span>
                  <span>Logout</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="os-main">
        <Outlet />
      </main>
    </div>
  );
};

export default OperationSupportLayout;