import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// CATEGORY DEFINITIONS
// ============================================
const CATEGORIES = {
  // Colors
  colors: [
    { id: 'white', label: 'White', query: 'c:w', colorClass: 'color-W' },
    { id: 'blue', label: 'Blue', query: 'c:u', colorClass: 'color-U' },
    { id: 'black', label: 'Black', query: 'c:b', colorClass: 'color-B' },
    { id: 'red', label: 'Red', query: 'c:r', colorClass: 'color-R' },
    { id: 'green', label: 'Green', query: 'c:g', colorClass: 'color-G' },
    { id: 'colorless', label: 'Colorless', query: 'c:c', colorClass: 'color-C' },
    { id: 'multicolor', label: 'Multicolor', query: 'c>=2', colorClass: 'color-M' },
  ],
  
  // Card Types
  types: [
    { id: 'creature', label: 'Creature', query: 't:creature' },
    { id: 'instant', label: 'Instant', query: 't:instant' },
    { id: 'sorcery', label: 'Sorcery', query: 't:sorcery' },
    { id: 'enchantment', label: 'Enchantment', query: 't:enchantment' },
    { id: 'artifact', label: 'Artifact', query: 't:artifact' },
    { id: 'planeswalker', label: 'Planeswalker', query: 't:planeswalker' },
    { id: 'land', label: 'Land', query: 't:land' },
  ],
  
  // Creature Types
  creatureTypes: [
    { id: 'human', label: 'Human', query: 't:human' },
    { id: 'elf', label: 'Elf', query: 't:elf' },
    { id: 'goblin', label: 'Goblin', query: 't:goblin' },
    { id: 'zombie', label: 'Zombie', query: 't:zombie' },
    { id: 'dragon', label: 'Dragon', query: 't:dragon' },
    { id: 'angel', label: 'Angel', query: 't:angel' },
    { id: 'demon', label: 'Demon', query: 't:demon' },
    { id: 'vampire', label: 'Vampire', query: 't:vampire' },
    { id: 'wizard', label: 'Wizard', query: 't:wizard' },
    { id: 'warrior', label: 'Warrior', query: 't:warrior' },
    { id: 'soldier', label: 'Soldier', query: 't:soldier' },
    { id: 'beast', label: 'Beast', query: 't:beast' },
    { id: 'elemental', label: 'Elemental', query: 't:elemental' },
    { id: 'spirit', label: 'Spirit', query: 't:spirit' },
    { id: 'merfolk', label: 'Merfolk', query: 't:merfolk' },
  ],
  
  // Mana Value
  manaValue: [
    { id: 'mv0', label: 'MV = 0', query: 'mv=0' },
    { id: 'mv1', label: 'MV = 1', query: 'mv=1' },
    { id: 'mv2', label: 'MV = 2', query: 'mv=2' },
    { id: 'mv3', label: 'MV = 3', query: 'mv=3' },
    { id: 'mv4plus', label: 'MV ≥ 4', query: 'mv>=4' },
    { id: 'mv6plus', label: 'MV ≥ 6', query: 'mv>=6' },
  ],
  
  // Rarity
  rarity: [
    { id: 'common', label: 'Common', query: 'r:common' },
    { id: 'uncommon', label: 'Uncommon', query: 'r:uncommon' },
    { id: 'rare', label: 'Rare', query: 'r:rare' },
    { id: 'mythic', label: 'Mythic', query: 'r:mythic' },
  ],
  
  // Keywords
  keywords: [
    { id: 'flying', label: 'Flying', query: 'o:flying t:creature' },
    { id: 'trample', label: 'Trample', query: 'o:trample' },
    { id: 'deathtouch', label: 'Deathtouch', query: 'o:deathtouch' },
    { id: 'lifelink', label: 'Lifelink', query: 'o:lifelink' },
    { id: 'haste', label: 'Haste', query: 'o:haste' },
    { id: 'vigilance', label: 'Vigilance', query: 'o:vigilance' },
    { id: 'firstStrike', label: 'First Strike', query: 'o:"first strike"' },
    { id: 'flash', label: 'Flash', query: 'o:flash' },
  ],
  
  // Power/Toughness
  stats: [
    { id: 'power4plus', label: 'Power ≥ 4', query: 'pow>=4' },
    { id: 'power1', label: 'Power = 1', query: 'pow=1' },
    { id: 'toughness5plus', label: 'Toughness ≥ 5', query: 'tou>=5' },
    { id: 'toughness1', label: 'Toughness = 1', query: 'tou=1' },
  ],
  
  // Popular Sets
  sets: [
    { id: 'dominaria', label: 'Dominaria', query: 's:dom' },
    { id: 'innistrad', label: 'Innistrad', query: 's:isd' },
    { id: 'ravnica', label: 'Ravnica', query: 's:rav' },
    { id: 'zendikar', label: 'Zendikar', query: 's:zen' },
    { id: 'theros', label: 'Theros', query: 's:ths' },
    { id: 'mirrodin', label: 'Mirrodin', query: 's:mrd' },
    { id: 'kamigawa', label: 'Kamigawa NEO', query: 's:neo' },
    { id: 'eldraine', label: 'Eldraine', query: 's:eld' },
  ],
};

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffleWithSeed(array, seed) {
  const arr = [...array];
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(currentSeed++) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get today's seed (changes daily)
function getDailySeed() {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// ============================================
// SCRYFALL API
// ============================================
const SCRYFALL_SEARCH = 'https://api.scryfall.com/cards/search';
const SCRYFALL_AUTOCOMPLETE = 'https://api.scryfall.com/cards/autocomplete';
const SCRYFALL_NAMED = 'https://api.scryfall.com/cards/named';

// Rate limiting helper
let lastRequest = 0;
const MIN_REQUEST_INTERVAL = 100; // ms between requests

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequest = Date.now();
  return fetch(url);
}

// Check if a valid card exists for two categories
async function checkValidCardExists(cat1, cat2) {
  const query = `${cat1.query} ${cat2.query}`;
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_SEARCH}?q=${encodeURIComponent(query)}&unique=cards`
    );
    const data = await response.json();
    return data.total_cards > 0;
  } catch (error) {
    console.error('Error checking card validity:', error);
    return false;
  }
}

// Search for cards matching criteria
async function searchCards(query, limit = 10) {
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_SEARCH}?q=${encodeURIComponent(query)}&unique=cards&order=name`
    );
    const data = await response.json();
    if (data.data) {
      return data.data.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}

