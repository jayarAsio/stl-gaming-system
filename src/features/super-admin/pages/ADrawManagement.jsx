import React, { useState, useMemo } from 'react';
import '../styles/adraw-management.css';

const DrawManagement = () => {
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  
  const [currentDate, setCurrentDate] = useState(getTodayISO());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState(null);

  const games = {
    'pares': { name: 'STL Pares', icon: '🎲', times: ['10:30 AM', '3:00 PM', '7:00 PM'] },
    'swer2': { name: 'STL Swer2', icon: '🎯', times: ['11:00 AM', '4:00 PM', '9:00 PM'] },
    'swer3': { name: 'STL Swer3', icon: '🎰', times: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'] },
    'l2': { name: 'Last 2', icon: '2️⃣', times: ['11:00 AM', '4:00 PM', '9:00 PM'] },
    'l3': { name: 'Last 3', icon: '3️⃣', times: ['11:00 AM', '4:00 PM', '9:00 PM'] }
  };

  const [drawResults] = useState({
    [`${getTodayISO()}_pares_10:30 AM`]: { result: '05-23', winners: 12, payout: 84000 },
    [`${getTodayISO()}_pares_3:00 PM`]: { result: '17-32', winners: 8, payout: 56000 },
    [`${getTodayISO()}_swer3_10:00 AM`]: { result: '427', winners: 15, payout: 75000 },
    [`${getTodayISO()}_l2_11:00 AM`]: { result: '42', winners: 23, payout: 92000 }
  });

  const allDraws = useMemo(() => {
    const draws = [];
    Object.entries(games).forEach(([gameId, gameInfo]) => {
      gameInfo.times.forEach(time => {
        const key = `${currentDate}_${gameId}_${time}`;
        const result = drawResults[key];
        
        draws.push({
          key,
          gameId,
          gameName: gameInfo.name,
          gameIcon: gameInfo.icon,
          time,
          result: result?.result || '—',
          winners: result?.winners || 0,
          payout: result?.payout || 0,
          hasResult: !!result
        });
      });
    });
    return draws;
  }, [currentDate, drawResults]);

  const filteredDraws = useMemo(() => {
    return allDraws.filter(draw => {
      const matchesGame = selectedGame === 'all' || draw.gameId === selectedGame;
      const matchesSearch = searchQuery === '' ||
        draw.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.result.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesGame && matchesSearch;
    });
  }, [allDraws, selectedGame, searchQuery]);

  const stats = useMemo(() => {
    const todayDraws = allDraws.filter(d => d.key.startsWith(currentDate));
    const withResults = todayDraws.filter(d => d.hasResult);
    const totalWinners = withResults.reduce((sum, d) => sum + d.winners, 0);
    const totalPayout = withResults.reduce((sum, d) => sum + d.payout, 0);
    
    return {
      total: todayDraws.length,
      completed: withResults.length,
      pending: todayDraws.length - withResults.length,
      totalWinners,
      totalPayout
    };
  }, [allDraws, currentDate]);

  const formatCurrency = (amount) => {
    return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleViewWinners = (draw) => {
    if (!draw.hasResult) return;
    
    const mockWinners = [];
    const count = draw.winners;
    for (let i = 0; i < count; i++) {
      mockWinners.push({
        id: i + 1,
        ticketNo: `T${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        teller: `T-000${Math.floor(Math.random() * 9) + 1}`,
        betAmount: [10, 20, 50, 100][Math.floor(Math.random() * 4)],
        prize: draw.payout / count,
        status: Math.random() > 0.3 ? 'Paid' : 'Pending'
      });
    }
    
    setSelectedDraw({ ...draw, winnersList: mockWinners });
    setShowWinnersModal(true);
  };

  const drawsByGame = useMemo(() => {
    const grouped = {};
    filteredDraws.forEach(draw => {
      if (!grouped[draw.gameId]) {
        grouped[draw.gameId] = {
          name: draw.gameName,
          icon: draw.gameIcon,
          draws: []
        };
      }
      grouped[draw.gameId].draws.push(draw);
    });
    return grouped;
  }, [filteredDraws]);

  return (
    <div className="drawmgmt-container">
      <div className="drawmgmt-page-header">
        <div className="drawmgmt-header-text">
          <h1 className="drawmgmt-page-title">Draw Management</h1>
          <p className="drawmgmt-page-subtitle">View draw schedules and results</p>
        </div>
      </div>

      <div className="drawmgmt-stats-grid">
        <div className="drawmgmt-stat-box">
          <div className="drawmgmt-stat-icon drawmgmt-icon-blue">📅</div>
          <div className="drawmgmt-stat-content">
            <div className="drawmgmt-stat-number">{stats.total}</div>
            <div className="drawmgmt-stat-text">Total Draws</div>
          </div>
        </div>
        <div className="drawmgmt-stat-box">
          <div className="drawmgmt-stat-icon drawmgmt-icon-green">✓</div>
          <div className="drawmgmt-stat-content">
            <div className="drawmgmt-stat-number">{stats.completed}</div>
            <div className="drawmgmt-stat-text">Completed</div>
          </div>
        </div>
        <div className="drawmgmt-stat-box">
          <div className="drawmgmt-stat-icon drawmgmt-icon-orange">⏳</div>
          <div className="drawmgmt-stat-content">
            <div className="drawmgmt-stat-number">{stats.pending}</div>
            <div className="drawmgmt-stat-text">Pending</div>
          </div>
        </div>
        <div className="drawmgmt-stat-box">
          <div className="drawmgmt-stat-icon drawmgmt-icon-purple">🏆</div>
          <div className="drawmgmt-stat-content">
            <div className="drawmgmt-stat-number">{stats.totalWinners}</div>
            <div className="drawmgmt-stat-text">Winners</div>
          </div>
        </div>
        <div className="drawmgmt-stat-box drawmgmt-stat-wide">
          <div className="drawmgmt-stat-icon drawmgmt-icon-red">💰</div>
          <div className="drawmgmt-stat-content">
            <div className="drawmgmt-stat-number">{formatCurrency(stats.totalPayout)}</div>
            <div className="drawmgmt-stat-text">Total Payout</div>
          </div>
        </div>
      </div>

      <div className="drawmgmt-filters-bar">
        <div className="drawmgmt-filter-item">
          <label className="drawmgmt-filter-label">Date</label>
          <input
            type="date"
            className="drawmgmt-filter-input"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
        </div>
        <div className="drawmgmt-filter-item">
          <label className="drawmgmt-filter-label">Game</label>
          <select 
            className="drawmgmt-filter-select"
            value={selectedGame} 
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="all">All Games</option>
            {Object.entries(games).map(([id, game]) => (
              <option key={id} value={id}>{game.name}</option>
            ))}
          </select>
        </div>
        <div className="drawmgmt-filter-item drawmgmt-search-filter">
          <label className="drawmgmt-filter-label">Search</label>
          <input
            type="text"
            className="drawmgmt-filter-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="drawmgmt-tables-container">
        {Object.entries(drawsByGame).map(([gameId, gameData]) => (
          <div key={gameId} className="drawmgmt-game-section">
            <div className="drawmgmt-game-header">
              <h2 className="drawmgmt-game-title">
                <span className="drawmgmt-game-icon">{gameData.icon}</span>
                {gameData.name}
              </h2>
              <span className="drawmgmt-game-date">Draw Date: {formatDate(currentDate)}</span>
            </div>

            <table className="drawmgmt-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Results</th>
                  <th>Payout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gameData.draws.map(draw => (
                  <tr key={draw.key}>
                    <td className="drawmgmt-td-time">{draw.time}</td>
                    <td>
                      <span className={`drawmgmt-status-badge ${draw.hasResult ? 'drawmgmt-status-complete' : 'drawmgmt-status-pending'}`}>
                        {draw.hasResult ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <span className="drawmgmt-result-badge">{draw.result}</span>
                    </td>
                    <td className="drawmgmt-td-payout">
                      {draw.hasResult ? formatCurrency(draw.payout) : '—'}
                    </td>
                    <td className="drawmgmt-td-actions">
                      {draw.hasResult ? (
                        <button className="drawmgmt-action-btn" onClick={() => handleViewWinners(draw)}>
                          View ({draw.winners})
                        </button>
                      ) : (
                        <span className="drawmgmt-action-msg">Waiting for result</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {filteredDraws.length === 0 && (
        <div className="drawmgmt-empty-state">
          <span className="drawmgmt-empty-icon">🎲</span>
          <h3 className="drawmgmt-empty-title">No draws found</h3>
          <p className="drawmgmt-empty-text">Try adjusting your filters</p>
        </div>
      )}

      {showWinnersModal && selectedDraw && (
        <div className="drawmgmt-modal-overlay">
          <div className="drawmgmt-modal-backdrop" onClick={() => setShowWinnersModal(false)} />
          <div className={`drawmgmt-winners-drawer ${showWinnersModal ? 'drawmgmt-drawer-open' : ''}`}>
            <div className="drawmgmt-drawer-header">
              <h3 className="drawmgmt-drawer-title">🏆 Winners - {selectedDraw.gameName} ({selectedDraw.time})</h3>
              <button className="drawmgmt-drawer-close" onClick={() => setShowWinnersModal(false)}>×</button>
            </div>
            
            <div className="drawmgmt-drawer-body">
              <div className="drawmgmt-winners-summary">
                <div className="drawmgmt-summary-item">
                  <div className="drawmgmt-summary-value drawmgmt-value-large">{selectedDraw.result}</div>
                  <div className="drawmgmt-summary-label">Winning Number</div>
                </div>
                <div className="drawmgmt-summary-item">
                  <div className="drawmgmt-summary-value">{selectedDraw.winners}</div>
                  <div className="drawmgmt-summary-label">Winners</div>
                </div>
                <div className="drawmgmt-summary-item">
                  <div className="drawmgmt-summary-value">{formatCurrency(selectedDraw.payout)}</div>
                  <div className="drawmgmt-summary-label">Total Payout</div>
                </div>
              </div>

              <div className="drawmgmt-winners-list">
                <div className="drawmgmt-winners-header">
                  <div>Ticket</div>
                  <div>Teller</div>
                  <div>Bet</div>
                  <div>Prize</div>
                  <div>Status</div>
                </div>
                {selectedDraw.winnersList.map(winner => (
                  <div key={winner.id} className="drawmgmt-winner-row">
                    <div className="drawmgmt-winner-ticket" data-label="Ticket">{winner.ticketNo}</div>
                    <div data-label="Teller">{winner.teller}</div>
                    <div data-label="Bet">{formatCurrency(winner.betAmount)}</div>
                    <div className="drawmgmt-winner-prize" data-label="Prize">{formatCurrency(winner.prize)}</div>
                    <div data-label="Status">
                      <span className={`drawmgmt-status-badge ${winner.status === 'Paid' ? 'drawmgmt-status-paid' : 'drawmgmt-status-pending'}`}>
                        {winner.status === 'Paid' ? '✓ PAID' : '⏳ PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="drawmgmt-drawer-footer">
              <button className="drawmgmt-action-btn drawmgmt-btn-secondary" onClick={() => setShowWinnersModal(false)}>
                Close
              </button>
              <button className="drawmgmt-action-btn drawmgmt-btn-primary">
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawManagement;