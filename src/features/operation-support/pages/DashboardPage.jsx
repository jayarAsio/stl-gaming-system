import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/os-dashboard.css';

// ============================================
// Dashboard Data
// ============================================
const generateDashboardData = () => ({
  kpis: {
    ledgerStatus: {
      value: 'Balanced',
      entries: { processed: 1247, pending: 3 },
      percentage: 99.8,
      trend: { direction: 'up', percentage: 2.3 }
    },
    reconciliation: {
      percentage: 100,
      completed: 24,
      total: 24,
      lastCompleted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      trend: { direction: 'neutral', percentage: 0 }
    },
    discrepancies: {
      pending: 5,
      resolved: 18,
      total: 23,
      criticalCount: 1,
      trend: { direction: 'down', percentage: 12.5 }
    },
    cashFlow: {
      actual: 12450000,
      expected: 12500000,
      variance: -50000,
      percentage: 99.6,
      trend: { direction: 'down', percentage: 0.4 }
    },
    auditScore: {
      percentage: 98.5,
      lastAudit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      findings: 2,
      trend: { direction: 'up', percentage: 1.5 }
    },
    systemIntegrity: {
      percentage: 99.9,
      services: { healthy: 15, degraded: 0, down: 0 },
      lastIncident: new Date(Date.now() - 72 * 60 * 60 * 1000)
    }
  },
  analytics: {
    transactionVolume: [
      { hour: '08:00', count: 145, amount: 450000 },
      { hour: '09:00', count: 289, amount: 892000 },
      { hour: '10:00', count: 412, amount: 1245000 },
      { hour: '11:00', count: 567, amount: 1678000 },
      { hour: '12:00', count: 623, amount: 1890000 },
      { hour: '13:00', count: 589, amount: 1756000 },
      { hour: '14:00', count: 534, amount: 1623000 },
      { hour: '15:00', count: 478, amount: 1445000 }
    ],
    branchPerformance: [
      { branchId: 'B001', branchName: 'Manila Central', reconciled: 98.5, discrepancies: 2, trend: 'up' },
      { branchId: 'B002', branchName: 'Quezon City', reconciled: 99.2, discrepancies: 1, trend: 'up' },
      { branchId: 'B003', branchName: 'Makati', reconciled: 97.8, discrepancies: 3, trend: 'down' },
      { branchId: 'B004', branchName: 'Cebu', reconciled: 98.9, discrepancies: 1, trend: 'up' },
      { branchId: 'B005', branchName: 'Davao', reconciled: 99.5, discrepancies: 0, trend: 'up' }
    ]
  },
  systemHealth: [
    { name: 'Ledger Service', status: 'healthy', latency: 45, uptime: 99.95 },
    { name: 'Reconciliation Engine', status: 'healthy', latency: 67, uptime: 99.87 },
    { name: 'Audit Logger', status: 'healthy', latency: 23, uptime: 99.99 },
    { name: 'Database Cluster', status: 'healthy', latency: 12, uptime: 99.98 }
  ],
  recentActivity: [
    { id: 1, time: '14:32', activity: 'Daily Reconciliation Complete', status: 'success', amount: 12450000 },
    { id: 2, time: '14:15', activity: 'Discrepancy Resolved - BR-003', status: 'success', amount: -5000 },
    { id: 3, time: '13:45', activity: 'Ledger Entry Adjusted', status: 'warning', amount: 2500 },
    { id: 4, time: '13:20', activity: 'Cash Flow Verification', status: 'success', amount: 8750000 },
    { id: 5, time: '12:55', activity: 'Audit Log Generated', status: 'info', amount: 0 }
  ]
});

