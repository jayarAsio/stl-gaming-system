import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import "../styles/sales-report.css";

const SalesReport = ({ 
  commissionRate = 0.05, 
  games = ['STL Pares', 'Last 2', 'Last 3', 'Swer3'],
  onNavigateBack 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('pending');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart'
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalTickets: 0,
    totalCommission: 0,
    games: [],
    days: []
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Ticket search functionality
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
  const [ticketSearchHistory, setTicketSearchHistory] = useState([]);

  // Mock ticket data with more demo tickets for reprinting
  const mockTicketData = {
    'TKT87654321': {
      ref: 'TKT87654321',
      date: 'Jan 15, 2025 2:30 PM',
      status: 'paid',
      customer: 'Juan Dela Cruz',
      totalAmount: 150,
      commission: 7.50,
      bets: [
        { game: 'STL Pares', combo: '12.34', amount: 50 },
        { game: 'Last 2', combo: '56', amount: 50 },
        { game: 'Swer3', combo: '789', amount: 50 }
      ],
      drawResults: {
        'STL Pares': { result: '12.34', status: 'won', payout: 500 },
        'Last 2': { result: '45', status: 'lost', payout: 0 },
        'Swer3': { result: '123', status: 'lost', payout: 0 }
      }
    },
    'TKT98765432': {
      ref: 'TKT98765432',
      date: 'Jan 15, 2025 1:45 PM',
      status: 'paid',
      customer: 'Maria Santos',
      totalAmount: 200,
      commission: 10.00,
      bets: [
        { game: 'Last 3', combo: '123', amount: 100 },
        { game: 'STL Pares', combo: '05.17', amount: 100 }
      ],
      drawResults: {
        'Last 3': { result: '456', status: 'lost', payout: 0 },
        'STL Pares': { result: '05.17', status: 'won', payout: 800 }
      }
    },
    'TKT11223344': {
      ref: 'TKT11223344',
      date: 'Jan 14, 2025 3:15 PM',
      status: 'paid',
      customer: 'Pedro Garcia',
      totalAmount: 150,
      commission: 7.50,
      bets: [
        { game: 'Last 2', combo: '88', amount: 75 },
        { game: 'Swer3', combo: '555', amount: 75 }
      ],
      drawResults: {
        'Last 2': { result: '88', status: 'won', payout: 750 },
        'Swer3': { result: '555', status: 'won', payout: 3750 }
      }
    },
    'TKT55667788': {
      ref: 'TKT55667788',
      date: 'Jan 14, 2025 11:30 AM',
      status: 'paid',
      customer: 'Ana Reyes',
      totalAmount: 200,
      commission: 10.00,
      bets: [
        { game: 'STL Pares', combo: '99.88', amount: 100 },
        { game: 'Last 3', combo: '777', amount: 100 }
      ],
      drawResults: {
        'STL Pares': { result: '12.34', status: 'lost', payout: 0 },
        'Last 3': { result: '777', status: 'won', payout: 5000 }
      }
    }
  };

  // Initialize dates to today and last week
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = formatDate(today);
    const lastWeekStr = formatDate(lastWeek);
    
    setFromDate(todayStr);
    setToDate(todayStr);
  }, []);

  // Auto-generate report when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      generateReport();
    }
  }, [fromDate, toDate]);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Enhanced sample data generation
  const generateSampleData = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const dailyGameData = [];
    let totalSales = 0, totalTickets = 0;

    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Weekend multiplier for more realistic data
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const weekendMultiplier = isWeekend ? 1.3 : 1.0;
      
      const dayRecord = {
        date: currentDate.toLocaleDateString('en-PH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        dayName: currentDate.toLocaleDateString('en-PH', { weekday: 'short' }),
        games: {}
      };

      games.forEach(game => {
        const baseTickets = Math.floor(Math.random() * 50) + 10;
        const tickets = Math.floor(baseTickets * weekendMultiplier);
        const averageAmount = Math.floor(Math.random() * 30) + 20;
        const sales = tickets * averageAmount;
        
        dayRecord.games[game] = {
          tickets,
          sales,
          commission: Math.floor(sales * commissionRate),
          averageAmount
        };
      });

      dailyGameData.push(dayRecord);
    }

    // Calculate game totals
    const gameData = games.map(game => {
      let tickets = 0, sales = 0;
      
      dailyGameData.forEach(day => {
        tickets += day.games[game].tickets;
        sales += day.games[game].sales;
      });
      
      totalTickets += tickets;
      totalSales += sales;
      
      return {
        game,
        tickets,
        sales,
        commission: Math.floor(sales * commissionRate),
        averageTicketValue: Math.round(sales / tickets),
        popularity: Math.round((tickets / totalTickets) * 100)
      };
    });

    // Calculate daily totals
    const dayData = dailyGameData.map(day => {
      let tickets = 0, sales = 0;
      
      games.forEach(game => {
        tickets += day.games[game].tickets;
        sales += day.games[game].sales;
      });
      
      return {
        date: day.date,
        dayName: day.dayName,
        tickets,
        sales,
        commission: Math.floor(sales * commissionRate),
        averageTicketValue: Math.round(sales / tickets)
      };
    });

    return {
      totalSales,
      totalTickets,
      totalCommission: Math.floor(totalSales * commissionRate),
      games: gameData.sort((a, b) => b.sales - a.sales),
      days: dayData.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  }, [games, commissionRate]);

  // Report generation
  const generateReport = useCallback(async () => {
    if (!fromDate || !toDate) {
      showToast('Please select both From and To dates', 'error');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showToast('From date cannot be later than To date', 'error');
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const data = generateSampleData(fromDate, toDate);
      setReportData(data);
      setIsGenerating(false);
      showToast('Sales report generated successfully!', 'info');
    }, 1000);
  }, [fromDate, toDate, generateSampleData, showToast]);

  // Export functionality - REMOVED as requested

  // Generate CSV content - REMOVED as requested

  // Download file helper - REMOVED as requested

  // Ticket search functionality
  const normalizeTicket = useCallback((input) => {
    if (!input) return '';
    const upper = String(input).toUpperCase();
    const digits = upper.replace(/^TKT/i, '').replace(/\D/g, '').slice(0, 8);
    return digits ? `TKT${digits}` : 'TKT';
  }, []);

  const isValidTicket = useCallback((ref) => {
    return /^TKT\d{8}$/.test(ref);
  }, []);

  const handleTicketSearch = useCallback(async (ticketRef = ticketSearchQuery) => {
    const normalizedTicket = normalizeTicket(ticketRef);
    
    if (!normalizedTicket || normalizedTicket === 'TKT') {
      setSearchedTicket(null);
      return;
    }

    if (!isValidTicket(normalizedTicket)) {
      showToast('Please enter a valid ticket reference (TKT + 8 digits)', 'error');
      return;
    }

    setIsSearchingTicket(true);

    // Add to search history
    setTicketSearchHistory(prev => {
      const filtered = prev.filter(ref => ref !== normalizedTicket);
      return [normalizedTicket, ...filtered].slice(0, 5);
    });

    // Simulate API call
    setTimeout(() => {
      const ticket = mockTicketData[normalizedTicket];
      if (ticket) {
        setSearchedTicket(ticket);
        showToast('Ticket found successfully', 'success');
      } else {
        setSearchedTicket(null);
        showToast('Ticket not found', 'error');
      }
      setIsSearchingTicket(false);
    }, 800);
  }, [ticketSearchQuery, normalizeTicket, isValidTicket, showToast]);

  const handleTicketInputChange = useCallback((e) => {
    const value = normalizeTicket(e.target.value);
    setTicketSearchQuery(value);
    
    // Auto-search if ticket is complete
    if (isValidTicket(value)) {
      handleTicketSearch(value);
    } else if (value === 'TKT' || value === '') {
      setSearchedTicket(null);
    }
  }, [normalizeTicket, isValidTicket, handleTicketSearch]);

  const handleReprintTicket = useCallback((ticketRef) => {
    // Simulate reprint functionality
    showToast(`Ticket ${ticketRef} sent to printer`, 'success');
  }, [showToast]);

  // Tab management with enhanced keyboard navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleTabKeyDown = (e, tabId) => {
    const tabs = ['pending', 'approved', 'ticket'];
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

  // Enhanced Game card component
  const GameCard = ({ game, index }) => {
    const gameIcons = {
      'STL Pares': '🎯',
      'Last 2': '🎲',
      'Last 3': '🎰',
      'Swer3': '🎪'
    };
    
    const icon = gameIcons[game.game] || '🎮';
    
    return (
      <article className="list-card enhanced" role="listitem" aria-labelledby={`game-${index}-title`}>
        <div className="list-title">
          <div className="list-name" id={`game-${index}-title`}>
            <span aria-hidden="true">{icon}</span>
            <div>
              <div className="name-text">{game.game}</div>
              <div className="popularity">
                {game.popularity}% of total volume
              </div>
            </div>
          </div>
          <div className="badge-group">
            <span className="badge primary">{game.tickets.toLocaleString()} tickets</span>
          </div>
        </div>
        <div className="list-stats enhanced">
          <div className="stat">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value amount">₱{game.sales.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Commission</div>
            <div className="stat-value commission">₱{game.commission.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Avg Ticket</div>
            <div className="stat-value average">₱{game.averageTicketValue}</div>
          </div>
        </div>
      </article>
    );
  };

  // Enhanced Day card component
  const DayCard = ({ day, index }) => {
    return (
      <article className="list-card enhanced" role="listitem" aria-labelledby={`day-${index}-title`}>
        <div className="list-title">
          <div className="list-name" id={`day-${index}-title`}>
            <span aria-hidden="true">📅</span>
            <div>
              <div className="name-text">{day.date}</div>
              <div className="day-name">{day.dayName}</div>
            </div>
          </div>
          <div className="badge-group">
            <span className="badge primary">{day.tickets.toLocaleString()} tickets</span>
          </div>
        </div>
        <div className="list-stats enhanced">
          <div className="stat">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value amount">₱{day.sales.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Commission</div>
            <div className="stat-value commission">₱{day.commission.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Avg Ticket</div>
            <div className="stat-value average">₱{day.averageTicketValue}</div>
          </div>
        </div>
      </article>
    );
  };

  // Ticket Details Component
  const TicketDetails = ({ ticket }) => {
    if (!ticket) return null;

    const totalPayout = Object.values(ticket.drawResults).reduce((sum, result) => sum + result.payout, 0);
    const hasWinnings = totalPayout > 0;

    return (
      <div className="ticket-details">
        <div className="ticket-header">
          <div className="ticket-info">
            <h3>{ticket.ref}</h3>
            <div className="ticket-meta">
              <div className="ticket-date">{ticket.date}</div>
              <div className="ticket-customer">Customer: {ticket.customer}</div>
            </div>
          </div>
          <div className={`ticket-status ${ticket.status}`}>
            {ticket.status.toUpperCase()}
          </div>
        </div>
        
        <div className="ticket-bets">
          <h4>Bets Placed</h4>
          {ticket.bets.map((bet, index) => (
            <div key={index} className="bet-item">
              <div className="bet-game">{bet.game}</div>
              <div className="bet-combo">{bet.combo}</div>
              <div className="bet-amount">₱{bet.amount}</div>
            </div>
          ))}
        </div>

        <div className="ticket-results">
          <h4>Draw Results</h4>
          {Object.entries(ticket.drawResults).map(([game, result]) => (
            <div key={game} className={`result-item ${result.status}`}>
              <div className="result-game">{game}</div>
              <div className="result-numbers">{result.result}</div>
              <div className="result-status">
                <span className={`status-badge ${result.status}`}>
                  {result.status.toUpperCase()}
                </span>
                {result.payout > 0 && (
                  <span className="payout">₱{result.payout.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="ticket-summary">
          <div className="summary-row">
            <span>Total Bet Amount</span>
            <span>₱{ticket.totalAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Commission Earned</span>
            <span className="commission">₱{ticket.commission.toLocaleString()}</span>
          </div>
          {hasWinnings && (
            <div className="summary-row winning">
              <span>Total Payout</span>
              <span>₱{totalPayout.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="ticket-actions">
          <button
            className="btn btn-primary"
            onClick={() => handleReprintTicket(ticket.ref)}
          >
            <span>🖨️</span>
            Reprint Ticket
          </button>
        </div>
      </div>
    );
  };

  // Empty state component
  const EmptyState = ({ icon, title, text }) => (
    <div className="empty-card" role="status">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-text">{text}</div>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Sales Report</h1>
          <p className="header-subtitle">Advanced analytics and ticket management</p>
        </div>
        <Link to="/teller" className="back-btn" aria-label="Back to Dashboard">
            <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Summary Section */}
      <section className="card summary-section" aria-labelledby="summary-title">
        <h2 id="summary-title">
          <span className="summary-icon">📊</span>
          Performance Overview
        </h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">₱{reportData.totalSales.toLocaleString()}</div>
            <div className="summary-label">Total Sales</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reportData.totalTickets.toLocaleString()}</div>
            <div className="summary-label">Total Tickets</div>
          </div>
          <div className="summary-card">
            <div className="summary-value commission-value">₱{reportData.totalCommission.toLocaleString()}</div>
            <div className="summary-label">Total Commission</div>
          </div>
          <div className="summary-card">
            <div className="summary-value commission-value">
              {(commissionRate * 100).toFixed(commissionRate * 100 % 1 === 0 ? 0 : 2)}%
            </div>
            <div className="summary-label">Commission Rate</div>
          </div>
        </div>
      </section>

      {/* Simplified Controls */}
      <section className="card controls-section">
        <div className="controls-header">
          <h2 className="controls-title">
            <span className="controls-icon">⚙️</span>
            Report Controls
          </h2>
        </div>

        {/* Simplified Filter Toolbar */}
        <div className="filter-toolbar simplified">
          {/* Date Range */}
          <div className="filter-group">
            <h4 className="filter-group-title">Date Range</h4>
            <div className="date-inputs">
              <div className="form-group">
                <label htmlFor="fromDate" className="form-label">From Date</label>
                <input
                  type="date"
                  id="fromDate"
                  className="form-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="toDate" className="form-label">To Date</label>
                <input
                  type="date"
                  id="toDate"
                  className="form-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="filter-group">
            <button
              className="btn btn-primary"
              onClick={generateReport}
              disabled={isGenerating}
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Generating Report...
                </>
              ) : (
                <>
                  <span aria-hidden="true">📊</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Sales Breakdown Section */}
      <section className="card breakdown-section" aria-labelledby="breakdown-title">
        <div className="breakdown-header">
          <h2 id="breakdown-title" className="breakdown-title">
            <span className="breakdown-icon">📈</span>
            Sales & Tickets
          </h2>

          <div className="view-controls">
            <div className="tabs-container" role="tablist" aria-label="Sales breakdown tabs">
              <button
                className="tab-btn"
                role="tab"
                id="tab-pending"
                aria-controls="panel-pending"
                aria-selected={activeTab === 'pending'}
                tabIndex={activeTab === 'pending' ? 0 : -1}
                onClick={() => handleTabChange('pending')}
                onKeyDown={(e) => handleTabKeyDown(e, 'pending')}
              >
                By Game Type
              </button>
              <button
                className="tab-btn"
                role="tab"
                id="tab-approved"
                aria-controls="panel-approved"
                aria-selected={activeTab === 'approved'}
                tabIndex={activeTab === 'approved' ? 0 : -1}
                onClick={() => handleTabChange('approved')}
                onKeyDown={(e) => handleTabKeyDown(e, 'approved')}
              >
                By Date Range
              </button>
              <button
                className="tab-btn"
                role="tab"
                id="tab-ticket"
                aria-controls="panel-ticket"
                aria-selected={activeTab === 'ticket'}
                tabIndex={activeTab === 'ticket' ? 0 : -1}
                onClick={() => handleTabChange('ticket')}
                onKeyDown={(e) => handleTabKeyDown(e, 'ticket')}
              >
                Search Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Meta Information (only for pending/approved tabs) */}
        {(activeTab === 'pending' || activeTab === 'approved') && (
          <div className="meta-info enhanced">
            <span className="chip">
              <span aria-hidden="true">📅</span>
              Period: {fromDate && toDate ? `${fromDate} → ${toDate}` : '—'}
            </span>
          </div>
        )}

        {/* Enhanced Panels */}
        <div
          id="panel-pending"
          className={`tabpanel ${activeTab === 'pending' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="tab-pending"
        >
          <div className="list-grid enhanced" role="list">
            {isGenerating ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="list-card skeleton">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              ))
            ) : reportData.games.length > 0 ? (
              reportData.games.map((game, index) => (
                <GameCard key={`${game.game}-${index}`} game={game} index={index} />
              ))
            ) : (
              <EmptyState
                icon="🔍"
                title="No Pending Sales"
                text="No pending sales data available for the selected criteria."
              />
            )}
          </div>
        </div>

        <div
          id="panel-approved"
          className={`tabpanel ${activeTab === 'approved' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="tab-approved"
        >
          <div className="list-grid enhanced" role="list">
            {isGenerating ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="list-card skeleton">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              ))
            ) : reportData.days.length > 0 ? (
              reportData.days.map((day, index) => (
                <DayCard key={`${day.date}-${index}`} day={day} index={index} />
              ))
            ) : (
              <EmptyState
                icon="🔍"
                title="No Approved Sales"
                text="No approved sales data available for the selected criteria."
              />
            )}
          </div>
        </div>

        {/* Search Ticket Panel */}
        <div
          id="panel-ticket"
          className={`tabpanel ${activeTab === 'ticket' ? 'active' : ''}`}
          role="tabpanel"
          aria-labelledby="tab-ticket"
        >
          <div className="ticket-search-section">
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon">🔍</span>
                Search Ticket
              </h3>
              
              <div className="search-section">
                <div className="form-group">
                  <label htmlFor="ticket-search" className="form-label">
                    Ticket Reference Number
                  </label>
                  <div className="search-input-container">
                    <input
                      id="ticket-search"
                      className="form-input"
                      type="text"
                      placeholder="Enter ticket reference (e.g., TKT12345678)"
                      maxLength={11}
                      autoComplete="off"
                      value={ticketSearchQuery}
                      onChange={handleTicketInputChange}
                    />
                    {isSearchingTicket && (
                      <div className="search-spinner">
                        <div className="spinner"></div>
                      </div>
                    )}
                  </div>
                  <div className="helper">
                    Enter the complete ticket reference number to view details and reprint.
                  </div>
                </div>

                {ticketSearchHistory.length > 0 && (
                  <div className="search-history">
                    <div className="history-label">Recent Searches:</div>
                    <div className="history-items">
                      {ticketSearchHistory.map(ref => (
                        <button
                          key={ref}
                          className="history-item"
                          onClick={() => {
                            setTicketSearchQuery(ref);
                            handleTicketSearch(ref);
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

            {searchedTicket && (
              <div className="card">
                <h3 className="card-title">
                  <span className="card-icon">🎫</span>
                  Ticket Details
                </h3>
                <TicketDetails ticket={searchedTicket} />
              </div>
            )}
          </div>
        </div>
      </section>

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

export default SalesReport;