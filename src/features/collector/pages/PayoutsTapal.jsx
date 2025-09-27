import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import "../styles/payout-tapal.css";

// Mock data for tellers with payout situations
const mockTellers = [
  {
    id: 'T001',
    name: 'Juan Dela Cruz',
    code: 'TLR001',
    location: 'Booth A1',
    totalSales: 8420,
    totalWinners: 15650,
    shortage: 7230, // totalWinners - totalSales
    ticketsSold: 87,
    winningTickets: 12,
    status: 'needs_payout',
    lastPayout: '2025-01-14 03:30 PM',
    contactNumber: '09171234567'
  },
  {
    id: 'T002',
    name: 'Maria Santos',
    code: 'TLR002',
    location: 'Booth B2',
    totalSales: 22150,
    totalWinners: 18200,
    shortage: 0, // No shortage, has surplus
    surplus: 3950,
    ticketsSold: 134,
    winningTickets: 8,
    status: 'surplus',
    lastPayout: '2025-01-13 11:45 AM',
    contactNumber: '09281234567'
  },
  {
    id: 'T003',
    name: 'Pedro Garcia',
    code: 'TLR003',
    location: 'Booth C3',
    totalSales: 12750,
    totalWinners: 28900,
    shortage: 16150,
    ticketsSold: 92,
    winningTickets: 18,
    status: 'needs_payout',
    lastPayout: '2025-01-15 09:15 AM',
    contactNumber: '09391234567'
  },
  {
    id: 'T004',
    name: 'Ana Reyes',
    code: 'TLR004',
    location: 'Booth D4',
    totalSales: 31200,
    totalWinners: 45600,
    shortage: 14400,
    ticketsSold: 156,
    winningTickets: 22,
    status: 'needs_payout',
    lastPayout: '2025-01-14 02:30 PM',
    contactNumber: '09401234567'
  },
  {
    id: 'T005',
    name: 'Carlos Lopez',
    code: 'TLR005',
    location: 'Booth E5',
    totalSales: 18890,
    totalWinners: 4250,
    shortage: 0,
    surplus: 14640,
    ticketsSold: 73,
    winningTickets: 3,
    status: 'surplus',
    lastPayout: '2025-01-14 10:00 AM',
    contactNumber: '09511234567'
  }
];

const mockPayoutHistory = [
  {
    id: 'PAY001',
    tellerId: 'T001',
    tellerName: 'Juan Dela Cruz',
    amount: 12500,
    type: 'tapal',
    processedAt: '2025-01-15 01:30 PM',
    processedBy: 'Collector C001',
    notes: 'Emergency payout for major winner - jackpot prize',
    reason: 'insufficient_funds'
  },
  {
    id: 'PAY002',
    tellerId: 'T003',
    tellerName: 'Pedro Garcia',
    amount: 8750,
    type: 'tapal',
    processedAt: '2025-01-15 10:45 AM',
    processedBy: 'Collector C001',
    notes: 'Multiple winners exceeded daily sales',
    reason: 'multiple_winners'
  }
];

