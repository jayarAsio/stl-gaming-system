import React, { useState } from 'react';

const UserManagement = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', role: 'Teller', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', role: 'Collector', status: 'Active', lastLogin: '5 hours ago' },
    { id: 3, name: 'Bob Johnson', role: 'Teller', status: 'Inactive', lastLogin: '2 days ago' }
  ]);

  return (
    <>
      <div className="ga-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>User Management</h3>
          <button style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, var(--ga-accent) 0%, var(--ga-purple) 100%)', color: 'white', border: 'none', borderRadius: 'var(--ga-radius)', fontWeight: '600', cursor: 'pointer' }}>
            + Add User
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ga-gray-200)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--ga-gray-700)' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--ga-gray-700)' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--ga-gray-700)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--ga-gray-700)' }}>Last Login</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--ga-gray-700)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--ga-gray-200)' }}>
                <td style={{ padding: '1rem' }}>{user.name}</td>
                <td style={{ padding: '1rem' }}>{user.role}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: user.status === 'Active' ? 'var(--ga-success-bg)' : 'var(--ga-gray-200)',
                    color: user.status === 'Active' ? 'var(--ga-success)' : 'var(--ga-gray-600)'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--ga-gray-500)' }}>{user.lastLogin}</td>
                <td style={{ padding: '1rem' }}>
                  <button style={{ padding: '0.5rem 1rem', background: 'var(--ga-gray-100)', border: '1px solid var(--ga-gray-300)', borderRadius: 'var(--ga-radius-sm)', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserManagement;