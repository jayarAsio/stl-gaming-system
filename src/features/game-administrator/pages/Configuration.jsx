import React, {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useTransition,
  memo,
  useRef,
  useEffect
} from 'react';
import '../styles/configuration.css';

const ROW_HEIGHT = 52; // px — matches your row density; adjust if needed
const OVERSCAN = 8;    // render a few extra rows above/below the viewport

const Configuration = () => {
  const [selectedGame, setSelectedGame] = useState('STL Pares');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCombo, setEditingCombo] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedCombos, setSelectedCombos] = useState([]);
  const [bulkLimitValue, setBulkLimitValue] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOverridesOnly, setShowOverridesOnly] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Defer search typing to reduce lag
  const deferredSearch = useDeferredValue(searchQuery);
  const [, startTransition] = useTransition();

  // Mock games data with default limits set by Super Admin
  const gamesData = useMemo(() => ({
    'STL Pares': {
      name: 'STL Pares',
      defaultLimit: 2000,
      numberRange: { min: 1, max: 40 },
      format: 'XX.XX',
      description: 'Two-number combination game (01-40)',
    },
    'Last 2': {
      name: 'Last 2',
      defaultLimit: 1500,
      numberRange: { min: 0, max: 99 },
      format: 'XX',
      description: 'Last two digits (00-99)',
    },
    'Last 3': {
      name: 'Last 3',
      defaultLimit: 1800,
      numberRange: { min: 0, max: 999 },
      format: 'XXX',
      description: 'Last three digits (000-999)',
    },
    'Swer3': {
      name: 'Swer3',
      defaultLimit: 2500,
      numberRange: { min: 0, max: 999 },
      format: 'XXX',
      description: 'Three-digit game (000-999)',
    },
  }), []);

  // State for combination overrides
  const [comboOverrides, setComboOverrides] = useState({
    'STL Pares': {
      '01.02': 1000,
      '02.01': 1000,
      '05.10': 1500,
      '12.34': 800,
      '20.30': 1200,
    },
    'Last 2': {
      '07': 500,
      '11': 600,
      '88': 700,
    },
    'Last 3': {
      '123': 900,
      '777': 1000,
    },
    'Swer3': {
      '369': 1500,
    },
  });

  // Memo: selected game overrides map (stable reference)
  const selectedOverrides = useMemo(
    () => comboOverrides[selectedGame] || {},
    [comboOverrides, selectedGame]
  );

  // Generate all possible combinations for selected game
  const generateCombinations = useCallback((game) => {
    const combos = [];
    if (game === 'STL Pares') {
      for (let i = 1; i <= 40; i++) {
        const iStr = String(i).padStart(2, '0');
        for (let j = 1; j <= 40; j++) {
          if (i !== j) {
            const combo = `${iStr}.${String(j).padStart(2, '0')}`;
            combos.push(combo);
          }
        }
      }
    } else if (game === 'Last 2') {
      for (let i = 0; i <= 99; i++) combos.push(String(i).padStart(2, '0'));
    } else if (game === 'Last 3' || game === 'Swer3') {
      for (let i = 0; i <= 999; i++) combos.push(String(i).padStart(3, '0'));
    }
    return combos;
  }, []);

  // All combinations for display (memoized)
  const allCombinations = useMemo(
    () => generateCombinations(selectedGame),
    [selectedGame, generateCombinations]
  );

  // Filter combinations based on deferred search and overrides
  const filteredCombinations = useMemo(() => {
    let results = allCombinations;

    if (deferredSearch) {
      const q = deferredSearch.trim();
      if (q) {
        results = results.filter(combo => combo.includes(q));
      }
    }

    if (showOverridesOnly) {
      results = results.filter(combo => combo in selectedOverrides);
    }

    return results;
  }, [allCombinations, deferredSearch, showOverridesOnly, selectedOverrides]);

  // Helpers
  const getComboLimit = useCallback((combo) => {
    return (combo in selectedOverrides)
      ? selectedOverrides[combo]
      : gamesData[selectedGame].defaultLimit;
  }, [selectedOverrides, gamesData, selectedGame]);

  const hasOverride = useCallback((combo) => combo in selectedOverrides, [selectedOverrides]);
  const overrideCount = useMemo(() => Object.keys(selectedOverrides).length, [selectedOverrides]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Edit single
  const handleEditCombo = useCallback((combo) => {
    setEditingCombo({
      combo,
      value: String(getComboLimit(combo))
    });
  }, [getComboLimit]);

  const handleSaveCombo = useCallback(() => {
    if (!editingCombo) return;
    const newLimit = parseInt(editingCombo.value, 10);
    if (Number.isNaN(newLimit) || newLimit < 0) {
      showToast('Please enter a valid limit amount', 'error');
      return;
    }
    setComboOverrides(prev => ({
      ...prev,
      [selectedGame]: {
        ...(prev[selectedGame] || {}),
        [editingCombo.combo]: newLimit
      }
    }));
    showToast(`Limit updated for ${editingCombo.combo}`, 'success');
    setEditingCombo(null);
  }, [editingCombo, selectedGame, showToast]);

  const handleRemoveOverride = useCallback((combo) => {
    setComboOverrides(prev => {
      const map = { ...(prev[selectedGame] || {}) };
      if (combo in map) delete map[combo];
      return { ...prev, [selectedGame]: map };
    });
    showToast(`${combo} reverted to default limit`, 'success');
  }, [selectedGame, showToast]);

  // Bulk
  const toggleComboSelection = useCallback((combo) => {
    setSelectedCombos(prev =>
      prev.includes(combo)
        ? prev.filter(c => c !== combo)
        : [...prev, combo]
    );
  }, []);
  const selectedSet = useMemo(() => new Set(selectedCombos), [selectedCombos]);
  const selectAllFiltered = useCallback(() => setSelectedCombos(filteredCombinations.slice()), [filteredCombinations]);
  const clearSelection = useCallback(() => setSelectedCombos([]), []);
  const openBulkEdit = useCallback(() => {
    if (selectedCombos.length === 0) {
      showToast('Please select at least one combination', 'error');
      return;
    }
    setShowBulkModal(true);
  }, [selectedCombos, showToast]);

  const applyBulkLimit = useCallback(() => {
    const newLimit = parseInt(bulkLimitValue, 10);
    if (Number.isNaN(newLimit) || newLimit < 0) {
      showToast('Please enter a valid limit amount', 'error');
      return;
    }
    setIsSaving(true);
    window.setTimeout(() => {
      setComboOverrides(prev => {
        const next = { ...prev };
        const bucket = { ...(next[selectedGame] || {}) };
        for (const combo of selectedCombos) bucket[combo] = newLimit;
        next[selectedGame] = bucket;
        return next;
      });
      setIsSaving(false);
      setShowBulkModal(false);
      setBulkLimitValue('');
      setSelectedCombos([]);
      setBulkEditMode(false);
      showToast(`Bulk limit applied to ${selectedCombos.length} combinations`, 'success');
    }, 800);
  }, [bulkLimitValue, selectedCombos, selectedGame, showToast]);

  const resetAllOverrides = useCallback(() => {
    if (!window.confirm(
      `Reset all custom limits for ${selectedGame}? This will revert all combinations to the default limit of ₱${gamesData[selectedGame].defaultLimit}.`
    )) return;
    setComboOverrides(prev => ({ ...prev, [selectedGame]: {} }));
    showToast('All custom limits have been reset', 'success');
  }, [selectedGame, gamesData, showToast]);

  // ======= Virtualization state (manual windowing; preserves table semantics) =======
  const scrollRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(520); // px
  const [scrollTop, setScrollTop] = useState(0);

  // Measure available height from wrapper the first time and on resize
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      // If container has explicit height via CSS, use that; else fallback to clientHeight
      const h = el.clientHeight || 520;
      setViewportHeight(h);
    };
    measure();

    // Resize observer for responsive layouts without adding CSS
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop || 0);
  }, []);

  const itemCount = filteredCombinations.length;
  const visibleCount = Math.max(1, Math.ceil(viewportHeight / ROW_HEIGHT));
  const startIndexBase = Math.floor(scrollTop / ROW_HEIGHT);
  const startIndex = Math.max(0, startIndexBase - OVERSCAN);
  const endIndex = Math.min(itemCount, startIndexBase + visibleCount + OVERSCAN);

  const topSpacerHeight = startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (itemCount - endIndex) * ROW_HEIGHT);

  return (
    <div className="config-container">
      {/* Header */}
      <div className="config-header">
        <div className="config-header-content">
          <div className="config-header-text">
            <h1 className="config-title">Game Configuration</h1>
            <p className="config-subtitle">Manage bet limits and game-specific settings</p>
          </div>
          <div className="config-header-actions">
            {overrideCount > 0 && (
              <button className="config-action-btn reset" onClick={resetAllOverrides}>
                <span>🔄</span> Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div className="config-card">
        <div className="config-section-header">
          <h2 className="config-section-title">
            <span className="config-icon">🎮</span>
            Select Game
          </h2>
        </div>

        <div className="game-grid">
          {Object.values(gamesData).map(game => (
            <div
              key={game.name}
              className={`game-card ${selectedGame === game.name ? 'active' : ''}`}
              onClick={() => {
                startTransition(() => {
                  setSelectedGame(game.name);
                  setSearchQuery('');
                  setSelectedCombos([]);
                  setBulkEditMode(false);
                  setShowOverridesOnly(false);
                  // Reset scroll to top for new dataset
                  if (scrollRef.current) scrollRef.current.scrollTop = 0;
                });
              }}
            >
              <div className="game-card-header">
                <div className="game-name">{game.name}</div>
                <div className="game-format">{game.format}</div>
              </div>
              <div className="game-description">{game.description}</div>
              <div className="game-limit">
                <span className="limit-label">Default Limit:</span>
                <span className="limit-value">₱{game.defaultLimit.toLocaleString()}</span>
              </div>
              {comboOverrides[game.name] && Object.keys(comboOverrides[game.name]).length > 0 && (
                <div className="game-override-badge">
                  {Object.keys(comboOverrides[game.name]).length} overrides
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="config-card">
        <div className="config-section-header">
          <div>
            <h2 className="config-section-title">
              <span className="config-icon">⚙️</span>
              Bet Limit Configuration - {selectedGame}
            </h2>
            <div className="config-meta">
              <span className="meta-item">
                <strong>Default Limit:</strong> ₱{gamesData[selectedGame].defaultLimit.toLocaleString()}
              </span>
              <span className="meta-item">
                <strong>Custom Limits:</strong> {overrideCount} combinations
              </span>
              <span className="meta-item">
                <strong>Total Combinations:</strong> {allCombinations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="config-controls">
          <div className="control-group">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search combination number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className={`control-btn ${bulkEditMode ? 'active' : ''}`}
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                setSelectedCombos([]);
              }}
            >
              <span>{bulkEditMode ? '✓' : '☐'}</span>
              Bulk Edit Mode
            </button>

            {bulkEditMode && (
              <>
                <button className="control-btn secondary" onClick={selectAllFiltered}>
                  Select All Filtered
                </button>
                {selectedCombos.length > 0 && (
                  <>
                    <button className="control-btn secondary" onClick={clearSelection}>
                      Clear ({selectedCombos.length})
                    </button>
                    <button className="control-btn primary" onClick={openBulkEdit}>
                      <span>✏️</span>
                      Apply Limit to Selected
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="filter-chips">
            <button
              className={`filter-chip ${!showOverridesOnly ? 'active' : ''}`}
              onClick={() => {
                setShowOverridesOnly(false);
                setSearchQuery('');
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }}
            >
              All Combinations
            </button>
            <button
              className={`filter-chip ${showOverridesOnly ? 'active' : ''}`}
              onClick={() => {
                setShowOverridesOnly(true);
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }}
            >
              Show Overrides Only ({overrideCount})
            </button>
          </div>
        </div>

        {/* Combinations Table */}
        <div className="config-table-wrapper">
          {/* Scroll container: keeps visuals identical without editing CSS */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{
              maxHeight: 520,           // fixed viewport; safe default for your layout
              overflowY: 'auto',        // vertical scroll only
              overflowX: 'hidden'       // keep to your wrapper’s horizontal scroll
            }}
          >
            <table className="config-table">
              <thead>
                <tr>
                  {bulkEditMode && <th className="col-checkbox">Select</th>}
                  <th className="col-combo">Combination</th>
                  <th className="col-limit">Current Limit</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>

              {/* Virtualized tbody with top/bottom spacers — preserves all styles */}
              <tbody>
                {/* Top spacer */}
                {topSpacerHeight > 0 && (
                  <tr style={{ height: topSpacerHeight }}>
                    <td
                      colSpan={bulkEditMode ? 5 : 4}
                      style={{ border: 'none', padding: 0 }}
                    />
                  </tr>
                )}

                {/* Visible window */}
                {itemCount > 0 ? (
                  filteredCombinations.slice(startIndex, endIndex).map((combo) => {
                    const isOverridden = hasOverride(combo);
                    const currentLimit = getComboLimit(combo);
                    const isEditing = editingCombo?.combo === combo;
                    const isSelected = selectedSet.has(combo);

                    return (
                      <ComboRow
                        key={combo}
                        combo={combo}
                        isOverridden={isOverridden}
                        currentLimit={currentLimit}
                        isEditing={isEditing}
                        isSelected={isSelected}
                        bulkEditMode={bulkEditMode}
                        onToggleSelect={toggleComboSelection}
                        onEdit={handleEditCombo}
                        onSave={handleSaveCombo}
                        onCancel={() => setEditingCombo(null)}
                        editingValue={editingCombo?.value || ''}
                        setEditingValue={(val) =>
                          setEditingCombo(prev => (prev ? { ...prev, value: val } : prev))
                        }
                        onReset={handleRemoveOverride}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={bulkEditMode ? 5 : 4} className="no-results">
                      No combinations found matching "{searchQuery}"
                    </td>
                  </tr>
                )}

                {/* Bottom spacer */}
                {bottomSpacerHeight > 0 && (
                  <tr style={{ height: bottomSpacerHeight }}>
                    <td
                      colSpan={bulkEditMode ? 5 : 4}
                      style={{ border: 'none', padding: 0 }}
                    />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Optional footer message when dataset is massive */}
          {itemCount > 5000 && (
            <div className="table-footer">
              Virtualized view active — loaded {itemCount.toLocaleString()} combinations smoothly.
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span>✏️</span>
                Apply Bulk Limit
              </h3>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info">
                You are about to set a custom limit for <strong>{selectedCombos.length}</strong> combination{selectedCombos.length !== 1 ? 's' : ''}.
              </div>

              <div className="selected-combos-preview">
                <div className="preview-label">Selected Combinations:</div>
                <div className="preview-list">
                  {selectedCombos.slice(0, 20).map(c => (
                    <span key={c} className="preview-chip">{c}</span>
                  ))}
                  {selectedCombos.length > 20 && (
                    <span className="preview-more">+{selectedCombos.length - 20} more</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bulkLimit" className="form-label">New Limit Amount (₱)</label>
                <input
                  id="bulkLimit"
                  type="number"
                  className="form-input"
                  placeholder="Enter limit amount"
                  value={bulkLimitValue}
                  onChange={(e) => setBulkLimitValue(e.target.value)}
                  min="0"
                />
                <div className="form-hint">
                  Current default: ₱{gamesData[selectedGame].defaultLimit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowBulkModal(false)} disabled={isSaving}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={applyBulkLimit} disabled={isSaving || !bulkLimitValue}>
                {isSaving ? (
                  <>
                    <span className="spinner"></span>
                    Applying...
                  </>
                ) : (
                  <>Apply Limit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

// Memoized row to prevent unnecessary re-renders
const ComboRow = memo(function ComboRow({
  combo,
  isOverridden,
  currentLimit,
  isEditing,
  isSelected,
  bulkEditMode,
  onToggleSelect,
  onEdit,
  onSave,
  onCancel,
  editingValue,
  setEditingValue,
  onReset
}) {
  const limitDisplay = useMemo(() => `₱${currentLimit.toLocaleString()}`, [currentLimit]);

  return (
    <tr className={isOverridden ? 'has-override' : ''} style={{ height: ROW_HEIGHT }}>
      {bulkEditMode && (
        <td className="col-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(combo)}
            className="combo-checkbox"
          />
        </td>
      )}
      <td className="col-combo">
        <span className="combo-number">{combo}</span>
      </td>
      <td className="col-limit">
        {isEditing ? (
          <input
            type="number"
            className="limit-input"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
            autoFocus
          />
        ) : (
          <span className="limit-amount">{limitDisplay}</span>
        )}
      </td>
      <td className="col-status">
        {isOverridden ? (
          <span className="status-badge override">Custom</span>
        ) : (
          <span className="status-badge default">Default</span>
        )}
      </td>
      <td className="col-actions">
        {isEditing ? (
          <div className="action-buttons">
            <button className="action-btn save" onClick={onSave} title="Save">✓</button>
            <button className="action-btn cancel" onClick={onCancel} title="Cancel">✕</button>
          </div>
        ) : (
          <div className="action-buttons">
            <button className="action-btn edit" onClick={() => onEdit(combo)} title="Edit Limit">✏️</button>
            {isOverridden && (
              <button className="action-btn reset" onClick={() => onReset(combo)} title="Reset to Default">🔄</button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});

export default Configuration;
