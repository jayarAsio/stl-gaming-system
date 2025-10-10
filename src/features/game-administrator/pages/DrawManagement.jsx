import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import '../styles/draw-management.css';

const DrawManagement = () => {
  const schedules = useMemo(() => ({
    pares: ['10:30 AM', '4:00 PM', '8:00 PM'],
    l2: ['3:00 PM', '7:00 PM'],
    l3: ['2:00 PM', '5:00 PM', '9:00 PM'],
    sw3: ['2:00 PM', '5:00 PM', '9:00 PM']
  }), []);

  const labels = useMemo(() => ({ 
    pares: 'STL Pares', 
    l2: 'Last 2', 
    l3: 'Last 3', 
    sw3: 'Swer3' 
  }), []);

  const DEMO_MULTIPLIERS = useMemo(() => ({ 
    pares: 700, 
    l2: 100, 
    l3: 100, 
    sw3: 100 
  }), []);

  const OPEN_LEAD_MIN = 15;
  const EDIT_LOCK_MIN = 60;

  const getLocalISODate = useCallback(() => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  }, []);

  const [localToday] = useState(getLocalISODate);
  const [currentDate, setCurrentDate] = useState(getLocalISODate);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounced localStorage save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('DMX_RESULTS_V1', JSON.stringify(results));
    }, 500);
    return () => clearTimeout(timer);
  }, [results]);

  const fmtDatePretty = useCallback((iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }), []);

  const parse12hToMinutes = useCallback((t12) => {
    const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(t12).trim());
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }, []);

  const nowMinutes = useCallback(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const randIn = useCallback((min, max) => Math.floor(Math.random() * (max - min + 1)) + min, []);
  const randPick = useCallback((arr) => arr[randIn(0, arr.length - 1)], [randIn]);
  const randTicket = useCallback(() => 'T' + Math.random().toString(36).slice(2, 10).toUpperCase(), []);

  const DEMO_TELLERS = useMemo(() => Array.from({ length: 24 }, (_, i) => `Teller ${i + 1}`), []);
  const DEMO_OUTLETS = useMemo(() => Array.from({ length: 30 }, (_, i) => `Outlet ${i + 1}`), []);

  const keyOf = useCallback((date, game, time) => `${date}__${game}__${time}`, []);
  const winnersKey = useCallback((date, game, time) => `DMX_WINNERS_V1__${date}__${game}__${time}`, []);
  const statsKey = useCallback((date, game, time) => `DMX_STATS_V1__${date}__${game}__${time}`, []);

  const getEntry = useCallback(
    (date, game, time) => {
      const raw = results[keyOf(date, game, time)];
      if (!raw) return null;
      if (typeof raw === 'string') return { v: raw, ts: null };
      if (typeof raw === 'object' && raw.v != null) return raw;
      return null;
    },
    [results, keyOf]
  );

  const setResult = useCallback((date, game, time, value) => {
    const k = keyOf(date, game, time);
    setResults(prev => {
      const newResults = { ...prev };
      if (value) newResults[k] = { v: value, ts: Date.now() };
      else delete newResults[k];
      return newResults;
    });
  }, [keyOf]);

  const formatResultFor = useCallback((game) => {
    if (game === 'pares') {
      const a = String(randIn(1, 40)).padStart(2, '0');
      let b = String(randIn(1, 40)).padStart(2, '0');
      if (b === a) b = String((parseInt(b, 10) % 40) + 1).padStart(2, '0');
      return `${a}.${b}`;
    }
    if (game === 'l2') return String(randIn(0, 99)).padStart(2, '0');
    if (game === 'l3' || game === 'sw3') return String(randIn(0, 999)).padStart(3, '0');
    return '—';
  }, [randIn]);

  const genDemoWinners = useCallback((game, time, result) => {
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
  }, [randIn, randPick, randTicket, DEMO_MULTIPLIERS, DEMO_OUTLETS, DEMO_TELLERS]);

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
    [localToday, parse12hToMinutes, nowMinutes]
  );

  const canEdit = useCallback((status) => status !== 'locked' && status !== 'upcoming', []);

  const computeInlineCounts = useCallback((dateISO, game, time) => {
    try {
      const winners = JSON.parse(localStorage.getItem(winnersKey(dateISO, game, time)) || '[]');
      const totalPayout = winners.reduce((s, w) => s + (+w?.prize || 0), 0);
      return { count: winners.length, payout: totalPayout };
    } catch {
      return { count: 0, payout: 0 };
    }
  }, [winnersKey]);

  // Seed demo data
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
    }
    localStorage.setItem(demoSeedKey, localToday);
  }, [localToday, schedules, parse12hToMinutes, nowMinutes, keyOf, formatResultFor, genDemoWinners, winnersKey, statsKey]);

  const gameValidators = useMemo(() => ({
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
  }), []);

  // Memoized stats for header
  const headerStats = useMemo(() => {
    const games = ['pares', 'l2', 'l3', 'sw3'];
    let totalDraws = 0;
    let publishedDraws = 0;
    let totalPayout = 0;
    let totalWinners = 0;

    games.forEach(game => {
      (schedules[game] || []).forEach(time => {
        totalDraws++;
        const entry = getEntry(currentDate, game, time);
        const status = computeStatus(currentDate, time, entry);
        
        if (status === 'published' || status === 'locked') {
          publishedDraws++;
          const counts = computeInlineCounts(currentDate, game, time);
          totalPayout += counts.payout;
          totalWinners += counts.count;
        }
      });
    });

    return {
      totalDraws,
      publishedDraws,
      totalPayout,
      totalWinners
    };
  }, [currentDate, schedules, getEntry, computeStatus, computeInlineCounts]);

  const openModal = useCallback((game, time) => {
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
  }, [currentDate, getEntry, computeStatus, canEdit, gameValidators, labels, schedules]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalData(null);
    setResultInput('');
  }, []);

  const submitResult = useCallback((e) => {
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
  }, [modalData, resultInput, currentDate, setResult, winnersKey, genDemoWinners, statsKey, closeModal]);

  const openWinnersDrawer = useCallback((game, time) => {
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
  }, [currentDate, winnersKey, getEntry, genDemoWinners, DEMO_MULTIPLIERS, statsKey, labels]);

  const closeWinnersDrawer = useCallback(() => {
    setWinnersDrawerOpen(false);
    setWinnersData(null);
  }, []);

  const sortWinners = useCallback((winners, state) => {
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
  }, []);

  const handleSort = useCallback((key) =>
    setSortState((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })), []);

  const filteredWinners = useMemo(() => {
    if (!winnersData) return [];
    let filtered = winnersData.winners;
    if (winnersSearch) {
      const q = winnersSearch.toLowerCase();
      filtered = filtered.filter((w) => `${w.teller} ${w.ticket} ${w.bet_amount} ${w.status} ${w.prize}`.toLowerCase().includes(q));
    }
    return sortWinners(filtered, sortState);
  }, [winnersData, winnersSearch, sortState, sortWinners]);

  const winnerStats = useMemo(() => {
    if (!winnersData) return null;
    return {
      totalTickets: winnersData.stats?.totalTickets || winnersData.winners.length,
      totalWinners: filteredWinners.length,
      totalPayout: filteredWinners.reduce((s, r) => s + (+r.prize || 0), 0),
      paid: filteredWinners.filter((r) => r.status === 'Paid').reduce((s, r) => s + (+r.prize || 0), 0),
      pending: filteredWinners.filter((r) => r.status === 'Pending').reduce((s, r) => s + (+r.prize || 0), 0)
    };
  }, [winnersData, filteredWinners]);

  // Body lock + blur
  useEffect(() => {
    const isOpen = modalOpen || winnersDrawerOpen;
    if (isOpen) {
      document.body.classList.add('dmx-lock', 'dmx-blur-bg');
    } else {
      document.body.classList.remove('dmx-lock', 'dmx-blur-bg');
    }

    return () => {
      document.body.classList.remove('dmx-lock', 'dmx-blur-bg');
    };
  }, [modalOpen, winnersDrawerOpen]);

  // Focus management
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
  }, [modalOpen, winnersDrawerOpen, closeModal, closeWinnersDrawer, submitResult]);

  const dateStatus = currentDate === localToday ? 'today' : currentDate < localToday ? 'archive' : 'future';
  const dateStatusText = dateStatus === 'today' ? 'Today' : dateStatus === 'archive' ? 'Archive' : 'Future';

  const { toggleSidebar, sidebarOpen } = useOutletContext() || {};
  const showMenuButton = typeof toggleSidebar === 'function';

  return (
    <div className="dmx">
      {/* Header - Reports Style */}
      <div className="dmx-header">
        <div className="dmx-header-content">
          <div className="dmx-header-main">
            {showMenuButton && (
              <button
                type="button"
                className="ga-mobile-menu-btn ga-mobile-menu-btn--inline"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={sidebarOpen ?? false}
                aria-controls="gaSidebar"
              >
                <span className="ga-menu-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            )}
            <div className="dmx-header-text">
              <h2 className="dmx-title">Draw Management</h2>
              <p className="dmx-subtitle">
                Manage lottery draws, results, and winner payouts
              </p>
            </div>
          </div>
          <div className="dmx-header-actions">
            <input
              className="dmx-date-input-header"
              type="date"
              value={currentDate}
              max={localToday}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
            <div className={`dmx-status-badge ${dateStatus}`}>
              <span className="dmx-status-dot" />
              <span>{dateStatusText}</span>
            </div>
          </div>
        </div>
        <div className="dmx-status-bar">
          <div className="dmx-stats-header">
            <div className="dmx-stat-item-header">
              <span className="dmx-stat-label-header">Total Draws</span>
              <span className="dmx-stat-value-header">{headerStats.totalDraws}</span>
            </div>
            <div className="dmx-stat-item-header">
              <span className="dmx-stat-label-header">Published</span>
              <span className="dmx-stat-value-header">{headerStats.publishedDraws}</span>
            </div>
            <div className="dmx-stat-item-header">
              <span className="dmx-stat-label-header">Total Winners</span>
              <span className="dmx-stat-value-header">{headerStats.totalWinners}</span>
            </div>
            <div className="dmx-stat-item-header">
              <span className="dmx-stat-label-header">Total Payout</span>
              <span className="dmx-stat-value-header">₱{headerStats.totalPayout.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="dmx-card">
        {/* Search */}
        <div className="dmx-filters">
          <div className="dmx-search-container">
            <input
              type="text"
              className="dmx-search-input"
              placeholder="Search draws, times, results…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="dmx-search-icon">🔍</div>
          </div>
        </div>

        {/* Game Tables */}
        {['pares', 'l2', 'l3', 'sw3'].map((game) => (
          <GameTable
            key={game}
            game={game}
            label={labels[game]}
            schedules={schedules[game]}
            currentDate={currentDate}
            fmtDatePretty={fmtDatePretty}
            getEntry={getEntry}
            computeStatus={computeStatus}
            computeInlineCounts={computeInlineCounts}
            debouncedSearch={debouncedSearch}
            canEdit={canEdit}
            onOpenModal={openModal}
            onOpenWinners={openWinnersDrawer}
          />
        ))}
      </div>

      {/* Modals */}
      <ResultModal
        open={modalOpen}
        data={modalData}
        input={resultInput}
        setInput={setResultInput}
        inputRef={resultInputRef}
        currentDate={currentDate}
        fmtDatePretty={fmtDatePretty}
        onClose={closeModal}
        onSubmit={submitResult}
      />

      <WinnersDrawer
        open={winnersDrawerOpen}
        data={winnersData}
        filteredWinners={filteredWinners}
        winnerStats={winnerStats}
        search={winnersSearch}
        setSearch={setWinnersSearch}
        onSort={handleSort}
        onClose={closeWinnersDrawer}
      />
    </div>
  );
};

// Separate Components for Performance
const GameTable = React.memo(({ 
  game, 
  label, 
  schedules, 
  currentDate, 
  fmtDatePretty, 
  getEntry, 
  computeStatus, 
  computeInlineCounts,
  debouncedSearch,
  canEdit,
  onOpenModal,
  onOpenWinners
}) => {
  return (
    <div className="dmx-game-section">
      <div className="dmx-game-header">
        <div className="dmx-game-title">{label}</div>
        <div className="dmx-game-date">
          Draw Date: <span>{fmtDatePretty(currentDate)}</span>
        </div>
      </div>
      <table className="dmx-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Results</th>
            <th>Payout</th>
            <th>Winners</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((time) => {
            const entry = getEntry(currentDate, game, time);
            const status = computeStatus(currentDate, time, entry);
            const showStats = status === 'published' || status === 'locked';
            const counts = showStats ? computeInlineCounts(currentDate, game, time) : { count: 0, payout: 0 };
            const value = entry?.v || '—';
            const isVisible = !debouncedSearch || `${time} ${status} ${value} ${label}`.toLowerCase().includes(debouncedSearch.toLowerCase());

            return (
              <tr key={time} style={{ display: isVisible ? '' : 'none' }}>
                <td className="dmx-td-time">{time}</td>
                <td>
                  <span className={`dmx-status-pill ${status}`}>
                    {status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="dmx-result-value">{value}</span>
                </td>
                <td>
                  {showStats ? (
                    <span className="dmx-inline-badge payout">💸 ₱{counts.payout.toLocaleString()}</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td>
                  <button className="dmx-winners-button" onClick={() => onOpenWinners(game, time)}>
                    👥 {counts.count}
                  </button>
                </td>
                <td>
                  <button
                    className="dmx-action-button"
                    onClick={() => onOpenModal(game, time)}
                    disabled={!canEdit(status)}
                  >
                    {status === 'published' ? 'Edit' : status === 'locked' ? 'View' : 'Enter'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

const ResultModal = React.memo(({ 
  open, 
  data, 
  input, 
  setInput, 
  inputRef, 
  currentDate, 
  fmtDatePretty, 
  onClose, 
  onSubmit 
}) => {
  if (!open || !data) return null;

  return createPortal(
    <>
      <div className={`dmx-modal-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <div className="dmx-modal">
        <div className="dmx-modal-panel">
          <div className="dmx-modal-header">
            <button className="dmx-modal-close" onClick={onClose}>×</button>
            <h3 className="dmx-modal-title">Enter Draw Result</h3>
            <div className="dmx-modal-meta">
              <span className="dmx-meta-tag">{fmtDatePretty(currentDate)}</span>
              <span className="dmx-meta-tag">{data.time}</span>
              <span className="dmx-meta-tag">{data.def.name}</span>
            </div>
          </div>
          <div className="dmx-modal-body">
            <label className="dmx-form-label">Enter Result</label>
            <input
              ref={inputRef}
              className="dmx-form-input"
              type="text"
              placeholder={data.def.format}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
            />
            <div className="dmx-form-help">{data.def.help}</div>
          </div>
          <div className="dmx-modal-footer">
            <button className="dmx-modal-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="dmx-modal-button primary" onClick={onSubmit}>
              Save Result
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

const WinnersDrawer = React.memo(({ 
  open, 
  data, 
  filteredWinners, 
  winnerStats, 
  search, 
  setSearch, 
  onSort, 
  onClose 
}) => {
  if (!open) return null;

  return createPortal(
    <>
      <div className={`dmx-winners-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <div className={`dmx-winners-drawer ${open ? 'active' : ''}`}>
        <div className="dmx-winners-header">
          <div className="dmx-winners-header-title">
            <div className="dmx-winners-title">Winners Details</div>
            <div className="dmx-winners-subtitle">
              {data?.gameName} • {data?.time}
            </div>
          </div>
          <div className="dmx-winners-header-actions">
            <button className="dmx-winners-print" onClick={() => window.print()}>
              Print
            </button>
            <button className="dmx-winners-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="dmx-winners-content">
          <section className="dmx-w-summary">
            <div className="dmx-summary-card">
              <div className="dmx-summary-value">{winnerStats?.totalTickets.toLocaleString()}</div>
              <div className="dmx-summary-label">Total Tickets</div>
            </div>
            <div className="dmx-summary-card">
              <div className="dmx-summary-value">{winnerStats?.totalWinners.toLocaleString()}</div>
              <div className="dmx-summary-label">Total Winners</div>
            </div>
            <div className="dmx-summary-card">
              <div className="dmx-summary-value">₱{winnerStats?.totalPayout.toLocaleString()}</div>
              <div className="dmx-summary-label">Total Payout</div>
            </div>
          </section>
          <section className="dmx-winners-controls">
            <input
              className="dmx-wc-input"
              type="search"
              placeholder="Search all winners…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>
          <section>
            <table className="dmx-winners-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => onSort('idx')}>#</th>
                  <th className="sortable" onClick={() => onSort('teller')}>Teller</th>
                  <th className="sortable" onClick={() => onSort('ticket')}>Ticket#</th>
                  <th className="sortable" onClick={() => onSort('bet_amount')}>Bet Amount</th>
                  <th className="sortable money" onClick={() => onSort('prize')}>Prize</th>
                  <th className="sortable status" onClick={() => onSort('status')}>Status</th>
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
                      <span className={`dmx-status-${(w.status || 'Paid').toLowerCase()}`}>{w.status || 'Paid'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="dmx-w-payouts">
            <div className="dmx-summary-card">
              <div className="dmx-summary-value">₱{winnerStats?.paid.toLocaleString()}</div>
              <div className="dmx-summary-label">Paid Out</div>
            </div>
            <div className="dmx-summary-card">
              <div className="dmx-summary-value">₱{winnerStats?.pending.toLocaleString()}</div>
              <div className="dmx-summary-label">Pending</div>
            </div>
          </section>
        </div>
      </div>
    </>,
    document.body
  );
});

export default DrawManagement;