// ============================================
// Sub-Components
// ============================================
const KPICard = ({ label, value, subtitle, trend, icon, status, badge, tooltip, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className={`kpi-card ${status || ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        {badge !== undefined && <span className="kpi-badge">{badge}</span>}
      </div>
      <div className="kpi-body">
        <h3 className="kpi-label">{label}</h3>
        <div className="kpi-value">{value}</div>
        {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
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
// Helper Functions
// ============================================
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount));
};

const formatTimeAgo = (date) => {
  const hours = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getStatusBadge = (status) => {
  const statusMap = {
    success: { label: 'Complete', className: 'status-success' },
    warning: { label: 'Pending', className: 'status-warning' },
    info: { label: 'Info', className: 'status-info' },
    error: { label: 'Failed', className: 'status-danger' }
  };
  const s = statusMap[status] || statusMap.info;
  return <span className={`status-badge ${s.className}`}>{s.label}</span>;
};

// ============================================
// Main Dashboard Component
// ============================================
const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(generateDashboardData());
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMetric, setAnalyticsMetric] = useState('reconciliation');

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDashboardData(generateDashboardData());
    setRefreshing(false);
  };

  const handleExport = () => {
    console.log('Exporting dashboard data...');
    alert('Export functionality would be implemented here');
  };

  const handleKPIClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">Operations Dashboard</h1>
            <p className="dashboard-subtitle">Real-time oversight and reconciliation monitoring</p>
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
            label="Ledger Status"
            value={dashboardData.kpis.ledgerStatus.value}
            subtitle={`${dashboardData.kpis.ledgerStatus.entries.processed} processed, ${dashboardData.kpis.ledgerStatus.entries.pending} pending`}
            trend={dashboardData.kpis.ledgerStatus.trend}
            icon="📚"
            status="success"
            onClick={() => handleKPIClick('/operation-support/ledger-management')}
          />
          <KPICard
            label="Reconciliation Rate"
            value={`${dashboardData.kpis.reconciliation.percentage}%`}
            subtitle={`${dashboardData.kpis.reconciliation.completed}/${dashboardData.kpis.reconciliation.total} branches`}
            trend={dashboardData.kpis.reconciliation.trend}
            icon="⚖️"
            status={dashboardData.kpis.reconciliation.percentage >= 95 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/operation-support/reconciliation')}
          />
          <KPICard
            label="Discrepancies"
            value={dashboardData.kpis.discrepancies.pending}
            subtitle={`${dashboardData.kpis.discrepancies.total} total today`}
            trend={dashboardData.kpis.discrepancies.trend}
            icon="🔍"
            status={dashboardData.kpis.discrepancies.criticalCount > 0 ? 'critical' : 'success'}
            badge={dashboardData.kpis.discrepancies.pending}
            onClick={() => handleKPIClick('/operation-support/discrepancy-handling')}
          />
          <KPICard
            label="Cash Flow Accuracy"
            value={`${dashboardData.kpis.cashFlow.percentage}%`}
            subtitle={`Variance: ${formatCurrency(dashboardData.kpis.cashFlow.variance)}`}
            trend={dashboardData.kpis.cashFlow.trend}
            icon="💰"
            status={dashboardData.kpis.cashFlow.percentage >= 99 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/operation-support/reports')}
          />
          <KPICard
            label="Audit Score"
            value={`${dashboardData.kpis.auditScore.percentage}%`}
            subtitle={`${dashboardData.kpis.auditScore.findings} findings`}
            trend={dashboardData.kpis.auditScore.trend}
            icon="✓"
            status={dashboardData.kpis.auditScore.percentage >= 95 ? 'success' : 'warning'}
            onClick={() => handleKPIClick('/operation-support/oversight')}
          />
          <KPICard
            label="System Integrity"
            value={`${dashboardData.kpis.systemIntegrity.percentage}%`}
            subtitle="all systems operational"
            trend={{direction: 'neutral', percentage: 0}}
            icon="🟢"
            status={dashboardData.kpis.systemIntegrity.percentage >= 99 ? 'success' : 'warning'}
            tooltip={`Last incident: ${formatTimeAgo(dashboardData.kpis.systemIntegrity.lastIncident)}`}
          />
        </div>
      </section>

      {/* Performance Analytics */}
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
              <option value="reconciliation">Reconciliation Rate</option>
              <option value="discrepancies">Discrepancy Count</option>
              <option value="accuracy">Accuracy Score</option>
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
            <h3 className="subsection-title">Top 5 Branches by Performance</h3>
            {dashboardData.analytics.branchPerformance.slice(0, 5).map((branch, idx) => (
              <div 
                key={branch.branchId} 
                className="performer-item"
                onClick={() => handleKPIClick('/operation-support/reports')}
              >
                <span className="rank">#{idx + 1}</span>
                <span className="name">{branch.branchName}</span>
                <span className="value">{branch.reconciled}%</span>
                <span className={`trend ${branch.trend}`}>
                  {branch.trend === 'up' ? '↑' : '↓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section" role="region" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <QuickActionButton
            icon="📝"
            label="New Ledger Entry"
            shortcut="Ctrl+N"
            onClick={() => handleKPIClick('/operation-support/ledger-management')}
          />
          <QuickActionButton
            icon="⚖️"
            label="Start Reconciliation"
            onClick={() => handleKPIClick('/operation-support/reconciliation')}
          />
          <QuickActionButton
            icon="🔍"
            label="Review Discrepancies"
            badge={dashboardData.kpis.discrepancies.pending}
            variant="warning"
            onClick={() => handleKPIClick('/operation-support/discrepancy-handling')}
          />
          <QuickActionButton
            icon="📊"
            label="Generate Report"
            onClick={() => handleKPIClick('/operation-support/reports')}
          />
          <QuickActionButton
            icon="👁️"
            label="System Oversight"
            onClick={() => handleKPIClick('/operation-support/oversight')}
          />
          <QuickActionButton
            icon="📈"
            label="View Analytics"
            onClick={() => handleKPIClick('/operation-support/reports')}
          />
        </div>
      </section>

      {/* System Health */}
      <section className="health-section" role="region" aria-labelledby="health-heading">
        <h2 id="health-heading" className="section-title">System Health</h2>
        <div className="health-grid">
          {dashboardData.systemHealth.map(service => (
            <HealthService key={service.name} {...service} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section" role="region" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="section-title">Recent Activity</h2>
        <div className="activity-table-container">
          <table className="activity-table" role="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.time}</td>
                  <td>{activity.activity}</td>
                  <td>{getStatusBadge(activity.status)}</td>
                  <td style={{ color: activity.amount < 0 ? 'var(--danger)' : 'inherit' }}>
                    {activity.amount !== 0 ? (
                      <>
                        {activity.amount < 0 ? '-' : ''}
                        {formatCurrency(activity.amount)}
                      </>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;