import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

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

// Get today's date string for puzzle ID (UTC to ensure same puzzle globally)
function getTodayString() {
  const today = new Date();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
}

// Get today's seed (changes daily)
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
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Get time until next puzzle (midnight UTC)
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

// Get performance rating based on score
function getPerformanceRating(score) {
  if (score === 9) return { rating: 'PERFECT', emoji: '🏆', color: '#ffd700' };
  if (score >= 7) return { rating: 'GREAT', emoji: '🌟', color: '#4ade80' };
  if (score >= 5) return { rating: 'GOOD', emoji: '👍', color: '#60a5fa' };
  if (score >= 3) return { rating: 'OKAY', emoji: '😅', color: '#f59e0b' };
  return { rating: 'TOUGH', emoji: '💪', color: '#ef4444' };
}

// Puzzle generation
async function generatePuzzle(game, seed, hiddenCategoryIds = []) {
  let allCategories = game.getAllCategories();
  
  // Filter out hidden categories
  if (hiddenCategoryIds.length > 0) {
    allCategories = allCategories.filter(cat => !hiddenCategoryIds.includes(cat.id));
  }
  
  const shuffled = shuffleWithSeed(allCategories, seed);
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const startIdx = (attempts * 6) % Math.max(1, shuffled.length - 6);
    const rowCats = shuffled.slice(startIdx, startIdx + 3);
    const colCats = shuffled.slice(startIdx + 3, startIdx + 6);
    
    if (rowCats.length < 3 || colCats.length < 3) {
      attempts++;
      continue;
    }
    
    // Validate all 9 combinations
    const validationPromises = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        validationPromises.push(game.checkValidCardExists(rowCats[r], colCats[c]));
      }
    }
    
    const results = await Promise.all(validationPromises);
    const allValid = results.every(Boolean);
    
    if (allValid) {
      return { rowCategories: rowCats, colCategories: colCats };
    }
    
    attempts++;
  }
  
  // Fallback
  return game.getFallbackCategories();
}

