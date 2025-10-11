import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    shortage: 7230,
    originalShortage: 7230,
    paidAmount: 0,
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
    shortage: 0,
    originalShortage: 0,
    paidAmount: 0,
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
    originalShortage: 16150,
    paidAmount: 0,
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
    originalShortage: 14400,
    paidAmount: 0,
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
    originalShortage: 0,
    paidAmount: 0,
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
    reason: 'insufficient_funds' // legacy display only
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
    reason: 'multiple_winners' // legacy display only
  }
];

const PayoutTapal = () => {
  // State
  const [tellers, setTellers] = useState(mockTellers);
  const [payoutHistory, setPayoutHistory] = useState(mockPayoutHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('needs_payout');
  const [selectedTeller, setSelectedTeller] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [fieldError, setFieldError] = useState('');

  // Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPayout, setEditingPayout] = useState(null);

  // 👉 Ref for the amount field (to keep/restore focus)
  const amountInputRef = useRef(null);

  // Body bg class
  useEffect(() => {
    document.body.classList.add("payout-tapal-bg");
    return () => document.body.classList.remove("payout-tapal-bg");
  }, []);

  // Lock scroll behind modal
  useEffect(() => {
    if (showPayoutModal) {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [showPayoutModal]);

  // Mobile 100vh fix
  useEffect(() => {
    if (!showPayoutModal) return;
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--app-vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
      document.documentElement.style.removeProperty('--app-vh');
    };
  }, [showPayoutModal]);

  // ✅ Focus amount field whenever modal opens
  useEffect(() => {
    if (!showPayoutModal) return;
    const t = setTimeout(() => {
      const el = amountInputRef.current;
      if (el) {
        el.focus({ preventScroll: true });
        const v = el.value || '';
        el.setSelectionRange(v.length, v.length);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [showPayoutModal]);

  // Helpers
  const peso = useMemo(() => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }), []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Stats
  const statistics = useMemo(() => {
    const needsPayout = tellers.filter(t => t.status === 'needs_payout');
    const surplusTellers = tellers.filter(t => t.status === 'surplus');

    const totalShortage = needsPayout.reduce((sum, t) => sum + t.shortage, 0);
    const totalSurplus = surplusTellers.reduce((sum, t) => sum + (t.surplus || 0), 0);
    const totalPayoutsToday = tellers.reduce((sum, t) => sum + t.paidAmount, 0);

    return {
      tellersNeedingPayout: needsPayout.length,
      tellersWithSurplus: surplusTellers.length,
      totalShortage,
      totalSurplus,
      totalPayoutsToday,
      netPosition: totalSurplus - totalShortage
    };
  }, [tellers]);

  // Filters
  const filteredTellers = useMemo(() => {
    return tellers.filter(teller => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === '' ||
        teller.name.toLowerCase().includes(q) ||
        teller.code.toLowerCase().includes(q) ||
        teller.location.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || teller.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tellers, searchQuery, statusFilter]);

  // Max amount allowed
  const maxAllowedAmount = useMemo(() => {
    if (!selectedTeller) return 0;
    if (isEditMode && editingPayout) {
      return (editingPayout.amount || 0) + (selectedTeller.shortage || 0);
    }
    return selectedTeller.shortage || 0;
  }, [selectedTeller, isEditMode, editingPayout]);

  // Sanitize & clamp (keeps only digits + one '.')
  const sanitizeAmount = useCallback((raw, max) => {
    let v = String(raw).replace(/[^\d.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    if (v.includes('.')) {
      const [a, b] = v.split('.');
      v = a + '.' + b.slice(0, 2);
    }
    if (v.startsWith('.')) v = '0' + v;
    if (v === '') return '';
    let n = parseFloat(v);
    if (isNaN(n)) return '';
    if (n < 0) n = 0;
    if (typeof max === 'number' && n > max) n = max;
    return n.toString();
  }, []);

  // Keep focus + caret while typing
  const onAmountChange = useCallback((e) => {
    const next = sanitizeAmount(e.target.value, maxAllowedAmount);
    setPayoutAmount(next);
    setFieldError('');
    // keep caret at the end after React re-render
    requestAnimationFrame(() => {
      const el = amountInputRef.current;
      if (el) {
        const v = el.value || '';
        el.setSelectionRange(v.length, v.length);
        el.focus({ preventScroll: true }); // ensure it stays focused
      }
    });
  }, [sanitizeAmount, maxAllowedAmount]);

  // Open modals
  const openPayoutModal = useCallback((teller) => {
    setSelectedTeller(teller);
    setPayoutAmount((teller.shortage ?? 0).toString());
    setPayoutNotes('');
    setIsEditMode(false);
    setEditingPayout(null);
    setFieldError('');
    setShowPayoutModal(true);
  }, []);

  const openEditModal = useCallback((payout) => {
    const teller = tellers.find(t => t.id === payout.tellerId);
    if (!teller) return;
    setSelectedTeller(teller);
    setPayoutAmount((payout.amount ?? 0).toString());
    setPayoutNotes(payout.notes || '');
    setIsEditMode(true);
    setEditingPayout(payout);
    setFieldError('');
    setShowPayoutModal(true);
  }, [tellers]);

  const closePayoutModal = useCallback(() => {
    setShowPayoutModal(false);
    setSelectedTeller(null);
    setPayoutAmount('');
    setPayoutNotes('');
    setIsEditMode(false);
    setEditingPayout(null);
    setFieldError('');
  }, []);

  // Process payout
  const handleProcessPayout = useCallback(async () => {
    if (!selectedTeller || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setFieldError('Please enter a valid payout amount.');
      showToast('Please enter a valid payout amount', 'error');
      // refocus on error
      requestAnimationFrame(() => amountInputRef.current?.focus({ preventScroll: true }));
      return;
    }

    if (amount > maxAllowedAmount) {
      setFieldError(`Amount cannot exceed ${peso.format(maxAllowedAmount)}.`);
      showToast('Payout amount exceeds allowed amount', 'error');
      requestAnimationFrame(() => amountInputRef.current?.focus({ preventScroll: true }));
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (isEditMode && editingPayout) {
        const oldAmount = editingPayout.amount;
        const diff = amount - oldAmount;

        setPayoutHistory(prev => prev.map(p =>
          p.id === editingPayout.id
            ? {
                ...p,
                amount,
                notes: payoutNotes || p.notes,
                processedAt: new Date().toLocaleString('en-PH', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', hour12: true
                }) + ' (Edited)'
              }
            : p
        ));

        setTellers(prev => prev.map(t => {
          if (t.id !== selectedTeller.id) return t;
          const newShortage = t.shortage - diff;
          const newPaidAmount = t.paidAmount + diff;
          const newStatus = newShortage <= 0 ? 'balanced' : 'needs_payout';
          return {
            ...t,
            shortage: newShortage,
            paidAmount: newPaidAmount,
            status: newStatus,
            lastPayout: new Date().toLocaleString('en-PH', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', hour12: true
            })
          };
        }));

        showToast(`Payout updated: ${peso.format(amount)} to ${selectedTeller.name}`, 'success');
      } else {
        const newPayout = {
          id: `PAY${Date.now().toString().slice(-6)}`,
          tellerId: selectedTeller.id,
          tellerName: selectedTeller.name,
          amount,
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
          notes: payoutNotes || 'Standard payout processing'
        };

        setPayoutHistory(prev => [newPayout, ...prev]);

        setTellers(prev => prev.map(t => {
          if (t.id !== selectedTeller.id) return t;
          const remainingShortage = t.shortage - amount;
          const newPaidAmount = t.paidAmount + amount;
          const newStatus = remainingShortage <= 0 ? 'balanced' : 'needs_payout';
          return {
            ...t,
            shortage: remainingShortage,
            paidAmount: newPaidAmount,
            status: newStatus,
            lastPayout: newPayout.processedAt
          };
        }));

        if (amount < selectedTeller.shortage) {
          const remaining = selectedTeller.shortage - amount;
          showToast(
            `Partial payout: ${peso.format(amount)} paid. Remaining shortage: ${peso.format(remaining)}`,
            'success'
          );
        } else {
          showToast(`Full shortage covered: ${peso.format(amount)} to ${selectedTeller.name}`, 'success');
        }
      }

      setIsProcessing(false);
      closePayoutModal();
    }, 900);
  }, [selectedTeller, payoutAmount, payoutNotes, peso, showToast, closePayoutModal, isEditMode, editingPayout, maxAllowedAmount]);

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      needs_payout: { class: 'status-needs-payout', text: 'NEEDS PAYOUT', icon: '💸' },
      surplus: { class: 'status-surplus', text: 'HAS SURPLUS', icon: '💰' },
      balanced: { class: 'status-balanced', text: 'BALANCED', icon: '✅' }
    };
    return badges[status] || badges.needs_payout;
  };

  // Components
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

  const TellerItem = ({ teller }) => {
    const statusBadge = getStatusBadge(teller.status);
    const needsPayout = teller.status === 'needs_payout' && teller.shortage > 0;
    const hasShortage = teller.shortage > 0;
    const hasPartialPayment = teller.paidAmount > 0 && teller.shortage > 0;

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
          
          {teller.paidAmount > 0 && (
            <div className="payout-row paid-row">
              <div className="payout-label">Amount Paid</div>
              <div className="payout-amount paid">{peso.format(teller.paidAmount)}</div>
            </div>
          )}
          
          {hasShortage && (
            <div className="shortage-row">
              <div className="shortage-label">
                {hasPartialPayment ? 'Remaining Shortage' : 'Shortage Amount'}
              </div>
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
              {hasPartialPayment ? 'Pay Remaining' : 'Process Tapal'}
            </button>
          )}
        </div>
      </article>
    );
  };

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
      {/* Legacy reason shown if present */}
      {payout.reason && (
        <div className="history-reason">
          Reason: {payout.reason.replace(/_/g, ' ').toUpperCase()}
        </div>
      )}
      {payout.notes && (
        <div className="history-notes">{payout.notes}</div>
      )}
      <div className="history-actions">
        <button
          className="btn btn-edit"
          onClick={() => openEditModal(payout)}
        >
          <span>✏️</span>
          Edit Payout
        </button>
      </div>
    </article>
  );

  const ModalPortal = ({ children }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
  };

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

      {/* Statistics */}
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

      {/* Controls */}
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

      {/* Tellers */}
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

      {/* History */}
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

      {/* Modal */}
      {showPayoutModal && selectedTeller && (
        <ModalPortal>
          <div className="modal-overlay" onClick={closePayoutModal} role="dialog" aria-modal="true" aria-labelledby="payout-modal-title">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 id="payout-modal-title">{isEditMode ? 'Edit Payout' : 'Process Payout'}</h3>
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
                    {selectedTeller.paidAmount > 0 && (
                      <div className="summary-item">
                        <span>Already Paid</span>
                        <span className="paid-highlight">{peso.format(selectedTeller.paidAmount)}</span>
                      </div>
                    )}
                    <div className="summary-item shortage-highlight">
                      <span>{isEditMode ? 'Current Shortage' : selectedTeller.paidAmount > 0 ? 'Remaining Shortage' : 'Shortage Amount'}</span>
                      <span className="highlight">{peso.format(selectedTeller.shortage)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="payout-amount" className="form-label">
                    Payout Amount
                  </label>
                  <input
                    id="payout-amount"
                    ref={amountInputRef}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]{0,2}"
                    className="form-input"
                    value={payoutAmount}
                    onChange={onAmountChange}
                    // keep focus; just prevent wheel increments
                    onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
                    }}
                    aria-describedby="payout-amount-help"
                    placeholder={`Max ${peso.format(maxAllowedAmount)}`}
                    autoFocus
                  />
                  <div id="payout-amount-help" className="form-help">
                    {fieldError
                      ? <span style={{color:'#ef4444'}}>{fieldError}</span>
                      : (isEditMode
                          ? `You can update up to ${peso.format(maxAllowedAmount)}.`
                          : `Enter amount up to ${peso.format(maxAllowedAmount)}.`)
                    }
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
                  disabled={isProcessing || !payoutAmount}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>{isEditMode ? '✏️' : '💸'}</span>
                      {isEditMode ? 'Update Payout' : 'Process Payout'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PayoutTapal;
