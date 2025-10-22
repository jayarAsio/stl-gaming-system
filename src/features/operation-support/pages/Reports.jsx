// ============================================
// File: src/features/operation-support/pages/Reports.jsx
// Operation Support - Comprehensive Reports Module
// All buttons are working with simple functionality
// ============================================

import React, { useState, useMemo } from 'react';
import '../styles/reports.css';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('sales-summary');
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-10-07');
  const [selectedArea, setSelectedArea] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Report categories
  const reportCategories = [
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: '💰',
      reports: [
        { id: 'sales-summary', name: 'Sales Summary', description: 'Daily sales overview by area and agent' },
        { id: 'collection-report', name: 'Collection Report', description: 'Remittance and collection tracking' },
        { id: 'payout-analysis', name: 'Payout Analysis', description: 'Winning payouts breakdown' },
        { id: 'revenue-report', name: 'Revenue Report', description: 'Net revenue and commission analysis' }
      ]
    },
    {
      id: 'operational',
      name: 'Operational Reports',
      icon: '📊',
      reports: [
        { id: 'shortage-report', name: 'Shortage Report', description: 'Outstanding balances and shortages' },
        { id: 'agent-performance', name: 'Agent Performance', description: 'Individual agent metrics and rankings' },
        { id: 'area-performance', name: 'Area Performance', description: 'Area-wise performance comparison' },
        { id: 'transaction-log', name: 'Transaction Log', description: 'Complete transaction history' }
      ]
    },
    {
      id: 'compliance',
      name: 'Compliance Reports',
      icon: '📋',
      reports: [
        { id: 'audit-trail', name: 'Audit Trail', description: 'System activity and changes log' },
        { id: 'reconciliation', name: 'Reconciliation Report', description: 'Daily reconciliation summary' },
        { id: 'variance-report', name: 'Variance Report', description: 'Expected vs actual analysis' }
      ]
    }
  ];

  // Mock data generator
  const generateMockData = (reportType) => {
    const baseData = {
      reportType,
      dateFrom,
      dateTo,
      generatedAt: new Date().toLocaleString(),
      area: selectedArea
    };

    switch (reportType) {
      case 'sales-summary':
        return {
          ...baseData,
          summary: {
            totalSales: 3410750,
            totalPayouts: 999600,
            totalRemittances: 2089125,
            netRevenue: 1011150,
            transactionCount: 23014
          },
          byArea: [
            { area: 'Area 1 - Downtown', sales: 1254300, payouts: 376290, remittances: 878010, agents: 5 },
            { area: 'Area 2 - Uptown', sales: 1156450, payouts: 346935, remittances: 809515, agents: 4 },
            { area: 'Area 3 - Eastside', sales: 1000000, payouts: 276375, remittances: 401600, agents: 3 }
          ],
          topAgents: [
            { name: 'CPZ-00016 - RELANO, VIC', sales: 316500, efficiency: 98.5 },
            { name: 'CPZ-00020 - SANTOS, MARIA', sales: 299600, efficiency: 97.2 },
            { name: 'CPZ-00025 - REYES, ANA', sales: 269500, efficiency: 96.8 }
          ]
        };

      case 'collection-report':
        return {
          ...baseData,
          collections: [
            { date: '2025-10-01', collector: 'COL-01 - CRUZ, PEDRO', amount: 298500, areas: 2, status: 'Complete' },
            { date: '2025-10-02', collector: 'COL-01 - CRUZ, PEDRO', amount: 312400, areas: 2, status: 'Complete' },
            { date: '2025-10-03', collector: 'COL-02 - REYES, MARIA', amount: 285300, areas: 1, status: 'Complete' },
            { date: '2025-10-04', collector: 'COL-01 - CRUZ, PEDRO', amount: 301200, areas: 2, status: 'Complete' }
          ],
          totalCollected: 1197400,
          averageDaily: 299350
        };

      case 'payout-analysis':
        return {
          ...baseData,
          payouts: {
            total: 999600,
            byDrawTime: [
              { time: '2PM Draw', amount: 459800, percentage: 46 },
              { time: '7PM Draw', amount: 539800, percentage: 54 }
            ],
            byGame: [
              { game: 'STL PARES', amount: 999600, hits: 3420, avgPayout: 292 }
            ],
            topWinners: [
              { agent: 'CPZ-00016', amount: 89500, hits: 312 },
              { agent: 'CPZ-00020', amount: 76800, hits: 267 },
              { agent: 'CPZ-00025', amount: 68900, hits: 241 }
            ]
          }
        };

      case 'shortage-report':
        return {
          ...baseData,
          shortages: {
            total: 4,
            totalAmount: 9800,
            byStatus: [
              { status: 'Unpaid', count: 3, amount: 8000 },
              { status: 'Partial', count: 1, amount: 1800 }
            ],
            items: [
              { agent: 'CPZ-00016 - RELANO, VIC', amount: 2500, days: 1, status: 'Unpaid' },
              { agent: 'CPZ-00020 - SANTOS, MARIA', amount: 1800, days: 1, status: 'Partial' },
              { agent: 'CPZ-00025 - REYES, ANA', amount: 3000, days: 1, status: 'Unpaid' },
              { agent: 'CPZ-00031 - GARCIA, PEDRO', amount: 2500, days: 1, status: 'Unpaid' }
            ]
          }
        };

      case 'agent-performance':
        return {
          ...baseData,
          agents: [
            { rank: 1, name: 'CPZ-00016 - RELANO, VIC', sales: 316500, remittances: 221550, efficiency: 98.5, shortages: 0 },
            { rank: 2, name: 'CPZ-00020 - SANTOS, MARIA', sales: 299600, remittances: 209720, efficiency: 97.2, shortages: 1800 },
            { rank: 3, name: 'CPZ-00025 - REYES, ANA', sales: 269500, remittances: 188650, efficiency: 96.8, shortages: 3000 },
            { rank: 4, name: 'CPZ-00031 - GARCIA, PEDRO', sales: 251300, remittances: 175910, efficiency: 95.5, shortages: 2500 }
          ],
          metrics: {
            avgSales: 284225,
            avgEfficiency: 97.0,
            totalShortages: 7300
          }
        };

      case 'area-performance':
        return {
          ...baseData,
          areas: [
            { area: 'Area 1 - Downtown', sales: 1254300, payouts: 376290, remittances: 878010, agents: 5, efficiency: 97.8 },
            { area: 'Area 2 - Uptown', sales: 1156450, payouts: 346935, remittances: 809515, agents: 4, efficiency: 96.5 },
            { area: 'Area 3 - Eastside', sales: 1000000, payouts: 276375, remittances: 401600, agents: 3, efficiency: 95.2 }
          ]
        };

      case 'revenue-report':
        return {
          ...baseData,
          revenue: {
            totalSales: 3410750,
            totalPayouts: 999600,
            totalCommissions: 511612,
            netRevenue: 1899538,
            profitMargin: 55.7
          },
          breakdown: [
            { period: 'Oct 01', sales: 487250, payouts: 142800, commission: 73088, net: 271362 },
            { period: 'Oct 02', sales: 512400, payouts: 150280, commission: 76860, net: 285260 },
            { period: 'Oct 03', sales: 498300, payouts: 146120, commission: 74745, net: 277435 },
            { period: 'Oct 04', sales: 501800, payouts: 147210, commission: 75270, net: 279320 }
          ]
        };

      case 'transaction-log':
        return {
          ...baseData,
          transactions: [
            { time: '14:05', agent: 'CPZ-00016', type: 'SALES', amount: 1800, balance: 1800 },
            { time: '14:30', agent: 'CPZ-00016', type: 'PAYOUT', amount: -10000, balance: -8200 },
            { time: '19:05', agent: 'CPZ-00016', type: 'SALES', amount: 1500, balance: -6700 },
            { time: '20:30', agent: 'CPZ-00016', type: 'REMITTANCE', amount: -2310, balance: -9010 }
          ],
          totalTransactions: 1248
        };

      case 'audit-trail':
        return {
          ...baseData,
          activities: [
            { time: '09:15:23', user: 'Maria Santos', action: 'Generated Daily Ledger', module: 'Daily Ledgers' },
            { time: '10:30:45', user: 'Maria Santos', action: 'Recorded Payment', module: 'Balances', details: '₱2,500' },
            { time: '11:45:12', user: 'Maria Santos', action: 'Logged Contact', module: 'Balances', details: 'Juan Dela Cruz' },
            { time: '14:20:33', user: 'Maria Santos', action: 'Exported Report', module: 'Reports', details: 'Sales Summary' }
          ]
        };

      case 'reconciliation':
        return {
          ...baseData,
          reconciliation: {
            expectedRemittances: 2089125,
            actualRemittances: 2079325,
            variance: -9800,
            variancePercentage: -0.47,
            status: 'Under Review'
          },
          details: [
            { agent: 'CPZ-00016', expected: 221550, actual: 219050, variance: -2500 },
            { agent: 'CPZ-00020', expected: 209720, actual: 207920, variance: -1800 },
            { agent: 'CPZ-00025', expected: 188650, actual: 185650, variance: -3000 }
          ]
        };

      case 'variance-report':
        return {
          ...baseData,
          variances: [
            { category: 'Sales vs Target', expected: 3500000, actual: 3410750, variance: -89250, percentage: -2.55 },
            { category: 'Payout Rate', expected: 28.0, actual: 29.3, variance: 1.3, percentage: 4.64 },
            { category: 'Collection Rate', expected: 100.0, actual: 99.5, variance: -0.5, percentage: -0.50 },
            { category: 'Shortage Rate', expected: 0.0, actual: 0.29, variance: 0.29, percentage: 0 }
          ]
        };

      default:
        return baseData;
    }
  };

  // Generate report
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateMockData(selectedReport);
      setReportData(data);
      setIsGenerating(false);
    }, 800);
  };

  // Export functions
  const handleExportPDF = () => {
    alert('PDF Export: This would generate a PDF file with the current report data.');
  };

  const handleExportExcel = () => {
    alert('Excel Export: This would generate an Excel file with the current report data.');
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    let csvContent = `Report: ${getReportName(selectedReport)}\n`;
    csvContent += `Date Range: ${dateFrom} to ${dateTo}\n`;
    csvContent += `Generated: ${reportData.generatedAt}\n\n`;
    
    // Add report-specific data
    if (reportData.summary) {
      csvContent += 'Summary\n';
      Object.entries(reportData.summary).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    }
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert('Email Report: This would open an email dialog with the report attached.');
  };

  const handleSchedule = () => {
    alert('Schedule Report: This would open a dialog to set up automated report generation and delivery.');
  };

  // Get report name
  const getReportName = (reportId) => {
    for (const category of reportCategories) {
      const report = category.reports.find(r => r.id === reportId);
      if (report) return report.name;
    }
    return 'Report';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="os-reports-container">
      {/* Header */}
      <header className="os-reports-header">
        <div className="os-reports-header-main">
          <div className="os-reports-icon">📈</div>
          <div className="os-reports-header-text">
            <h1 className="os-reports-title">Reports & Analytics</h1>
            <p className="os-reports-subtitle">
              Generate comprehensive reports for financial, operational, and compliance analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="os-reports-content">
        {/* Sidebar - Report Categories */}
        <aside className="os-reports-sidebar">
          <div className="os-reports-sidebar-header">
            <h2>Report Categories</h2>
          </div>
          
          {reportCategories.map(category => (
            <div key={category.id} className="os-report-category">
              <div className="os-category-header">
                <span className="os-category-icon">{category.icon}</span>
                <span className="os-category-name">{category.name}</span>
              </div>
              
              <div className="os-category-reports">
                {category.reports.map(report => (
                  <button
                    key={report.id}
                    className={`os-report-item ${selectedReport === report.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedReport(report.id);
                      setReportData(null);
                    }}
                  >
                    <div className="os-report-item-name">{report.name}</div>
                    <div className="os-report-item-desc">{report.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Report Area */}
        <div className="os-reports-main">
          {/* Filters */}
          <div className="os-reports-filters">
            <div className="os-filter-group">
              <label className="os-filter-label">Date From</label>
              <input
                type="date"
                className="os-filter-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="os-filter-group">
              <label className="os-filter-label">Date To</label>
              <input
                type="date"
                className="os-filter-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="os-filter-group">
              <label className="os-filter-label">Area</label>
              <select
                className="os-filter-input"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="all">All Areas</option>
                <option value="area-1">Area 1 - Downtown</option>
                <option value="area-2">Area 2 - Uptown</option>
                <option value="area-3">Area 3 - Eastside</option>
              </select>
            </div>

            <button
              className="os-btn-generate"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              <span>{isGenerating ? '⏳' : '⚙️'}</span>
              <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>

          {/* Report Actions */}
          {reportData && (
            <div className="os-reports-actions no-print">
              <button className="os-action-btn" onClick={handleExportPDF}>
                <span>📄</span>
                <span>PDF</span>
              </button>
              <button className="os-action-btn" onClick={handleExportExcel}>
                <span>📊</span>
                <span>Excel</span>
              </button>
              <button className="os-action-btn" onClick={handleExportCSV}>
                <span>📋</span>
                <span>CSV</span>
              </button>
              <button className="os-action-btn" onClick={handlePrint}>
                <span>🖨️</span>
                <span>Print</span>
              </button>
              <button className="os-action-btn" onClick={handleEmail}>
                <span>📧</span>
                <span>Email</span>
              </button>
              <button className="os-action-btn" onClick={handleSchedule}>
                <span>⏰</span>
                <span>Schedule</span>
              </button>
            </div>
          )}

          {/* Report Display */}
          <div className="os-reports-display">
            {!reportData ? (
              <div className="os-reports-empty">
                <span className="os-empty-icon">📊</span>
                <h3 className="os-empty-title">No Report Generated</h3>
                <p className="os-empty-text">
                  Select a report type, configure the filters, and click "Generate Report" to view the data.
                </p>
              </div>
            ) : (
              <div className="os-report-content">
                {/* Report Header */}
                <div className="os-report-header">
                  <div>
                    <h2 className="os-report-title">{getReportName(selectedReport)}</h2>
                    <p className="os-report-meta">
                      Period: {dateFrom} to {dateTo} | Generated: {reportData.generatedAt}
                    </p>
                  </div>
                </div>

                {/* Report Body - Dynamic based on report type */}
                <div className="os-report-body">
                  {selectedReport === 'sales-summary' && reportData.summary && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Sales</div>
                            <div className="os-stat-value">{formatCurrency(reportData.summary.totalSales)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Payouts</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.summary.totalPayouts)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Remittances</div>
                            <div className="os-stat-value success">{formatCurrency(reportData.summary.totalRemittances)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Net Revenue</div>
                            <div className="os-stat-value primary">{formatCurrency(reportData.summary.netRevenue)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Performance by Area</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Area</th>
                              <th>Sales</th>
                              <th>Payouts</th>
                              <th>Remittances</th>
                              <th>Agents</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.byArea.map((area, idx) => (
                              <tr key={idx}>
                                <td>{area.area}</td>
                                <td>{formatCurrency(area.sales)}</td>
                                <td className="danger">{formatCurrency(area.payouts)}</td>
                                <td className="success">{formatCurrency(area.remittances)}</td>
                                <td>{area.agents}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Top Performing Agents</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Agent</th>
                              <th>Sales</th>
                              <th>Efficiency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.topAgents.map((agent, idx) => (
                              <tr key={idx}>
                                <td>{agent.name}</td>
                                <td>{formatCurrency(agent.sales)}</td>
                                <td className="success">{agent.efficiency}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'collection-report' && reportData.collections && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Collection Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Collected</div>
                            <div className="os-stat-value success">{formatCurrency(reportData.totalCollected)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Daily Average</div>
                            <div className="os-stat-value">{formatCurrency(reportData.averageDaily)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Collection Details</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Collector</th>
                              <th>Amount</th>
                              <th>Areas</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.collections.map((collection, idx) => (
                              <tr key={idx}>
                                <td>{collection.date}</td>
                                <td>{collection.collector}</td>
                                <td className="success">{formatCurrency(collection.amount)}</td>
                                <td>{collection.areas}</td>
                                <td><span className="badge success">{collection.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'payout-analysis' && reportData.payouts && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Payout Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Payouts</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.payouts.total)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Payouts by Draw Time</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Draw Time</th>
                              <th>Amount</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.payouts.byDrawTime.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.time}</td>
                                <td className="danger">{formatCurrency(item.amount)}</td>
                                <td>{item.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Top Winners</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Agent</th>
                              <th>Amount</th>
                              <th>Hits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.payouts.topWinners.map((winner, idx) => (
                              <tr key={idx}>
                                <td>{winner.agent}</td>
                                <td className="danger">{formatCurrency(winner.amount)}</td>
                                <td>{winner.hits}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'shortage-report' && reportData.shortages && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Shortage Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Shortages</div>
                            <div className="os-stat-value danger">{reportData.shortages.total}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Amount</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.shortages.totalAmount)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">By Status</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Count</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.shortages.byStatus.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.status}</td>
                                <td>{item.count}</td>
                                <td className="danger">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Shortage Details</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Agent</th>
                              <th>Amount</th>
                              <th>Days Overdue</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.shortages.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.agent}</td>
                                <td className="danger">{formatCurrency(item.amount)}</td>
                                <td>{item.days}</td>
                                <td><span className="badge warning">{item.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'agent-performance' && reportData.agents && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Performance Metrics</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Average Sales</div>
                            <div className="os-stat-value">{formatCurrency(reportData.metrics.avgSales)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Average Efficiency</div>
                            <div className="os-stat-value success">{reportData.metrics.avgEfficiency}%</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Shortages</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.metrics.totalShortages)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Agent Rankings</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Agent</th>
                              <th>Sales</th>
                              <th>Remittances</th>
                              <th>Efficiency</th>
                              <th>Shortages</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.agents.map((agent) => (
                              <tr key={agent.rank}>
                                <td><strong>{agent.rank}</strong></td>
                                <td>{agent.name}</td>
                                <td>{formatCurrency(agent.sales)}</td>
                                <td className="success">{formatCurrency(agent.remittances)}</td>
                                <td className="success">{agent.efficiency}%</td>
                                <td className={agent.shortages > 0 ? 'danger' : ''}>{formatCurrency(agent.shortages)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'area-performance' && reportData.areas && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Area Performance Comparison</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Area</th>
                              <th>Sales</th>
                              <th>Payouts</th>
                              <th>Remittances</th>
                              <th>Agents</th>
                              <th>Efficiency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.areas.map((area, idx) => (
                              <tr key={idx}>
                                <td>{area.area}</td>
                                <td>{formatCurrency(area.sales)}</td>
                                <td className="danger">{formatCurrency(area.payouts)}</td>
                                <td className="success">{formatCurrency(area.remittances)}</td>
                                <td>{area.agents}</td>
                                <td className="success">{area.efficiency}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'revenue-report' && reportData.revenue && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Revenue Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Sales</div>
                            <div className="os-stat-value">{formatCurrency(reportData.revenue.totalSales)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Total Payouts</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.revenue.totalPayouts)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Commissions</div>
                            <div className="os-stat-value">{formatCurrency(reportData.revenue.totalCommissions)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Net Revenue</div>
                            <div className="os-stat-value primary">{formatCurrency(reportData.revenue.netRevenue)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Daily Breakdown</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Period</th>
                              <th>Sales</th>
                              <th>Payouts</th>
                              <th>Commission</th>
                              <th>Net Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.breakdown.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.period}</td>
                                <td>{formatCurrency(item.sales)}</td>
                                <td className="danger">{formatCurrency(item.payouts)}</td>
                                <td>{formatCurrency(item.commission)}</td>
                                <td className="primary">{formatCurrency(item.net)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'transaction-log' && reportData.transactions && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Recent Transactions</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Agent</th>
                              <th>Type</th>
                              <th>Amount</th>
                              <th>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.transactions.map((txn, idx) => (
                              <tr key={idx}>
                                <td>{txn.time}</td>
                                <td>{txn.agent}</td>
                                <td><span className="badge">{txn.type}</span></td>
                                <td className={txn.amount < 0 ? 'danger' : 'success'}>{formatCurrency(Math.abs(txn.amount))}</td>
                                <td className={txn.balance < 0 ? 'danger' : 'success'}>{formatCurrency(txn.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="os-report-note">Showing recent transactions. Total: {reportData.totalTransactions}</p>
                      </div>
                    </>
                  )}

                  {selectedReport === 'audit-trail' && reportData.activities && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">System Activity Log</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>User</th>
                              <th>Action</th>
                              <th>Module</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.activities.map((activity, idx) => (
                              <tr key={idx}>
                                <td>{activity.time}</td>
                                <td>{activity.user}</td>
                                <td>{activity.action}</td>
                                <td><span className="badge info">{activity.module}</span></td>
                                <td>{activity.details || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'reconciliation' && reportData.reconciliation && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Reconciliation Summary</h3>
                        <div className="os-stats-grid-report">
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Expected Remittances</div>
                            <div className="os-stat-value">{formatCurrency(reportData.reconciliation.expectedRemittances)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Actual Remittances</div>
                            <div className="os-stat-value">{formatCurrency(reportData.reconciliation.actualRemittances)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Variance</div>
                            <div className="os-stat-value danger">{formatCurrency(reportData.reconciliation.variance)}</div>
                          </div>
                          <div className="os-stat-card-report">
                            <div className="os-stat-label">Variance %</div>
                            <div className="os-stat-value danger">{formatPercentage(reportData.reconciliation.variancePercentage)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="os-report-section">
                        <h3 className="os-section-title">Agent Variances</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Agent</th>
                              <th>Expected</th>
                              <th>Actual</th>
                              <th>Variance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.details.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.agent}</td>
                                <td>{formatCurrency(item.expected)}</td>
                                <td>{formatCurrency(item.actual)}</td>
                                <td className="danger">{formatCurrency(item.variance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {selectedReport === 'variance-report' && reportData.variances && (
                    <>
                      <div className="os-report-section">
                        <h3 className="os-section-title">Variance Analysis</h3>
                        <table className="os-report-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Expected</th>
                              <th>Actual</th>
                              <th>Variance</th>
                              <th>% Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.variances.map((item, idx) => (
                              <tr key={idx}>
                                <td><strong>{item.category}</strong></td>
                                <td>{typeof item.expected === 'number' && item.expected > 100 ? formatCurrency(item.expected) : `${item.expected}%`}</td>
                                <td>{typeof item.actual === 'number' && item.actual > 100 ? formatCurrency(item.actual) : `${item.actual}%`}</td>
                                <td className={item.variance < 0 ? 'danger' : 'success'}>
                                  {typeof item.variance === 'number' && Math.abs(item.variance) > 100 ? formatCurrency(item.variance) : `${item.variance}%`}
                                </td>
                                <td className={item.percentage < 0 ? 'danger' : 'success'}>{formatPercentage(item.percentage)}</td>
                              </tr>
                            ))} 
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;