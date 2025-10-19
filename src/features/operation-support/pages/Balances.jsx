import React, { useState } from 'react';
import '../styles/balances.css';

const BalancesPage = () => {
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' or 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCallModal, setShowCallModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [callNote, setCallNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Daily Verification Data
  const [verificationBalances, setVerificationBalances] = useState([
    {
      id: 'VB001',
      tellerName: 'Maria Santos',
      tellerId: 'TEL-001',
      date: 'Oct 16, 2025',
      sales: 85000,
      payouts: 25000,
      expected: 110000,
      actual: 110000,
      status: 'balanced',
      phone: '0917-123-4567',
      verified: false,
    },
    {
      id: 'VB002',
      tellerName: 'Juan Cruz',
      tellerId: 'TEL-002',
      date: 'Oct 16, 2025',
      sales: 67000,
      payouts: 18000,
      expected: 99000,
      actual: 98500,
      status: 'short',
      phone: '0917-234-5678',
      verified: false,
      discrepancy: -500,
    },
    {
      id: 'VB003',
      tellerName: 'Ana Reyes',
      tellerId: 'TEL-003',
      date: 'Oct 16, 2025',
      sales: 92000,
      payouts: 31000,
      expected: 123000,
      actual: 123000,
      status: 'balanced',
      phone: '0917-345-6789',
      verified: true,
    },
  ]);

  // Pending/Outstanding Data
  const [pendingBalances, setPendingBalances] = useState([
    {
      id: 'PB001',
      name: 'Juan Cruz',
      role: 'Teller',
      roleId: 'TEL-002',
      amount: 15000,
      pendingSince: 'Oct 10, 2025',
      daysPending: 6,
      lastContact: 'Oct 14, 2025',
      followUpDate: 'Oct 18, 2025',
      phone: '0917-234-5678',
      status: 'pending',
      notes: 'Promised to pay by Oct 18',
      priority: 'medium',
    },
    {
      id: 'PB002',
      name: 'Pedro Reyes',
      role: 'Collector',
      roleId: 'COL-001',
      amount: 8500,
      pendingSince: 'Oct 5, 2025',
      daysPending: 11,
      lastContact: 'Oct 15, 2025',
      followUpDate: 'Oct 17, 2025',
      phone: '0915-987-6543',
      status: 'overdue',
      notes: 'Setting up payment plan',
      priority: 'high',
    },
    {
      id: 'PB003',
      name: 'Lisa Garcia',
      role: 'Teller',
      roleId: 'TEL-005',
      amount: 5000,
      pendingSince: 'Oct 14, 2025',
      daysPending: 2,
      lastContact: 'Oct 15, 2025',
      followUpDate: 'Oct 19, 2025',
      phone: '0917-456-7890',
      status: 'pending',
      notes: 'Will pay partial tomorrow',
      priority: 'low',
    },
  ]);

  // Handle Mark as Verified
  const handleMarkVerified = (id) => {
    setVerificationBalances(verificationBalances.map(balance =>
      balance.id === id ? { ...balance, verified: true } : balance
    ));
  };

  // Handle Flag Discrepancy
  const handleFlagDiscrepancy = (balance) => {
    setSelectedBalance(balance);
    setShowCallModal(true);
  };

  // Handle Call Button
  const handleCallClick = (balance) => {
    setSelectedBalance(balance);
    setCallNote('');
    setFollowUpDate(balance.followUpDate || '');
    setShowCallModal(true);
  };

  // Handle View Details
  const handleViewDetails = (balance) => {
    setSelectedBalance(balance);
    setShowDetailsModal(true);
  };

  // Handle Save Call Notes
  const handleSaveCallNotes = () => {
    if (activeTab === 'pending') {
      setPendingBalances(pendingBalances.map(balance =>
        balance.id === selectedBalance.id
          ? {
              ...balance,
              notes: callNote,
              followUpDate: followUpDate,
              lastContact: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            }
          : balance
      ));
    }
    setShowCallModal(false);
    setCallNote('');
    setFollowUpDate('');
  };

  // Handle Mark as Paid
  const handleMarkPaid = (id) => {
    setPendingBalances(pendingBalances.map(balance =>
      balance.id === id ? { ...balance, status: 'paid' } : balance
    ));
  };

  // Close Modals
  const closeModals = () => {
    setShowCallModal(false);
    setShowDetailsModal(false);
    setSelectedBalance(null);
    setCallNote('');
    setFollowUpDate('');
  };

  // Get Status Badge Class
  const getStatusClass = (status) => {
    switch (status) {
      case 'balanced':
      case 'paid':
        return 'verified';
      case 'short':
      case 'overdue':
        return 'short';
      case 'pending':
        return 'pending';
      default:
        return '';
    }
  };

  // Get Status Label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'balanced':
        return '✓ Balanced';
      case 'short':
        return '❌ Short';
      case 'pending':
        return '⏳ Pending';
      case 'overdue':
        return '🚨 Overdue';
      case 'paid':
        return '✓ Paid';
      default:
        return status;
    }
  };

  // Get Priority Badge Class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  // Check if follow-up date is today or overdue
  const isFollowUpDue = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    return followUp <= today;
  };

  // Filter Data
  const filteredVerification = verificationBalances.filter(balance => {
    const matchesSearch = balance.tellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          balance.tellerId.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'verified') {
      matchesStatus = balance.verified === true;
    } else if (filterStatus === 'unverified') {
      matchesStatus = balance.verified === false;
    } else if (filterStatus !== 'all') {
      matchesStatus = balance.status === filterStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const filteredPending = pendingBalances.filter(balance => {
    const matchesSearch = balance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          balance.roleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || balance.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="os-balances-container">
      {/* Header */}
      <div className="os-balances-header">
        <div className="os-balances-header-content">
          <div className="os-balances-header-main">
            <div className="os-balances-icon">💰</div>
            <div className="os-balances-header-text">
              <h1 className="os-balances-title">Balances Management</h1>
              <p className="os-balances-subtitle">
                Daily verification and pending payment tracking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="os-balances-card">
        {/* Tabs */}
        <div className="os-tabs-bar">
          <button
            className={`os-tab ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('verification');
              setFilterStatus('all');
            }}
          >
            <span className="os-tab-icon">✓</span>
            <span className="os-tab-label">Daily Verification</span>
            <span className="os-tab-count">{verificationBalances.length}</span>
          </button>
          <button
            className={`os-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pending');
              setFilterStatus('all');
            }}
          >
            <span className="os-tab-icon">⏳</span>
            <span className="os-tab-label">Pending/Outstanding</span>
            <span className="os-tab-count">{pendingBalances.filter(b => b.status !== 'paid').length}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="os-balances-filters">
          <div className="os-search-wrapper">
            <span className="os-search-icon">🔍</span>
            <input
              type="text"
              className="os-search-input"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="os-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {activeTab === 'verification' ? (
              <>
                <option value="balanced">Balanced</option>
                <option value="short">Short</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </>
            )}
          </select>
        </div>

        {/* Content */}
        <div className="os-balances-content">
          {activeTab === 'verification' ? (
            // Daily Verification Tab
            <div className="os-verification-list">
              {filteredVerification.length === 0 ? (
                <div className="os-empty-state">
                  <span className="os-empty-icon">📋</span>
                  <p className="os-empty-text">No balances found</p>
                </div>
              ) : (
                filteredVerification.map((balance) => (
                  <div key={balance.id} className="os-balance-item">
                    <div className="os-balance-header">
                      <div className="os-balance-main-info">
                        <div className="os-balance-avatar">
                          {balance.tellerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="os-balance-details">
                          <div className="os-balance-name">{balance.tellerName}</div>
                          <div className="os-balance-meta">
                            {balance.tellerId} • {balance.date}
                          </div>
                        </div>
                      </div>
                      <div className={`os-status-badge ${getStatusClass(balance.status)}`}>
                        {getStatusLabel(balance.status)}
                      </div>
                    </div>

                    <div className="os-balance-summary">
                      <div className="os-summary-row">
                        <div className="os-summary-item">
                          <span className="os-summary-label">Sales:</span>
                          <span className="os-summary-value">₱{balance.sales.toLocaleString()}</span>
                        </div>
                        <div className="os-summary-item">
                          <span className="os-summary-label">Payouts:</span>
                          <span className="os-summary-value">₱{balance.payouts.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="os-summary-row">
                        <div className="os-summary-item">
                          <span className="os-summary-label">Expected:</span>
                          <span className="os-summary-value highlight">₱{balance.expected.toLocaleString()}</span>
                        </div>
                        <div className="os-summary-item">
                          <span className="os-summary-label">Actual:</span>
                          <span className={`os-summary-value highlight ${balance.status === 'short' ? 'error' : 'success'}`}>
                            ₱{balance.actual.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {balance.discrepancy && (
                        <div className="os-discrepancy-alert">
                          ⚠️ Discrepancy: ₱{Math.abs(balance.discrepancy).toLocaleString()} short
                        </div>
                      )}
                    </div>

                    <div className="os-balance-contact">
                      <span className="os-contact-icon">📱</span>
                      <span className="os-contact-number">{balance.phone}</span>
                      <span className="os-contact-label">Call manually to verify</span>
                    </div>

                    <div className="os-balance-actions">
                      <button
                        className="os-btn-secondary"
                        onClick={() => handleViewDetails(balance)}
                      >
                        View Details
                      </button>
                      {balance.status === 'short' && (
                        <button
                          className="os-btn-call"
                          onClick={() => handleFlagDiscrepancy(balance)}
                        >
                          <span>📱</span>
                          <span>Add Call Notes</span>
                        </button>
                      )}
                      {!balance.verified ? (
                        <button
                          className="os-btn-verify"
                          onClick={() => handleMarkVerified(balance.id)}
                        >
                          <span>✓</span>
                          <span>Mark Verified</span>
                        </button>
                      ) : (
                        <span className="os-verified-badge">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Pending/Outstanding Tab
            <div className="os-pending-list">
              {filteredPending.length === 0 ? (
                <div className="os-empty-state">
                  <span className="os-empty-icon">💰</span>
                  <p className="os-empty-text">No pending payments found</p>
                </div>
              ) : (
                filteredPending.map((balance) => (
                  <div key={balance.id} className={`os-pending-item ${balance.status}`}>
                    <div className="os-pending-header">
                      <div className="os-pending-main-info">
                        <div className="os-pending-avatar">
                          {balance.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="os-pending-details">
                          <div className="os-pending-name">{balance.name}</div>
                          <div className="os-pending-meta">
                            {balance.role} • {balance.roleId}
                          </div>
                        </div>
                      </div>
                      <div className="os-pending-badges">
                        <div className={`os-priority-badge ${getPriorityClass(balance.priority)}`}>
                          {balance.priority}
                        </div>
                        <div className={`os-status-badge ${getStatusClass(balance.status)}`}>
                          {getStatusLabel(balance.status)}
                        </div>
                      </div>
                    </div>

                    <div className="os-pending-amount-section">
                      <div className="os-amount-card">
                        <span className="os-amount-label">Outstanding Amount</span>
                        <span className="os-amount-value">₱{balance.amount.toLocaleString()}</span>
                      </div>
                      <div className="os-pending-timeline">
                        <div className="os-timeline-item">
                          <span className="os-timeline-label">Pending Since:</span>
                          <span className="os-timeline-value">{balance.pendingSince}</span>
                        </div>
                        <div className="os-timeline-item">
                          <span className="os-timeline-label">Days Pending:</span>
                          <span className={`os-timeline-value ${balance.daysPending > 7 ? 'urgent' : ''}`}>
                            {balance.daysPending} days
                          </span>
                        </div>
                        <div className="os-timeline-item">
                          <span className="os-timeline-label">Last Contact:</span>
                          <span className="os-timeline-value">{balance.lastContact}</span>
                        </div>
                        {balance.followUpDate && (
                          <div className="os-timeline-item">
                            <span className="os-timeline-label">Follow-up Date:</span>
                            <span className={`os-timeline-value ${isFollowUpDue(balance.followUpDate) ? 'urgent' : ''}`}>
                              {balance.followUpDate}
                              {isFollowUpDue(balance.followUpDate) && ' 🔔'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {balance.notes && (
                      <div className="os-notes-section">
                        <span className="os-notes-icon">📝</span>
                        <span className="os-notes-text">{balance.notes}</span>
                      </div>
                    )}

                    <div className="os-pending-contact">
                      <span className="os-contact-icon">📱</span>
                      <span className="os-contact-number">{balance.phone}</span>
                      <span className="os-contact-label">Call manually for follow-up</span>
                    </div>

                    <div className="os-pending-actions">
                      <button
                        className="os-btn-secondary"
                        onClick={() => handleViewDetails(balance)}
                      >
                        View Details
                      </button>
                      <button
                        className="os-btn-call"
                        onClick={() => handleCallClick(balance)}
                      >
                        <span>📱</span>
                        <span>Log Call</span>
                      </button>
                      {balance.status !== 'paid' && (
                        <button
                          className="os-btn-paid"
                          onClick={() => handleMarkPaid(balance.id)}
                        >
                          <span>💰</span>
                          <span>Mark Paid</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call Notes Modal */}
      {showCallModal && (
        <>
          <div className="os-modal-overlay active" onClick={closeModals}></div>
          <div className="os-modal-container active">
            <div className="os-modal-content">
              <div className="os-modal-header">
                <h3>Log Call Notes</h3>
                <button className="os-modal-close" onClick={closeModals}>
                  ×
                </button>
              </div>
              <div className="os-modal-body">
                {selectedBalance && (
                  <>
                    <div className="os-modal-info">
                      <div className="os-modal-info-row">
                        <span className="os-modal-label">Name:</span>
                        <span className="os-modal-value">
                          {selectedBalance.tellerName || selectedBalance.name}
                        </span>
                      </div>
                      <div className="os-modal-info-row">
                        <span className="os-modal-label">Phone:</span>
                        <span className="os-modal-value">{selectedBalance.phone}</span>
                      </div>
                      {selectedBalance.amount && (
                        <div className="os-modal-info-row">
                          <span className="os-modal-label">Amount:</span>
                          <span className="os-modal-value">
                            ₱{selectedBalance.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="os-form-group">
                      <label className="os-form-label">Call Notes</label>
                      <textarea
                        className="os-form-textarea"
                        rows="4"
                        placeholder="Enter call outcome, payment commitment, or any relevant information..."
                        value={callNote}
                        onChange={(e) => setCallNote(e.target.value)}
                      />
                    </div>

                    <div className="os-form-group">
                      <label className="os-form-label">Follow-up Date</label>
                      <input
                        type="date"
                        className="os-form-input"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                      <p className="os-form-help-text">Set a reminder date for next follow-up call</p>
                    </div>
                  </>
                )}
              </div>
              <div className="os-modal-footer">
                <button className="os-btn-secondary" onClick={closeModals}>
                  Cancel
                </button>
                <button
                  className="os-btn-primary"
                  onClick={handleSaveCallNotes}
                  disabled={!callNote.trim()}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBalance && (
        <>
          <div className="os-modal-overlay active" onClick={closeModals}></div>
          <div className="os-modal-container active">
            <div className="os-modal-content">
              <div className="os-modal-header">
                <h3>Balance Details</h3>
                <button className="os-modal-close" onClick={closeModals}>
                  ×
                </button>
              </div>
              <div className="os-modal-body">
                <div className="os-details-card">
                  <h4 className="os-details-section-title">
                    {selectedBalance.tellerName || selectedBalance.name}
                  </h4>
                  
                  {activeTab === 'verification' ? (
                    <>
                      <div className="os-details-row">
                        <span className="os-details-label">Teller ID:</span>
                        <span className="os-details-value">{selectedBalance.tellerId}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Date:</span>
                        <span className="os-details-value">{selectedBalance.date}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Sales:</span>
                        <span className="os-details-value">₱{selectedBalance.sales.toLocaleString()}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Payouts:</span>
                        <span className="os-details-value">₱{selectedBalance.payouts.toLocaleString()}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Expected Balance:</span>
                        <span className="os-details-value highlight">₱{selectedBalance.expected.toLocaleString()}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Actual Balance:</span>
                        <span className={`os-details-value highlight ${selectedBalance.status === 'short' ? 'error' : 'success'}`}>
                          ₱{selectedBalance.actual.toLocaleString()}
                        </span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Status:</span>
                        <span className={`os-status-badge ${getStatusClass(selectedBalance.status)}`}>
                          {getStatusLabel(selectedBalance.status)}
                        </span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Verification Status:</span>
                        <span className={`os-status-badge ${selectedBalance.verified ? 'verified' : 'pending'}`}>
                          {selectedBalance.verified ? '✓ Verified' : '⏳ Unverified'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="os-details-row">
                        <span className="os-details-label">Role:</span>
                        <span className="os-details-value">{selectedBalance.role}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Role ID:</span>
                        <span className="os-details-value">{selectedBalance.roleId}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Outstanding Amount:</span>
                        <span className="os-details-value highlight error">₱{selectedBalance.amount.toLocaleString()}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Pending Since:</span>
                        <span className="os-details-value">{selectedBalance.pendingSince}</span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Days Pending:</span>
                        <span className={`os-details-value ${selectedBalance.daysPending > 7 ? 'urgent' : ''}`}>
                          {selectedBalance.daysPending} days
                        </span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Last Contact:</span>
                        <span className="os-details-value">{selectedBalance.lastContact}</span>
                      </div>
                      {selectedBalance.followUpDate && (
                        <div className="os-details-row">
                          <span className="os-details-label">Follow-up Date:</span>
                          <span className={`os-details-value ${isFollowUpDue(selectedBalance.followUpDate) ? 'urgent' : ''}`}>
                            {selectedBalance.followUpDate}
                            {isFollowUpDue(selectedBalance.followUpDate) && ' 🔔'}
                          </span>
                        </div>
                      )}
                      <div className="os-details-row">
                        <span className="os-details-label">Priority:</span>
                        <span className={`os-priority-badge ${getPriorityClass(selectedBalance.priority)}`}>
                          {selectedBalance.priority}
                        </span>
                      </div>
                      <div className="os-details-row">
                        <span className="os-details-label">Status:</span>
                        <span className={`os-status-badge ${getStatusClass(selectedBalance.status)}`}>
                          {getStatusLabel(selectedBalance.status)}
                        </span>
                      </div>
                      {selectedBalance.notes && (
                        <div className="os-details-notes">
                          <span className="os-details-label">Notes:</span>
                          <p className="os-details-notes-text">{selectedBalance.notes}</p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="os-details-contact">
                    <span className="os-details-label">Contact:</span>
                    <div className="os-contact-display">
                      <span className="os-contact-icon">📱</span>
                      <span className="os-contact-number">{selectedBalance.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="os-modal-footer">
                <button className="os-btn-secondary" onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BalancesPage;