// Firebase: Record a guess
async function recordGuess(gameId, cellIndex, cardName, isCorrect) {
  const dateStr = getTodayString();
  const docId = `${gameId}-${dateStr}`;
  const cellKey = `cell${cellIndex}`;
  const cardKey = cardName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  try {
    const docRef = doc(db, 'guesses', docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Create new document
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
      // Update existing
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

// Firebase: Get all stats for today
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
      
      // Load hidden categories from Firebase
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
      
      // Try to load saved state
      const savedState = localStorage.getItem(`tcgdoku-${gameId}-${seed}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setGameState({
          ...parsed,
          rowCategories: puzzle.rowCategories,
          colCategories: puzzle.colCategories,
          usedCards: new Set(parsed.usedCards || []),
        });
        
        // Load stats if game is over
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

  const selectCell = useCallback((idx) => {
    if (gameState.gameOver || gameState.board[idx] !== null) return;
    
    setGameState(prev => ({ ...prev, selectedCell: idx }));
    setGuessInput('');
    setCardPreview(null);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameState.gameOver, gameState.board]);

  // Lookup card as user types (debounced)
  useEffect(() => {
    if (lookupTimeout.current) {
      clearTimeout(lookupTimeout.current);
    }
    
    if (!guessInput.trim() || guessInput.length < 3) {
      setCardPreview(null);
      return;
    }
    
    setLookingUp(true);
    lookupTimeout.current = setTimeout(async () => {
      const card = await game.getCardByName(guessInput.trim());
      setCardPreview(card);
      setLookingUp(false);
    }, 300);
    
    return () => {
      if (lookupTimeout.current) {
        clearTimeout(lookupTimeout.current);
      }
    };
  }, [guessInput, game]);

  const submitGuess = useCallback(async () => {
    if (gameState.selectedCell === null || gameState.gameOver || !guessInput.trim() || submitting) return;
    
    // CHEAT CODE - remove later
    const cheatInput = guessInput.trim().toLowerCase();
    const isCheat = cheatInput === 'thisansweriscorrect' || cheatInput === 'cheat' || cheatInput === 'win';
    console.log('Submit:', { input: guessInput, isCheat, hasPreview: !!cardPreview });
    
    if (!cardPreview && !isCheat) {
      showMessage('Card not found. Check spelling!', 'error');
      return;
    }
    
    setSubmitting(true);
    
    // For cheat, create a fake card
    const card = isCheat ? { name: `✓ Cell ${gameState.selectedCell + 1}` } : cardPreview;
    const isCorrect = isCheat ? true : await (async () => {
      const row = Math.floor(gameState.selectedCell / 3);
      const col = gameState.selectedCell % 3;
      const rowCat = gameState.rowCategories[row];
      const colCat = gameState.colCategories[col];
      
      const [matchesRow, matchesCol] = await Promise.all([
        game.cardMatchesCategory(card, rowCat),
        game.cardMatchesCategory(card, colCat),
      ]);
      
      return matchesRow && matchesCol;
    })();
    
    // Record guess to Firebase (skip for cheat)
    if (!isCheat) {
      await recordGuess(gameId, gameState.selectedCell, card.name, isCorrect);
    }
    
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
        
        if (isWin) {
          const perf = getPerformanceRating(newScore);
          showMessage(`${perf.emoji} ${perf.rating}! ${newScore}/9`, 'win', true);
        } else if (isGameOver) {
          const perf = getPerformanceRating(newScore);
          showMessage(`${perf.emoji} ${perf.rating}! Score: ${newScore}/9`, 'info', true);
        } else {
          showMessage(isCheat ? '🎮 Cheat activated!' : `✓ ${card.name}`, 'success');
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
        showMessage(`✗ ${card.name} doesn't match`, 'error');
        
        const isGameOver = newGuesses >= 9;
        if (isGameOver) {
          const perf = getPerformanceRating(prev.score);
          showMessage(`${perf.emoji} ${perf.rating}! Score: ${prev.score}/9`, 'info', true);
        }
        
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
  }, [gameState, guessInput, showMessage, game, gameId, submitting, cardPreview]);

  // Load community stats when game ends
  useEffect(() => {
    if (gameState.gameOver && !gameState.statsRecorded) {
      // Mark stats as recorded
      setGameState(prev => ({ ...prev, statsRecorded: true }));
      
      // Load community stats with delay
      const timer = setTimeout(() => {
        getAllStats(gameId).then(setStats);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver, gameState.statsRecorded, gameId]);

  const getShareText = useCallback(() => {
    const perf = getPerformanceRating(gameState.score);
    const emojis = gameState.board.map((cell) => cell ? '🟩' : '⬛');
    const grid = [
      emojis.slice(0, 3).join(''),
      emojis.slice(3, 6).join(''),
      emojis.slice(6, 9).join(''),
    ].join('\n');
    
    return `${game.config.shortName} ${getFormattedDate()}\n${perf.emoji} ${gameState.score}/9\n\n${grid}\n\nPlay at tcgdoku.netlify.app`;
  }, [gameState, game.config.shortName]);

  const shareResults = useCallback(() => {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      showMessage('Copied to clipboard!', 'success');
    });
  }, [getShareText, showMessage]);

  // Get top answers for a cell
  const getTopAnswers = (cellIndex) => {
    if (!stats) return [];
    const cellData = stats[`cell${cellIndex}`];
    if (!cellData?.cards) return [];
    
    const totalCorrect = cellData.correctGuesses || 0;
    if (totalCorrect === 0) return [];
    
    return Object.values(cellData.cards)
      .filter(c => c.correct)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(c => ({
        name: c.name,
        percent: Math.round((c.count / totalCorrect) * 100),
        count: c.count,
        total: totalCorrect,
      }));
  };

  if (loading) {
    return (
      <div className="app">
        <header>
          <Link to="/" className="back-link">← All Games</Link>
          <h1 className={`${gameId}-title`}>{game.config.shortName.toUpperCase()}</h1>
        </header>
        <div className="loading">
          <div className={`spinner ${gameId}`}></div>
          <p>Generating today's puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <Link to="/" className="back-link">← All Games</Link>
        <h1 className={`${gameId}-title`}>{game.config.shortName.toUpperCase()}</h1>
        <p className="date">{getFormattedDate()}</p>
      </header>

      <div className="stats">
        <div className={`stat ${gameId}`}>Guesses: <span>{gameState.guesses}</span>/9</div>
        <div className={`stat ${gameId}`}>Score: <span>{gameState.score}</span>/9</div>
      </div>

      {message && (
        <div className={`message ${message.type} ${gameId}`}>
          {message.text}
        </div>
      )}

      <div className="game-board">
        <div className="corner"></div>
        
        {gameState.colCategories.map((cat, idx) => (
          <div key={`col-${idx}`} className={`header-cell ${cat.colorClass || ''}`}>
            {cat.label}
          </div>
        ))}
        
        {[0, 1, 2].map(row => (
          <React.Fragment key={`row-${row}`}>
            <div className={`header-cell ${gameState.rowCategories[row]?.colorClass || ''}`}>
              {gameState.rowCategories[row]?.label}
            </div>
            
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const card = gameState.board[idx];
              const isSelected = gameState.selectedCell === idx;
              const topAnswers = gameState.gameOver ? getTopAnswers(idx) : [];
              
              return (
                <div
                  key={`cell-${idx}`}
                  className={`cell ${isSelected ? `selected ${gameId}` : ''} ${card ? 'solved' : ''}`}
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
                        <span className="placeholder-icon">🃏</span>
                        <span className="placeholder-name">{card.name}</span>
                      </div>
                      <div className="card-name">{card.name}</div>
                      {gameState.gameOver && topAnswers.length > 0 && (
                        <div className="cell-stats">
                          {topAnswers.map((a, i) => (
                            <div key={i} className="stat-line" title={`${a.count} of ${a.total} players`}>
                              <span className="stat-percent">{a.percent}%</span>
                              <span className="stat-name">{a.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : gameState.gameOver && topAnswers.length > 0 ? (
                    <div className="cell-stats missed">
                      <div className="missed-label">Top Answers:</div>
                      {topAnswers.map((a, i) => (
                        <div key={i} className="stat-line" title={`${a.count} of ${a.total} players`}>
                          <span className="stat-percent">{a.percent}%</span>
                          <span className="stat-name">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className={`input-section ${gameState.selectedCell === null ? 'hidden' : ''}`}>
        <h3 className={gameId}>Enter a card name:</h3>
        {gameState.selectedCell !== null && (
          <p className="criteria-hint">
            Must match: <strong>{gameState.rowCategories[Math.floor(gameState.selectedCell / 3)]?.label}</strong>
            {' + '}
            <strong>{gameState.colCategories[gameState.selectedCell % 3]?.label}</strong>
          </p>
        )}
        {gameId === 'fab' && (
          <p className="color-hint">Tip: Add color for pitch cards (e.g., "Bare Fangs Yellow")</p>
        )}
        <form className="guess-form" onSubmit={(e) => { e.preventDefault(); submitGuess(); }}>
          <input
            ref={inputRef}
            type="text"
            className={`search-input ${gameId} ${cardPreview ? 'valid' : ''}`}
            placeholder="Type card name and press Enter..."
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            disabled={gameState.gameOver || submitting}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button 
            type="submit" 
            className={`btn-primary ${gameId}`}
            disabled={!guessInput.trim() || submitting || (!cardPreview && !['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase()))}
          >
            {submitting ? '...' : 'Submit'}
          </button>
        </form>
        
        {/* Card Preview */}
        {guessInput.length >= 3 && (
          <div className="card-preview-container">
            {['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase()) ? (
              <div className="card-preview found">
                <div className="preview-info">
                  <span className="preview-name">🎮 CHEAT MODE</span>
                  <span className="preview-hint">Press Enter to auto-win this cell</span>
                </div>
              </div>
            ) : lookingUp ? (
              <div className="card-preview loading">Searching...</div>
            ) : cardPreview ? (
              <div className="card-preview found">
                {game.getCardImage(cardPreview) && (
                  <img 
                    src={game.getCardImage(cardPreview)} 
                    alt={cardPreview.name}
                    className="preview-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="preview-info">
                  <span className="preview-name">✓ {cardPreview.name}</span>
                  <span className="preview-hint">Press Enter to submit</span>
                </div>
              </div>
            ) : (
              <div className="card-preview not-found">
                ✗ No card found matching "{guessInput}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Over Panel */}
      {gameState.gameOver && (
        <div className="game-over-panel">
          <div className="result-banner" style={{ borderColor: getPerformanceRating(gameState.score).color }}>
            <span className="result-emoji">{getPerformanceRating(gameState.score).emoji}</span>
            <span className="result-rating">{getPerformanceRating(gameState.score).rating}</span>
            <span className="result-score">{gameState.score}/9</span>
          </div>
          
          {stats && (
            <div className="community-stats">
              <span className="players-today">{stats.totalGuesses || 0} guesses from players today</span>
            </div>
          )}
          
          <div className="share-preview">
            {getShareText()}
          </div>
          
          <button className={`btn-primary ${gameId} share-btn`} onClick={shareResults}>
            Share Results
          </button>
          
          <div className="next-puzzle">
            <span className="next-label">Next puzzle in</span>
            <span className="countdown">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      <div className="rules">
        <h3 className={gameId}>How to Play</h3>
        <p>
          Click a cell and type a card name that matches <strong>both</strong> the 
          row and column criteria. No autocomplete — you need to know your cards! 
          You have 9 guesses to fill all 9 cells. Each card can only be used once. 
          The puzzle changes daily.
        </p>
      </div>
    </div>
  );
}

export default GameBoard;