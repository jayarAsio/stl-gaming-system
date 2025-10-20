// ============================================
// File: src/features/operation-support/pages/Balances.jsx
// Operation Support - Balances Module (Yesterday's Shortages)
// Updated with Dashboard-style header
// ============================================

import React, { useState } from 'react';
import '../styles/balances.css';

// Mock data for yesterday's shortages
const getMockShortages = () => [
  {
    id: 'SH001',
    name: 'Juan Dela Cruz',
    role: 'Teller',
    roleId: 'TEL-002',
    location: 'Quezon City - Cubao',
    date: 'Oct 19, 2025',
    totalSales: 67000,
    totalPayouts: 18000,
    expectedRemittance: 49000,
    actualRemittance: 48500,
    shortageAmount: 500,
    status: 'unpaid',
    phone: '0917-234-5678',
    lastContact: null,
    followUpDate: null,
    notes: '',
    priority: 'medium',
    daysOverdue: 1,
    paidAmount: 0
  },
  {
    id: 'SH002',
    name: 'Pedro Reyes',
    role: 'Collector',
    roleId: 'COL-003',
    location: 'Manila - Tondo',
    date: 'Oct 19, 2025',
    totalSales: 125000,
    totalPayouts: 35000,
    expectedRemittance: 90000,
    actualRemittance: 85000,
    shortageAmount: 5000,
    status: 'unpaid',
    phone: '0915-987-6543',
    lastContact: null,
    followUpDate: null,
    notes: '',
    priority: 'high',
    daysOverdue: 1,
    paidAmount: 0
  },
  {
    id: 'SH003',
    name: 'Maria Santos',
    role: 'Teller',
    roleId: 'TEL-005',
    location: 'Quezon City - Fairview',
    date: 'Oct 19, 2025',
    totalSales: 89000,
    totalPayouts: 22000,
    expectedRemittance: 67000,
    actualRemittance: 65200,
    shortageAmount: 1800,
    status: 'partial',
    phone: '0917-456-7890',
    lastContact: 'Oct 20, 2025 - 9:30 AM',
    followUpDate: 'Oct 21, 2025',
    notes: 'Promised to pay ₱1,000 today, remaining ₱800 tomorrow',
    priority: 'medium',
    daysOverdue: 1,
    paidAmount: 0
  },
  {
    id: 'SH004',
    name: 'Ana Reyes',
    role: 'Teller',
    roleId: 'TEL-008',
    location: 'Pasig - Ortigas',
    date: 'Oct 19, 2025',
    totalSales: 95000,
    totalPayouts: 28000,
    expectedRemittance: 67000,
    actualRemittance: 64500,
    shortageAmount: 2500,
    status: 'unpaid',
    phone: '0917-345-6789',
    lastContact: null,
    followUpDate: null,
    notes: '',
    priority: 'high',
    daysOverdue: 1,
    paidAmount: 0
  }
];

