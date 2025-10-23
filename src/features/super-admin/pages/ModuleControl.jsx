// ============================================
// Module Control - Super Admin Module Management
// Enable/Disable & Configure All System Modules
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/module-control.css';

const ModuleControl = () => {
  const navigate = useNavigate();
  
  // Module states
  const [modules, setModules] = useState([
    {
      id: 'teller',
      name: 'Teller Module',
      icon: '🎫',
      description: 'Point of sale ticket creation and validation',
      enabled: true,
      status: 'active',
      stats: {
        activeUsers: 142
      },
      features: [
        { name: 'Create Ticket', enabled: true },
        { name: 'Check Winners', enabled: true },
        { name: 'Void Request', enabled: true },
        { name: 'Sales Report', enabled: true }
      ],
      permissions: {
        canSell: true,
        canVoid: true,
        canValidate: true,
        maxTicketValue: 5000,
        dailyLimit: 100000
      },
      lastModified: '2024-10-24 08:30 AM',
      modifiedBy: 'Super Admin'
    },
    {
      id: 'collector',
      name: 'Collector Module',
      icon: '💼',
      description: 'Sales collection and payout management',
      enabled: true,
      status: 'active',
      stats: {
        activeUsers: 28
      },
      features: [
        { name: 'Sales Collection', enabled: true },
        { name: 'Payouts/Tapal', enabled: true },
        { name: 'Reports', enabled: true }
      ],
      permissions: {
        canCollect: true,
        canPayout: true,
        maxPayout: 50000,
        requiresApproval: true
      },
      lastModified: '2024-10-24 07:15 AM',
      modifiedBy: 'Super Admin'
    },
    {
      id: 'game-admin',
      name: 'Game Administrator',
      icon: '🎮',
      description: 'Game configuration and user management',
      enabled: true,
      status: 'active',
      stats: {
        activeUsers: 8
      },
      features: [
        { name: 'Configuration', enabled: true },
        { name: 'User Management', enabled: true },
        { name: 'Daily Operations', enabled: true },
        { name: 'Draw Management', enabled: true },
        { name: 'Enforcement', enabled: true },
        { name: 'Reports', enabled: true }
      ],
      permissions: {
        canCreateUsers: true,
        canConfigGames: true,
        canPublishDraws: true,
        canViewReports: true
      },
      lastModified: '2024-10-23 05:45 PM',
      modifiedBy: 'Super Admin'
    },
    {
      id: 'ops-support',
      name: 'Operation Support',
      icon: '⚙️',
      description: 'Financial operations and ledger management',
      enabled: true,
      status: 'active',
      stats: {
        activeUsers: 5
      },
      features: [
        { name: 'Balances', enabled: true },
        { name: 'Daily Ledgers', enabled: true },
        { name: 'Reports', enabled: true }
      ],
      permissions: {
        canViewLedgers: true,
        canEditBalances: true,
        canGenerateReports: true,
        requiresVerification: true
      },
      lastModified: '2024-10-24 06:20 AM',
      modifiedBy: 'Super Admin'
    }
  ]);

  const [selectedModule, setSelectedModule] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Toggle module enabled/disabled
  const toggleModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    setPendingAction({ type: 'toggle', moduleId, currentState: module.enabled });
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingAction.type === 'toggle') {
      setModules(modules.map(m => 
        m.id === pendingAction.moduleId 
          ? { 
              ...m, 
              enabled: !pendingAction.currentState,
              status: !pendingAction.currentState ? 'active' : 'disabled',
              lastModified: new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              modifiedBy: 'Super Admin'
            }
          : m
      ));
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Open configuration panel
  const openConfigPanel = (module) => {
    setSelectedModule(module);
    setEditedPermissions({ ...module.permissions });
    setSaveSuccess(false);
  };

  // Close configuration panel
  const closeConfigPanel = () => {
    setSelectedModule(null);
    setEditedPermissions(null);
    setSaveSuccess(false);
  };

  // Update permission value
  const updatePermission = (key, value) => {
    setEditedPermissions({
      ...editedPermissions,
      [key]: value
    });
  };

  // Save configuration changes
  const saveConfiguration = () => {
    if (selectedModule && editedPermissions) {
      setModules(modules.map(m => {
        if (m.id === selectedModule.id) {
          return {
            ...m,
            permissions: editedPermissions,
            lastModified: new Date().toLocaleString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            modifiedBy: 'Super Admin'
          };
        }
        return m;
      }));
      
      // Show success message
      setSaveSuccess(true);
      
      // Close panel after 1.5 seconds
      setTimeout(() => {
        closeConfigPanel();
      }, 1500);
    }
  };

  // Toggle feature within module
  const toggleFeature = (moduleId, featureIndex) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const newFeatures = [...m.features];
        newFeatures[featureIndex] = {
          ...newFeatures[featureIndex],
          enabled: !newFeatures[featureIndex].enabled
        };
        return { ...m, features: newFeatures };
      }
      return m;
    }));
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH')}`;
  };

  const getModuleColor = (moduleId) => {
    const colors = {
      'teller': 'blue',
      'collector': 'green',
      'game-admin': 'purple',
      'ops-support': 'cyan'
    };
    return colors[moduleId] || 'blue';
  };

  // Get permission description
  const getPermissionDescription = (key, moduleId) => {
    const descriptions = {
      teller: {
        canSell: 'Allow ticket sales',
        canVoid: 'Allow void requests',
        canValidate: 'Allow ticket validation',
        maxTicketValue: 'Maximum ticket value (₱)',
        dailyLimit: 'Daily sales limit (₱)'
      },
      collector: {
        canCollect: 'Allow sales collection',
        canPayout: 'Allow payout processing',
        maxPayout: 'Maximum payout amount (₱)',
        requiresApproval: 'Require approval for payouts'
      },
      'game-admin': {
        canCreateUsers: 'Allow user creation',
        canConfigGames: 'Allow game configuration',
        canPublishDraws: 'Allow draw publishing',
        canViewReports: 'Allow report viewing'
      },
      'ops-support': {
        canViewLedgers: 'Allow ledger viewing',
        canEditBalances: 'Allow balance editing',
        canGenerateReports: 'Allow report generation',
        requiresVerification: 'Require verification for changes'
      }
    };
    return descriptions[moduleId]?.[key] || '';
  };

  return (
    <div className="mc-container">
      {/* Page Header */}
      <div className="mc-header">
        <div className="mc-header-left">
          <h1 className="mc-title">Module Control</h1>
          <p className="mc-subtitle">Enable, disable, and configure all system modules</p>
        </div>
        <div className="mc-header-right">
          <div className="mc-status-summary">
            <div className="mc-summary-item">
              <span className="mc-summary-label">Active Modules</span>
              <span className="mc-summary-value">
                {modules.filter(m => m.enabled).length}/{modules.length}
              </span>
            </div>
            <div className="mc-summary-item">
              <span className="mc-summary-label">Total Users</span>
              <span className="mc-summary-value">
                {modules.reduce((sum, m) => sum + m.stats.activeUsers, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="mc-modules-grid">
        {modules.map(module => (
          <div 
            key={module.id} 
            className={`mc-module-card mc-module-${getModuleColor(module.id)} ${!module.enabled ? 'mc-module-disabled' : ''}`}
          >
            {/* Card Header */}
            <div className="mc-card-header">
              <div className="mc-card-header-left">
                <span className="mc-card-icon">{module.icon}</span>
                <div className="mc-card-title-group">
                  <h3 className="mc-card-title">{module.name}</h3>
                  <p className="mc-card-description">{module.description}</p>
                </div>
              </div>
              <div className="mc-card-header-right">
                <span className={`mc-status-badge mc-status-${module.status}`}>
                  <span className="mc-status-dot"></span>
                  {module.status}
                </span>
              </div>
            </div>

            {/* Stats Grid - Active Users Only */}
            <div className="mc-stats-grid">
              <div className="mc-stat-item">
                <span className="mc-stat-icon">👥</span>
                <div className="mc-stat-info">
                  <span className="mc-stat-value">{module.stats.activeUsers}</span>
                  <span className="mc-stat-label">Active Users</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mc-features-section">
              <h4 className="mc-section-title">Features</h4>
              <div className="mc-features-list">
                {module.features.map((feature, index) => (
                  <div key={index} className="mc-feature-item">
                    <label className="mc-toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={feature.enabled}
                        onChange={() => toggleFeature(module.id, index)}
                        disabled={!module.enabled}
                      />
                      <span className="mc-toggle-slider"></span>
                    </label>
                    <span className={`mc-feature-name ${!feature.enabled || !module.enabled ? 'mc-feature-disabled' : ''}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mc-card-footer">
              <div className="mc-footer-info">
                <span className="mc-footer-label">Last Modified:</span>
                <span className="mc-footer-value">{module.lastModified}</span>
                <span className="mc-footer-by">by {module.modifiedBy}</span>
              </div>
              <div className="mc-footer-actions">
                <button 
                  className="mc-btn mc-btn-secondary"
                  onClick={() => openConfigPanel(module)}
                >
                  <span className="mc-btn-icon">⚙️</span>
                  <span className="mc-btn-text">Configure</span>
                </button>
                <button 
                  className={`mc-btn ${module.enabled ? 'mc-btn-danger' : 'mc-btn-success'}`}
                  onClick={() => toggleModule(module.id)}
                >
                  <span className="mc-btn-icon">{module.enabled ? '⏸' : '▶'}</span>
                  <span className="mc-btn-text">{module.enabled ? 'Disable' : 'Enable'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Controls */}
      <div className="mc-emergency-section">
        <div className="mc-emergency-card">
          <div className="mc-emergency-header">
            <span className="mc-emergency-icon">🚨</span>
            <h3 className="mc-emergency-title">Emergency Controls</h3>
          </div>
          <p className="mc-emergency-description">
            Use these controls only in critical situations. All modules will be affected immediately.
          </p>
          <div className="mc-emergency-actions">
            <button className="mc-btn mc-btn-warning mc-btn-large">
              <span className="mc-btn-icon">⏸</span>
              <span className="mc-btn-text">Disable All Modules</span>
            </button>
            <button className="mc-btn mc-btn-success mc-btn-large">
              <span className="mc-btn-icon">▶</span>
              <span className="mc-btn-text">Enable All Modules</span>
            </button>
            <button className="mc-btn mc-btn-danger mc-btn-large">
              <span className="mc-btn-icon">🔄</span>
              <span className="mc-btn-text">System Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="mc-dialog-overlay" onClick={cancelAction}>
          <div className="mc-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="mc-dialog-header">
              <h3 className="mc-dialog-title">Confirm Action</h3>
              <button className="mc-dialog-close" onClick={cancelAction}>×</button>
            </div>
            <div className="mc-dialog-body">
              <p className="mc-dialog-message">
                Are you sure you want to {pendingAction?.currentState ? 'disable' : 'enable'} the{' '}
                <strong>{modules.find(m => m.id === pendingAction?.moduleId)?.name}</strong> module?
              </p>
              <p className="mc-dialog-warning">
                {pendingAction?.currentState 
                  ? '⚠️ Users will immediately lose access to this module.'
                  : '✓ Users will regain access to this module immediately.'
                }
              </p>
            </div>
            <div className="mc-dialog-footer">
              <button className="mc-btn mc-btn-secondary" onClick={cancelAction}>
                Cancel
              </button>
              <button 
                className={`mc-btn ${pendingAction?.currentState ? 'mc-btn-danger' : 'mc-btn-success'}`}
                onClick={confirmAction}
              >
                {pendingAction?.currentState ? 'Disable Module' : 'Enable Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Detail Panel (Side Panel) - Simplified */}
      {selectedModule && editedPermissions && (
        <div className="mc-panel-overlay" onClick={closeConfigPanel}>
          <div className="mc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mc-panel-header">
              <h3 className="mc-panel-title">
                <span className="mc-panel-icon">{selectedModule.icon}</span>
                {selectedModule.name} - Permissions
              </h3>
              <button className="mc-panel-close" onClick={closeConfigPanel}>×</button>
            </div>
            <div className="mc-panel-body">
              {saveSuccess && (
                <div className="mc-save-success">
                  <span className="mc-success-icon">✓</span>
                  <span className="mc-success-text">Permissions saved successfully!</span>
                </div>
              )}
              
              <div className="mc-panel-section">
                <p className="mc-panel-description">
                  Configure access permissions and limits for the {selectedModule.name}.
                </p>
                <div className="mc-permission-list">
                  {Object.entries(editedPermissions).map(([key, value]) => (
                    <div key={key} className="mc-permission-item">
                      <div className="mc-permission-info">
                        <span className="mc-permission-label">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="mc-permission-description">
                          {getPermissionDescription(key, selectedModule.id)}
                        </span>
                      </div>
                      <div className="mc-permission-control">
                        {typeof value === 'boolean' ? (
                          <label className="mc-toggle-switch mc-toggle-small">
                            <input 
                              type="checkbox" 
                              checked={value}
                              onChange={(e) => updatePermission(key, e.target.checked)}
                            />
                            <span className="mc-toggle-slider"></span>
                          </label>
                        ) : (
                          <input
                            type="number"
                            className="mc-permission-input"
                            value={value}
                            onChange={(e) => updatePermission(key, parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mc-panel-footer">
              <button className="mc-btn mc-btn-secondary" onClick={closeConfigPanel}>
                Cancel
              </button>
              <button 
                className="mc-btn mc-btn-primary" 
                onClick={saveConfiguration}
                disabled={saveSuccess}
              >
                {saveSuccess ? (
                  <>
                    <span className="mc-btn-icon">✓</span>
                    <span className="mc-btn-text">Saved!</span>
                  </>
                ) : (
                  <>
                    <span className="mc-btn-icon">💾</span>
                    <span className="mc-btn-text">Save Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleControl;