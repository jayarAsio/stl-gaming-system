// ============================================
// File: src/features/operation-support/pages/Dashboard.jsx
// Operation Support - Dashboard Overview (Compact by default)
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard-page.css';

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showExportModal, setShowExportModal] = useState(false);

  const navigate = useNavigate();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------- Navigation helper ----------
  const safeNav = useCallback(
    (path, fallbackMsg) => {
      try {
        if (navigate) navigate(path);
        else alert(fallbackMsg);
      } catch {
        alert(fallbackMsg);
      }
    },
    [navigate]
  );

  // ---------- Quick action handlers ----------
  const handleGenerateLedger = () =>
    safeNav('/operation-support/daily-ledgers', 'Redirecting to Daily Ledgers page...');

  const handleViewShortages = () =>
    safeNav('/operation-support/balances', 'Redirecting to Balances page...');

  const handleViewAllActivities = () =>
    safeNav('/operation-support/activities', 'Showing all activities...');

  const handleAreaDetails = () =>
    safeNav('/operation-support/areas', 'Showing area details...');

  const handleLeaderboard = () =>
    safeNav('/operation-support/leaderboard', 'Showing full leaderboard...');

  const handleExportReport = () => setShowExportModal(true);

  // ---------- Simple CSV/Excel export ----------
  const downloadFile = (filename, data, mime = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const toCSV = (rows) => {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    return [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(','))
    ].join('\n');
  };

  const handleExport = (format) => {
    const statsRow = {
      period: selectedPeriod,
      totalSales: stats.totalSales,
      totalPayouts: stats.totalPayouts,
      totalRemittances: stats.totalRemittances,
      netRevenue: stats.netRevenue,
      activeTellers: stats.activeTellers,
      activeCollectors: stats.activeCollectors,
      pendingShortages: stats.pendingShortages,
      shortageAmount: stats.shortageAmount,
      averageTicket: stats.averageTicket,
      transactionCount: stats.transactionCount
    };

    const csvSections = [
      { title: 'Summary', rows: [statsRow] },
      { title: 'AreaPerformance', rows: areaStats },
      { title: 'TopPerformers', rows: topPerformers },
      { title: 'RecentActivities', rows: recentActivities }
    ];

    if (format === 'csv') {
      const parts = csvSections.map(s => [`# ${s.title}`, toCSV(s.rows)]).join('\n\n');
      downloadFile(`operations_${selectedPeriod}.csv`, parts);
    } else if (format === 'excel') {
      const parts = csvSections.map(s => [`# ${s.title}`, toCSV(s.rows)]).join('\n\n');
      downloadFile(`operations_${selectedPeriod}.xls`, parts, 'application/vnd.ms-excel');
    } else if (format === 'pdf') {
      alert('PDF export not yet implemented. Integrate jsPDF or a server-side report endpoint.');
    }
    setShowExportModal(false);
  };

  // ---------- Data ----------
  const baseStats = useMemo(() => ({
    today: {
      totalSales: 487250,
      totalPayouts: 142800,
      totalRemittances: 298500,
      netRevenue: 144450,
      activeTellers: 12,
      activeCollectors: 3,
      pendingShortages: 4,
      shortageAmount: 9800,
      averageTicket: 145.50,
      transactionCount: 3347
    },
    week: {
      totalSales: 3410750,
      totalPayouts: 999600,
      totalRemittances: 2089125,
      netRevenue: 1011150,
      activeTellers: 15,
      activeCollectors: 4,
      pendingShortages: 12,
      shortageAmount: 28400,
      averageTicket: 148.20,
      transactionCount: 23014
    },
    month: {
      totalSales: 14843200,
      totalPayouts: 4352960,
      totalRemittances: 9090240,
      netRevenue: 4400280,
      activeTellers: 18,
      activeCollectors: 5,
      pendingShortages: 31,
      shortageAmount: 67200,
      averageTicket: 151.75,
      transactionCount: 97789
    }
  }), []);

  const stats = useMemo(() => baseStats[selectedPeriod], [baseStats, selectedPeriod]);

  const recentActivities = useMemo(() => ([
    { id: 1, type: 'shortage', title: 'New Shortage Reported', description: 'CPZ-00016 - RELANO, VIC has ₱2,500 shortage', timestamp: '15 minutes ago', icon: '⚠️', priority: 'high' },
    { id: 2, type: 'payment', title: 'Payment Received', description: 'CPZ-00020 - SANTOS, MARIA paid ₱1,000', timestamp: '1 hour ago', icon: '💵', priority: 'normal' },
    { id: 3, type: 'remittance', title: 'Remittance Completed', description: 'COL-01 - CRUZ, PEDRO completed collection', timestamp: '2 hours ago', icon: '✅', priority: 'normal' },
    { id: 4, type: 'ledger', title: 'Ledger Generated', description: 'Daily ledger for Oct 19 has been generated', timestamp: '3 hours ago', icon: '📋', priority: 'low' },
    { id: 5, type: 'alert', title: 'High Payout Alert', description: 'Area 1 payouts exceeded 35% threshold', timestamp: '4 hours ago', icon: '🔔', priority: 'medium' }
  ]), []);

  const areaStats = useMemo(() => ([
    { id: 'AREA-01', name: 'Area 1 - Downtown', sales: 185400, payouts: 55620, remittances: 129780, tellers: 5, status: 'good' },
    { id: 'AREA-02', name: 'Area 2 - Uptown', sales: 142300, payouts: 42690, remittances: 99610, tellers: 4, status: 'good' },
    { id: 'AREA-03', name: 'Area 3 - Eastside', sales: 98550, payouts: 29565, remittances: 68985, tellers: 3, status: 'warning' }
  ]), []);

  const topPerformers = useMemo(() => ([
    { rank: 1, name: 'CPZ-00016 - RELANO, VIC', sales: 45200, efficiency: 98.5 },
    { rank: 2, name: 'CPZ-00020 - SANTOS, MARIA', sales: 42800, efficiency: 97.2 },
    { rank: 3, name: 'CPZ-00025 - REYES, ANA', sales: 38500, efficiency: 96.8 },
    { rank: 4, name: 'CPZ-00031 - GARCIA, PEDRO', sales: 35900, efficiency: 95.5 },
    { rank: 5, name: 'CPZ-00042 - LOPEZ, MARIA', sales: 33700, efficiency: 94.9 }
  ]), []);

  // ---------- Formatters ----------
  const formatCurrency = (amount) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getPriorityClass = (priority) =>
    ({ high: 'priority-high', medium: 'priority-medium', normal: 'priority-normal', low: 'priority-low' }[priority] || 'priority-normal');

  const getStatusClass = (status) =>
    ({ good: 'status-good', warning: 'status-warning', danger: 'status-danger' }[status] || 'status-good');

  return (
    <div className="os-dashboard-container os-compact">{/* compact by default */} 
      {/* Header */}
      <header className="os-dashboard-header">
        <div className="os-dashboard-header-main">
          <div className="os-dashboard-icon">📊</div>
          <div>
            <h1 className="os-dashboard-title">Operations Dashboard</h1>
            <p className="os-dashboard-subtitle">Real-time overview of operations and performance</p>
          </div>
        </div>
        <div className="os-dashboard-header-meta">
          <div className="os-current-time">
            <div className="os-time-display">{formatTime(currentTime)}</div>
            <div className="os-date-display">{formatDate(currentTime)}</div>
          </div>
        </div>
      </header>

      {/* Period Selector */}
      <div className="os-period-selector">
        {['today', 'week', 'month'].map(p => (
          <button
            key={p}
            className={`os-period-btn ${selectedPeriod === p ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(p)}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Main Statistics Grid */}
      <div className="os-stats-grid">
        <div className="os-stat-card primary">
          <div className="os-stat-header">
            <span className="os-stat-icon">💰</span>
            <span className="os-stat-label">Total Sales</span>
          </div>
          <div className="os-stat-value">{formatCurrency(stats.totalSales)}</div>
          <div className="os-stat-footer">
            <span className="os-stat-trend positive">↑ 12.5%</span>
            <span className="os-stat-count">{stats.transactionCount.toLocaleString()} transactions</span>
          </div>
        </div>

        <div className="os-stat-card danger">
          <div className="os-stat-header">
            <span className="os-stat-icon">💸</span>
            <span className="os-stat-label">Total Payouts</span>
          </div>
          <div className="os-stat-value">{formatCurrency(stats.totalPayouts)}</div>
          <div className="os-stat-footer">
            <span className="os-stat-trend negative">↓ 3.2%</span>
            <span className="os-stat-count">{((stats.totalPayouts / stats.totalSales) * 100).toFixed(1)}% of sales</span>
          </div>
        </div>

        <div className="os-stat-card success">
          <div className="os-stat-header">
            <span className="os-stat-icon">🏦</span>
            <span className="os-stat-label">Total Remittances</span>
          </div>
          <div className="os-stat-value">{formatCurrency(stats.totalRemittances)}</div>
          <div className="os-stat-footer">
            <span className="os-stat-trend positive">↑ 8.7%</span>
            <span className="os-stat-count">{((stats.totalRemittances / stats.totalSales) * 100).toFixed(1)}% of sales</span>
          </div>
        </div>

        <div className="os-stat-card accent">
          <div className="os-stat-header">
            <span className="os-stat-icon">📈</span>
            <span className="os-stat-label">Net Revenue</span>
          </div>
          <div className="os-stat-value">{formatCurrency(stats.netRevenue)}</div>
          <div className="os-stat-footer">
            <span className="os-stat-trend positive">↑ 15.3%</span>
            <span className="os-stat-count">{((stats.netRevenue / stats.totalSales) * 100).toFixed(1)}% margin</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="os-secondary-stats">
        <div className="os-secondary-stat-card">
          <span className="os-secondary-icon">👥</span>
          <div className="os-secondary-content">
            <div className="os-secondary-value">{stats.activeTellers}</div>
            <div className="os-secondary-label">Active Tellers</div>
          </div>
        </div>

        <div className="os-secondary-stat-card">
          <span className="os-secondary-icon">🚚</span>
          <div className="os-secondary-content">
            <div className="os-secondary-value">{stats.activeCollectors}</div>
            <div className="os-secondary-label">Active Collectors</div>
          </div>
        </div>

        <div className="os-secondary-stat-card warning">
          <span className="os-secondary-icon">⚠️</span>
          <div className="os-secondary-content">
            <div className="os-secondary-value">{stats.pendingShortages}</div>
            <div className="os-secondary-label">Pending Shortages</div>
          </div>
        </div>

        <div className="os-secondary-stat-card danger">
          <span className="os-secondary-icon">💔</span>
          <div className="os-secondary-content">
            <div className="os-secondary-value">{formatCurrency(stats.shortageAmount)}</div>
            <div className="os-secondary-label">Shortage Amount</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="os-dashboard-grid">
        {/* Recent Activities */}
        <div className="os-dashboard-card os-activities-card">
          <div className="os-card-header">
            <h2 className="os-card-title">Recent Activities</h2>
            <button className="os-card-action" onClick={handleViewAllActivities}>View All</button>
          </div>
          <div className="os-card-content">
            <div className="os-activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`os-activity-item ${getPriorityClass(activity.priority)}`}>
                  <span className="os-activity-icon">{activity.icon}</span>
                  <div className="os-activity-content">
                    <div className="os-activity-title">{activity.title}</div>
                    <div className="os-activity-description">{activity.description}</div>
                    <div className="os-activity-timestamp">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Area Performance */}
        <div className="os-dashboard-card os-areas-card">
          <div className="os-card-header">
            <h2 className="os-card-title">Area Performance</h2>
            <button className="os-card-action" onClick={handleAreaDetails}>Details</button>
          </div>
          <div className="os-card-content">
            <div className="os-areas-list">
              {areaStats.map(area => (
                <div
                  key={area.id}
                  className="os-area-item"
                  onClick={() => safeNav(`/operation-support/areas/${area.id}`, 'Opening area...')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="os-area-header">
                    <div className="os-area-name">{area.name}</div>
                    <span className={`os-area-status ${getStatusClass(area.status)}`}>{area.status}</span>
                  </div>
                  <div className="os-area-stats">
                    <div className="os-area-stat">
                      <span className="os-area-stat-label">Sales</span>
                      <span className="os-area-stat-value">{formatCurrency(area.sales)}</span>
                    </div>
                    <div className="os-area-stat">
                      <span className="os-area-stat-label">Payouts</span>
                      <span className="os-area-stat-value danger">{formatCurrency(area.payouts)}</span>
                    </div>
                    <div className="os-area-stat">
                      <span className="os-area-stat-label">Remittances</span>
                      <span className="os-area-stat-value success">{formatCurrency(area.remittances)}</span>
                    </div>
                  </div>
                  <div className="os-area-footer">
                    <span className="os-area-tellers">👥 {area.tellers} Tellers</span>
                    <span className="os-area-payout-rate">
                      {((area.payouts / area.sales) * 100).toFixed(1)}% payout rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="os-dashboard-card os-performers-card">
          <div className="os-card-header">
            <h2 className="os-card-title">Top Performers</h2>
            <button className="os-card-action" onClick={handleLeaderboard}>Leaderboard</button>
          </div>
          <div className="os-card-content">
            <div className="os-performers-list">
              {topPerformers.map(performer => (
                <div
                  key={performer.rank}
                  className="os-performer-item"
                  onClick={() => safeNav(`/operation-support/agents/${encodeURIComponent(performer.name)}`, 'Opening performer...')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`os-performer-rank rank-${performer.rank}`}>
                    {performer.rank === 1 ? '🥇' : performer.rank === 2 ? '🥈' : performer.rank === 3 ? '🥉' : performer.rank}
                  </div>
                  <div className="os-performer-content">
                    <div className="os-performer-name">{performer.name}</div>
                    <div className="os-performer-stats">
                      <span className="os-performer-sales">{formatCurrency(performer.sales)}</span>
                      <span className="os-performer-efficiency">{performer.efficiency}% efficiency</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (trimmed) */}
        <div className="os-dashboard-card os-actions-card">
          <div className="os-card-header">
            <h2 className="os-card-title">Quick Actions</h2>
          </div>
          <div className="os-card-content">
            <div className="os-quick-actions">
              <button className="os-quick-action-btn" onClick={handleGenerateLedger}>
                <span className="os-quick-action-icon">📋</span>
                <span className="os-quick-action-label">Generate Ledger</span>
              </button>
              <button className="os-quick-action-btn" onClick={handleViewShortages}>
                <span className="os-quick-action-icon">💰</span>
                <span className="os-quick-action-label">View Shortages</span>
              </button>
              <button className="os-quick-action-btn" onClick={handleExportReport}>
                <span className="os-quick-action-icon">📊</span>
                <span className="os-quick-action-label">Export Report</span>
              </button>
              {/* Removed: Manual Entry, Manage Agents, Settings */}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <>
          <div className="os-modal-overlay" onClick={() => setShowExportModal(false)}></div>
          <div className="os-modal">
            <div className="os-modal-header">
              <h3 className="os-modal-title">Export Report</h3>
              <button className="os-modal-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="os-modal-body">
              <p className="os-modal-description">Choose export format for the {selectedPeriod} report:</p>
              <div className="os-export-options">
                <button className="os-export-btn" onClick={() => handleExport('pdf')}>
                  <span className="os-export-icon">📄</span>
                  <span className="os-export-label">PDF Document</span>
                </button>
                <button className="os-export-btn" onClick={() => handleExport('excel')}>
                  <span className="os-export-icon">📊</span>
                  <span className="os-export-label">Excel Spreadsheet</span>
                </button>
                <button className="os-export-btn" onClick={() => handleExport('csv')}>
                  <span className="os-export-icon">📋</span>
                  <span className="os-export-label">CSV File</span>
                </button>
              </div>
            </div>
            <div className="os-modal-footer">
              <button className="os-btn-secondary" onClick={() => setShowExportModal(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;