const BalancesPage = () => {
  const [shortages, setShortages] = useState(getMockShortages());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedShortage, setSelectedShortage] = useState(null);
  const [contactNotes, setContactNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Calculate statistics
  const statistics = {
    totalShortages: shortages.length,
    totalAmount: shortages.reduce((sum, s) => sum + s.shortageAmount, 0),
    unpaidCount: shortages.filter(s => s.status === 'unpaid').length,
    partialCount: shortages.filter(s => s.status === 'partial').length,
    tellersShort: shortages.filter(s => s.role === 'Teller').length,
    collectorsShort: shortages.filter(s => s.role === 'Collector').length
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      unpaid: 'Unpaid',
      partial: 'Partial Payment',
      paid: 'Paid'
    };
    return labels[status] || 'Unpaid';
  };

  // Filter data
  const filteredShortages = shortages.filter(shortage => {
    const matchesSearch = 
      shortage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortage.roleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortage.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || shortage.status === filterStatus;
    const matchesRole = filterRole === 'all' || shortage.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Open contact modal
  const openContactModal = (shortage) => {
    setSelectedShortage(shortage);
    setContactNotes('');
    setFollowUpDate('');
    setShowContactModal(true);
  };

  // Open payment modal
  const openPaymentModal = (shortage) => {
    setSelectedShortage(shortage);
    setPaymentAmount(shortage.shortageAmount.toString());
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowContactModal(false);
    setShowPaymentModal(false);
    setSelectedShortage(null);
    setContactNotes('');
    setFollowUpDate('');
    setPaymentAmount('');
    setPaymentNotes('');
  };

  // Save contact notes
  const handleSaveContact = () => {
    if (!selectedShortage || !contactNotes.trim()) return;

    setShortages(prev => prev.map(shortage =>
      shortage.id === selectedShortage.id
        ? {
            ...shortage,
            lastContact: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            followUpDate: followUpDate,
            notes: contactNotes
          }
        : shortage
    ));

    closeModals();
  };

  // Record payment
  const handleRecordPayment = () => {
    if (!selectedShortage || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setShortages(prev => prev.map(shortage => {
      if (shortage.id === selectedShortage.id) {
        const newPaidAmount = (shortage.paidAmount || 0) + amount;
        const remainingShortage = shortage.shortageAmount - newPaidAmount;
        
        return {
          ...shortage,
          paidAmount: newPaidAmount,
          shortageAmount: Math.max(0, remainingShortage),
          status: remainingShortage <= 0 ? 'paid' : 'partial',
          notes: paymentNotes || shortage.notes
        };
      }
      return shortage;
    }));

    closeModals();
  };

  return (
    <div className="os-balances-container">
      {/* Header - Dashboard Style */}
      <header className="os-balances-header">
        <div className="os-balances-header-main">
          <div className="os-balances-icon">💰</div>
          <div className="os-balances-header-text">
            <h1 className="os-balances-title">Yesterday's Shortages</h1>
            <p className="os-balances-subtitle">
              Track and manage remittance shortages from operations
            </p>
          </div>
        </div>
        <div className="os-balances-header-meta">
          <div className="os-balances-date-info">
            <div className="os-balances-date-label">Report Date</div>
            <div className="os-balances-date-value">October 19, 2025</div>
          </div>
        </div>
      </header>

      {/* Statistics Grid */}
      <div className="os-stats-grid">
        <div className="os-stat-card">
          <div className="os-stat-label">Total Shortages</div>
          <div className="os-stat-value total">{statistics.totalShortages}</div>
        </div>
        <div className="os-stat-card">
          <div className="os-stat-label">Total Amount</div>
          <div className="os-stat-value amount">{formatCurrency(statistics.totalAmount)}</div>
        </div>
        <div className="os-stat-card">
          <div className="os-stat-label">Unpaid</div>
          <div className="os-stat-value unpaid">{statistics.unpaidCount}</div>
        </div>
        <div className="os-stat-card">
          <div className="os-stat-label">Partial Paid</div>
          <div className="os-stat-value partial">{statistics.partialCount}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="os-balances-card">
        {/* Filters */}
        <div className="os-balances-filters">
          <div className="os-search-wrapper">
            <span className="os-search-icon">🔍</span>
            <input
              type="text"
              className="os-search-input"
              placeholder="Search by name, ID, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="os-filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Teller">Tellers ({statistics.tellersShort})</option>
            <option value="Collector">Collectors ({statistics.collectorsShort})</option>
          </select>
          <select
            className="os-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Shortage List */}
        <div className="os-balances-content">
          {filteredShortages.length === 0 ? (
            <div className="os-empty-state">
              <span className="os-empty-icon">📋</span>
              <p className="os-empty-text">No shortages found</p>
            </div>
          ) : (
            <div className="os-shortage-list">
              {filteredShortages.map((shortage) => (
                <div key={shortage.id} className={`os-shortage-item ${shortage.status}`}>
                  {/* Header */}
                  <div className="os-shortage-header">
                    <div className="os-shortage-info">
                      <div className="os-shortage-name">{shortage.name}</div>
                      <div className="os-shortage-meta">
                        {shortage.role} • {shortage.roleId} • {shortage.location}
                      </div>
                    </div>
                    <div className={`os-status-badge ${shortage.status}`}>
                      {getStatusLabel(shortage.status)}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="os-shortage-stats">
                    <div className="os-stat-item">
                      <div className="os-stat-item-label">Total Sales</div>
                      <div className="os-stat-item-value">
                        {formatCurrency(shortage.totalSales)}
                      </div>
                    </div>
                    <div className="os-stat-item">
                      <div className="os-stat-item-label">Payouts</div>
                      <div className="os-stat-item-value">
                        {formatCurrency(shortage.totalPayouts)}
                      </div>
                    </div>
                    <div className="os-stat-item">
                      <div className="os-stat-item-label">Expected</div>
                      <div className="os-stat-item-value">
                        {formatCurrency(shortage.expectedRemittance)}
                      </div>
                    </div>
                    <div className="os-stat-item">
                      <div className="os-stat-item-label">Actual</div>
                      <div className="os-stat-item-value highlight">
                        {formatCurrency(shortage.actualRemittance)}
                      </div>
                    </div>
                  </div>

                  {/* Shortage Amount - Highlighted */}
                  <div className="os-shortage-amount-box">
                    <div className="os-shortage-amount-row">
                      <span className="os-shortage-amount-label">Shortage Amount:</span>
                      <span className="os-shortage-amount-value">
                        {formatCurrency(shortage.shortageAmount)}
                      </span>
                    </div>
                    {shortage.paidAmount > 0 && (
                      <div className="os-shortage-amount-row">
                        <span className="os-shortage-amount-label small">Paid Amount:</span>
                        <span className="os-shortage-amount-value paid">
                          {formatCurrency(shortage.paidAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="os-contact-info">
                    <span className="os-contact-icon">📱</span>
                    <span className="os-contact-phone">{shortage.phone}</span>
                  </div>

                  {/* Notes & Follow-up */}
                  {(shortage.notes || shortage.lastContact || shortage.followUpDate) && (
                    <div className="os-notes-section">
                      {shortage.lastContact && (
                        <div className="os-note-item">
                          <strong>Last Contact:</strong> {shortage.lastContact}
                        </div>
                      )}
                      {shortage.followUpDate && (
                        <div className="os-note-item">
                          <strong>Follow-up:</strong> {shortage.followUpDate}
                        </div>
                      )}
                      {shortage.notes && (
                        <div className="os-note-item main">
                          <strong>Notes:</strong> {shortage.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="os-shortage-actions">
                    <button
                      className="os-btn os-btn-contact"
                      onClick={() => openContactModal(shortage)}
                    >
                      <span>📞</span>
                      <span>Log Contact</span>
                    </button>
                    {shortage.status !== 'paid' && (
                      <button
                        className="os-btn os-btn-payment"
                        onClick={() => openPaymentModal(shortage)}
                      >
                        <span>💵</span>
                        <span>Record Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedShortage && (
        <div className="os-modal-overlay" onClick={closeModals}>
          <div className="os-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="os-modal-header">
              <h3 className="os-modal-title">
                Log Contact - {selectedShortage.name}
              </h3>
              <button className="os-modal-close" onClick={closeModals}>
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="os-modal-body">
              <div className="os-form-group">
                <label className="os-form-label">Contact Notes *</label>
                <textarea
                  className="os-form-textarea"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="What did you discuss? Any commitments made?"
                  rows={4}
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
                <p className="os-form-help">Set a reminder date for next follow-up</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="os-modal-footer">
              <button className="os-btn-secondary" onClick={closeModals}>
                Cancel
              </button>
              <button
                className="os-btn-primary"
                onClick={handleSaveContact}
                disabled={!contactNotes.trim()}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedShortage && (
        <div className="os-modal-overlay" onClick={closeModals}>
          <div className="os-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="os-modal-header">
              <h3 className="os-modal-title">
                Record Payment - {selectedShortage.name}
              </h3>
              <button className="os-modal-close" onClick={closeModals}>
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="os-modal-body">
              <div className="os-summary-box">
                <div className="os-summary-row">
                  <span className="os-summary-label">Total Shortage:</span>
                  <span className="os-summary-value danger">
                    {formatCurrency(selectedShortage.shortageAmount + (selectedShortage.paidAmount || 0))}
                  </span>
                </div>
                {selectedShortage.paidAmount > 0 && (
                  <div className="os-summary-row">
                    <span className="os-summary-label">Already Paid:</span>
                    <span className="os-summary-value success">
                      {formatCurrency(selectedShortage.paidAmount)}
                    </span>
                  </div>
                )}
                <div className="os-summary-row">
                  <span className="os-summary-label strong">Remaining:</span>
                  <span className="os-summary-value primary">
                    {formatCurrency(selectedShortage.shortageAmount)}
                  </span>
                </div>
              </div>

              <div className="os-form-group">
                <label className="os-form-label">Payment Amount *</label>
                <input
                  type="number"
                  className="os-form-input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="os-form-help">Enter the amount being paid today</p>
              </div>

              <div className="os-form-group">
                <label className="os-form-label">Payment Notes</label>
                <textarea
                  className="os-form-textarea"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional: Add any notes about this payment"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="os-modal-footer">
              <button className="os-btn-secondary" onClick={closeModals}>
                Cancel
              </button>
              <button
                className="os-btn-success"
                onClick={handleRecordPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancesPage;