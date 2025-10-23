// ============================================
// User Management - Super Admin
// Create and manage all system users
// ============================================
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auser-management.css';

const UserManagement = () => {
  const navigate = useNavigate();
  
  // User data
  const [users, setUsers] = useState([
    {
      id: 'SA-0001',
      username: 'superadmin',
      fullName: 'Super Administrator',
      email: 'superadmin@stl.com',
      role: 'super-admin',
      module: 'Super Admin',
      status: 'active',
      lastLogin: '2024-10-24 09:30 AM',
      createdDate: '2024-01-15',
      createdBy: 'System'
    },
    {
      id: 'GA-0001',
      username: 'gameadmin01',
      fullName: 'Juan Dela Cruz',
      email: 'juan.delacruz@stl.com',
      role: 'game-admin',
      module: 'Game Administrator',
      status: 'active',
      lastLogin: '2024-10-24 08:45 AM',
      createdDate: '2024-02-10',
      createdBy: 'Super Admin'
    },
    {
      id: 'GA-0002',
      username: 'gameadmin02',
      fullName: 'Maria Santos',
      email: 'maria.santos@stl.com',
      role: 'game-admin',
      module: 'Game Administrator',
      status: 'active',
      lastLogin: '2024-10-23 05:20 PM',
      createdDate: '2024-03-05',
      createdBy: 'Super Admin'
    },
    {
      id: 'OS-0001',
      username: 'opsupport01',
      fullName: 'Pedro Reyes',
      email: 'pedro.reyes@stl.com',
      role: 'ops-support',
      module: 'Operation Support',
      status: 'active',
      lastLogin: '2024-10-24 07:15 AM',
      createdDate: '2024-02-20',
      createdBy: 'Super Admin'
    },
    {
      id: 'GA-0003',
      username: 'gameadmin03',
      fullName: 'Ana Lopez',
      email: 'ana.lopez@stl.com',
      role: 'game-admin',
      module: 'Game Administrator',
      status: 'suspended',
      lastLogin: '2024-10-20 02:30 PM',
      createdDate: '2024-04-12',
      createdBy: 'Super Admin'
    }
  ]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Role options
  const roleOptions = [
    { value: 'game-admin', label: 'Game Administrator', icon: '🎮' },
    { value: 'ops-support', label: 'Operation Support', icon: '⚙️' }
  ];

  // Get role details
  const getRoleDetails = (role) => {
    const details = {
      'super-admin': { label: 'Super Admin', icon: '👑', color: 'red' },
      'game-admin': { label: 'Game Administrator', icon: '🎮', color: 'purple' },
      'ops-support': { label: 'Operation Support', icon: '⚙️', color: 'cyan' }
    };
    return details[role] || { label: role, icon: '👤', color: 'gray' };
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      gameAdmins: users.filter(u => u.role === 'game-admin').length,
      opsSupport: users.filter(u => u.role === 'ops-support').length
    };
  }, [users]);

  // Create user
  const handleCreate = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const rolePrefix = formData.role === 'game-admin' ? 'GA' : 'OS';
    const existingIds = users
      .filter(u => u.id.startsWith(rolePrefix))
      .map(u => parseInt(u.id.split('-')[1]))
      .filter(Boolean);
    const nextNum = existingIds.length ? Math.max(...existingIds) + 1 : 1;
    const newId = `${rolePrefix}-${String(nextNum).padStart(4, '0')}`;

    const newUser = {
      id: newId,
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      module: roleOptions.find(r => r.value === formData.role)?.label || '',
      status: 'active',
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Super Admin'
    };

    setUsers([...users, newUser]);
    setShowCreateModal(false);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Edit user
  const handleEdit = (e) => {
    e.preventDefault();
    
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...formData }
        : u
    ));
    
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Delete user
  const handleDelete = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Toggle suspend
  const handleToggleSuspend = (userId) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
        : u
    ));
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  return (
    <div className="um-container">
      {/* Page Header */}
      <div className="um-header">
        <div className="um-header-left">
          <h1 className="um-title">User Management</h1>
          <p className="um-subtitle">Create and manage system administrator accounts</p>
        </div>
        <div className="um-header-right">
          <button 
            className="um-btn um-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="um-btn-icon">➕</span>
            <span className="um-btn-text">Create New User</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-blue">👥</div>
          <div className="um-stat-info">
            <div className="um-stat-value">{stats.total}</div>
            <div className="um-stat-label">Total Users</div>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-green">✓</div>
          <div className="um-stat-info">
            <div className="um-stat-value">{stats.active}</div>
            <div className="um-stat-label">Active</div>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-orange">⏸</div>
          <div className="um-stat-info">
            <div className="um-stat-value">{stats.suspended}</div>
            <div className="um-stat-label">Suspended</div>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-purple">🎮</div>
          <div className="um-stat-info">
            <div className="um-stat-value">{stats.gameAdmins}</div>
            <div className="um-stat-label">Game Admins</div>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-cyan">⚙️</div>
          <div className="um-stat-info">
            <div className="um-stat-value">{stats.opsSupport}</div>
            <div className="um-stat-label">Ops Support</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="um-filters">
        <div className="um-search-box">
          <span className="um-search-icon">🔍</span>
          <input
            type="text"
            className="um-search-input"
            placeholder="Search by name, username, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="um-filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="super-admin">Super Admin</option>
          <option value="game-admin">Game Administrator</option>
          <option value="ops-support">Operation Support</option>
        </select>
        <select 
          className="um-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const roleDetails = getRoleDetails(user.role);
              return (
                <tr key={user.id}>
                  <td className="um-cell-id">{user.id}</td>
                  <td className="um-cell-username">{user.username}</td>
                  <td className="um-cell-name">{user.fullName}</td>
                  <td className="um-cell-email">{user.email}</td>
                  <td>
                    <span className={`um-role-badge um-role-${roleDetails.color}`}>
                      <span className="um-role-icon">{roleDetails.icon}</span>
                      <span className="um-role-text">{roleDetails.label}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`um-status-badge um-status-${user.status}`}>
                      {user.status === 'active' ? '✓ Active' : '⏸ Suspended'}
                    </span>
                  </td>
                  <td className="um-cell-date">{user.lastLogin}</td>
                  <td>
                    <div className="um-actions">
                      {user.role !== 'super-admin' && (
                        <>
                          <button 
                            className="um-action-btn um-action-edit"
                            onClick={() => openEditModal(user)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className={`um-action-btn ${user.status === 'active' ? 'um-action-suspend' : 'um-action-activate'}`}
                            onClick={() => handleToggleSuspend(user.id)}
                            title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            {user.status === 'active' ? '⏸' : '▶'}
                          </button>
                          <button 
                            className="um-action-btn um-action-delete"
                            onClick={() => openDeleteModal(user)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {user.role === 'super-admin' && (
                        <span className="um-protected">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="um-empty-state">
            <span className="um-empty-icon">👤</span>
            <p className="um-empty-text">No users found</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="um-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3 className="um-modal-title">Create New User</h3>
              <button className="um-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="um-modal-body">
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label className="um-form-label">Username *</label>
                    <input
                      type="text"
                      className="um-form-input"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="um-form-field">
                    <label className="um-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="um-form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="um-form-field">
                  <label className="um-form-label">Email *</label>
                  <input
                    type="email"
                    className="um-form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="um-form-field">
                  <label className="um-form-label">Role *</label>
                  <select
                    className="um-form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="">Select role...</option>
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label className="um-form-label">Password *</label>
                    <input
                      type="password"
                      className="um-form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="um-form-field">
                    <label className="um-form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="um-form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="um-modal-footer">
                <button 
                  type="button" 
                  className="um-btn um-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="um-btn um-btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="um-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3 className="um-modal-title">Edit User</h3>
              <button className="um-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="um-modal-body">
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label className="um-form-label">Username *</label>
                    <input
                      type="text"
                      className="um-form-input"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="um-form-field">
                    <label className="um-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="um-form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="um-form-field">
                  <label className="um-form-label">Email *</label>
                  <input
                    type="email"
                    className="um-form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="um-form-field">
                  <label className="um-form-label">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="um-form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="um-modal-footer">
                <button 
                  type="button" 
                  className="um-btn um-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="um-btn um-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="um-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="um-modal um-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3 className="um-modal-title">Delete User</h3>
              <button className="um-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="um-modal-body">
              <p className="um-delete-message">
                Are you sure you want to delete <strong>{selectedUser.fullName}</strong> ({selectedUser.username})?
              </p>
              <p className="um-delete-warning">
                ⚠️ This action cannot be undone. The user will lose all access immediately.
              </p>
            </div>
            <div className="um-modal-footer">
              <button 
                className="um-btn um-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="um-btn um-btn-danger"
                onClick={handleDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;