import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/draw-management.css';

const DrawManagement = () => {
  const schedules = {
    pares: ['10:30 AM', '4:00 PM', '8:00 PM'],
    l2: ['3:00 PM', '7:00 PM'],
    l3: ['2:00 PM', '5:00 PM', '9:00 PM'],
    sw3: ['2:00 PM', '5:00 PM', '9:00 PM']
  };

  const labels = { pares: 'STL Pares', l2: 'Last 2', l3: 'Last 3', sw3: 'Swer3' };
  const DEMO_MULTIPLIERS = { pares: 700, l2: 100, l3: 100, sw3: 100 };
  const OPEN_LEAD_MIN = 15;
  const EDIT_LOCK_MIN = 60;

  // Local date helper (not UTC)
  const getLocalISODate = () => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  };

  const [localToday] = useState(getLocalISODate);
  const [currentDate, setCurrentDate] = useState(getLocalISODate);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('DMX_RESULTS_V1') || '{}');
    } catch {
      return {};
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [resultInput, setResultInput] = useState('');

  const [winnersDrawerOpen, setWinnersDrawerOpen] = useState(false);
  const [winnersData, setWinnersData] = useState(null);
  const [winnersSearch, setWinnersSearch] = useState('');
  const [sortState, setSortState] = useState({ key: 'idx', dir: 'asc' });

  const resultInputRef = useRef(null);

  const fmtDatePretty = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const parse12hToMinutes = (t12) => {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(t12).trim());
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

  const nowMinutes = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  const randIn = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randPick = (arr) => arr[randIn(0, arr.length - 1)];
  const randTicket = () => 'T' + Math.random().toString(36).slice(2, 10).toUpperCase();

  const DEMO_TELLERS = Array.from({ length: 24 }, (_, i) => `Teller ${i + 1}`);
  const DEMO_OUTLETS = Array.from({ length: 30 }, (_, i) => `Outlet ${i + 1}`);

  const keyOf = (date, game, time) => `${date}__${game}__${time}`;
  const winnersKey = (date, game, time) => `DMX_WINNERS_V1__${date}__${game}__${time}`;
  const statsKey = (date, game, time) => `DMX_STATS_V1__${date}__${game}__${time}`;

  const getEntry = useCallback(
    (date, game, time) => {
      const raw = results[keyOf(date, game, time)];
      if (!raw) return null;
      if (typeof raw === 'string') return { v: raw, ts: null };
      if (typeof raw === 'object' && raw.v != null) return raw;
      return null;
    },
    [results]
  );

  const setResult = (date, game, time, value) => {
    const k = keyOf(date, game, time);
    const newResults = { ...results };
    if (value) newResults[k] = { v: value, ts: Date.now() };
    else delete newResults[k];
    setResults(newResults);
    localStorage.setItem('DMX_RESULTS_V1', JSON.stringify(newResults));
  };

  const formatResultFor = (game) => {
    if (game === 'pares') {
      const a = String(randIn(1, 40)).padStart(2, '0');
      let b = String(randIn(1, 40)).padStart(2, '0');
      if (b === a) b = String((parseInt(b, 10) % 40) + 1).padStart(2, '0');
      return `${a}.${b}`;
    }
    if (game === 'l2') return String(randIn(0, 99)).padStart(2, '0');
    if (game === 'l3' || game === 'sw3') return String(randIn(0, 999)).padStart(3, '0');
    return '—';
  };

  const genDemoWinners = (game, time, result) => {
    const count = randIn(12, 36);
    const rows = [];
    const multiplier = DEMO_MULTIPLIERS[game] ?? 100;
    const betOptions = [1, 2, 5, 10, 20, 50];
    for (let i = 0; i < count; i++) {
      const bet_amount = randPick(betOptions);
      rows.push({
        outlet: randPick(DEMO_OUTLETS),
        teller: randPick(DEMO_TELLERS),
        ticket: randTicket(),
        result,
        bet_amount,
        prize: bet_amount * multiplier,
        status: Math.random() > 0.75 ? 'Pending' : 'Paid'
      });
    }
    return rows;
  };

  const computeStatus = useCallback(
    (dateISO, time12h, entry) => {
      const hasResult = !!(entry && entry.v);
      if (hasResult) {
        if (entry.ts && Date.now() >= entry.ts + EDIT_LOCK_MIN * 60 * 1000) return 'locked';
        return 'published';
      }
      if (dateISO > localToday) return 'upcoming';
      if (dateISO === localToday) {
        const slot = parse12hToMinutes(time12h);
        const openFrom = Math.max(0, slot - OPEN_LEAD_MIN);
        return nowMinutes() >= openFrom ? 'open' : 'upcoming';
      }
      return 'open';
    },
    [localToday]
  );

  const canEdit = (status) => status !== 'locked' && status !== 'upcoming';

  const computeInlineCounts = (dateISO, game, time) => {
    try {
      const winners = JSON.parse(localStorage.getItem(winnersKey(dateISO, game, time)) || '[]');
      const totalPayout = winners.reduce((s, w) => s + (+w?.prize || 0), 0);
      return { count: winners.length, payout: totalPayout };
    } catch {
      return { count: 0, payout: 0 };
    }
  };

  // Seed demo data for *local* today
  useEffect(() => {
    const demoSeedKey = 'DMX_DEMO_SEEDED_V1';
    const stamp = localStorage.getItem(demoSeedKey);
    if (stamp === localToday) return;

    const newResults = { ...results };
    let changed = false;

    Object.entries({
      pares: { schedules: schedules.pares },
      l2: { schedules: schedules.l2 },
      l3: { schedules: schedules.l3 },
      sw3: { schedules: schedules.sw3 }
    }).forEach(([game, def]) => {
      (def.schedules || []).forEach((time) => {
        const slotMin = parse12hToMinutes(time);
        if (nowMinutes() >= slotMin - OPEN_LEAD_MIN) {
          const k = keyOf(localToday, game, time);
          if (!newResults[k] || !newResults[k].v) {
            const val = formatResultFor(game);
            newResults[k] = { v: val, ts: Date.now() - Math.floor(Math.random() * 2000) };

            const winners = genDemoWinners(game, time, val);
            localStorage.setItem(winnersKey(localToday, game, time), JSON.stringify(winners));

            const min = Math.max(winners.length, 120);
            const max = Math.max(min + 1, 1200);
            const totalTickets = Math.floor(Math.random() * (max - min + 1)) + min;
            localStorage.setItem(statsKey(localToday, game, time), JSON.stringify({ totalTickets }));
            changed = true;
          }
        }
      });
    });

    if (changed) {
      setResults(newResults);
      localStorage.setItem('DMX_RESULTS_V1', JSON.stringify(newResults));
    }
    localStorage.setItem(demoSeedKey, localToday);
  }, [localToday, results]);

  // Validation rules per game
  const gameValidators = {
    pares: {
      format: '01.02',
      help: 'Enter two different numbers from 01-40, separated by a period (e.g., 05.23)',
      validate: (value) => {
        const match = /^(\d{2})\.(\d{2})$/.exec(value);
        if (!match) return false;
        const num1 = parseInt(match[1], 10);
        const num2 = parseInt(match[2], 10);
        if (num1 < 1 || num1 > 40 || num2 < 1 || num2 > 40) return false;
        if (num1 === num2) return false;
        return true;
      }
    },
    l2: {
      format: '00',
      help: 'Enter a 2-digit number from 00-99 (e.g., 05, 42, 99)',
      validate: (value) => /^\d{2}$/.test(value) && +value >= 0 && +value <= 99
    },
    l3: {
      format: '000',
      help: 'Enter a 3-digit number from 000-999 (e.g., 005, 123, 999)',
      validate: (value) => /^\d{3}$/.test(value) && +value >= 0 && +value <= 999
    },
    sw3: {
      format: '000',
      help: 'Enter a 3-digit number from 000-999 (e.g., 005, 123, 999)',
      validate: (value) => /^\d{3}$/.test(value) && +value >= 0 && +value <= 999
    }
  };

  const openModal = (game, time) => {
    setWinnersDrawerOpen(false);
    const entry = getEntry(currentDate, game, time);
    const status = computeStatus(currentDate, time, entry);
    if (!canEdit(status)) {
      alert(status === 'locked' ? 'Editing is locked an hour after the result is saved.' : 'This draw is upcoming and not editable yet.');
      return;
    }

    const validator = gameValidators[game] || gameValidators.l2;
    const def = {
      name: labels[game] || game,
      schedules: schedules[game],
      format: validator.format,
      help: validator.help,
      validate: validator.validate
    };

    setModalData({ game, time, def, entry });
    setResultInput(entry?.v || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
    setResultInput('');
  };

  const submitResult = (e) => {
    e.preventDefault();
    if (!modalData) return;

    const { game, time, def } = modalData;
    const value = resultInput.trim();

    if (value && def && typeof def.validate === 'function' && !def.validate(value)) {
      alert(`Invalid format. ${def.help}`);
      resultInputRef.current?.focus();
      return;
    }

    setResult(currentDate, game, time, value);

    if (value) {
      try {
        const existing = JSON.parse(localStorage.getItem(winnersKey(currentDate, game, time)) || '[]');
        if (!existing || existing.length === 0) {
          const winners = genDemoWinners(game, time, value);
          localStorage.setItem(winnersKey(currentDate, game, time), JSON.stringify(winners));

          const min = Math.max(winners.length, 120);
          const max = Math.max(min + 1, 1200);
          const totalTickets = Math.floor(Math.random() * (max - min + 1)) + min;
          localStorage.setItem(statsKey(currentDate, game, time), JSON.stringify({ totalTickets }));
        }
      } catch {}
    } else {
      localStorage.setItem(winnersKey(currentDate, game, time), '[]');
    }

    closeModal();
  };

  const openWinnersDrawer = (game, time) => {
    try {
      const key = winnersKey(currentDate, game, time);
      let winners = JSON.parse(localStorage.getItem(key) || '[]');
      const result = getEntry(currentDate, game, time)?.v || '—';

      if (!winners.length && result !== '—') {
        winners = genDemoWinners(game, time, result);
        localStorage.setItem(key, JSON.stringify(winners));
      }

      const multiplier = DEMO_MULTIPLIERS[game] ?? 100;
      winners = winners.map((r, i) => ({
        ...r,
        __i: i,
        bet_amount: r.bet_amount ?? (typeof r.bet === 'number' ? r.bet : 1),
        prize: r.prize ?? ((r.bet_amount || 1) * multiplier)
      }));

      let stats = null;
      try {
        stats = JSON.parse(localStorage.getItem(statsKey(currentDate, game, time)) || 'null');
      } catch {}

      if (!stats) {
        const min = Math.max(winners.length, 120);
        const max = Math.max(min + 1, 1200);
        const totalTickets = Math.floor(Math.random() * (max - min + 1)) + min;
        stats = { totalTickets };
        localStorage.setItem(statsKey(currentDate, game, time), JSON.stringify(stats));
      }

      setWinnersData({ game, time, winners, stats, gameName: labels[game] || game });
      setWinnersSearch('');
      setSortState({ key: 'idx', dir: 'asc' });
      setWinnersDrawerOpen(true);
    } catch (e) {
      console.error('Error opening winners drawer:', e);
    }
  };

  const closeWinnersDrawer = () => {
    setWinnersDrawerOpen(false);
    setWinnersData(null);
  };

  const sortWinners = (winners, state) => {
    const { key, dir } = state;
    const normalizeForSort = (row, k) => {
      if (k === 'idx') return row.__i ?? 0;
      if (k === 'prize') return +row.prize || 0;
      if (k === 'bet_amount') return +row.bet_amount || 0;
      if (k === 'status') {
        const m = { Pending: 0, Paid: 1 };
        return m[row.status] ?? 2;
      }
      return String(row[k] ?? '').toLowerCase();
    };

    if (key === 'idx') return [...winners].sort((a, b) => (a.__i - b.__i) * (dir === 'asc' ? 1 : -1));

    const sign = dir === 'asc' ? 1 : -1;
    return [...winners].sort((a, b) => {
      const av = normalizeForSort(a, key);
      const bv = normalizeForSort(b, key);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv), 'en', { numeric: true, sensitivity: 'base' }) * sign;
    });
  };

  const handleSort = (key) =>
    setSortState((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const getFilteredWinners = () => {
    if (!winnersData) return [];
    let filtered = winnersData.winners;
    if (winnersSearch) {
      const q = winnersSearch.toLowerCase();
      filtered = filtered.filter((w) => `${w.teller} ${w.ticket} ${w.bet_amount} ${w.status} ${w.prize}`.toLowerCase().includes(q));
    }
    return sortWinners(filtered, sortState);
  };

  const filteredWinners = getFilteredWinners();

  const winnerStats = winnersData
    ? {
        totalTickets: winnersData.stats?.totalTickets || winnersData.winners.length,
        totalWinners: filteredWinners.length,
        totalPayout: filteredWinners.reduce((s, r) => s + (+r.prize || 0), 0),
        paid: filteredWinners.filter((r) => r.status === 'Paid').reduce((s, r) => s + (+r.prize || 0), 0),
        pending: filteredWinners.filter((r) => r.status === 'Pending').reduce((s, r) => s + (+r.prize || 0), 0)
      }
    : null;

  // Body lock + blur when any portal UI is open
  useEffect(() => {
    const isOpen = modalOpen || winnersDrawerOpen;
    document.body.classList.toggle('dmx-lock', isOpen);
    document.body.classList.toggle('dmx-blur-bg', isOpen);

    return () => {
      document.body.classList.remove('dmx-lock', 'dmx-blur-bg');
    };
  }, [modalOpen, winnersDrawerOpen]);

  // Focus management for modal
  useEffect(() => {
    if (modalOpen && resultInputRef.current) {
      setTimeout(() => resultInputRef.current?.focus(), 120);
    }
  }, [modalOpen]);

  // Keyboard handlers
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) closeModal();
        else if (winnersDrawerOpen) closeWinnersDrawer();
      }
    };

    const handleEnter = (e) => {
      if (e.key === 'Enter' && modalOpen && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        submitResult(e);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleEnter);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleEnter);
    };
  }, [modalOpen, winnersDrawerOpen]);

  const dateStatus = currentDate === localToday ? 'today' : currentDate < localToday ? 'archive' : 'future';
  const dateStatusText = dateStatus === 'today' ? 'Today' : dateStatus === 'archive' ? 'Archive' : 'Future';

  return (
    <div className="dmx">
      <div className="dmx-wrap">
        <section className="game-card">
          <div className="card-section">
            <div className="filters">
              <div className="search-section">
                <label className="search-label" htmlFor="dmx-search">
                  Search Draws
                </label>
                <div className="search-container">
                  <input
                    id="dmx-search"
                    type="text"
                    className="search-input"
                    placeholder="Search draws, times, results…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="search-icon" aria-hidden>
                    🔍
                  </div>
                </div>
              </div>
              <div className="date-section">
                <label className="date-label" htmlFor="dmx-date">
                  Select Date
                </label>
                <div className="date-controls">
                  <input
                    id="dmx-date"
                    className="date-input"
                    type="date"
                    value={currentDate}
                    max={localToday}
                    onChange={(e) => setCurrentDate(e.target.value)}
                  />
                  <div className={`status-badge ${dateStatus}`}>
                    <span className="status-dot" />
                    <span>{dateStatusText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {['pares', 'l2', 'l3', 'sw3'].map((game) => (
            <div key={game} className="card-section game-block" data-game={game}>
              <header className="game-header">
                <div className="game-title">{labels[game]}</div>
                <div className="game-date">
                  Draw Date: <span className="js-card-date">{fmtDatePretty(currentDate)}</span>
                </div>
              </header>
              <table className="game-table" role="grid">
                <thead>
                  <tr>
                    <th>Draw Time</th>
                    <th>Status</th>
                    <th>Results</th>
                    <th>Payout</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules[game].map((time) => {
                    const entry = getEntry(currentDate, game, time);
                    const status = computeStatus(currentDate, time, entry);

                    // Keep winners/payout visible when LOCKED too
                    const showStats = status === 'published' || status === 'locked';
                    const counts = showStats ? computeInlineCounts(currentDate, game, time) : { count: 0, payout: 0 };

                    const value = entry?.v || '—';
                    const isVisible =
                      !searchQuery || `${time} ${status} ${value} ${labels[game]}`.toLowerCase().includes(searchQuery.toLowerCase());

                    return (
                      <tr
                        key={time}
                        className="time-slot"
                        data-game={game}
                        data-time={time}
                        style={{ display: isVisible ? '' : 'none' }}
                      >
                        <td className="td-time" data-label="Draw Time">
                          <div className="cell cell-time">{time}</div>
                        </td>
                        <td className="td-status" data-label="Status">
                          <div className="cell">
                            <span className={`slot-status ${status}`} data-status={status}>
                              {status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="td-result" data-label="Results">
                          <div className="cell">
                            <span className="result-value">{value}</span>
                          </div>
                        </td>
                        <td className="td-payout" data-label="Payout">
                          <div className="cell">
                            {showStats ? (
                              <span className="inline-badge payout">💸 ₱{counts.payout.toLocaleString()}</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                        <td className="td-winners-count" data-label="Details">
                          <div className="cell">
                            <button type="button" className="winners-button" onClick={() => openWinnersDrawer(game, time)}>
                              👥 Winners ({counts.count})
                            </button>
                          </div>
                        </td>
                        <td className="td-actions" data-label="Actions">
                          <div className="cell cell-actions">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => openModal(game, time)}
                              disabled={!canEdit(status)}
                            >
                              {status === 'published' ? 'Edit Result' : status === 'locked' ? 'View Result' : 'Enter Result'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </div>

      {/* MODAL (portaled) */}
      {modalOpen &&
        modalData &&
        createPortal(
          <>
            <div className={`dmx-modal-overlay ${modalOpen ? 'active' : ''}`} onClick={closeModal} />
            <div className="dmx-modal" role="dialog" aria-modal="true" aria-labelledby="dmx-modal-title">
              <div className="modal-panel">
                <div className="modal-header">
                  <button type="button" className="modal-close" onClick={closeModal}>
                    ×
                  </button>
                  <h3 id="dmx-modal-title" className="modal-title">
                    Enter Draw Result
                  </h3>
                  <div className="modal-meta">
                    <span className="meta-tag">{fmtDatePretty(currentDate)}</span>
                    <span className="meta-tag">{modalData.time}</span>
                    <span className="meta-tag">{modalData.def.name}</span>
                  </div>
                </div>
                <div className="modal-body">
                  <label className="form-label" htmlFor="dmx-input">
                    Enter Result
                  </label>
                  <input
                    ref={resultInputRef}
                    id="dmx-input"
                    className="form-input"
                    type="text"
                    placeholder={modalData.def.format}
                    value={resultInput}
                    onChange={(e) => setResultInput(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="form-help">{modalData.def.help}</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="modal-button secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="modal-button primary" onClick={submitResult}>
                    Save Result
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* WINNERS DRAWER (portaled) */}
      {winnersDrawerOpen &&
        createPortal(
          <>
            <div className={`dmx-winners-overlay ${winnersDrawerOpen ? 'active' : ''}`} onClick={closeWinnersDrawer} />
            <div className={`dmx-winners-drawer ${winnersDrawerOpen ? 'active' : ''}`}>
              <div className="winners-header">
                <div className="winners-header-title">
                  <div className="winners-title">Winners Details</div>
                  <div className="winners-subtitle">
                    {winnersData?.gameName} • {winnersData?.time}
                  </div>
                </div>
                <div className="winners-header-actions">
                  <button type="button" className="winners-print" onClick={() => window.print()}>
                    Print
                  </button>
                  <button type="button" className="winners-close" onClick={closeWinnersDrawer}>
                    ×
                  </button>
                </div>
              </div>
              <div className="winners-content">
                <section className="w-summary">
                  <div className="summary-card">
                    <div className="summary-value">{winnerStats?.totalTickets.toLocaleString()}</div>
                    <div className="summary-label">Total Tickets</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{winnerStats?.totalWinners.toLocaleString()}</div>
                    <div className="summary-label">Total Winners</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">₱{winnerStats?.totalPayout.toLocaleString()}</div>
                    <div className="summary-label">Total Payout</div>
                  </div>
                </section>
                <section className="winners-controls">
                  <input
                    className="wc-input"
                    type="search"
                    placeholder="Search all winners…"
                    value={winnersSearch}
                    onChange={(e) => setWinnersSearch(e.target.value)}
                  />
                </section>
                <section>
                  <table className="winners-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort('idx')}>
                          #
                        </th>
                        <th className="sortable" onClick={() => handleSort('teller')}>
                          Teller
                        </th>
                        <th className="sortable" onClick={() => handleSort('ticket')}>
                          Ticket#
                        </th>
                        <th className="sortable" onClick={() => handleSort('bet_amount')}>
                          Bet Amount
                        </th>
                        <th className="sortable money" onClick={() => handleSort('prize')}>
                          Prize
                        </th>
                        <th className="sortable status" onClick={() => handleSort('status')}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWinners.map((w, idx) => (
                        <tr key={`${w.ticket}-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>{w.teller}</td>
                          <td>{w.ticket}</td>
                          <td className="money">₱{Number(w.bet_amount || 0).toLocaleString()}</td>
                          <td className="money">₱{Number(w.prize || 0).toLocaleString()}</td>
                          <td className="status">
                            <span className={`status-${(w.status || 'Paid').toLowerCase()}`}>{w.status || 'Paid'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="w-payouts">
                  <div className="summary-card">
                    <div className="summary-value">₱{winnerStats?.paid.toLocaleString()}</div>
                    <div className="summary-label">Paid Out</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">₱{winnerStats?.pending.toLocaleString()}</div>
                    <div className="summary-label">Pending</div>
                  </div>
                </section>
                <section className="w-card logs-card">
                  <div className="w-audit-row">
                    <strong>Result Published:</strong>
                    <span>Admin User • {new Date().toLocaleString()}</span>
                  </div>
                  <div className="w-audit-row">
                    <strong>Winners Calculated:</strong>
                    <span>System • {new Date().toLocaleString()}</span>
                  </div>
                  <div className="w-audit-row">
                    <strong>Last Modified:</strong>
                    <span>Admin User • {new Date().toLocaleString()}</span>
                  </div>
                </section>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default DrawManagement;