// Autocomplete card names
async function autocompleteCards(query) {
  if (query.length < 2) return [];
  
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_AUTOCOMPLETE}?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error with autocomplete:', error);
    return [];
  }
}

// Get card by exact name
async function getCardByName(name) {
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_NAMED}?exact=${encodeURIComponent(name)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error getting card:', error);
    return null;
  }
}

// Check if card matches a category
async function cardMatchesCategory(card, category) {
  // For simple checks, we can do it client-side
  const query = `!"${card.name}" ${category.query}`;
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_SEARCH}?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.total_cards > 0;
  } catch (error) {
    return false;
  }
}

// ============================================
// PUZZLE GENERATION
// ============================================
async function generatePuzzle(seed) {
  // Get all categories flattened
  const allCategories = [
    ...CATEGORIES.colors,
    ...CATEGORIES.types,
    ...CATEGORIES.creatureTypes.slice(0, 8), // Limit creature types
    ...CATEGORIES.manaValue,
    ...CATEGORIES.rarity,
    ...CATEGORIES.keywords,
    ...CATEGORIES.stats,
  ];
  
  // Shuffle categories with seed
  const shuffled = shuffleWithSeed(allCategories, seed);
  
  // Try to find valid row/column combinations
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const startIdx = (attempts * 6) % (shuffled.length - 6);
    const rowCats = shuffled.slice(startIdx, startIdx + 3);
    const colCats = shuffled.slice(startIdx + 3, startIdx + 6);
    
    // Validate all 9 combinations
    let allValid = true;
    const validationPromises = [];
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        validationPromises.push(checkValidCardExists(rowCats[r], colCats[c]));
      }
    }
    
    const results = await Promise.all(validationPromises);
    allValid = results.every(Boolean);
    
    if (allValid) {
      return { rowCategories: rowCats, colCategories: colCats };
    }
    
    attempts++;
  }
  
  // Fallback to guaranteed valid combo
  return {
    rowCategories: [
      CATEGORIES.colors[0], // White
      CATEGORIES.colors[1], // Blue
      CATEGORIES.colors[3], // Red
    ],
    colCategories: [
      CATEGORIES.types[0], // Creature
      CATEGORIES.types[3], // Enchantment
      CATEGORIES.types[4], // Artifact
    ],
  };
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState({
    rowCategories: [],
    colCategories: [],
    board: Array(9).fill(null),
    guesses: 0,
    score: 0,
    selectedCell: null,
    usedCards: new Set(),
    gameOver: false,
  });
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize game
  useEffect(() => {
    async function initGame() {
      setLoading(true);
      const seed = getDailySeed();
      const puzzle = await generatePuzzle(seed);
      
      // Try to load saved state from localStorage
      const savedState = localStorage.getItem(`magicdoku-${seed}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState({
          ...parsed,
          rowCategories: puzzle.rowCategories,
          colCategories: puzzle.colCategories,
          usedCards: new Set(parsed.usedCards || []),
        });
      } else {
        setGameState(prev => ({
          ...prev,
          rowCategories: puzzle.rowCategories,
          colCategories: puzzle.colCategories,
          board: Array(9).fill(null),
          guesses: 0,
          score: 0,
          selectedCell: null,
          usedCards: new Set(),
          gameOver: false,
        }));
      }
      
      setLoading(false);
    }
    
    initGame();
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (!loading && gameState.rowCategories.length > 0) {
      const seed = getDailySeed();
      const stateToSave = {
        ...gameState,
        usedCards: Array.from(gameState.usedCards),
      };
      localStorage.setItem(`magicdoku-${seed}`, JSON.stringify(stateToSave));
    }
  }, [gameState, loading]);

  // Handle search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      
      // Get autocomplete suggestions
      const names = await autocompleteCards(searchQuery);
      
      // Fetch card details for first 6 suggestions
      const cardPromises = names.slice(0, 6).map(name => getCardByName(name));
      const cards = await Promise.all(cardPromises);
      
      setSuggestions(cards.filter(Boolean));
      setSearchLoading(false);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Show message temporarily
  const showMessage = useCallback((text, type, persistent = false) => {
    setMessage({ text, type });
    if (!persistent) {
      setTimeout(() => setMessage(null), 3000);
    }
  }, []);

  // Select a cell
  const selectCell = useCallback((idx) => {
    if (gameState.gameOver || gameState.board[idx] !== null) return;
    
    setGameState(prev => ({ ...prev, selectedCell: idx }));
    setSearchQuery('');
    setSuggestions([]);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameState.gameOver, gameState.board]);

  // Make a guess
  const makeGuess = useCallback(async (card) => {
    if (gameState.selectedCell === null || gameState.gameOver) return;
    
    // Check if card already used
    if (gameState.usedCards.has(card.name)) {
      showMessage('You already used that card!', 'error');
      return;
    }
    
    const row = Math.floor(gameState.selectedCell / 3);
    const col = gameState.selectedCell % 3;
    const rowCat = gameState.rowCategories[row];
    const colCat = gameState.colCategories[col];
    
    // Check if card matches both categories
    const [matchesRow, matchesCol] = await Promise.all([
      cardMatchesCategory(card, rowCat),
      cardMatchesCategory(card, colCat),
    ]);
    
    setGameState(prev => {
      const newGuesses = prev.guesses + 1;
      const newUsedCards = new Set(prev.usedCards);
      
      if (matchesRow && matchesCol) {
        // Correct!
        newUsedCards.add(card.name);
        const newBoard = [...prev.board];
        newBoard[prev.selectedCell] = card;
        const newScore = prev.score + 1;
        
        const isWin = newScore === 9;
        
        if (isWin) {
          showMessage(`🎉 Perfect! Completed in ${newGuesses} guesses!`, 'win', true);
        } else {
          showMessage(`Correct! ${card.name}`, 'success');
        }
        
        return {
          ...prev,
          board: newBoard,
          guesses: newGuesses,
          score: newScore,
          selectedCell: null,
          usedCards: newUsedCards,
          gameOver: isWin || newGuesses >= 9,
        };
      } else {
        // Wrong
        let reason = '';
        if (!matchesRow) reason = `Doesn't match "${rowCat.label}"`;
        else if (!matchesCol) reason = `Doesn't match "${colCat.label}"`;
        
        showMessage(`Wrong! ${card.name} - ${reason}`, 'error');
        
        const isGameOver = newGuesses >= 9;
        if (isGameOver) {
          showMessage(`Game Over! Score: ${prev.score}/9`, 'error', true);
        }
        
        return {
          ...prev,
          guesses: newGuesses,
          gameOver: isGameOver,
          selectedCell: isGameOver ? null : prev.selectedCell,
        };
      }
    });
    
    setSearchQuery('');
    setSuggestions([]);
  }, [gameState, showMessage]);

  // Get share text
  const getShareText = useCallback(() => {
    const emojis = gameState.board.map((cell, idx) => {
      if (cell) return '🟩';
      return '⬛';
    });
    
    const grid = [
      emojis.slice(0, 3).join(''),
      emojis.slice(3, 6).join(''),
      emojis.slice(6, 9).join(''),
    ].join('\n');
    
    return `Magicdoku ${getFormattedDate()}\n${gameState.score}/9 in ${gameState.guesses} guesses\n\n${grid}`;
  }, [gameState]);

  // Copy share text
  const shareResults = useCallback(() => {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      showMessage('Copied to clipboard!', 'success');
    });
  }, [getShareText, showMessage]);

  // Get card image URL
  const getCardImage = (card) => {
    if (card.image_uris?.small) return card.image_uris.small;
    if (card.card_faces?.[0]?.image_uris?.small) return card.card_faces[0].image_uris.small;
    return null;
  };

  if (loading) {
    return (
      <div className="app">
        <header>
          <h1>MAGICDOKU</h1>
        </header>
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating today's puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>MAGICDOKU</h1>
        <p className="date">{getFormattedDate()}</p>
      </header>

      <div className="stats">
        <div className="stat">Guesses: <span>{gameState.guesses}</span>/9</div>
        <div className="stat">Score: <span>{gameState.score}</span>/9</div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="game-board">
        <div className="corner"></div>
        
        {gameState.colCategories.map((cat, idx) => (
          <div key={`col-${idx}`} className={`header-cell col-header ${cat.colorClass || ''}`}>
            {cat.label}
          </div>
        ))}
        
        {[0, 1, 2].map(row => (
          <React.Fragment key={`row-${row}`}>
            <div className={`header-cell row-header ${gameState.rowCategories[row]?.colorClass || ''}`}>
              {gameState.rowCategories[row]?.label}
            </div>
            
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const card = gameState.board[idx];
              const isSelected = gameState.selectedCell === idx;
              
              return (
                <div
                  key={`cell-${idx}`}
                  className={`cell ${isSelected ? 'selected' : ''} ${card ? 'solved' : ''}`}
                  onClick={() => selectCell(idx)}
                >
                  {card && (
                    <>
                      {getCardImage(card) && (
                        <img 
                          className="card-image" 
                          src={getCardImage(card)} 
                          alt={card.name}
                        />
                      )}
                      <div className="card-name">{card.name}</div>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className={`input-section ${gameState.selectedCell === null ? 'hidden' : ''}`}>
        <h3>Guess a card:</h3>
        {gameState.selectedCell !== null && (
          <p className="criteria-hint">
            Must match: <strong>{gameState.rowCategories[Math.floor(gameState.selectedCell / 3)]?.label}</strong>
            {' + '}
            <strong>{gameState.colCategories[gameState.selectedCell % 3]?.label}</strong>
          </p>
        )}
        <div className="search-container">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Type a card name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={gameState.gameOver}
          />
          
          {(suggestions.length > 0 || searchLoading) && (
            <div className="suggestions">
              {searchLoading ? (
                <div className="loading-suggestions">Searching...</div>
              ) : (
                suggestions
                  .filter(card => !gameState.usedCards.has(card.name))
                  .map((card, idx) => (
                    <div
                      key={idx}
                      className="suggestion"
                      onClick={() => makeGuess(card)}
                    >
                      {getCardImage(card) && (
                        <img src={getCardImage(card)} alt={card.name} />
                      )}
                      <div className="suggestion-info">
                        <div className="suggestion-name">{card.name}</div>
                        <div className="suggestion-set">{card.set_name}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="buttons">
        {gameState.gameOver && (
          <button className="btn-primary" onClick={shareResults}>
            Share Results
          </button>
        )}
      </div>

      {gameState.gameOver && (
        <div className="share-result">
          {getShareText()}
        </div>
      )}

      <div className="rules">
        <h3>How to Play</h3>
        <p>
          Click a cell and name a Magic: The Gathering card that matches <strong>both</strong> the 
          row and column criteria. For example, if the row is "Red" and the column is "Creature", 
          you need a red creature card. You have 9 guesses to fill all 9 cells. Each card can 
          only be used once! The puzzle changes daily.
        </p>
      </div>
    </div>
  );
}

export default App;
