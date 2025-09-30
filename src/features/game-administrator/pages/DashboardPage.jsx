import React, { useState } from 'react';

const DashboardPage = () => {
  const [stats] = useState({
    activeGames: 12,
    totalUsers: 847,
    todayDraws: 24,
    systemHealth: 98.5
  });

  return (
    <>
      <div className="ga-card">
        <h3>System Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--ga-gray-50)', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-200)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--ga-accent)' }}>{stats.activeGames}</div>
            <div style={{ color: 'var(--ga-gray-500)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Active Games</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--ga-gray-50)', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-200)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--ga-purple)' }}>{stats.totalUsers}</div>
            <div style={{ color: 'var(--ga-gray-500)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Total Users</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--ga-gray-50)', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-200)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--ga-teal)' }}>{stats.todayDraws}</div>
            <div style={{ color: 'var(--ga-gray-500)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Today's Draws</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--ga-gray-50)', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-200)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--ga-success)' }}>{stats.systemHealth}%</div>
            <div style={{ color: 'var(--ga-gray-500)', marginTop: '0.5rem', fontSize: '0.875rem' }}>System Health</div>
          </div>
        </div>
      </div>

      <div className="ga-card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{ padding: '0.875rem 1.5rem', background: 'linear-gradient(135deg, var(--ga-accent) 0%, var(--ga-purple) 100%)', color: 'white', border: 'none', borderRadius: 'var(--ga-radius)', fontWeight: '600', cursor: 'pointer' }}>
            Start New Draw
          </button>
          <button style={{ padding: '0.875rem 1.5rem', background: 'var(--ga-gray-100)', color: 'var(--ga-gray-700)', border: '1px solid var(--ga-gray-300)', borderRadius: 'var(--ga-radius)', fontWeight: '600', cursor: 'pointer' }}>
            View Reports
          </button>
          <button style={{ padding: '0.875rem 1.5rem', background: 'var(--ga-gray-100)', color: 'var(--ga-gray-700)', border: '1px solid var(--ga-gray-300)', borderRadius: 'var(--ga-radius)', fontWeight: '600', cursor: 'pointer' }}>
            System Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;