const PayoutTapal = () => {
  // State management
  const [tellers, setTellers] = useState(mockTellers);
  const [payoutHistory, setPayoutHistory] = useState(mockPayoutHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('needs_payout');
  const [selectedTeller, setSelectedTeller] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutReason, setPayoutReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply body class for background
  useEffect(() => {
    document.body.classList.add("payout-tapal-bg");
    return () => document.body.classList.remove("payout-tapal-bg");
  }, []);

  // Format currency
  const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  });

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const needsPayout = tellers.filter(t => t.status === 'needs_payout');
    const surplusTellers = tellers.filter(t => t.status === 'surplus');

    const totalShortage = needsPayout.reduce((sum, t) => sum + t.shortage, 0);
    const totalSurplus = surplusTellers.reduce((sum, t) => sum + (t.surplus || 0), 0);
    const totalPayoutsToday = payoutHistory.reduce((sum, p) => sum + p.amount, 0);

    return {
      tellersNeedingPayout: needsPayout.length,
      tellersWithSurplus: surplusTellers.length,
      totalShortage,
      totalSurplus,
      totalPayoutsToday,
      netPosition: totalSurplus - totalShortage // Positive = company has net gain
    };
  }, [tellers, payoutHistory]);

  // Filter tellers based on search and status
  const filteredTellers = useMemo(() => {
    return tellers.filter(teller => {
      const matchesSearch = searchQuery === '' || 
        teller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teller.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teller.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || teller.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tellers, searchQuery, statusFilter]);

  // Handle payout modal
  const openPayoutModal = useCallback((teller) => {
    setSelectedTeller(teller);
    setPayoutAmount(teller.shortage.toString());
    setPayoutNotes('');
    setPayoutReason('insufficient_funds');
    setShowPayoutModal(true);
  }, []);

  const closePayoutModal = useCallback(() => {
    setShowPayoutModal(false);
    setSelectedTeller(null);
    setPayoutAmount('');
    setPayoutNotes('');
    setPayoutReason('');
  }, []);

  // Handle payout processing
  const handleProcessPayout = useCallback(async () => {
    if (!selectedTeller || !payoutAmount || !payoutReason) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid payout amount', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const newPayout = {
        id: `PAY${Date.now().toString().slice(-6)}`,
        tellerId: selectedTeller.id,
        tellerName: selectedTeller.name,
        amount: amount,
        type: 'tapal',
        processedAt: new Date().toLocaleString('en-PH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        processedBy: 'Collector C001',
        notes: payoutNotes || 'Standard payout processing',
        reason: payoutReason
      };

      // Update teller status - if full shortage covered, mark as balanced
      setTellers(prev => prev.map(t => 
        t.id === selectedTeller.id 
          ? { 
              ...t, 
              status: amount >= t.shortage ? 'balanced' : 'needs_payout',
              shortage: Math.max(0, t.shortage - amount),
              lastPayout: newPayout.processedAt
            }
          : t
      ));

      // Add to payout history
      setPayoutHistory(prev => [newPayout, ...prev]);

      setIsProcessing(false);
      closePayoutModal();
      showToast(`Payout processed: ${peso.format(amount)} to ${selectedTeller.name}`, 'success');
    }, 1200);
  }, [selectedTeller, payoutAmount, payoutReason, payoutNotes, peso, showToast, closePayoutModal]);

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      needs_payout: { class: 'status-needs-payout', text: 'NEEDS PAYOUT', icon: '💸' },
      surplus: { class: 'status-surplus', text: 'HAS SURPLUS', icon: '💰' },
      balanced: { class: 'status-balanced', text: 'BALANCED', icon: '✅' }
    };
    return badges[status] || badges.needs_payout;
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-value">{statistics.tellersNeedingPayout}</div>
        <div className="stat-label">Need Payout</div>
      </div>
      <div className="stat-card shortage">
        <div className="stat-value">{peso.format(statistics.totalShortage)}</div>
        <div className="stat-label">Total Shortage</div>
      </div>
      <div className="stat-card surplus">
        <div className="stat-value">{peso.format(statistics.totalSurplus)}</div>
        <div className="stat-label">Total Surplus</div>
      </div>
      <div className="stat-card net">
        <div className="stat-value">{peso.format(Math.abs(statistics.netPosition))}</div>
        <div className="stat-label">{statistics.netPosition >= 0 ? 'Net Gain' : 'Net Loss'}</div>
      </div>
    </div>
  );

  // Teller Item Component
  const TellerItem = ({ teller }) => {
    const statusBadge = getStatusBadge(teller.status);
    const needsPayout = teller.status === 'needs_payout';
    const hasShortage = teller.shortage > 0;

    return (
      <article className={`teller-item ${teller.status} ${hasShortage ? 'urgent' : ''}`}>
        <div className="teller-header">
          <div className="teller-info">
            <div className="teller-name">{teller.name}</div>
            <div className="teller-meta">
              <span className="teller-code">{teller.code}</span>
              <span className="teller-location">{teller.location}</span>
            </div>
          </div>
          <div className={`teller-status ${statusBadge.class}`}>
            <span className="status-icon">{statusBadge.icon}</span>
            <span className="status-text">{statusBadge.text}</span>
          </div>
        </div>

        <div className="teller-stats">
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">{peso.format(teller.totalSales)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Winner Payouts</div>
              <div className="stat-value winners">{peso.format(teller.totalWinners)}</div>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Tickets Sold</div>
              <div className="stat-value">{teller.ticketsSold.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Winning Tickets</div>
              <div className="stat-value winning-count">{teller.winningTickets.toLocaleString()}</div>
            </div>
          </div>
          {hasShortage && (
            <div className="shortage-row">
              <div className="shortage-label">Shortage Amount</div>
              <div className="shortage-amount">{peso.format(teller.shortage)}</div>
            </div>
          )}
          {teller.surplus > 0 && (
            <div className="surplus-row">
              <div className="surplus-label">Surplus Amount</div>
              <div className="surplus-amount">{peso.format(teller.surplus)}</div>
            </div>
          )}
        </div>

        <div className="teller-footer">
          <div className="last-payout">
            Last Payout: {teller.lastPayout}
          </div>
          {needsPayout && (
            <button
              className="btn btn-payout urgent"
              onClick={() => openPayoutModal(teller)}
            >
              <span className="btn-icon">💸</span>
              Process Tapal
            </button>
          )}
        </div>
      </article>
    );
  };

  // Payout History Item Component
  const PayoutHistoryItem = ({ payout }) => (
    <article className="history-item">
      <div className="history-header">
        <div className="history-info">
          <div className="history-id">#{payout.id}</div>
          <div className="history-teller">{payout.tellerName}</div>
          <div className="history-type">{payout.type.toUpperCase()}</div>
        </div>
        <div className="history-amount">{peso.format(payout.amount)}</div>
      </div>
      <div className="history-details">
        <div className="history-time">{payout.processedAt}</div>
        <div className="history-processor">by {payout.processedBy}</div>
      </div>
      <div className="history-reason">
        Reason: {payout.reason.replace(/_/g, ' ').toUpperCase()}
      </div>
      {payout.notes && (
        <div className="history-notes">{payout.notes}</div>
      )}
    </article>
  );

  const reasonOptions = [
    { value: 'insufficient_funds', label: 'Insufficient Funds' },
    { value: 'multiple_winners', label: 'Multiple Winners' },
    { value: 'jackpot_prize', label: 'Jackpot Prize' },
    { value: 'emergency_payout', label: 'Emergency Payout' },
    { value: 'system_error', label: 'System Error' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Payout & Tapal</h1>
          <p className="header-subtitle">Process winner payouts or issue tapal for insufficient funds</p>
        </div>
        <Link to="/collector" className="back-btn" aria-label="Back to Dashboard">
          <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Statistics Summary */}
      <section className="card statistics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Payout Overview
        </h2>
        <StatisticsCards />
        
        <div className="summary-details">
          <div className="summary-row">
            <span>Today's Payouts Issued</span>
            <span className="amount">{peso.format(statistics.totalPayoutsToday)}</span>
          </div>
          <div className="summary-row">
            <span>Net Company Position</span>
            <span className={`amount ${statistics.netPosition >= 0 ? 'positive' : 'negative'}`}>
              {statistics.netPosition >= 0 ? '+' : ''}{peso.format(statistics.netPosition)}
            </span>
          </div>
        </div>
      </section>

      {/* Search and Filter Controls */}
      <section className="card controls-section">
        <h2 className="section-title">
          <span className="section-icon">🔍</span>
          Search & Filter
        </h2>
        
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="search" className="control-label">Search Tellers</label>
            <input
              id="search"
              type="text"
              className="control-input"
              placeholder="Search by name, code, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="control-group">
            <label htmlFor="status-filter" className="control-label">Filter by Status</label>
            <select
              id="status-filter"
              className="control-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="needs_payout">Needs Payout</option>
              <option value="surplus">Has Surplus</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tellers List */}
      <section className="card tellers-section">
        <h2 className="section-title">
          <span className="section-icon">👥</span>
          Tellers ({filteredTellers.length})
        </h2>
        
        {filteredTellers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No Tellers Found</div>
            <div className="empty-text">
              Try adjusting your search criteria or filters.
            </div>
          </div>
        ) : (
          <div className="tellers-grid">
            {filteredTellers.map(teller => (
              <TellerItem key={teller.id} teller={teller} />
            ))}
          </div>
        )}
      </section>

      {/* Payout History */}
      <section className="card history-section">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Payout History
        </h2>
        
        {payoutHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No Payouts Yet</div>
            <div className="empty-text">
              Payout records will appear here after you process tapal payments.
            </div>
          </div>
        ) : (
          <div className="history-grid">
            {payoutHistory.map(payout => (
              <PayoutHistoryItem key={payout.id} payout={payout} />
            ))}
          </div>
        )}
      </section>

      {/* Payout Modal */}
      {showPayoutModal && selectedTeller && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Process Payout</h3>
              <button 
                className="modal-close" 
                onClick={closePayoutModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="teller-summary">
                <h4>{selectedTeller.name} ({selectedTeller.code})</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Total Sales</span>
                    <span>{peso.format(selectedTeller.totalSales)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Winner Payouts</span>
                    <span>{peso.format(selectedTeller.totalWinners)}</span>
                  </div>
                  <div className="summary-item shortage-highlight">
                    <span>Shortage Amount</span>
                    <span className="highlight">{peso.format(selectedTeller.shortage)}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="payout-reason" className="form-label">
                  Payout Reason
                </label>
                <select
                  id="payout-reason"
                  className="form-select"
                  value={payoutReason}
                  onChange={(e) => setPayoutReason(e.target.value)}
                >
                  <option value="">Select reason...</option>
                  {reasonOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payout-amount" className="form-label">
                  Payout Amount
                </label>
                <input
                  id="payout-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
                <div className="form-help">
                  Enter the amount to advance to the teller for winner payments.
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="payout-notes" className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="payout-notes"
                  className="form-textarea"
                  placeholder="Add any notes about this payout..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  maxLength={500}
                />
                <div className="form-help">
                  {payoutNotes.length}/500 characters
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={closePayoutModal}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleProcessPayout}
                disabled={isProcessing || !payoutAmount || !payoutReason}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>💸</span>
                    Process Payout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PayoutTapal;