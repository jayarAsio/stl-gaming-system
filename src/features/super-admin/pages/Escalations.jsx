import React, { useState, useMemo } from 'react';
import '../styles/escalations.css';

const AlertsEscalations = () => {
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    category: 'all',
    search: ''
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Mock alerts data
  const allAlerts = [
    {
      id: 'ALT-001',
      timestamp: '2025-10-24 10:15:23',
      severity: 'critical',
      category: 'system',
      title: 'Database Connection Failed',
      description: 'Unable to establish connection to primary database server',
      status: 'active',
      source: 'System Monitor',
      affectedSystems: ['Database', 'API', 'Web Portal'],
      escalatedTo: 'IT Team',
      assignedTo: 'John Reyes',
      escalationLevel: 3,
      responseTime: '2 mins',
      resolution: null
    },
    {
      id: 'ALT-002',
      timestamp: '2025-10-24 09:45:12',
      severity: 'high',
      category: 'security',
      title: 'Multiple Failed Login Attempts',
      description: 'User T-0045 attempted 10 failed logins in 5 minutes',
      status: 'investigating',
      source: 'Security System',
      affectedSystems: ['Authentication'],
      escalatedTo: 'Security Team',
      assignedTo: 'Maria Santos',
      escalationLevel: 2,
      responseTime: '5 mins',
      resolution: null
    },
    {
      id: 'ALT-003',
      timestamp: '2025-10-24 09:30:45',
      severity: 'medium',
      category: 'operations',
      title: 'High Transaction Volume',
      description: 'Transaction volume exceeded 150% of normal threshold',
      status: 'monitoring',
      source: 'Operations Monitor',
      affectedSystems: ['Payment Gateway', 'Teller System'],
      escalatedTo: 'Operations Team',
      assignedTo: 'Carlos Dela Cruz',
      escalationLevel: 1,
      responseTime: '10 mins',
      resolution: null
    },
    {
      id: 'ALT-004',
      timestamp: '2025-10-24 09:00:33',
      severity: 'low',
      category: 'compliance',
      title: 'Bet Limit Warning',
      description: 'Player exceeded 80% of daily bet limit',
      status: 'resolved',
      source: 'Compliance System',
      affectedSystems: ['Betting System'],
      escalatedTo: 'Compliance Team',
      assignedTo: 'Ana Garcia',
      escalationLevel: 1,
      responseTime: '15 mins',
      resolution: 'Player notified, no action needed'
    },
    {
      id: 'ALT-005',
      timestamp: '2025-10-24 08:45:11',
      severity: 'critical',
      category: 'financial',
      title: 'Payout Discrepancy Detected',
      description: 'Mismatch between calculated and actual payout for draw STL-1030',
      status: 'escalated',
      source: 'Financial Monitor',
      affectedSystems: ['Payout System', 'Accounting'],
      escalatedTo: 'Finance Director',
      assignedTo: 'Roberto Cruz',
      escalationLevel: 3,
      responseTime: '1 min',
      resolution: null
    },
    {
      id: 'ALT-006',
      timestamp: '2025-10-24 08:30:22',
      severity: 'high',
      category: 'system',
      title: 'Server CPU Usage Critical',
      description: 'Server SRV-02 CPU usage at 95% for 10 minutes',
      status: 'resolved',
      source: 'Infrastructure Monitor',
      affectedSystems: ['Application Server'],
      escalatedTo: 'DevOps Team',
      assignedTo: 'Pedro Santos',
      escalationLevel: 2,
      responseTime: '3 mins',
      resolution: 'Auto-scaling triggered, additional resources allocated'
    },
    {
      id: 'ALT-007',
      timestamp: '2025-10-24 08:15:55',
      severity: 'medium',
      category: 'operations',
      title: 'Teller Terminal Offline',
      description: 'Terminal T-0023 at Area-05 not responding',
      status: 'investigating',
      source: 'Terminal Monitor',
      affectedSystems: ['Teller System'],
      escalatedTo: 'Technical Support',
      assignedTo: 'Luis Ramos',
      escalationLevel: 1,
      responseTime: '8 mins',
      resolution: null
    },
    {
      id: 'ALT-008',
      timestamp: '2025-10-24 07:50:33',
      severity: 'low',
      category: 'compliance',
      title: 'Daily Report Generation Delayed',
      description: 'Report generation took 20% longer than usual',
      status: 'resolved',
      source: 'Report System',
      affectedSystems: ['Reporting'],
      escalatedTo: 'IT Support',
      assignedTo: 'Elena Cruz',
      escalationLevel: 1,
      responseTime: '20 mins',
      resolution: 'Report generated successfully, performance optimized'
    }
  ];

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;
      const matchesStatus = filters.status === 'all' || alert.status === filters.status;
      const matchesCategory = filters.category === 'all' || alert.category === filters.category;
      const matchesSearch = filters.search === '' ||
        alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.id.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSeverity && matchesStatus && matchesCategory && matchesSearch;
    });
  }, [allAlerts, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allAlerts.length;
    const active = allAlerts.filter(a => a.status === 'active').length;
    const critical = allAlerts.filter(a => a.severity === 'critical').length;
    const escalated = allAlerts.filter(a => a.status === 'escalated').length;
    const resolved = allAlerts.filter(a => a.status === 'resolved').length;
    
    return { total, active, critical, escalated, resolved };
  }, [allAlerts]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle view details
  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsDrawer(true);
  };

  // Get severity icon and color
  const getSeverityInfo = (severity) => {
    const map = {
      critical: { icon: '🔴', label: 'CRITICAL', class: 'severity-critical' },
      high: { icon: '🟠', label: 'HIGH', class: 'severity-high' },
      medium: { icon: '🟡', label: 'MEDIUM', class: 'severity-medium' },
      low: { icon: '🟢', label: 'LOW', class: 'severity-low' }
    };
    return map[severity] || map.low;
  };

  // Get status info
  const getStatusInfo = (status) => {
    const map = {
      active: { label: 'ACTIVE', class: 'status-active' },
      investigating: { label: 'INVESTIGATING', class: 'status-investigating' },
      escalated: { label: 'ESCALATED', class: 'status-escalated' },
      monitoring: { label: 'MONITORING', class: 'status-monitoring' },
      resolved: { label: 'RESOLVED', class: 'status-resolved' }
    };
    return map[status] || map.active;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const map = {
      system: '⚙️',
      security: '🔒',
      operations: '📊',
      compliance: '📋',
      financial: '💰'
    };
    return map[category] || '📌';
  };

  return (
    <div className="alerts-escalations">
      {/* Header */}
      <div className="alerts-header">
        <div>
          <h1 className="alerts-title">Alerts & Escalations</h1>
          <p className="alerts-subtitle">Monitor and manage system alerts in real-time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="alerts-stats">
        <div className="stat-card">
          <div className="stat-icon stat-blue">📊</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-red">🔴</div>
          <div>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange">⚠️</div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple">🔼</div>
          <div>
            <div className="stat-value">{stats.escalated}</div>
            <div className="stat-label">Escalated</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-green">✅</div>
          <div>
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="alerts-filters">
        <div className="filter-group filter-search">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search alerts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Severity</label>
          <select value={filters.severity} onChange={(e) => handleFilterChange('severity', e.target.value)}>
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="escalated">Escalated</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="all">All Categories</option>
            <option value="system">System</option>
            <option value="security">Security</option>
            <option value="operations">Operations</option>
            <option value="compliance">Compliance</option>
            <option value="financial">Financial</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <h3>No alerts found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const severityInfo = getSeverityInfo(alert.severity);
            const statusInfo = getStatusInfo(alert.status);
            
            return (
              <div key={alert.id} className="alert-card">
                <div className="alert-main">
                  <div className="alert-header-row">
                    <div className="alert-id-severity">
                      <span className="alert-id">{alert.id}</span>
                      <span className={`severity-badge ${severityInfo.class}`}>
                        {severityInfo.icon} {severityInfo.label}
                      </span>
                    </div>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="alert-content">
                    <div className="alert-icon">{getCategoryIcon(alert.category)}</div>
                    <div className="alert-info">
                      <h3 className="alert-title">{alert.title}</h3>
                      <p className="alert-description">{alert.description}</p>
                      <div className="alert-meta">
                        <span className="meta-item">
                          <span className="meta-icon">⏰</span>
                          {alert.timestamp}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">👤</span>
                          {alert.assignedTo}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">🔼</span>
                          Level {alert.escalationLevel}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">⚡</span>
                          Response: {alert.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="alert-actions">
                  <button className="btn-view" onClick={() => handleViewDetails(alert)}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Drawer - Single Container */}
      {showDetailsDrawer && selectedAlert && (
        <div className="drawer-container">
          <div className="drawer-scrim" onClick={() => setShowDetailsDrawer(false)} />
          <div className={`details-drawer ${showDetailsDrawer ? 'open' : ''}`}>
            <div className="drawer-header">
              <h3>Alert Details - {selectedAlert.id}</h3>
              <button className="drawer-close" onClick={() => setShowDetailsDrawer(false)}>×</button>
            </div>
            
            <div className="drawer-body">
              {/* Alert Summary */}
              <div className="detail-section">
                <h4 className="section-title">Alert Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Alert ID</span>
                    <span className="detail-value">{selectedAlert.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timestamp</span>
                    <span className="detail-value">{selectedAlert.timestamp}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Severity</span>
                    <span className={`severity-badge ${getSeverityInfo(selectedAlert.severity).class}`}>
                      {getSeverityInfo(selectedAlert.severity).icon} {getSeverityInfo(selectedAlert.severity).label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${getStatusInfo(selectedAlert.status).class}`}>
                      {getStatusInfo(selectedAlert.status).label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">
                      {getCategoryIcon(selectedAlert.category)} {selectedAlert.category.charAt(0).toUpperCase() + selectedAlert.category.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source</span>
                    <span className="detail-value">{selectedAlert.source}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h4 className="section-title">Description</h4>
                <div className="detail-description">
                  <h5>{selectedAlert.title}</h5>
                  <p>{selectedAlert.description}</p>
                </div>
              </div>

              {/* Affected Systems */}
              <div className="detail-section">
                <h4 className="section-title">Affected Systems</h4>
                <div className="system-tags">
                  {selectedAlert.affectedSystems.map((system, index) => (
                    <span key={index} className="system-tag">⚙️ {system}</span>
                  ))}
                </div>
              </div>

              {/* Escalation Info */}
              <div className="detail-section">
                <h4 className="section-title">Escalation Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Escalation Level</span>
                    <span className="detail-value escalation-level">
                      Level {selectedAlert.escalationLevel}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Escalated To</span>
                    <span className="detail-value">{selectedAlert.escalatedTo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Assigned To</span>
                    <span className="detail-value">{selectedAlert.assignedTo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Response Time</span>
                    <span className="detail-value">{selectedAlert.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Resolution */}
              {selectedAlert.resolution && (
                <div className="detail-section">
                  <h4 className="section-title">Resolution</h4>
                  <div className="resolution-box">
                    <p>{selectedAlert.resolution}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsDrawer(false)}>
                Close
              </button>
              <button className="btn btn-primary">
                📝 Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsEscalations;