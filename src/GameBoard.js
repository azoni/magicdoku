import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// SVG Icons for performance ratings
const TrophyIcon = ({ color = '#ffd700' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 9H4.5a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5H6"/>
    <path d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5H18"/>
    <path d="M6 4.5h12v6a6 6 0 0 1-12 0v-6z"/>
    <path d="M12 16.5v3"/>
    <path d="M8 21h8"/>
  </svg>
);

const StarIcon = ({ color = '#4ade80' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const ThumbsUpIcon = ({ color = '#60a5fa' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const MehIcon = ({ color = '#f59e0b' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="15" x2="16" y2="15"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const FlexIcon = ({ color = '#ef4444' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

// Seeded random number generator
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

function getTodayString() {
  const today = new Date();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
}

function getDailySeed() {
  const dateString = getTodayString();
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
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getTimeUntilNextPuzzle() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  const diff = tomorrow - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

function getPerformanceRating(score) {
  if (score === 9) return { rating: 'PERFECT', Icon: TrophyIcon, color: '#ffd700' };
  if (score >= 7) return { rating: 'GREAT', Icon: StarIcon, color: '#4ade80' };
  if (score >= 5) return { rating: 'GOOD', Icon: ThumbsUpIcon, color: '#60a5fa' };
  if (score >= 3) return { rating: 'OKAY', Icon: MehIcon, color: '#f59e0b' };
  return { rating: 'TOUGH', Icon: FlexIcon, color: '#ef4444' };
}

// Puzzle generation
async function generatePuzzle(game, seed, hiddenCategoryIds = []) {
  let allCategories = game.getAllCategories();
  
  allCategories = allCategories.filter(cat => !hiddenCategoryIds.includes(cat.id));
  
  const shuffled = shuffleWithSeed(allCategories, seed);
  
  const checkValid = game.checkValidCardExists || (() => true);
  
  let rowCategories = [];
  let colCategories = [];
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const candidates = shuffleWithSeed([...shuffled], seed + attempts);
    rowCategories = [];
    colCategories = [];
    
    for (const cat of candidates) {
      // Use category id as fallback if group is not defined
      const catGroup = cat.group || cat.id;
      
      const rowHasGroup = rowCategories.some(c => (c.group || c.id) === catGroup);
      const colHasGroup = colCategories.some(c => (c.group || c.id) === catGroup);
      
      if (rowCategories.length < 3 && !rowHasGroup) {
        rowCategories.push(cat);
      } else if (colCategories.length < 3 && !colHasGroup && !rowCategories.includes(cat)) {
        colCategories.push(cat);
      }
      if (rowCategories.length === 3 && colCategories.length === 3) break;
    }
    
    if (rowCategories.length === 3 && colCategories.length === 3) {
      let allValid = true;
      for (let row = 0; row < 3 && allValid; row++) {
        for (let col = 0; col < 3 && allValid; col++) {
          if (!checkValid(rowCategories[row], colCategories[col])) {
            allValid = false;
          }
        }
      }
      if (allValid) break;
    }
    attempts++;
  }
  
  // Safeguard: if we couldn't generate enough categories, log error
  if (rowCategories.length !== 3 || colCategories.length !== 3) {
    console.error('Failed to generate valid puzzle. Row categories:', rowCategories.length, 'Col categories:', colCategories.length);
  }
  
  return { rowCategories, colCategories };
}

// Firebase functions
async function recordGuess(gameId, cellIndex, cardName, isCorrect) {
  const dateStr = getTodayString();
  const docId = `${gameId}-${dateStr}`;
  
  try {
    const docRef = doc(db, 'guesses', docId);
    const docSnap = await getDoc(docRef);
    
    const cellKey = `cell${cellIndex}`;
    const cardKey = cardName.replace(/[./#$[\]]/g, '_').substring(0, 50);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        gameId,
        date: dateStr,
        totalGuesses: 1,
        [cellKey]: {
          totalGuesses: 1,
          correctGuesses: isCorrect ? 1 : 0,
          cards: {
            [cardKey]: { name: cardName, count: 1, correct: isCorrect }
          }
        }
      });
    } else {
      const data = docSnap.data();
      const cellData = data[cellKey] || { totalGuesses: 0, correctGuesses: 0, cards: {} };
      const cardData = cellData.cards?.[cardKey] || { name: cardName, count: 0, correct: isCorrect };
      
      await updateDoc(docRef, {
        totalGuesses: increment(1),
        [`${cellKey}.totalGuesses`]: increment(1),
        [`${cellKey}.correctGuesses`]: increment(isCorrect ? 1 : 0),
        [`${cellKey}.cards.${cardKey}`]: {
          name: cardName,
          count: cardData.count + 1,
          correct: isCorrect
        }
      });
    }
  } catch (error) {
    console.error('Error recording guess:', error);
  }
}

async function getAllStats(gameId) {
  const dateStr = getTodayString();
  const docId = `${gameId}-${dateStr}`;
  
  try {
    const docRef = doc(db, 'guesses', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error getting all stats:', error);
  }
  return null;
}

function GameBoard({ game }) {
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
    statsRecorded: false,
  });
  const [message, setMessage] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilNextPuzzle());
  const [showHelp, setShowHelp] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRarest, setShowRarest] = useState(false);
  
  const inputRef = useRef(null);
  const lookupTimeout = useRef(null);
  
  const gameId = game.config.id;

  // Countdown timer
  useEffect(() => {
    if (!gameState.gameOver) return;
    
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextPuzzle());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.gameOver]);

  // Initialize game
  useEffect(() => {
    async function initGame() {
      setLoading(true);
      const seed = getDailySeed();
      
      let hiddenCategoryIds = [];
      try {
        const hiddenRef = doc(db, 'settings', 'hiddenCategories');
        const hiddenSnap = await getDoc(hiddenRef);
        if (hiddenSnap.exists()) {
          hiddenCategoryIds = hiddenSnap.data()[gameId] || [];
        }
      } catch (error) {
        console.log('Could not load hidden categories:', error.message);
      }
      
      const puzzle = await generatePuzzle(game, seed, hiddenCategoryIds);
      
      const savedState = localStorage.getItem(`tcgdoku-${gameId}-${seed}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState({
          ...parsed,
          rowCategories: puzzle.rowCategories,
          colCategories: puzzle.colCategories,
          usedCards: new Set(parsed.usedCards || []),
        });
        
        if (parsed.gameOver) {
          const allStats = await getAllStats(gameId);
          setStats(allStats);
        }
      } else {
        setGameState({
          rowCategories: puzzle.rowCategories,
          colCategories: puzzle.colCategories,
          board: Array(9).fill(null),
          guesses: 0,
          score: 0,
          selectedCell: null,
          usedCards: new Set(),
          gameOver: false,
          statsRecorded: false,
        });
      }
      
      setLoading(false);
    }
    
    initGame();
  }, [game, gameId]);

  // Save state
  useEffect(() => {
    if (!loading && gameState.rowCategories.length > 0) {
      const seed = getDailySeed();
      const stateToSave = {
        ...gameState,
        usedCards: Array.from(gameState.usedCards),
      };
      localStorage.setItem(`tcgdoku-${gameId}-${seed}`, JSON.stringify(stateToSave));
    }
  }, [gameState, loading, gameId]);

  const showMessage = useCallback((text, type, persistent = false) => {
    setMessage({ text, type });
    if (!persistent) {
      setTimeout(() => setMessage(null), 3000);
    }
  }, []);

  // Cell selection - open input modal
  const selectCell = useCallback((idx) => {
    if (gameState.gameOver || gameState.board[idx] !== null) return;
    
    setGameState(prev => ({ ...prev, selectedCell: idx }));
    setGuessInput('');
    setCardPreview(null);
    setShowInputModal(true);
  }, [gameState.gameOver, gameState.board]);

  // Close modal
  const closeInputModal = useCallback(() => {
    setShowInputModal(false);
    setGameState(prev => ({ ...prev, selectedCell: null }));
    setGuessInput('');
    setCardPreview(null);
  }, []);

  // Card lookup with debounce
  useEffect(() => {
    if (lookupTimeout.current) {
      clearTimeout(lookupTimeout.current);
    }
    
    if (guessInput.length < 3) {
      setCardPreview(null);
      setLookingUp(false);
      return;
    }
    
    if (['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase())) {
      setCardPreview(null);
      setLookingUp(false);
      return;
    }
    
    setLookingUp(true);
    
    lookupTimeout.current = setTimeout(async () => {
      try {
        const card = await game.lookupCard(guessInput.trim());
        setCardPreview(card);
      } catch (error) {
        setCardPreview(null);
      }
      setLookingUp(false);
    }, 300);
    
    return () => {
      if (lookupTimeout.current) {
        clearTimeout(lookupTimeout.current);
      }
    };
  }, [guessInput, game]);

  // Submit guess
  const submitGuess = useCallback(async () => {
    if (gameState.selectedCell === null || gameState.gameOver || !guessInput.trim() || submitting) return;
    
    const isCheat = ['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase());
    
    if (!isCheat && !cardPreview) {
      showMessage('Card not found', 'error');
      return;
    }
    
    const card = isCheat ? { name: `[CHEAT-${Date.now()}]` } : cardPreview;
    
    if (!isCheat && gameState.usedCards.has(card.name.toLowerCase())) {
      showMessage(`Already used ${card.name}!`, 'error');
      return;
    }
    
    setSubmitting(true);
    
    const row = Math.floor(gameState.selectedCell / 3);
    const col = gameState.selectedCell % 3;
    const rowCat = gameState.rowCategories[row];
    const colCat = gameState.colCategories[col];
    
    const matchesRow = isCheat || game.checkCard(card, rowCat);
    const matchesCol = isCheat || game.checkCard(card, colCat);
    const isCorrect = matchesRow && matchesCol;
    
    if (!isCheat) {
      await recordGuess(gameId, gameState.selectedCell, card.name, isCorrect);
    }
    
    const willBeGameOver = gameState.guesses + 1 >= 9 || (isCorrect && gameState.score + 1 === 9);
    
    setGameState(prev => {
      const newGuesses = prev.guesses + 1;
      const newUsedCards = new Set(prev.usedCards);
      
      if (isCorrect) {
        newUsedCards.add(card.name.toLowerCase());
        const newBoard = [...prev.board];
        newBoard[prev.selectedCell] = card;
        const newScore = prev.score + 1;
        const isWin = newScore === 9;
        const isGameOver = isWin || newGuesses >= 9;
        
        if (!isGameOver) {
          showMessage(`✓ ${card.name}`, 'success');
        }
        
        return {
          ...prev,
          board: newBoard,
          guesses: newGuesses,
          score: newScore,
          selectedCell: null,
          usedCards: newUsedCards,
          gameOver: isGameOver,
          statsRecorded: false,
        };
      } else {
        showMessage(`✗ ${card.name}`, 'error');
        
        const isGameOver = newGuesses >= 9;
        
        return {
          ...prev,
          guesses: newGuesses,
          gameOver: isGameOver,
          selectedCell: isGameOver ? null : prev.selectedCell,
          statsRecorded: false,
        };
      }
    });
    
    setGuessInput('');
    setCardPreview(null);
    setSubmitting(false);
    
    // Close modal on correct answer or game over
    if (isCorrect || willBeGameOver) {
      setShowInputModal(false);
    }
  }, [gameState, guessInput, showMessage, game, gameId, submitting, cardPreview]);

  // Load community stats when game ends
  useEffect(() => {
    if (gameState.gameOver && !gameState.statsRecorded) {
      setShowInputModal(false);
      setGameState(prev => ({ ...prev, statsRecorded: true }));
      
      const timer = setTimeout(() => {
        getAllStats(gameId).then(setStats);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver, gameState.statsRecorded, gameId]);

  // Get cell statistics
  const getCellStats = useCallback((cellIndex) => {
    if (!stats) return null;
    const cellData = stats[`cell${cellIndex}`];
    if (!cellData?.cards) return null;
    
    const totalCorrect = cellData.correctGuesses || 0;
    if (totalCorrect === 0) return null;
    
    const sortedCards = Object.values(cellData.cards)
      .filter(c => c.correct)
      .sort((a, b) => b.count - a.count)
      .map(c => ({
        name: c.name,
        percent: Math.round((c.count / totalCorrect) * 100),
        count: c.count,
      }));
    
    return {
      totalCorrect,
      mostCommon: sortedCards.slice(0, 3),
      leastCommon: [...sortedCards].reverse().slice(0, 3),
    };
  }, [stats]);

  // Get player's percentage for a cell they got correct
  const getPlayerCellPercent = useCallback((cellIndex) => {
    const card = gameState.board[cellIndex];
    if (!card || !stats) return null;
    
    const cellData = stats[`cell${cellIndex}`];
    if (!cellData?.cards) return null;
    
    const totalCorrect = cellData.correctGuesses || 0;
    if (totalCorrect === 0) return null;
    
    // Find the card in stats
    const cardKey = card.name.replace(/[./#$[\]]/g, '_').substring(0, 50);
    const cardStats = Object.entries(cellData.cards).find(([key, val]) => 
      key === cardKey || val.name.toLowerCase() === card.name.toLowerCase()
    );
    
    if (cardStats) {
      return Math.round((cardStats[1].count / totalCorrect) * 100);
    }
    
    // If not found (new answer), return a small percentage
    return 1;
  }, [gameState.board, stats]);

  // Calculate uniqueness score (sum of percentages - lower is more unique)
  const getUniquenessScore = useCallback(() => {
    if (!stats) return null;
    
    let totalPercent = 0;
    let cellsWithStats = 0;
    
    for (let i = 0; i < 9; i++) {
      const percent = getPlayerCellPercent(i);
      if (percent !== null) {
        totalPercent += percent;
        cellsWithStats++;
      }
    }
    
    return cellsWithStats > 0 ? totalPercent : null;
  }, [stats, getPlayerCellPercent]);

  const getShareText = useCallback(() => {
    const perf = getPerformanceRating(gameState.score);
    const grid = [
      gameState.board.slice(0, 3).map(c => c ? '🟩' : '⬛').join(''),
      gameState.board.slice(3, 6).map(c => c ? '🟩' : '⬛').join(''),
      gameState.board.slice(6, 9).map(c => c ? '🟩' : '⬛').join(''),
    ].join('\n');
    
    const uniqueness = getUniquenessScore();
    const uniqueText = uniqueness !== null ? `\nRarity: ${uniqueness}` : '';
    
    return `${game.config.shortName} ${getFormattedDate()}\n${gameState.score}/9 ${perf.rating}${uniqueText}\n\n${grid}\n\ntcgdoku.netlify.app`;
  }, [gameState, game.config.shortName, getUniquenessScore]);

  const copyResults = useCallback(() => {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getShareText]);

  if (loading) {
    return (
      <div className="app compact">
        <header className="compact-header">
          <Link to="/" className="back-link">←</Link>
          <h1 className={`${gameId}-title`}>{game.config.shortName.toUpperCase()}</h1>
          <div style={{ width: 32 }} />
        </header>
        <div className="loading">
          <div className={`spinner ${gameId}`}></div>
        </div>
      </div>
    );
  }

  const perf = getPerformanceRating(gameState.score);

  return (
    <div className="app compact">
      <header className="compact-header">
        <Link to="/" className="back-link">←</Link>
        <div className="header-center">
          <h1 className={`${gameId}-title`}>{game.config.shortName.toUpperCase()}</h1>
          <span className="date-small">{getFormattedDate()}</span>
        </div>
        <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="How to play">
          <HelpIcon />
          <span>How to Play</span>
        </button>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className={`stat-pill ${gameId}`}>
          <span className="stat-label">Guesses</span>
          <span className="stat-value">{gameState.guesses}/9</span>
        </div>
        <div className={`stat-pill ${gameId}`}>
          <span className="stat-label">Score</span>
          <span className="stat-value">{gameState.score}/9</span>
        </div>
      </div>

      {/* Message */}
      {message && !showInputModal && (
        <div className={`message-toast ${message.type} ${gameId}`}>
          {message.text}
        </div>
      )}

      {/* Game Board */}
      <div className="game-board compact">
        <div className="corner"></div>
        
        {gameState.colCategories.map((cat, idx) => (
          <div key={`col-${idx}`} className={`header-cell compact ${cat.colorClass || ''}`}>
            {cat.label}
          </div>
        ))}
        
        {[0, 1, 2].map(row => (
          <React.Fragment key={`row-${row}`}>
            <div className={`header-cell compact ${gameState.rowCategories[row]?.colorClass || ''}`}>
              {gameState.rowCategories[row]?.label}
            </div>
            
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const card = gameState.board[idx];
              const isSelected = gameState.selectedCell === idx;
              const cellStats = gameState.gameOver ? getCellStats(idx) : null;
              const playerPercent = gameState.gameOver ? getPlayerCellPercent(idx) : null;
              const displayStats = cellStats ? (showRarest ? cellStats.leastCommon : cellStats.mostCommon) : [];
              
              return (
                <div
                  key={`cell-${idx}`}
                  className={`cell compact ${isSelected ? `selected ${gameId}` : ''} ${card ? 'solved' : ''} ${gameState.gameOver && !card ? 'missed' : ''}`}
                  onClick={() => selectCell(idx)}
                >
                  {card ? (
                    <>
                      {game.getCardImage(card) ? (
                        <img 
                          className="card-image" 
                          src={game.getCardImage(card)} 
                          alt={card.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="card-placeholder" style={{ display: game.getCardImage(card) ? 'none' : 'flex' }}>
                        <span className="placeholder-name">{card.name}</span>
                      </div>
                      {/* Player's percentage badge */}
                      {gameState.gameOver && playerPercent !== null && (
                        <div className="player-percent-badge">{playerPercent}%</div>
                      )}
                      <div className="card-name-overlay">{card.name}</div>
                    </>
                  ) : null}
                  
                  {/* Stats overlay for game over - only on empty cells */}
                  {gameState.gameOver && !card && displayStats.length > 0 && (
                    <div className="cell-stats-overlay">
                      {displayStats.slice(0, 2).map((a, i) => (
                        <div key={i} className="stat-row">
                          <span className="stat-pct">{a.percent}%</span>
                          <span className="stat-card">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Game Over Panel */}
      {gameState.gameOver && (
        <div className="game-over-compact">
          <div className="result-row">
            <perf.Icon color={perf.color} />
            <span className="result-text" style={{ color: perf.color }}>{perf.rating}</span>
            <span className="result-score">{gameState.score}/9</span>
            {getUniquenessScore() !== null && (
              <span className="uniqueness-score">
                Rarity: <strong>{getUniquenessScore()}</strong>
              </span>
            )}
          </div>
          
          {/* Most/Least Common Toggle */}
          {stats && (
            <div className="rarity-toggle">
              <button 
                className={`toggle-btn ${!showRarest ? 'active' : ''}`}
                onClick={() => setShowRarest(false)}
              >
                Most Common
              </button>
              <button 
                className={`toggle-btn ${showRarest ? 'active' : ''}`}
                onClick={() => setShowRarest(true)}
              >
                Least Common
              </button>
            </div>
          )}
          
          <div className="share-row">
            <div className="share-grid">
              {gameState.board.slice(0, 3).map((c, i) => <div key={i} className={`share-cell ${c ? 'filled' : ''}`} />)}
              {gameState.board.slice(3, 6).map((c, i) => <div key={i+3} className={`share-cell ${c ? 'filled' : ''}`} />)}
              {gameState.board.slice(6, 9).map((c, i) => <div key={i+6} className={`share-cell ${c ? 'filled' : ''}`} />)}
            </div>
            <button className={`copy-btn ${gameId} ${copied ? 'copied' : ''}`} onClick={copyResults}>
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          
          <div className="next-row">
            <span className="next-label">Next puzzle in</span>
            <span className="countdown">
              {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Input Modal */}
      {showInputModal && gameState.selectedCell !== null && (
        <div className="modal-overlay" onClick={closeInputModal}>
          <div className="input-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeInputModal}>
              <CloseIcon />
            </button>
            
            <div className="modal-criteria">
              <span className={`criteria-tag ${gameState.rowCategories[Math.floor(gameState.selectedCell / 3)]?.colorClass || ''}`}>
                {gameState.rowCategories[Math.floor(gameState.selectedCell / 3)]?.label}
              </span>
              <span className="criteria-plus">+</span>
              <span className={`criteria-tag ${gameState.colCategories[gameState.selectedCell % 3]?.colorClass || ''}`}>
                {gameState.colCategories[gameState.selectedCell % 3]?.label}
              </span>
            </div>
            
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitGuess(); }}>
              <input
                ref={inputRef}
                type="text"
                className={`modal-input ${gameId} ${cardPreview ? 'valid' : ''}`}
                placeholder="Type card name..."
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </form>
            
            {/* Preview */}
            <div className="modal-preview">
              {guessInput.length >= 3 && (
                <>
                  {['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase()) ? (
                    <div className="preview-found cheat">
                      <span>CHEAT MODE</span>
                      <small>Press Enter to auto-win</small>
                    </div>
                  ) : lookingUp ? (
                    <div className="preview-loading">Searching...</div>
                  ) : cardPreview ? (
                    <div className="preview-found">
                      {game.getCardImage(cardPreview) && (
                        <img src={game.getCardImage(cardPreview)} alt="" className="preview-img" />
                      )}
                      <div className="preview-details">
                        <span className="preview-name">{cardPreview.name}</span>
                        <small>Press Enter to submit</small>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-not-found">No card found</div>
                  )}
                </>
              )}
            </div>
            
            {message && (
              <div className={`modal-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowHelp(false)}>
              <CloseIcon />
            </button>
            <h2>How to Play</h2>
            <div className="help-content">
              <p>Click a cell and type a card name that matches <strong>both</strong> the row and column criteria.</p>
              <p>No autocomplete — you need to know your cards!</p>
              <p>You have <strong>9 guesses</strong> to fill all 9 cells.</p>
              <p>Each card can only be used <strong>once</strong>.</p>
              <p>New puzzle <strong>daily</strong> at midnight UTC.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;