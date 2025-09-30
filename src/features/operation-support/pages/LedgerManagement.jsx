import React, { useState } from 'react';

const LedgerManagement = () => {
  const [ledgerEntries] = useState([
    { id: 1, date: '2025-09-30', batch: 'B-847', type: 'Sales', amount: 45200, status: 'posted' },
    { id: 2, date: '2025-09-30', batch: 'B-846', type: 'Payout', amount: -8500, status: 'posted' },
    { id: 3, date: '2025-09-30', batch: 'B-845', type: 'Sales', amount: 67300, status: 'pending' }
  ]);

  const formatCurrency = (amount) => {
    const sign = amount < 0 ? '-' : '';
    return `${sign}₱${Math.abs(amount).toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      posted: { className: 'status-success', label: 'Posted' },
      pending: { className: 'status-warning', label: 'Pending' }
    };
    return <span className={`status-badge ${statusMap[status].className}`}>{statusMap[status].label}</span>;
  };

  return (
    <>
      <div className="operations-card">
        <h3>Ledger Entries</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Batch #</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.batch}</td>
                <td>{entry.type}</td>
                <td style={{ fontWeight: 600, color: entry.amount < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {formatCurrency(entry.amount)}
                </td>
                <td>{getStatusBadge(entry.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LedgerManagement;