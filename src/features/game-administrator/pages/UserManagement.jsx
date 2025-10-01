import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/user-management.css';

const UserManagement = () => {
  // Initial data
  const [tellers, setTellers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('UM_TELLERS_V1') || '[]').length > 0
        ? JSON.parse(localStorage.getItem('UM_TELLERS_V1'))
        : [
            { id: 'T-0001', name: 'Ana Cruz', area: 'Toril', lastActive: 'Sep 10, 2025 · 14:22', assigned: 'Joy Santos', contact: '+63 917 555 0123', address: 'Blk 5 Lot 18, Purok 4, Toril, Davao City', username: 'ana.cruz', email: 'ana.cruz@example.com', device: 'IOS-A12-9F3', twofa: 'Enabled', suspended: false },
            { id: 'T-0002', name: 'Mark Dela Peña', area: 'Buhangin', lastActive: 'Sep 09, 2025 · 09:05', assigned: 'Leo Tan', contact: '+63 998 222 0045', address: 'Blk 2 Lot 9, Buhangin, Davao City', username: 'mark.dp', email: 'mark.dp@example.com', device: 'AND-S20-2C1', twofa: 'Disabled', suspended: true },
            { id: 'T-0003', name: 'Carla Reyes', area: 'Lanang', lastActive: 'Sep 10, 2025 · 16:40', assigned: 'Joy Santos', contact: '+63 921 111 0303', address: 'Purok 3, Lanang, Davao City', username: 'carla.r', email: 'carla.r@example.com', device: 'IOS-13P-7ZZ', twofa: 'Enabled', suspended: false },
            { id: 'T-0004', name: 'Lara Torres', area: 'Agdao', lastActive: 'Sep 08, 2025 · 17:12', assigned: 'Rhea Mercado', contact: '+63 920 333 0404', address: 'Agdao, Davao City', username: 'lara.t', email: 'lara.t@example.com', device: 'AND-A54-1P2', twofa: 'Disabled', suspended: true },
            { id: 'T-0005', name: 'Paolo Garcia', area: 'Sasa', lastActive: 'Sep 11, 2025 · 09:02', assigned: 'Earl Andres', contact: '+63 917 555 0505', address: 'Sasa, Davao City', username: 'paolo.g', email: 'paolo.g@example.com', device: 'IOS-11P-3AA', twofa: 'Enabled', suspended: false },
          ];
    } catch {
      return [];
    }
  });

  const [collectors, setCollectors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('UM_COLLECTORS_V1') || '[]').length > 0
        ? JSON.parse(localStorage.getItem('UM_COLLECTORS_V1'))
        : [
            { id: 'C-0101', name: 'Joy Santos', area: 'Matina Aplaya', lastSync: 'Sep 10, 2025 · 20:44', contact: '+63 917 555 0456', address: 'Purok 2, Matina Aplaya, Davao City', username: 'joy.s', email: 'joy.s@example.com', device: 'IOS-11P-7XZ', twofa: 'Enabled', tellers: ['Ana Cruz (T-0001)', 'Carla Reyes (T-0003)'], suspended: false },
            { id: 'C-0102', name: 'Leo Tan', area: 'Agdao', lastSync: 'Sep 07, 2025 · 11:18', contact: '+63 995 123 0088', address: 'Blk 7, Agdao, Davao City', username: 'leo.t', email: 'leo.t@example.com', device: 'AND-A54-1P2', twofa: 'Disabled', tellers: ['Mark Dela Peña (T-0002)'], suspended: true },
            { id: 'C-0103', name: 'Rhea Mercado', area: 'Lanang', lastSync: 'Sep 11, 2025 · 06:55', contact: '+63 917 888 0303', address: 'Lanang, Davao City', username: 'rhea.m', email: 'rhea.m@example.com', device: 'IOS-12M-8QQ', twofa: 'Enabled', tellers: ['Lara Torres (T-0004)'], suspended: false },
          ];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('tellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, data: null, type: null });
  const [createModal, setCreateModal] = useState({ open: false, type: null });
  const [editModal, setEditModal] = useState({ open: false, data: null, type: null });

  // Form data
  const [formData, setFormData] = useState({});

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('UM_TELLERS_V1', JSON.stringify(tellers));
  }, [tellers]);

  useEffect(() => {
    localStorage.setItem('UM_COLLECTORS_V1', JSON.stringify(collectors));
  }, [collectors]);

  // Body scroll lock
  useEffect(() => {
    const isOpen = viewModal.open || createModal.open || editModal.open;
    document.body.classList.toggle('um-lock', isOpen);
    document.body.classList.toggle('um-blur-bg', isOpen);
    return () => {
      document.body.classList.remove('um-lock', 'um-blur-bg');
    };
  }, [viewModal.open, createModal.open, editModal.open]);

  // Helpers
  const getInitials = (name) => {
    return (name || 'NA')
      .trim()
      .split(/\s+/)
      .map(s => s[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const parseDateTime = (str) => {
    const match = str.match(/([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})\s*[·•]\s*(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const [_, mon, d, y, hh, mm] = match;
    return new Date(Number(y), months[mon], Number(d), Number(hh), Number(mm)).getTime();
  };

  const formatDateTime = () => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    return `${month} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Statistics
  const stats = {
    tellersActive: tellers.filter(t => !t.suspended).length,
    tellersSuspended: tellers.filter(t => t.suspended).length,
    tellersTotal: tellers.length,
    collectorsActive: collectors.filter(c => !c.suspended).length,
    collectorsSuspended: collectors.filter(c => c.suspended).length,
    collectorsTotal: collectors.length,
  };

  // Sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle status sorting
      if (sortConfig.key === 'suspended') {
        aVal = a.suspended ? 0 : 1;
        bVal = b.suspended ? 0 : 1;
      }

      // Handle date sorting
      if (sortConfig.key === 'lastActive' || sortConfig.key === 'lastSync') {
        aVal = parseDateTime(aVal || '');
        bVal = parseDateTime(bVal || '');
      }

      // String sorting
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filtering
  const filterData = (data) => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
  };

  const getFilteredAndSorted = (data) => sortData(filterData(data));

  const displayedTellers = getFilteredAndSorted(tellers);
  const displayedCollectors = getFilteredAndSorted(collectors);

  // CRUD Operations
  const handleToggleSuspend = (id, type) => {
    if (type === 'teller') {
      setTellers(prev =>
        prev.map(t => t.id === id ? { ...t, suspended: !t.suspended } : t)
      );
    } else {
      setCollectors(prev =>
        prev.map(c => c.id === id ? { ...c, suspended: !c.suspended } : c)
      );
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const type = createModal.type;

    if (type === 'teller') {
      const ids = tellers.map(t => parseInt(t.id.split('-')[1])).filter(Boolean);
      const nextNum = ids.length ? Math.max(...ids) + 1 : 1;
      const newId = `T-${String(nextNum).padStart(4, '0')}`;

      const newTeller = {
        id: newId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        area: formData.area,
        lastActive: formatDateTime(),
        assigned: formData.assigned || '—',
        contact: formData.contact,
        address: formData.address,
        username: `${formData.firstName}.${formData.lastName}`.toLowerCase(),
        email: `${formData.firstName}.${formData.lastName}@example.com`.toLowerCase(),
        device: '—',
        twofa: 'Enabled',
        suspended: false
      };

      setTellers(prev => [...prev, newTeller]);
    } else {
      const ids = collectors.map(c => parseInt(c.id.split('-')[1])).filter(Boolean);
      const nextNum = ids.length ? Math.max(...ids) + 1 : 101;
      const newId = `C-${String(nextNum).padStart(4, '0')}`;

      const newCollector = {
        id: newId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        area: formData.area,
        lastSync: formatDateTime(),
        contact: formData.contact,
        address: formData.address,
        username: `${formData.firstName}.${formData.lastName}`.toLowerCase(),
        email: `${formData.firstName}.${formData.lastName}@example.com`.toLowerCase(),
        device: '—',
        twofa: 'Enabled',
        tellers: [],
        suspended: false
      };

      setCollectors(prev => [...prev, newCollector]);
    }

    setCreateModal({ open: false, type: null });
    setFormData({});
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const { id, type } = editModal.data;
    const name = `${formData.firstName} ${formData.lastName}`.trim();

    if (type === 'teller') {
      setTellers(prev =>
        prev.map(t =>
          t.id === id
            ? {
                ...t,
                name,
                area: formData.area,
                contact: formData.contact,
                address: formData.address,
                assigned: formData.assigned || '—',
                username: `${formData.firstName}.${formData.lastName}`.toLowerCase(),
                email: `${formData.firstName}.${formData.lastName}@example.com`.toLowerCase(),
              }
            : t
        )
      );
    } else {
      setCollectors(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                name,
                area: formData.area,
                contact: formData.contact,
                address: formData.address,
                username: `${formData.firstName}.${formData.lastName}`.toLowerCase(),
                email: `${formData.firstName}.${formData.lastName}@example.com`.toLowerCase(),
              }
            : c
        )
      );
    }

    setEditModal({ open: false, data: null, type: null });
    setFormData({});
  };

  // Modal handlers
  const openViewModal = (item, type) => {
    setViewModal({ open: true, data: item, type });
  };

  const openCreateModal = (type) => {
    setFormData({});
    setCreateModal({ open: true, type });
  };

  const openEditModal = (item, type) => {
    const [firstName, ...lastNameParts] = item.name.split(' ');
    setFormData({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      area: item.area || '',
      contact: item.contact || '',
      address: item.address || '',
      assigned: item.assigned || ''
    });
    setEditModal({ open: true, data: { ...item, type }, type });
  };

  const closeModals = () => {
    setViewModal({ open: false, data: null, type: null });
    setCreateModal({ open: false, type: null });
    setEditModal({ open: false, data: null, type: null });
    setFormData({});
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModals();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="um-container">
      <div className="um-card">
        {/* Tabs */}
        <div className="um-tabbar">
          <button
            className={`um-tab ${activeTab === 'tellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('tellers')}
          >
            👥 Tellers
          </button>
          <button
            className={`um-tab ${activeTab === 'collectors' ? 'active' : ''}`}
            onClick={() => setActiveTab('collectors')}
          >
            📋 Collectors
          </button>
          <div className="um-grow" />
          {activeTab === 'tellers' && (
            <button className="um-btn um-btn-primary" onClick={() => openCreateModal('teller')}>
              + Create Teller
            </button>
          )}
          {activeTab === 'collectors' && (
            <button className="um-btn um-btn-primary" onClick={() => openCreateModal('collector')}>
              + Create Collector
            </button>
          )}
        </div>

        {/* Tools & Stats */}
        <div className="um-tools">
          <div className="um-search">
            <span className="um-search-icon">🔍</span>
            <input
              type="text"
              className="um-input"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="um-stats">
            {activeTab === 'tellers' ? (
              <>
                <span className="um-stat um-stat-success">Active <strong>{stats.tellersActive}</strong></span>
                <span className="um-stat um-stat-danger">Suspended <strong>{stats.tellersSuspended}</strong></span>
                <span className="um-stat">Total <strong>{stats.tellersTotal}</strong></span>
              </>
            ) : (
              <>
                <span className="um-stat um-stat-success">Active <strong>{stats.collectorsActive}</strong></span>
                <span className="um-stat um-stat-danger">Suspended <strong>{stats.collectorsSuspended}</strong></span>
                <span className="um-stat">Total <strong>{stats.collectorsTotal}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Tables */}
        <div className="um-table-wrap">
          {activeTab === 'tellers' ? (
            <table className="um-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Teller {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('area')}>
                    Area {sortConfig.key === 'area' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('suspended')}>
                    Status {sortConfig.key === 'suspended' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('lastActive')}>
                    Last Active {sortConfig.key === 'lastActive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTellers.map((teller, idx) => (
                  <tr key={teller.id}>
                    <td>
                      <div className="um-person">
                        <span className="um-avatar">{getInitials(teller.name)}</span>
                        <div>
                          <div className="um-name">{teller.name}</div>
                          <div className="um-sub">ID: {teller.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{teller.area}</td>
                    <td>
                      <span className={`um-pill ${teller.suspended ? 'um-pill-danger' : 'um-pill-success'}`}>
                        {teller.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td>{teller.lastActive}</td>
                    <td className="um-actions">
                      <button className="um-btn-ghost" onClick={() => openViewModal(teller, 'teller')}>View</button>
                      <button className="um-btn-ghost" onClick={() => openEditModal(teller, 'teller')}>Edit</button>
                      <button
                        className="um-btn-ghost"
                        onClick={() => handleToggleSuspend(teller.id, 'teller')}
                      >
                        {teller.suspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="um-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Collector {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('area')}>
                    Area {sortConfig.key === 'area' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('suspended')}>
                    Status {sortConfig.key === 'suspended' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('lastSync')}>
                    Last Sync {sortConfig.key === 'lastSync' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCollectors.map((collector, idx) => (
                  <tr key={collector.id}>
                    <td>
                      <div className="um-person">
                        <span className="um-avatar">{getInitials(collector.name)}</span>
                        <div>
                          <div className="um-name">{collector.name}</div>
                          <div className="um-sub">ID: {collector.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{collector.area}</td>
                    <td>
                      <span className={`um-pill ${collector.suspended ? 'um-pill-danger' : 'um-pill-success'}`}>
                        {collector.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td>{collector.lastSync}</td>
                    <td className="um-actions">
                      <button className="um-btn-ghost" onClick={() => openViewModal(collector, 'collector')}>View</button>
                      <button className="um-btn-ghost" onClick={() => openEditModal(collector, 'collector')}>Edit</button>
                      <button
                        className="um-btn-ghost"
                        onClick={() => handleToggleSuspend(collector.id, 'collector')}
                      >
                        {collector.suspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModal.open && viewModal.data && createPortal(
        <>
          <div className="um-modal-overlay active" onClick={closeModals} />
          <div className="um-modal-container active">
            <div className="um-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>{viewModal.type === 'teller' ? 'Teller' : 'Collector'} Details</h3>
                <button className="um-modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="um-modal-body">
                <div className="um-profile">
                  <span className="um-avatar-lg">{getInitials(viewModal.data.name)}</span>
                  <div>
                    <h4>{viewModal.data.name}</h4>
                    <p>{viewModal.data.id} · {viewModal.data.area}</p>
                  </div>
                  <span className={`um-pill ${viewModal.data.suspended ? 'um-pill-danger' : 'um-pill-success'}`}>
                    {viewModal.data.suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <div className="um-details">
                  <div className="um-detail-grid">
                    <div>
                      <label>Contact</label>
                      <p>{viewModal.data.contact}</p>
                    </div>
                    <div>
                      <label>Address</label>
                      <p>{viewModal.data.address}</p>
                    </div>
                    <div>
                      <label>Username</label>
                      <p>{viewModal.data.username}</p>
                    </div>
                    <div>
                      <label>Email</label>
                      <p>{viewModal.data.email}</p>
                    </div>
                    <div>
                      <label>Device</label>
                      <p>{viewModal.data.device}</p>
                    </div>
                    <div>
                      <label>2FA</label>
                      <p>{viewModal.data.twofa}</p>
                    </div>
                    {viewModal.type === 'teller' && (
                      <div>
                        <label>Assigned To</label>
                        <p>{viewModal.data.assigned || '—'}</p>
                      </div>
                    )}
                  </div>
                  {viewModal.type === 'collector' && viewModal.data.tellers && (
                    <div className="um-tellers-list">
                      <label>Assigned Tellers</label>
                      <ul>
                        {viewModal.data.tellers.length ? viewModal.data.tellers.map((t, i) => <li key={i}>{t}</li>) : <li>—</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="um-modal-footer">
                <button className="um-btn-secondary" onClick={closeModals}>Close</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Create Modal */}
      {createModal.open && createPortal(
        <>
          <div className="um-modal-overlay active" onClick={closeModals} />
          <div className="um-modal-container active">
            <form className="um-modal-content" onSubmit={handleCreate} onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>Create {createModal.type === 'teller' ? 'Teller' : 'Collector'}</h3>
                <button type="button" className="um-modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="um-modal-body">
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="um-form-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label>Area</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div className="um-form-field">
                    <label>Contact</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      placeholder="+63 ..."
                      value={formData.contact || ''}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                </div>
                <div className="um-form-field">
                  <label>Address</label>
                  <input
                    type="text"
                    className="um-control"
                    required
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                {createModal.type === 'teller' && (
                  <div className="um-form-field">
                    <label>Assigned Collector</label>
                    <select
                      className="um-control"
                      value={formData.assigned || ''}
                      onChange={(e) => setFormData({ ...formData, assigned: e.target.value })}
                    >
                      <option value="">No collector assigned</option>
                      {collectors.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="um-modal-footer">
                <button type="button" className="um-btn-secondary" onClick={closeModals}>Cancel</button>
                <button type="submit" className="um-btn-primary">Create</button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}

      {/* Edit Modal */}
      {editModal.open && editModal.data && createPortal(
        <>
          <div className="um-modal-overlay active" onClick={closeModals} />
          <div className="um-modal-container active">
            <form className="um-modal-content" onSubmit={handleEdit} onClick={(e) => e.stopPropagation()}>
              <div className="um-modal-header">
                <h3>Edit {editModal.type === 'teller' ? 'Teller' : 'Collector'}</h3>
                <button type="button" className="um-modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="um-modal-body">
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="um-form-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="um-form-row">
                  <div className="um-form-field">
                    <label>Area</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div className="um-form-field">
                    <label>Contact</label>
                    <input
                      type="text"
                      className="um-control"
                      required
                      value={formData.contact || ''}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                </div>
                <div className="um-form-field">
                  <label>Address</label>
                  <input
                    type="text"
                    className="um-control"
                    required
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                {editModal.type === 'teller' && (
                  <div className="um-form-field">
                    <label>Assigned Collector</label>
                    <select
                      className="um-control"
                      value={formData.assigned || ''}
                      onChange={(e) => setFormData({ ...formData, assigned: e.target.value })}
                    >
                      <option value="">No collector assigned</option>
                      {collectors.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="um-modal-footer">
                <button type="button" className="um-btn-secondary" onClick={closeModals}>Cancel</button>
                <button type="submit" className="um-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default UserManagement;