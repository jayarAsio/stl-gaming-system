import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from "react-router-dom";
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
    collectedAmount: 0, // Track collected amount
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

  // 🔒 Lock page scroll when modal is open (no style/function changes)
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const readyTellers = tellers.filter(t => t.status === 'ready_collection');
    const collectedTellers = tellers.filter(t => t.status === 'collected');
    const balancedTellers = tellers.filter(t => t.status === 'balanced');
    const noActivityTellers = tellers.filter(t => t.status === 'no_activity');

    const totalSurplus = tellers.reduce((sum, t) => sum + t.surplus, 0);
    const totalCommission = tellers.reduce((sum, t) => sum + t.commission, 0);
    const totalNetCollection = tellers.reduce((sum, t) => sum + t.originalNetCollection, 0);
    const collectedAmount = tellers.reduce((sum, t) => sum + t.collectedAmount, 0);
    const pendingAmount = readyTellers.reduce((sum, t) => sum + t.netCollection, 0);

    return {
      totalTellers: tellers.length,
      readyCount: readyTellers.length,
      collectedCount: collectedTellers.length,
      balancedCount: balancedTellers.length,
      noActivityCount: noActivityTellers.length,
      totalSurplus,
      totalCommission,
      totalNetCollection,
      collectedAmount,
      pendingAmount,
      collectionRate: tellers.length > 0 ?
        (collectedTellers.length / tellers.length * 100).toFixed(1) : 0
    };
  }, [tellers]);

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

  // Handle collection modal for new collection
  const openCollectionModal = useCallback((teller) => {
    setSelectedTeller(teller);
    setCollectionAmount(teller.netCollection.toString());
    setCollectionNotes('');
    setIsEditMode(false);
    setEditingCollection(null);
    setShowCollectionModal(true);
  }, []);

  // Handle edit collection modal
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

  const closeCollectionModal = useCallback(() => {
    setShowCollectionModal(false);
    setSelectedTeller(null);
    setCollectionAmount('');
    setCollectionNotes('');
    setIsEditMode(false);
    setEditingCollection(null);
  }, []);

  // Handle collection submission (new or edit)
  const handleCollectSurplus = useCallback(async () => {
    if (!selectedTeller || !collectionAmount) return;

    const amount = parseFloat(collectionAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid collection amount', 'error');
      return;
    }

    if (amount > selectedTeller.netCollection) {
      showToast('Collection amount cannot exceed net collection', 'error');
      return;
    }

    setIsCollecting(true);

    // Simulate API call
    setTimeout(() => {
      if (isEditMode && editingCollection) {
        // EDIT MODE: Update existing collection
        const oldAmount = editingCollection.netCollected;
        const amountDifference = amount - oldAmount;

        // Update collection history
        setCollectionHistory(prev => prev.map(c => 
          c.id === editingCollection.id
            ? {
                ...c,
                netCollected: amount,
                notes: collectionNotes || c.notes,
                collectedAt: new Date().toLocaleString('en-PH', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) + ' (Edited)'
              }
            : c
        ));

        // Update teller status based on new amount
        setTellers(prev => prev.map(t => {
          if (t.id === selectedTeller.id) {
            const newNetCollection = t.netCollection - amountDifference;
            const newCollectedAmount = t.collectedAmount + amountDifference;
            const newStatus = newNetCollection <= 0 ? 'collected' : 'ready_collection';
            
            return {
              ...t,
              netCollection: newNetCollection,
              collectedAmount: newCollectedAmount,
              status: newStatus,
              lastCollection: new Date().toLocaleString('en-PH', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            };
          }
          return t;
        }));

        showToast(`Collection updated: ${peso.format(amount)} from ${selectedTeller.name}`, 'success');
      } else {
        // NEW COLLECTION MODE
        const newCollection = {
          id: `COL${Date.now().toString().slice(-6)}`,
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
          notes: collectionNotes || 'Surplus collection after winner payouts'
        };

        // Add to collection history
        setCollectionHistory(prev => [newCollection, ...prev]);

        // Update teller status
        setTellers(prev => prev.map(t => {
          if (t.id === selectedTeller.id) {
            const remainingBalance = t.netCollection - amount;
            const newCollectedAmount = t.collectedAmount + amount;
            
            // If full amount collected, mark as collected
            // If partial amount collected, keep as ready_collection with remaining balance
            const newStatus = remainingBalance <= 0 ? 'collected' : 'ready_collection';
            
            return {
              ...t,
              netCollection: remainingBalance,
              collectedAmount: newCollectedAmount,
              status: newStatus,
              lastCollection: newCollection.collectedAt
            };
          }
          return t;
        }));

        if (amount < selectedTeller.netCollection) {
          const remaining = selectedTeller.netCollection - amount;
          showToast(
            `Partial collection: ${peso.format(amount)} collected. Remaining balance: ${peso.format(remaining)}`,
            'success'
          );
        } else {
          showToast(`Full surplus collected: ${peso.format(amount)} from ${selectedTeller.name}`, 'success');
        }
      }

      setIsCollecting(false);
      closeCollectionModal();
    }, 1200);
  }, [selectedTeller, collectionAmount, collectionNotes, peso, showToast, closeCollectionModal, isEditMode, editingCollection]);

  // Get status badge class and text
  const getStatusBadge = (status) => {
    const badges = {
      ready_collection: { class: 'status-ready', text: 'READY FOR COLLECTION', icon: '💰' },
      collected: { class: 'status-collected', text: 'COLLECTED', icon: '✅' },
      balanced: { class: 'status-balanced', text: 'BALANCED', icon: '⚖️' },
      no_activity: { class: 'status-no-activity', text: 'NO ACTIVITY', icon: '🚫' }
    };
    return badges[status] || badges.ready_collection;
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-value">{statistics.totalTellers}</div>
        <div className="stat-label">Total Tellers</div>
      </div>
      <div className="stat-card pending">
        <div className="stat-value">{statistics.readyCount}</div>
        <div className="stat-label">Ready Collection</div>
      </div>
      <div className="stat-card collected">
        <div className="stat-value">{statistics.collectedCount}</div>
        <div className="stat-label">Collected Today</div>
      </div>
      <div className="stat-card rate">
        <div className="stat-value">{statistics.collectionRate}%</div>
        <div className="stat-label">Collection Rate</div>
      </div>
    </div>
  );

  // Teller Item Component
  const TellerItem = ({ teller }) => {
    const statusBadge = getStatusBadge(teller.status);
    const canCollect = teller.status === 'ready_collection' && teller.netCollection > 0;
    const hasLargeSurplus = teller.surplus > 20000;
    const hasPartialCollection = teller.collectedAmount > 0 && teller.netCollection > 0;

    return (
      <article className={`teller-item ${teller.status} ${hasLargeSurplus ? 'high-value' : ''}`}>
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

          {(canCollect || teller.status === 'collected' || hasPartialCollection) && (
            <>
              <div className="stat-row">
                <div className="stat">
                  <div className="stat-label">Gross Surplus</div>
                  <div className="stat-value surplus">{peso.format(teller.surplus)}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Commission</div>
                  <div className="stat-value commission">{peso.format(teller.commission)}</div>
                </div>
              </div>
              
              {/* Show collected amount if there's a partial or full collection */}
              {teller.collectedAmount > 0 && (
                <div className="collection-row collected-row">
                  <div className="collection-label">Amount Collected</div>
                  <div className="collection-amount collected">{peso.format(teller.collectedAmount)}</div>
                </div>
              )}
              
              {/* Show remaining balance if there's still amount to collect */}
              {teller.netCollection > 0 && (
                <div className="collection-row">
                  <div className="collection-label">
                    {hasPartialCollection ? 'Remaining Balance' : 'Net Collection Amount'}
                  </div>
                  <div className="collection-amount">{peso.format(teller.netCollection)}</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="teller-footer">
          <div className="last-collection">
            Last Collection: {teller.lastCollection}
          </div>
          {canCollect && (
            <button
              className={`btn btn-collect ${hasLargeSurplus ? 'high-value' : ''}`}
              onClick={() => openCollectionModal(teller)}
            >
              <span className="btn-icon">💰</span>
              {hasPartialCollection ? 'Collect Remaining' : 'Collect Surplus'}
            </button>
          )}
        </div>
      </article>
    );
  };

  // Collection History Item Component
  const CollectionHistoryItem = ({ collection }) => (
    <article className="history-item">
      <div className="history-header">
        <div className="history-info">
          <div className="history-id">#{collection.id}</div>
          <div className="history-teller">{collection.tellerName}</div>
        </div>
        <div className="history-amount">{peso.format(collection.netCollected)}</div>
      </div>
      <div className="history-breakdown">
        <div className="breakdown-item">
          <span>Gross Surplus:</span>
          <span>{peso.format(collection.surplusAmount)}</span>
        </div>
        <div className="breakdown-item">
          <span>Commission Deducted:</span>
          <span className="commission">-{peso.format(collection.commissionDeducted)}</span>
        </div>
        <div className="breakdown-item total">
          <span>Net Collected:</span>
          <span>{peso.format(collection.netCollected)}</span>
        </div>
      </div>
      <div className="history-details">
        <div className="history-time">{collection.collectedAt}</div>
        <div className="history-collector">by {collection.collectedBy}</div>
      </div>
      {collection.notes && (
        <div className="history-notes">{collection.notes}</div>
      )}
      <div className="history-actions">
        <button
          className="btn btn-edit"
          onClick={() => openEditModal(collection)}
        >
          <span>✏️</span>
          Edit Collection
        </button>
      </div>
    </article>
  );

  // ---------- Modal Portal ----------
  const ModalPortal = ({ children }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
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

      {/* Collection Modal (Portal for perfect centering) */}
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
