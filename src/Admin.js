import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

// Strip functions from categories for storage
function serializeCategories(categories) {
  const serialized = {};
  Object.entries(categories).forEach(([key, items]) => {
    serialized[key] = items.map(item => {
      const { filter, ...rest } = item;
      return rest;
    });
  });
  return serialized;
}

// Load categories from Firebase
async function loadCategoriesFromFirebase(gameId) {
  try {
    const docRef = doc(db, 'categories', gameId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().categories;
    }
  } catch (error) {
    console.error('Error loading categories from Firebase:', error);
  }
  return null;
}

// Save categories to Firebase
async function saveCategoriestoFirebase(gameId, categories) {
  try {
    const docRef = doc(db, 'categories', gameId);
    await setDoc(docRef, {
      gameId,
      updatedAt: new Date().toISOString(),
      categories: serializeCategories(categories),
    });
    return true;
  } catch (error) {
    console.error('Error saving categories to Firebase:', error);
    return false;
  }
}

// Admin Home
export function AdminHome() {
  return (
    <div className="app">
      <div className="admin-home">
        <Link to="/" className="back-link">← Back to Games</Link>
        <h1>Admin Panel</h1>
        <p className="admin-subtitle">Manage categories for each game (saved to Firebase)</p>
        
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
            <button className="btn-secondary" onClick={async () => {
              const data = {};
              for (const gameId of Object.keys(DEFAULT_CATEGORIES)) {
                const cats = await loadCategoriesFromFirebase(gameId);
                data[gameId] = cats || serializeCategories(DEFAULT_CATEGORIES[gameId]);
              }
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
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        for (const [gameId, categories] of Object.entries(data)) {
                          await saveCategoriestoFirebase(gameId, categories);
                        }
                        alert('Categories imported successfully!');
                      } catch (err) {
                        alert('Error importing: ' + err.message);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
            <button className="btn-danger" onClick={async () => {
              if (window.confirm('Reset all categories to defaults? This cannot be undone.')) {
                for (const gameId of Object.keys(DEFAULT_CATEGORIES)) {
                  await saveCategoriestoFirebase(gameId, DEFAULT_CATEGORIES[gameId]);
                }
                alert('All categories reset to defaults!');
                window.location.reload();
              }
            }}>
              Reset All to Defaults
            </button>
          </div>
        </div>
        
        <div className="admin-section">
          <h3>View Stats</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            View guess statistics in your Firebase console under the "guesses" collection.
          </p>
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const config = GAME_CONFIGS[gameId];

  useEffect(() => {
    if (!config) {
      navigate('/admin');
      return;
    }
    
    async function loadCategories() {
      setLoading(true);
      const firebaseCats = await loadCategoriesFromFirebase(gameId);
      if (firebaseCats) {
        setCategories(firebaseCats);
      } else {
        setCategories(serializeCategories(DEFAULT_CATEGORIES[gameId]));
      }
      setLoading(false);
    }
    
    loadCategories();
  }, [gameId, config, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveCategoriestoFirebase(gameId, categories);
    setSaving(false);
    if (success) {
      showMessage('Categories saved to Firebase!');
    } else {
      showMessage('Error saving categories', 'error');
    }
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
    if (!editingItem.id || !editingItem.label) {
      showMessage('ID and Label are required', 'error');
      return;
    }

    const newCats = { ...categories };
    const newItem = {
      id: editingItem.id,
      label: editingItem.label,
    };
    
    if (editingItem.query) {
      newItem.query = editingItem.query;
    }
    if (editingItem.colorClass) {
      newItem.colorClass = editingItem.colorClass;
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

  const handleResetGame = async () => {
    if (window.confirm(`Reset ${config.name} categories to defaults?`)) {
      const defaults = serializeCategories(DEFAULT_CATEGORIES[gameId]);
      setCategories(defaults);
      await saveCategoriestoFirebase(gameId, DEFAULT_CATEGORIES[gameId]);
      showMessage('Reset to defaults');
    }
  };

  if (!config) return null;

  if (loading) {
    return (
      <div className="app">
        <div className="admin-editor">
          <header>
            <Link to="/admin" className="back-link">← Admin Home</Link>
            <h1 className={`${gameId}-title`}>{config.name} Categories</h1>
          </header>
          <div className="loading">
            <div className={`spinner ${gameId}`}></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <button 
            className={`btn-primary ${gameId}`} 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save to Firebase'}
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
                <div key={item.id || index} className="category-item">
                  <div className="item-info">
                    <span className="item-label">{item.label}</span>
                    {item.query && <span className="item-query">{item.query}</span>}
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
                <label>Query ({gameId === 'mtg' ? 'Scryfall syntax' : 'filter key'})</label>
                <input
                  type="text"
                  value={editingItem.query || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, query: e.target.value })}
                  placeholder={gameId === 'mtg' ? 'e.g., keyword:flying, c:r' : 'e.g., pitch=1'}
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