import React, { useState, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import "../styles/common.css";
import "../styles/void-request.css";

// Mock data - replace with actual API calls
const mockTickets = {
  'TKT87654321': {
    ref: 'TKT87654321',
    date: 'Jan 15, 2025 2:30 PM',
    status: 'valid',
    timeLeft: 25,
    bets: [
      { game: 'STL Pares', combo: '12.34', amount: 50 },
      { game: 'Last 2', combo: '56', amount: 50 },
      { game: 'Swer3', combo: '789', amount: 50 },
    ],
    total: 150,
  },
  'TKT98765432': {
    ref: 'TKT98765432',
    date: 'Jan 15, 2025 1:45 PM',
    status: 'valid',
    timeLeft: 5,
    bets: [
      { game: 'Last 3', combo: '123', amount: 100 },
      { game: 'STL Pares', combo: '05.17', amount: 100 },
    ],
    total: 200,
  },
  'TKT11223344': {
    ref: 'TKT11223344',
    date: 'Jan 15, 2025 12:15 PM',
    status: 'expired',
    timeLeft: 0,
    bets: [{ game: 'Last 2', combo: '42', amount: 75 }],
    total: 75,
  },
  'TKT55667788': {
    ref: 'TKT55667788',
    date: 'Jan 15, 2025 10:00 AM',
    status: 'draw-locked',
    timeLeft: 0,
    bets: [
      { game: 'STL Pares', combo: '25.08', amount: 150 },
      { game: 'Last 3', combo: '456', amount: 150 },
    ],
    total: 300,
  },
};

const recentTicketsData = [
  { ref: 'TKT87654321', dt: 'Jan 15, 2:30 PM', amount: 150, bets: 3 },
  { ref: 'TKT98765432', dt: 'Jan 15, 1:45 PM', amount: 200, bets: 2 },
  { ref: 'TKT11223344', dt: 'Jan 15, 12:15 PM', amount: 75, bets: 1 },
  { ref: 'TKT55667788', dt: 'Jan 15, 10:00 AM', amount: 300, bets: 4 },
];

const mockVoidRequests = {
  pending: [
    {
      id: 'VR789012',
      submitted: 'Jan 15, 3:15 PM',
      status_note: 'Awaiting supervisor approval',
      reason: 'Wrong combination entered',
      description: 'Customer requested different numbers after ticket was printed. Need to void and create new ticket with correct combination.',
      priority: 'high',
      ticket: {
        ref: 'TKT87654321',
        details_html: 'Jan 15, 2:30 PM • ₱150<br>STL Pares: 12.34 • Last 2: 56 • Swer3: 789',
      },
    },
    {
      id: 'VR789013',
      submitted: 'Jan 15, 1:50 PM',
      status_note: 'Under review',
      reason: 'Wrong bet amount',
      description: 'Entered ₱100 instead of ₱50 for Last 3 bet. Customer noticed immediately after transaction.',
      priority: 'medium',
      ticket: {
        ref: 'TKT98765432',
        details_html: 'Jan 15, 1:45 PM • ₱200<br>Last 3: 123 • STL Pares: 05.17',
      },
    },
  ],
  approved: [
    {
      id: 'VR789010',
      approved_at: 'Jan 15, 11:45 AM',
      approved_by: 'Supervisor M. Santos',
      reason: 'System error',
      description: 'Terminal froze during transaction and printed duplicate ticket. Original transaction was successful.',
      ticket: {
        ref: 'TKT11223344 (VOIDED)',
        details_html: 'Jan 15, 11:15 AM • ₱75<br>Last 2: 42',
      },
    },
  ],
  rejected: [
    {
      id: 'VR789009',
      rejected_at: 'Jan 14, 6:15 PM',
      rejected_by: 'Supervisor M. Santos',
      reason: 'Draw time restriction',
      description: 'Request submitted after 2:00 PM draw time for STL Pares. Policy prohibits voids after draw has started.',
      ticket: {
        ref: 'TKT99887766 (ACTIVE)',
        details_html: 'Jan 14, 1:30 PM • ₱125<br>STL Pares: 20.15 • Draw: 2:00 PM',
      },
    },
  ],
};

const VoidRequest = () => {
  // State management
  const [activeTab, setActiveTab] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidDetails, setVoidDetails] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [voidRequests, setVoidRequests] = useState(mockVoidRequests);
  const [searchHistory, setSearchHistory] = useState([]);

  // Format currency (memoized)
  const peso = useMemo(() => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }), []);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Normalize ticket reference
  const normalizeTicket = useCallback((input) => {
    if (!input) return '';
    const upper = String(input).toUpperCase();
    const digits = upper.replace(/^TKT/i, '').replace(/\D/g, '').slice(0, 8);
    return digits ? `TKT${digits}` : 'TKT';
  }, []);

  // Validate ticket reference
  const isValidTicket = useCallback((ref) => {
    return /^TKT\d{8}$/.test(ref);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const allRequests = [
      ...voidRequests.pending,
      ...voidRequests.approved,
      ...voidRequests.rejected
    ];

    const totalRequests = allRequests.length;
    const approvedCount = voidRequests.approved.length;

    return {
      totalRequests,
      approvedCount
    };
  }, [voidRequests]);

  // Handle search
  const handleSearch = useCallback(async (ticketRef = searchQuery) => {
    const normalizedTicket = normalizeTicket(ticketRef);
    
    if (!normalizedTicket || normalizedTicket === 'TKT') {
      setCurrentTicket(null);
      return;
    }

    if (!isValidTicket(normalizedTicket)) {
      showToast('Please enter a valid ticket reference (TKT + 8 digits)', 'error');
      return;
    }

    setIsSearching(true);

    // Add to search history
    setSearchHistory(prev => {
      const filtered = prev.filter(ref => ref !== normalizedTicket);
      return [normalizedTicket, ...filtered].slice(0, 5);
    });

    // Simulate API call
    setTimeout(() => {
      const ticket = mockTickets[normalizedTicket];
      if (ticket) {
        setCurrentTicket(ticket);
        showToast('Ticket found successfully', 'success');
      } else {
        setCurrentTicket(null);
        showToast('Ticket not found', 'error');
      }
      setIsSearching(false);
    }, 800);
  }, [searchQuery, normalizeTicket, isValidTicket, showToast]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = normalizeTicket(e.target.value);
    setSearchQuery(value);
    
    // Auto-search if ticket is complete
    if (isValidTicket(value)) {
      handleSearch(value);
    } else if (value === 'TKT' || value === '') {
      setCurrentTicket(null);
    }
  }, [normalizeTicket, isValidTicket, handleSearch]);

  // Validate void form
  const isFormValid = useMemo(() => {
    if (!currentTicket || currentTicket.status !== 'valid' || currentTicket.timeLeft <= 0) {
      return false;
    }
    if (!voidReason) return false;
    if (voidReason === 'other' && voidDetails.trim().length < 10) return false;
    return true;
  }, [currentTicket, voidReason, voidDetails]);

  // Submit void request
  const handleSubmitVoid = useCallback(async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: `VR${Date.now().toString().slice(-6)}`,
        submitted: new Date().toLocaleString('en-PH', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        status_note: 'Awaiting supervisor approval',
        reason: voidReason === 'other' ? 'Other' : voidReason.replace(/_/g, ' '),
        description: voidDetails || 'No additional details provided',
        priority: currentTicket.timeLeft <= 10 ? 'high' : 'medium',
        ticket: {
          ref: currentTicket.ref,
          details_html: `${currentTicket.date.split(' ').slice(0, 3).join(' ')} • ${peso.format(currentTicket.total)}<br>${currentTicket.bets.map(b => `${b.game}: ${b.combo}`).join(' • ')}`
        }
      };

      setVoidRequests(prev => ({
        ...prev,
        pending: [newRequest, ...prev.pending]
      }));

      // Clear form
      setSearchQuery('');
      setCurrentTicket(null);
      setVoidReason('');
      setVoidDetails('');

      showToast(`Void request submitted! ID: ${newRequest.id}`, 'success');
      setActiveTab('pending');
      setIsSubmitting(false);
    }, 1200);
  }, [isFormValid, voidReason, voidDetails, currentTicket, peso, showToast]);

  // Cancel void request
  const handleCancelRequest = useCallback((requestId) => {
    if (window.confirm('Are you sure you want to cancel this void request?')) {
      setVoidRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(req => req.id !== requestId)
      }));
      showToast(`Void request ${requestId} cancelled`, 'info');
    }
  }, [showToast]);

  // Tab management
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e) => {
    const tabs = ['create', 'pending', 'approved', 'rejected'];
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex = currentIndex;

    switch(e.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex]);
  };

  // Get time warning
  const getTimeWarning = (ticket) => {
    if (!ticket) return null;

    switch (ticket.status) {
      case 'expired':
        return {
          type: 'expired',
          icon: '⏰',
          message: 'Ticket expired — 30-minute void window has passed'
        };
      case 'draw-locked':
        return {
          type: 'expired',
          icon: '🚫',
          message: 'Draw time has passed — ticket cannot be voided'
        };
      case 'valid':
        if (ticket.timeLeft <= 10) {
          return {
            type: 'warn',
            icon: '⚠️',
            message: `Urgent: Only ${ticket.timeLeft} minute${ticket.timeLeft === 1 ? '' : 's'} left to void this ticket!`
          };
        }
        return {
          type: 'valid',
          icon: '✅',
          message: `${ticket.timeLeft} minute${ticket.timeLeft === 1 ? '' : 's'} remaining for void request`
        };
      default:
        return null;
    }
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-value">{statistics.totalRequests}</div>
        <div className="stat-label">Total Requests</div>
      </div>
      <div className="stat-card approved">
        <div className="stat-value">{statistics.approvedCount}</div>
        <div className="stat-label">Approved</div>
      </div>
    </div>
  );

  // Ticket Display Component
  const TicketDisplay = ({ ticket }) => {
    if (!ticket) return null;

    const statusMap = {
      valid: { class: 'status-valid', text: 'VALID' },
      void: { class: 'status-void', text: 'VOIDED' },
      expired: { class: 'status-expired', text: 'EXPIRED' },
      'draw-locked': { class: 'status-locked', text: 'LOCKED' }
    };

    const status = statusMap[ticket.status] || { class: 'status-valid', text: 'UNKNOWN' };
    const timeWarning = getTimeWarning(ticket);

    return (
      <div className="ticket-display">
        <div className="ticket-header">
          <div className="ticket-info">
            <h3>{ticket.ref}</h3>
            <div className="ticket-date">{ticket.date}</div>
          </div>
          <div className={`ticket-status ${status.class}`}>{status.text}</div>
        </div>
        
        <div className="ticket-bets">
          {ticket.bets.map((bet, index) => (
            <div key={index} className="bet-item">
              <span className="bet-game">{bet.game}</span>
              <span className="bet-combo">{bet.combo}</span>
              <span className="bet-amount">{peso.format(bet.amount)}</span>
            </div>
          ))}
        </div>
        
        <div className="ticket-total">
          <span>TOTAL AMOUNT</span>
          <span>{peso.format(ticket.total)}</span>
        </div>

        {timeWarning && (
          <div className={`time-warning ${timeWarning.type}`}>
            <span>{timeWarning.icon}</span>
            <span>{timeWarning.message}</span>
          </div>
        )}
      </div>
    );
  };

  // Void Request Item Component
  const VoidRequestItem = ({ request, status, onCancel }) => {
    const getPriorityBadge = (priority) => {
      if (!priority) return null;
      const badges = {
        high: { class: 'priority-high', text: 'HIGH', icon: '🔥' },
        medium: { class: 'priority-medium', text: 'MED', icon: '⚡' },
        low: { class: 'priority-low', text: 'LOW', icon: '📝' }
      };
      const badge = badges[priority];
      return badge ? (
        <div className={`priority-badge ${badge.class}`}>
          <span>{badge.icon}</span> {badge.text}
        </div>
      ) : null;
    };

    return (
      <article className={`void-item ${status}`}>
        <div className="void-header">
          <div className="void-info">
            <div className="void-title-row">
              <h4>Void Request #{request.id}</h4>
              {getPriorityBadge(request.priority)}
            </div>
            <div className="void-meta">
              {request.submitted && `Submitted: ${request.submitted}`}
              {request.approved_at && `Approved: ${request.approved_at}`}
              {request.rejected_at && `Rejected: ${request.rejected_at}`}
              <br />
              {request.status_note && `Status: ${request.status_note}`}
              {request.approved_by && `By: ${request.approved_by}`}
              {request.rejected_by && `By: ${request.rejected_by}`}
            </div>
          </div>
          <div className={`void-status status-${status}`}>
            {status.toUpperCase()}
          </div>
        </div>
        
        <div className="void-details">
          <div className="void-reason">{request.reason}</div>
          <div className="void-description">{request.description}</div>
        </div>
        
        <div className="void-ticket-info">
          <div className="void-ticket-ref">Ticket: {request.ticket.ref}</div>
          <div 
            className="void-ticket-details" 
            dangerouslySetInnerHTML={{ __html: request.ticket.details_html }}
          />
        </div>

        {status === 'pending' && onCancel && (
          <button
            className="btn btn-danger btn-block cancel-request-btn"
            onClick={() => onCancel(request.id)}
          >
            <span aria-hidden="true">❌</span>
            Cancel Request
          </button>
        )}
      </article>
    );
  };

  return (
    <div className="container">
      {/* Enhanced Header */}
      <header className="header">
        <div className="content">
          <h1>Void Request Management</h1>
          <p>Manage ticket void requests and track their status</p>
        </div>
        <Link to="/teller" className="back-button" aria-label="Back to Dashboard">
            <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Statistics Summary */}
      <section className="card statistics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Request Statistics
        </h2>
        <StatisticsCards />
      </section>

      {/* Enhanced Tabs */}
      <div className="tabs-container">
        <div className="tabs" role="tablist" aria-label="Void Request sections">
          <button
            className="tab-btn"
            role="tab"
            id="tab-create"
            aria-controls="panel-create"
            aria-selected={activeTab === 'create'}
            tabIndex={activeTab === 'create' ? 0 : -1}
            onClick={() => handleTabChange('create')}
            onKeyDown={handleTabKeyDown}
          >
            Create New Request
          </button>
          <button
            className="tab-btn"
            role="tab"
            id="tab-pending"
            aria-controls="panel-pending"
            aria-selected={activeTab === 'pending'}
            tabIndex={activeTab === 'pending' ? 0 : -1}
            onClick={() => handleTabChange('pending')}
            onKeyDown={handleTabKeyDown}
          >
            Pending ({voidRequests.pending.length})
          </button>
          <button
            className="tab-btn"
            role="tab"
            id="tab-approved"
            aria-controls="panel-approved"
            aria-selected={activeTab === 'approved'}
            tabIndex={activeTab === 'approved' ? 0 : -1}
            onClick={() => handleTabChange('approved')}
            onKeyDown={handleTabKeyDown}
          >
            Approved ({voidRequests.approved.length})
          </button>
          <button
            className="tab-btn"
            role="tab"
            id="tab-rejected"
            aria-controls="panel-rejected"
            aria-selected={activeTab === 'rejected'}
            tabIndex={activeTab === 'rejected' ? 0 : -1}
            onClick={() => handleTabChange('rejected')}
            onKeyDown={handleTabKeyDown}
          >
            Rejected ({voidRequests.rejected.length})
          </button>
        </div>
      </div>

      {/* Enhanced Panels */}
      <main>
        {/* Create Panel */}
        <div className={`tabpanel ${activeTab === 'create' ? 'active' : ''}`}>
          <div className="card">
            <h2 className="card-title">
              <span className="card-icon">🔍</span>
              Search Ticket
            </h2>
            
            <div className="search-section">
              <div className="form-group">
                <label htmlFor="ticket-ref" className="form-label">
                  Ticket Reference Number
                </label>
                <div className="search-input-container">
                  <input
                    id="ticket-ref"
                    className="form-input"
                    type="text"
                    placeholder="Enter ticket reference (e.g., TKT12345678)"
                    maxLength={11}
                    autoComplete="off"
                    value={searchQuery}
                    onChange={handleInputChange}
                  />
                  {isSearching && (
                    <div className="search-spinner">
                      <div className="spinner"></div>
                    </div>
                  )}
                </div>
                <div className="helper">
                  Enter the complete ticket reference number to search for eligible tickets.
                </div>
              </div>

              {searchHistory.length > 0 && (
                <div className="search-history">
                  <div className="history-label">Recent Searches:</div>
                  <div className="history-items">
                    {searchHistory.map(ref => (
                      <button
                        key={ref}
                        className="history-item"
                        onClick={() => {
                          setSearchQuery(ref);
                          handleSearch(ref);
                        }}
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentTicket && (
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon">🎫</span>
                Ticket Details
              </h3>
              <TicketDisplay ticket={currentTicket} />
            </div>
          )}

          {currentTicket && currentTicket.status === 'valid' && currentTicket.timeLeft > 0 && (
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon">📋</span>
                Submit Void Request
              </h3>
              
              <div className="form-group">
                <label htmlFor="void-reason" className="form-label">
                  Reason for Void Request
                </label>
                <select
                  id="void-reason"
                  className="form-select"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="wrong_combination">Wrong combination entered</option>
                  <option value="wrong_amount">Wrong bet amount</option>
                  <option value="duplicate_entry">Duplicate entry</option>
                  <option value="customer_request">Customer request</option>
                  <option value="system_error">System error</option>
                  <option value="other">Other (please specify)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="void-details" className="form-label">
                  Additional Details
                </label>
                <textarea
                  id="void-details"
                  className="form-textarea"
                  placeholder="Provide additional details about the void request..."
                  maxLength={500}
                  value={voidDetails}
                  onChange={(e) => setVoidDetails(e.target.value)}
                />
                <div className="helper">
                  {voidReason === 'other' 
                    ? `Required: Provide more context (${voidDetails.length}/500 characters, minimum 10)`
                    : `Optional: Provide more context to help supervisors process your request (${voidDetails.length}/500 characters)`
                  }
                </div>
              </div>
              
              <button
                className="btn btn-warning btn-block"
                onClick={handleSubmitVoid}
                disabled={!isFormValid || isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">📤</span>
                    Submit Void Request
                  </>
                )}
              </button>
            </div>
          )}

          <div className="card">
            <h3 className="card-title">
              <span className="card-icon">📚</span>
              Recent Tickets
            </h3>
            <p className="helper" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Click on any recent ticket to quickly search for it
            </p>
            <div className="recent-grid">
              {recentTicketsData.map(ticket => (
                <button
                  key={ticket.ref}
                  className="recent-item"
                  onClick={() => {
                    setSearchQuery(ticket.ref);
                    handleSearch(ticket.ref);
                  }}
                >
                  <div className="recent-ref">{ticket.ref}</div>
                  <div className="recent-details">
                    {ticket.dt}<br />
                    {peso.format(ticket.amount)} • {ticket.bets} {ticket.bets === 1 ? 'bet' : 'bets'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Other Panels */}
        {['pending', 'approved', 'rejected'].map(panelType => (
          <div
            key={panelType}
            className={`tabpanel ${activeTab === panelType ? 'active' : ''}`}
          >
            {voidRequests[panelType].length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {panelType === 'pending' && '⏳'}
                  {panelType === 'approved' && '✅'}
                  {panelType === 'rejected' && '❌'}
                </div>
                <div className="empty-title">
                  No {panelType === 'pending' ? 'Pending' : panelType.charAt(0).toUpperCase() + panelType.slice(1)} Requests
                </div>
                <div className="empty-text">
                  {panelType === 'pending' 
                    ? "You don't have any pending void requests at the moment."
                    : `Your ${panelType} void requests will appear here.`
                  }
                </div>
              </div>
            ) : (
              voidRequests[panelType].map(request => (
                <VoidRequestItem
                  key={request.id}
                  request={request}
                  status={panelType}
                  onCancel={panelType === 'pending' ? handleCancelRequest : null}
                />
              ))
            )}
          </div>
        ))}
      </main>

      {/* Enhanced Toast */}
      {toast.show && (
        <div
          className={`toast show ${toast.type}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default VoidRequest;