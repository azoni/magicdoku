import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

import { CATEGORIES as MTG_CATEGORIES, config as mtgConfig } from './games/mtg';
import { CATEGORIES as FAB_CATEGORIES, config as fabConfig } from './games/fab';

const GAME_CONFIGS = {
  mtg: { config: mtgConfig, categories: MTG_CATEGORIES },
  fab: { config: fabConfig, categories: FAB_CATEGORIES },
};

// Flatten categories into array with group labels
function flattenCategories(categories) {
  const flat = [];
  Object.entries(categories).forEach(([groupKey, items]) => {
    items.forEach(item => {
      flat.push({
        ...item,
        group: groupKey,
        uniqueId: `${groupKey}-${item.id}`,
      });
    });
  });
  return flat;
}

// Serialize category for storage (remove functions)
function serializeCategory(cat) {
  if (!cat) return null;
  return {
    id: cat.id,
    label: cat.label,
    query: cat.query,
    colorClass: cat.colorClass,
    group: cat.group,
  };
}

export default function PuzzleCreator() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState('mtg');
  const [puzzleName, setPuzzleName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [rowCategories, setRowCategories] = useState([null, null, null]);
  const [colCategories, setColCategories] = useState([null, null, null]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load categories when game changes
  useEffect(() => {
    async function loadCategories() {
      // Try to load from Firebase first (to get admin-modified categories)
      try {
        const docRef = doc(db, 'categories', gameId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().categories) {
          const fbCats = docSnap.data().categories;
          setAvailableCategories(flattenCategories(fbCats));
          return;
        }
      } catch (e) {
        console.log('Firebase unavailable, using defaults');
      }
      
      // Fall back to defaults
      setAvailableCategories(flattenCategories(GAME_CONFIGS[gameId].categories));
    }
    
    loadCategories();
    setRowCategories([null, null, null]);
    setColCategories([null, null, null]);
  }, [gameId]);

  // Get categories not already selected
  const getAvailableForSlot = (currentSelection, index, isRow) => {
    const otherSelections = [
      ...rowCategories.filter((_, i) => !(isRow && i === index)),
      ...colCategories.filter((_, i) => !(!isRow && i === index)),
    ].filter(Boolean).map(c => c.uniqueId);
    
    return availableCategories.filter(c => !otherSelections.includes(c.uniqueId));
  };

  const handleRowChange = (index, uniqueId) => {
    const cat = availableCategories.find(c => c.uniqueId === uniqueId) || null;
    setRowCategories(prev => {
      const newRows = [...prev];
      newRows[index] = cat;
      return newRows;
    });
  };

  const handleColChange = (index, uniqueId) => {
    const cat = availableCategories.find(c => c.uniqueId === uniqueId) || null;
    setColCategories(prev => {
      const newCols = [...prev];
      newCols[index] = cat;
      return newCols;
    });
  };

  const isValid = () => {
    return (
      puzzleName.trim() &&
      rowCategories.every(c => c !== null) &&
      colCategories.every(c => c !== null)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const puzzleData = {
        name: puzzleName.trim(),
        creatorName: creatorName.trim() || 'Anonymous',
        gameId,
        rowCategories: rowCategories.map(serializeCategory),
        colCategories: colCategories.map(serializeCategory),
        createdAt: new Date().toISOString(),
        plays: 0,
      };
      
      const docRef = await addDoc(collection(db, 'customPuzzles'), puzzleData);
      navigate(`/puzzle/${docRef.id}`);
    } catch (err) {
      console.error('Error creating puzzle:', err);
      setError('Failed to create puzzle. Please try again.');
      setSubmitting(false);
    }
  };

  // Group categories for dropdown
  const groupedCategories = (cats) => {
    const groups = {};
    cats.forEach(cat => {
      if (!groups[cat.group]) groups[cat.group] = [];
      groups[cat.group].push(cat);
    });
    return groups;
  };

  return (
    <div className="app">
      <div className="puzzle-creator">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>🎨 Create Custom Puzzle</h1>
        <p className="creator-subtitle">Design your own TCGDoku for others to play!</p>
        
        <form onSubmit={handleSubmit}>
          {/* Game Selection */}
          <div className="creator-section">
            <label>Select Game</label>
            <div className="game-selector">
              {Object.entries(GAME_CONFIGS).map(([id, { config: cfg }]) => (
                <button
                  key={id}
                  type="button"
                  className={`game-option ${id} ${gameId === id ? 'selected' : ''}`}
                  onClick={() => setGameId(id)}
                >
                  <span className="game-emoji">{cfg.emoji}</span>
                  <span>{cfg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Puzzle Name */}
          <div className="creator-section">
            <label>Puzzle Name *</label>
            <input
              type="text"
              value={puzzleName}
              onChange={(e) => setPuzzleName(e.target.value)}
              placeholder="e.g., Color Challenge, Keyword Chaos"
              maxLength={50}
            />
          </div>

          {/* Creator Name */}
          <div className="creator-section">
            <label>Your Name (optional)</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Anonymous"
              maxLength={30}
            />
          </div>

          {/* Row Categories */}
          <div className="creator-section">
            <label>Row Categories (left side)</label>
            <div className="category-slots">
              {[0, 1, 2].map(i => (
                <select
                  key={`row-${i}`}
                  value={rowCategories[i]?.uniqueId || ''}
                  onChange={(e) => handleRowChange(i, e.target.value)}
                  className={gameId}
                >
                  <option value="">Select category...</option>
                  {Object.entries(groupedCategories(getAvailableForSlot(rowCategories, i, true))).map(([group, cats]) => (
                    <optgroup key={group} label={group.charAt(0).toUpperCase() + group.slice(1)}>
                      {cats.map(cat => (
                        <option key={cat.uniqueId} value={cat.uniqueId}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Column Categories */}
          <div className="creator-section">
            <label>Column Categories (top)</label>
            <div className="category-slots">
              {[0, 1, 2].map(i => (
                <select
                  key={`col-${i}`}
                  value={colCategories[i]?.uniqueId || ''}
                  onChange={(e) => handleColChange(i, e.target.value)}
                  className={gameId}
                >
                  <option value="">Select category...</option>
                  {Object.entries(groupedCategories(getAvailableForSlot(colCategories, i, false))).map(([group, cats]) => (
                    <optgroup key={group} label={group.charAt(0).toUpperCase() + group.slice(1)}>
                      {cats.map(cat => (
                        <option key={cat.uniqueId} value={cat.uniqueId}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="creator-section">
            <label>Preview</label>
            <div className="puzzle-preview">
              <div className="preview-grid">
                <div className="preview-corner"></div>
                {colCategories.map((cat, i) => (
                  <div key={`col-${i}`} className={`preview-header col ${cat?.colorClass || ''}`}>
                    {cat?.label || '?'}
                  </div>
                ))}
                {[0, 1, 2].map(row => (
                  <React.Fragment key={row}>
                    <div className={`preview-header row ${rowCategories[row]?.colorClass || ''}`}>
                      {rowCategories[row]?.label || '?'}
                    </div>
                    {[0, 1, 2].map(col => (
                      <div key={`${row}-${col}`} className="preview-cell"></div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className={`btn-primary ${gameId} create-btn`}
            disabled={!isValid() || submitting}
          >
            {submitting ? 'Creating...' : '✨ Create Puzzle'}
          </button>
        </form>
      </div>
    </div>
  );
}