import React from 'react';

const Configuration = () => {
  return (
    <>
      <div className="ga-card">
        <h3>System Configuration</h3>
        <p style={{ color: 'var(--ga-gray-500)' }}>
          Configure system settings, game parameters, and operational rules.
        </p>
      </div>

      <div className="ga-card">
        <h3>Game Settings</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ga-gray-700)' }}>
              Draw Frequency
            </label>
            <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-300)' }}>
              <option>Every Hour</option>
              <option>Every 2 Hours</option>
              <option>Every 4 Hours</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ga-gray-700)' }}>
              Maximum Bet Amount
            </label>
            <input type="number" placeholder="Enter amount" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--ga-radius)', border: '1px solid var(--ga-gray-300)' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Configuration;