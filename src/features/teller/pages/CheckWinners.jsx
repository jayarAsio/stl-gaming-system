import React, { useState, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import "../styles/common.css";
import "../styles/check-winners.css";

// Mock data - replace with actual API calls
const drawsData = [
  {
    time: '2:00 PM',
    date: 'Jan 15, 2025',
    games: {
      'STL Pares': {
        winning: '12.25',
        multiplier: '1:700',
        winners: [
          { ref: 'TKT12345678', bet: 1, claimed: false, bettedNumber: '12.25' },
          { ref: 'TKT23456789', bet: 2, claimed: true, bettedNumber: '12.25' },
          { ref: 'TKT34567890', bet: 1, claimed: false, bettedNumber: '12.25' },
        ],
      },
      'Last 2': {
        winning: '47',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT45678901', bet: 5, claimed: true, bettedNumber: '47' },
          { ref: 'TKT56789012', bet: 2, claimed: false, bettedNumber: '47' },
        ],
      },
      'Last 3': {
        winning: '358',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT67890123', bet: 3, claimed: false, bettedNumber: '358' },
        ],
      },
      'Swer3': {
        winning: '724',
        multiplier: '1:100',
        winners: [],
      },
    },
  },
  {
    time: '5:00 PM',
    date: 'Jan 15, 2025',
    games: {
      'STL Pares': {
        winning: '03.17',
        multiplier: '1:700',
        winners: [
          { ref: 'TKT78901234', bet: 3, claimed: false, bettedNumber: '03.17' },
        ],
      },
      'Last 2': {
        winning: '89',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT89012345', bet: 4, claimed: true, bettedNumber: '89' },
          { ref: 'TKT90123456', bet: 1, claimed: false, bettedNumber: '89' },
          { ref: 'TKT01234567', bet: 3, claimed: true, bettedNumber: '89' },
        ],
      },
      'Last 3': {
        winning: '142',
        multiplier: '1:100',
        winners: [],
      },
      'Swer3': {
        winning: '967',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT12340987', bet: 2, claimed: false, bettedNumber: '967' },
        ],
      },
    },
  },
  {
    time: '9:00 PM',
    date: 'Jan 15, 2025',
    games: {
      'STL Pares': {
        winning: '28.41',
        multiplier: '1:700',
        winners: [],
      },
      'Last 2': {
        winning: '63',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT23451098', bet: 6, claimed: false, bettedNumber: '63' },
        ],
      },
      'Last 3': {
        winning: '507',
        multiplier: '1:100',
        winners: [
          { ref: 'TKT34562109', bet: 5, claimed: true, bettedNumber: '507' },
          { ref: 'TKT45673210', bet: 2, claimed: false, bettedNumber: '507' },
        ],
      },
      'Swer3': {
        winning: '183',
        multiplier: '1:100',
        winners: [],
      },
    },
  },
];

