import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import '../styles/reports.css';

// Generate mock collection data
const generateMockCollections = (dateFrom, dateTo) => {
  const collections = [];
  const tellers = [
    { id: 'T001', name: 'Juan Dela Cruz', code: 'TLR001', location: 'Booth A1' },
    { id: 'T002', name: 'Maria Santos', code: 'TLR002', location: 'Booth B2' },
    { id: 'T003', name: 'Pedro Garcia', code: 'TLR003', location: 'Booth C3' },
    { id: 'T004', name: 'Ana Reyes', code: 'TLR004', location: 'Booth D4' },
    { id: 'T005', name: 'Carlos Lopez', code: 'TLR005', location: 'Booth E5' }
  ];

  const start = new Date(dateFrom || new Date());
  const end = new Date(dateTo || new Date());

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    tellers.forEach(teller => {
      if (Math.random() > 0.3) { // 70% chance of collection
        const totalSales = Math.floor(Math.random() * 30000) + 10000;
        const totalWinners = Math.floor(totalSales * (Math.random() * 0.4 + 0.3));
        const grossSurplus = totalSales - totalWinners;
        const commission = grossSurplus * 0.05;
        const netCollected = grossSurplus - commission;

        collections.push({
          date: d.toISOString().split('T')[0],
          tellerId: teller.id,
          tellerName: teller.name,
          tellerCode: teller.code,
          location: teller.location,
          totalSales,
          totalWinners,
          grossSurplus,
          commission,
          netCollected,
          collectedAt: `${d.toISOString().split('T')[0]} ${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          collectedBy: 'Collector C001'
        });
      }
    });
  }

  return collections;
};

// Generate mock payout data
const generateMockPayouts = (dateFrom, dateTo) => {
  const payouts = [];
  const tellers = [
    { id: 'T001', name: 'Juan Dela Cruz', code: 'TLR001', location: 'Booth A1' },
    { id: 'T006', name: 'Rosa Martinez', code: 'TLR006', location: 'Booth F6' },
    { id: 'T007', name: 'Miguel Fernandez', code: 'TLR007', location: 'Booth G7' }
  ];

  const reasons = [
    'insufficient_funds',
    'multiple_winners',
    'jackpot_prize',
    'emergency_payout'
  ];

  const start = new Date(dateFrom || new Date());
  const end = new Date(dateTo || new Date());

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    tellers.forEach(teller => {
      if (Math.random() > 0.6) { // 40% chance of payout
        const totalSales = Math.floor(Math.random() * 20000) + 5000;
        const totalWinners = Math.floor(totalSales * (Math.random() * 0.5 + 1.2)); // Winners exceed sales
        const shortage = totalWinners - totalSales;
        const payoutAmount = shortage;

        payouts.push({
          date: d.toISOString().split('T')[0],
          tellerId: teller.id,
          tellerName: teller.name,
          tellerCode: teller.code,
          location: teller.location,
          totalSales,
          totalWinners,
          shortage,
          payoutAmount,
          processedAt: `${d.toISOString().split('T')[0]} ${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          processedBy: 'Collector C001',
          reason: reasons[Math.floor(Math.random() * reasons.length)]
        });
      }
    });
  }

  return payouts;
};

const Reports = () => {
  // State management
  const [reportType, setReportType] = useState('combined');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateFrom(today);
    setDateTo(today);
  }, []);

  // Apply body class for background
  useEffect(() => {
    document.body.classList.add("reports-module-bg");
    return () => document.body.classList.remove("reports-module-bg");
  }, []);

  // Generate report data
  const reportData = useMemo(() => {
    if (!dateFrom || !dateTo) return { collections: [], payouts: [] };

    const collections = generateMockCollections(dateFrom, dateTo);
    const payouts = generateMockPayouts(dateFrom, dateTo);

    return { collections, payouts };
  }, [dateFrom, dateTo]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const { collections, payouts } = reportData;

    const totalCollections = collections.reduce((sum, c) => sum + c.netCollected, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.payoutAmount, 0);
    const totalGrossSurplus = collections.reduce((sum, c) => sum + c.grossSurplus, 0);
    const totalCommissions = collections.reduce((sum, c) => sum + c.commission, 0);
    const netPosition = totalCollections - totalPayouts;

    return {
      totalCollections,
      totalPayouts,
      totalGrossSurplus,
      totalCommissions,
      netPosition,
      collectionsCount: collections.length,
      payoutsCount: payouts.length
    };
  }, [reportData]);

  // Toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Generate report handler
  const handleGenerateReport = useCallback(() => {
    if (!dateFrom || !dateTo) {
      showToast('Please select date range', 'error');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
      showToast('Report generated successfully');
    }, 1000);
  }, [dateFrom, dateTo, showToast]);

  // Export handlers
  const handlePrint = useCallback(() => {
    window.print();
    showToast('Opening print dialog');
  }, [showToast]);

  const handleDownloadPDF = useCallback(() => {
    window.print();
    showToast('Use Print dialog and select "Save as PDF"');
  }, [showToast]);

  const handleDownloadCSV = useCallback(() => {
    const { collections, payouts } = reportData;
    let csvContent = '';

    if (reportType === 'combined' || reportType === 'collections') {
      csvContent += 'COLLECTIONS REPORT\n';
      csvContent += 'Date,Teller Code,Teller Name,Location,Total Sales,Total Winners,Gross Surplus,Commission,Net Collected,Collected At\n';
      collections.forEach(c => {
        csvContent += `${c.date},${c.tellerCode},${c.tellerName},${c.location},${c.totalSales},${c.totalWinners},${c.grossSurplus},${c.commission},${c.netCollected},${c.collectedAt}\n`;
      });
      csvContent += '\n';
    }

    if (reportType === 'combined' || reportType === 'payouts') {
      csvContent += 'PAYOUTS REPORT\n';
      csvContent += 'Date,Teller Code,Teller Name,Location,Total Sales,Total Winners,Shortage,Payout Amount,Reason,Processed At\n';
      payouts.forEach(p => {
        csvContent += `${p.date},${p.tellerCode},${p.tellerName},${p.location},${p.totalSales},${p.totalWinners},${p.shortage},${p.payoutAmount},${p.reason},${p.processedAt}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `collector_report_${dateFrom}_to_${dateTo}.csv`;
    link.click();
    showToast('CSV downloaded successfully');
  }, [reportData, reportType, dateFrom, dateTo, showToast]);

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card collections">
        <div className="stat-value">{formatCurrency(statistics.totalCollections)}</div>
        <div className="stat-label">Total Collections</div>
      </div>
      <div className="stat-card payouts">
        <div className="stat-value">{formatCurrency(statistics.totalPayouts)}</div>
        <div className="stat-label">Total Payouts</div>
      </div>
      <div className="stat-card net">
        <div className="stat-value">{formatCurrency(statistics.netPosition)}</div>
        <div className="stat-label">Net Position</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{statistics.collectionsCount + statistics.payoutsCount}</div>
        <div className="stat-label">Total Transactions</div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p className="header-subtitle">Generate remittance and combined payouts/tapal reports</p>
        </div>
        <Link to="/collector" className="back-btn" aria-label="Back to Dashboard">
          <span aria-hidden="true">←</span> Back To Dashboard
        </Link>
      </header>

      {/* Statistics Summary */}
      <section className="card statistics-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Report Summary
        </h2>
        <StatisticsCards />
      </section>

      {/* Report Configuration */}
      <section className="card configuration-section">
        <h2 className="section-title">
          <span className="section-icon">⚙️</span>
          Report Configuration
        </h2>
        
        <div className="config-grid">
          <div className="config-group">
            <label htmlFor="report-type" className="config-label">Report Type</label>
            <select
              id="report-type"
              className="config-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="combined">Combined Report</option>
              <option value="collections">Collections Only</option>
              <option value="payouts">Payouts Only</option>
            </select>
          </div>

          <div className="config-group">
            <label htmlFor="date-from" className="config-label">Date From</label>
            <input
              id="date-from"
              type="date"
              className="config-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="config-group">
            <label htmlFor="date-to" className="config-label">Date To</label>
            <input
              id="date-to"
              type="date"
              className="config-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="generate-section">
          <button
            className="generate-btn"
            onClick={handleGenerateReport}
            disabled={isGenerating || !dateFrom || !dateTo}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span>📄</span>
                Generate Report
              </>
            )}
          </button>
        </div>
      </section>

      {/* Report Preview */}
      {showPreview && (
        <section className="card preview-section">
          <div className="preview-header">
            <h2 className="section-title">
              <span className="section-icon">📄</span>
              Report Preview
            </h2>
            <div className="preview-actions">
              <button onClick={handlePrint} className="btn btn-secondary">
                <span>🖨️</span> Print
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-primary">
                <span>📥</span> Download PDF
              </button>
              <button onClick={handleDownloadCSV} className="btn btn-success">
                <span>📊</span> Download CSV
              </button>
            </div>
          </div>

          <div className="preview-container">
            <div className="report-preview">
              {/* Report Header */}
              <div className="report-header">
                <div className="company-header">
                  <h1>STL Gaming System</h1>
                  <p>Collector Financial Report</p>
                  <p>Philippine Charity Sweepstakes Office</p>
                </div>
                <div className="report-meta">
                  <div><strong>Report Type:</strong> {reportType === 'combined' ? 'Combined Report' : reportType === 'collections' ? 'Collections Only' : 'Payouts Only'}</div>
                  <div><strong>Period:</strong> {dateFrom} to {dateTo}</div>
                  <div><strong>Generated:</strong> {new Date().toLocaleString('en-PH')}</div>
                  <div><strong>Generated By:</strong> Collector C001</div>
                </div>
              </div>

              {/* Report Summary */}
              <div className="report-summary">
                <h2>Executive Summary</h2>
                <div className="summary-grid">
                  {(reportType === 'combined' || reportType === 'collections') && (
                    <>
                      <div className="summary-item">
                        <span>Total Collections:</span>
                        <span className="amount positive">{formatCurrency(statistics.totalCollections)}</span>
                      </div>
                      <div className="summary-item">
                        <span>Gross Surplus:</span>
                        <span className="amount">{formatCurrency(statistics.totalGrossSurplus)}</span>
                      </div>
                      <div className="summary-item">
                        <span>Total Commissions:</span>
                        <span className="amount">{formatCurrency(statistics.totalCommissions)}</span>
                      </div>
                    </>
                  )}
                  
                  {(reportType === 'combined' || reportType === 'payouts') && (
                    <div className="summary-item">
                      <span>Total Payouts/Tapal:</span>
                      <span className="amount negative">{formatCurrency(statistics.totalPayouts)}</span>
                    </div>
                  )}

                  {reportType === 'combined' && (
                    <div className="summary-item total">
                      <span>Net Position:</span>
                      <span className={`amount ${statistics.netPosition >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(statistics.netPosition)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Collections Report Section */}
              {(reportType === 'combined' || reportType === 'collections') && reportData.collections.length > 0 && (
                <div className="report-section">
                  <h2>Collections Report</h2>
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Teller Code</th>
                          <th>Teller Name</th>
                          <th>Location</th>
                          <th>Total Sales</th>
                          <th>Winners</th>
                          <th>Surplus</th>
                          <th>Commission</th>
                          <th>Net Collected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.collections.map((collection, index) => (
                          <tr key={index}>
                            <td>{collection.date}</td>
                            <td>{collection.tellerCode}</td>
                            <td>{collection.tellerName}</td>
                            <td>{collection.location}</td>
                            <td className="amount">{formatCurrency(collection.totalSales)}</td>
                            <td className="amount">{formatCurrency(collection.totalWinners)}</td>
                            <td className="amount">{formatCurrency(collection.grossSurplus)}</td>
                            <td className="amount">{formatCurrency(collection.commission)}</td>
                            <td className="amount">{formatCurrency(collection.netCollected)}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="4"><strong>TOTAL COLLECTIONS</strong></td>
                          <td className="amount"><strong>{formatCurrency(reportData.collections.reduce((s, c) => s + c.totalSales, 0))}</strong></td>
                          <td className="amount"><strong>{formatCurrency(reportData.collections.reduce((s, c) => s + c.totalWinners, 0))}</strong></td>
                          <td className="amount"><strong>{formatCurrency(statistics.totalGrossSurplus)}</strong></td>
                          <td className="amount"><strong>{formatCurrency(statistics.totalCommissions)}</strong></td>
                          <td className="amount"><strong>{formatCurrency(statistics.totalCollections)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payouts Report Section */}
              {(reportType === 'combined' || reportType === 'payouts') && reportData.payouts.length > 0 && (
                <div className="report-section">
                  <h2>Payouts & Tapal Report</h2>
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Teller Code</th>
                          <th>Teller Name</th>
                          <th>Location</th>
                          <th>Total Sales</th>
                          <th>Winners</th>
                          <th>Shortage</th>
                          <th>Payout</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.payouts.map((payout, index) => (
                          <tr key={index}>
                            <td>{payout.date}</td>
                            <td>{payout.tellerCode}</td>
                            <td>{payout.tellerName}</td>
                            <td>{payout.location}</td>
                            <td className="amount">{formatCurrency(payout.totalSales)}</td>
                            <td className="amount">{formatCurrency(payout.totalWinners)}</td>
                            <td className="amount">{formatCurrency(payout.shortage)}</td>
                            <td className="amount">{formatCurrency(payout.payoutAmount)}</td>
                            <td>{payout.reason.replace(/_/g, ' ').toUpperCase()}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="4"><strong>TOTAL PAYOUTS</strong></td>
                          <td className="amount"><strong>{formatCurrency(reportData.payouts.reduce((s, p) => s + p.totalSales, 0))}</strong></td>
                          <td className="amount"><strong>{formatCurrency(reportData.payouts.reduce((s, p) => s + p.totalWinners, 0))}</strong></td>
                          <td className="amount"><strong>{formatCurrency(reportData.payouts.reduce((s, p) => s + p.shortage, 0))}</strong></td>
                          <td className="amount"><strong>{formatCurrency(statistics.totalPayouts)}</strong></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report Footer */}
              <div className="report-footer">
                <p>Report Certification:</p>
                <ul>
                  <li>All amounts have been verified and reconciled</li>
                  <li>Commission rate of 5% has been applied to all collections</li>
                  <li>All payouts/tapal have been properly documented with reasons</li>
                  <li>This report is generated automatically by the STL Gaming System</li>
                </ul>
                <div className="signature-section">
                  <div className="signature">
                    <p>_________________________</p>
                    <p>Collector Signature</p>
                    <p>Collector C001</p>
                  </div>
                  <div className="signature">
                    <p>_________________________</p>
                    <p>Supervisor Approval</p>
                    <p>Date: {new Date().toLocaleDateString('en-PH')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Reports;