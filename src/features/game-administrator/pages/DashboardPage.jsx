// ============================================
// File: src/features/game-administrator/pages/DashboardPage.jsx
// Game Administrator Dashboard - Complete Implementation
// Base URL: /stl-gaming-system/game-administrator/
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter states
  const [analyticsMetric, setAnalyticsMetric] = useState('revenue');

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadDashboardData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      setRefreshing(isAutoRefresh);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = getMockDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExport = () => {
    console.log('Exporting dashboard data...');
    // Export implementation
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action:', actionId);
    // Implementation for each quick action
    switch(actionId) {
      case 'launch_draw':
        navigate('/game-administrator/draw-management');
        break;
      case 'broadcast':
        showToast('Opening broadcast form...', 'info');
        break;
      case 'manage_tellers':
        navigate('/game-administrator/user-management');
        break;
      case 'configuration':
        navigate('/game-administrator/configuration');
        break;
      case 'compliance_report':
        handleExport();
        break;
      case 'void_queue':
        navigate('/game-administrator/daily-operations');
        break;
      case 'health_check':
        showToast('Running system diagnostics...', 'info');
        break;
      case 'emergency_stop':
        if (window.confirm('⚠️ EMERGENCY STOP: This will pause all operations. Are you sure?')) {
          showToast('Emergency stop initiated', 'warning');
        }
        break;
      default:
        break;
    }
  };

  const handleKPIClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const showToast = (message, type = 'info') => {
    // Toast notification implementation
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={handleRefresh} navigate={navigate} />;
  }

  if (!dashboardData) {
    return <DashboardEmpty />;
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard Header - Reports Style */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h2 className="dashboard-title">Game Administrator Dashboard</h2>
            <p className="dashboard-subtitle">
              Real-time system monitoring and operational control center
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button 
              className="dashboard-action-btn" 
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh dashboard"
            >
              <span className={`icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button 
              className="dashboard-action-btn" 
              onClick={handleExport}
              aria-label="Export dashboard data"
            >
              <span className="icon">📊</span>
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="dashboard-status-bar">
          <div className="status-item">
            <span className="status-label">Last Updated:</span>
            <span className="status-value">{formatTime(new Date())}</span>
            {refreshing && <span className="refresh-indicator">●</span>}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <section className="kpi-section" role="region" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="section-title">System Overview</h2>
        <div className="kpi-grid">
          <KPICard
            label="Active Games"
            value={dashboardData.kpis.activeGames.value}
            trend={dashboardData.kpis.activeGames.trend}
            icon="🎮"
            status="success"
            tooltip={`${dashboardData.kpis.activeGames.breakdown.map(b => `${b.type}: ${b.count}`).join(', ')}`}
          />
          <KPICard
            label="Teller Attendance"
            value={`${dashboardData.kpis.tellerAttendance.percentage}%`}
            subtitle={`${dashboardData.kpis.tellerAttendance.active}/${dashboardData.kpis.tellerAttendance.total} active`}
            trend={dashboardData.kpis.tellerAttendance.trend}
            icon="👥"
            status={dashboardData.kpis.tellerAttendance.percentage >= 85 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/game-administrator/daily-operations')}
          />
          <KPICard
            label="Draws Completed"
            value={`${dashboardData.kpis.drawsCompleted.percentage}%`}
            subtitle={`${dashboardData.kpis.drawsCompleted.completed}/${dashboardData.kpis.drawsCompleted.scheduled} draws`}
            trend={{direction: 'neutral', percentage: 0}}
            icon="🎲"
            status={dashboardData.kpis.drawsCompleted.percentage >= 90 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/game-administrator/draw-management')}
          />
          <KPICard
            label="Revenue vs Target"
            value={`₱${(dashboardData.kpis.revenue.actual / 1000000).toFixed(2)}M`}
            subtitle={`${dashboardData.kpis.revenue.percentage}% of ₱${(dashboardData.kpis.revenue.target / 1000000).toFixed(1)}M`}
            trend={dashboardData.kpis.revenue.trend}
            icon="💰"
            status={dashboardData.kpis.revenue.percentage >= 90 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/game-administrator/reports')}
          />
          <KPICard
            label="Void Requests"
            value={dashboardData.kpis.voidRequests.pending}
            subtitle={`${dashboardData.kpis.voidRequests.total} total today`}
            trend={{direction: 'neutral', percentage: 0}}
            icon="⚠️"
            status={dashboardData.kpis.voidRequests.pending > 10 ? 'critical' : 'success'}
            badge={dashboardData.kpis.voidRequests.pending}
            onClick={() => handleKPIClick('/game-administrator/daily-operations')}
          />
          <KPICard
            label="System Uptime"
            value={`${dashboardData.kpis.systemUptime.percentage}%`}
            subtitle="last 24 hours"
            trend={{direction: 'neutral', percentage: 0}}
            icon="🟢"
            status={dashboardData.kpis.systemUptime.percentage >= 99 ? 'success' : 'warning'}
            tooltip={`Last incident: ${formatTimeAgo(dashboardData.kpis.systemUptime.lastIncident)}`}
          />
        </div>
      </section>

      {/* Performance Analytics - Full Width */}
      <section className="analytics-section" role="region" aria-labelledby="analytics-heading">
        <div className="section-header">
          <h2 id="analytics-heading" className="section-title">Performance Snapshot</h2>
          <div className="analytics-header-actions">
            <select 
              value={analyticsMetric}
              onChange={(e) => setAnalyticsMetric(e.target.value)}
              className="filter-select"
              aria-label="Select metric"
            >
              <option value="revenue">Revenue</option>
              <option value="tickets">Ticket Volume</option>
              <option value="payout">Payout Ratio</option>
            </select>
            <button 
              className="btn-icon" 
              onClick={handleExport}
              aria-label="Export analytics"
            >
              <span>📈</span>
            </button>
          </div>
        </div>
        <div className="performance-chart">
          <div className="top-performers">
            <h3 className="subsection-title">Top 5 Branches by {analyticsMetric}</h3>
            {dashboardData.analytics.branchPerformance.slice(0, 5).map((branch, idx) => (
              <div 
                key={branch.branchId} 
                className="performer-item"
                onClick={() => handleKPIClick('/game-administrator/reports')}
              >
                <span className="rank">#{idx + 1}</span>
                <span className="name">{branch.branchName}</span>
                <span className="value">₱{(branch.revenue / 1000).toFixed(1)}K</span>
                <span className={`trend ${branch.trend}`}>
                  {branch.trend === 'up' ? '↑' : '↓'} {branch.changePercentage}%
                </span>
              </div>
            ))}
          </div>
          <div className="analytics-summary">
            <div className="summary-stat">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">₱{(dashboardData.analytics.overallMetrics.totalRevenue / 1000000).toFixed(2)}M</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Tickets</span>
              <span className="stat-value">{dashboardData.analytics.overallMetrics.totalTickets.toLocaleString()}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Avg Ticket Value</span>
              <span className="stat-value">₱{dashboardData.analytics.overallMetrics.avgTicketValue.toFixed(2)}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Profit Margin</span>
              <span className="stat-value">{(dashboardData.analytics.overallMetrics.profitMargin * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section" role="region" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <QuickActionButton
            icon="🚀"
            label="Launch New Draw"
            shortcut="Ctrl+N"
            onClick={() => handleQuickAction('launch_draw')}
          />
          <QuickActionButton
            icon="📢"
            label="Broadcast Advisory"
            shortcut="Ctrl+B"
            onClick={() => handleQuickAction('broadcast')}
          />
          <QuickActionButton
            icon="👥"
            label="Manage Tellers"
            shortcut="Ctrl+U"
            onClick={() => handleQuickAction('manage_tellers')}
          />
          <QuickActionButton
            icon="⚙️"
            label="Configuration"
            shortcut="Ctrl+K"
            onClick={() => handleQuickAction('configuration')}
          />
          <QuickActionButton
            icon="📄"
            label="Compliance Report"
            shortcut="Ctrl+R"
            onClick={() => handleQuickAction('compliance_report')}
          />
          <QuickActionButton
            icon="⚠️"
            label="Void Queue"
            shortcut="Ctrl+V"
            onClick={() => handleQuickAction('void_queue')}
          />
          <QuickActionButton
            icon="🔍"
            label="System Health"
            onClick={() => handleQuickAction('health_check')}
          />
          <QuickActionButton
            icon="🛑"
            label="Emergency Stop"
            variant="danger"
            onClick={() => handleQuickAction('emergency_stop')}
          />
        </div>
      </section>

      {/* System Health */}
      <section className="health-section" role="region" aria-labelledby="health-heading">
        <h2 id="health-heading" className="section-title">System Health & Services</h2>
        <div className="health-grid">
          {dashboardData.systemHealth.services.map((service) => (
            <HealthService
              key={service.name}
              name={service.name}
              status={service.status}
              latency={service.latency}
              uptime={service.uptime}
            />
          ))}
        </div>
        {dashboardData.systemHealth.scheduledMaintenance.length > 0 && (
          <div className="maintenance-notice">
            <span className="notice-icon">🔧</span>
            <span>
              Scheduled maintenance: {dashboardData.systemHealth.scheduledMaintenance[0].title} on{' '}
              {formatDate(dashboardData.systemHealth.scheduledMaintenance[0].scheduledStart)}{' '}
              ({dashboardData.systemHealth.scheduledMaintenance[0].duration} minutes)
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

const KPICard = ({ label, value, subtitle, trend, icon, status, badge, tooltip, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className={`kpi-card ${status} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        {badge !== undefined && badge > 0 && (
          <span className="kpi-badge">{badge}</span>
        )}
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
      {trend && trend.direction !== 'neutral' && (
        <div className={`kpi-trend ${trend.direction}`}>
          <span className="trend-arrow">{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span className="trend-value">{trend.percentage}%</span>
          <span className="trend-label">vs yesterday</span>
        </div>
      )}
      {tooltip && showTooltip && (
        <div className="kpi-tooltip">{tooltip}</div>
      )}
    </div>
  );
};

const QuickActionButton = ({ icon, label, shortcut, variant, onClick }) => (
  <button 
    className={`quick-action-btn ${variant || ''}`}
    onClick={onClick}
    aria-label={label}
  >
    <span className="action-icon">{icon}</span>
    <span className="action-label">{label}</span>
    {shortcut && <span className="action-shortcut">{shortcut}</span>}
  </button>
);

const HealthService = ({ name, status, latency, uptime }) => (
  <div className={`health-service ${status}`} role="article">
    <div className="service-header">
      <div className="service-status">
        <span className={`status-dot ${status}`} aria-label={status} />
        <span className="service-name">{name}</span>
      </div>
      <div className="service-metrics">
        <span className="service-latency">{latency}ms</span>
      </div>
    </div>
    <div className="service-uptime">
      <div className="uptime-bar">
        <div 
          className="uptime-fill" 
          style={{width: `${uptime}%`}}
          aria-label={`${uptime}% uptime`}
        />
      </div>
      <span className="uptime-text">{uptime}% uptime</span>
    </div>
  </div>
);

// ============================================
// Loading, Error, Empty States
// ============================================

const DashboardLoading = () => (
  <div className="dashboard-page">
    <div className="dashboard-loading">
      <div className="loading-header">
        <div className="skeleton skeleton-text" style={{width: '150px', height: '24px'}} />
        <div className="skeleton skeleton-button" />
      </div>
      <div className="kpi-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="kpi-skeleton skeleton" />
        ))}
      </div>
      <div className="skeleton skeleton-section" style={{height: '400px', marginBottom: '1.5rem'}} />
    </div>
  </div>
);

const DashboardError = ({ error, onRetry, navigate }) => (
  <div className="dashboard-error">
    <div className="error-content">
      <span className="error-icon">⚠️</span>
      <h2 className="error-title">Unable to Load Dashboard</h2>
      <p className="error-message">{error}</p>
      <div className="error-actions">
        <button className="btn-retry" onClick={onRetry}>
          <span>🔄</span>
          <span>Retry</span>
        </button>
        <button 
          className="btn-support" 
          onClick={() => navigate('/stl-gaming-system/support')}
        >
          <span>💬</span>
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  </div>
);

const DashboardEmpty = () => (
  <div className="dashboard-empty">
    <div className="empty-content">
      <span className="empty-icon">📊</span>
      <h2 className="empty-title">No Data Available</h2>
      <p className="empty-message">Dashboard data will appear here once system operations begin.</p>
    </div>
  </div>
);

// ============================================
// Helper Functions
// ============================================

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// ============================================
// Mock Data Generator
// ============================================

const getMockDashboardData = () => ({
  kpis: {
    activeGames: {
      value: 12,
      breakdown: [
        {type: '3D', count: 5},
        {type: '2D', count: 7}
      ],
      trend: { direction: 'up', percentage: 8.3 }
    },
    tellerAttendance: {
      active: 142,
      total: 156,
      percentage: 91.0,
      trend: { direction: 'down', percentage: 2.1 }
    },
    drawsCompleted: {
      completed: 47,
      scheduled: 50,
      percentage: 94.0
    },
    revenue: {
      actual: 2847563.50,
      target: 3000000.00,
      percentage: 94.9,
      trend: { direction: 'up', percentage: 12.5 }
    },
    voidRequests: {
      pending: 8,
      total: 23
    },
    systemUptime: {
      percentage: 99.87,
      lastIncident: '2025-10-06T14:23:00Z',
      status: 'operational'
    }
  },
  analytics: {
    timePeriod: {
      start: '2025-10-08T00:00:00Z',
      end: '2025-10-08T23:59:59Z',
      type: 'daily'
    },
    branchPerformance: [
      {
        branchId: 'branch_012',
        branchName: 'Davao Central',
        revenue: 145230.50,
        ticketVolume: 5847,
        payoutRatio: 0.68,
        rank: 1,
        trend: 'up',
        changePercentage: 12.5
      },
      {
        branchId: 'branch_045',
        branchName: 'Tagum Station',
        revenue: 132450.00,
        ticketVolume: 5234,
        payoutRatio: 0.71,
        rank: 2,
        trend: 'up',
        changePercentage: 8.2
      },
      {
        branchId: 'branch_028',
        branchName: 'Panabo Outlet',
        revenue: 98760.25,
        ticketVolume: 4012,
        payoutRatio: 0.69,
        rank: 3,
        trend: 'down',
        changePercentage: 5.3
      },
      {
        branchId: 'branch_056',
        branchName: 'Mati Branch',
        revenue: 87340.00,
        ticketVolume: 3456,
        payoutRatio: 0.70,
        rank: 4,
        trend: 'up',
        changePercentage: 15.7
      },
      {
        branchId: 'branch_034',
        branchName: 'Digos Station',
        revenue: 76820.50,
        ticketVolume: 3123,
        payoutRatio: 0.73,
        rank: 5,
        trend: 'down',
        changePercentage: 3.2
      }
    ],
    overallMetrics: {
      totalRevenue: 2847563.50,
      totalTickets: 114567,
      avgTicketValue: 24.85,
      payoutRatio: 0.72,
      profitMargin: 0.28
    }
  },
  systemHealth: {
    overallStatus: 'operational',
    lastChecked: new Date().toISOString(),
    services: [
      {
        name: 'API Gateway',
        status: 'operational',
        latency: 45,
        uptime: 99.98
      },
      {
        name: 'Payment Gateway',
        status: 'degraded',
        latency: 234,
        uptime: 99.45
      },
      {
        name: 'Database',
        status: 'operational',
        latency: 12,
        uptime: 99.99
      },
      {
        name: 'SMS Provider',
        status: 'operational',
        latency: 89,
        uptime: 99.87
      }
    ],
    scheduledMaintenance: [
      {
        id: 'maint_001',
        title: 'Database optimization',
        scheduledStart: '2025-10-15T02:00:00Z',
        duration: 120,
        impact: 'low'
      }
    ]
  }
});

export default DashboardPage;