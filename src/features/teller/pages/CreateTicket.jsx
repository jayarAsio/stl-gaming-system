import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from "react-router-dom";
import QRCode from 'qrcode';
import "../styles/common.css";
import "../styles/create-ticket.css";

/* ---------------- Draw times ---------------- */
const DRAW_TIMES = [
  { time: '11:00 AM', label: '11:00 AM', enabled: true },
  { time: '4:00 PM',  label: '4:00 PM',  enabled: true },
  { time: '9:00 PM',  label: '9:00 PM',  enabled: true },
];

/* ---------------- Game configs ---------------- */
const GAME_CONFIGS = {
  'STL Pares': {
    icon: '🎯',
    description: 'Pick 2 numbers from 01–40 (must be different)',
    inputType: 'pares',
    pattern: /^\d{1,2}\.\d{1,2}$/,
    placeholder: 'e.g., 10.23',
    maxLength: 5,
    helpText: 'Two numbers 01–40, use dot between (auto dot after first two digits).'
  },
  'Last 2': {
    icon: '🎲',
    description: '2-digit number (00–99)',
    inputType: 'last2',
    pattern: /^\d{2}$/,
    placeholder: 'e.g., 45',
    maxLength: 2,
    helpText: 'Exactly 2 digits (00–99).'
  },
  'Last 3': {
    icon: '🎰',
    description: '3-digit number (000–999)',
    inputType: 'last3',
    pattern: /^\d{3}$/,
    placeholder: 'e.g., 123',
    maxLength: 3,
    helpText: 'Exactly 3 digits (000–999).'
  },
  'Swer3': {
    icon: '🎪',
    description: '3-digit winning combination',
    inputType: 'swer3',
    pattern: /^\d{3}$/,
    placeholder: 'e.g., 456',
    maxLength: 3,
    helpText: 'Exactly 3 digits (000–999).'
  }
};

