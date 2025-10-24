// ============================================
// Sales and Transactions - Super Admin
// View sales, transactions, and daily ledgers
// ============================================
import React, { useState, useMemo, useRef } from 'react';
import '../styles/sales-transactions.css';

const SalesTransactions = () => {
  // Date helpers
  const todayISO = () => new Date().toISOString().split('T')[0];
  const yesterdayISO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // State
  const [activeTab, setActiveTab] = useState('sales'); // sales, transactions, ledger
  const [dateFrom, setDateFrom] = useState(yesterdayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Ledger specific
  const [showLedgerPreview, setShowLedgerPreview] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('none');
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    date: todayISO(),
    agent: '',
    transType: 'DEFICIT',
    description: '',
    amount: '',
    amountType: 'debit'
  });
  const manualSeqRef = useRef(1);

  // Mock Areas and Agents
  const areas = {
    'AREA-01': {
      name: 'Area 1 - Downtown',
      tellers: [
        'T-0001 - CRUZ, JUAN',
        'T-0002 - SANTOS, MARIA', 
        'T-0003 - REYES, PEDRO',
        'T-0004 - GARCIA, ANA',
        'T-0005 - LOPEZ, CARLOS'
      ],
      collectors: ['C-0101 - DELA CRUZ, PEDRO']
    },
    'AREA-02': {
      name: 'Area 2 - Uptown',
      tellers: [
        'T-0006 - RAMOS, JOSE',
        'T-0007 - TORRES, LISA',
        'T-0008 - MENDOZA, MARK',
        'T-0009 - VILLA, ANNA'
      ],
      collectors: ['C-0102 - BAUTISTA, JUAN']
    },
    'AREA-03': {
      name: 'Area 3 - Eastside',
      tellers: [
        'T-0010 - CRUZ, RAMON',
        'T-0011 - SANTOS, ELENA',
        'T-0012 - REYES, MARIO'
      ],
      collectors: ['C-0103 - MERCADO, ROSA']
    }
  };

  // Mock Sales Data
  const [salesData] = useState([
    { id: 'S-001', date: yesterdayISO(), time: '10:45 AM', area: 'AREA-01', teller: 'T-0001 - CRUZ, JUAN', game: 'STL Pares', tickets: 45, sales: 22500, commission: 1800, net: 20700, status: 'completed' },
    { id: 'S-002', date: yesterdayISO(), time: '11:20 AM', area: 'AREA-01', teller: 'T-0002 - SANTOS, MARIA', game: 'Swer3', tickets: 38, sales: 19000, commission: 2280, net: 16720, status: 'completed' },
    { id: 'S-003', date: yesterdayISO(), time: '02:30 PM', area: 'AREA-02', teller: 'T-0006 - RAMOS, JOSE', game: 'Last 2', tickets: 52, sales: 26000, commission: 2600, net: 23400, status: 'completed' },
    { id: 'S-004', date: todayISO(), time: '09:15 AM', area: 'AREA-01', teller: 'T-0003 - REYES, PEDRO', game: 'STL Pares', tickets: 30, sales: 15000, commission: 1200, net: 13800, status: 'completed' },
    { id: 'S-005', date: todayISO(), time: '10:00 AM', area: 'AREA-03', teller: 'T-0010 - CRUZ, RAMON', game: 'Swer3', tickets: 25, sales: 12500, commission: 1500, net: 11000, status: 'completed' },
    { id: 'S-006', date: todayISO(), time: '11:45 AM', area: 'AREA-02', teller: 'T-0007 - TORRES, LISA', game: 'Last 2', tickets: 40, sales: 20000, commission: 2000, net: 18000, status: 'pending' }
  ]);

  // Mock Transaction Data
  const [transactionsData] = useState([
    { id: 'TXN-001', date: yesterdayISO(), time: '03:00 PM', type: 'SALES', area: 'AREA-01', agent: 'T-0001 - CRUZ, JUAN', game: 'STL Pares', debit: 22500, credit: 0, description: 'Ticket sales for 3PM draw', status: 'completed' },
    { id: 'TXN-002', date: yesterdayISO(), time: '03:15 PM', type: 'PAYOUT', area: 'AREA-01', agent: 'T-0001 - CRUZ, JUAN', game: 'STL Pares', debit: 0, credit: 7000, description: 'Winner payout', status: 'completed' },
    { id: 'TXN-003', date: yesterdayISO(), time: '04:30 PM', type: 'REMITTANCE', area: 'AREA-01', agent: 'C-0101 - DELA CRUZ, PEDRO', game: '-', debit: 0, credit: 15500, description: 'Afternoon collection', status: 'completed' },
    { id: 'TXN-004', date: todayISO(), time: '10:30 AM', type: 'SALES', area: 'AREA-02', agent: 'T-0006 - RAMOS, JOSE', game: 'Last 2', debit: 26000, credit: 0, description: 'Ticket sales for 11AM draw', status: 'completed' },
    { id: 'TXN-005', date: todayISO(), time: '11:00 AM', type: 'PAYOUT', area: 'AREA-02', agent: 'T-0006 - RAMOS, JOSE', game: 'Last 2', debit: 0, credit: 5200, description: 'Winner payout', status: 'completed' },
    { id: 'TXN-006', date: todayISO(), time: '12:00 PM', type: 'COMMISSION', area: 'AREA-01', agent: 'T-0002 - SANTOS, MARIA', game: '-', debit: 0, credit: 2280, description: 'Teller commission', status: 'pending' }
  ]);

  // Mock Ledger Data (similar to Operation Support)
  const [ledgerData, setLedgerData] = useState([
    { id: 'L001', date: yesterdayISO(), time: '08:00:00', agent: 'T-0001 - CRUZ, JUAN', agentId: 'T-0001', area: 'AREA-01', transType: 'OPENING', description: 'Opening balance', debit: 0, credit: 0, manual: false },
    { id: 'L002', date: yesterdayISO(), time: '10:45:00', agent: 'T-0001 - CRUZ, JUAN', agentId: 'T-0001', area: 'AREA-01', transType: 'SALES', description: 'STL Pares - 10:30 AM draw', debit: 22500, credit: 0, manual: false },
    { id: 'L003', date: yesterdayISO(), time: '15:00:00', agent: 'T-0001 - CRUZ, JUAN', agentId: 'T-0001', area: 'AREA-01', transType: 'PAYOUT', description: 'Winner payout', debit: 0, credit: 7000, manual: false },
    { id: 'L004', date: yesterdayISO(), time: '16:30:00', agent: 'T-0001 - CRUZ, JUAN', agentId: 'T-0001', area: 'AREA-01', transType: 'REMITTANCE', description: 'Collection by C-0101', debit: 0, credit: 15500, manual: false },
    { id: 'L005', date: todayISO(), time: '09:15:00', agent: 'T-0003 - REYES, PEDRO', agentId: 'T-0003', area: 'AREA-01', transType: 'SALES', description: 'STL Pares - Morning sales', debit: 15000, credit: 0, manual: false },
    { id: 'L006', date: todayISO(), time: '10:00:00', agent: 'T-0010 - CRUZ, RAMON', agentId: 'T-0010', area: 'AREA-03', transType: 'SALES', description: 'Swer3 sales', debit: 12500, credit: 0, manual: false }
  ]);

  // Opening balances seed
  const openingBalancesSeed = {
    [yesterdayISO()]: {
      'T-0001': 5000,
      'T-0002': 3000,
      'T-0003': 4000,
      'T-0006': 6000,
      'T-0010': 2500
    },
    [todayISO()]: {
      'T-0001': 0,
      'T-0002': 0,
      'T-0003': 0,
      'T-0006': 20800,
      'T-0010': 0
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalSales = salesData.reduce((sum, s) => sum + s.sales, 0);
    const totalCommission = salesData.reduce((sum, s) => sum + s.commission, 0);
    const totalNet = salesData.reduce((sum, s) => sum + s.net, 0);
    const totalTickets = salesData.reduce((sum, s) => sum + s.tickets, 0);
    const totalDebit = transactionsData.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactionsData.reduce((sum, t) => sum + t.credit, 0);

    return {
      totalSales,
      totalCommission,
      totalNet,
      totalTickets,
      totalTransactions: transactionsData.length,
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit
    };
  }, [salesData, transactionsData]);

  // Format currency
  const formatCurrency = (amount) => {
    const sign = amount < 0 ? '-' : '';
    return sign + '₱' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filtered data
  const filteredSales = useMemo(() => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      const matchesDate = saleDate >= fromDate && saleDate <= toDate;
      const matchesArea = selectedArea === 'all' || sale.area === selectedArea;
      const matchesGame = selectedGame === 'all' || sale.game === selectedGame;
      const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus;
      const matchesSearch = searchQuery === '' ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.teller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.game.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDate && matchesArea && matchesGame && matchesStatus && matchesSearch;
    });
  }, [salesData, dateFrom, dateTo, selectedArea, selectedGame, selectedStatus, searchQuery]);

  const filteredTransactions = useMemo(() => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    return transactionsData.filter(txn => {
      const txnDate = new Date(txn.date);
      const matchesDate = txnDate >= fromDate && txnDate <= toDate;
      const matchesArea = selectedArea === 'all' || txn.area === selectedArea;
      const matchesSearch = searchQuery === '' ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDate && matchesArea && matchesSearch;
    });
  }, [transactionsData, dateFrom, dateTo, selectedArea, searchQuery]);

  // Ledger functions
  const getAllTellers = () => {
    const all = Object.values(areas).flatMap(a => a.tellers);
    return [...new Set(all)];
  };

  const getTellersByArea = (areaId) => {
    if (areaId === 'none' || areaId === 'all') return getAllTellers();
    return areas[areaId]?.tellers || [];
  };

  const getFilteredAgents = () => {
    if (selectedAgent !== 'none') return [selectedAgent];
    if (selectedArea !== 'none' && selectedArea !== 'all') return getTellersByArea(selectedArea);
    return getAllTellers();
  };

  const filteredLedger = useMemo(() => {
    if (!showLedgerPreview) return [];
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const tellers = getFilteredAgents();
    const q = searchQuery.toLowerCase();

    return ledgerData
      .filter(item => {
        const itemDate = new Date(item.date);
        const matchesDateRange = itemDate >= fromDate && itemDate <= toDate;
        const isTellerMatch = tellers.includes(item.agent);
        const matchesSearch =
          item.agent.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.transType.toLowerCase().includes(q);

        return matchesDateRange && isTellerMatch && matchesSearch;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [showLedgerPreview, ledgerData, dateFrom, dateTo, selectedAgent, selectedArea, searchQuery]);

  const getOpeningBalanceForDate = (date, agentStr) => {
    const agentId = (agentStr || '').split(' - ')[0];
    return openingBalancesSeed[date]?.[agentId] ?? 0;
  };

  const calculateRunningBalancesPerAgent = (dayData, date, prevClosings = {}) => {
    const agentIds = [...new Set(dayData.map(d => d.agentId))];

    const runs = {};
    agentIds.forEach(id => {
      const label = dayData.find(d => d.agentId === id)?.agent || id;
      const carryIn = prevClosings[id];
      runs[id] = (carryIn !== undefined) ? carryIn : (getOpeningBalanceForDate(date, label) || 0);
    });

    const openingSum = agentIds.reduce((sum, id) => sum + (runs[id] ?? 0), 0);

    const ordered = dayData.slice().sort((a, b) => {
      const aMan = !!a.manual, bMan = !!b.manual;
      if (aMan !== bMan) return aMan ? 1 : -1;
      const t = a.time.localeCompare(b.time);
      if (t !== 0) return t;
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

  const groupedByDateAndAgent = filteredLedger.reduce((groups, item) => {
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

  let rollingClosings = {};
  const daysWithBalances = sortedKeys.map(key => {
    const group = groupedByDateAndAgent[key];
    const { date, agentId, agent, items } = group;
    
    const { withBalances, openingSum, closingSum, closingMap } =
      calculateRunningBalancesPerAgent(items, date, { [agentId]: rollingClosings[agentId] });

    rollingClosings[agentId] = closingMap[agentId];

    const dayDebit = withBalances.reduce((s, i) => s + i.debit, 0);
    const dayCredit = withBalances.reduce((s, i) => s + i.credit, 0);

    return {
      date, agent, agentId,
      openingBalance: openingSum,
      closingBalance: closingSum,
      dayDebit, dayCredit,
      items: withBalances
    };
  });

  const ledgerTotalDebit = daysWithBalances.reduce((s, d) => s + d.dayDebit, 0);
  const ledgerTotalCredit = daysWithBalances.reduce((s, d) => s + d.dayCredit, 0);

  // Manual entry
  const handleManualEntrySubmit = (e) => {
    e.preventDefault();
    const { date, transType, description, amount, amountType } = manualEntry;

    const agent = selectedAgent !== 'none' ? selectedAgent : manualEntry.agent;
    if (!agent) return;

    const agentId = agent.split(' - ')[0];
    const area = Object.keys(areas).find(a => areas[a].tellers.includes(agent)) || 'AREA-01';
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];

    const amt = parseFloat(amount || '0') || 0;
    const debit = amountType === 'debit' ? amt : 0;
    const credit = amountType === 'credit' ? amt : 0;

    const newEntry = {
      id: `L${Math.floor(Math.random() * 100000)}`,
      date, time, agent, agentId, area,
      transType: (transType || 'DEFICIT').toUpperCase(),
      description: description || '-',
      debit, credit,
      manual: true,
      manualSeq: manualSeqRef.current++
    };

    setLedgerData(prev => [...prev, newEntry]);
    setShowManualEntryModal(false);
    setManualEntry({
      date: todayISO(),
      agent: selectedAgent !== 'none' ? selectedAgent : '',
      transType: 'DEFICIT',
      description: '',
      amount: '',
      amountType: 'debit'
    });
  };

  const agentOptions = (selectedArea !== 'none' && selectedArea !== 'all'
    ? getTellersByArea(selectedArea)
    : getAllTellers());

  return (
    <div className="st-container">
      {/* Header */}
      <div className="st-header">
        <div className="st-header-left">
          <h1 className="st-title">Sales & Transactions</h1>
          <p className="st-subtitle">Monitor all sales, transactions, and daily ledgers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="st-stats-grid">
        <div className="st-stat-card">
          <div className="st-stat-icon st-stat-blue">💰</div>
          <div className="st-stat-info">
            <div className="st-stat-value">{formatCurrency(stats.totalSales)}</div>
            <div className="st-stat-label">Total Sales</div>
          </div>
        </div>
        <div className="st-stat-card">
          <div className="st-stat-icon st-stat-green">🎫</div>
          <div className="st-stat-info">
            <div className="st-stat-value">{stats.totalTickets.toLocaleString()}</div>
            <div className="st-stat-label">Tickets Sold</div>
          </div>
        </div>
        <div className="st-stat-card">
          <div className="st-stat-icon st-stat-purple">📊</div>
          <div className="st-stat-info">
            <div className="st-stat-value">{stats.totalTransactions}</div>
            <div className="st-stat-label">Transactions</div>
          </div>
        </div>
        <div className="st-stat-card">
          <div className="st-stat-icon st-stat-orange">📈</div>
          <div className="st-stat-info">
            <div className="st-stat-value">{formatCurrency(stats.totalNet)}</div>
            <div className="st-stat-label">Net Revenue</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="st-tabs">
        <button
          className={`st-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          💰 Sales Report
        </button>
        <button
          className={`st-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📋 Transactions
        </button>
        <button
          className={`st-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          📒 Daily Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="st-filters">
        <div className="st-filter-row">
          <div className="st-filter-group">
            <label className="st-filter-label">From</label>
            <input
              type="date"
              className="st-filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="st-filter-group">
            <label className="st-filter-label">To</label>
            <input
              type="date"
              className="st-filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="st-filter-group">
            <label className="st-filter-label">Area</label>
            <select
              className="st-filter-input"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="all">All Areas</option>
              {Object.entries(areas).map(([id, area]) => (
                <option key={id} value={id}>{area.name}</option>
              ))}
            </select>
          </div>
          {activeTab === 'sales' && (
            <>
              <div className="st-filter-group">
                <label className="st-filter-label">Game</label>
                <select
                  className="st-filter-input"
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                >
                  <option value="all">All Games</option>
                  <option value="STL Pares">STL Pares</option>
                  <option value="Swer3">Swer3</option>
                  <option value="Last 2">Last 2</option>
                </select>
              </div>
              <div className="st-filter-group">
                <label className="st-filter-label">Status</label>
                <select
                  className="st-filter-input"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'ledger' && (
            <div className="st-filter-group">
              <label className="st-filter-label">Agent</label>
              <select
                className="st-filter-input"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="none">All Agents</option>
                {agentOptions.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
          )}
          <div className="st-filter-group st-search-group">
            <label className="st-filter-label">Search</label>
            <input
              type="text"
              className="st-filter-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {activeTab === 'ledger' && (
          <div className="st-ledger-actions">
            <button
              className="st-btn st-btn-primary"
              onClick={() => setShowLedgerPreview(true)}
            >
              📊 Generate Ledger
            </button>
            <button
              className="st-btn st-btn-secondary"
              onClick={() => setShowManualEntryModal(true)}
            >
              ➕ Manual Entry
            </button>
            <button className="st-btn st-btn-secondary">
              🖨️ Print
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'sales' && (
        <div className="st-table-container">
          <table className="st-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date & Time</th>
                <th>Area</th>
                <th>Teller</th>
                <th>Game</th>
                <th>Tickets</th>
                <th>Sales</th>
                <th>Commission</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td className="st-cell-id">{sale.id}</td>
                  <td className="st-cell-datetime">
                    <div>{new Date(sale.date).toLocaleDateString()}</div>
                    <div className="st-cell-time">{sale.time}</div>
                  </td>
                  <td className="st-cell-area">{sale.area}</td>
                  <td className="st-cell-agent">{sale.teller}</td>
                  <td className="st-cell-game">{sale.game}</td>
                  <td className="st-cell-number">{sale.tickets}</td>
                  <td className="st-cell-amount">{formatCurrency(sale.sales)}</td>
                  <td className="st-cell-amount st-amount-commission">{formatCurrency(sale.commission)}</td>
                  <td className="st-cell-amount st-amount-net">{formatCurrency(sale.net)}</td>
                  <td>
                    <span className={`st-status-badge st-status-${sale.status}`}>
                      {sale.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="st-empty-state">
              <span className="st-empty-icon">💰</span>
              <p className="st-empty-text">No sales found for the selected filters</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="st-table-container">
          <table className="st-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Area</th>
                <th>Agent</th>
                <th>Game</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id}>
                  <td className="st-cell-id">{txn.id}</td>
                  <td className="st-cell-datetime">
                    <div>{new Date(txn.date).toLocaleDateString()}</div>
                    <div className="st-cell-time">{txn.time}</div>
                  </td>
                  <td>
                    <span className={`st-trans-badge st-trans-${txn.type.toLowerCase()}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="st-cell-area">{txn.area}</td>
                  <td className="st-cell-agent">{txn.agent}</td>
                  <td className="st-cell-game">{txn.game}</td>
                  <td className="st-cell-debit">{txn.debit > 0 ? formatCurrency(txn.debit) : '-'}</td>
                  <td className="st-cell-credit">{txn.credit > 0 ? formatCurrency(txn.credit) : '-'}</td>
                  <td className="st-cell-description">{txn.description}</td>
                  <td>
                    <span className={`st-status-badge st-status-${txn.status}`}>
                      {txn.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="st-empty-state">
              <span className="st-empty-icon">📋</span>
              <p className="st-empty-text">No transactions found for the selected filters</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ledger' && (
        <>
          {showLedgerPreview ? (
            <div className="st-ledger-preview">
              <div className="st-ledger-summary">
                <h3 className="st-ledger-summary-title">Ledger Summary</h3>
                <div className="st-ledger-summary-grid">
                  <div className="st-summary-item">
                    <span className="st-summary-label">Total Debit</span>
                    <span className="st-summary-value st-debit">{formatCurrency(ledgerTotalDebit)}</span>
                  </div>
                  <div className="st-summary-item">
                    <span className="st-summary-label">Total Credit</span>
                    <span className="st-summary-value st-credit">{formatCurrency(ledgerTotalCredit)}</span>
                  </div>
                  <div className="st-summary-item">
                    <span className="st-summary-label">Agents</span>
                    <span className="st-summary-value">{getFilteredAgents().length}</span>
                  </div>
                  <div className="st-summary-item">
                    <span className="st-summary-label">Days</span>
                    <span className="st-summary-value">{daysWithBalances.length}</span>
                  </div>
                </div>
              </div>

              {daysWithBalances.map((day, idx) => (
                <div className="st-ledger-day" key={idx}>
                  <div className="st-ledger-day-header">
                    <div>
                      <h4 className="st-ledger-day-title">
                        {new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </h4>
                      <p className="st-ledger-agent">{day.agent}</p>
                    </div>
                    <div className="st-ledger-day-stats">
                      <div className="st-day-stat">
                        <span>Opening:</span>
                        <strong className={day.openingBalance < 0 ? 'negative' : 'positive'}>
                          {formatCurrency(day.openingBalance)}
                        </strong>
                      </div>
                      <div className="st-day-stat">
                        <span>Closing:</span>
                        <strong className={day.closingBalance < 0 ? 'negative' : 'positive'}>
                          {formatCurrency(day.closingBalance)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="st-table-container">
                    <table className="st-table st-ledger-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Debit</th>
                          <th>Credit</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.items.map((item, i) => (
                          <tr key={i}>
                            <td className="st-cell-time">{item.time}</td>
                            <td>
                              <span className={`st-trans-badge st-trans-${item.transType.toLowerCase()}`}>
                                {item.transType}
                              </span>
                            </td>
                            <td className="st-cell-description">{item.description}</td>
                            <td className="st-cell-debit">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                            <td className="st-cell-credit">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                            <td className="st-cell-balance">
                              <strong className={item.balance < 0 ? 'negative' : 'positive'}>
                                {formatCurrency(item.balance)}
                              </strong>
                            </td>
                          </tr>
                        ))}
                        <tr className="st-totals-row">
                          <td colSpan="3" className="st-totals-label">Day Totals</td>
                          <td className="st-cell-debit"><strong>{formatCurrency(day.dayDebit)}</strong></td>
                          <td className="st-cell-credit"><strong>{formatCurrency(day.dayCredit)}</strong></td>
                          <td className="st-cell-balance">
                            <strong className={day.closingBalance < 0 ? 'negative' : 'positive'}>
                              {formatCurrency(day.closingBalance)}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="st-empty-state">
              <span className="st-empty-icon">📒</span>
              <h3 className="st-empty-title">No ledger generated yet</h3>
              <p className="st-empty-text">
                Select your filters and click <strong>Generate Ledger</strong> to view daily ledgers
              </p>
            </div>
          )}
        </>
      )}

      {/* Manual Entry Modal */}
      {showManualEntryModal && (
        <div className="st-modal-overlay" onClick={() => setShowManualEntryModal(false)}>
          <div className="st-modal" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3 className="st-modal-title">Manual Ledger Entry</h3>
              <button className="st-modal-close" onClick={() => setShowManualEntryModal(false)}>×</button>
            </div>
            <form onSubmit={handleManualEntrySubmit}>
              <div className="st-modal-body">
                <div className="st-form-field">
                  <label className="st-form-label">Date *</label>
                  <input
                    type="date"
                    className="st-form-input"
                    value={manualEntry.date}
                    onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                    required
                  />
                </div>
                {selectedAgent === 'none' && (
                  <div className="st-form-field">
                    <label className="st-form-label">Agent *</label>
                    <select
                      className="st-form-input"
                      value={manualEntry.agent}
                      onChange={(e) => setManualEntry({...manualEntry, agent: e.target.value})}
                      required
                    >
                      <option value="">Select agent...</option>
                      {agentOptions.map(agent => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="st-form-field">
                  <label className="st-form-label">Transaction Type *</label>
                  <select
                    className="st-form-input"
                    value={manualEntry.transType}
                    onChange={(e) => setManualEntry({...manualEntry, transType: e.target.value})}
                    required
                  >
                    <option value="DEFICIT">DEFICIT</option>
                    <option value="SURPLUS">SURPLUS</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="CORRECTION">CORRECTION</option>
                  </select>
                </div>
                <div className="st-form-field">
                  <label className="st-form-label">Description *</label>
                  <input
                    type="text"
                    className="st-form-input"
                    value={manualEntry.description}
                    onChange={(e) => setManualEntry({...manualEntry, description: e.target.value})}
                    required
                  />
                </div>
                <div className="st-form-row">
                  <div className="st-form-field">
                    <label className="st-form-label">Amount *</label>
                    <input
                      type="number"
                      className="st-form-input"
                      value={manualEntry.amount}
                      onChange={(e) => setManualEntry({...manualEntry, amount: e.target.value})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="st-form-field">
                    <label className="st-form-label">Type *</label>
                    <select
                      className="st-form-input"
                      value={manualEntry.amountType}
                      onChange={(e) => setManualEntry({...manualEntry, amountType: e.target.value})}
                      required
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="st-modal-footer">
                <button
                  type="button"
                  className="st-btn st-btn-secondary"
                  onClick={() => setShowManualEntryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="st-btn st-btn-primary">
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTransactions;