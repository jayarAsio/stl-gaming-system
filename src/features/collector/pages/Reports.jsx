import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import "../styles/reports.css";

// Mock combined data from Sales Collection and Payout & Tapal modules
const mockReportData = {
  collections: [
    {
      tellerId: 'T001',
      tellerName: 'Juan Dela Cruz',
      tellerCode: 'TLR001',
      location: 'Booth A1',
      date: '2025-01-15',
      totalSales: 25420,
      totalWinners: 8650,
      grossSurplus: 16770,
      commission: 1271,
      netCollected: 15499,
      collectedAt: '2025-01-15 02:30 PM',
      collectedBy: 'Collector C001'
    },
    {
      tellerId: 'T003',
      tellerName: 'Pedro Garcia',
      tellerCode: 'TLR003',
      location: 'Booth C3',
      date: '2025-01-15',
      totalSales: 32750,
      totalWinners: 18900,
      grossSurplus: 13850,
      commission: 1637.5,
      netCollected: 12212.5,
      collectedAt: '2025-01-15 01:45 PM',
      collectedBy: 'Collector C001'
    },
    {
      tellerId: 'T007',
      tellerName: 'Miguel Fernandez',
      tellerCode: 'TLR007',
      location: 'Booth G7',
      date: '2025-01-15',
      totalSales: 2850,
      totalWinners: 0,
      grossSurplus: 2850,
      commission: 142.5,
      netCollected: 2707.5,
      collectedAt: '2025-01-15 03:15 PM',
      collectedBy: 'Collector C001'
    }
  ],
  payouts: [
    {
      tellerId: 'T004',
      tellerName: 'Ana Reyes',
      tellerCode: 'TLR004',
      location: 'Booth D4',
      date: '2025-01-15',
      totalSales: 31200,
      totalWinners: 45600,
      shortage: 14400,
      payoutAmount: 14400,
      processedAt: '2025-01-15 01:30 PM',
      processedBy: 'Collector C001',
      reason: 'insufficient_funds'
    },
    {
      tellerId: 'T002',
      tellerName: 'Maria Santos',
      tellerCode: 'TLR002',
      location: 'Booth B2',
      date: '2025-01-15',
      totalSales: 18150,
      totalWinners: 28350,
      shortage: 10200,
      payoutAmount: 10200,
      processedAt: '2025-01-15 10:45 AM',
      processedBy: 'Collector C001',
      reason: 'multiple_winners'
    }
  ],
  dailySummary: {
    '2025-01-15': {
      totalCollections: 30419,
      totalPayouts: 24600,
      netPosition: 5819,
      tellersWithSurplus: 3,
      tellersWithShortage: 2,
      totalTellers: 8
    },
    '2025-01-14': {
      totalCollections: 45200,
      totalPayouts: 18750,
      netPosition: 26450,
      tellersWithSurplus: 5,
      tellersWithShortage: 1,
      totalTellers: 8
    }
  }
};

