// ============================================
// File: src/features/game-administrator/pages/Dashboard.jsx
// Auto-hiding header on scroll
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

const pageTitles = {
  '/game-administrator': 'Game Dashboard',
  '/game-administrator/configuration': 'System Configuration',
  '/game-administrator/user-management': 'User Management',
  '/game-administrator/daily-operations': 'Daily Operations',
  '/game-administrator/draw-management': 'Draw Management',
  '/game-administrator/enforcement': 'Enforcement & Security',
  '/game-administrator/reports': 'Reports & Analytics'
};

const GameAdministratorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const location = useLocation();
  
  const [user] = useState({
    initials: 'GA',
    name: 'Game Admin',
    role: 'Game Administrator'
  });

  const currentTitle = pageTitles[location.pathname] || 'Game Dashboard';
  
  // Scroll tracking refs
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
          const scrollThreshold = 10; // Minimum scroll distance to trigger
          
          // Don't hide if near top
          if (currentScrollY < 80) {
            setHeaderVisible(true);
          } 
          // Scrolling down - hide header
          else if (currentScrollY > lastScrollY.current + scrollThreshold) {
            setHeaderVisible(false);
          } 
          // Scrolling up - show header
          else if (currentScrollY < lastScrollY.current - scrollThreshold) {
            setHeaderVisible(true);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset header visibility on route change
  useEffect(() => {
    setSidebarOpen(false);
    setHeaderVisible(true);
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
    if (path === '/game-administrator') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
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

          <div className="ga-sidebar-footer">
            <div className="ga-status-indicator">
              <div className="ga-status-dot"></div>
              <span className="ga-status-text">System Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ga-main" id="gaMain">
          <header 
            className={`ga-header ${headerVisible ? 'ga-header-visible' : 'ga-header-hidden'}`}
            role="banner"
          >
            <div className="ga-header-inner">
              <div className="ga-header-left">
                <button
                  className="ga-menu-btn"
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
                <h1 className="ga-header-title" tabIndex="-1">
                  {currentTitle}
                </h1>
              </div>
              
              <div className="ga-header-right">
                <button className="ga-notification-btn" aria-label="Notifications">
                  <span className="ga-notification-icon">🔔</span>
                  <span className="ga-notification-badge">3</span>
                </button>
                
                <div className="ga-user-profile" aria-label="Current user">
                  <div className="ga-user-avatar">
                    <span>{user.initials}</span>
                    <div className="ga-avatar-ring"></div>
                  </div>
                  <div className="ga-user-info">
                    <div className="ga-user-name">{user.name}</div>
                    <div className="ga-user-role">{user.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="ga-content" role="region" aria-labelledby="pageTitle">
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