const CheckWinners = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [claimFilter, setClaimFilter] = useState('all');
  const [highlightedTicket, setHighlightedTicket] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Helper functions
  const peso = useMemo(() => new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP', 
    maximumFractionDigits: 0 
  }), []);

  const normalizeTicket = useCallback((raw) => {
    if (!raw) return '';
    const upper = String(raw).toUpperCase();
    const digits = upper.replace(/^TKT/i, '').replace(/\D/g, '').slice(0, 8);
    return digits ? `TKT${digits}` : 'TKT';
  }, []);

  const isValidTicket = useCallback((ref) => {
    return /^TKT\d{8}$/.test(ref);
  }, []);

  const getMultiplier = useCallback((mult) => {
    if (typeof mult === 'number') return mult;
    if (typeof mult === 'string') {
      const m = mult.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
      if (m) {
        const a = Number(m[1]);
        const b = Number(m[2]);
        return a ? b / a : 0;
      }
      const n = Number(mult);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  }, []);

  const calculateWinnings = useCallback((bet, mult) => {
    return Math.round(Number(bet) * Number(mult));
  }, []);

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Get unique game types for filter
  const gameTypes = useMemo(() => {
    const games = new Set();
    drawsData.forEach(draw => {
      Object.keys(draw.games).forEach(game => games.add(game));
    });
    return Array.from(games);
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    let totalWinners = 0;
    let totalPayout = 0;
    let totalClaimed = 0;
    let totalUnclaimed = 0;
    let claimedAmount = 0;
    let unclaimedAmount = 0;

    drawsData.forEach(draw => {
      Object.values(draw.games).forEach(game => {
        const multiplier = getMultiplier(game.multiplier);
        game.winners.forEach(winner => {
          totalWinners++;
          const amount = calculateWinnings(winner.bet, multiplier);
          totalPayout += amount;
          
          if (winner.claimed) {
            totalClaimed++;
            claimedAmount += amount;
          } else {
            totalUnclaimed++;
            unclaimedAmount += amount;
          }
        });
      });
    });

    return {
      totalWinners,
      totalPayout,
      totalClaimed,
      totalUnclaimed,
      claimedAmount,
      unclaimedAmount,
      claimRate: totalWinners > 0 ? (totalClaimed / totalWinners * 100).toFixed(1) : 0
    };
  }, [getMultiplier, calculateWinnings]);

  // Filter draws based on current filters
  const filteredDraws = useMemo(() => {
    return drawsData.map(draw => ({
      ...draw,
      games: Object.fromEntries(
        Object.entries(draw.games).filter(([gameName]) => {
          if (selectedGame !== 'all' && gameName !== selectedGame) return false;
          return true;
        }).map(([gameName, gameData]) => [
          gameName,
          {
            ...gameData,
            winners: gameData.winners.filter(winner => {
              if (claimFilter !== 'all') {
                if (claimFilter === 'claimed' && !winner.claimed) return false;
                if (claimFilter === 'unclaimed' && winner.claimed) return false;
              }
              return true;
            })
          }
        ])
      )
    })).filter(draw => Object.keys(draw.games).length > 0);
  }, [selectedGame, claimFilter]);

  // Handle ticket search
  const handleSearch = useCallback(async (ticketRef = searchQuery) => {
    const normalizedTicket = normalizeTicket(ticketRef);
    
    if (!normalizedTicket || normalizedTicket === 'TKT') {
      setSearchResult(null);
      setHighlightedTicket('');
      return;
    }

    if (!isValidTicket(normalizedTicket)) {
      setSearchResult({
        success: false,
        title: 'Invalid ticket format',
        message: 'Please enter a reference like: TKT12345678 (8 digits).'
      });
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      let found = null;
      
      for (const draw of drawsData) {
        for (const [gameName, gameData] of Object.entries(draw.games)) {
          const winner = gameData.winners.find(w => 
            String(w.ref).toUpperCase() === normalizedTicket
          );
          if (winner) {
            const mult = getMultiplier(gameData.multiplier);
            found = {
              drawTime: draw.time,
              drawDate: draw.date,
              game: gameName,
              winning: gameData.winning,
              bet: winner.bet,
              amount: calculateWinnings(winner.bet, mult),
              multiplier: mult,
              claimed: winner.claimed,
              ticketRef: normalizedTicket,
              bettedNumber: winner.bettedNumber
            };
            break;
          }
        }
        if (found) break;
      }

      if (found) {
        setSearchResult({
          success: true,
          title: '🎉 Congratulations! Your ticket is a WINNER!',
          data: found
        });
        setHighlightedTicket(normalizedTicket);
        showToast(`Winning ticket found: ${peso.format(found.amount)}!`, 'success');
      } else {
        setSearchResult({
          success: false,
          title: 'No winnings found for this ticket',
          message: `Ticket ${normalizedTicket} did not match any winners in the current draws.`
        });
        setHighlightedTicket('');
        showToast('No winnings found for this ticket', 'info');
      }
      
      setIsSearching(false);
    }, 300);
  }, [searchQuery, normalizeTicket, isValidTicket, getMultiplier, calculateWinnings, peso, showToast]);

  // Handle input change with real-time search
  const handleInputChange = useCallback((e) => {
    const value = normalizeTicket(e.target.value);
    setSearchQuery(value);
    
    // Real-time search if ticket is complete
    if (isValidTicket(value)) {
      handleSearch(value);
    } else if (value === 'TKT' || value === '') {
      setSearchResult(null);
      setHighlightedTicket('');
    }
  }, [normalizeTicket, isValidTicket, handleSearch]);

  // Handle claim status toggle (simulation)
  const toggleClaimStatus = useCallback((ticketRef) => {
    // This would typically make an API call
    showToast(`Claim status updated for ${ticketRef}`, 'info');
    // In a real app, you'd update the backend and refresh data
  }, [showToast]);

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-value">{statistics.totalWinners}</div>
        <div className="stat-label">Total Winners</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{peso.format(statistics.totalPayout)}</div>
        <div className="stat-label">Total Payout</div>
      </div>
      <div className="stat-card claimed">
        <div className="stat-value">{statistics.totalClaimed}</div>
        <div className="stat-label">Claims Processed</div>
      </div>
      <div className="stat-card unclaimed">
        <div className="stat-value">{statistics.totalUnclaimed}</div>
        <div className="stat-label">Pending Claims</div>
      </div>
    </div>
  );

  // Winner Item Component
  const WinnerItem = ({ winner, game, drawTime }) => {
    const multiplier = getMultiplier(game.multiplier);
    const amount = calculateWinnings(winner.bet, multiplier);
    const isHighlighted = winner.ref === highlightedTicket;

    return (
      <div 
        className={`winner-item ${isHighlighted ? 'highlighted' : ''} ${winner.claimed ? 'claimed' : 'unclaimed'}`}
        role="listitem" 
        data-ref={winner.ref}
      >
        <div className="winner-main">
          <div className="winner-ref">🎫 {winner.ref}</div>
          <div className="winner-sub">
            Bet {peso.format(winner.bet)} on <span className="betted-number">{winner.bettedNumber}</span> × {multiplier} • {drawTime}
          </div>
        </div>
        <div className="winner-actions">
          <div className="winner-amount">{peso.format(amount)}</div>
          <div className={`claim-status ${winner.claimed ? 'claimed' : 'pending'}`}>
            {winner.claimed ? '✅ Claimed' : '⏳ Pending'}
          </div>
          <button 
            className="btn-claim-toggle"
            onClick={() => toggleClaimStatus(winner.ref)}
            aria-label={`Toggle claim status for ${winner.ref}`}
          >
            {winner.claimed ? 'Mark Unclaimed' : 'Mark Claimed'}
          </button>
        </div>
      </div>
    );
  };

  // Game Card Component
  const GameCard = ({ gameName, gameData, drawTime }) => {
    const hasWinners = gameData.winners.length > 0;
    const gameIcons = {
      'STL Pares': '🎯',
      'Last 2': '🎲', 
      'Last 3': '🎰',
      'Swer3': '🎪'
    };

    return (
      <article className={`game-item ${hasWinners ? 'winner' : ''}`}>
        {hasWinners && <div className="winner-badge">WINNER!</div>}
        
        <div className="game-header">
          <div className="game-name">
            <span className="game-icon">{gameIcons[gameName] || '🎮'}</span>
            {gameName}
          </div>
          <div className="game-multiplier">{gameData.multiplier}</div>
        </div>

        <div className="winning-number" role="group" aria-label="Draw Result">
          <span className="result-label">Draw Result</span>
          <span className="result-value">{gameData.winning}</span>
        </div>

        <div className="winners-section">
          {hasWinners ? (
            <div className="winners-list" role="list">
              {gameData.winners.map((winner, index) => (
                <WinnerItem 
                  key={`${winner.ref}-${index}`}
                  winner={winner} 
                  game={gameData} 
                  drawTime={drawTime}
                />
              ))}
            </div>
          ) : (
            <div className="no-winners">No winners</div>
          )}
        </div>
      </article>
    );
  };

  // Search Result Component
  const SearchResult = () => {
    if (!searchResult) return null;

    return (
      <div className={`result-card ${searchResult.success ? 'is-success' : 'is-error'}`}>
        <div className="result-title">{searchResult.title}</div>
        {searchResult.success && searchResult.data ? (
          <div className="result-content">
            <div className="result-details">
              <div><strong>Ticket:</strong> {searchResult.data.ticketRef}</div>
              <div><strong>Draw:</strong> {searchResult.data.drawTime} – {searchResult.data.drawDate}</div>
              <div><strong>Game:</strong> {searchResult.data.game}</div>
              <div><strong>Betted Number:</strong> <span className="betted-number-result">{searchResult.data.bettedNumber}</span></div>
              <div><strong>Winning Number:</strong> {searchResult.data.winning}</div>
              <div><strong>Bet Amount:</strong> {peso.format(searchResult.data.bet)}</div>
              <div><strong>Winnings:</strong> {peso.format(searchResult.data.amount)}</div>
              <div><strong>Status:</strong> 
                <span className={`claim-badge ${searchResult.data.claimed ? 'claimed' : 'pending'}`}>
                  {searchResult.data.claimed ? '✅ Claimed' : '⏳ Pending Claim'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="result-message">{searchResult.message}</div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      {/* Enhanced Header */}
      <header className="header">
        <div className="content">
          <h1>Check Winners</h1>
          <p>Search tickets and view winning results</p>
        </div>
        <Link to="/teller" className="back-button" aria-label="Back to Dashboard">
          <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Statistics Summary */}
      <section className="card statistics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Winning Statistics
        </h2>
        <StatisticsCards />
      </section>

      {/* Enhanced Search Section */}
      <section className="card search-section">
        <h2 className="section-title">
          <span className="section-icon">🔍</span>
          Ticket Search
        </h2>
        
        <div className="search-controls">
          <div className="search-input-group">
            <label htmlFor="ticketRef" className="form-label">
              Ticket Reference
            </label>
            <div className="input-with-status">
              <input
                type="text"
                className="form-input"
                id="ticketRef"
                placeholder="TKT######## (e.g., TKT12345678)"
                value={searchQuery}
                onChange={handleInputChange}
                maxLength={11}
                autoComplete="off"
              />
              {isSearching && <div className="search-spinner">🔍</div>}
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="gameFilter" className="form-label">Game Type</label>
              <select 
                id="gameFilter"
                className="form-select"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="all">All Games</option>
                {gameTypes.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="claimFilter" className="form-label">Claim Status</label>
              <select 
                id="claimFilter"
                className="form-select"
                value={claimFilter}
                onChange={(e) => setClaimFilter(e.target.value)}
              >
                <option value="all">All Tickets</option>
                <option value="claimed">Claimed Only</option>
                <option value="unclaimed">Unclaimed Only</option>
              </select>
            </div>
          </div>
        </div>

        <SearchResult />
      </section>

      {/* Enhanced Draws Section */}
      <section className="draws-section">
        {filteredDraws.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <div className="empty-title">No Results Found</div>
            <div className="empty-text">
              Try adjusting your filters to see more results.
            </div>
          </div>
        ) : (
          filteredDraws.map((draw, index) => {
            const totalWinners = Object.values(draw.games).reduce((sum, game) => 
              sum + game.winners.length, 0
            );
            const totalPayout = Object.values(draw.games).reduce((sum, game) => {
              const multiplier = getMultiplier(game.multiplier);
              return sum + game.winners.reduce((gameSum, winner) => 
                gameSum + calculateWinnings(winner.bet, multiplier), 0
              );
            }, 0);

            return (
              <div key={index} className="draw-card">
                <header className="draw-header">
                  <div className="draw-info">
                    <div className="draw-time">{draw.time} Draw</div>
                    <div className="draw-date">{draw.date}</div>
                  </div>
                  <div className="draw-stats">
                    <div className="stat-chip">
                      {totalWinners} Winner{totalWinners !== 1 ? 's' : ''}
                    </div>
                    <div className="stat-chip payout">
                      {peso.format(totalPayout)}
                    </div>
                  </div>
                </header>
                
                <div className="draw-body">
                  <div className="games-grid">
                    {Object.entries(draw.games).map(([gameName, gameData]) => (
                      <GameCard
                        key={gameName}
                        gameName={gameName}
                        gameData={gameData}
                        drawTime={draw.time}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
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

export default CheckWinners;