import React from 'react';

const Escalations = () => {
  return (
    <div className="sa-card">
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>Escalations</h3>
      <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', marginTop: '1rem' }}>
        <p style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: '600' }}>⚠️ 3 escalations require immediate attention</p>
      </div>
      <p style={{ color: '#94A3B8', fontSize: '1rem', marginTop: '1rem' }}>
        Critical issues and escalations from lower administrative levels.
      </p>
    </div>
  );
};

export default Escalations;