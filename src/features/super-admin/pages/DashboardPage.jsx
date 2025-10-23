// ============================================
// System Control Center - Main Dashboard
// Super Admin Complete System Overview
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/system-control-center.css';

const SystemControlCenter = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveData, setLiveData] = useState({
    totalRevenue: 2847650,
    activeUsers: 183,
    todayTickets: 8942,
    systemHealth: 99.2,
    activeModules: 4,
    totalModules: 4,
    pendingAlerts: 8,
    criticalAlerts: 2
  });

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate live data updates
      setLiveData(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000),
        todayTickets: prev.todayTickets + Math.floor(Math.random() * 5)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Module status data
  const modules = [
    { id: 'teller', name: 'Teller Module', icon: '🎫', status: 'active', users: 142, health: 98.5 },
    { id: 'collector', name: 'Collector Module', icon: '💼', status: 'active', users: 28, health: 99.1 },
    { id: 'game-admin', name: 'Game Admin', icon: '🎮', status: 'active', users: 8, health: 100 },
    { id: 'ops-support', name: 'Ops Support', icon: '⚙️', status: 'active', users: 5, health: 99.8 }
  ];

  // Quick stats
  const quickStats = [
    { label: 'Games Active', value: '12', change: '+2', trend: 'up', color: 'cyan' },
    { label: 'Draws Today', value: '48', change: '16 pending', trend: 'neutral', color: 'purple' },
    { label: 'Avg Response', value: '0.8s', change: '-12%', trend: 'up', color: 'green' },
    { label: 'Uptime', value: '99.2%', change: '24h', trend: 'up', color: 'blue' }
  ];

  // Recent activity
  const recentActivity = [
    { time: '2 min ago', action: 'New game admin created', user: 'Super Admin', type: 'success' },
    { time: '5 min ago', action: 'Module control: Teller enabled', user: 'Super Admin', type: 'info' },
    { time: '12 min ago', action: 'Security alert resolved', user: 'Super Admin', type: 'warning' },
    { time: '18 min ago', action: 'System backup completed', user: 'System', type: 'success' },
    { time: '25 min ago', action: 'Game configuration updated', user: 'Super Admin', type: 'info' }
  ];

  // Critical alerts
  const criticalAlerts = [
    { id: 1, priority: 'high', message: 'Unusual betting pattern detected', module: 'Teller', time: '5m ago' },
    { id: 2, priority: 'medium', message: '3 void requests pending approval', module: 'Game Admin', time: '12m ago' }
  ];

  return (
    <div className="scc-container">
      {/* Page Header */}
      <div className="scc-header">
        <div className="scc-header-left">
          <h1 className="scc-title">System Control Center</h1>
          <p className="scc-subtitle">Complete system oversight and management</p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="scc-quick-actions">
        <button 
          className="scc-action-btn scc-action-primary"
          onClick={() => navigate('/super-admin/module-control')}
        >
          <span className="scc-action-icon">🔧</span>
          <span className="scc-action-text">Module Control</span>
        </button>
        <button 
          className="scc-action-btn scc-action-success"
          onClick={() => navigate('/super-admin/user-management')}
        >
          <span className="scc-action-icon">👥</span>
          <span className="scc-action-text">Create Admin</span>
        </button>
        <button 
          className="scc-action-btn scc-action-purple"
          onClick={() => navigate('/super-admin/game-configuration')}
        >
          <span className="scc-action-icon">🎮</span>
          <span className="scc-action-text">Configure Games</span>
        </button>
        <button 
          className="scc-action-btn scc-action-warning"
          onClick={() => navigate('/super-admin/escalations')}
        >
          <span className="scc-action-icon">🚨</span>
          <span className="scc-action-text">View Alerts</span>
          <span className="scc-action-badge">{liveData.pendingAlerts}</span>
        </button>
      </div>

      {/* Primary KPIs */}
      <div className="scc-kpi-grid">
        {/* Total Revenue */}
        <div className="scc-kpi-card scc-kpi-revenue">
          <div className="scc-kpi-glow scc-kpi-glow-green"></div>
          <div className="scc-kpi-content">
            <div className="scc-kpi-header">
              <span className="scc-kpi-icon">💰</span>
              <span className="scc-kpi-trend scc-trend-up">
                <span className="scc-trend-arrow">↗</span>
                <span className="scc-trend-value">+12.5%</span>
              </span>
            </div>
            <div className="scc-kpi-body">
              <div className="scc-kpi-value">{formatCurrency(liveData.totalRevenue)}</div>
              <div className="scc-kpi-label">Total Revenue Today</div>
              <div className="scc-kpi-subtitle">Updated in real-time</div>
            </div>
            <div className="scc-kpi-footer">
              <div className="scc-progress-bar">
                <div className="scc-progress-fill scc-progress-green" style={{ width: '78%' }}></div>
              </div>
              <div className="scc-progress-label">78% of daily target</div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="scc-kpi-card scc-kpi-users">
          <div className="scc-kpi-glow scc-kpi-glow-blue"></div>
          <div className="scc-kpi-content">
            <div className="scc-kpi-header">
              <span className="scc-kpi-icon">👥</span>
              <span className="scc-kpi-trend scc-trend-up">
                <span className="scc-trend-arrow">↗</span>
                <span className="scc-trend-value">+8</span>
              </span>
            </div>
            <div className="scc-kpi-body">
              <div className="scc-kpi-value">{liveData.activeUsers}</div>
              <div className="scc-kpi-label">Active Users Now</div>
              <div className="scc-kpi-subtitle">Across all modules</div>
            </div>
            <div className="scc-kpi-footer">
              <div className="scc-user-breakdown">
                <span className="scc-breakdown-item">
                  <span className="scc-breakdown-dot scc-dot-blue"></span>
                  <span className="scc-breakdown-text">142 Tellers</span>
                </span>
                <span className="scc-breakdown-item">
                  <span className="scc-breakdown-dot scc-dot-purple"></span>
                  <span className="scc-breakdown-text">28 Collectors</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tickets */}
        <div className="scc-kpi-card scc-kpi-tickets">
          <div className="scc-kpi-glow scc-kpi-glow-purple"></div>
          <div className="scc-kpi-content">
            <div className="scc-kpi-header">
              <span className="scc-kpi-icon">🎫</span>
              <span className="scc-kpi-trend scc-trend-up">
                <span className="scc-trend-arrow">↗</span>
                <span className="scc-trend-value">+18%</span>
              </span>
            </div>
            <div className="scc-kpi-body">
              <div className="scc-kpi-value">{liveData.todayTickets.toLocaleString()}</div>
              <div className="scc-kpi-label">Tickets Sold Today</div>
              <div className="scc-kpi-subtitle">Updating live</div>
            </div>
            <div className="scc-kpi-footer">
              <div className="scc-chart-mini">
                <div className="scc-chart-bar" style={{ height: '40%' }}></div>
                <div className="scc-chart-bar" style={{ height: '65%' }}></div>
                <div className="scc-chart-bar" style={{ height: '55%' }}></div>
                <div className="scc-chart-bar" style={{ height: '80%' }}></div>
                <div className="scc-chart-bar" style={{ height: '75%' }}></div>
                <div className="scc-chart-bar" style={{ height: '90%' }}></div>
                <div className="scc-chart-bar" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="scc-kpi-card scc-kpi-health">
          <div className="scc-kpi-glow scc-kpi-glow-cyan"></div>
          <div className="scc-kpi-content">
            <div className="scc-kpi-header">
              <span className="scc-kpi-icon">💚</span>
              <span className="scc-kpi-status scc-status-healthy">Healthy</span>
            </div>
            <div className="scc-kpi-body">
              <div className="scc-kpi-value">{liveData.systemHealth}%</div>
              <div className="scc-kpi-label">System Health Score</div>
              <div className="scc-kpi-subtitle">All systems operational</div>
            </div>
            <div className="scc-kpi-footer">
              <div className="scc-health-indicators">
                <span className="scc-health-item scc-health-good">
                  <span className="scc-health-dot"></span>
                  <span className="scc-health-text">API</span>
                </span>
                <span className="scc-health-item scc-health-good">
                  <span className="scc-health-dot"></span>
                  <span className="scc-health-text">DB</span>
                </span>
                <span className="scc-health-item scc-health-good">
                  <span className="scc-health-dot"></span>
                  <span className="scc-health-text">Cache</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="scc-quick-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className={`scc-stat-card scc-stat-${stat.color}`}>
            <div className="scc-stat-label">{stat.label}</div>
            <div className="scc-stat-value">{stat.value}</div>
            <div className={`scc-stat-change scc-change-${stat.trend}`}>
              {stat.trend === 'up' && '↗'}
              {stat.trend === 'down' && '↘'}
              {stat.trend === 'neutral' && '→'}
              {' '}{stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="scc-main-grid">
        {/* Module Status */}
        <div className="scc-panel scc-panel-modules">
          <div className="scc-panel-header">
            <h2 className="scc-panel-title">Module Status</h2>
            <button 
              className="scc-panel-action"
              onClick={() => navigate('/super-admin/module-control')}
            >
              Manage →
            </button>
          </div>
          <div className="scc-panel-content">
            <div className="scc-module-list">
              {modules.map(module => (
                <div key={module.id} className="scc-module-item">
                  <div className="scc-module-icon">{module.icon}</div>
                  <div className="scc-module-info">
                    <div className="scc-module-name">{module.name}</div>
                    <div className="scc-module-users">{module.users} active users</div>
                  </div>
                  <div className="scc-module-right">
                    <div className="scc-module-health">{module.health}%</div>
                    <span className={`scc-module-status scc-status-${module.status}`}>
                      <span className="scc-status-dot"></span>
                      {module.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="scc-panel scc-panel-alerts">
          <div className="scc-panel-header">
            <h2 className="scc-panel-title">
              Critical Alerts
              <span className="scc-alert-badge">{liveData.criticalAlerts}</span>
            </h2>
            <button 
              className="scc-panel-action"
              onClick={() => navigate('/super-admin/escalations')}
            >
              View All →
            </button>
          </div>
          <div className="scc-panel-content">
            {criticalAlerts.length > 0 ? (
              <div className="scc-alert-list">
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className={`scc-alert-item scc-alert-${alert.priority}`}>
                    <div className="scc-alert-indicator"></div>
                    <div className="scc-alert-content">
                      <div className="scc-alert-message">{alert.message}</div>
                      <div className="scc-alert-meta">
                        <span className="scc-alert-module">{alert.module}</span>
                        <span className="scc-alert-time">{alert.time}</span>
                      </div>
                    </div>
                    <button className="scc-alert-action">View</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="scc-empty-state">
                <span className="scc-empty-icon">✓</span>
                <p className="scc-empty-text">No critical alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="scc-panel scc-panel-activity">
          <div className="scc-panel-header">
            <h2 className="scc-panel-title">Recent Activity</h2>
            <button 
              className="scc-panel-action"
              onClick={() => navigate('/super-admin/security-audit')}
            >
              View Logs →
            </button>
          </div>
          <div className="scc-panel-content">
            <div className="scc-activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="scc-activity-item">
                  <div className={`scc-activity-icon scc-activity-${activity.type}`}>
                    {activity.type === 'success' && '✓'}
                    {activity.type === 'info' && 'ℹ'}
                    {activity.type === 'warning' && '!'}
                  </div>
                  <div className="scc-activity-content">
                    <div className="scc-activity-action">{activity.action}</div>
                    <div className="scc-activity-meta">
                      <span className="scc-activity-user">{activity.user}</span>
                      <span className="scc-activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div className="scc-panel scc-panel-resources">
          <div className="scc-panel-header">
            <h2 className="scc-panel-title">System Resources</h2>
          </div>
          <div className="scc-panel-content">
            <div className="scc-resource-list">
              <div className="scc-resource-item">
                <div className="scc-resource-label">CPU Usage</div>
                <div className="scc-resource-bar">
                  <div className="scc-resource-fill scc-fill-blue" style={{ width: '42%' }}></div>
                </div>
                <div className="scc-resource-value">42%</div>
              </div>
              <div className="scc-resource-item">
                <div className="scc-resource-label">Memory</div>
                <div className="scc-resource-bar">
                  <div className="scc-resource-fill scc-fill-green" style={{ width: '68%' }}></div>
                </div>
                <div className="scc-resource-value">68%</div>
              </div>
              <div className="scc-resource-item">
                <div className="scc-resource-label">Database</div>
                <div className="scc-resource-bar">
                  <div className="scc-resource-fill scc-fill-purple" style={{ width: '55%' }}></div>
                </div>
                <div className="scc-resource-value">55%</div>
              </div>
              <div className="scc-resource-item">
                <div className="scc-resource-label">Storage</div>
                <div className="scc-resource-bar">
                  <div className="scc-resource-fill scc-fill-cyan" style={{ width: '73%' }}></div>
                </div>
                <div className="scc-resource-value">73%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemControlCenter;