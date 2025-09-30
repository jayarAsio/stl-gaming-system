import React, { useState, useEffect } from 'react';
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

const pageTitles = {
  '/operation-support': 'Operations Dashboard',
  '/operation-support/ledger-management': 'Ledger Management',
  '/operation-support/reconciliation': 'Daily Reconciliation',
  '/operation-support/discrepancy-handling': 'Discrepancy Handling',
  '/operation-support/oversight': 'Operations Oversight',
  '/operation-support/reports': 'Operations Reports'
};

const OperationSupport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const [user] = useState({
    initials: 'OS',
    name: 'Operations Staff',
    role: 'Operation Support Staff'
  });

  const currentTitle = pageTitles[location.pathname] || 'Operations Dashboard';

  useEffect(() => {
    setSidebarOpen(false);
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
    if (path === '/operation-support') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <>
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="sidebar" id="sidebar" aria-hidden={!sidebarOpen}>
          <div className="sidebar-header">
            <Link to="/operation-support" className="logo-text" aria-label="Operation Support Home">
              Operation Support
            </Link>
          </div>
          <nav aria-label="Primary">
            <ul className="nav-menu">
              {navigationItems.map((item) => (
                <li key={item.key} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="main-content" id="main">
          <header className="header" role="banner">
            <div className="header-inner">
              <div className="flex items-center gap-4">
                <button
                  className="mobile-menu-btn"
                  onClick={toggleSidebar}
                  aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={sidebarOpen}
                  aria-controls="sidebar"
                >
                  {sidebarOpen ? '✕' : '☰'}
                </button>
                <h1 className="header-title" tabIndex="-1">
                  {currentTitle}
                </h1>
              </div>
              <div className="user-profile" aria-label="Current user">
                <div className="user-avatar" aria-hidden="true">
                  {user.initials}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
            </div>
          </header>

          <section className="content-panel" role="region" aria-labelledby="pageTitle">
            <Outlet />
          </section>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="scrim"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default OperationSupport;