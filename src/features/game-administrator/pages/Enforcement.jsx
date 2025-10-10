import React, { useState, useMemo } from 'react';
import '../styles/enforcement.css';

const Enforcement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-10-11');
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock data for audit logs
  const auditLogs = [
    { 
      id: 1, 
      timestamp: '2025-10-11 09:15:23', 
      user: 'Admin-GA001', 
      role: 'Game Administrator',
      action: 'VOID_APPROVED', 
      target: 'Ticket #TIX-001234', 
      ip: '192.168.1.100', 
      status: 'success',
      details: 'Approved void request for ticket TIX-001234. Reason: Customer request. Amount: ₱500',
      deviceInfo: 'Windows 10 - Chrome 118'
    },
    { 
      id: 2, 
      timestamp: '2025-10-11 09:10:45', 
      user: 'Admin-GA002', 
      role: 'Game Administrator',
      action: 'USER_CREATED', 
      target: 'Teller-T125', 
      ip: '192.168.1.101', 
      status: 'success',
      details: 'Created new teller account: T125 (Juan Dela Cruz) assigned to Manila Central outlet',
      deviceInfo: 'Windows 11 - Edge 119'
    },
    { 
      id: 3, 
      timestamp: '2025-10-11 09:05:12', 
      user: 'Admin-GA001', 
      role: 'Game Administrator',
      action: 'DRAW_MODIFIED', 
      target: 'Draw #DRW-789', 
      ip: '192.168.1.100', 
      status: 'success',
      details: 'Modified draw schedule for SWER3 11:00 AM. Changed status from Pending to Active',
      deviceInfo: 'Windows 10 - Chrome 118'
    },
    { 
      id: 4, 
      timestamp: '2025-10-11 08:58:33', 
      user: 'Teller-T098', 
      role: 'Teller',
      action: 'LOGIN_FAILED', 
      target: 'System', 
      ip: '192.168.1.150', 
      status: 'failed',
      details: 'Failed login attempt. Incorrect password (3rd attempt)',
      deviceInfo: 'Android 13 - Chrome Mobile'
    },
    { 
      id: 5, 
      timestamp: '2025-10-11 08:45:21', 
      user: 'Admin-GA003', 
      role: 'Game Administrator',
      action: 'REPORT_GENERATED', 
      target: 'Sales Report - Oct 11', 
      ip: '192.168.1.102', 
      status: 'success',
      details: 'Generated daily sales report for October 11, 2025. Total records: 1,245',
      deviceInfo: 'macOS 14 - Safari 17'
    },
    { 
      id: 6, 
      timestamp: '2025-10-11 08:30:15', 
      user: 'Teller-T087', 
      role: 'Teller',
      action: 'TICKET_VOIDED', 
      target: 'Ticket #TIX-001220', 
      ip: '192.168.1.155', 
      status: 'success',
      details: 'Voided ticket TIX-001220. Amount: ₱250. Reason: Duplicate entry',
      deviceInfo: 'Windows 10 - Firefox 120'
    },
    { 
      id: 7, 
      timestamp: '2025-10-11 08:15:42', 
      user: 'Admin-GA001', 
      role: 'Game Administrator',
      action: 'CONFIG_CHANGED', 
      target: 'Game Settings - SWER3', 
      ip: '192.168.1.100', 
      status: 'success',
      details: 'Updated SWER3 configuration. Changed maximum bet limit from ₱10,000 to ₱15,000',
      deviceInfo: 'Windows 10 - Chrome 118'
    },
    { 
      id: 8, 
      timestamp: '2025-10-11 08:00:08', 
      user: 'Collector-C045', 
      role: 'Collector',
      action: 'REMITTANCE_SUBMITTED', 
      target: 'Manila Central', 
      ip: '192.168.1.175', 
      status: 'success',
      details: 'Submitted daily remittance for Manila Central. Total amount: ₱125,450',
      deviceInfo: 'iOS 17 - Safari Mobile'
    },
    { 
      id: 9, 
      timestamp: '2025-10-11 07:45:30', 
      user: 'Admin-GA002', 
      role: 'Game Administrator',
      action: 'USER_DISABLED', 
      target: 'Teller-T099', 
      ip: '192.168.1.101', 
      status: 'success',
      details: 'Disabled teller account T099 due to policy violation',
      deviceInfo: 'Windows 11 - Edge 119'
    },
    { 
      id: 10, 
      timestamp: '2025-10-11 07:30:15', 
      user: 'Teller-T112', 
      role: 'Teller',
      action: 'TICKET_CREATED', 
      target: 'Ticket #TIX-001245', 
      ip: '192.168.1.160', 
      status: 'success',
      details: 'Created new ticket TIX-001245. Game: SWER3, Amount: ₱1,200, Numbers: 12-34-56',
      deviceInfo: 'Windows 10 - Chrome 118'
    },
    { 
      id: 11, 
      timestamp: '2025-10-11 07:15:22', 
      user: 'Admin-GA001', 
      role: 'Game Administrator',
      action: 'DRAW_APPROVED', 
      target: 'Draw #DRW-790', 
      ip: '192.168.1.100', 
      status: 'success',
      details: 'Approved draw results for SWER3 9:00 AM. Winning numbers: 15-28-42',
      deviceInfo: 'Windows 10 - Chrome 118'
    },
    { 
      id: 12, 
      timestamp: '2025-10-11 07:00:05', 
      user: 'System', 
      role: 'System',
      action: 'BACKUP_COMPLETED', 
      target: 'Database Backup', 
      ip: '127.0.0.1', 
      status: 'success',
      details: 'Automated database backup completed successfully. Size: 2.4 GB',
      deviceInfo: 'Server - Automated Task'
    }
  ];

  // Filter logs based on search and date
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const logDate = log.timestamp.split(' ')[0];
      const matchesSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm);
      
      const matchesDate = logDate === selectedDate;
      const matchesAction = selectedAction === 'all' || log.action === selectedAction;
      const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
      const matchesRole = selectedRole === 'all' || log.role === selectedRole;
      
      return matchesSearch && matchesDate && matchesAction && matchesStatus && matchesRole;
    });
  }, [auditLogs, searchTerm, selectedDate, selectedAction, selectedStatus, selectedRole]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Target', 'IP Address', 'Status', 'Details', 'Device Info'];
    
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.user,
        log.role,
        log.action,
        `"${log.target}"`,
        log.ip,
        log.status,
        `"${log.details}"`,
        `"${log.deviceInfo}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionClass = (action, status) => {
    if (status === 'failed') return 'enf-log-failed';
    const criticalActions = ['USER_DISABLED', 'CONFIG_CHANGED', 'DRAW_MODIFIED'];
    if (criticalActions.includes(action)) return 'enf-log-critical';
    return 'enf-log-success';
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  return (
    <div className="enf-container">
      {/* Header - Same as Reports Module */}
      <div className="enf-header">
        <div className="enf-header-content">
          <div>
            <h1 className="enf-title">Enforcement & Security</h1>
            <p className="enf-subtitle">System audit logs and security monitoring</p>
          </div>
          <div className="enf-header-actions">
            <button className="enf-export-btn-header" onClick={exportToCSV}>
              📥 Export to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="enf-filters-card">
        <div className="enf-filters">
          <div className="enf-search-wrapper">
            <input
              type="text"
              className="enf-search-input"
              placeholder="Search by user, action, target, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="enf-search-icon">🔍</span>
          </div>

          <div className="enf-date-filters">
            <div className="enf-date-group">
              <label htmlFor="selected-date" className="enf-date-label">Date</label>
              <input
                id="selected-date"
                type="date"
                className="enf-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <select
            className="enf-filter-select"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="VOID_APPROVED">Void Approved</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_DISABLED">User Disabled</option>
            <option value="DRAW_MODIFIED">Draw Modified</option>
            <option value="DRAW_APPROVED">Draw Approved</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="REPORT_GENERATED">Report Generated</option>
            <option value="TICKET_VOIDED">Ticket Voided</option>
            <option value="TICKET_CREATED">Ticket Created</option>
            <option value="CONFIG_CHANGED">Config Changed</option>
            <option value="REMITTANCE_SUBMITTED">Remittance Submitted</option>
            <option value="BACKUP_COMPLETED">Backup Completed</option>
          </select>

          <select
            className="enf-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="enf-filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Game Administrator">Game Administrator</option>
            <option value="Teller">Teller</option>
            <option value="Collector">Collector</option>
            <option value="System">System</option>
          </select>
        </div>
        
        <div className="enf-results-count">
          Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> audit logs
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="enf-card">
        <h3 className="enf-card-title">System Audit Logs</h3>
        <div className="enf-table-wrapper">
          <table className="enf-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className={getActionClass(log.action, log.status)}>
                    <td className="enf-td-time">{log.timestamp}</td>
                    <td className="enf-td-user">
                      <div className="enf-user-cell">
                        <span className="enf-user-name">{log.user}</span>
                        <span className="enf-user-role">{log.role}</span>
                      </div>
                    </td>
                    <td className="enf-td-action">{log.action.replace(/_/g, ' ')}</td>
                    <td>{log.target}</td>
                    <td className="enf-td-ip">{log.ip}</td>
                    <td>
                      <span className={`enf-pill ${log.status === 'success' ? 'enf-pill-success' : 'enf-pill-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="enf-btn-view-small"
                        onClick={() => handleViewDetails(log)}
                      >
                        View Info
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="enf-no-results">
                    No audit logs found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <>
          <div className="enf-drawer-overlay" onClick={handleCloseDetails} />
          <div className="enf-drawer">
            <div className="enf-drawer-header">
              <h3>Audit Log Details</h3>
              <button className="enf-drawer-close" onClick={handleCloseDetails}>
                ×
              </button>
            </div>
            <div className="enf-drawer-content">
              <div className="enf-drawer-section">
                <h4>Log Information</h4>
                <div className="enf-detail-grid">
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Log ID</span>
                    <span className="enf-detail-value">#{selectedLog.id}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Timestamp</span>
                    <span className="enf-detail-value">{selectedLog.timestamp}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">User</span>
                    <span className="enf-detail-value">{selectedLog.user}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Role</span>
                    <span className="enf-detail-value">{selectedLog.role}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Action</span>
                    <span className="enf-detail-value">{selectedLog.action.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Target</span>
                    <span className="enf-detail-value">{selectedLog.target}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">IP Address</span>
                    <span className="enf-detail-value">{selectedLog.ip}</span>
                  </div>
                  <div className="enf-detail-item">
                    <span className="enf-detail-label">Status</span>
                    <span className={`enf-pill ${selectedLog.status === 'success' ? 'enf-pill-success' : 'enf-pill-danger'}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div className="enf-detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="enf-detail-label">Device Info</span>
                    <span className="enf-detail-value">{selectedLog.deviceInfo}</span>
                  </div>
                </div>
              </div>

              <div className="enf-drawer-section">
                <h4>Details</h4>
                <p className="enf-drawer-description">{selectedLog.details}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Enforcement;