const ReportsModule = () => {
  // State management
  const [reportType, setReportType] = useState('combined');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedTellers, setSelectedTellers] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize date range to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ from: today, to: today });
  }, []);

  // (removed realtime clock) - currentTime state was unused

  // Apply body class for background
  useEffect(() => {
    document.body.classList.add("reports-module-bg");
    return () => document.body.classList.remove("reports-module-bg");
  }, []);

  // Format currency
  const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  });

  // Toast notification system
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // Get unique tellers for filter
  const availableTellers = useMemo(() => {
    const tellers = new Set();
    mockReportData.collections.forEach(c => tellers.add(`${c.tellerId}:${c.tellerName}`));
    mockReportData.payouts.forEach(p => tellers.add(`${p.tellerId}:${p.tellerName}`));
    return Array.from(tellers).map(t => {
      const [id, name] = t.split(':');
      return { id, name };
    });
  }, []);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    const collections = mockReportData.collections.filter(item => {
      const dateMatch = !dateRange.from || !dateRange.to || 
        (item.date >= dateRange.from && item.date <= dateRange.to);
      const tellerMatch = selectedTellers.length === 0 || 
        selectedTellers.includes(item.tellerId);
      return dateMatch && tellerMatch;
    });

    const payouts = mockReportData.payouts.filter(item => {
      const dateMatch = !dateRange.from || !dateRange.to || 
        (item.date >= dateRange.from && item.date <= dateRange.to);
      const tellerMatch = selectedTellers.length === 0 || 
        selectedTellers.includes(item.tellerId);
      return dateMatch && tellerMatch;
    });

    return { collections, payouts };
  }, [dateRange, selectedTellers]);

  // Calculate report statistics
  const reportStats = useMemo(() => {
    const { collections, payouts } = filteredData;
    
    const totalCollections = collections.reduce((sum, c) => sum + c.netCollected, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.payoutAmount, 0);
    const totalCommission = collections.reduce((sum, c) => sum + c.commission, 0);
    const netPosition = totalCollections - totalPayouts;

    return {
      totalCollections,
      totalPayouts,
      totalCommission,
      netPosition,
      collectionsCount: collections.length,
      payoutsCount: payouts.length,
      totalTransactions: collections.length + payouts.length
    };
  }, [filteredData]);

  // Handle teller selection
  const handleTellerToggle = useCallback((tellerId) => {
    setSelectedTellers(prev => 
      prev.includes(tellerId) 
        ? prev.filter(id => id !== tellerId)
        : [...prev, tellerId]
    );
  }, []);

  // Generate report
  const handleGenerateReport = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) {
      showToast('Please select date range', 'error');
      return;
    }

    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      const report = {
        id: `RPT${Date.now().toString().slice(-8)}`,
        type: reportType,
        dateRange,
        selectedTellers: selectedTellers.length || 'All Tellers',
        data: filteredData,
        stats: reportStats,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Collector C001'
      };

      setGeneratedReport(report);
      setIsGenerating(false);
      setShowPreview(true);
      showToast('Report generated successfully', 'success');
    }, 2000);
  }, [reportType, dateRange, selectedTellers, filteredData, reportStats, showToast]);

  // Export as PDF (simulated)
  const handleExportPDF = useCallback(() => {
    if (!generatedReport) return;

    // In a real app, you'd use a library like jsPDF or react-pdf
    showToast('PDF export started - check downloads folder', 'success');
    
    // Simulate PDF generation
    setTimeout(() => {
      const blob = new Blob(['PDF content would be here'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedReport.type}-report-${generatedReport.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully', 'success');
    }, 1000);
  }, [generatedReport, showToast]);

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="statistics-grid">
      <div className="stat-card">
        <div className="stat-value">{reportStats.totalTransactions}</div>
        <div className="stat-label">Total Transactions</div>
      </div>
      <div className="stat-card collections">
        <div className="stat-value">{peso.format(reportStats.totalCollections)}</div>
        <div className="stat-label">Total Collections</div>
      </div>
      <div className="stat-card payouts">
        <div className="stat-value">{peso.format(reportStats.totalPayouts)}</div>
        <div className="stat-label">Total Payouts</div>
      </div>
      <div className="stat-card net">
        <div className="stat-value">{peso.format(Math.abs(reportStats.netPosition))}</div>
        <div className="stat-label">{reportStats.netPosition >= 0 ? 'Net Gain' : 'Net Loss'}</div>
      </div>
    </div>
  );

  // Report Preview Component
  const ReportPreview = ({ report }) => {
    if (!report) return null;

    return (
      <div className="report-preview">
        <div className="report-header">
          <div className="company-header">
            <h1>STL Gaming System</h1>
            <p>PCSO Licensed Gaming Operator</p>
            <p>Collector Financial Report</p>
          </div>
          <div className="report-meta">
            <div><strong>Report ID:</strong> {report.id}</div>
            <div><strong>Type:</strong> {report.type.toUpperCase()}</div>
            <div><strong>Period:</strong> {report.dateRange.from} to {report.dateRange.to}</div>
            <div><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString('en-PH')}</div>
            <div><strong>Generated By:</strong> {report.generatedBy}</div>
          </div>
        </div>

        <div className="report-summary">
          <h2>Executive Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Total Collections:</span>
              <span className="amount positive">{peso.format(report.stats.totalCollections)}</span>
            </div>
            <div className="summary-item">
              <span>Total Payouts:</span>
              <span className="amount negative">{peso.format(report.stats.totalPayouts)}</span>
            </div>
            <div className="summary-item">
              <span>Commission Earned:</span>
              <span className="amount">{peso.format(report.stats.totalCommission)}</span>
            </div>
            <div className="summary-item total">
              <span>Net Position:</span>
              <span className={`amount ${report.stats.netPosition >= 0 ? 'positive' : 'negative'}`}>
                {report.stats.netPosition >= 0 ? '+' : ''}{peso.format(report.stats.netPosition)}
              </span>
            </div>
          </div>
        </div>

        {(reportType === 'collections' || reportType === 'combined') && report.data.collections.length > 0 && (
          <div className="report-section">
            <h2>Collections Report</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Teller</th>
                    <th>Location</th>
                    <th>Total Sales</th>
                    <th>Winners</th>
                    <th>Gross Surplus</th>
                    <th>Commission</th>
                    <th>Net Collected</th>
                    <th>Collected At</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.collections.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tellerName} ({item.tellerCode})</td>
                      <td>{item.location}</td>
                      <td>{peso.format(item.totalSales)}</td>
                      <td>{peso.format(item.totalWinners)}</td>
                      <td>{peso.format(item.grossSurplus)}</td>
                      <td>{peso.format(item.commission)}</td>
                      <td className="amount positive">{peso.format(item.netCollected)}</td>
                      <td>{item.collectedAt}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="6"><strong>Total Collections:</strong></td>
                    <td className="amount positive"><strong>{peso.format(report.data.collections.reduce((sum, c) => sum + c.netCollected, 0))}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {(reportType === 'payouts' || reportType === 'combined') && report.data.payouts.length > 0 && (
          <div className="report-section">
            <h2>Payouts Report</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Teller</th>
                    <th>Location</th>
                    <th>Total Sales</th>
                    <th>Winners</th>
                    <th>Shortage</th>
                    <th>Payout Amount</th>
                    <th>Reason</th>
                    <th>Processed At</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.payouts.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tellerName} ({item.tellerCode})</td>
                      <td>{item.location}</td>
                      <td>{peso.format(item.totalSales)}</td>
                      <td>{peso.format(item.totalWinners)}</td>
                      <td>{peso.format(item.shortage)}</td>
                      <td className="amount negative">{peso.format(item.payoutAmount)}</td>
                      <td>{item.reason.replace(/_/g, ' ').toUpperCase()}</td>
                      <td>{item.processedAt}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="5"><strong>Total Payouts:</strong></td>
                    <td className="amount negative"><strong>{peso.format(report.data.payouts.reduce((sum, p) => sum + p.payoutAmount, 0))}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="report-footer">
          <p><strong>Report Notes:</strong></p>
          <ul>
            <li>All amounts are in Philippine Peso (PHP)</li>
            <li>Collections represent surplus amounts after winner payouts</li>
            <li>Payouts represent advances to tellers for insufficient funds</li>
            <li>Commission rate: 5% of gross sales</li>
            <li>This report is generated automatically by the STL Gaming System</li>
          </ul>
          <div className="signature-section">
            <div className="signature">
              <p>_________________________</p>
              <p>Collector Signature</p>
            </div>
            <div className="signature">
              <p>_________________________</p>
              <p>Supervisor Approval</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p className="header-subtitle">Generate remittance and combined payouts/tapal reports</p>
        </div>
        <Link 
          to="/collector"
          className="back-btn" 
          aria-label="Back to Dashboard"
        >
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
            <label htmlFor="date-from" className="config-label">From Date</label>
            <input
              id="date-from"
              type="date"
              className="config-input"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>

          <div className="config-group">
            <label htmlFor="date-to" className="config-label">To Date</label>
            <input
              id="date-to"
              type="date"
              className="config-input"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>

        <div className="teller-selection">
          <h3 className="selection-title">Select Tellers (Optional)</h3>
          <div className="teller-grid">
            {availableTellers.map(teller => (
              <label key={teller.id} className="teller-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTellers.includes(teller.id)}
                  onChange={() => handleTellerToggle(teller.id)}
                />
                <span className="checkbox-label">{teller.name}</span>
              </label>
            ))}
          </div>
          <div className="selection-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedTellers([])}
            >
              Clear All
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedTellers(availableTellers.map(t => t.id))}
            >
              Select All
            </button>
          </div>
        </div>

        <div className="generate-section">
          <button
            className="btn btn-primary generate-btn"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating Report...
              </>
            ) : (
              <>
                <span>📋</span>
                Generate Report
              </>
            )}
          </button>
        </div>
      </section>

      {/* Report Preview */}
      {showPreview && generatedReport && (
        <section className="card preview-section">
          <div className="preview-header">
            <h2 className="section-title">
              <span className="section-icon">📄</span>
              Report Preview
            </h2>
            <div className="preview-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </button>
              <button
                className="btn btn-success"
                onClick={handleExportPDF}
              >
                <span>📥</span>
                Export PDF
              </button>
            </div>
          </div>
          
          <div className="preview-container">
            <ReportPreview report={generatedReport} />
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ReportsModule;