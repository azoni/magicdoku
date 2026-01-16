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

// Get today's date string for puzzle ID
function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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

// Puzzle generation
async function generatePuzzle(game, seed) {
  const allCategories = game.getAllCategories();
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
  });
  const [message, setMessage] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  
  const inputRef = useRef(null);
  
  const gameId = game.config.id;

  // Initialize game
  useEffect(() => {
    async function initGame() {
      setLoading(true);
      const seed = getDailySeed();
      const puzzle = await generatePuzzle(game, seed);
      
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
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameState.gameOver, gameState.board]);

  const submitGuess = useCallback(async () => {
    if (gameState.selectedCell === null || gameState.gameOver || !guessInput.trim() || submitting) return;
    
    setSubmitting(true);
    const cardName = guessInput.trim();
    
    // Check if card already used
    if (gameState.usedCards.has(cardName.toLowerCase())) {
      showMessage('You already used that card!', 'error');
      setSubmitting(false);
      return;
    }
    
    // Get the card
    const card = await game.getCardByName(cardName);
    
    if (!card) {
      showMessage(`"${cardName}" not found. Check spelling!`, 'error');
      setSubmitting(false);
      return;
    }
    
    const row = Math.floor(gameState.selectedCell / 3);
    const col = gameState.selectedCell % 3;
    const rowCat = gameState.rowCategories[row];
    const colCat = gameState.colCategories[col];
    
    const [matchesRow, matchesCol] = await Promise.all([
      game.cardMatchesCategory(card, rowCat),
      game.cardMatchesCategory(card, colCat),
    ]);
    
    const isCorrect = matchesRow && matchesCol;
    
    // Record guess to Firebase
    await recordGuess(gameId, gameState.selectedCell, card.name, isCorrect);
    
    setGameState(prev => {
      const newGuesses = prev.guesses + 1;
      const newUsedCards = new Set(prev.usedCards);
      
      if (isCorrect) {
        newUsedCards.add(card.name.toLowerCase());
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
    
    setGuessInput('');
    setSubmitting(false);
  }, [gameState, guessInput, showMessage, game, gameId, submitting]);

  // Load stats when game ends
  useEffect(() => {
    if (gameState.gameOver && !stats) {
      getAllStats(gameId).then(setStats);
    }
  }, [gameState.gameOver, stats, gameId]);

  const getShareText = useCallback(() => {
    const emojis = gameState.board.map((cell) => cell ? '🟩' : '⬛');
    const grid = [
      emojis.slice(0, 3).join(''),
      emojis.slice(3, 6).join(''),
      emojis.slice(6, 9).join(''),
    ].join('\n');
    
    return `${game.config.shortName} ${getFormattedDate()}\n${gameState.score}/9 in ${gameState.guesses} guesses\n\n${grid}\n\ntcgdoku.netlify.app/${gameId}`;
  }, [gameState, game.config.shortName, gameId]);

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
        percent: Math.round((c.count / totalCorrect) * 100)
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
                      {game.getCardImage(card) && (
                        <img 
                          className="card-image" 
                          src={game.getCardImage(card)} 
                          alt={card.name}
                        />
                      )}
                      <div className="card-name">{card.name}</div>
                      {gameState.gameOver && topAnswers.length > 0 && (
                        <div className="cell-stats">
                          {topAnswers.map((a, i) => (
                            <div key={i} className="stat-line">
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
                        <div key={i} className="stat-line">
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
        <form className="guess-form" onSubmit={(e) => { e.preventDefault(); submitGuess(); }}>
          <input
            ref={inputRef}
            type="text"
            className={`search-input ${gameId}`}
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
            disabled={!guessInput.trim() || submitting}
          >
            {submitting ? '...' : 'Submit'}
          </button>
        </form>
      </div>

      <div className="buttons">
        {gameState.gameOver && (
          <button className={`btn-primary ${gameId}`} onClick={shareResults}>
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