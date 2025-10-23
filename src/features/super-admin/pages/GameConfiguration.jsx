// ============================================
// Game Configuration - Super Admin
// Configure game settings, draw schedules, and bet limits
// Based on real STL and PCSO games in the Philippines
// ============================================
import React, { useState, useMemo } from 'react';
import '../styles/game-configuration.css';

const GameConfiguration = () => {
  // --- Helpers (no function renames) ---
  const to24h = (t) => {
    // Accepts "HH:MM" or "h:mm AM/PM" and returns "HH:MM" (24h)
    if (!t) return '';
    const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (ampmMatch) {
      let [_, hh, mm, ap] = ampmMatch;
      let H = parseInt(hh, 10);
      if (ap.toUpperCase() === 'PM' && H !== 12) H += 12;
      if (ap.toUpperCase() === 'AM' && H === 12) H = 0;
      return `${String(H).padStart(2, '0')}:${mm}`;
    }
    // Already 24h "HH:MM"
    const plain = t.match(/^(\d{2}):(\d{2})$/);
    if (plain) return t;
    // Fallback: try to parse loose "H:MM"
    const loose = t.match(/^(\d{1,2}):(\d{2})$/);
    if (loose) {
      const H = Math.min(23, Math.max(0, parseInt(loose[1], 10)));
      const M = Math.min(59, Math.max(0, parseInt(loose[2], 10)));
      return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`;
    }
    return t;
  };

  const to12h = (t24) => {
    // "HH:MM" -> "H:MM AM/PM"
    const m = t24.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return t24;
    let h = parseInt(m[1], 10);
    const mm = m[2];
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mm} ${ap}`;
  };

  const sortTimes24 = (arr) =>
    [...arr].sort((a, b) => {
      const [ah, am] = to24h(a).split(':').map(Number);
      const [bh, bm] = to24h(b).split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

  // Game type templates based on real Philippine lottery games
  const gameTypes = {
    // STL Games (Small Town Lottery)
    stl: [
      {
        type: 'STL Pares',
        icon: '🎲',
        format: 'XX-XX (01-40)',
        description: 'Two numbers from 1-40, order matters',
        defaultMinBet: 10,
        defaultMaxBet: 2000,
        defaultLimit: 2000,
        defaultPayoutMultiplier: 700,
        defaultCommission: 8,
        suggestedDrawTimes: ['10:30 AM', '3:00 PM', '7:00 PM']
      },
      {
        type: 'STL Swer2',
        icon: '🎯',
        format: 'XX (00-99)',
        description: 'Two-digit number, exact order',
        defaultMinBet: 10,
        defaultMaxBet: 1500,
        defaultLimit: 1500,
        defaultPayoutMultiplier: 80,
        defaultCommission: 10,
        suggestedDrawTimes: ['11:00 AM', '4:00 PM', '9:00 PM']
      },
      {
        type: 'STL Swer3',
        icon: '🎰',
        format: 'XXX (000-999)',
        description: 'Three-digit number, exact order',
        defaultMinBet: 10,
        defaultMaxBet: 1800,
        defaultLimit: 1800,
        defaultPayoutMultiplier: 500,
        defaultCommission: 12,
        suggestedDrawTimes: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM']
      },
      {
        type: 'STL Swer4',
        icon: '🎪',
        format: 'XXXX (0000-9999)',
        description: 'Four-digit number, exact order',
        defaultMinBet: 10,
        defaultMaxBet: 2500,
        defaultLimit: 2500,
        defaultPayoutMultiplier: 5000,
        defaultCommission: 10,
        suggestedDrawTimes: ['11:00 AM', '4:00 PM', '9:00 PM']
      }
    ],
    // PCSO Digit Games
    digit: [
      {
        type: 'EZ2 Lotto',
        icon: '2️⃣',
        format: 'XX (00-31)',
        description: '2D lotto, daily draws',
        defaultMinBet: 10,
        defaultMaxBet: 1000,
        defaultLimit: 1000,
        defaultPayoutMultiplier: 40,
        defaultCommission: 10,
        suggestedDrawTimes: ['11:00 AM', '4:00 PM', '9:00 PM']
      },
      {
        type: 'Swertres Lotto',
        icon: '3️⃣',
        format: 'XXX (000-999)',
        description: '3D lotto, daily draws',
        defaultMinBet: 10,
        defaultMaxBet: 2000,
        defaultLimit: 2000,
        defaultPayoutMultiplier: 450,
        defaultCommission: 12,
        suggestedDrawTimes: ['11:00 AM', '4:00 PM', '9:00 PM']
      },
      {
        type: '4D Lotto',
        icon: '4️⃣',
        format: 'XXXX (0000-9999)',
        description: 'Four-digit lotto, exact order',
        defaultMinBet: 20,
        defaultMaxBet: 3000,
        defaultLimit: 3000,
        defaultPayoutMultiplier: 10000,
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      },
      {
        type: '6D Lotto',
        icon: '6️⃣',
        format: 'XXXXXX (000000-999999)',
        description: 'Six-digit lotto, exact order',
        defaultMinBet: 20,
        defaultMaxBet: 5000,
        defaultLimit: 5000,
        defaultPayoutMultiplier: 150000,
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      }
    ],
    // PCSO Major Lotto Games (Parimutuel)
    lotto: [
      {
        type: 'Lotto 6/42',
        icon: '🎱',
        format: '6 from 1-42',
        description: 'Pick 6 numbers from 1-42',
        defaultMinBet: 20,
        defaultMaxBet: 10000,
        defaultLimit: 10000,
        defaultPayoutMultiplier: 0, // Parimutuel
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      },
      {
        type: 'Mega Lotto 6/45',
        icon: '🔮',
        format: '6 from 1-45',
        description: 'Pick 6 numbers from 1-45',
        defaultMinBet: 20,
        defaultMaxBet: 15000,
        defaultLimit: 15000,
        defaultPayoutMultiplier: 0, // Parimutuel
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      },
      {
        type: 'Super Lotto 6/49',
        icon: '💎',
        format: '6 from 1-49',
        description: 'Pick 6 numbers from 1-49',
        defaultMinBet: 20,
        defaultMaxBet: 20000,
        defaultLimit: 20000,
        defaultPayoutMultiplier: 0, // Parimutuel
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      },
      {
        type: 'Grand Lotto 6/55',
        icon: '👑',
        format: '6 from 1-55',
        description: 'Pick 6 numbers from 1-55',
        defaultMinBet: 20,
        defaultMaxBet: 30000,
        defaultLimit: 30000,
        defaultPayoutMultiplier: 0, // Parimutuel
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      },
      {
        type: 'Ultra Lotto 6/58',
        icon: '🌟',
        format: '6 from 1-58',
        description: 'Pick 6 numbers from 1-58',
        defaultMinBet: 20,
        defaultMaxBet: 50000,
        defaultLimit: 50000,
        defaultPayoutMultiplier: 0, // Parimutuel
        defaultCommission: 10,
        suggestedDrawTimes: ['9:00 PM']
      }
    ]
  };

  // Initial games (pre-configured STL games)
  const [games, setGames] = useState([
    {
      id: 'stl-pares',
      name: 'STL Pares',
      icon: '🎲',
      format: 'XX.XX (01-40)',
      status: 'active',
      settings: {
        minBet: 10,
        maxBet: 2000,
        defaultLimit: 2000,
        drawSchedule: ['10:30 AM', '3:00 PM', '7:00 PM'],
        betCutoff: 15, // minutes before draw
        payoutMultiplier: 700,
        commissionRate: 8 // percentage
      }
    },
    {
      id: 'last-2',
      name: 'Last 2',
      icon: '🎯',
      format: 'XX (00-99)',
      status: 'active',
      settings: {
        minBet: 10,
        maxBet: 1500,
        defaultLimit: 1500,
        drawSchedule: ['11:00 AM', '4:00 PM', '9:00 PM'],
        betCutoff: 10,
        payoutMultiplier: 80,
        commissionRate: 10
      }
    },
    {
      id: 'last-3',
      name: 'Last 3',
      icon: '🎰',
      format: 'XXX (000-999)',
      status: 'active',
      settings: {
        minBet: 10,
        maxBet: 1800,
        defaultLimit: 1800,
        drawSchedule: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'],
        betCutoff: 15,
        payoutMultiplier: 500,
        commissionRate: 12
      }
    },
    {
      id: 'swer3',
      name: 'Swer3',
      icon: '🎪',
      format: 'XXX (000-999)',
      status: 'active',
      settings: {
        minBet: 10,
        maxBet: 2500,
        defaultLimit: 2500,
        drawSchedule: ['11:00 AM', '4:00 PM', '9:00 PM'],
        betCutoff: 20,
        payoutMultiplier: 500,
        commissionRate: 10
      }
    }
  ]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false); // keep single definition
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Create game form
  const [createFormData, setCreateFormData] = useState({
    gameCategory: 'stl',
    gameType: '',
    customName: '',
    minBet: 10,
    maxBet: 2000,
    defaultLimit: 2000,
    betCutoff: 15,
    payoutMultiplier: 700,
    commissionRate: 8
  });

  // Schedule modal
  const [scheduleData, setScheduleData] = useState([]); // store as 24h "HH:MM" for editing
  const [newDrawTime, setNewDrawTime] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const totalGames = games.length;
    const activeGames = games.filter(g => g.status === 'active').length;
    const totalDrawsToday = games.reduce((sum, g) => sum + g.settings.drawSchedule.length, 0);
    const avgCommission =
      totalGames > 0
        ? games.reduce((sum, g) => sum + (Number(g.settings.commissionRate) || 0), 0) / totalGames
        : 0;

    return {
      totalGames,
      activeGames,
      totalDrawsToday,
      avgCommission: avgCommission.toFixed(1)
    };
  }, [games]);

  // Open create modal
  const openCreateModal = () => {
    setCreateFormData({
      gameCategory: 'stl',
      gameType: '',
      customName: '',
      minBet: 10,
      maxBet: 2000,
      defaultLimit: 2000,
      betCutoff: 15,
      payoutMultiplier: 700,
      commissionRate: 8
    });
    setShowCreateModal(true);
  };

  // Handle game type selection in create modal
  const handleGameTypeSelect = (type) => {
    const allTypes = [...gameTypes.stl, ...gameTypes.digit, ...gameTypes.lotto];
    const template = allTypes.find(t => t.type === type);
    
    if (template) {
      setCreateFormData(prev => ({
        ...prev,
        gameType: type,
        customName: template.type,
        minBet: template.defaultMinBet,
        maxBet: template.defaultMaxBet,
        defaultLimit: template.defaultLimit,
        payoutMultiplier: template.defaultPayoutMultiplier,
        commissionRate: template.defaultCommission
      }));
    }
  };

  // Create new game
  const handleCreateGame = (e) => {
    e.preventDefault();
    
    const allTypes = [...gameTypes.stl, ...gameTypes.digit, ...gameTypes.lotto];
    const template = allTypes.find(t => t.type === createFormData.gameType);
    
    if (!template) return;

    const newGame = {
      id: `game-${Date.now()}`,
      name: createFormData.customName || template.type,
      icon: template.icon,
      format: template.format,
      gameCategory: createFormData.gameCategory,
      gameType: createFormData.gameType,
      status: 'active',
      settings: {
        minBet: createFormData.minBet,
        maxBet: createFormData.maxBet,
        defaultLimit: createFormData.defaultLimit,
        drawSchedule: template.suggestedDrawTimes, // keep AM/PM display storage
        betCutoff: createFormData.betCutoff,
        payoutMultiplier: createFormData.payoutMultiplier,
        commissionRate: createFormData.commissionRate
      }
    };

    setGames(prev => [...prev, newGame]);
    setShowCreateModal(false);
  };

  // Delete game
  const handleDeleteGame = () => {
    setGames(prev => prev.filter(g => g.id !== selectedGame.id));
    setShowDeleteModal(false);
    setSelectedGame(null);
  };

  // Open delete modal
  const openDeleteModal = (game) => {
    setSelectedGame(game);
    setShowDeleteModal(true);
  };

  // Open edit modal
  const openEditModal = (game) => {
    setSelectedGame(game);
    setEditFormData({ ...game.settings });
    setShowEditModal(true);
  };

  // Open schedule modal
  const openScheduleModal = (game) => {
    setSelectedGame(game);
    // Normalize existing schedule (AM/PM or 24h) to 24h for editing
    const normalized = (game.settings.drawSchedule || []).map(to24h);
    setScheduleData(sortTimes24(normalized));
    setNewDrawTime('');
    setShowScheduleModal(true);
  };

  // Save settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    setGames(prev => prev.map(g => 
      g.id === selectedGame.id 
        ? { ...g, settings: { ...g.settings, ...editFormData } }
        : g
    ));
    
    setShowEditModal(false);
    setSelectedGame(null);
    setEditFormData({});
  };

  // Add draw time
  const handleAddDrawTime = () => {
    const value = to24h(newDrawTime);
    if (!value) return;
    const exists = scheduleData.some(t => to24h(t) === value);
    if (!exists) {
      setScheduleData(sortTimes24([...scheduleData, value]));
      setNewDrawTime('');
    }
  };

  // Remove draw time
  const handleRemoveDrawTime = (time) => {
    const target24 = to24h(time);
    setScheduleData(scheduleData.filter(t => to24h(t) !== target24));
  };

  // Save schedule
  const handleSaveSchedule = () => {
    // Convert stored 24h times back to AM/PM for game storage/display
    const finalTimes = sortTimes24(scheduleData).map(to12h);
    setGames(prev => prev.map(g => 
      g.id === selectedGame.id 
        ? { 
            ...g, 
            settings: { 
              ...g.settings, 
              drawSchedule: finalTimes 
            } 
          }
        : g
    ));
    
    setShowScheduleModal(false);
    setSelectedGame(null);
    setScheduleData([]);
  };

  // Toggle game status
  const handleToggleStatus = (gameId) => {
    setGames(prev => prev.map(g => 
      g.id === gameId 
        ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' }
        : g
    ));
  };

  return (
    <div className="gc-container">
      {/* Page Header */}
      <div className="gc-header">
        <div className="gc-header-left">
          <h1 className="gc-title">Game Configuration</h1>
          <p className="gc-subtitle">Configure game settings, draw schedules, and betting limits</p>
        </div>
        <div className="gc-header-right">
          <button 
            className="gc-btn gc-btn-primary"
            onClick={openCreateModal}
          >
            <span className="gc-btn-icon">➕</span>
            <span className="gc-btn-text">Create New Game</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="gc-stats-grid">
        <div className="gc-stat-card">
          <div className="gc-stat-icon gc-stat-blue">🎮</div>
          <div className="gc-stat-info">
            <div className="gc-stat-value">{stats.totalGames}</div>
            <div className="gc-stat-label">Total Games</div>
          </div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon gc-stat-green">✓</div>
          <div className="gc-stat-info">
            <div className="gc-stat-value">{stats.activeGames}</div>
            <div className="gc-stat-label">Active</div>
          </div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon gc-stat-purple">🕐</div>
          <div className="gc-stat-info">
            <div className="gc-stat-value">{stats.totalDrawsToday}</div>
            <div className="gc-stat-label">Daily Draws</div>
          </div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon gc-stat-orange">💰</div>
          <div className="gc-stat-info">
            <div className="gc-stat-value">{stats.avgCommission}%</div>
            <div className="gc-stat-label">Avg Commission</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="gc-games-grid">
        {games.map(game => (
          <div key={game.id} className="gc-game-card">
            <div className="gc-game-header">
              <div className="gc-game-icon">{game.icon}</div>
              <div className="gc-game-info">
                <div className="gc-game-name">{game.name}</div>
                <div className="gc-game-format">{game.format}</div>
              </div>
              <div className={`gc-game-status gc-status-${game.status}`}>
                {game.status === 'active' ? '✓ Active' : '⏸ Inactive'}
              </div>
            </div>

            <div className="gc-game-body">
              <div className="gc-setting-row">
                <span className="gc-setting-label">Bet Range</span>
                <span className="gc-setting-value">
                  ₱{game.settings.minBet} - ₱{Number(game.settings.maxBet).toLocaleString()}
                </span>
              </div>
              <div className="gc-setting-row">
                <span className="gc-setting-label">Default Limit</span>
                <span className="gc-setting-value">₱{Number(game.settings.defaultLimit).toLocaleString()}</span>
              </div>
              <div className="gc-setting-row">
                <span className="gc-setting-label">Draw Schedule</span>
                <span className="gc-setting-value">{game.settings.drawSchedule.length} draws/day</span>
              </div>
              <div className="gc-setting-row">
                <span className="gc-setting-label">Bet Cutoff</span>
                <span className="gc-setting-value">{game.settings.betCutoff} mins before</span>
              </div>
              <div className="gc-setting-row">
                <span className="gc-setting-label">Payout</span>
                <span className="gc-setting-value">{game.settings.payoutMultiplier}x</span>
              </div>
              <div className="gc-setting-row">
                <span className="gc-setting-label">Commission</span>
                <span className="gc-setting-value">{game.settings.commissionRate}%</span>
              </div>
            </div>

            <div className="gc-game-footer">
              <button 
                className="gc-action-btn gc-action-edit"
                onClick={() => openEditModal(game)}
              >
                ⚙️ Settings
              </button>
              <button 
                className="gc-action-btn gc-action-schedule"
                onClick={() => openScheduleModal(game)}
              >
                🕐 Schedule
              </button>
              <button 
                className={`gc-action-btn ${game.status === 'active' ? 'gc-action-pause' : 'gc-action-play'}`}
                onClick={() => handleToggleStatus(game.id)}
              >
                {game.status === 'active' ? '⏸ Pause' : '▶ Activate'}
              </button>
              <button 
                className="gc-action-btn gc-action-delete"
                onClick={() => openDeleteModal(game)}
                title="Delete Game"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Settings Modal */}
      {showEditModal && selectedGame && (
        <div className="gc-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <h3 className="gc-modal-title">
                <span className="gc-modal-icon">{selectedGame.icon}</span>
                {selectedGame.name} - Settings
              </h3>
              <button className="gc-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="gc-modal-body">
                <div className="gc-form-row">
                  <div className="gc-form-field">
                    <label className="gc-form-label">Min Bet (₱)</label>
                    <input
                      type="number"
                      className="gc-form-input"
                      value={editFormData.minBet}
                      onChange={(e) => setEditFormData({...editFormData, minBet: parseInt(e.target.value, 10)})}
                      min="1"
                      required
                    />
                  </div>
                  <div className="gc-form-field">
                    <label className="gc-form-label">Max Bet (₱)</label>
                    <input
                      type="number"
                      className="gc-form-input"
                      value={editFormData.maxBet}
                      onChange={(e) => setEditFormData({...editFormData, maxBet: parseInt(e.target.value, 10)})}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="gc-form-field">
                  <label className="gc-form-label">Default Limit (₱)</label>
                  <input
                    type="number"
                    className="gc-form-input"
                    value={editFormData.defaultLimit}
                    onChange={(e) => setEditFormData({...editFormData, defaultLimit: parseInt(e.target.value, 10)})}
                    min="1"
                    required
                  />
                </div>
                <div className="gc-form-row">
                  <div className="gc-form-field">
                    <label className="gc-form-label">Bet Cutoff (mins)</label>
                    <input
                      type="number"
                      className="gc-form-input"
                      value={editFormData.betCutoff}
                      onChange={(e) => setEditFormData({...editFormData, betCutoff: parseInt(e.target.value, 10)})}
                      min="1"
                      required
                    />
                  </div>
                  <div className="gc-form-field">
                    <label className="gc-form-label">Payout Multiplier</label>
                    <input
                      type="number"
                      className="gc-form-input"
                      value={editFormData.payoutMultiplier}
                      onChange={(e) => setEditFormData({...editFormData, payoutMultiplier: parseInt(e.target.value, 10)})}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="gc-form-field">
                  <label className="gc-form-label">Commission Rate (%)</label>
                  <input
                    type="number"
                    className="gc-form-input"
                    value={editFormData.commissionRate}
                    onChange={(e) => setEditFormData({...editFormData, commissionRate: parseFloat(e.target.value)})}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>
              <div className="gc-modal-footer">
                <button 
                  type="button" 
                  className="gc-btn gc-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="gc-btn gc-btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedGame && (
        <div className="gc-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="gc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <h3 className="gc-modal-title">
                <span className="gc-modal-icon">{selectedGame.icon}</span>
                {selectedGame.name} - Draw Schedule
              </h3>
              <button className="gc-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="gc-modal-body">
              <div className="gc-schedule-info">
                Configure daily draw times for {selectedGame.name}. Draws will occur automatically at these times.
              </div>
              
              <div className="gc-schedule-add">
                <input
                  type="time"
                  className="gc-time-input"
                  value={newDrawTime}
                  onChange={(e) => setNewDrawTime(e.target.value)}
                />
                <button 
                  className="gc-btn gc-btn-primary gc-btn-small"
                  onClick={handleAddDrawTime}
                  disabled={!newDrawTime}
                >
                  ➕ Add Time
                </button>
              </div>

              <div className="gc-schedule-list">
                {scheduleData.length === 0 ? (
                  <div className="gc-empty-schedule">
                    No draw times configured. Add a time to get started.
                  </div>
                ) : (
                  sortTimes24(scheduleData).map((time, index) => (
                    <div key={`${time}-${index}`} className="gc-schedule-item">
                      <span className="gc-schedule-time">🕐 {to12h(time)}</span>
                      <button 
                        className="gc-schedule-remove"
                        onClick={() => handleRemoveDrawTime(time)}
                        aria-label={`Remove ${to12h(time)}`}
                        title="Remove time"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="gc-modal-footer">
              <button 
                className="gc-btn gc-btn-secondary"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="gc-btn gc-btn-primary"
                onClick={handleSaveSchedule}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="gc-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gc-modal gc-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <h3 className="gc-modal-title">
                <span className="gc-modal-icon">➕</span>
                Create New Game
              </h3>
              <button className="gc-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateGame}>
              <div className="gc-modal-body">
                <div className="gc-create-info">
                  Create a new game based on STL or PCSO game types. Select a game type and customize settings.
                </div>

                {/* Game Category Selection */}
                <div className="gc-form-field">
                  <label className="gc-form-label">Game Category *</label>
                  <div className="gc-category-tabs">
                    <button
                      type="button"
                      className={`gc-category-tab ${createFormData.gameCategory === 'stl' ? 'active' : ''}`}
                      onClick={() => {
                        setCreateFormData({...createFormData, gameCategory: 'stl', gameType: ''});
                      }}
                    >
                      🎲 STL Games
                    </button>
                    <button
                      type="button"
                      className={`gc-category-tab ${createFormData.gameCategory === 'digit' ? 'active' : ''}`}
                      onClick={() => {
                        setCreateFormData({...createFormData, gameCategory: 'digit', gameType: ''});
                      }}
                    >
                      🔢 Digit Games
                    </button>
                    <button
                      type="button"
                      className={`gc-category-tab ${createFormData.gameCategory === 'lotto' ? 'active' : ''}`}
                      onClick={() => {
                        setCreateFormData({...createFormData, gameCategory: 'lotto', gameType: ''});
                      }}
                    >
                      🎱 Lotto Games
                    </button>
                  </div>
                </div>

                {/* Game Type Selection */}
                <div className="gc-form-field">
                  <label className="gc-form-label">Select Game Type *</label>
                  <div className="gc-game-type-grid">
                    {gameTypes[createFormData.gameCategory].map((template) => (
                      <button
                        key={template.type}
                        type="button"
                        className={`gc-game-type-card ${createFormData.gameType === template.type ? 'selected' : ''}`}
                        onClick={() => handleGameTypeSelect(template.type)}
                      >
                        <div className="gc-type-icon">{template.icon}</div>
                        <div className="gc-type-name">{template.type}</div>
                        <div className="gc-type-format">{template.format}</div>
                        <div className="gc-type-description">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {createFormData.gameType && (
                  <>
                    {/* Custom Game Name */}
                    <div className="gc-form-field">
                      <label className="gc-form-label">Game Name (Optional)</label>
                      <input
                        type="text"
                        className="gc-form-input"
                        placeholder="Leave blank to use default name"
                        value={createFormData.customName}
                        onChange={(e) => setCreateFormData({...createFormData, customName: e.target.value})}
                      />
                    </div>

                    {/* Settings */}
                    <div className="gc-form-row">
                      <div className="gc-form-field">
                        <label className="gc-form-label">Min Bet (₱) *</label>
                        <input
                          type="number"
                          className="gc-form-input"
                          value={createFormData.minBet}
                          onChange={(e) => setCreateFormData({...createFormData, minBet: parseInt(e.target.value, 10)})}
                          min="1"
                          required
                        />
                      </div>
                      <div className="gc-form-field">
                        <label className="gc-form-label">Max Bet (₱) *</label>
                        <input
                          type="number"
                          className="gc-form-input"
                          value={createFormData.maxBet}
                          onChange={(e) => setCreateFormData({...createFormData, maxBet: parseInt(e.target.value, 10)})}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="gc-form-field">
                      <label className="gc-form-label">Default Limit (₱) *</label>
                      <input
                        type="number"
                        className="gc-form-input"
                        value={createFormData.defaultLimit}
                        onChange={(e) => setCreateFormData({...createFormData, defaultLimit: parseInt(e.target.value, 10)})}
                        min="1"
                        required
                      />
                    </div>

                    <div className="gc-form-row">
                      <div className="gc-form-field">
                        <label className="gc-form-label">Bet Cutoff (mins) *</label>
                        <input
                          type="number"
                          className="gc-form-input"
                          value={createFormData.betCutoff}
                          onChange={(e) => setCreateFormData({...createFormData, betCutoff: parseInt(e.target.value, 10)})}
                          min="1"
                          required
                        />
                      </div>
                      <div className="gc-form-field">
                        <label className="gc-form-label">Commission Rate (%) *</label>
                        <input
                          type="number"
                          className="gc-form-input"
                          value={createFormData.commissionRate}
                          onChange={(e) => setCreateFormData({...createFormData, commissionRate: parseFloat(e.target.value)})}
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>
                    </div>

                    <div className="gc-form-field">
                      <label className="gc-form-label">Payout Multiplier *</label>
                      <input
                        type="number"
                        className="gc-form-input"
                        value={createFormData.payoutMultiplier}
                        onChange={(e) => setCreateFormData({...createFormData, payoutMultiplier: parseInt(e.target.value, 10)})}
                        min="0"
                        required
                      />
                      <span className="gc-form-hint">Set to 0 for parimutuel games (major lotto)</span>
                    </div>
                  </>
                )}
              </div>
              <div className="gc-modal-footer">
                <button 
                  type="button" 
                  className="gc-btn gc-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="gc-btn gc-btn-primary"
                  disabled={!createFormData.gameType}
                >
                  Create Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGame && (
        <div className="gc-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="gc-modal gc-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="gc-modal-header">
              <h3 className="gc-modal-title">Delete Game</h3>
              <button className="gc-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="gc-modal-body">
              <p className="gc-delete-message">
                Are you sure you want to delete <strong>{selectedGame.name}</strong>?
              </p>
              <p className="gc-delete-warning">
                ⚠️ This action cannot be undone. All game settings and draw schedules will be permanently removed.
              </p>
            </div>
            <div className="gc-modal-footer">
              <button 
                className="gc-btn gc-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="gc-btn gc-btn-danger"
                onClick={handleDeleteGame}
              >
                Delete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameConfiguration;
