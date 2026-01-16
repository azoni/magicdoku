import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// Import default categories
import { CATEGORIES as MTG_CATEGORIES, config as mtgConfig } from './games/mtg';
import { CATEGORIES as FAB_CATEGORIES, config as fabConfig } from './games/fab';

const DEFAULT_CATEGORIES = {
  mtg: MTG_CATEGORIES,
  fab: FAB_CATEGORIES,
};

const GAME_CONFIGS = {
  mtg: mtgConfig,
  fab: fabConfig,
};

// Load categories from localStorage or use defaults
function loadCategories(gameId) {
  const saved = localStorage.getItem(`tcgdoku-admin-${gameId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved categories:', e);
    }
  }
  return DEFAULT_CATEGORIES[gameId];
}

// Save categories to localStorage
function saveCategories(gameId, categories) {
  localStorage.setItem(`tcgdoku-admin-${gameId}`, JSON.stringify(categories));
}

// Admin Home
export function AdminHome() {
  return (
    <div className="app">
      <div className="admin-home">
        <Link to="/" className="back-link">← Back to Games</Link>
        <h1>Admin Panel</h1>
        <p className="admin-subtitle">Manage categories for each game</p>
        
        <div className="admin-game-grid">
          {Object.entries(GAME_CONFIGS).map(([id, config]) => (
            <Link key={id} to={`/admin/${id}`} className={`admin-game-card ${id}`}>
              <div className="icon">{config.emoji}</div>
              <h2>{config.name}</h2>
              <p>Edit categories</p>
            </Link>
          ))}
        </div>
        
        <div className="admin-section">
          <h3>Data Management</h3>
          <div className="admin-buttons">
            <button className="btn-secondary" onClick={() => {
              const data = {};
              Object.keys(DEFAULT_CATEGORIES).forEach(gameId => {
                data[gameId] = loadCategories(gameId);
              });
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'tcgdoku-categories.json';
              a.click();
            }}>
              Export All Categories
            </button>
            <label className="btn-secondary file-input-label">
              Import Categories
              <input 
                type="file" 
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        Object.entries(data).forEach(([gameId, categories]) => {
                          saveCategories(gameId, categories);
                        });
                        alert('Categories imported successfully! Refresh to see changes.');
                      } catch (err) {
                        alert('Error importing: ' + err.message);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
            <button className="btn-danger" onClick={() => {
              if (window.confirm('Reset all categories to defaults? This cannot be undone.')) {
                Object.keys(DEFAULT_CATEGORIES).forEach(gameId => {
                  localStorage.removeItem(`tcgdoku-admin-${gameId}`);
                });
                alert('All categories reset to defaults!');
                window.location.reload();
              }
            }}>
              Reset All to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Editor for a specific game
export function CategoryEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [message, setMessage] = useState(null);

  const config = GAME_CONFIGS[gameId];

  useEffect(() => {
    if (!config) {
      navigate('/admin');
      return;
    }
    setCategories(loadCategories(gameId));
  }, [gameId, config, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = () => {
    saveCategories(gameId, categories);
    showMessage('Categories saved!');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const key = newCategoryName.toLowerCase().replace(/\s+/g, '');
    if (categories[key]) {
      showMessage('Category already exists!', 'error');
      return;
    }
    setCategories({ ...categories, [key]: [] });
    setNewCategoryName('');
    showMessage(`Added category: ${newCategoryName}`);
  };

  const handleDeleteCategory = (categoryKey) => {
    if (!window.confirm(`Delete category "${categoryKey}" and all its items?`)) return;
    const newCats = { ...categories };
    delete newCats[categoryKey];
    setCategories(newCats);
    showMessage(`Deleted category: ${categoryKey}`);
  };

  const handleAddItem = (categoryKey) => {
    setEditingCategory(categoryKey);
    setEditingItem({
      id: '',
      label: '',
      query: '',
      colorClass: '',
      isNew: true,
    });
  };

  const handleEditItem = (categoryKey, item, index) => {
    setEditingCategory(categoryKey);
    setEditingItem({ ...item, index, isNew: false });
  };

  const handleDeleteItem = (categoryKey, index) => {
    const newCats = { ...categories };
    newCats[categoryKey] = newCats[categoryKey].filter((_, i) => i !== index);
    setCategories(newCats);
    showMessage('Item deleted');
  };

  const handleSaveItem = () => {
    if (!editingItem.id || !editingItem.label || !editingItem.query) {
      showMessage('ID, Label, and Query are required', 'error');
      return;
    }

    const newCats = { ...categories };
    const newItem = {
      id: editingItem.id,
      label: editingItem.label,
      query: editingItem.query,
    };
    
    if (editingItem.colorClass) {
      newItem.colorClass = editingItem.colorClass;
    }
    
    // For FAB, also save apiParam
    if (gameId === 'fab' && editingItem.apiParam) {
      newItem.apiParam = editingItem.apiParam;
    }

    if (editingItem.isNew) {
      newCats[editingCategory] = [...(newCats[editingCategory] || []), newItem];
    } else {
      newCats[editingCategory][editingItem.index] = newItem;
    }

    setCategories(newCats);
    setEditingItem(null);
    setEditingCategory(null);
    showMessage(editingItem.isNew ? 'Item added' : 'Item updated');
  };

  const handleResetGame = () => {
    if (window.confirm(`Reset ${config.name} categories to defaults?`)) {
      localStorage.removeItem(`tcgdoku-admin-${gameId}`);
      setCategories(DEFAULT_CATEGORIES[gameId]);
      showMessage('Reset to defaults');
    }
  };

  if (!config) return null;

  return (
    <div className="app">
      <div className="admin-editor">
        <header>
          <Link to="/admin" className="back-link">← Admin Home</Link>
          <h1 className={`${gameId}-title`}>{config.name} Categories</h1>
        </header>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="admin-actions">
          <button className={`btn-primary ${gameId}`} onClick={handleSave}>
            💾 Save Changes
          </button>
          <button className="btn-secondary" onClick={handleResetGame}>
            Reset to Defaults
          </button>
        </div>

        {/* Add new category */}
        <div className="admin-section">
          <h3>Add New Category Group</h3>
          <div className="inline-form">
            <input
              type="text"
              placeholder="Category name (e.g., 'sets')"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button className={`btn-primary ${gameId}`} onClick={handleAddCategory}>
              Add Category
            </button>
          </div>
        </div>

        {/* Category list */}
        {Object.entries(categories).map(([categoryKey, items]) => (
          <div key={categoryKey} className="category-section">
            <div className="category-header">
              <h3>{categoryKey}</h3>
              <div className="category-actions">
                <button 
                  className={`btn-small ${gameId}`}
                  onClick={() => handleAddItem(categoryKey)}
                >
                  + Add Item
                </button>
                <button 
                  className="btn-small btn-danger"
                  onClick={() => handleDeleteCategory(categoryKey)}
                >
                  Delete Group
                </button>
              </div>
            </div>
            
            <div className="category-items">
              {items.map((item, index) => (
                <div key={item.id} className="category-item">
                  <div className="item-info">
                    <span className="item-label">{item.label}</span>
                    <span className="item-query">{item.query}</span>
                    {item.colorClass && (
                      <span className={`item-color ${item.colorClass}`}>●</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-tiny"
                      onClick={() => handleEditItem(categoryKey, item, index)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-tiny btn-danger"
                      onClick={() => handleDeleteItem(categoryKey, index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="empty-category">No items yet</p>
              )}
            </div>
          </div>
        ))}

        {/* Edit Modal */}
        {editingItem && (
          <div className="modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingItem.isNew ? 'Add Item' : 'Edit Item'}</h3>
              
              <div className="form-group">
                <label>ID (unique identifier)</label>
                <input
                  type="text"
                  value={editingItem.id}
                  onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                  placeholder="e.g., flying, red, mythic"
                />
              </div>
              
              <div className="form-group">
                <label>Label (display name)</label>
                <input
                  type="text"
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="e.g., Flying, Red, Mythic Rare"
                />
              </div>
              
              <div className="form-group">
                <label>Query ({gameId === 'mtg' ? 'Scryfall syntax' : 'FaBDB param'})</label>
                <input
                  type="text"
                  value={editingItem.query}
                  onChange={(e) => setEditingItem({ ...editingItem, query: e.target.value })}
                  placeholder={gameId === 'mtg' ? 'e.g., o:flying, c:r, r:mythic' : 'e.g., class=ninja, pitch=1'}
                />
              </div>
              
              <div className="form-group">
                <label>Color Class (optional, for styling)</label>
                <input
                  type="text"
                  value={editingItem.colorClass || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, colorClass: e.target.value })}
                  placeholder="e.g., color-R, pitch-1"
                />
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button className={`btn-primary ${gameId}`} onClick={handleSaveItem}>
                  {editingItem.isNew ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the loadCategories function for use in game files
export { loadCategories, DEFAULT_CATEGORIES };
