import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import '../styles/daily-operations.css';

const DailyOperations = () => {
  const getLocalDate = useCallback(() => {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  }, []);

  const [currentDate] = useState(getLocalDate);
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(currentDate);
  const [tellerFilter, setTellerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activityDateFilter, setActivityDateFilter] = useState(currentDate);
  const [activitySearchInput, setActivitySearchInput] = useState('');
  const [debouncedActivitySearch, setDebouncedActivitySearch] = useState('');
  const [activitySubTab, setActivitySubTab] = useState('active');
  
  const [ticketDetailModal, setTicketDetailModal] = useState({ open: false, ticket: null });
  const [voidReasonModal, setVoidReasonModal] = useState({ open: false, request: null, action: null });
  
  const [tickets, setTickets] = useState([]);
  const [voidRequests, setVoidRequests] = useState([]);
  const [expandedTellers, setExpandedTellers] = useState(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedActivitySearch(activitySearchInput), 300);
    return () => clearTimeout(timer);
  }, [activitySearchInput]);

  // Generate demo data (memoized)
  const generateDemoTickets = useCallback(() => {
    const tellers = [
      { id: 'AKL-00001', name: 'TEODOSIO, ROSELIE' },
      { id: 'AKL-00002', name: 'PASTRANA, EMMA' },
      { id: 'AKL-00003', name: 'REGALADO, LAIRA JANE' },
      { id: 'AKL-00004', name: 'SOLIMBAD, ELIZABETH' },
      { id: 'AKL-00005', name: 'CRISOSTOMO, DIANA GAILE' },
      { id: 'AKL-00006', name: 'MARTINEZ, ANGELO' },
      { id: 'AKL-00007', name: 'SANTOS, MARIA' },
      { id: 'AKL-00008', name: 'DELA CRUZ, JOHN' }
    ];
    
    const games = ['STL Pares', 'Last 2', 'Last 3', 'Swer3'];
    const drawTimes = ['11:00 AM', '4:00 PM', '9:00 PM'];
    const statuses = ['active', 'active', 'active', 'active', 'active', 'winning', 'voided'];
    
    const tickets = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const baseDate = new Date(today);
      baseDate.setDate(baseDate.getDate() - dayOffset);
      
      const availableTellers = dayOffset === 0 ? tellers.slice(0, 5) : tellers;
      const ticketsForDay = dayOffset === 0 ? 45 : Math.max(10, 38 - (dayOffset * 2));
      
      for (let i = 0; i < ticketsForDay; i++) {
        const numBets = Math.floor(Math.random() * 10) + 1;
        const bets = [];
        let total = 0;

        for (let j = 0; j < numBets; j++) {
          const game = games[Math.floor(Math.random() * games.length)];
          const amount = [10, 20, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 7)];
          let combo = '';

          if (game === 'STL Pares') {
            const n1 = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
            let n2 = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
            while (n1 === n2) n2 = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
            combo = `${n1}.${n2}`;
          } else if (game === 'Last 2') {
            combo = String(Math.floor(Math.random() * 100)).padStart(2, '0');
          } else {
            combo = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
          }

          bets.push({ 
            game, 
            combo, 
            amount, 
            drawTime: drawTimes[Math.floor(Math.random() * drawTimes.length)] 
          });
          total += amount;
        }

        const hour = 8 + Math.floor(Math.random() * 15);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(baseDate);
        timestamp.setHours(hour, minute, Math.floor(Math.random() * 60));
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const teller = availableTellers[Math.floor(Math.random() * availableTellers.length)];

        tickets.push({
          id: `TKT${String(100000 + tickets.length).slice(-5)}`,
          tellerId: teller.id,
          tellerName: teller.name,
          teller: `${teller.name} (${teller.id})`,
          timestamp: timestamp.toISOString(),
          bets,
          total,
          status,
          voidReason: status === 'voided' ? [
            'Customer requested cancellation',
            'Wrong combination entered',
            'Duplicate entry by mistake',
            'System error during processing'
          ][Math.floor(Math.random() * 4)] : null
        });
      }
    }

    return tickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  const generateDemoVoidRequests = useCallback(() => {
    const tellers = [
      'TEODOSIO, ROSELIE (AKL-00001)',
      'PASTRANA, EMMA (AKL-00002)',
      'REGALADO, LAIRA JANE (AKL-00003)',
      'SOLIMBAD, ELIZABETH (AKL-00004)',
      'CRISOSTOMO, DIANA GAILE (AKL-00005)',
      'MARTINEZ, ANGELO (AKL-00006)',
      'SANTOS, MARIA (AKL-00007)',
      'DELA CRUZ, JOHN (AKL-00008)'
    ];
    
    const reasons = [
      'Customer requested cancellation',
      'Wrong combination entered',
      'Duplicate entry by mistake',
      'Customer changed mind',
      'Incorrect amount entered',
      'System error during entry',
      'Customer left before payment',
      'Bet placed after draw time',
      'Wrong draw time selected',
      'Technical issue with printer'
    ];

    const requests = [];
    const today = new Date();
    
    const statusCounts = [
      { status: 'pending', count: 12 },
      { status: 'approved', count: 18 },
      { status: 'rejected', count: 8 }
    ];

    statusCounts.forEach(({ status, count }) => {
      for (let i = 0; i < count; i++) {
        const daysAgo = status === 'pending' 
          ? Math.floor(Math.random() * 2) 
          : Math.floor(Math.random() * 7) + 1;
        const timestamp = new Date(today);
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));
        
        requests.push({
          id: `VR${String(1000 + requests.length)}`,
          ticketId: `TKT${String(Math.floor(Math.random() * 90000) + 10000)}`,
          teller: tellers[Math.floor(Math.random() * tellers.length)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          timestamp: timestamp.toISOString(),
          status,
          reviewedBy: status !== 'pending' ? ['Admin User', 'Supervisor', 'Manager'][Math.floor(Math.random() * 3)] : null,
          reviewedAt: status !== 'pending' ? new Date(timestamp.getTime() + (Math.random() * 7200000)).toISOString() : null
        });
      }
    });

    return requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  // Initialize data
  useEffect(() => {
    try {
      const storedTickets = localStorage.getItem('DO_TICKETS_V5');
      const storedVoidReqs = localStorage.getItem('DO_VOID_REQUESTS_V5');

      if (storedTickets) {
        const parsed = JSON.parse(storedTickets);
        setTickets(parsed.length > 0 ? parsed : generateDemoTickets());
      } else {
        const newTickets = generateDemoTickets();
        setTickets(newTickets);
        localStorage.setItem('DO_TICKETS_V5', JSON.stringify(newTickets));
      }

      if (storedVoidReqs) {
        const parsed = JSON.parse(storedVoidReqs);
        setVoidRequests(parsed.length > 0 ? parsed : generateDemoVoidRequests());
      } else {
        const newVoidReqs = generateDemoVoidRequests();
        setVoidRequests(newVoidReqs);
        localStorage.setItem('DO_VOID_REQUESTS_V5', JSON.stringify(newVoidReqs));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const newTickets = generateDemoTickets();
      const newVoidReqs = generateDemoVoidRequests();
      
      setTickets(newTickets);
      setVoidRequests(newVoidReqs);
      
      localStorage.setItem('DO_TICKETS_V5', JSON.stringify(newTickets));
      localStorage.setItem('DO_VOID_REQUESTS_V5', JSON.stringify(newVoidReqs));
    }
  }, [generateDemoTickets, generateDemoVoidRequests]);

  // Debounced localStorage saves
  useEffect(() => {
    if (tickets.length === 0) return;
    const timer = setTimeout(() => {
      localStorage.setItem('DO_TICKETS_V5', JSON.stringify(tickets));
    }, 1000);
    return () => clearTimeout(timer);
  }, [tickets]);

  useEffect(() => {
    if (voidRequests.length === 0) return;
    const timer = setTimeout(() => {
      localStorage.setItem('DO_VOID_REQUESTS_V5', JSON.stringify(voidRequests));
    }, 1000);
    return () => clearTimeout(timer);
  }, [voidRequests]);

  // Body scroll lock for modals
  useEffect(() => {
    const isOpen = ticketDetailModal.open || voidReasonModal.open;
    if (isOpen) {
      document.body.classList.add('do-lock', 'do-blur-bg');
    } else {
      document.body.classList.remove('do-lock', 'do-blur-bg');
    }
    
    return () => {
      document.body.classList.remove('do-lock', 'do-blur-bg');
    };
  }, [ticketDetailModal.open, voidReasonModal.open]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoized unique tellers list
  const uniqueTellers = useMemo(() => {
    return [...new Set(tickets.map(t => t.teller))].sort();
  }, [tickets]);

  // Memoized filtered tickets
  const filteredTickets = useMemo(() => {
    let result = tickets;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) ||
        t.teller.toLowerCase().includes(q)
      );
    }

    if (dateFilter) {
      result = result.filter(t => t.timestamp.startsWith(dateFilter));
    }

    if (tellerFilter) {
      result = result.filter(t => t.teller === tellerFilter);
    }

    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }

    return result;
  }, [tickets, debouncedSearch, dateFilter, tellerFilter, statusFilter]);

  // Memoized filtered void requests
  const filteredVoidRequests = useMemo(() => {
    let result = voidRequests;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(v =>
        v.ticketId.toLowerCase().includes(q) ||
        v.teller.toLowerCase().includes(q) ||
        v.reason.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(v => v.status === statusFilter);
    }

    return result;
  }, [voidRequests, debouncedSearch, statusFilter]);

  // Memoized teller activity data
  const tellerActivityData = useMemo(() => {
    const allTellers = [
      { id: 'AKL-00001', name: 'TEODOSIO, ROSELIE' },
      { id: 'AKL-00002', name: 'PASTRANA, EMMA' },
      { id: 'AKL-00003', name: 'REGALADO, LAIRA JANE' },
      { id: 'AKL-00004', name: 'SOLIMBAD, ELIZABETH' },
      { id: 'AKL-00005', name: 'CRISOSTOMO, DIANA GAILE' },
      { id: 'AKL-00006', name: 'MARTINEZ, ANGELO' },
      { id: 'AKL-00007', name: 'SANTOS, MARIA' },
      { id: 'AKL-00008', name: 'DELA CRUZ, JOHN' }
    ];
    
    const dateTickets = tickets.filter(t => t.timestamp.startsWith(activityDateFilter));

    return allTellers.map((tellerInfo, index) => {
      const tellerTickets = dateTickets.filter(t => t.tellerId === tellerInfo.id);
      const hourlyData = Array(24).fill(0);

      tellerTickets.forEach(ticket => {
        const hour = new Date(ticket.timestamp).getHours();
        hourlyData[hour]++;
      });

      const totalSales = tellerTickets
        .filter(t => t.status !== 'voided')
        .reduce((sum, t) => sum + t.total, 0);

      return {
        number: index + 1,
        agentNo: tellerInfo.id,
        agentName: tellerInfo.name,
        hourlyData,
        totalTickets: tellerTickets.length,
        totalSales
      };
    });
  }, [tickets, activityDateFilter]);

  // Memoized filtered teller activity
  const filteredTellerActivity = useMemo(() => {
    if (!debouncedActivitySearch) return tellerActivityData;
    
    const q = debouncedActivitySearch.toLowerCase();
    return tellerActivityData.filter(teller => 
      teller.agentName.toLowerCase().includes(q) ||
      teller.agentNo.toLowerCase().includes(q)
    );
  }, [tellerActivityData, debouncedActivitySearch]);

  // Memoized stats
  const stats = useMemo(() => {
    if (activeTab === 'tickets') {
      const displayedTickets = filteredTickets;
      
      return {
        card1: { 
          label: dateFilter !== currentDate ? 'Selected Date Tickets' : "Today's Tickets", 
          value: displayedTickets.length 
        },
        card2: { 
          label: dateFilter !== currentDate ? 'Selected Date Sales' : "Today's Sales", 
          value: `₱${displayedTickets.filter(t => t.status !== 'voided').reduce((sum, t) => sum + t.total, 0).toLocaleString()}` 
        },
        card3: { 
          label: 'Active Tickets', 
          value: displayedTickets.filter(t => t.status === 'active').length 
        },
        card4: { 
          label: 'Voided Tickets', 
          value: displayedTickets.filter(t => t.status === 'voided').length 
        }
      };
    } else if (activeTab === 'activity') {
      const dateTickets = tickets.filter(t => t.timestamp.startsWith(activityDateFilter));
      const activeTellers = tellerActivityData.filter(t => t.totalTickets > 0).length;
      const absentTellers = tellerActivityData.length - activeTellers;
      
      return {
        card1: { 
          label: 'Total Tellers', 
          value: tellerActivityData.length 
        },
        card2: { 
          label: 'Active Tellers', 
          value: activeTellers 
        },
        card3: { 
          label: 'Absent Tellers', 
          value: absentTellers 
        },
        card4: { 
          label: 'Total Sales', 
          value: `₱${dateTickets.filter(t => t.status !== 'voided').reduce((sum, t) => sum + t.total, 0).toLocaleString()}` 
        }
      };
    } else {
      const displayedRequests = filteredVoidRequests;
      
      return {
        card1: { 
          label: 'Total Requests', 
          value: displayedRequests.length 
        },
        card2: { 
          label: 'Pending', 
          value: displayedRequests.filter(v => v.status === 'pending').length 
        },
        card3: { 
          label: 'Approved', 
          value: displayedRequests.filter(v => v.status === 'approved').length 
        },
        card4: { 
          label: 'Rejected', 
          value: displayedRequests.filter(v => v.status === 'rejected').length 
        }
      };
    }
  }, [activeTab, filteredTickets, filteredVoidRequests, dateFilter, activityDateFilter, currentDate, tickets, tellerActivityData]);

  // Handlers
  const toggleTellerExpand = useCallback((tellerId) => {
    setExpandedTellers(prev => {
      const next = new Set(prev);
      if (next.has(tellerId)) {
        next.delete(tellerId);
      } else {
        next.add(tellerId);
      }
      return next;
    });
  }, []);

  const openTicketDetail = useCallback((ticket) => {
    setTicketDetailModal({ open: true, ticket });
  }, []);

  const closeTicketDetail = useCallback(() => {
    setTicketDetailModal({ open: false, ticket: null });
  }, []);

  const handleVoidAction = useCallback((request, action) => {
    setVoidReasonModal({ open: true, request, action });
  }, []);

  const confirmVoidAction = useCallback(() => {
    if (!voidReasonModal.request) return;

    const { request, action } = voidReasonModal;
    
    setVoidRequests(prev =>
      prev.map(v =>
        v.id === request.id
          ? {
              ...v,
              status: action,
              reviewedBy: 'Admin User',
              reviewedAt: new Date().toISOString()
            }
          : v
      )
    );

    if (action === 'approved') {
      setTickets(prev =>
        prev.map(t =>
          t.id === request.ticketId
            ? { ...t, status: 'voided', voidReason: request.reason }
            : t
        )
      );
    }

    setVoidReasonModal({ open: false, request: null, action: null });
  }, [voidReasonModal]);

  const closeVoidReasonModal = useCallback(() => {
    setVoidReasonModal({ open: false, request: null, action: null });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const formatTimestamp = useCallback((iso) => {
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  const groupBets = useCallback((bets) => {
    const groups = {};
    bets.forEach(bet => {
      const key = `${bet.game}_${bet.drawTime}`;
      if (!groups[key]) {
        groups[key] = { game: bet.game, drawTime: bet.drawTime, bets: [] };
      }
      groups[key].bets.push(bet);
    });
    return Object.values(groups);
  }, []);

  const formatHourLabel = useCallback((hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${String(hour).padStart(2, '0')} AM`;
    if (hour === 12) return '12 PM';
    return `${String(hour - 12).padStart(2, '0')} PM`;
  }, []);

  return (
    <div className="do-container">
      {/* Header - Reports Style */}
      <div className="do-header">
        <div className="do-header-content">
          <div>
            <h2 className="do-title">Daily Operations</h2>
            <p className="do-subtitle">
              Monitor ticket entries, teller activity, and void requests in real-time
            </p>
          </div>
          <div className="do-header-actions">
            <button 
              className={`do-view-btn ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <span>📋</span> Tickets
            </button>
            <button 
              className={`do-view-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span>⚡</span> Activity
            </button>
            <button 
              className={`do-view-btn ${activeTab === 'voids' ? 'active' : ''}`}
              onClick={() => setActiveTab('voids')}
            >
              <span>🚫</span> Voids
              {stats.card2.value > 0 && activeTab === 'voids' && (
                <span className="do-badge">{stats.card2.value}</span>
              )}
            </button>
          </div>
        </div>
        <div className="do-status-bar">
          <div className="do-stats-header">
            <div className="do-stat-item-header">
              <span className="do-stat-label-header">{stats.card1.label}</span>
              <span className="do-stat-value-header">{stats.card1.value}</span>
            </div>
            <div className="do-stat-item-header">
              <span className="do-stat-label-header">{stats.card2.label}</span>
              <span className="do-stat-value-header">{stats.card2.value}</span>
            </div>
            <div className="do-stat-item-header">
              <span className="do-stat-label-header">{stats.card3.label}</span>
              <span className="do-stat-value-header">{stats.card3.value}</span>
            </div>
            <div className="do-stat-item-header">
              <span className="do-stat-label-header">{stats.card4.label}</span>
              <span className="do-stat-value-header">{stats.card4.value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card with Content */}
      <div className="do-card">
        {/* Filters */}
        <div className="do-filters">
          {activeTab === 'tickets' && (
            <>
              <div className="do-search">
                <span className="do-search-icon">🔍</span>
                <input
                  type="text"
                  className="do-input"
                  placeholder="Search tickets or tellers..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <input
                type="date"
                className="do-date-picker"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                max={currentDate}
              />

              <select className="do-select" value={tellerFilter} onChange={(e) => setTellerFilter(e.target.value)}>
                <option value="">All Tellers</option>
                {uniqueTellers.map(teller => (
                  <option key={teller} value={teller}>{teller}</option>
                ))}
              </select>

              <select className="do-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="voided">Voided</option>
                <option value="winning">Winning</option>
              </select>
            </>
          )}

          {activeTab === 'activity' && (
            <>
              <div className="do-search">
                <span className="do-search-icon">🔍</span>
                <input
                  type="text"
                  className="do-input"
                  placeholder="Search teller name or ID..."
                  value={activitySearchInput}
                  onChange={(e) => setActivitySearchInput(e.target.value)}
                />
              </div>

              <input
                type="date"
                className="do-date-picker"
                value={activityDateFilter}
                onChange={(e) => setActivityDateFilter(e.target.value)}
                max={currentDate}
              />
            </>
          )}

          {activeTab === 'voids' && (
            <>
              <div className="do-search">
                <span className="do-search-icon">🔍</span>
                <input
                  type="text"
                  className="do-input"
                  placeholder="Search void requests..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <select className="do-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </>
          )}
        </div>

        {/* Content */}
        <div className="do-content">
          {activeTab === 'tickets' && (
            <TicketsList 
              tickets={filteredTickets} 
              onOpenDetail={openTicketDetail}
              formatTimestamp={formatTimestamp}
            />
          )}

          {activeTab === 'activity' && (
            <TellerActivity
              tellerData={filteredTellerActivity}
              subTab={activitySubTab}
              onSubTabChange={setActivitySubTab}
              expandedTellers={expandedTellers}
              onToggleExpand={toggleTellerExpand}
              formatHourLabel={formatHourLabel}
            />
          )}

          {activeTab === 'voids' && (
            <VoidRequestsList
              requests={filteredVoidRequests}
              onVoidAction={handleVoidAction}
              formatTimestamp={formatTimestamp}
            />
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="do-back-to-top" onClick={scrollToTop} title="Back to top">
          <span className="do-back-to-top-icon">↑</span>
        </button>
      )}

      {/* Modals */}
      <TicketDetailModal
        modal={ticketDetailModal}
        onClose={closeTicketDetail}
        formatTimestamp={formatTimestamp}
        groupBets={groupBets}
      />
      <VoidReasonModal
        modal={voidReasonModal}
        onClose={closeVoidReasonModal}
        onConfirm={confirmVoidAction}
      />
    </div>
  );
};

// Separate components for better performance
const TicketsList = React.memo(({ tickets, onOpenDetail, formatTimestamp }) => {
  if (tickets.length === 0) {
    return <div className="do-list"><div className="do-empty">No tickets found</div></div>;
  }

  return (
    <div className="do-list">
      {tickets.map(ticket => (
        <div key={ticket.id} className="do-ticket-item">
          <div className="do-ticket-header">
            <div className="do-ticket-main">
              <div className="do-ticket-id">{ticket.id}</div>
              <div className="do-ticket-teller">{ticket.teller}</div>
              <div className="do-ticket-meta">
                {ticket.bets.length} bet{ticket.bets.length !== 1 ? 's' : ''} • ₱{ticket.total.toLocaleString()}
              </div>
            </div>
            <div className="do-ticket-side">
              <span className={`do-status-pill ${ticket.status}`}>
                {ticket.status.toUpperCase()}
              </span>
              <div className="do-ticket-time">{formatTimestamp(ticket.timestamp)}</div>
              <button 
                className="do-expand-btn"
                onClick={() => onOpenDetail(ticket)}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const TellerActivity = React.memo(({ tellerData, subTab, onSubTabChange, expandedTellers, onToggleExpand, formatHourLabel }) => {
  const activeTellers = useMemo(() => tellerData.filter(t => t.totalTickets > 0), [tellerData]);
  const absentTellers = useMemo(() => tellerData.filter(t => t.totalTickets === 0), [tellerData]);

  return (
    <div className="do-list">
      <div className="do-subtab-bar">
        <button 
          className={`do-subtab ${subTab === 'active' ? 'active' : ''}`}
          onClick={() => onSubTabChange('active')}
        >
          ✓ Active Tellers ({activeTellers.length})
        </button>
        <button 
          className={`do-subtab ${subTab === 'absent' ? 'active' : ''}`}
          onClick={() => onSubTabChange('absent')}
        >
          ⊘ Absent Tellers ({absentTellers.length})
        </button>
      </div>

      {subTab === 'active' && (
        <div className="do-activity-section">
          {activeTellers.length === 0 ? (
            <div className="do-empty">No active tellers found</div>
          ) : (
            <div className="do-teller-list-container">
              {activeTellers.map((teller) => {
                const isExpanded = expandedTellers.has(teller.agentNo);
                return (
                  <TellerActivityItem
                    key={teller.agentNo}
                    teller={teller}
                    isExpanded={isExpanded}
                    onToggleExpand={onToggleExpand}
                    formatHourLabel={formatHourLabel}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === 'absent' && (
        <div className="do-activity-section">
          {absentTellers.length === 0 ? (
            <div className="do-empty">No absent tellers found</div>
          ) : (
            <div className="do-absent-list">
              {absentTellers.map((teller) => (
                <div key={teller.agentNo} className="do-absent-teller">
                  <div className="do-absent-avatar">{teller.agentName.charAt(0)}</div>
                  <div className="do-absent-details">
                    <div className="do-absent-name">{teller.agentName}</div>
                    <div className="do-absent-id">{teller.agentNo}</div>
                  </div>
                  <div className="do-absent-badge">
                    <span className="do-absent-icon">⊘</span>
                    No Activity
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const TellerActivityItem = React.memo(({ teller, isExpanded, onToggleExpand, formatHourLabel }) => {
  return (
    <div className="do-teller-list-item">
      <div className="do-teller-row">
        <div className="do-teller-main-info">
          <div className="do-teller-avatar-small">{teller.agentName.charAt(0)}</div>
          <div className="do-teller-details">
            <div className="do-teller-name-row">{teller.agentName}</div>
            <div className="do-teller-id-row">{teller.agentNo}</div>
          </div>
        </div>
        
        <div className="do-teller-stats-row">
          <div className="do-stat-mini">
            <span className="do-stat-mini-icon">🎫</span>
            <span className="do-stat-mini-value">{teller.totalTickets}</span>
            <span className="do-stat-mini-label">tickets</span>
          </div>
          
          <div className="do-stat-mini">
            <span className="do-stat-mini-icon">💰</span>
            <span className="do-stat-mini-value">₱{teller.totalSales.toLocaleString()}</span>
            <span className="do-stat-mini-label">sales</span>
          </div>
        </div>
        
        <button 
          className="do-view-breakdown-btn"
          onClick={() => onToggleExpand(teller.agentNo)}
        >
          {isExpanded ? '▲ Hide Details' : '▼ View Breakdown'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="do-teller-breakdown">
          <div className="do-breakdown-header">
            <h4>Hourly Activity Breakdown</h4>
            <span className="do-breakdown-subtitle">Tickets processed per hour</span>
          </div>
          
          <div className="do-activity-chart-expanded">
            <div className="do-chart-bars-expanded">
              {teller.hourlyData.map((count, hour) => {
                if (count === 0) return null;
                const maxCount = Math.max(...teller.hourlyData);
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div 
                    key={hour} 
                    className="do-bar-item-expanded"
                  >
                    <div className="do-bar-info">
                      <span className="do-bar-label">{formatHourLabel(hour)}</span>
                      <span className="do-bar-count">{count} ticket{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="do-bar-visual">
                      <div 
                        className="do-bar-fill" 
                        style={{ width: `${heightPercent}%` }}
                      >
                        <span className="do-bar-percent">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="do-breakdown-summary">
            <div className="do-summary-item">
              <span className="do-summary-label">Peak Hour:</span>
              <span className="do-summary-value">
                {formatHourLabel(teller.hourlyData.indexOf(Math.max(...teller.hourlyData)))}
              </span>
            </div>
            <div className="do-summary-item">
              <span className="do-summary-label">Total Tickets:</span>
              <span className="do-summary-value">{teller.totalTickets}</span>
            </div>
            <div className="do-summary-item">
              <span className="do-summary-label">Total Sales:</span>
              <span className="do-summary-value">₱{teller.totalSales.toLocaleString()}</span>
            </div>
            <div className="do-summary-item">
              <span className="do-summary-label">Avg per Ticket:</span>
              <span className="do-summary-value">
                ₱{teller.totalTickets > 0 ? Math.round(teller.totalSales / teller.totalTickets).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const VoidRequestsList = React.memo(({ requests, onVoidAction, formatTimestamp }) => {
  if (requests.length === 0) {
    return <div className="do-list"><div className="do-empty">No void requests found</div></div>;
  }

  return (
    <div className="do-list">
      {requests.map(request => (
        <div key={request.id} className="do-void-item">
          <div className="do-void-header">
            <div className="do-void-main">
              <div className="do-void-id">Request #{request.id}</div>
              <div className="do-void-ticket">Ticket: {request.ticketId}</div>
              <div className="do-void-teller">{request.teller}</div>
            </div>
            <div className="do-void-side">
              <span className={`do-status-pill ${request.status}`}>
                {request.status.toUpperCase()}
              </span>
              <div className="do-void-time">{formatTimestamp(request.timestamp)}</div>
            </div>
          </div>
          <div className="do-void-reason">
            <strong>Reason:</strong> {request.reason}
          </div>
          {request.reviewedBy && (
            <div className="do-void-review">
              Reviewed by {request.reviewedBy} on {formatTimestamp(request.reviewedAt)}
            </div>
          )}
          {request.status === 'pending' && (
            <div className="do-void-actions">
              <button className="do-btn-approve" onClick={() => onVoidAction(request, 'approved')}>
                ✓ Approve
              </button>
              <button className="do-btn-reject" onClick={() => onVoidAction(request, 'rejected')}>
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

const TicketDetailModal = React.memo(({ modal, onClose, formatTimestamp, groupBets }) => {
  if (!modal.open || !modal.ticket) return null;

  return createPortal(
    <>
      <div className="do-modal-overlay active" onClick={onClose} />
      <div className="do-modal-container active">
        <div className="do-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="do-modal-header">
            <h3>Ticket Details</h3>
            <button className="do-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="do-modal-body">
            <div className="do-detail-card">
              <div className="do-detail-row">
                <span className="do-detail-label">Ticket ID:</span>
                <span className="do-detail-value">{modal.ticket.id}</span>
              </div>
              <div className="do-detail-row">
                <span className="do-detail-label">Teller:</span>
                <span className="do-detail-value">{modal.ticket.teller}</span>
              </div>
              <div className="do-detail-row">
                <span className="do-detail-label">Timestamp:</span>
                <span className="do-detail-value">{formatTimestamp(modal.ticket.timestamp)}</span>
              </div>
              <div className="do-detail-row">
                <span className="do-detail-label">Status:</span>
                <span className={`do-status-pill ${modal.ticket.status}`}>
                  {modal.ticket.status.toUpperCase()}
                </span>
              </div>
              <div className="do-detail-row">
                <span className="do-detail-label">Total Bets:</span>
                <span className="do-detail-value">{modal.ticket.bets.length}</span>
              </div>
              <div className="do-detail-row">
                <span className="do-detail-label">Total Amount:</span>
                <span className="do-detail-value">₱{modal.ticket.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="do-bets-detail">
              <h4>Bet Details</h4>
              {groupBets(modal.ticket.bets).map((group, idx) => (
                <div key={idx} className="do-bet-group-detail">
                  <div className="do-bet-group-header-detail">
                    <strong>{group.game}</strong> • Draw: {group.drawTime}
                  </div>
                  <div className="do-bet-list-detail">
                    {group.bets.map((bet, bidx) => {
                      const isWinning = modal.ticket.status === 'winning' && bidx === 0;
                      return (
                        <div key={bidx} className={`do-bet-line-detail ${isWinning ? 'winning' : ''}`}>
                          <span className="do-bet-combo-detail">{bet.combo}</span>
                          <span className="do-bet-amount-detail">₱{bet.amount.toLocaleString()}</span>
                          {isWinning && <span className="do-win-badge-detail">WIN</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {modal.ticket.voidReason && (
              <div className="do-void-reason-detail">
                <strong>Void Reason:</strong> {modal.ticket.voidReason}
              </div>
            )}
          </div>
          <div className="do-modal-footer">
            <button className="do-btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

const VoidReasonModal = React.memo(({ modal, onClose, onConfirm }) => {
  if (!modal.open || !modal.request) return null;

  return createPortal(
    <>
      <div className="do-modal-overlay active" onClick={onClose} />
      <div className="do-modal-container active">
        <div className="do-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="do-modal-header">
            <h3>Confirm {modal.action === 'approved' ? 'Approval' : 'Rejection'}</h3>
            <button className="do-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="do-modal-body">
            <p>
              Are you sure you want to <strong>{modal.action === 'approved' ? 'approve' : 'reject'}</strong> this void request?
            </p>
            <div className="do-confirm-details">
              <div><strong>Request ID:</strong> {modal.request.id}</div>
              <div><strong>Ticket ID:</strong> {modal.request.ticketId}</div>
              <div><strong>Teller:</strong> {modal.request.teller}</div>
              <div><strong>Reason:</strong> {modal.request.reason}</div>
            </div>
          </div>
          <div className="do-modal-footer">
            <button className="do-btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className={modal.action === 'approved' ? 'do-btn-approve' : 'do-btn-reject'}
              onClick={onConfirm}
            >
              Confirm {modal.action === 'approved' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default DailyOperations;