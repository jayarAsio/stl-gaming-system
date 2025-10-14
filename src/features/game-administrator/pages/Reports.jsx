import React, { useState, useMemo, useCallback } from 'react';
import '../styles/reports.css';

// Helper: format local date to YYYY-MM-DD (no UTC shift issues)
const formatDateLocal = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ReportsPage = () => {
  // TODAY: compute once
  const todayStr = formatDateLocal(new Date()); // e.g., 2025-10-14
  const now = new Date();

  const [activeTab, setActiveTab] = useState('summary');
  const [dateFrom, setDateFrom] = useState(todayStr);        // TODAY
  const [dateTo, setDateTo] = useState(todayStr);            // TODAY
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterTeller, setFilterTeller] = useState('all');
  const [filterGame, setFilterGame] = useState('all');
  const [filterDrawTime, setFilterDrawTime] = useState('all');
  const [filterCollector, setFilterCollector] = useState('all'); // (from previous step)

  // Generate mock data (unchanged list of users)
  const userManagementData = useMemo(() => {
    return [
      { id: 'T-0001', name: 'Ana Cruz', role: 'Teller', area: 'Toril', status: 'Active', loginCount: 145, lastLogin: `${todayStr} 08:15:23`, ticketsProcessed: 1247 },
      { id: 'T-0002', name: 'Mark Dela Peña', role: 'Teller', area: 'Buhangin', status: 'Suspended', loginCount: 89, lastLogin: `${todayStr} 14:22:11`, ticketsProcessed: 856 },
      { id: 'T-0003', name: 'Carla Reyes', role: 'Teller', area: 'Lanang', status: 'Active', loginCount: 167, lastLogin: `${todayStr} 09:02:45`, ticketsProcessed: 1589 },
      { id: 'C-0101', name: 'Joy Santos', role: 'Collector', area: 'Matina', status: 'Active', loginCount: 98, lastLogin: `${todayStr} 07:45:12`, ticketsProcessed: 0 },
      { id: 'T-0004', name: 'Paolo Garcia', role: 'Teller', area: 'Sasa', status: 'Active', loginCount: 134, lastLogin: `${todayStr} 16:30:08`, ticketsProcessed: 1123 },
      { id: 'C-0102', name: 'Leo Tan', role: 'Collector', area: 'Agdao', status: 'Active', loginCount: 76, lastLogin: `${todayStr} 18:20:33`, ticketsProcessed: 0 },
      { id: 'T-0005', name: 'Lara Torres', role: 'Teller', area: 'Agdao', status: 'Active', loginCount: 142, lastLogin: `${todayStr} 08:55:17`, ticketsProcessed: 1334 },
      { id: 'T-0006', name: 'Mike Ramos', role: 'Teller', area: 'Toril', status: 'Active', loginCount: 156, lastLogin: `${todayStr} 09:12:05`, ticketsProcessed: 1456 },
      { id: 'T-0007', name: 'Nina Lopez', role: 'Teller', area: 'Buhangin', status: 'Suspended', loginCount: 67, lastLogin: `${todayStr} 12:45:22`, ticketsProcessed: 678 },
      { id: 'C-0103', name: 'Rico Martinez', role: 'Collector', area: 'Lanang', status: 'Active', loginCount: 88, lastLogin: `${todayStr} 19:15:40`, ticketsProcessed: 0 },
    ];
  }, [todayStr]);

  // DAILY OPS: generate only for today
  const dailyOpsData = useMemo(() => {
    const operations = [];
    const areas = ['Toril', 'Buhangin', 'Lanang', 'Matina', 'Sasa', 'Agdao'];
    areas.forEach(area => {
      operations.push({
        date: todayStr, // TODAY
        area,
        totalTickets: Math.floor(Math.random() * 400) + 200,
        activeTickets: Math.floor(Math.random() * 350) + 150,
        voidedTickets: Math.floor(Math.random() * 40) + 10,
        totalSales: Math.floor(Math.random() * 400000) + 150000,
        voidRequests: Math.floor(Math.random() * 12) + 3,
      });
    });
    return operations;
  }, [todayStr]);

  // Teller-Collector assignments
  const tellerCollectorAssignments = useMemo(() => {
    return {
      'T-0001': 'C-0101',
      'T-0003': 'C-0103',
      'T-0004': 'C-0101',
      'T-0005': 'C-0102',
      'T-0006': 'C-0101',
    };
  }, []);

  // TELLER REPORTS: only today
  const tellerReportsData = useMemo(() => {
    const reports = [];
    const tellers = userManagementData.filter(u => u.role === 'Teller' && u.status === 'Active');

    tellers.forEach(teller => {
      const ticketsIssued = Math.floor(Math.random() * 150) + 50;
      const ticketsVoided = Math.floor(Math.random() * 10) + 1;
      const sales = ticketsIssued * (Math.floor(Math.random() * 50) + 20);

      const collectorId = tellerCollectorAssignments[teller.id];
      const collector = collectorId ? userManagementData.find(u => u.id === collectorId) : null;

      reports.push({
        date: todayStr, // TODAY
        tellerId: teller.id,
        tellerName: teller.name,
        area: teller.area,
        collector: collector ? collector.name : '—',
        collectorId: collectorId || null,
        ticketsIssued,
        ticketsVoided,
        ticketsActive: ticketsIssued - ticketsVoided,
        totalSales: sales,
        loginTime: '08:' + (Math.floor(Math.random() * 60)).toString().padStart(2, '0') + ':00',
        logoutTime: '17:' + (Math.floor(Math.random() * 60)).toString().padStart(2, '0') + ':00',
      });
    });

    return reports;
  }, [userManagementData, tellerCollectorAssignments, todayStr]);

  // DRAWS: only today; Completed if earlier than now, else Scheduled
  const drawManagementData = useMemo(() => {
    const draws = [];
    const games = ['STL Pares', 'Last 2', 'Last 3', 'Swer3'];
    const times = ['11:00 AM', '4:00 PM', '9:00 PM'];

    const toTodayTime = (timeStr) => {
      // timeStr like "4:00 PM" => build Date for today
      const [t, mer] = timeStr.split(' ');
      let [h, m] = t.split(':').map(Number);
      if (mer.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (mer.toUpperCase() === 'AM' && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    const generateWinningNumbers = (game) => {
      if (game === 'STL Pares') {
        const n1 = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
        const n2 = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
        return `${n1}-${n2}`;
      } else if (game === 'Last 2') {
        return String(Math.floor(Math.random() * 100)).padStart(2, '0');
      } else {
        return String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      }
    };

    games.forEach(game => {
      times.forEach(time => {
        const drawDateTime = toTodayTime(time);
        const isCompleted = drawDateTime < now;
        const totalBets = Math.floor(Math.random() * 4000) + 1000;
        const totalAmount = Math.floor(Math.random() * 1500000) + 500000;

        draws.push({
          date: todayStr,        // TODAY
          game,
          drawTime: time,
          status: isCompleted ? 'Completed' : 'Scheduled',
          totalBets,
          totalAmount,
          winningNumbers: isCompleted ? generateWinningNumbers(game) : '—',
          winners: isCompleted ? Math.floor(Math.random() * 45) + 5 : 0,
          payoutAmount: isCompleted ? Math.floor(Math.random() * 400000) + 50000 : 0,
        });
      });
    });

    return draws;
  }, [todayStr, now]);

  // Unique lists
  const uniqueTellers = useMemo(() => {
    const tellers = userManagementData.filter(u => u.role === 'Teller' && u.status === 'Active');
    return tellers.sort((a, b) => a.name.localeCompare(b.name));
  }, [userManagementData]);

  const uniqueCollectors = useMemo(() => {
    const collectors = userManagementData.filter(u => u.role === 'Collector' && u.status === 'Active');
    return collectors.sort((a, b) => a.name.localeCompare(b.name));
  }, [userManagementData]);

  const uniqueDrawTimes = useMemo(() => {
    const times = [...new Set(drawManagementData.map(d => d.drawTime))];
    return times.sort();
  }, [drawManagementData]);

  // Filters
  const filteredUserData = useMemo(() => {
    return userManagementData.filter(user => {
      const matchesSearch = searchQuery ? 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.area.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesArea = filterArea === 'all' || user.area === filterArea;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesStatus && matchesArea && matchesRole;
    });
  }, [userManagementData, searchQuery, filterStatus, filterArea, filterRole]);

  const filteredTellerReports = useMemo(() => {
    return tellerReportsData.filter(report => {
      const reportDate = new Date(report.date);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);

      const matchesDate = reportDate >= from && reportDate <= to;
      const matchesArea = filterArea === 'all' || report.area === filterArea;
      const matchesTeller = filterTeller === 'all' || report.tellerId === filterTeller;
      const matchesCollector = filterCollector === 'all' || report.collectorId === filterCollector;

      const matchesSearch = searchQuery ? 
        report.tellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tellerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.collector || '').toLowerCase().includes(searchQuery.toLowerCase()) : true;

      return matchesDate && matchesArea && matchesTeller && matchesCollector && matchesSearch;
    });
  }, [tellerReportsData, dateFrom, dateTo, filterArea, filterTeller, filterCollector, searchQuery]);

  const filteredDrawData = useMemo(() => {
    return drawManagementData.filter(draw => {
      const drawDate = new Date(draw.date);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      
      const matchesDate = drawDate >= from && drawDate <= to;
      const matchesSearch = searchQuery ? 
        draw.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draw.winningNumbers.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchesGame = filterGame === 'all' || draw.game === filterGame;
      const matchesTime = filterDrawTime === 'all' || draw.drawTime === filterDrawTime;
      
      return matchesDate && matchesSearch && matchesGame && matchesTime;
    });
  }, [drawManagementData, dateFrom, dateTo, searchQuery, filterGame, filterDrawTime]);

  // Summary
  const summaryStats = useMemo(() => {
    const totalTickets = filteredTellerReports.reduce((sum, r) => sum + r.ticketsIssued, 0);
    const totalSales = filteredTellerReports.reduce((sum, r) => sum + r.totalSales, 0);
    const totalDraws = filteredDrawData.filter(d => d.status === 'Completed').length;
    const totalPayout = filteredDrawData.reduce((sum, d) => sum + d.payoutAmount, 0);
    
    return {
      totalUsers: filteredUserData.length,
      activeUsers: filteredUserData.filter(u => u.status === 'Active').length,
      totalTickets,
      totalSales,
      totalDraws,
      totalPayout,
      profitMargin: totalSales > 0 ? ((totalSales - totalPayout) / totalSales * 100).toFixed(2) : 0,
    };
  }, [filteredUserData, filteredTellerReports, filteredDrawData]);

  // Export
  const exportToCSV = useCallback(() => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'users') {
      const headers = ['User ID', 'User Name', 'Role', 'Area', 'Status', 'Login Count', 'Last Login', 'Tickets Processed'];
      const rows = filteredUserData.map(user => [
        user.id,
        user.name,
        user.role,
        user.area,
        user.status,
        user.loginCount,
        user.lastLogin,
        user.ticketsProcessed
      ]);
      
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `user_management_report_${dateFrom}_to_${dateTo}.csv`;
    } else if (activeTab === 'operations') {
      const headers = ['Date', 'Teller ID', 'Teller Name', 'Area', 'Collector', 'Tickets Issued', 'Tickets Voided', 'Tickets Active', 'Total Sales', 'Login Time', 'Logout Time'];
      const rows = filteredTellerReports.map(report => [
        report.date,
        report.tellerId,
        report.tellerName,
        report.area,
        report.collector,
        report.ticketsIssued,
        report.ticketsVoided,
        report.ticketsActive,
        report.totalSales,
        report.loginTime,
        report.logoutTime
      ]);
      
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `teller_operations_report_${dateFrom}_to_${dateTo}.csv`;
    } else if (activeTab === 'draws') {
      const headers = ['Date', 'Game', 'Draw Time', 'Status', 'Total Bets', 'Total Amount', 'Winning Numbers', 'Winners', 'Payout Amount'];
      const rows = filteredDrawData.map(draw => [
        draw.date,
        draw.game,
        draw.drawTime,
        draw.status,
        draw.totalBets,
        draw.totalAmount,
        draw.winningNumbers,
        draw.winners,
        draw.payoutAmount
      ]);
      
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `draw_management_report_${dateFrom}_to_${dateTo}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeTab, filteredUserData, filteredTellerReports, filteredDrawData, dateFrom, dateTo]);

  return (
    <div className="rpt-container">
      {/* Header */}
      <div className="rpt-header">
        <div className="rpt-header-content">
          <div className="rpt-header-text">
            <h1 className="rpt-title">Reports & Analytics</h1>
            <p className="rpt-subtitle">Comprehensive reports across all system modules</p>
          </div>
          <div className="rpt-header-actions">
            {activeTab !== 'summary' && (
              <button className="rpt-export-btn" onClick={exportToCSV}>
                <span>📥</span> Export to CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rpt-tabs-card">
        <div className="rpt-tabs">
          <button className={`rpt-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
            <span>📊</span> Summary
          </button>
          <button className={`rpt-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab='users' && setActiveTab('users')}>
            <span>👥</span> User Management
          </button>
          <button className={`rpt-tab ${activeTab === 'operations' ? 'active' : ''}`} onClick={() => setActiveTab('operations')}>
            <span>📋</span> Daily Operations
          </button>
          <button className={`rpt-tab ${activeTab === 'draws' ? 'active' : ''}`} onClick={() => setActiveTab('draws')}>
            <span>🎲</span> Draw Management
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab !== 'summary' && (
        <div className="rpt-filters-card">
          <div className="rpt-filters">
            <div className="rpt-search-wrapper">
              <span className="rpt-search-icon">🔍</span>
              <input
                type="text"
                className="rpt-search-input"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="rpt-date-group">
              <label className="rpt-date-label">From</label>
              <input
                type="date"
                className="rpt-date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="rpt-date-group">
              <label className="rpt-date-label">To</label>
              <input
                type="date"
                className="rpt-date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {activeTab === 'users' && (
              <>
                <select className="rpt-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select className="rpt-filter-select" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                  <option value="all">All Areas</option>
                  <option value="Toril">Toril</option>
                  <option value="Buhangin">Buhangin</option>
                  <option value="Lanang">Lanang</option>
                  <option value="Matina">Matina</option>
                  <option value="Sasa">Sasa</option>
                  <option value="Agdao">Agdao</option>
                </select>

                <select className="rpt-filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="Teller">Tellers</option>
                  <option value="Collector">Collectors</option>
                </select>
              </>
            )}

            {activeTab === 'operations' && (
              <>
                <select className="rpt-filter-select" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                  <option value="all">All Areas</option>
                  <option value="Toril">Toril</option>
                  <option value="Buhangin">Buhangin</option>
                  <option value="Lanang">Lanang</option>
                  <option value="Matina">Matina</option>
                  <option value="Sasa">Sasa</option>
                  <option value="Agdao">Agdao</option>
                </select>

                <select className="rpt-filter-select rpt-filter-teller" value={filterTeller} onChange={(e) => setFilterTeller(e.target.value)}>
                  <option value="all">All Tellers</option>
                  {uniqueTellers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>

                <select className="rpt-filter-select rpt-filter-collector" value={filterCollector} onChange={(e) => setFilterCollector(e.target.value)}>
                  <option value="all">All Collectors</option>
                  {uniqueCollectors.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </>
            )}

            {activeTab === 'draws' && (
              <>
                <select className="rpt-filter-select" value={filterGame} onChange={(e) => setFilterGame(e.target.value)}>
                  <option value="all">All Games</option>
                  <option value="STL Pares">STL Pares</option>
                  <option value="Last 2">Last 2</option>
                  <option value="Last 3">Last 3</option>
                  <option value="Swer3">Swer3</option>
                </select>

                <select className="rpt-filter-select" value={filterDrawTime} onChange={(e) => setFilterDrawTime(e.target.value)}>
                  <option value="all">All Draw Times</option>
                  {uniqueDrawTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content (unchanged) */}
      {activeTab === 'summary' && (
        <div className="rpt-summary-section">
          <div className="rpt-summary-grid">
            <div className="rpt-stat-card">
              <div className="rpt-stat-icon rpt-icon-users">👥</div>
              <div className="rpt-stat-body">
                <div className="rpt-stat-value">{summaryStats.totalUsers}</div>
                <div className="rpt-stat-label">Total Users</div>
                <div className="rpt-stat-sub">{summaryStats.activeUsers} active</div>
              </div>
            </div>

            <div className="rpt-stat-card">
              <div className="rpt-stat-icon rpt-icon-tickets">🎫</div>
              <div className="rpt-stat-body">
                <div className="rpt-stat-value">{summaryStats.totalTickets.toLocaleString()}</div>
                <div className="rpt-stat-label">Total Tickets</div>
                <div className="rpt-stat-sub">{dateFrom} to {dateTo}</div>
              </div>
            </div>

            <div className="rpt-stat-card">
              <div className="rpt-stat-icon rpt-icon-sales">💰</div>
              <div className="rpt-stat-body">
                <div className="rpt-stat-value">₱{(summaryStats.totalSales / 1000000).toFixed(2)}M</div>
                <div className="rpt-stat-label">Total Sales</div>
                <div className="rpt-stat-sub">{summaryStats.profitMargin}% margin</div>
              </div>
            </div>

            <div className="rpt-stat-card">
              <div className="rpt-stat-icon rpt-icon-draws">🎲</div>
              <div className="rpt-stat-body">
                <div className="rpt-stat-value">{summaryStats.totalDraws}</div>
                <div className="rpt-stat-label">Completed Draws</div>
                <div className="rpt-stat-sub">₱{(summaryStats.totalPayout / 1000000).toFixed(2)}M payout</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rpt-card">
          <div className="rpt-card-header">
            <h3 className="rpt-card-title">User Management Report</h3>
            <div className="rpt-results-count">
              Showing <strong>{filteredUserData.length}</strong> users
            </div>
          </div>
          <div className="rpt-table-wrapper">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Login Count</th>
                  <th>Last Login</th>
                  <th>Tickets Processed</th>
                </tr>
              </thead>
              <tbody>
                {filteredUserData.length > 0 ? (
                  filteredUserData.map(user => (
                    <tr key={user.id}>
                      <td className="rpt-td-id">{user.id}</td>
                      <td className="rpt-td-name">{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.area}</td>
                      <td>
                        <span className={`rpt-pill ${user.status === 'Active' ? 'rpt-pill-success' : 'rpt-pill-danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="rpt-td-number">{user.loginCount}</td>
                      <td className="rpt-td-time">{user.lastLogin}</td>
                      <td className="rpt-td-number">{user.ticketsProcessed.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="rpt-no-results">No users found matching your criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="rpt-card">
          <div className="rpt-card-header">
            <h3 className="rpt-card-title">Teller Operations Report</h3>
            <div className="rpt-results-count">
              Showing <strong>{filteredTellerReports.length}</strong> records
            </div>
          </div>
          <div className="rpt-table-wrapper">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Teller ID</th>
                  <th>Teller Name</th>
                  <th>Area</th>
                  <th>Collector</th>
                  <th>Tickets Issued</th>
                  <th>Voided</th>
                  <th>Active</th>
                  <th>Total Sales</th>
                  <th>Login</th>
                  <th>Logout</th>
                </tr>
              </thead>
              <tbody>
                {filteredTellerReports.length > 0 ? (
                  filteredTellerReports.map((report, idx) => (
                    <tr key={idx}>
                      <td className="rpt-td-date">{report.date}</td>
                      <td className="rpt-td-id">{report.tellerId}</td>
                      <td className="rpt-td-name">{report.tellerName}</td>
                      <td>{report.area}</td>
                      <td className="rpt-td-name">{report.collector}</td>
                      <td className="rpt-td-number">{report.ticketsIssued.toLocaleString()}</td>
                      <td className="rpt-td-number">{report.ticketsVoided.toLocaleString()}</td>
                      <td className="rpt-td-number">{report.ticketsActive.toLocaleString()}</td>
                      <td className="rpt-td-currency">₱{report.totalSales.toLocaleString()}</td>
                      <td className="rpt-td-time">{report.loginTime}</td>
                      <td className="rpt-td-time">{report.logoutTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="rpt-no-results">No teller operations data found for selected filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'draws' && (
        <div className="rpt-card">
          <div className="rpt-card-header">
            <h3 className="rpt-card-title">Draw Management Report</h3>
            <div className="rpt-results-count">
              Showing <strong>{filteredDrawData.length}</strong> draws
            </div>
          </div>
          <div className="rpt-table-wrapper">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Game</th>
                  <th>Draw Time</th>
                  <th>Status</th>
                  <th>Total Bets</th>
                  <th>Total Amount</th>
                  <th>Winning Numbers</th>
                  <th>Winners</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrawData.length > 0 ? (
                  filteredDrawData.map((draw, idx) => (
                    <tr key={idx}>
                      <td className="rpt-td-date">{draw.date}</td>
                      <td className="rpt-td-game">{draw.game}</td>
                      <td>{draw.drawTime}</td>
                      <td>
                        <span className={`rpt-pill ${draw.status === 'Completed' ? 'rpt-pill-success' : 'rpt-pill-warning'}`}>
                          {draw.status}
                        </span>
                      </td>
                      <td className="rpt-td-number">{draw.totalBets.toLocaleString()}</td>
                      <td className="rpt-td-currency">₱{draw.totalAmount.toLocaleString()}</td>
                      <td className="rpt-td-winning">{draw.winningNumbers}</td>
                      <td className="rpt-td-number">{draw.winners > 0 ? draw.winners : '—'}</td>
                      <td className="rpt-td-currency">{draw.payoutAmount > 0 ? `₱${draw.payoutAmount.toLocaleString()}` : '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="rpt-no-results">No draw data found for selected filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