const CreateTicket = () => {
  /* ---------------- State ---------------- */
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDrawTime, setSelectedDrawTime] = useState('');
  const [comboInput, setComboInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [bets, setBets] = useState([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [ticketQR, setTicketQR] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState('');
  const [selectedRecentTicket, setSelectedRecentTicket] = useState(null);

  // timers cleanup refs
  const toastTimerRef = useRef(null);
  const genTimerRef = useRef(null);
  const postPrintTimerRef = useRef(null);

  /* ---------------- QR Code Generation ---------------- */
  const generateQRForTicket = useCallback(async (ticketData) => {
    try {
      const qrData = JSON.stringify({
        id: ticketData.id,
        timestamp: ticketData.timestamp,
        total: ticketData.total,
        bets: ticketData.bets,
        drawTime: selectedDrawTime,
        verified: true
      });

      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 90,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  }, [selectedDrawTime]);

  /* ---------------- Generate QR for Recent Ticket ---------------- */
  const generateQRForRecentTicket = useCallback(async (ticketData) => {
    try {
      const qrData = JSON.stringify({
        id: ticketData.id,
        timestamp: ticketData.timestamp,
        total: ticketData.total,
        bets: ticketData.bets,
        verified: true
      });

      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 90,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  }, []);

  /* ---------------- Load recent on mount ---------------- */
  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem('recentTickets');
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent).slice(0, 5).map(t => ({
          ...t,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        }));
        setRecentTickets(parsed);
      }
    } catch (e) {
      console.warn('Failed to load recent tickets:', e);
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (genTimerRef.current) clearTimeout(genTimerRef.current);
      if (postPrintTimerRef.current) clearTimeout(postPrintTimerRef.current);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  /* ---------------- Lock scroll when modal is open ---------------- */
  const anyModalOpen = showGameModal || showPrintModal || showViewModal;
  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [anyModalOpen]);

  /* ---------------- Toast ---------------- */
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  }, []);

  /* ---------------- Available draw times (30-min buffer) ---------------- */
  const availableDrawTimes = useMemo(() => {
    const now = new Date();
    const buffer = new Date(now.getTime() + 30 * 60000);

    return DRAW_TIMES.map(draw => {
      const [timeStr, period] = draw.time.split(' ');
      const [h, m] = timeStr.split(':').map(Number);
      const hour24 =
        period === 'PM' && h !== 12 ? h + 12 :
        period === 'AM' && h === 12 ? 0 : h;

      const drawDt = new Date();
      drawDt.setHours(hour24, m, 0, 0);

      const isEnabled = drawDt.getTime() > buffer.getTime();
      return { ...draw, isEnabled, label: draw.label + (isEnabled ? '' : ' (Closed)') };
    });
  }, []);

  /* ---------------- Validators ---------------- */
  const validateCombo = useCallback((combo, game) => {
    if (!combo || !game) return false;
    const config = GAME_CONFIGS[game];
    if (!config) return false;

    switch (config.inputType) {
      case 'pares': {
        const match = combo.match(/^(\d{1,2})\.(\d{1,2})$/);
        if (!match) return false;
        const n1 = parseInt(match[1], 10);
        const n2 = parseInt(match[2], 10);
        return n1 !== n2 && n1 >= 1 && n1 <= 40 && n2 >= 1 && n2 <= 40;
      }
      case 'last2':
        return /^\d{2}$/.test(combo);
      case 'last3':
      case 'swer3':
        return /^\d{3}$/.test(combo);
      default:
        return false;
    }
  }, []);

  /* ---------------- Inputs ---------------- */
  const handleComboChange = useCallback((value) => {
    if (!selectedGame) return;
    const config = GAME_CONFIGS[selectedGame];
    let v = value;

    switch (config.inputType) {
      case 'pares': {
        v = v.replace(/[^\d.]/g, '');
        const firstDot = v.indexOf('.');
        if (firstDot !== -1) {
          v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
        }
        if (!v.includes('.') && v.length > 2) {
          v = v.slice(0, 2) + '.' + v.slice(2);
        }
        v = v.slice(0, 5);
        break;
      }
      case 'last2':
        v = v.replace(/\D/g, '').slice(0, 2);
        break;
      case 'last3':
      case 'swer3':
        v = v.replace(/\D/g, '').slice(0, 3);
        break;
    }
    setComboInput(v);
  }, [selectedGame]);

  const handleAmountChange = useCallback((value) => {
    const numeric = value.replace(/\D/g, '').slice(0, 3);
    const amount = Math.max(0, Math.min(parseInt(numeric || '0', 10), 500));
    setAmountInput(amount ? String(amount) : '');
  }, []);

  const isAddBetValid = useMemo(() => {
    const amount = parseInt(amountInput || '0', 10);
    return selectedDrawTime &&
      validateCombo(comboInput, selectedGame) &&
      amount >= 1 && amount <= 500;
  }, [selectedDrawTime, comboInput, selectedGame, amountInput, validateCombo]);

  /* ---------------- Modal open/close ---------------- */
  const openGameModal = useCallback((game) => {
    setSelectedGame(game);
    setSelectedDrawTime('');
    setComboInput('');
    setAmountInput('');
    setShowGameModal(true);
  }, []);

  const closeGameModal = useCallback(() => {
    setShowGameModal(false);
    setSelectedGame('');
    setSelectedDrawTime('');
    setComboInput('');
    setAmountInput('');
  }, []);

  /* ---------------- View Recent Ticket Functions ---------------- */
  const viewRecentTicket = useCallback(async (ticket) => {
    setSelectedRecentTicket(ticket);
    setIsGenerating(true);
    
    const qrDataURL = await generateQRForRecentTicket(ticket);
    setTicketQR(qrDataURL || '');
    
    setIsGenerating(false);
    setShowViewModal(true);
    showToast('Loading ticket details...', 'info');
  }, [generateQRForRecentTicket, showToast]);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedRecentTicket(null);
    setTicketQR('');
  }, []);

  /* ---------------- Bets ---------------- */
  const addBet = useCallback(() => {
    if (!isAddBetValid) {
      showToast('Please complete all fields correctly', 'error');
      return;
    }
    const amount = parseInt(amountInput, 10);

    if (selectedGame === 'STL Pares') {
      const match = comboInput.match(/^(\d{1,2})\.(\d{1,2})$/);
      if (match && parseInt(match[1], 10) === parseInt(match[2], 10)) {
        showToast('STL Pares numbers must be different', 'error');
        return;
      }
    }

    let displayCombo = comboInput;
    if (selectedGame === 'STL Pares') {
      const match = comboInput.match(/^(\d{1,2})\.(\d{1,2})$/);
      if (match) {
        displayCombo = match[1].padStart(2, '0') + '.' + match[2].padStart(2, '0');
      }
    }

    setBets(prev => {
      const idx = prev.findIndex(b =>
        b.game === selectedGame && b.combo === displayCombo && b.drawTime === selectedDrawTime
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: Math.min(500, next[idx].amount + amount) };
        showToast('Added to existing combo (capped at ₱500).');
        return next;
      }
      const newBet = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        game: selectedGame,
        combo: displayCombo,
        amount,
        drawTime: selectedDrawTime
      };
      showToast('Combination added!');
      return [...prev, newBet];
    });

    setComboInput('');
    setAmountInput('');
  }, [isAddBetValid, selectedGame, comboInput, amountInput, selectedDrawTime, showToast]);

  const removeBet = useCallback((betId) => {
    setBets(prev => prev.filter(b => b.id !== betId));
    showToast('Combination removed');
  }, [showToast]);

  const clearAllBets = useCallback(() => {
    if (bets.length === 0) return;
    if (window.confirm('Clear all combinations?')) {
      setBets([]);
      showToast('All combinations cleared');
    }
  }, [bets.length, showToast]);

  /* ---------------- Totals ---------------- */
  const totalAmount = useMemo(
    () => bets.reduce((sum, b) => sum + b.amount, 0),
    [bets]
  );

  /* ---------------- Group bets by game and draw time ---------------- */
  const groupedBets = useMemo(() => {
    const groups = {};
    bets.forEach(bet => {
      const key = `${bet.game}_${bet.drawTime}`;
      if (!groups[key]) {
        groups[key] = {
          game: bet.game,
          drawTime: bet.drawTime,
          bets: []
        };
      }
      groups[key].bets.push(bet);
    });
    return Object.values(groups);
  }, [bets]);

  /* ---------------- Generate / Print ---------------- */
  const generateTicket = useCallback(async () => {
    if (bets.length === 0) {
      showToast('Please add at least one combination', 'error');
      return;
    }
    setIsGenerating(true);
    if (genTimerRef.current) clearTimeout(genTimerRef.current);

    genTimerRef.current = setTimeout(async () => {
      const ticketId = `TKT${Date.now().toString().slice(-8)}`;
      const ticketData = {
        id: ticketId,
        timestamp: new Date().toISOString(),
        bets: [...bets],
        total: totalAmount
      };

      const qrDataURL = await generateQRForTicket(ticketData);
      
      setCurrentTicketId(ticketId);
      setTicketQR(qrDataURL || '');

      const updatedRecent = [ticketData, ...recentTickets].slice(0, 5);
      setRecentTickets(updatedRecent);
      localStorage.setItem('recentTickets', JSON.stringify(updatedRecent));

      setIsGenerating(false);
      setShowPrintModal(true);
    }, 700);
  }, [bets, totalAmount, recentTickets, generateQRForTicket]);

  const confirmPrint = useCallback(() => {
    try { window.print(); } catch (e) { console.warn('Print failed:', e); }

    if (postPrintTimerRef.current) clearTimeout(postPrintTimerRef.current);
    postPrintTimerRef.current = setTimeout(() => {
      setShowPrintModal(false);
      closeGameModal();
      setBets([]);
      setSelectedDrawTime('');
      setTicketQR('');
      setCurrentTicketId('');
      showToast('Ticket sent to printer!', 'success');
    }, 200);
  }, [closeGameModal, showToast]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="content">
          <h1>Create New Ticket</h1>
          <p>Select a game, add combos, and print</p>
        </div>
        <Link to="/teller" className="back-button">
          ← Back To Dashboard
        </Link>
      </header>

      {/* Games */}
      <section className="games-section">
        <h2 className="section-title">Choose Your Game</h2>
        <div className="games-grid">
          {Object.entries(GAME_CONFIGS).map(([game, config]) => (
            <button
              key={game}
              className="game-card"
              onClick={() => openGameModal(game)}
            >
              <div className="game-icon">{config.icon}</div>
              <div className="game-title">{game}</div>
              <div className="game-description">{config.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Tickets */}
      {recentTickets.length > 0 && (
        <section className="history-section">
          <h2 className="section-title">Recent Tickets</h2>
          <div className="history-grid">
            {recentTickets.slice(0, 3).map(t => (
              <div 
                key={t.id} 
                className="history-card"
                onClick={() => viewRecentTicket(t)}
              >
                <div className="history-id">{t.id}</div>
                <div className="history-details">
                  {t.bets?.length || 0} combinations • ₱{(t.total || 0).toLocaleString()}
                </div>
                <div className="history-date">
                  {new Date(t.timestamp).toLocaleDateString('en-PH')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Game Modal */}
      {showGameModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedGame}</h2>
              <button className="close-btn" onClick={closeGameModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Select Draw Time</label>
                <select
                  value={selectedDrawTime}
                  onChange={(e) => setSelectedDrawTime(e.target.value)}
                >
                  <option value="">Select draw time</option>
                  {availableDrawTimes.map(draw => (
                    <option key={draw.time} value={draw.time} disabled={!draw.isEnabled}>
                      {draw.label}
                    </option>
                  ))}
                </select>
                <div className="helper">30-minute cut-off before each draw.</div>
              </div>

              <div className="form-group">
                <label>Enter Combination</label>
                <input
                  type="text"
                  placeholder={GAME_CONFIGS[selectedGame]?.placeholder}
                  value={comboInput}
                  onChange={(e) => handleComboChange(e.target.value)}
                  maxLength={GAME_CONFIGS[selectedGame]?.maxLength}
                />
                <div className="helper">{GAME_CONFIGS[selectedGame]?.helpText}</div>
              </div>

              <div className="form-group">
                <label>Bet Amount (₱1 - ₱500)</label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
                <div className="helper">Digits only. Max ₱500.</div>
              </div>

              <button className="add-btn" onClick={addBet} disabled={!isAddBetValid}>
                Add Combination
              </button>

              <div className="bets-section">
                <h3>Your Combinations</h3>
                <div className="bets-list">
                  {bets.length === 0 ? (
                    <div className="empty-state">No combinations added yet</div>
                  ) : (
                    bets.map(bet => (
                      <div key={bet.id} className="bet-item">
                        <div className="bet-details">
                          <div className="bet-combo">{bet.game}: {bet.combo}</div>
                          <div className="bet-amount">₱{bet.amount.toLocaleString()}</div>
                          <div className="bet-draw-time">Draw: {bet.drawTime}</div>
                        </div>
                        <button className="remove-btn" onClick={() => removeBet(bet.id)}>
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="total-section">
                  <div className="total-amount">₱{totalAmount.toLocaleString()}</div>
                  <div className="total-label">Total Bet Amount</div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={clearAllBets}>Clear All</button>
                <button
                  className="btn-primary"
                  onClick={generateTicket}
                  disabled={bets.length === 0 || isGenerating}
                >
                  {isGenerating ? (<><span className="spinner"></span> Generating…</>) : 'Print Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <div className="print-modal">
          <div className="print-container">
            <div className="print-header">
              <div className="print-title">Print Ticket</div>
              <div className="print-subtitle">Review your ticket before printing</div>
            </div>

            <div className="print-body">
              <div className="ticket">
                <div className="ticket-brand">
                  <div className="ticket-logo">STL</div>
                  <div className="ticket-logo">COMPANY</div>
                  <div className="ticket-logo">PCSO</div>
                </div>
                
                <div className="ticket-title">STL GAMING SYSTEM</div>
                <div className="ticket-sub">OFFICIAL BETTING TICKET • PCSO PHILIPPINES</div>

                <div className="ticket-details">
                  <div className="detail-row">
                    <span>OPERATOR:</span>
                    <span>TELLER01</span>
                  </div>
                </div>

                <div className="ticket-meta">
                  <div><strong>REF: {currentTicketId}</strong></div>
                  <div>{new Date().toLocaleString('en-PH', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true 
                  })}</div>
                </div>

                <div className="ticket-bets">
                  {groupedBets.map((group, groupIndex) => (
                    <div key={groupIndex} className="bet-group">
                      <div className="group-header">
                        <div className="game-name">{group.game.toUpperCase()}</div>
                        <div className="draw-time">DRAW: {group.drawTime}</div>
                      </div>
                      {group.bets.map((bet, betIndex) => (
                        <div key={betIndex} className="bet-line">
                          <span className="bet-combo">{bet.combo}</span>
                          <span className="bet-amt">₱{bet.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="ticket-total">
                  <span>TOTAL AMOUNT</span>
                  <span>₱{totalAmount.toLocaleString()}</span>
                </div>

                <div className="qr">
                  <div className="qr-box">
                    {ticketQR ? (
                      <img 
                        src={ticketQR} 
                        alt="Ticket QR Code" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          imageRendering: 'pixelated',
                          display: 'block' 
                        }}
                      />
                    ) : (
                      <div className="qr-loading">Generating QR...</div>
                    )}
                  </div>
                  <div className="qr-text">SCAN TO VERIFY</div>
                </div>

                <div className="ticket-foot">
                  <div>KEEP THIS TICKET SAFE • PRESENT TO CLAIM WINNINGS</div>
                  <div>THIS TICKET IS VALID FOR 365 DAYS FROM DRAW DATE</div>
                  <div>FOR INQUIRIES: CALL PCSO HOTLINE 8-889-8889</div>
                  <div>RESPONSIBLE GAMING: PLAY WITHIN YOUR MEANS</div>
                </div>
              </div>
            </div>

            <div className="print-actions">
              <button className="print-btn-back" onClick={() => setShowPrintModal(false)}>← Back</button>
              <button className="print-btn-print" onClick={confirmPrint}>Print Ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* View Recent Ticket Modal */}
      {showViewModal && selectedRecentTicket && (
        <div className="print-modal">
          <div className="print-container">
            <div className="print-header">
              <div className="print-title">Ticket Details</div>
              <div className="print-subtitle">View your saved ticket information</div>
            </div>

            <div className="print-body">
              <div className="ticket">
                <div className="ticket-brand">
                  <div className="ticket-logo">STL</div>
                  <div className="ticket-logo">COMPANY</div>
                  <div className="ticket-logo">PCSO</div>
                </div>
                
                <div className="ticket-title">STL GAMING SYSTEM</div>
                <div className="ticket-sub">OFFICIAL BETTING TICKET • PCSO PHILIPPINES</div>

                <div className="ticket-details">
                  <div className="detail-row">
                    <span>OPERATOR:</span>
                    <span>TELLER01</span>
                  </div>
                </div>

                <div className="ticket-meta">
                  <div><strong>REF: {selectedRecentTicket.id}</strong></div>
                  <div>{new Date(selectedRecentTicket.timestamp).toLocaleString('en-PH', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true 
                  })}</div>
                </div>

                <div className="ticket-bets">
                  {/* Group recent ticket bets by game and draw time */}
                  {selectedRecentTicket.bets && Object.values(
                    selectedRecentTicket.bets.reduce((groups, bet) => {
                      const key = `${bet.game}_${bet.drawTime}`;
                      if (!groups[key]) {
                        groups[key] = {
                          game: bet.game,
                          drawTime: bet.drawTime,
                          bets: []
                        };
                      }
                      groups[key].bets.push(bet);
                      return groups;
                    }, {})
                  ).map((group, groupIndex) => (
                    <div key={groupIndex} className="bet-group">
                      <div className="group-header">
                        <div className="game-name">{group.game.toUpperCase()}</div>
                        <div className="draw-time">DRAW: {group.drawTime}</div>
                      </div>
                      {group.bets.map((bet, betIndex) => (
                        <div key={betIndex} className="bet-line">
                          <span className="bet-combo">{bet.combo}</span>
                          <span className="bet-amt">₱{bet.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="ticket-total">
                  <span>TOTAL AMOUNT</span>
                  <span>₱{selectedRecentTicket.total.toLocaleString()}</span>
                </div>

                <div className="qr">
                  <div className="qr-box">
                    {ticketQR ? (
                      <img 
                        src={ticketQR} 
                        alt="Ticket QR Code" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          imageRendering: 'pixelated',
                          display: 'block' 
                        }}
                      />
                    ) : (
                      <div className="qr-loading">Generating QR...</div>
                    )}
                  </div>
                  <div className="qr-text">SCAN TO VERIFY</div>
                </div>

                <div className="ticket-foot">
                  <div>KEEP THIS TICKET SAFE • PRESENT TO CLAIM WINNINGS</div>
                  <div>THIS TICKET IS VALID FOR 365 DAYS FROM DRAW DATE</div>
                  <div>FOR INQUIRIES: CALL PCSO HOTLINE 8-889-8889</div>
                  <div>RESPONSIBLE GAMING: PLAY WITHIN YOUR MEANS</div>
                </div>
              </div>
            </div>

            <div className="print-actions">
              <button className="print-btn-back" onClick={closeViewModal}>← Close</button>
              <button className="print-btn-print" onClick={() => window.print()}>Print Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default CreateTicket;