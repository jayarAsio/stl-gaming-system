import React, { useState, useMemo, useRef } from 'react';
import '../styles/daily-ledgers.css';

const DailyLedgersPage = () => {
  // Helper: local YYYY-MM-DD (avoids timezone off-by-one)
  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());

  // Filters
  const [selectedArea, setSelectedArea] = useState('none');
  const [selectedCollector, setSelectedCollector] = useState('none');
  const [selectedAgent, setSelectedAgent] = useState('none'); // "No agent Selected"
  const [searchQuery, setSearchQuery] = useState('');

  // Show nothing by default; only after Generate
  const [showPreview, setShowPreview] = useState(false);

  const [generatingReport, setGeneratingReport] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);

  // For stable ordering of manual rows added during this session
  const manualSeqRef = useRef(0);

  // Reference data
  const areas = {
    'AREA-01': {
      name: 'Area 1 - Downtown',
      tellers: ['CPZ-00016 - RELANO, VIC', 'CPZ-00020 - SANTOS, MARIA'],
      collector: 'COL-01 - CRUZ, PEDRO',
    },
    'AREA-02': {
      name: 'Area 2 - Uptown',
      tellers: [],
      collector: 'COL-02 - REYES, MARIA',
    },
  };

  const collectors = [
    { id: 'COL-01', name: 'COL-01 - CRUZ, PEDRO', area: 'AREA-01' },
    { id: 'COL-02', name: 'COL-02 - REYES, MARIA', area: 'AREA-02' },
  ];

  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
    setSelectedCollector('none'); // mutual exclusivity: area vs collector
  };

  const handleCollectorChange = (collectorId) => {
    setSelectedCollector(collectorId);
    setSelectedArea('none'); // mutual exclusivity: collector vs area
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setShowPreview(true);
      setGeneratingReport(false);
    }, 250);
  };

  const handlePrint = () => window.print();

  // ==== Manual entry ====
  const [manualEntry, setManualEntry] = useState({
    date: todayISO(),
    agent: '',
    transType: 'DEFICIT', // Tapada → Deficit
    description: '',
    amount: '',
    amountType: 'debit',
  });

  const toggleManualEntryModal = () => {
    setManualEntry(m => ({
      ...m,
      agent: selectedAgent !== 'none' ? selectedAgent : (m.agent || ''),
      date: m.date || todayISO(),
    }));
    setShowManualEntryModal(v => !v);
  };

  // ==== Seed data (2 tellers × 1 week) ====
  // - Every SALES has a NET for the same draw (2pm & 7pm)
  // - PAYOUTs can occur at 2pm and 7pm (both included)
  const weekDates = ['2025-10-01','2025-10-02','2025-10-03','2025-10-04','2025-10-05','2025-10-06','2025-10-07'];

  const openingBalancesSeed = {};
  weekDates.forEach(d => {
    openingBalancesSeed[d] = { 'CPZ-00016': 0, 'CPZ-00020': 0, 'CPZ-00025': 0 };
  });

  // Build one day's rows for a teller
  const mkDay = (date, teller, agentId, base2pm, base7pm, hits2Qty, hits2Mult, hits7Qty, hits7Mult) => ([
    // 2pm SALES + NET
    {
      id: `${agentId}-S2PM-${date}`, date, time: '13:45:00', drawTime: '2pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'SALES', description: 'Game Sales - STL PARES',
      debit: base2pm, credit: 0, game: 'STL PARES', hits: '-',
    },
    {
      id: `${agentId}-N2PM-${date}`, date, time: '14:05:00', drawTime: '2pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'NET', description: 'Net Commission (15%)',
      debit: 0, credit: Math.round(base2pm * 0.15 * 100) / 100, game: '-', hits: '-',
    },
    // PAYOUT @ 2pm
    {
      id: `${agentId}-P2PM-${date}`, date, time: '14:30:00', drawTime: '2pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'PAYOUT', description: 'Winning Payouts (2pm)',
      debit: 0, credit: hits2Qty * hits2Mult, game: '-', hits: `${hits2Qty}*${hits2Mult}`,
    },

    // 7pm SALES + NET
    {
      id: `${agentId}-S7PM-${date}`, date, time: '19:05:00', drawTime: '7pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'SALES', description: 'Game Sales - STL PARES',
      debit: base7pm, credit: 0, game: 'STL PARES', hits: '-',
    },
    {
      id: `${agentId}-N7PM-${date}`, date, time: '19:20:00', drawTime: '7pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'NET', description: 'Net Commission (15%)',
      debit: 0, credit: Math.round(base7pm * 0.15 * 100) / 100, game: '-', hits: '-',
    },
    // PAYOUT @ 7pm
    {
      id: `${agentId}-P7PM-${date}`, date, time: '19:35:00', drawTime: '7pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'PAYOUT', description: 'Winning Payouts (7pm)',
      debit: 0, credit: hits7Qty * hits7Mult, game: '-', hits: `${hits7Qty}*${hits7Mult}`,
    },

    // Remittance at end of day
    {
      id: `${agentId}-R-${date}`, date, time: '20:30:00', drawTime: '7pm',
      agent: teller, agentId, type: 'Teller', area: 'AREA-01',
      transType: 'REMITTANCE', description: 'Remittance to Collector',
      debit: 0, credit: Math.round((base2pm + base7pm) * 0.7 * 100) / 100, game: '-', hits: '-',
    },
  ]);

  const seededRows = [];
  weekDates.forEach((d, i) => {
    const b1_2pm = 1800 + i * 50;
    const b1_7pm = 1500 + i * 45;
    const b2_2pm = 1600 + i * 45;
    const b2_7pm = 1400 + i * 40;

    const h2pm_1_qty = 20 + i * 2, h2pm_1_mult = 500;
    const h7pm_1_qty = 30 + i * 2, h7pm_1_mult = 700;

    const h2pm_2_qty = 15 + i * 3, h2pm_2_mult = 450;
    const h7pm_2_qty = 18 + i * 2, h7pm_2_mult = 600;

    seededRows.push(
      ...mkDay(d, 'CPZ-00016 - RELANO, VIC', 'CPZ-00016', b1_2pm, b1_7pm, h2pm_1_qty, h2pm_1_mult, h7pm_1_qty, h7pm_1_mult),
      ...mkDay(d, 'CPZ-00020 - SANTOS, MARIA', 'CPZ-00020', b2_2pm, b2_7pm, h2pm_2_qty, h2pm_2_mult, h7pm_2_qty, h7pm_2_mult)
    );
  });

  const [ledgerData, setLedgerData] = useState(seededRows);

  // ==== Helpers ====
  const getAllTellers = () => {
    const all = Object.values(areas).flatMap(a => a.tellers);
    return [...new Set(all)];
  };

  const getTellersByArea = (areaId) => {
    if (areaId === 'none' || areaId === 'all') return getAllTellers();
    return areas[areaId]?.tellers || [];
  };

  const getTellersByCollector = (collectorId) => {
    if (collectorId === 'none' || collectorId === 'all') return getAllTellers();
    const collector = collectors.find(c => c.id === collectorId);
    if (!collector) return [];
    return areas[collector.area]?.tellers || [];
  };

  const getFilteredAgents = () => {
    if (selectedAgent !== 'none') return [selectedAgent];
    if (selectedArea !== 'none') return getTellersByArea(selectedArea);
    if (selectedCollector !== 'none') return getTellersByCollector(selectedCollector);
    return getAllTellers();
  };

  // Only compute filtered data if preview is enabled (after Generate)
  const filteredData = useMemo(() => {
    if (!showPreview) return [];
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const tellers = getFilteredAgents();
    const q = searchQuery.toLowerCase();

    return ledgerData
      .filter(item => {
        const itemDate = new Date(item.date);
        const matchesDateRange = itemDate >= fromDate && itemDate <= toDate;

        const isTellerMatch = tellers.includes(item.agent);
        const isCollectorInScope = false; // Collectors are excluded from ledgers

        const matchesAgent = (selectedAgent !== 'none') ? isTellerMatch : isTellerMatch;

        const matchesSearch =
          item.agent.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.transType.toLowerCase().includes(q);

        return matchesDateRange && matchesAgent && matchesSearch;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [showPreview, ledgerData, dateFrom, dateTo, selectedAgent, selectedArea, selectedCollector, searchQuery]);

  // Opening helper
  const getOpeningBalanceForDate = (date, agentStr) => {
    const agentId = (agentStr || '').split(' - ')[0];
    return openingBalancesSeed[date]?.[agentId] ?? 0;
  };

  // Running balances with carry-over (only when previewing)
  const calculateRunningBalancesPerAgent = (dayData, date, prevClosings = {}) => {
    const agentIds = [...new Set(dayData.map(d => d.agentId))];

    const runs = {};
    agentIds.forEach(id => {
      const label = dayData.find(d => d.agentId === id)?.agent || id;
      const carryIn = prevClosings[id];
      runs[id] = (carryIn !== undefined) ? carryIn : (getOpeningBalanceForDate(date, label) || 0);
    });

    const openingSum = agentIds.reduce((sum, id) => sum + (runs[id] ?? 0), 0);

    // IMPORTANT: order inside the day keeps all manual entries LAST.
    const ordered = dayData.slice().sort((a, b) => {
      const aMan = !!a.manual, bMan = !!b.manual;
      if (aMan !== bMan) return aMan ? 1 : -1; // non-manual first, manual last
      const t = a.time.localeCompare(b.time);
      if (t !== 0) return t;
      // preserve insertion order among manuals if same time
      const aSeq = a.manualSeq ?? 0, bSeq = b.manualSeq ?? 0;
      return aSeq - bSeq;
    });

    const withBalances = ordered.map(item => {
      const id = item.agentId;
      const next = (runs[id] ?? 0) + item.debit - item.credit;
      runs[id] = next;
      return { ...item, balance: next };
    });

    const closingMap = { ...runs };
    const closingSum = agentIds.reduce((s, id) => s + (closingMap[id] ?? 0), 0);

    return { withBalances, openingSum, closingSum, closingMap };
  };

  // Group by date AND agent (for individual teller display when area is selected)
  const groupedByDateAndAgent = filteredData.reduce((groups, item) => {
    const key = `${item.date}___${item.agentId}`;
    if (!groups[key]) groups[key] = { date: item.date, agentId: item.agentId, agent: item.agent, items: [] };
    groups[key].items.push(item);
    return groups;
  }, {});

  const sortedKeys = Object.keys(groupedByDateAndAgent).sort((a, b) => {
    const [dateA, agentA] = a.split('___');
    const [dateB, agentB] = b.split('___');
    const dateComp = new Date(dateA) - new Date(dateB);
    if (dateComp !== 0) return dateComp;
    return agentA.localeCompare(agentB);
  });

  let rollingClosings = {}; // agentId -> closing
  const daysWithBalances = sortedKeys.map(key => {
    const group = groupedByDateAndAgent[key];
    const { date, agentId, agent, items } = group;
    
    const { withBalances, openingSum, closingSum, closingMap } =
      calculateRunningBalancesPerAgent(items, date, { [agentId]: rollingClosings[agentId] });
    rollingClosings = { ...rollingClosings, ...closingMap };

    const dayDebit = withBalances.reduce((sum, item) => sum + item.debit, 0);
    const dayCredit = withBalances.reduce((sum, item) => sum + item.credit, 0);

    return {
      date,
      agentId,
      agent,
      data: withBalances,
      openingBalance: openingSum,
      closingBalance: closingSum,
      dayDebit,
      dayCredit,
    };
  });

  const totalDebit = filteredData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = filteredData.reduce((sum, item) => sum + item.credit, 0);

  // Badge class mapping (Deficit uses Tapada badge style)
  const getTransTypeClass = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'SALES': return 'trans-sales';
      case 'NET': return 'trans-net';
      case 'PAYOUT': return 'trans-payout';
      case 'REMITTANCE': return 'trans-remittance';
      case 'COLLECTION': return 'trans-collection';
      case 'DEFICIT': return 'trans-tapada';
      case 'FORCE BALANCE': return 'trans-force';
      default: return '';
    }
  };

  // Encoder mapping - Shows who encoded each transaction type
  const getEncoderByType = (type, agentId, isManual = false) => {
    // All manual entries are encoded by Operation Support
    if (isManual) return 'Maria Santos'; // Operation Support Staff
    
    const t = (type || '').toUpperCase();
    if (t === 'SALES') return 'System';
    if (t === 'NET') return 'Juan Dela Cruz'; // Game Administrator
    if (t === 'PAYOUT') return 'Juan Dela Cruz'; // Game Administrator
    if (t === 'DEFICIT') return getCollectorName(agentId); // Collector's name
    if (t === 'REMITTANCE') return getCollectorName(agentId); // Collector's name
    if (t === 'FORCE BALANCE') return 'Maria Santos'; // Operation Support
    return '-';
  };

  // Helper to get collector name based on teller's area
  const getCollectorName = (tellerId) => {
    // Find which area this teller belongs to
    for (const [areaId, areaData] of Object.entries(areas)) {
      if (areaData.tellers.some(t => t.startsWith(tellerId))) {
        return areaData.collector;
      }
    }
    return 'COL-01 - CRUZ, PEDRO'; // Default collector
  };

  const formatCurrency = (amount) =>
    (amount < 0 ? '-' : '') +
    '₱' +
    Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ==== Manual Entry submit (simplified for debit/credit only) ====
  const handleManualEntrySubmit = (e) => {
    e.preventDefault();
    const { date, transType, description, amount, amountType } = manualEntry;

    // Focus only to the selected teller (if chosen)
    const agent = selectedAgent !== 'none' ? selectedAgent : manualEntry.agent;
    if (!agent) return;

    const agentId = agent.split(' - ')[0];
    const area = Object.keys(areas).find(a => areas[a].tellers.includes(agent)) || 'AREA-01';
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];

    const itemsToAdd = [];
    const amt = parseFloat(amount || '0') || 0;

    // All manual entries are simple debit or credit transactions
    const debit = amountType === 'debit' ? amt : 0;
    const credit = amountType === 'credit' ? amt : 0;

    itemsToAdd.push({
      id: `L${Math.floor(Math.random() * 100000)}`,
      date, time, drawTime: '-', agent, agentId, area, type: 'Teller',
      transType: (transType || 'DEFICIT').toUpperCase(),
      description: description || '-',
      debit, credit, game: '-', hits: '-',
      manual: true,
      manualSeq: manualSeqRef.current++,
    });

    setLedgerData(prev => [...prev, ...itemsToAdd]);

    setShowManualEntryModal(false);
    setManualEntry({
      date: todayISO(),
      agent: selectedAgent !== 'none' ? selectedAgent : '',
      transType: 'DEFICIT',
      description: '',
      amount: '',
      amountType: 'debit',
    });
  };

  // Agent options in filter
  const agentOptions = (selectedArea !== 'none'
    ? getTellersByArea(selectedArea)
    : selectedCollector !== 'none'
      ? getTellersByCollector(selectedCollector)
      : getAllTellers());

  return (
    <div className="os-ledgers-container">

      {/* Header */}
      <header className="os-ledgers-header no-print">
        <div className="os-ledgers-header-content">
          <div className="os-ledgers-header-main">
            <span className="os-ledgers-icon">📒</span>
            <div className="os-ledgers-header-text">
              <h1 className="os-ledgers-title">Daily Ledgers</h1>
              <p className="os-ledgers-subtitle">Generate and review daily ledgers per area, teller, and collector.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="os-ledgers-filters-card no-print">
        <div className="os-ledgers-filters">
          <div className="os-filter-group">
            <label className="os-filter-label">Date from</label>
            <input type="date" className="os-date-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="os-filter-group">
            <label className="os-filter-label">Date to</label>
            <input type="date" className="os-date-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          <div className="os-filter-group">
            <label className="os-filter-label">Filter by Area</label>
            <select className="os-select-input" value={selectedArea} onChange={(e) => handleAreaChange(e.target.value)}>
              <option value="none">No selected Area</option>
              {Object.keys(areas).map(areaId => (
                <option key={areaId} value={areaId}>{areas[areaId].name}</option>
              ))}
            </select>
          </div>

          <div className="os-filter-group">
            <label className="os-filter-label">Filter by Collector</label>
            <select className="os-select-input" value={selectedCollector} onChange={(e) => handleCollectorChange(e.target.value)}>
              <option value="none">No selected Collector</option>
              {collectors.map(collector => (
                <option key={collector.id} value={collector.id}>{collector.name}</option>
              ))}
            </select>
          </div>

          <div className="os-filter-group">
            <label className="os-filter-label">Specific Agent</label>
            <select className="os-select-input" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              <option value="none">No agent Selected</option>
              {agentOptions.map((agent, index) => (
                <option key={index} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          <div className="os-filter-group os-filter-search">
            <label className="os-filter-label">Search</label>
            <div className="os-search-wrapper">
              <span className="os-search-icon">🔎</span>
              <input
                type="text"
                className="os-search-input"
                placeholder="Search agent, description, or transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="os-ledgers-actions">
          <button className="os-btn-generate" onClick={handleGenerateReport} disabled={generatingReport}>
            <span>⚙️</span><span>{generatingReport ? 'Generating…' : 'Generate'}</span>
          </button>
          <button className="os-btn-manual" onClick={toggleManualEntryModal}>
            <span>➕</span><span>Manual Entry</span>
          </button>
          <button className="os-btn-print" onClick={handlePrint}>
            <span>🖨️</span><span>Print</span>
          </button>
          <button className="os-btn-export">
            <span>⬇️</span><span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Preview or Placeholder */}
      {showPreview ? (
        <section className="os-ledgers-preview-card">
          <div className="os-ledgers-summary no-print">
            <div className="os-summary-header">
              <h2 className="os-summary-title">Summary</h2>
              <div className="os-summary-date">{dateFrom} → {dateTo}</div>
            </div>
            <div className="os-summary-grid">
              <div className="os-summary-stat"><span className="os-stat-label">Total Debit</span><span className="os-stat-value debit">{formatCurrency(totalDebit)}</span></div>
              <div className="os-summary-stat"><span className="os-stat-label">Total Credit</span><span className="os-stat-value credit">{formatCurrency(totalCredit)}</span></div>
              <div className="os-summary-stat"><span className="os-stat-label">Agents in Scope</span><span className="os-stat-value">{getFilteredAgents().length}</span></div>
              <div className="os-summary-stat"><span className="os-stat-label">Days</span><span className="os-stat-value">{daysWithBalances.length}</span></div>
            </div>
          </div>

          <div className="os-ledgers-content">
            {daysWithBalances.map((day, idx) => (
              <div className="os-day-section" key={idx}>
                <div className="os-day-header">
                  <div>
                    <h3 className="os-day-title">{new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <p className="os-day-agent-label">{day.agent}</p>
                  </div>
                  <div className="os-day-stats">
                    <div className="os-day-stat">
                      <span className="os-day-stat-label">Opening:</span>
                      <span className={`os-day-stat-value ${day.openingBalance < 0 ? 'negative' : 'positive'}`}>{formatCurrency(day.openingBalance)}</span>
                    </div>
                    <div className="os-day-stat">
                      <span className="os-day-stat-label">Closing:</span>
                      <span className={`os-day-stat-value ${day.closingBalance < 0 ? 'negative' : 'positive'}`}>{formatCurrency(day.closingBalance)}</span>
                    </div>
                  </div>
                </div>

                <div className="os-ledgers-table-wrapper">
                  <table className="os-ledgers-table os-compact">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Draw</th>
                        <th>Agent</th>
                        <th>Transaction</th>
                        <th>Description</th>
                        <th>Hits</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                        <th className="no-print">Encoder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.openingBalance !== 0 && (
                        <tr className="os-opening-row">
                          <td className="os-td-time">-</td>
                          <td className="os-td-draw">-</td>
                          <td className="os-td-agent-compact">-</td>
                          <td className="os-td-trans"><span className="os-trans-badge trans-collection">OPEN</span></td>
                          <td className="os-td-desc">OPENING BALANCE</td>
                          <td className="os-td-hits">-</td>
                          <td className="os-td-debit">-</td>
                          <td className="os-td-credit">-</td>
                          <td className={`os-td-balance ${day.openingBalance < 0 ? 'negative' : 'positive'}`}>{formatCurrency(day.openingBalance)}</td>
                          <td className="no-print">-</td>
                        </tr>
                      )}

                      {day.data.map((item) => {
                        const debitClass = item.debit < 0 ? 'negative' : '';
                        const creditClass = item.credit < 0 ? 'negative' : '';
                        const balanceClass = item.balance < 0 ? 'negative' : 'positive';

                        return (
                          <tr key={item.id}>
                            <td className="os-td-time">{item.time}</td>
                            <td className="os-td-draw">{item.drawTime}</td>
                            <td className="os-td-agent-compact">{item.agent}</td>
                            <td className="os-td-trans">
                              <span className={`os-trans-badge ${getTransTypeClass(item.transType)}`}>{item.transType}</span>
                            </td>
                            <td className="os-td-desc">{item.description}</td>
                            <td className="os-td-hits">{item.transType === 'PAYOUT' ? (item.hits || '-') : (item.hits || '-')}</td>
                            <td className={`os-td-debit ${debitClass}`}>{item.debit ? formatCurrency(item.debit) : '-'}</td>
                            <td className={`os-td-credit ${creditClass}`}>{item.credit ? formatCurrency(item.credit) : '-'}</td>
                            <td className={`os-td-balance ${balanceClass}`}>{formatCurrency(item.balance)}</td>
                            <td className="os-td-encoder no-print">{getEncoderByType(item.transType, item.agentId, item.manual)}</td>
                          </tr>
                        );
                      })}

                      <tr className="os-totals-row">
                        <td colSpan="6" className="os-totals-label">DAY TOTALS</td>
                        <td className={`os-totals-debit ${day.dayDebit < 0 ? 'negative' : ''}`}>{formatCurrency(day.dayDebit)}</td>
                        <td className={`os-totals-credit ${day.dayCredit < 0 ? 'negative' : ''}`}>{formatCurrency(day.dayCredit)}</td>
                        <td className="os-totals-balance">
                          <strong className={day.closingBalance < 0 ? 'negative' : 'positive'}>
                            {formatCurrency(day.closingBalance)}
                          </strong>
                        </td>
                        <td className="no-print">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="os-print-signatures">
                  <div className="os-signature-block">
                    <div className="os-signature-label">Prepared By:</div>
                    <div className="os-signature-line">Juan Dela Cruz</div>
                    <div className="os-signature-title">Operations Support</div>
                  </div>
                  <div className="os-signature-block">
                    <div className="os-signature-label">Checked By:</div>
                    <div className="os-signature-line">Juan Dela Cruz</div>
                    <div className="os-signature-title">Operations Support</div>
                  </div>
                  <div className="os-signature-block">
                    <div className="os-signature-label">Verified By:</div>
                    <div className="os-signature-line">____________________</div>
                    <div className="os-signature-title">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="os-ledgers-placeholder no-print">
          <div className="os-placeholder-content">
            <span className="os-placeholder-icon">🧾</span>
            <h3 className="os-placeholder-title">No ledger generated yet</h3>
            <p className="os-placeholder-text">
              Choose your date range and filters, then click <strong>Generate</strong> to preview the daily ledgers.
            </p>
          </div>
        </section>
      )}

      {/* Manual Entry Modal */}
      {showManualEntryModal && (
        <>
          <div className="os-modal-overlay active" onClick={toggleManualEntryModal}></div>
          <div className="os-modal-container active">
            <div className="os-modal-content">
              <div className="os-modal-header">
                <h3>Manual Ledger Entry</h3>
                <button className="os-modal-close" onClick={toggleManualEntryModal}>×</button>
              </div>

              <form onSubmit={handleManualEntrySubmit}>
                <div className="os-modal-body">
                  <div className="os-form-group">
                    <label className="os-form-label">Date</label>
                    <input
                      type="date"
                      className="os-form-input"
                      value={manualEntry.date}
                      onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                      required
                    />
                  </div>

                  {/* Focus only to the selected teller if chosen */}
                  {selectedAgent !== 'none' ? (
                    <div className="os-form-group">
                      <label className="os-form-label">Agent (Teller)</label>
                      <input type="text" className="os-form-input" value={selectedAgent} readOnly />
                    </div>
                  ) : (
                    <div className="os-form-group">
                      <label className="os-form-label">Agent (Teller)</label>
                      <select
                        className="os-form-input"
                        value={manualEntry.agent}
                        onChange={(e) => setManualEntry({ ...manualEntry, agent: e.target.value })}
                        required
                      >
                        <option value="">Select a Teller</option>
                        {getFilteredAgents().map((a, i) => (
                          <option key={i} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="os-form-group">
                    <label className="os-form-label">Transaction Type</label>
                    <select
                      className="os-form-input"
                      value={manualEntry.transType}
                      onChange={(e) => setManualEntry({ ...manualEntry, transType: e.target.value })}
                    >
                      <option>SALES</option>
                      <option>NET</option>
                      <option>PAYOUT</option>
                      <option>REMITTANCE</option>
                      <option>COLLECTION</option>
                      <option>DEFICIT</option>
                      <option>FORCE BALANCE</option>
                    </select>
                  </div>

                  <div className="os-form-group">
                    <label className="os-form-label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="os-form-input"
                      value={manualEntry.amount}
                      onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                      required
                    />
                    <div className="os-radio-group">
                      <label className="os-radio-label">
                        <input
                          type="radio"
                          name="amountType"
                          value="debit"
                          checked={manualEntry.amountType === 'debit'}
                          onChange={(e) => setManualEntry({ ...manualEntry, amountType: e.target.value })}
                        />
                        Debit
                      </label>
                      <label className="os-radio-label">
                        <input
                          type="radio"
                          name="amountType"
                          value="credit"
                          checked={manualEntry.amountType === 'credit'}
                          onChange={(e) => setManualEntry({ ...manualEntry, amountType: e.target.value })}
                        />
                        Credit
                      </label>
                    </div>
                  </div>

                  <div className="os-form-group">
                    <label className="os-form-label">Description</label>
                    <textarea
                      className="os-form-textarea"
                      rows="3"
                      placeholder="Description"
                      value={manualEntry.description}
                      onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="os-modal-footer">
                  <button type="button" className="os-btn-secondary" onClick={toggleManualEntryModal}>Cancel</button>
                  <button
                    type="submit"
                    className="os-btn-primary"
                    onClick={() => {
                      if (selectedAgent !== 'none') {
                        setManualEntry(m => ({ ...m, agent: selectedAgent }));
                      }
                    }}
                  >
                    Add Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DailyLedgersPage;