import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Get authentication context
  const { user: authUser, logout, isAuthenticated, loading } = useAuth();

  // Derive user display info from auth context
  const user = authUser ? {
    initials: authUser.fullName?.split(' ').map(n => n[0]).join('') || 'GA',
    name: authUser.fullName || 'Game Admin',
    role: authUser.role === 'game-administrator' ? 'Game Administrator' : authUser.role,
    email: authUser.email
  } : {
    initials: 'GA',
    name: 'Game Admin',
    role: 'Game Administrator'
  };

  // Check authentication on mount
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Handle logout
  const handleLogout = async () => {
    if (loggingOut) return;
    
    try {
      setLoggingOut(true);
      setProfileMenuOpen(false);
      await logout();
      // Navigation is handled by AuthContext after logout
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  // Auto-hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
    if (path === '/game-administrator') {
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
    if (path === '/game-administrator') return 'Dashboard';
    if (path.includes('configuration')) return 'Configuration';
    if (path.includes('user-management')) return 'User Management';
    if (path.includes('daily-operations')) return 'Daily Operations';
    if (path.includes('draw-management')) return 'Draw Management';
    if (path.includes('enforcement')) return 'Enforcement';
    if (path.includes('reports')) return 'Reports';
    return 'Game Administrator';
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className={`ga-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Auto-hide Header - Only visible when sidebar is CLOSED */}
      {!sidebarOpen && (
        <header className={`ga-header ${headerVisible ? 'ga-header-visible' : 'ga-header-hidden'}`}>
          <div className="ga-header-container">
            <button 
              className="ga-header-menu-btn"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <span className="ga-hamburger-line"></span>
              <span className="ga-hamburger-line"></span>
              <span className="ga-hamburger-line"></span>
            </button>

            <div className="ga-header-content">
              <h1 className="ga-header-title">{getPageTitle()}</h1>
              <p className="ga-header-subtitle">Game Administrator</p>
            </div>
          </div>
        </header>
      )}

      {/* Scrim/Backdrop */}
      {sidebarOpen && (
        <div 
          className="ga-scrim" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`ga-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        id="gaSidebar" 
        aria-hidden={!sidebarOpen && window.innerWidth <= 768}
      >
        <div className="ga-sidebar-header">
          <Link to="/game-administrator" className="ga-brand" onClick={handleNavClick}>
            <div className="ga-brand-glow"></div>
            <span className="ga-brand-text">Game Administrator</span>
          </Link>
        </div>
        
        <nav className="ga-nav" aria-label="Primary navigation">
          <ul className="ga-nav-menu">
            {navigationItems.map((item) => (
              <li key={item.key} className="ga-nav-item">
                <Link
                  to={item.path}
                  className={`ga-nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                  aria-current={isActivePath(item.path) ? 'page' : undefined}
                  onClick={handleNavClick}
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
          <div 
            ref={profileRef}
            className={`ga-sidebar-profile ${profileMenuOpen ? 'menu-open' : ''}`}
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
            
            {profileMenuOpen && (
              <div className="ga-profile-menu">
                <button 
                  onClick={handleLogout} 
                  className="ga-profile-menu-item logout"
                  disabled={loggingOut}
                  type="button"
                >
                  <span>🚪</span>
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="ga-main">
        <Outlet />
      </main>
    </div>
  );
};

export default GameAdministratorLayout;