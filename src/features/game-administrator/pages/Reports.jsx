import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/reports.css';
import { useOutletContext } from 'react-router-dom';

// Generate mock data
const generateMockData = () => {
  const games = ['STL Pares', 'Last 2', 'Last 3', 'Swer3'];
  const drawSlots = ['11:00 AM', '4:00 PM', '9:00 PM'];
  const outlets = ['Outlet-001', 'Outlet-002', 'Outlet-003', 'Outlet-004', 'Outlet-005'];
  const collectors = ['COL-001', 'COL-002', 'COL-003', 'COL-004'];
  const tellers = ['TEL-001', 'TEL-002', 'TEL-003', 'TEL-004', 'TEL-005'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  
  const data = [];
  const today = new Date();
  
  for (let d = 30; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    
    games.forEach(game => {
      drawSlots.forEach(slot => {
        outlets.forEach(outlet => {
          const collector = collectors[Math.floor(Math.random() * collectors.length)];
          const teller = tellers[Math.floor(Math.random() * tellers.length)];
          const region = regions[Math.floor(Math.random() * regions.length)];
          const sales = Math.floor(Math.random() * 50000) + 10000;
          const payouts = Math.floor(sales * (Math.random() * 0.4 + 0.3));
          const tickets = Math.floor(Math.random() * 500) + 100;
          const voids = Math.floor(Math.random() * 10);
          
          data.push({
            id: `${date.toISOString()}-${game}-${slot}-${outlet}`,
            date: date.toISOString().split('T')[0],
            game,
            drawSlot: slot,
            outlet,
            collector,
            teller,
            region,
            sales,
            payouts,
            tickets,
            voids,
            payoutRatio: (payouts / sales * 100).toFixed(1),
            status: Math.random() > 0.9 ? 'flagged' : 'normal',
            remittanceStatus: Math.random() > 0.95 ? 'late' : 'on-time',
            voidApprovalTime: Math.floor(Math.random() * 10),
            resultAcknowledgeTime: Math.floor(Math.random() * 120)
          });
        });
      });
    });
  }
  
  return data;
};

const Reports = () => {
  const { toggleSidebar, sidebarOpen } = useOutletContext() || {};
  const showMenuButton = typeof toggleSidebar === 'function';

  // State management
  const [rawData] = useState(() => generateMockData());
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMetrics, setSelectedMetrics] = useState({
    sales: true,
    payouts: true,
    revenue: true,
    payoutRatio: true,
    tickets: true,
    voids: true
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [activePreset, setActivePreset] = useState('today');
  const [viewMode, setViewMode] = useState('summary');
  
  // Initialize with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ from: today, to: today });
  }, []);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...rawData];
    
    if (dateRange.from) {
      filtered = filtered.filter(item => item.date >= dateRange.from);
    }
    if (dateRange.to) {
      filtered = filtered.filter(item => item.date <= dateRange.to);
    }
    if (selectedGame !== 'all') {
      filtered = filtered.filter(item => item.game === selectedGame);
    }
    if (selectedSlot !== 'all') {
      filtered = filtered.filter(item => item.drawSlot === selectedSlot);
    }
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.outlet.toLowerCase().includes(term) ||
        item.teller.toLowerCase().includes(term) ||
        item.collector.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [rawData, dateRange, selectedGame, selectedSlot, selectedRegion, debouncedSearch]);
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
    const totalPayouts = filteredData.reduce((sum, item) => sum + item.payouts, 0);
    const totalTickets = filteredData.reduce((sum, item) => sum + item.tickets, 0);
    const totalVoids = filteredData.reduce((sum, item) => sum + item.voids, 0);
    const netRevenue = totalSales - totalPayouts;
    const payoutRatio = totalSales > 0 ? (totalPayouts / totalSales * 100) : 0;
    
    const prevSales = totalSales * 0.92;
    const salesGrowth = prevSales > 0 ? ((totalSales - prevSales) / prevSales * 100) : 0;
    
    const lateRemittances = filteredData.filter(item => item.remittanceStatus === 'late').length;
    const highVoidApprovals = filteredData.filter(item => item.voidApprovalTime > 5).length;
    const delayedAcknowledgments = filteredData.filter(item => item.resultAcknowledgeTime > 60).length;
    const flaggedTransactions = filteredData.filter(item => item.status === 'flagged').length;
    
    return {
      totalSales,
      totalPayouts,
      netRevenue,
      payoutRatio,
      totalTickets,
      totalVoids,
      salesGrowth,
      lateRemittances,
      highVoidApprovals,
      delayedAcknowledgments,
      flaggedTransactions,
      voidRate: totalTickets > 0 ? (totalVoids / totalTickets * 100) : 0
    };
  }, [filteredData]);
  
  // Top performers
  const topPerformers = useMemo(() => {
    const gamePerformance = {};
    const outletPerformance = {};
    const collectorPerformance = {};
    
    filteredData.forEach(item => {
      // Games
      if (!gamePerformance[item.game]) {
        gamePerformance[item.game] = { sales: 0, tickets: 0 };
      }
      gamePerformance[item.game].sales += item.sales;
      gamePerformance[item.game].tickets += item.tickets;
      
      // Outlets
      if (!outletPerformance[item.outlet]) {
        outletPerformance[item.outlet] = { sales: 0, region: item.region };
      }
      outletPerformance[item.outlet].sales += item.sales;
      
      // Collectors
      if (!collectorPerformance[item.collector]) {
        collectorPerformance[item.collector] = { sales: 0, outlets: new Set() };
      }
      collectorPerformance[item.collector].sales += item.sales;
      collectorPerformance[item.collector].outlets.add(item.outlet);
    });
    
    return {
      games: Object.entries(gamePerformance)
        .map(([game, data]) => ({ game, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3),
      outlets: Object.entries(outletPerformance)
        .map(([outlet, data]) => ({ outlet, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5),
      collectors: Object.entries(collectorPerformance)
        .map(([collector, data]) => ({ 
          collector, 
          sales: data.sales, 
          outlets: data.outlets.size 
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3)
    };
  }, [filteredData]);
  
  // Date presets handler
  const handlePreset = useCallback((preset) => {
    const today = new Date();
    let from, to;
    
    switch (preset) {
      case 'today':
        from = to = today.toISOString().split('T')[0];
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = to = yesterday.toISOString().split('T')[0];
        break;
      }
      case 'last7': {
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        from = week.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      }
      case 'last30': {
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        from = month.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      }
      case 'payday': {
        const payday = new Date(today.getFullYear(), today.getMonth(), 15);
        from = payday.toISOString().split('T')[0];
        payday.setDate(17);
        to = payday.toISOString().split('T')[0];
        break;
      }
      default:
        return;
    }
    
    setDateRange({ from, to });
    setActivePreset(preset);
  }, []);
  
  // Export handler (activated)
  const handleExport = useCallback(() => {
    const filenameBase = `report_${dateRange.from || 'all'}_${dateRange.to || 'all'}`;
    const headers = [
      'date','game','drawSlot','outlet','teller','collector','region',
      'sales','payouts','payoutRatio','tickets','voids','status','remittanceStatus',
      'voidApprovalTime','resultAcknowledgeTime'
    ];

    const downloadBlob = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    const escapeCSV = (val) => {
      const s = String(val ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    if (exportFormat === 'csv') {
      const rows = filteredData.map(r =>
        headers.map(h => escapeCSV(r[h])).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filenameBase}.csv`);
      setToastMessage('CSV downloaded');
      return;
    }

    if (exportFormat === 'json') {
      downloadBlob(
        new Blob([JSON.stringify({ range: dateRange, rows: filteredData }, null, 2)],
                 { type: 'application/json' }),
        `${filenameBase}.json`
      );
      setToastMessage('JSON downloaded');
      return;
    }

    if (exportFormat === 'xlsx') {
      // Excel-compatible HTML table (.xls)
      const th = headers.map(h => `<th style="text-align:left;border:1px solid #ddd;padding:6px">${h}</th>`).join('');
      const trs = filteredData.map(r =>
        `<tr>${headers.map(h => `<td style="border:1px solid #eee;padding:6px">${r[h] ?? ''}</td>`).join('')}</tr>`
      ).join('');
      const html =
        `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
          <table>
            <thead><tr>${th}</tr></thead>
            <tbody>${trs}</tbody>
          </table>
        </body></html>`;
      downloadBlob(
        new Blob([html], { type: 'application/vnd.ms-excel' }),
        `${filenameBase}.xls`
      );
      setToastMessage('Excel file downloaded');
      return;
    }

    if (exportFormat === 'pdf') {
      // Print-ready window; user can "Save as PDF"
      const style = `
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          h1 { font-size: 18px; margin: 0 0 8px; }
          .meta { margin: 0 0 12px; color:#555; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          thead { background: #f5f5f5; }
        </style>`;
      const th = headers.map(h => `<th>${h}</th>`).join('');
      const trs = filteredData.map(r =>
        `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
      ).join('');
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">${style}</head><body>
          <h1>Reports & Analytics</h1>
          <div class="meta">Range: ${dateRange.from || '—'} to ${dateRange.to || '—'} · Exported: ${new Date().toLocaleString()}</div>
          <table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>
          <script>window.onload = () => { window.print(); }</script>
        </body></html>`);
        w.document.close();
        setToastMessage('Opening print dialog (Save as PDF)');
      } else {
        setToastMessage('Pop-up blocked. Allow pop-ups to export PDF.');
      }
      return;
    }

    setToastMessage('Unsupported export format');
  }, [exportFormat, filteredData, dateRange]);
  
  // Schedule handler
  const handleSchedule = useCallback(() => {
    setToastMessage('Daily digest scheduled for 8:00 AM');
  }, []);
  
  // Subscribe handler
  const handleSubscribe = useCallback(() => {
    setToastMessage('Subscribed to anomaly alerts');
  }, []);
  
  // Row click handler
  const handleRowClick = useCallback((row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  }, []);
  
  // Close drawer handler
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedRow(null);
    }, 300);
  }, []);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };
  
  // Format percentage
  const formatPercent = (value, precision = 1) => {
    return `${Number(value).toFixed(precision)}%`;
  };
  
  // Render Summary View
  const renderSummaryView = () => {
    const maxGameSales = topPerformers.games.length ? topPerformers.games[0].sales : 0;
    const maxOutletSales = topPerformers.outlets.length ? topPerformers.outlets[0].sales : 0;
    const maxCollectorSales = topPerformers.collectors.length ? topPerformers.collectors[0].sales : 0;

    return (
      <>
        {/* KPI Cards */}
        <div className="gar-kpi-grid">
          <div className="ga-card gar-kpi-card">
            <div className="gar-kpi-header">
              <span className="gar-kpi-label">Gross Sales</span>
              <span className={`gar-kpi-trend ${kpis.salesGrowth >= 0 ? 'up' : 'down'}`}>
                {kpis.salesGrowth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(kpis.salesGrowth))}
              </span>
            </div>
            <div className="gar-kpi-value">{formatCurrency(kpis.totalSales)}</div>
            <div className="gar-kpi-chart">
              <div className="gar-sparkline">
                {[65, 72, 68, 74, 79, 82, 85].map((h, i) => (
                  <div key={i} className="gar-spark-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="ga-card gar-kpi-card">
            <div className="gar-kpi-header">
              <span className="gar-kpi-label">Payout Exposure</span>
              <span className="gar-kpi-badge">{formatPercent(kpis.payoutRatio)}</span>
            </div>
            <div className="gar-kpi-value">{formatCurrency(kpis.totalPayouts)}</div>
            <div className="gar-kpi-chart">
              <div className="gar-gauge">
                <div 
                  className="gar-gauge-fill" 
                  style={{ width: `${Math.min(kpis.payoutRatio, 100)}%` }} 
                />
                <span className="gar-gauge-label">Payout Ratio</span>
              </div>
            </div>
          </div>
          
          <div className="ga-card gar-kpi-card">
            <div className="gar-kpi-header">
              <span className="gar-kpi-label">Net Revenue</span>
              <span className="gar-kpi-status good">Healthy</span>
            </div>
            <div className="gar-kpi-value">{formatCurrency(kpis.netRevenue)}</div>
            <div className="gar-kpi-chart">
              <div className="gar-pie">
                <div className="gar-pie-slice sales" />
                <div className="gar-pie-slice payouts" />
                <div className="gar-pie-center">65/35</div>
              </div>
            </div>
          </div>
          
          <div className="ga-card gar-kpi-card">
            <div className="gar-kpi-header">
              <span className="gar-kpi-label">Compliance Score</span>
              <span className="gar-kpi-status warning">Review</span>
            </div>
            <div className="gar-kpi-value">
              {Math.max(0, 100 - Math.round(
                (kpis.lateRemittances + kpis.highVoidApprovals + kpis.delayedAcknowledgments) / 
                Math.max(filteredData.length, 1) * 100
              ))}%
            </div>
            <div className="gar-kpi-alerts">
              {kpis.lateRemittances > 0 && (
                <div className="gar-alert-pill danger">
                  <span className="gar-alert-dot" />
                  {kpis.lateRemittances} Late Remittances
                </div>
              )}
              {kpis.highVoidApprovals > 0 && (
                <div className="gar-alert-pill warning">
                  <span className="gar-alert-dot" />
                  {kpis.highVoidApprovals} Slow Void Approvals
                </div>
              )}
              {kpis.flaggedTransactions > 0 && (
                <div className="gar-alert-pill danger">
                  <span className="gar-alert-dot" />
                  {kpis.flaggedTransactions} AML Flags
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Performance Rankings */}
        <div className="gar-rankings-grid">
          <div className="ga-card">
            <h3 className="gar-section-title">Top Performing Games</h3>
            <div className="gar-ranking-list">
              {topPerformers.games.map((game, index) => (
                <div key={game.game} className="gar-ranking-item">
                  <span className="gar-rank">{index + 1}</span>
                  <div className="gar-rank-info">
                    <div className="gar-rank-name">{game.game}</div>
                    <div className="gar-rank-stats">
                      {formatCurrency(game.sales)} • {game.tickets} tickets
                    </div>
                  </div>
                  <div className="gar-rank-bar">
                    <div 
                      className="gar-rank-fill"
                      style={{ 
                        width: `${maxGameSales > 0 ? 
                          (game.sales / maxGameSales) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ga-card">
            <h3 className="gar-section-title">Top Outlets</h3>
            <div className="gar-ranking-list">
              {topPerformers.outlets.map((outlet, index) => (
                <div key={outlet.outlet} className="gar-ranking-item">
                  <span className="gar-rank">{index + 1}</span>
                  <div className="gar-rank-info">
                    <div className="gar-rank-name">{outlet.outlet}</div>
                    <div className="gar-rank-stats">
                      {outlet.region} • {formatCurrency(outlet.sales)}
                    </div>
                  </div>
                  <div className="gar-rank-bar">
                    <div 
                      className="gar-rank-fill"
                      style={{ 
                        width: `${maxOutletSales > 0 ? 
                          (outlet.sales / maxOutletSales) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ga-card">
            <h3 className="gar-section-title">Top Collectors</h3>
            <div className="gar-ranking-list">
              {topPerformers.collectors.map((collector, index) => (
                <div key={collector.collector} className="gar-ranking-item">
                  <span className="gar-rank">{index + 1}</span>
                  <div className="gar-rank-info">
                    <div className="gar-rank-name">{collector.collector}</div>
                    <div className="gar-rank-stats">
                      {collector.outlets} outlets • {formatCurrency(collector.sales)}
                    </div>
                  </div>
                  <div className="gar-rank-bar">
                    <div 
                      className="gar-rank-fill"
                      style={{ 
                        width: `${maxCollectorSales > 0 ? 
                          (collector.sales / maxCollectorSales) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  // Render Detailed View
  const renderDetailedView = () => (
    <div className="ga-card">
      <div className="gar-table-header">
        <h3 className="gar-section-title">Transaction Details</h3>
        <div className="gar-table-actions">
          <button onClick={handleExport} className="gar-export-btn">
            <span>⬇</span> Export
          </button>
          <button onClick={handleSchedule} className="gar-schedule-btn">
            <span>📅</span> Schedule
          </button>
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="gar-empty-state">
          <div className="gar-empty-icon">📊</div>
          <h4>No data found</h4>
          <p>Try adjusting your filters or selecting a different date range</p>
          <button onClick={() => handlePreset('last30')} className="gar-empty-action">
            View Last 30 Days
          </button>
        </div>
      ) : (
        <div className="gar-table-wrapper">
          <table className="gar-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Draw</th>
                <th>Outlet</th>
                <th>Teller</th>
                <th>Sales</th>
                <th>Payouts</th>
                <th>Ratio</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map(row => (
                <tr key={row.id} onClick={() => handleRowClick(row)}>
                  <td>{row.date}</td>
                  <td>
                    <span className="gar-game-badge">{row.game}</span>
                  </td>
                  <td>{row.drawSlot}</td>
                  <td>{row.outlet}</td>
                  <td>{row.teller}</td>
                  <td className="gar-amount">{formatCurrency(row.sales)}</td>
                  <td className="gar-amount">{formatCurrency(row.payouts)}</td>
                  <td>
                    <span className={`gar-ratio ${parseFloat(row.payoutRatio) > 70 ? 'high' : ''}`}>
                      {row.payoutRatio}%
                    </span>
                  </td>
                  <td>
                    <div className="gar-status-group">
                      {row.status === 'flagged' && (
                        <span className="gar-status-pill danger">AML</span>
                      )}
                      {row.remittanceStatus === 'late' && (
                        <span className="gar-status-pill warning">Late</span>
                      )}
                      {row.voidApprovalTime > 5 && (
                        <span className="gar-status-pill info">Void Delay</span>
                      )}
                      {row.status === 'normal' && 
                       row.remittanceStatus === 'on-time' && 
                       row.voidApprovalTime <= 5 && (
                        <span className="gar-status-pill success">OK</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
  // Render Builder View
  const renderBuilderView = () => (
    <div className="gar-builder-grid">
      <div className="ga-card">
        <h3 className="gar-section-title">Select Metrics</h3>
        <div className="gar-metrics-list">
          {Object.entries({
            sales: 'Gross Sales',
            payouts: 'Total Payouts',
            revenue: 'Net Revenue',
            payoutRatio: 'Payout Ratio',
            tickets: 'Ticket Volume',
            voids: 'Void Analysis'
          }).map(([key, label]) => (
            <label key={key} className="gar-metric-item">
              <input
                type="checkbox"
                checked={selectedMetrics[key]}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="gar-checkbox"
              />
              <span className="gar-metric-label">{label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="ga-card">
        <h3 className="gar-section-title">Export Settings</h3>
        <div className="gar-export-settings">
          <div className="gar-setting-group">
            <label className="gar-label">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="gar-select"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div className="gar-setting-group">
            <label className="gar-label">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="gar-select"
            >
              <option value="Asia/Manila">Manila (GMT+8)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
            </select>
          </div>
          
          <button onClick={handleExport} className="gar-generate-btn">
            Generate Report
          </button>
          
          <button onClick={handleSubscribe} className="gar-subscribe-btn">
            Subscribe to Anomaly Alerts
          </button>
        </div>
      </div>
      
      <div className="ga-card">
        <h3 className="gar-section-title">Preview</h3>
        <div className="gar-preview">
          <div className="gar-preview-header">
            <span>Report Preview</span>
            <span className="gar-preview-date">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="gar-preview-content">
            {selectedMetrics.sales && (
              <div className="gar-preview-item">
                <span>Gross Sales:</span>
                <span>{formatCurrency(kpis.totalSales)}</span>
              </div>
            )}
            {selectedMetrics.payouts && (
              <div className="gar-preview-item">
                <span>Total Payouts:</span>
                <span>{formatCurrency(kpis.totalPayouts)}</span>
              </div>
            )}
            {selectedMetrics.revenue && (
              <div className="gar-preview-item">
                <span>Net Revenue:</span>
                <span>{formatCurrency(kpis.netRevenue)}</span>
              </div>
            )}
            {selectedMetrics.payoutRatio && (
              <div className="gar-preview-item">
                <span>Payout Ratio:</span>
                <span>{formatPercent(kpis.payoutRatio)}</span>
              </div>
            )}
            {selectedMetrics.tickets && (
              <div className="gar-preview-item">
                <span>Total Tickets:</span>
                <span>{kpis.totalTickets.toLocaleString()}</span>
              </div>
            )}
            {selectedMetrics.voids && (
              <div className="gar-preview-item">
                <span>Void Rate:</span>
                <span>{formatPercent(kpis.voidRate, 2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="gar-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="gar-toast">
          <span className="gar-toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* Header Section */}
      <div className="gar-header">
        <div className="gar-header-content">
          <div className="gar-header-main">
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
            <div className="gar-header-text">
              <h2 className="gar-title">Reports & Analytics</h2>
              <p className="gar-subtitle">Comprehensive operational insights and compliance monitoring</p>
            </div>
          </div>
          <div className="gar-header-actions">
            <button
              onClick={() => setViewMode('summary')}
              className={`gar-view-btn ${viewMode === 'summary' ? 'active' : ''}`}
            >
              <span>📊</span> Summary
            </button>
            <button 
              onClick={() => setViewMode('detailed')} 
              className={`gar-view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            >
              <span>📋</span> Detailed
            </button>
            <button 
              onClick={() => setViewMode('builder')} 
              className={`gar-view-btn ${viewMode === 'builder' ? 'active' : ''}`}
            >
              <span>🔧</span> Builder
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="ga-card gar-filters">
        <div className="gar-filter-row">
          <div className="gar-date-presets">
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'last7', label: 'Last 7 Days' },
              { key: 'last30', label: 'Last 30 Days' },
              { key: 'payday', label: 'Payday Weekend' }
            ].map(preset => (
              <button
                key={preset.key}
                onClick={() => handlePreset(preset.key)}
                className={`gar-preset-btn ${activePreset === preset.key ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="gar-date-inputs">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="gar-date-input"
              aria-label="Start date"
            />
            <span className="gar-date-separator">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="gar-date-input"
              aria-label="End date"
            />
          </div>
        </div>
        
        <div className="gar-filter-row">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="gar-select"
            aria-label="Filter by game"
          >
            <option value="all">All Games</option>
            <option value="STL Pares">STL Pares</option>
            <option value="Last 2">Last 2</option>
            <option value="Last 3">Last 3</option>
            <option value="Swer3">Swer3</option>
          </select>
          
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="gar-select"
            aria-label="Filter by draw slot"
          >
            <option value="all">All Draw Slots</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="4:00 PM">4:00 PM</option>
            <option value="9:00 PM">9:00 PM</option>
          </select>
          
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="gar-select"
            aria-label="Filter by region"
          >
            <option value="all">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
          
          <input
            type="text"
            placeholder="Search outlet, teller, collector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gar-search"
            aria-label="Search"
          />
        </div>
      </div>
      
      {/* Dynamic View Content */}
      {viewMode === 'summary' && renderSummaryView()}
      {viewMode === 'detailed' && renderDetailedView()}
      {viewMode === 'builder' && renderBuilderView()}
      
      {/* Detail Drawer */}
      <div className={`gar-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="gar-drawer-header">
          <h3>Transaction Details</h3>
          <button 
            onClick={handleCloseDrawer} 
            className="gar-drawer-close"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        
        {selectedRow && (
          <div className="gar-drawer-content">
            <div className="gar-drawer-section">
              <h4>Basic Information</h4>
              <div className="gar-detail-grid">
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Date</span>
                  <span className="gar-detail-value">{selectedRow.date}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Game</span>
                  <span className="gar-detail-value">{selectedRow.game}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Draw Time</span>
                  <span className="gar-detail-value">{selectedRow.drawSlot}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Region</span>
                  <span className="gar-detail-value">{selectedRow.region}</span>
                </div>
              </div>
            </div>
            
            <div className="gar-drawer-section">
              <h4>Personnel</h4>
              <div className="gar-detail-grid">
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Outlet</span>
                  <span className="gar-detail-value">{selectedRow.outlet}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Teller</span>
                  <span className="gar-detail-value">{selectedRow.teller}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Collector</span>
                  <span className="gar-detail-value">{selectedRow.collector}</span>
                </div>
              </div>
            </div>
            
            <div className="gar-drawer-section">
              <h4>Financial Summary</h4>
              <div className="gar-detail-grid">
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Gross Sales</span>
                  <span className="gar-detail-value">{formatCurrency(selectedRow.sales)}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Payouts</span>
                  <span className="gar-detail-value">{formatCurrency(selectedRow.payouts)}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Net Revenue</span>
                  <span className="gar-detail-value">
                    {formatCurrency(selectedRow.sales - selectedRow.payouts)}
                  </span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Payout Ratio</span>
                  <span className="gar-detail-value">{selectedRow.payoutRatio}%</span>
                </div>
              </div>
            </div>
            
            <div className="gar-drawer-section">
              <h4>Operations Metrics</h4>
              <div className="gar-detail-grid">
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Tickets Sold</span>
                  <span className="gar-detail-value">{selectedRow.tickets}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Void Count</span>
                  <span className="gar-detail-value">{selectedRow.voids}</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Void Approval Time</span>
                  <span className="gar-detail-value">{selectedRow.voidApprovalTime} min</span>
                </div>
                <div className="gar-detail-item">
                  <span className="gar-detail-label">Result Acknowledge</span>
                  <span className="gar-detail-value">{selectedRow.resultAcknowledgeTime} min</span>
                </div>
              </div>
            </div>
            
            <div className="gar-drawer-section">
              <h4>Compliance Status</h4>
              <div className="gar-compliance-list">
                <div className={`gar-compliance-item ${
                  selectedRow.remittanceStatus === 'on-time' ? 'good' : 'bad'
                }`}>
                  <span className="gar-compliance-icon">
                    {selectedRow.remittanceStatus === 'on-time' ? '✓' : '⚠'}
                  </span>
                  <span>
                    Remittance: {selectedRow.remittanceStatus === 'on-time' ? 'On Time' : 'Late'}
                  </span>
                </div>
                <div className={`gar-compliance-item ${
                  selectedRow.voidApprovalTime <= 5 ? 'good' : 'bad'
                }`}>
                  <span className="gar-compliance-icon">
                    {selectedRow.voidApprovalTime <= 5 ? '✓' : '⚠'}
                  </span>
                  <span>
                    Void Approval: {selectedRow.voidApprovalTime <= 5 ? 'Within SLA' : 'Exceeded SLA'}
                  </span>
                </div>
                <div className={`gar-compliance-item ${
                  selectedRow.status === 'normal' ? 'good' : 'bad'
                }`}>
                  <span className="gar-compliance-icon">
                    {selectedRow.status === 'normal' ? '✓' : '⚠'}
                  </span>
                  <span>
                    AML Status: {selectedRow.status === 'normal' ? 'Clear' : 'Flagged for Review'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="gar-drawer-overlay" 
          onClick={handleCloseDrawer}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Reports;
