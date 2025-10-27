import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import "../styles/sales-collection.css";

// Mock data for tellers with various collection situations
const mockTellers = [
  {
    id: 'T001',
    name: 'Juan Dela Cruz',
    code: 'TLR001',
    location: 'Booth A1',
    totalSales: 25420,
    totalWinners: 8650,
    surplus: 16770,
    commission: 1271,
    netCollection: 15499,
    originalNetCollection: 15499,
    collectedAmount: 0,
    ticketsSold: 87,
    winningTickets: 5,
    status: 'ready_collection',
    lastCollection: '2025-01-14 09:30 AM',
    contactNumber: '09171234567'
  },
  {
    id: 'T002',
    name: 'Maria Santos',
    code: 'TLR002',
    location: 'Booth B2',
    totalSales: 18150,
    totalWinners: 12200,
    surplus: 5950,
    commission: 907.5,
    netCollection: 5042.5,
    originalNetCollection: 5042.5,
    collectedAmount: 5042.5,
    ticketsSold: 134,
    winningTickets: 8,
    status: 'collected',
    lastCollection: '2025-01-15 12:30 PM',
    contactNumber: '09281234567'
  },
  {
    id: 'T003',
    name: 'Pedro Garcia',
    code: 'TLR003',
    location: 'Booth C3',
    totalSales: 32750,
    totalWinners: 18900,
    surplus: 13850,
    commission: 1637.5,
    netCollection: 12212.5,
    originalNetCollection: 12212.5,
    collectedAmount: 0,
    ticketsSold: 92,
    winningTickets: 12,
    status: 'ready_collection',
    lastCollection: '2025-01-14 10:15 AM',
    contactNumber: '09391234567'
  },
  {
    id: 'T004',
    name: 'Ana Reyes',
    code: 'TLR004',
    location: 'Booth D4',
    totalSales: 28200,
    totalWinners: 15600,
    surplus: 12600,
    commission: 1410,
    netCollection: 11190,
    originalNetCollection: 11190,
    collectedAmount: 0,
    ticketsSold: 156,
    winningTickets: 18,
    status: 'ready_collection',
    lastCollection: '2025-01-14 07:30 AM',
    contactNumber: '09401234567'
  },
  {
    id: 'T005',
    name: 'Carlos Lopez',
    code: 'TLR005',
    location: 'Booth E5',
    totalSales: 22890,
    totalWinners: 4250,
    surplus: 18640,
    commission: 1144.5,
    netCollection: 17495.5,
    originalNetCollection: 17495.5,
    collectedAmount: 17495.5,
    ticketsSold: 73,
    winningTickets: 3,
    status: 'collected',
    lastCollection: '2025-01-15 11:00 AM',
    contactNumber: '09511234567'
  },
  {
    id: 'T006',
    name: 'Rosa Martinez',
    code: 'TLR006',
    location: 'Booth F6',
    totalSales: 15600,
    totalWinners: 15600,
    surplus: 0,
    commission: 780,
    netCollection: 0,
    originalNetCollection: 0,
    collectedAmount: 0,
    ticketsSold: 45,
    winningTickets: 12,
    status: 'balanced',
    lastCollection: '2025-01-13 02:15 PM',
    contactNumber: '09621234567'
  },
  {
    id: 'T007',
    name: 'Miguel Fernandez',
    code: 'TLR007',
    location: 'Booth G7',
    totalSales: 2850,
    totalWinners: 0,
    surplus: 2850,
    commission: 142.5,
    netCollection: 2707.5,
    originalNetCollection: 2707.5,
    collectedAmount: 0,
    ticketsSold: 12,
    winningTickets: 0,
    status: 'ready_collection',
    lastCollection: '2025-01-12 04:30 PM',
    contactNumber: '09731234567'
  },
  {
    id: 'T008',
    name: 'Elena Gonzalez',
    code: 'TLR008',
    location: 'Booth H8',
    totalSales: 0,
    totalWinners: 0,
    surplus: 0,
    commission: 0,
    netCollection: 0,
    originalNetCollection: 0,
    collectedAmount: 0,
    ticketsSold: 0,
    winningTickets: 0,
    status: 'no_activity',
    lastCollection: '2025-01-10 11:45 AM',
    contactNumber: '09841234567'
  },
  {
    id: 'T009',
    name: 'Lisa Santos',
    code: 'TLR009',
    location: 'Booth I9',
    totalSales: 1250,
    totalWinners: 850,
    surplus: 400,
    commission: 62.5,
    netCollection: 337.5,
    originalNetCollection: 337.5,
    collectedAmount: 0,
    ticketsSold: 8,
    winningTickets: 2,
    status: 'ready_collection',
    lastCollection: '2025-01-13 09:10 AM',
    contactNumber: '09061234567'
  }
];

const mockCollectionHistory = [
  {
    id: 'COL001',
    tellerId: 'T002',
    tellerName: 'Maria Santos',
    surplusAmount: 5950,
    commissionDeducted: 907.5,
    netCollected: 5042.5,
    collectedAt: '2025-01-15 12:30 PM',
    collectedBy: 'Collector C001',
    notes: 'Surplus collection after winner payouts - verified cash count'
  },
  {
    id: 'COL002',
    tellerId: 'T005',
    tellerName: 'Carlos Lopez',
    surplusAmount: 18640,
    commissionDeducted: 1144.5,
    netCollected: 17495.5,
    collectedAt: '2025-01-15 12:45 PM',
    collectedBy: 'Collector C001',
    notes: 'Large surplus collection - minimal winners today'
  }
];

const SalesCollection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // State management
  const [tellers, setTellers] = useState(mockTellers);
  const [collectionHistory, setCollectionHistory] = useState(mockCollectionHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ready_collection');
  const [selectedTeller, setSelectedTeller] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // New states for edit functionality
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  // Apply body class for background
  useEffect(() => {
    document.body.classList.add("sales-collection-bg");
    return () => document.body.classList.remove("sales-collection-bg");
  }, []);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (showCollectionModal) {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [showCollectionModal]);

  // Format currency (memoized)
  const peso = useMemo(() => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }), []);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Statistics calculations
  const statistics = useMemo(() => {
    const readyForCollection = tellers.filter(t => t.status === 'ready_collection');
    const collected = tellers.filter(t => t.status === 'collected');

    const totalAvailableForCollection = readyForCollection.reduce((sum, t) => sum + t.netCollection, 0);
    const totalCollectedToday = collected.reduce((sum, t) => sum + t.collectedAmount, 0);
    const totalCommissionDeducted = collected.reduce((sum, t) => sum + t.commission, 0);

    return {
      tellersReadyForCollection: readyForCollection.length,
      tellersCollected: collected.length,
      totalAvailableForCollection,
      totalCollectedToday,
      totalCommissionDeducted
    };
  }, [tellers]);

  // Filter tellers based on search and status
  const filteredTellers = useMemo(() => {
    return tellers.filter(teller => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchQuery ||
        teller.name.toLowerCase().includes(searchLower) ||
        teller.code.toLowerCase().includes(searchLower) ||
        teller.location.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'all' || teller.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tellers, searchQuery, statusFilter]);

  // Handle opening collection modal
  const openCollectionModal = useCallback((teller) => {
    if (teller.status === 'collected' || teller.status === 'no_activity' || teller.status === 'balanced') {
      return;
    }
    setSelectedTeller(teller);
    setCollectionAmount(teller.netCollection.toString());
    setCollectionNotes('');
    setIsEditMode(false);
    setEditingCollection(null);
    setShowCollectionModal(true);
  }, []);

  // Handle opening edit modal for collection history
  const openEditModal = useCallback((collection) => {
    const teller = tellers.find(t => t.id === collection.tellerId);
    if (!teller) return;

    setSelectedTeller(teller);
    setCollectionAmount(collection.netCollected.toString());
    setCollectionNotes(collection.notes || '');
    setIsEditMode(true);
    setEditingCollection(collection);
    setShowCollectionModal(true);
  }, [tellers]);

  // Handle closing collection modal
  const closeCollectionModal = useCallback(() => {
    setShowCollectionModal(false);
    setSelectedTeller(null);
    setCollectionAmount('');
    setCollectionNotes('');
    setIsEditMode(false);
    setEditingCollection(null);
  }, []);

  // Handle collecting surplus
  const handleCollectSurplus = useCallback(async () => {
    if (!selectedTeller || !collectionAmount || isCollecting) return;

    const amount = parseFloat(collectionAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (amount > selectedTeller.netCollection) {
      showToast(`Amount cannot exceed ${peso.format(selectedTeller.netCollection)}`, 'error');
      return;
    }

    setIsCollecting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isEditMode && editingCollection) {
        // Update existing collection
        setCollectionHistory(prev =>
          prev.map(c => c.id === editingCollection.id
            ? {
                ...c,
                surplusAmount: selectedTeller.surplus,
                commissionDeducted: selectedTeller.commission,
                netCollected: amount,
                notes: collectionNotes,
                collectedAt: new Date().toLocaleString('en-PH', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }
            : c
          )
        );

        // Update teller record
        setTellers(prev =>
          prev.map(t => t.id === selectedTeller.id
            ? {
                ...t,
                collectedAmount: amount,
                netCollection: t.originalNetCollection - amount,
                status: amount >= t.originalNetCollection ? 'collected' : 'ready_collection',
                lastCollection: new Date().toLocaleString('en-PH', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }
            : t
          )
        );

        showToast(`Collection updated for ${selectedTeller.name}`, 'success');
      } else {
        // Create new collection
        const newCollection = {
          id: `COL${Date.now()}`,
          tellerId: selectedTeller.id,
          tellerName: selectedTeller.name,
          surplusAmount: selectedTeller.surplus,
          commissionDeducted: selectedTeller.commission,
          netCollected: amount,
          collectedAt: new Date().toLocaleString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          collectedBy: 'Collector C001',
          notes: collectionNotes
        };

        setCollectionHistory(prev => [newCollection, ...prev]);

        // Update teller's collected amount and status
        setTellers(prev =>
          prev.map(t => t.id === selectedTeller.id
            ? {
                ...t,
                collectedAmount: t.collectedAmount + amount,
                netCollection: t.netCollection - amount,
                status: amount >= t.netCollection ? 'collected' : 'ready_collection',
                lastCollection: new Date().toLocaleString('en-PH', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }
            : t
          )
        );

        showToast(`Successfully collected ${peso.format(amount)} from ${selectedTeller.name}`, 'success');
      }

      closeCollectionModal();
    } catch (error) {
      showToast('Failed to process collection. Please try again.', 'error');
    } finally {
      setIsCollecting(false);
    }
  }, [selectedTeller, collectionAmount, collectionNotes, isCollecting, isEditMode, editingCollection, peso, showToast, closeCollectionModal]);

  // Modal portal component
  const ModalPortal = ({ children }) => {
    return typeof document !== 'undefined'
      ? createPortal(children, document.body)
      : null;
  };

  // Statistics card component
  const StatisticsCards = () => (
    <div className="stats-grid">
      <div className="stat-card ready">
        <div className="stat-icon">📥</div>
        <div className="stat-value">{statistics.tellersReadyForCollection}</div>
        <div className="stat-label">Ready for Collection</div>
      </div>
      <div className="stat-card collected">
        <div className="stat-icon">✅</div>
        <div className="stat-value">{statistics.tellersCollected}</div>
        <div className="stat-label">Collected Today</div>
      </div>
      <div className="stat-card available">
        <div className="stat-icon">💰</div>
        <div className="stat-value">{peso.format(statistics.totalAvailableForCollection)}</div>
        <div className="stat-label">Available to Collect</div>
      </div>
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-value">{peso.format(statistics.totalCollectedToday)}</div>
        <div className="stat-label">Total Collected</div>
      </div>
    </div>
  );

  // Teller item component
  const TellerItem = ({ teller }) => (
    <div className={`teller-item status-${teller.status}`}>
      <div className="teller-header">
        <div className="teller-info">
          <h3>{teller.name}</h3>
          <p className="teller-code">{teller.code} • {teller.location}</p>
        </div>
        <div className={`status-badge ${teller.status}`}>
          {teller.status === 'ready_collection' && '📥 Ready'}
          {teller.status === 'collected' && '✅ Collected'}
          {teller.status === 'balanced' && '⚖️ Balanced'}
          {teller.status === 'no_activity' && '💤 No Activity'}
        </div>
      </div>

      <div className="teller-details">
        <div className="detail-row">
          <span>Total Sales</span>
          <span>{peso.format(teller.totalSales)}</span>
        </div>
        <div className="detail-row">
          <span>Winner Payouts</span>
          <span>{peso.format(teller.totalWinners)}</span>
        </div>
        <div className="detail-row">
          <span>Gross Surplus</span>
          <span className="surplus">{peso.format(teller.surplus)}</span>
        </div>
        <div className="detail-row">
          <span>Commission (5%)</span>
          <span className="commission">-{peso.format(teller.commission)}</span>
        </div>
        {teller.collectedAmount > 0 && (
          <div className="detail-row">
            <span>Collected</span>
            <span className="collected">{peso.format(teller.collectedAmount)}</span>
          </div>
        )}
        <div className="detail-row highlight">
          <span>{teller.collectedAmount > 0 ? 'Remaining' : 'Net Collection'}</span>
          <span className="amount">{peso.format(teller.netCollection)}</span>
        </div>
      </div>

      {teller.status === 'ready_collection' && teller.netCollection > 0 && (
        <button
          className="collect-btn"
          onClick={() => openCollectionModal(teller)}
        >
          💰 Collect Surplus
        </button>
      )}

      <div className="teller-footer">
        <span className="last-collection">Last: {teller.lastCollection}</span>
      </div>
    </div>
  );

  // Collection history item component
  const CollectionHistoryItem = ({ collection }) => (
    <div className="history-item">
      <div className="history-header">
        <div>
          <h4>{collection.tellerName}</h4>
          <p className="history-time">{collection.collectedAt}</p>
        </div>
        <div className="history-amount">{peso.format(collection.netCollected)}</div>
      </div>

      <div className="history-details">
        <div className="detail-row">
          <span>Gross Surplus</span>
          <span>{peso.format(collection.surplusAmount)}</span>
        </div>
        <div className="detail-row">
          <span>Commission</span>
          <span>-{peso.format(collection.commissionDeducted)}</span>
        </div>
        <div className="detail-row highlight">
          <span>Net Collected</span>
          <span>{peso.format(collection.netCollected)}</span>
        </div>
      </div>

      {collection.notes && (
        <div className="history-notes">
          <strong>Notes:</strong> {collection.notes}
        </div>
      )}

      <div className="history-footer">
        <span className="collected-by">By: {collection.collectedBy}</span>
        <button className="edit-btn" onClick={() => openEditModal(collection)}>
          ✏️ Edit
        </button>
      </div>
    </div>
  );

  // ⚠️ Loading check
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  // Main return - only renders if authenticated
  return (
    <div className="sales-collection-container">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1>Sales Collection</h1>
          <p className="header-subtitle">Collect remittances from tellers and update ledger records</p>
        </div>
        <Link
          to="/collector"
          className="back-btn"
          aria-label="Back to Dashboard"
        >
          <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Statistics Summary */}
      <section className="card statistics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Collection Summary
        </h2>
        <StatisticsCards />
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
              <option value="ready_collection">Ready for Collection</option>
              <option value="collected">Collected</option>
              <option value="balanced">Balanced</option>
              <option value="no_activity">No Activity</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tellers List */}
      <section className="card tellers-section">
        <h2 className="section-title">
          <span className="section-icon">👥</span>
          Tellers with Surplus ({filteredTellers.length})
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

      {/* Collection History */}
      <section className="card history-section">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Collection History
        </h2>

        {collectionHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No Collections Yet</div>
            <div className="empty-text">
              Collection records will appear here after you collect surplus amounts.
            </div>
          </div>
        ) : (
          <div className="history-grid">
            {collectionHistory.map(collection => (
              <CollectionHistoryItem key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>

      {/* Collection Modal */}
      {showCollectionModal && selectedTeller && (
        <ModalPortal>
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-modal-title"
            onClick={closeCollectionModal}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 id="collection-modal-title">{isEditMode ? 'Edit Collection' : 'Collect Surplus'}</h3>
                <button
                  className="modal-close"
                  onClick={closeCollectionModal}
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
                    <div className="summary-item">
                      <span>Gross Surplus</span>
                      <span className="surplus">{peso.format(selectedTeller.surplus)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Commission (5%)</span>
                      <span className="commission">-{peso.format(selectedTeller.commission)}</span>
                    </div>
                    {selectedTeller.collectedAmount > 0 && (
                      <div className="summary-item">
                        <span>Already Collected</span>
                        <span className="collected-highlight">{peso.format(selectedTeller.collectedAmount)}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span>{isEditMode ? 'Current Balance' : selectedTeller.collectedAmount > 0 ? 'Remaining Balance' : 'Net Collection'}</span>
                      <span className="highlight">{peso.format(selectedTeller.netCollection)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="collection-amount" className="form-label">
                    Collection Amount
                  </label>
                  <input
                    id="collection-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedTeller.netCollection}
                    className="form-input"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    autoFocus
                  />
                  <div className="form-help">
                    {isEditMode
                      ? 'Update the collection amount. This will adjust the teller\'s balance accordingly.'
                      : 'Enter the actual surplus amount collected. Can be partial or full amount.'}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="collection-notes" className="form-label">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="collection-notes"
                    className="form-textarea"
                    placeholder="Add any notes about this collection..."
                    value={collectionNotes}
                    onChange={(e) => setCollectionNotes(e.target.value)}
                    maxLength={500}
                  />
                  <div className="form-help">
                    {collectionNotes.length}/500 characters
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeCollectionModal}
                  disabled={isCollecting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCollectSurplus}
                  disabled={isCollecting || !collectionAmount}
                >
                  {isCollecting ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>{isEditMode ? '✏️' : '💰'}</span>
                      {isEditMode ? 'Update Collection' : 'Complete Collection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
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

export default SalesCollection;
