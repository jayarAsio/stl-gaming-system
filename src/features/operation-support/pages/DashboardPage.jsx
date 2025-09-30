import React, { useState } from 'react';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    todaySales: 847293,
    transactions: 1247,
    payouts: 52100,
    netCollection: 795193
  });

  const [recentActivity] = useState([
    { id: 1, time: '14:30', activity: 'Daily reconciliation completed', status: 'complete', amount: 847293 },
    { id: 2, time: '13:15', activity: 'Discrepancy flagged - Teller 003', status: 'review', amount: -1500 },
    { id: 3, time: '12:00', activity: 'Ledger update - Batch 847', status: 'posted', amount: 45200 }
  ]);

  const formatCurrency = (amount) => `₱${Math.abs(amount).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const statusMap = {
      complete: { className: 'status-success', label: 'Complete' },
      review: { className: 'status-warning', label: 'Under Review' },
      posted: { className: 'status-success', label: 'Posted' }
    };
    
    const statusInfo = statusMap[status] || statusMap.complete;
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  return (
    <>
      <div className="operations-card">
        <h3>Operations Overview</h3>
        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(metrics.todaySales)}</div>
            <div className="metric-label">Today's Sales</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.transactions.toLocaleString()}</div>
            <div className="metric-label">Transactions</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(metrics.payouts)}</div>
            <div className="metric-label">Payouts</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(metrics.netCollection)}</div>
            <div className="metric-label">Net Collection</div>
          </div>
        </div>
      </div>

      <div className="operations-card">
        <h3>System Status</h3>
        <div className="flex items-center gap-4">
          <span className="status-badge status-success">Ledger: Balanced</span>
          <span className="status-badge status-success">Reconciliation: Complete</span>
          <span className="status-badge status-warning">3 Pending Reviews</span>
        </div>
      </div>

      <div className="operations-card">
        <h3>Recent Activity</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Activity</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.time}</td>
                <td>{activity.activity}</td>
                <td>{getStatusBadge(activity.status)}</td>
                <td style={{ color: activity.amount < 0 ? 'var(--danger)' : 'inherit' }}>
                  {activity.amount < 0 ? '-' : ''}{formatCurrency(activity.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DashboardPage;