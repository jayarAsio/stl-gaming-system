import React, { useState, useMemo } from 'react';
import '../styles/security-audit.css';

const SecurityAudit = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [filters, setFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    user: 'all',
    action: 'all',
    search: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Handle export
  const handleExport = () => {
    const data = getFilteredData();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `security_audit_${activeTab}_${timestamp}.csv`;
    alert(`Exporting ${data.length} ${activeTab} logs as CSV\nFilename: ${filename}`);
  };

  // Handle export from drawer
  const handleExportLog = () => {
    if (!selectedLog) return;
    const filename = `log_${selectedLog.id}_${new Date().toISOString().split('T')[0]}.json`;
    alert(`Exporting log ${selectedLog.id}\nFilename: ${filename}`);
  };

  // Handle add note
  const handleAddNote = () => {
    if (!selectedLog) return;
    const note = prompt(`Add note to log ${selectedLog.id}:`);
    if (note) {
      alert(`Note added to ${selectedLog.id}:\n"${note}"`);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    alert('Refreshing logs...\nIn production: Fetch latest data from server');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      user: 'all',
      action: 'all',
      search: ''
    });
  };

  // Mock data
  const auditLogs = [
    { id: 'AUD-001', timestamp: '2025-10-24 10:45:23', user: 'Juan Dela Cruz', userId: 'U-0045', role: 'Admin', action: 'Updated Game Settings', category: 'configuration', resource: 'STL Pares Configuration', details: 'Changed payout multiplier from 650 to 700', ipAddress: '192.168.1.100', deviceInfo: 'Chrome 118 / Windows 10', status: 'success', changes: { before: { payoutMultiplier: 650 }, after: { payoutMultiplier: 700 } } },
    { id: 'AUD-002', timestamp: '2025-10-24 10:30:15', user: 'Maria Santos', userId: 'U-0023', role: 'Teller Manager', action: 'Created User Account', category: 'user_management', resource: 'User: T-0156', details: 'Created new teller account for Pedro Garcia', ipAddress: '192.168.1.105', deviceInfo: 'Firefox 119 / Windows 11', status: 'success', changes: { created: { username: 'T-0156', role: 'Teller' } } },
    { id: 'AUD-003', timestamp: '2025-10-24 10:15:08', user: 'Carlos Reyes', userId: 'U-0089', role: 'Super Admin', action: 'Modified Bet Limits', category: 'configuration', resource: 'Global Bet Limits', details: 'Updated maximum bet limit for Last 2 game', ipAddress: '192.168.1.110', deviceInfo: 'Edge 118 / Windows 10', status: 'success', changes: { before: { maxBet: 1500 }, after: { maxBet: 2000 } } },
    { id: 'AUD-004', timestamp: '2025-10-24 09:55:42', user: 'Ana Garcia', userId: 'U-0034', role: 'Auditor', action: 'Exported Transaction Report', category: 'reports', resource: 'Daily Transaction Report', details: 'Exported transactions for 2025-10-23', ipAddress: '192.168.1.112', deviceInfo: 'Chrome 118 / macOS 14', status: 'success', changes: null },
    { id: 'AUD-005', timestamp: '2025-10-24 09:40:18', user: 'Roberto Cruz', userId: 'U-0067', role: 'Admin', action: 'Failed Login Attempt', category: 'authentication', resource: 'Login System', details: 'Invalid password entered', ipAddress: '192.168.1.150', deviceInfo: 'Chrome 118 / Android 13', status: 'failed', changes: null }
  ];

  const securityEvents = [
    { id: 'SEC-001', timestamp: '2025-10-24 11:15:30', severity: 'high', type: 'unauthorized_access', user: 'Unknown', description: 'Failed admin login from unusual location', ipAddress: '203.145.67.89', location: 'Unknown Location', action: 'Blocked', status: 'blocked' },
    { id: 'SEC-002', timestamp: '2025-10-24 10:45:18', severity: 'medium', type: 'suspicious_activity', user: 'T-0045', description: 'Multiple rapid transactions detected', ipAddress: '192.168.1.156', location: 'Terminal Area-08', action: 'Flagged for review', status: 'investigating' },
    { id: 'SEC-003', timestamp: '2025-10-24 10:20:45', severity: 'critical', type: 'data_access', user: 'U-0089', description: 'Bulk data export attempted', ipAddress: '192.168.1.110', location: 'Admin Office', action: 'Logged and notified', status: 'resolved' },
    { id: 'SEC-004', timestamp: '2025-10-24 09:55:12', severity: 'low', type: 'password_change', user: 'U-0034', description: 'Password successfully changed', ipAddress: '192.168.1.112', location: 'Office Network', action: 'Logged', status: 'success' }
  ];

  const accessLogs = [
    { id: 'ACC-001', timestamp: '2025-10-24 11:30:22', user: 'Juan Dela Cruz', userId: 'U-0045', action: 'Logged In', ipAddress: '192.168.1.100', location: 'Main Office', device: 'Chrome / Windows 10', sessionDuration: 'Active', status: 'active' },
    { id: 'ACC-002', timestamp: '2025-10-24 11:15:45', user: 'Maria Santos', userId: 'U-0023', action: 'Logged In', ipAddress: '192.168.1.105', location: 'Branch Office', device: 'Firefox / Windows 11', sessionDuration: 'Active', status: 'active' },
    { id: 'ACC-003', timestamp: '2025-10-24 10:45:30', user: 'Carlos Reyes', userId: 'U-0089', action: 'Logged Out', ipAddress: '192.168.1.110', location: 'Admin Office', device: 'Edge / Windows 10', sessionDuration: '2h 15m', status: 'completed' },
    { id: 'ACC-004', timestamp: '2025-10-24 10:30:18', user: 'Unknown User', userId: 'N/A', action: 'Failed Login', ipAddress: '203.145.67.89', location: 'Unknown', device: 'Unknown', sessionDuration: 'N/A', status: 'failed' }
  ];

  const getFilteredData = () => {
    let data = activeTab === 'audit' ? auditLogs : activeTab === 'security' ? securityEvents : accessLogs;
    return data.filter(item => filters.search === '' || JSON.stringify(item).toLowerCase().includes(filters.search.toLowerCase()));
  };

  const filteredData = useMemo(() => getFilteredData(), [activeTab, filters]);

  const stats = useMemo(() => ({
    auditCount: auditLogs.length,
    securityCount: securityEvents.length,
    accessCount: accessLogs.length,
    failedLogins: auditLogs.filter(log => log.status === 'failed').length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length
  }), []);

  const handleViewDetails = (item) => {
    setSelectedLog(item);
    setShowDetailsDrawer(true);
  };

  const getStatusClass = (status) => {
    const map = { success: 'secaudit-status-success', failed: 'secaudit-status-failed', blocked: 'secaudit-status-blocked', active: 'secaudit-status-active', completed: 'secaudit-status-completed', investigating: 'secaudit-status-investigating', resolved: 'secaudit-status-resolved' };
    return map[status] || 'secaudit-status-default';
  };

  const getSeverityClass = (severity) => {
    const map = { critical: 'secaudit-severity-critical', high: 'secaudit-severity-high', medium: 'secaudit-severity-medium', low: 'secaudit-severity-low' };
    return map[severity] || 'secaudit-severity-low';
  };

  return (
    <div className="secaudit-container">
      <div className="secaudit-page-header">
        <div className="secaudit-header-text">
          <h1 className="secaudit-page-title">Security & Audit</h1>
          <p className="secaudit-page-subtitle">Monitor system activity, security events, and access logs</p>
        </div>
        <div className="secaudit-header-actions">
          <button className="secaudit-refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
        </div>
      </div>

      <div className="secaudit-stats-grid">
        <div className="secaudit-stat-box">
          <div className="secaudit-stat-icon secaudit-icon-blue">📋</div>
          <div className="secaudit-stat-content">
            <div className="secaudit-stat-number">{stats.auditCount}</div>
            <div className="secaudit-stat-text">Audit Logs</div>
          </div>
        </div>
        <div className="secaudit-stat-box">
          <div className="secaudit-stat-icon secaudit-icon-red">🔒</div>
          <div className="secaudit-stat-content">
            <div className="secaudit-stat-number">{stats.securityCount}</div>
            <div className="secaudit-stat-text">Security Events</div>
          </div>
        </div>
        <div className="secaudit-stat-box">
          <div className="secaudit-stat-icon secaudit-icon-green">👥</div>
          <div className="secaudit-stat-content">
            <div className="secaudit-stat-number">{stats.accessCount}</div>
            <div className="secaudit-stat-text">Access Logs</div>
          </div>
        </div>
        <div className="secaudit-stat-box">
          <div className="secaudit-stat-icon secaudit-icon-orange">⚠️</div>
          <div className="secaudit-stat-content">
            <div className="secaudit-stat-number">{stats.failedLogins}</div>
            <div className="secaudit-stat-text">Failed Logins</div>
          </div>
        </div>
        <div className="secaudit-stat-box">
          <div className="secaudit-stat-icon secaudit-icon-purple">🔴</div>
          <div className="secaudit-stat-content">
            <div className="secaudit-stat-number">{stats.criticalEvents}</div>
            <div className="secaudit-stat-text">Critical Events</div>
          </div>
        </div>
      </div>

      <div className="secaudit-tabs-wrapper">
        <button className={`secaudit-tab-button ${activeTab === 'audit' ? 'secaudit-tab-active' : ''}`} onClick={() => setActiveTab('audit')}>📋 Audit Trail</button>
        <button className={`secaudit-tab-button ${activeTab === 'security' ? 'secaudit-tab-active' : ''}`} onClick={() => setActiveTab('security')}>🔒 Security Events</button>
        <button className={`secaudit-tab-button ${activeTab === 'access' ? 'secaudit-tab-active' : ''}`} onClick={() => setActiveTab('access')}>👥 Access Logs</button>
      </div>

      <div className="secaudit-filters-bar">
        <div className="secaudit-filter-item secaudit-search-filter">
          <label className="secaudit-filter-label">Search</label>
          <input type="text" className="secaudit-filter-input" placeholder="Search logs..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="secaudit-filter-item">
          <label className="secaudit-filter-label">From Date</label>
          <input type="date" className="secaudit-filter-input" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </div>
        <div className="secaudit-filter-item">
          <label className="secaudit-filter-label">To Date</label>
          <input type="date" className="secaudit-filter-input" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
        <div className="secaudit-filter-item secaudit-filter-buttons">
          <button className="secaudit-clear-btn" onClick={handleClearFilters}>🗑️ Clear</button>
          <button className="secaudit-export-btn" onClick={handleExport}>📥 Export</button>
        </div>
      </div>

      <div className="secaudit-content-area">
        {activeTab === 'audit' && (
          <div className="secaudit-logs-container">
            {filteredData.map(log => (
              <div key={log.id} className="secaudit-log-item">
                <div className="secaudit-log-top">
                  <div className="secaudit-log-meta-top">
                    <span className="secaudit-log-identifier">{log.id}</span>
                    <span className="secaudit-log-timestamp">⏰ {log.timestamp}</span>
                  </div>
                  <span className={`secaudit-badge ${getStatusClass(log.status)}`}>{log.status.toUpperCase()}</span>
                </div>
                <div className="secaudit-log-main">
                  <div className="secaudit-log-icon-wrapper">📝</div>
                  <div className="secaudit-log-details">
                    <h3 className="secaudit-log-heading">{log.action}</h3>
                    <p className="secaudit-log-text">{log.details}</p>
                    <div className="secaudit-log-metadata">
                      <span className="secaudit-meta-tag">👤 {log.user}</span>
                      <span className="secaudit-meta-tag">🏷️ {log.category}</span>
                      <span className="secaudit-meta-tag">💻 {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="secaudit-log-footer">
                  <button className="secaudit-view-btn" onClick={() => handleViewDetails(log)}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="secaudit-logs-container">
            {filteredData.map(event => (
              <div key={event.id} className="secaudit-log-item">
                <div className="secaudit-log-top">
                  <div className="secaudit-log-meta-top">
                    <span className="secaudit-log-identifier">{event.id}</span>
                    <span className={`secaudit-badge ${getSeverityClass(event.severity)}`}>{event.severity.toUpperCase()}</span>
                  </div>
                  <span className={`secaudit-badge ${getStatusClass(event.status)}`}>{event.status.toUpperCase()}</span>
                </div>
                <div className="secaudit-log-main">
                  <div className="secaudit-log-icon-wrapper">🔒</div>
                  <div className="secaudit-log-details">
                    <h3 className="secaudit-log-heading">{event.description}</h3>
                    <p className="secaudit-log-text">Action taken: {event.action}</p>
                    <div className="secaudit-log-metadata">
                      <span className="secaudit-meta-tag">👤 {event.user}</span>
                      <span className="secaudit-meta-tag">📍 {event.location}</span>
                      <span className="secaudit-meta-tag">💻 {event.ipAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="secaudit-log-footer">
                  <button className="secaudit-view-btn" onClick={() => handleViewDetails(event)}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'access' && (
          <div className="secaudit-logs-container">
            {filteredData.map(access => (
              <div key={access.id} className="secaudit-log-item">
                <div className="secaudit-log-top">
                  <div className="secaudit-log-meta-top">
                    <span className="secaudit-log-identifier">{access.id}</span>
                    <span className="secaudit-log-timestamp">⏰ {access.timestamp}</span>
                  </div>
                  <span className={`secaudit-badge ${getStatusClass(access.status)}`}>{access.status.toUpperCase()}</span>
                </div>
                <div className="secaudit-log-main">
                  <div className="secaudit-log-icon-wrapper">👥</div>
                  <div className="secaudit-log-details">
                    <h3 className="secaudit-log-heading">{access.action} - {access.user}</h3>
                    <p className="secaudit-log-text">Session: {access.sessionDuration}</p>
                    <div className="secaudit-log-metadata">
                      <span className="secaudit-meta-tag">🆔 {access.userId}</span>
                      <span className="secaudit-meta-tag">📍 {access.location}</span>
                      <span className="secaudit-meta-tag">💻 {access.ipAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="secaudit-log-footer">
                  <button className="secaudit-view-btn" onClick={() => handleViewDetails(access)}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailsDrawer && selectedLog && (
        <div className="secaudit-modal-overlay">
          <div className="secaudit-modal-backdrop" onClick={() => setShowDetailsDrawer(false)} />
          <div className={`secaudit-side-panel ${showDetailsDrawer ? 'secaudit-panel-visible' : ''}`}>
            <div className="secaudit-panel-header">
              <h3 className="secaudit-panel-title">Log Details - {selectedLog.id}</h3>
              <button className="secaudit-panel-close" onClick={() => setShowDetailsDrawer(false)}>×</button>
            </div>
            <div className="secaudit-panel-body">
              <div className="secaudit-info-section">
                <h4 className="secaudit-info-title">General Information</h4>
                <div className="secaudit-info-grid">
                  <div className="secaudit-info-field">
                    <span className="secaudit-field-label">ID</span>
                    <span className="secaudit-field-value">{selectedLog.id}</span>
                  </div>
                  <div className="secaudit-info-field">
                    <span className="secaudit-field-label">Timestamp</span>
                    <span className="secaudit-field-value">{selectedLog.timestamp}</span>
                  </div>
                  {selectedLog.user && (
                    <div className="secaudit-info-field">
                      <span className="secaudit-field-label">User</span>
                      <span className="secaudit-field-value">{selectedLog.user}</span>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div className="secaudit-info-field">
                      <span className="secaudit-field-label">IP Address</span>
                      <span className="secaudit-field-value">{selectedLog.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>
              {selectedLog.changes && (
                <div className="secaudit-info-section">
                  <h4 className="secaudit-info-title">Changes Made</h4>
                  <div className="secaudit-code-block">
                    <pre className="secaudit-code-text">{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="secaudit-panel-footer">
              <button className="secaudit-action-btn secaudit-btn-cancel" onClick={() => setShowDetailsDrawer(false)}>Close</button>
              <button className="secaudit-action-btn secaudit-btn-note" onClick={handleAddNote}>📝 Add Note</button>
              <button className="secaudit-action-btn secaudit-btn-download" onClick={handleExportLog}>📥 Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;