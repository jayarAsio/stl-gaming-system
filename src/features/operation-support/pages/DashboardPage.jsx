import React, { useState, useEffect } from 'react';
import '../styles/dashboard-page.css';

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    unverifiedBalances: 3,
    pendingPayments: 8,
    overduePayments: 2,
    totalOutstanding: 45500,
  });

  const [alerts] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'Overdue Payment Follow-up',
      message: 'Pedro Reyes - ₱8,500 (11 days overdue)',
      action: 'Call Now',
      link: '/stl-gaming-system/operation-support/balances?tab=pending&id=PR001',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Balance Discrepancy',
      message: 'Juan Cruz - Short ₱500 from yesterday',
      action: 'Review',
      link: '/stl-gaming-system/operation-support/balances?tab=verification&id=JC001',
    },
    {
      id: 3,
      type: 'info',
      title: 'Payment Commitment Due',
      message: 'Maria Santos committed to pay ₱15,000 today',
      action: 'Follow Up',
      link: '/stl-gaming-system/operation-support/balances?tab=pending&id=MS001',
    },
  ]);

  const [priorityTasks] = useState([
    {
      id: 1,
      task: 'Verify yesterday\'s teller balances',
      count: 3,
      status: 'pending',
      link: '/stl-gaming-system/operation-support/balances?tab=verification',
    },
    {
      id: 2,
      task: 'Call collectors with overdue payments',
      count: 2,
      status: 'urgent',
      link: '/stl-gaming-system/operation-support/balances?tab=pending&filter=overdue',
    },
    {
      id: 3,
      task: 'Follow up on payment commitments',
      count: 5,
      status: 'today',
      link: '/stl-gaming-system/operation-support/balances?tab=pending&filter=today',
    },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'call',
      user: 'You',
      action: 'called Juan Cruz',
      detail: 'Promised payment by Oct 18',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'verify',
      user: 'You',
      action: 'verified Maria Santos balance',
      detail: 'Balanced - ₱110,000',
      timestamp: '3 hours ago',
    },
    {
      id: 3,
      type: 'payment',
      user: 'Pedro Reyes',
      action: 'payment received',
      detail: '₱5,000 partial payment',
      timestamp: '5 hours ago',
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAlertIcon = (type) => {
    const icons = {
      urgent: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || '📋';
  };

  const getActivityIcon = (type) => {
    const icons = {
      call: '📱',
      verify: '✓',
      payment: '💰',
    };
    return icons[type] || '•';
  };

  const getTaskStatusClass = (status) => {
    return status || '';
  };

  const handleRefresh = () => {
    // In a real app, this would refresh data from API
    setStats({
      unverifiedBalances: Math.floor(Math.random() * 5),
      pendingPayments: Math.floor(Math.random() * 10),
      overduePayments: Math.floor(Math.random() * 3),
      totalOutstanding: Math.floor(Math.random() * 100000),
    });
  };

  const handleNavigation = (link) => {
    window.location.href = link;
  };

  return (
    <div className="os-dashboard-container">
      {/* Header */}
      <div className="os-dashboard-header">
        <div className="os-dashboard-header-content">
          <div className="os-dashboard-header-main">
            <div className="os-dashboard-icon">📊</div>
            <div className="os-dashboard-header-text">
              <h1 className="os-dashboard-title">Operation Support Dashboard</h1>
              <p className="os-dashboard-subtitle">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
          </div>
          <div className="os-dashboard-header-actions">
            <button className="os-refresh-btn" onClick={handleRefresh}>
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="os-stats-grid">
        <div className="os-stat-card">
          <div className="os-stat-icon unverified">✓</div>
          <div className="os-stat-content">
            <div className="os-stat-value">{stats.unverifiedBalances}</div>
            <div className="os-stat-label">Balances to Verify</div>
          </div>
          <button 
            className="os-stat-link-btn"
            onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=verification')}
          >
            View →
          </button>
        </div>

        <div className="os-stat-card">
          <div className="os-stat-icon pending">⏳</div>
          <div className="os-stat-content">
            <div className="os-stat-value">{stats.pendingPayments}</div>
            <div className="os-stat-label">Pending Payments</div>
          </div>
          <button 
            className="os-stat-link-btn"
            onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=pending')}
          >
            View →
          </button>
        </div>

        <div className="os-stat-card">
          <div className="os-stat-icon overdue">🚨</div>
          <div className="os-stat-content">
            <div className="os-stat-value">{stats.overduePayments}</div>
            <div className="os-stat-label">Overdue Payments</div>
          </div>
          <button 
            className="os-stat-link-btn"
            onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=pending&filter=overdue')}
          >
            View →
          </button>
        </div>

        <div className="os-stat-card">
          <div className="os-stat-icon outstanding">💰</div>
          <div className="os-stat-content">
            <div className="os-stat-value">₱{stats.totalOutstanding.toLocaleString()}</div>
            <div className="os-stat-label">Total Outstanding</div>
          </div>
          <button 
            className="os-stat-link-btn"
            onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=pending')}
          >
            View →
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="os-dashboard-grid">
        {/* Alerts Section */}
        <div className="os-dashboard-section os-alerts-section">
          <div className="os-section-header">
            <h2 className="os-section-title">
              <span className="os-section-icon">🔔</span>
              Priority Alerts
            </h2>
            <span className="os-alert-count">{alerts.length}</span>
          </div>
          <div className="os-alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`os-alert-item ${alert.type}`}>
                <div className="os-alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="os-alert-content">
                  <div className="os-alert-title">{alert.title}</div>
                  <div className="os-alert-message">{alert.message}</div>
                </div>
                <button 
                  className="os-alert-action"
                  onClick={() => handleNavigation(alert.link)}
                >
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Tasks Section */}
        <div className="os-dashboard-section os-tasks-section">
          <div className="os-section-header">
            <h2 className="os-section-title">
              <span className="os-section-icon">✓</span>
              Today&apos;s Priority Tasks
            </h2>
          </div>
          <div className="os-tasks-list">
            {priorityTasks.map((task) => (
              <button
                key={task.id}
                className={`os-task-item ${getTaskStatusClass(task.status)}`}
                onClick={() => handleNavigation(task.link)}
              >
                <div className="os-task-main">
                  <div className="os-task-checkbox">
                    <span>□</span>
                  </div>
                  <div className="os-task-content">
                    <div className="os-task-name">{task.task}</div>
                    <div className="os-task-count">{task.count} items</div>
                  </div>
                </div>
                <div className="os-task-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="os-dashboard-grid-secondary">
        {/* Quick Actions */}
        <div className="os-dashboard-section os-quick-actions-section">
          <div className="os-section-header">
            <h2 className="os-section-title">
              <span className="os-section-icon">⚡</span>
              Quick Actions
            </h2>
          </div>
          <div className="os-quick-actions-grid">
            <button 
              className="os-quick-action-btn"
              onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=verification')}
            >
              <span className="os-quick-action-icon">✓</span>
              <span className="os-quick-action-label">Verify Balances</span>
            </button>
            <button 
              className="os-quick-action-btn"
              onClick={() => handleNavigation('/stl-gaming-system/operation-support/balances?tab=pending')}
            >
              <span className="os-quick-action-icon">📱</span>
              <span className="os-quick-action-label">Call Collectors</span>
            </button>
            <button 
              className="os-quick-action-btn"
              onClick={() => handleNavigation('/stl-gaming-system/operation-support/daily-ledgers')}
            >
              <span className="os-quick-action-icon">📋</span>
              <span className="os-quick-action-label">Daily Ledgers</span>
            </button>
            <button 
              className="os-quick-action-btn"
              onClick={() => handleNavigation('/stl-gaming-system/operation-support/reports')}
            >
              <span className="os-quick-action-icon">📈</span>
              <span className="os-quick-action-label">Generate Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="os-dashboard-section os-activity-section">
          <div className="os-section-header">
            <h2 className="os-section-title">
              <span className="os-section-icon">🕐</span>
              Recent Activity
            </h2>
          </div>
          <div className="os-activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="os-activity-item">
                <div className="os-activity-icon">{getActivityIcon(activity.type)}</div>
                <div className="os-activity-content">
                  <div className="os-activity-text">
                    <span className="os-activity-user">{activity.user}</span>{' '}
                    <span className="os-activity-action">{activity.action}</span>
                  </div>
                  <div className="os-activity-detail">{activity.detail}</div>
                  <div className="os-activity-timestamp">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;