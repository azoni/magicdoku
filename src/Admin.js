import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Import default categories
import { CATEGORIES as MTG_CATEGORIES, config as mtgConfig } from './games/mtg';
import { CATEGORIES as FAB_CATEGORIES, config as fabConfig } from './games/fab';
import { CATEGORIES as GYM_CATEGORIES, config as gymConfig } from './games/gymnastics';

const DEFAULT_CATEGORIES = {
  mtg: MTG_CATEGORIES,
  fab: FAB_CATEGORIES,
  gymnastics: GYM_CATEGORIES,
};

const GAME_CONFIGS = {
  mtg: mtgConfig,
  fab: fabConfig,
  gymnastics: gymConfig,
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
    if (docSnap.exists() && docSnap.data().categories) {
      return docSnap.data().categories;
    }
  } catch (error) {
    console.log('Firebase unavailable:', error.message);
  }
  return null;
}

// Save categories to Firebase
async function saveCategoriesToFirebase(gameId, categories) {
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Admin Home with Stats
export function AdminHome() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [firebaseStatus, setFirebaseStatus] = useState('checking');
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [gameImages, setGameImages] = useState({ mtg: '', fab: '', gymnastics: '' });
  const [imageInputs, setImageInputs] = useState({ mtg: '', fab: '', gymnastics: '' });
  const [savingImages, setSavingImages] = useState(false);

  // Password from environment variable
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

  const handleLogin = (e) => {
    e.preventDefault();
    if (ADMIN_PASSWORD && passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('tcgdoku-admin-auth', 'true');
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  // Check if already authenticated this session
  useEffect(() => {
    if (sessionStorage.getItem('tcgdoku-admin-auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    
    async function loadData() {
      setLoading(true);
      try {
        // Load stats
        const guessesRef = collection(db, 'guesses');
        const q = query(guessesRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        
        const data = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setStats(data);
        
        // Load game images
        const settingsRef = doc(db, 'settings', 'gameImages');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const images = settingsSnap.data();
          setGameImages({ mtg: images.mtg || '', fab: images.fab || '', gymnastics: images.gymnastics || '' });
          setImageInputs({ mtg: images.mtg || '', fab: images.fab || '', gymnastics: images.gymnastics || '' });
        }
        
        setFirebaseStatus('connected');
      } catch (error) {
        console.error('Error loading data:', error);
        setFirebaseStatus('error');
      }
      setLoading(false);
    }
    
    loadData();
  }, [authenticated]);

  const saveGameImages = async () => {
    setSavingImages(true);
    try {
      const settingsRef = doc(db, 'settings', 'gameImages');
      await setDoc(settingsRef, {
        mtg: imageInputs.mtg,
        fab: imageInputs.fab,
        gymnastics: imageInputs.gymnastics,
        updatedAt: new Date().toISOString(),
      });
      setGameImages({ ...imageInputs });
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Failed to save images.');
    }
    setSavingImages(false);
  };

  const hasUnsavedChanges = gameImages.mtg !== imageInputs.mtg || gameImages.fab !== imageInputs.fab || gameImages.gymnastics !== imageInputs.gymnastics;

  // Show login screen if not authenticated
  if (!authenticated) {
    // Check if password is configured
    if (!ADMIN_PASSWORD) {
      return (
        <div className="app">
          <div className="admin-login">
            <Link to="/" className="back-link">← Back to Games</Link>
            <h1>Admin Panel</h1>
            <p className="error-text">Admin password not configured. Set REACT_APP_ADMIN_PASSWORD in environment variables.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="app">
        <div className="admin-login">
          <Link to="/" className="back-link">← Back to Games</Link>
          <h1>Admin Panel</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={passwordError ? 'error' : ''}
              autoFocus
            />
            <button type="submit" className="btn-primary">Login</button>
          </form>
          {passwordError && <p className="error-text">Incorrect password</p>}
        </div>
      </div>
    );
  }

  // Filter stats
  const filteredStats = stats.filter(s => {
    if (filter !== 'all' && s.gameId !== filter) return false;
    if (dateRange !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      const statDate = new Date(s.date);
      if (statDate < daysAgo) return false;
    }
    return true;
  });

  // Calculate totals
  const totalGuesses = filteredStats.reduce((sum, s) => sum + (s.totalGuesses || 0), 0);
  const totalCorrect = filteredStats.reduce((sum, s) => {
    let correct = 0;
    for (let i = 0; i < 9; i++) {
      correct += s[`cell${i}`]?.correctGuesses || 0;
    }
    return sum + correct;
  }, 0);
  const uniqueDays = new Set(filteredStats.map(s => s.date)).size;

  return (
    <div className="app">
      <div className="admin-home">
        <Link to="/" className="back-link">← Back to Games</Link>
        <h1>Admin Panel</h1>
        
        {/* Firebase Status */}
        <div className={`firebase-status ${firebaseStatus}`}>
          {firebaseStatus === 'checking' && 'Checking Firebase connection...'}
          {firebaseStatus === 'connected' && 'Firebase connected'}
          {firebaseStatus === 'error' && 'Firebase offline - check your config'}
        </div>
        
        {/* Category Management */}
        <div className="admin-section">
          <h3>Category Management</h3>
          <div className="admin-game-grid">
            {Object.entries(GAME_CONFIGS).map(([id, config]) => (
              <Link key={id} to={`/admin/${id}`} className={`admin-game-card ${id}`}>
                <h2>{config.name}</h2>
                <p>Edit categories</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Game Images */}
        <div className="admin-section">
          <h3>Game Card Images</h3>
          <p className="section-hint">Add image URLs for the game cards on the home page</p>
          
          <div className="image-management">
            {Object.entries(GAME_CONFIGS).map(([id, config]) => (
              <div key={id} className="image-row">
                <div className="image-preview">
                  {imageInputs[id] ? (
                    <img 
                      src={imageInputs[id]} 
                      alt={config.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="no-image">No image</div>
                  )}
                </div>
                <div className="image-input">
                  <label>{config.name}</label>
                  <input
                    type="text"
                    placeholder="Enter image URL..."
                    value={imageInputs[id]}
                    onChange={(e) => setImageInputs(prev => ({ ...prev, [id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="btn-primary save-images-btn"
            onClick={saveGameImages}
            disabled={savingImages || !hasUnsavedChanges}
          >
            {savingImages ? 'Saving...' : hasUnsavedChanges ? 'Save Images' : 'Saved'}
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="admin-section">
          <h3>Stats Dashboard</h3>
          
          <div className="admin-filters">
            <div className="filter-group">
              <label>Game:</label>
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Games</option>
                <option value="mtg">Magic: The Gathering</option>
                <option value="fab">Flesh and Blood</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date Range:</label>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading stats...</p>
            </div>
          ) : (
            <>
              <div className="stats-summary">
                <div className="summary-card">
                  <div className="summary-value">{totalGuesses.toLocaleString()}</div>
                  <div className="summary-label">Total Guesses</div>
                </div>
                <div className="summary-card">
                  <div className="summary-value">{totalCorrect.toLocaleString()}</div>
                  <div className="summary-label">Correct Guesses</div>
                </div>
                <div className="summary-card">
                  <div className="summary-value">
                    {totalGuesses > 0 ? Math.round((totalCorrect / totalGuesses) * 100) : 0}%
                  </div>
                  <div className="summary-label">Success Rate</div>
                </div>
                <div className="summary-card">
                  <div className="summary-value">{uniqueDays}</div>
                  <div className="summary-label">Days Active</div>
                </div>
              </div>

              {filteredStats.length > 0 && (
                <div className="stats-table">
                  <div className="table-header">
                    <span>Date</span>
                    <span>Game</span>
                    <span>Guesses</span>
                    <span>Correct</span>
                    <span>Rate</span>
                  </div>
                  {filteredStats.slice(0, 20).map(stat => {
                    let correctGuesses = 0;
                    for (let i = 0; i < 9; i++) {
                      correctGuesses += stat[`cell${i}`]?.correctGuesses || 0;
                    }
                    const rate = stat.totalGuesses > 0 
                      ? Math.round((correctGuesses / stat.totalGuesses) * 100) 
                      : 0;
                    
                    return (
                      <div key={stat.id} className="table-row">
                        <span>{formatDate(stat.date)}</span>
                        <span className={`game-badge ${stat.gameId}`}>
                          {GAME_CONFIGS[stat.gameId]?.emoji} {stat.gameId.toUpperCase()}
                        </span>
                        <span>{stat.totalGuesses || 0}</span>
                        <span>{correctGuesses}</span>
                        <span className={rate >= 50 ? 'good' : rate >= 25 ? 'ok' : 'low'}>
                          {rate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Data Export */}
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
              Export Categories
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
                          await saveCategoriesToFirebase(gameId, categories);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);

  const config = GAME_CONFIGS[gameId];

  // Check authentication
  useEffect(() => {
    if (sessionStorage.getItem('tcgdoku-admin-auth') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

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
        setFirebaseLoaded(true);
      } else {
        // No Firebase data - load defaults
        setCategories(serializeCategories(DEFAULT_CATEGORIES[gameId]));
        setFirebaseLoaded(false);
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
    const success = await saveCategoriesToFirebase(gameId, categories);
    setSaving(false);
    if (success) {
      setFirebaseLoaded(true);
      // Also update localStorage cache
      localStorage.setItem(`tcgdoku-categories-${gameId}`, JSON.stringify(categories));
      showMessage('Categories saved to Firebase!');
    } else {
      showMessage('Error saving categories - check Firebase config', 'error');
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

        {!firebaseLoaded && (
          <div className="firebase-status error" style={{ marginBottom: '16px' }}>
            ⚠️ Showing default categories - not yet saved to Firebase
          </div>
        )}

        <div className="admin-actions">
          <button 
            className={`btn-primary ${gameId}`} 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : firebaseLoaded ? '💾 Save Changes' : '💾 Save to Firebase'}
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
