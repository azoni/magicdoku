import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';

import * as mtgGame from './games/mtg';
import * as fabGame from './games/fab';
import * as gymGame from './games/gymnastics';

const GAMES = {
  mtg: mtgGame,
  fab: fabGame,
  gymnastics: gymGame,
};

// Record a guess to Firebase
async function recordGuess(puzzleId, cellIndex, cardName, isCorrect) {
  const dateStr = new Date().toISOString().split('T')[0];
  const docId = `custom-${puzzleId}-${dateStr}`;
  
  try {
    const docRef = doc(db, 'guesses', docId);
    const docSnap = await getDoc(docRef);
    const cardKey = cardName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (docSnap.exists()) {
      const updates = {
        totalGuesses: increment(1),
        [`cell${cellIndex}.totalGuesses`]: increment(1),
        [`cell${cellIndex}.cards.${cardKey}.name`]: cardName,
        [`cell${cellIndex}.cards.${cardKey}.count`]: increment(1),
      };
      if (isCorrect) {
        updates[`cell${cellIndex}.correctGuesses`] = increment(1);
        updates[`cell${cellIndex}.cards.${cardKey}.correct`] = true;
      }
      await updateDoc(docRef, updates);
    } else {
      const newDoc = { puzzleId, date: dateStr, totalGuesses: 1 };
      for (let i = 0; i < 9; i++) {
        newDoc[`cell${i}`] = { totalGuesses: 0, correctGuesses: 0, cards: {} };
      }
      newDoc[`cell${cellIndex}`] = {
        totalGuesses: 1,
        correctGuesses: isCorrect ? 1 : 0,
        cards: { [cardKey]: { name: cardName, count: 1, correct: isCorrect } }
      };
      await setDoc(docRef, newDoc);
    }
  } catch (error) {
    console.error('Error recording guess:', error);
  }
}

export default function CustomPuzzle() {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [game, setGame] = useState(null);
  
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    guesses: 0,
    score: 0,
    selectedCell: null,
    gameOver: false,
    usedCards: new Set(),
  });
  
  const [message, setMessage] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cardPreview, setCardPreview] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  
  const inputRef = useRef(null);
  const lookupTimeout = useRef(null);

  // Load puzzle from Firebase
  useEffect(() => {
    async function loadPuzzle() {
      try {
        const docRef = doc(db, 'customPuzzles', puzzleId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError('Puzzle not found');
          setLoading(false);
          return;
        }
        
        const puzzleData = { id: docSnap.id, ...docSnap.data() };
        setPuzzle(puzzleData);
        setGame(GAMES[puzzleData.gameId]);
        
        // Increment play count
        try {
          await updateDoc(docRef, { plays: increment(1) });
        } catch (e) {
          // Ignore if we can't update plays
        }
        
        // Check localStorage for saved progress
        const savedKey = `tcgdoku-custom-${puzzleId}`;
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          try {
            const savedState = JSON.parse(saved);
            savedState.usedCards = new Set(savedState.usedCards || []);
            setGameState(savedState);
          } catch (e) {
            console.error('Error loading saved state:', e);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading puzzle:', err);
        setError('Failed to load puzzle');
        setLoading(false);
      }
    }
    
    loadPuzzle();
  }, [puzzleId]);

  // Save game state to localStorage
  useEffect(() => {
    if (!puzzle || loading) return;
    const savedKey = `tcgdoku-custom-${puzzleId}`;
    const toSave = { ...gameState, usedCards: Array.from(gameState.usedCards) };
    localStorage.setItem(savedKey, JSON.stringify(toSave));
  }, [gameState, puzzle, puzzleId, loading]);

  const showMessage = useCallback((text, type = 'info', persist = false) => {
    setMessage({ text, type });
    if (!persist) setTimeout(() => setMessage(null), 3000);
  }, []);

  const selectCell = useCallback((idx) => {
    if (gameState.gameOver || gameState.board[idx] !== null) return;
    setGameState(prev => ({ ...prev, selectedCell: idx }));
    setGuessInput('');
    setCardPreview(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [gameState.gameOver, gameState.board]);

  // Lookup card as user types
  useEffect(() => {
    if (lookupTimeout.current) clearTimeout(lookupTimeout.current);
    if (!guessInput.trim() || guessInput.length < 3 || !game) {
      setCardPreview(null);
      return;
    }
    
    setLookingUp(true);
    lookupTimeout.current = setTimeout(async () => {
      const card = await game.getCardByName(guessInput.trim());
      setCardPreview(card);
      setLookingUp(false);
    }, 300);
    
    return () => { if (lookupTimeout.current) clearTimeout(lookupTimeout.current); };
  }, [guessInput, game]);

  // Attach filter functions to categories from game
  const getCategory = useCallback((cat) => {
    if (!game || !cat) return cat;
    const allCats = Object.values(game.CATEGORIES || {}).flat();
    const match = allCats.find(c => c.id === cat.id);
    if (match) return { ...cat, filter: match.filter, query: match.query || cat.query };
    return cat;
  }, [game]);

  const submitGuess = useCallback(async () => {
    if (gameState.selectedCell === null || gameState.gameOver || !guessInput.trim() || submitting || !game) return;
    
    const cheatInput = guessInput.trim().toLowerCase();
    const isCheat = ['thisansweriscorrect', 'cheat', 'win'].includes(cheatInput);
    
    if (!cardPreview && !isCheat) {
      showMessage('Card not found. Check spelling!', 'error');
      return;
    }
    
    setSubmitting(true);
    const card = isCheat ? { name: `✓ Cell ${gameState.selectedCell + 1}` } : cardPreview;
    
    let isCorrect = isCheat;
    if (!isCheat) {
      const row = Math.floor(gameState.selectedCell / 3);
      const col = gameState.selectedCell % 3;
      const rowCat = getCategory(puzzle.rowCategories[row]);
      const colCat = getCategory(puzzle.colCategories[col]);
      
      const [matchesRow, matchesCol] = await Promise.all([
        game.cardMatchesCategory(card, rowCat),
        game.cardMatchesCategory(card, colCat),
      ]);
      isCorrect = matchesRow && matchesCol;
    }
    
    if (!isCheat) await recordGuess(puzzleId, gameState.selectedCell, card.name, isCorrect);
    
    setGameState(prev => {
      const newGuesses = prev.guesses + 1;
      const newUsedCards = new Set(prev.usedCards);
      
      if (isCorrect) {
        newUsedCards.add(card.name.toLowerCase());
        const newBoard = [...prev.board];
        newBoard[prev.selectedCell] = card;
        const newScore = prev.score + 1;
        const isWin = newScore === 9;
        
        if (isWin) showMessage(`🎉 Perfect! Completed in ${newGuesses} guesses!`, 'win', true);
        else showMessage(isCheat ? '🎮 Cheat activated!' : `Correct! ${card.name}`, 'success');
        
        return {
          ...prev, board: newBoard, guesses: newGuesses, score: newScore,
          selectedCell: null, usedCards: newUsedCards, gameOver: isWin || newGuesses >= 9,
        };
      } else {
        showMessage(`Wrong! ${card.name} - Doesn't match criteria`, 'error');
        const isGameOver = newGuesses >= 9;
        if (isGameOver) showMessage(`Game Over! Score: ${prev.score}/9`, 'error', true);
        return { ...prev, guesses: newGuesses, gameOver: isGameOver, selectedCell: isGameOver ? null : prev.selectedCell };
      }
    });
    
    setGuessInput('');
    setCardPreview(null);
    setSubmitting(false);
  }, [gameState, guessInput, showMessage, game, puzzleId, submitting, cardPreview, puzzle, getCategory]);

  const getShareText = useCallback(() => {
    if (!puzzle) return '';
    const emojis = gameState.board.map(card => card ? '🟩' : '⬛');
    const grid = [emojis.slice(0, 3).join(''), emojis.slice(3, 6).join(''), emojis.slice(6, 9).join('')].join('\n');
    return `${puzzle.name} (${game?.config?.shortName})\n${gameState.score}/9 in ${gameState.guesses} guesses\n\n${grid}\n\ntcgdoku.netlify.app/puzzle/${puzzleId}`;
  }, [gameState, puzzle, game, puzzleId]);

  const shareResults = useCallback(() => {
    navigator.clipboard.writeText(getShareText()).then(() => showMessage('Copied to clipboard!', 'success'));
  }, [getShareText, showMessage]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading"><div className="spinner"></div><p>Loading puzzle...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-page">
          <h1>😕 {error}</h1>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const gameId = puzzle.gameId;

  return (
    <div className="app">
      <header>
        <Link to="/" className="back-link">← All Games</Link>
        <h1 className={`${gameId}-title`}>{puzzle.name}</h1>
        <p className="puzzle-meta">
          by {puzzle.creatorName} • {game?.config?.emoji} {game?.config?.name}
          {puzzle.plays > 0 && ` • ${puzzle.plays} plays`}
        </p>
      </header>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="stats">
        <div className={`stat ${gameId}`}>Score: {gameState.score}/9</div>
        <div className="stat">Guesses: {gameState.guesses}/9</div>
      </div>

      {/* Game Board */}
      <div className="game-board">
        <div className="header-cell corner"></div>
        {puzzle.colCategories.map((cat, idx) => (
          <div key={`col-${idx}`} className={`header-cell col ${cat.colorClass || ''}`}>
            {cat.label}
          </div>
        ))}
        
        {puzzle.rowCategories.map((rowCat, row) => (
          <React.Fragment key={`row-${row}`}>
            <div className={`header-cell row ${rowCat.colorClass || ''}`}>{rowCat.label}</div>
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              const card = gameState.board[idx];
              const isSelected = gameState.selectedCell === idx;
              
              return (
                <div
                  key={`cell-${idx}`}
                  className={`cell ${isSelected ? `selected ${gameId}` : ''} ${card ? 'solved' : ''}`}
                  onClick={() => selectCell(idx)}
                >
                  {card ? (
                    <>
                      {game?.getCardImage(card) ? (
                        <img className="card-image" src={game.getCardImage(card)} alt={card.name}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className="card-placeholder" style={{ display: game?.getCardImage(card) ? 'none' : 'flex' }}>
                        <span className="placeholder-icon">🃏</span>
                        <span className="placeholder-name">{card.name}</span>
                      </div>
                      <div className="card-name">{card.name}</div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Input Section */}
      <div className={`input-section ${gameState.selectedCell === null ? 'hidden' : ''}`}>
        <h3 className={gameId}>Enter a card name:</h3>
        {gameState.selectedCell !== null && (
          <p className="criteria-hint">
            Must match: <strong>{puzzle.rowCategories[Math.floor(gameState.selectedCell / 3)]?.label}</strong>
            {' + '}<strong>{puzzle.colCategories[gameState.selectedCell % 3]?.label}</strong>
          </p>
        )}
        {gameId === 'fab' && <p className="color-hint">Tip: Add color for pitch cards (e.g., "Bare Fangs Yellow")</p>}
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
          />
          <button type="submit" className={`btn-primary ${gameId}`}
            disabled={!guessInput.trim() || submitting || (!cardPreview && !['thisansweriscorrect', 'cheat', 'win'].includes(guessInput.trim().toLowerCase()))}>
            {submitting ? '...' : 'Submit'}
          </button>
        </form>
        
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
                {game?.getCardImage(cardPreview) && (
                  <img src={game.getCardImage(cardPreview)} alt={cardPreview.name} className="preview-image"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div className="preview-info">
                  <span className="preview-name">✓ {cardPreview.name}</span>
                  <span className="preview-hint">Press Enter to submit</span>
                </div>
              </div>
            ) : (
              <div className="card-preview not-found">✗ No card found matching "{guessInput}"</div>
            )}
          </div>
        )}
      </div>

      {/* Game Over Actions */}
      {gameState.gameOver && (
        <div className="game-over-actions">
          <button className={`btn-primary ${gameId}`} onClick={shareResults}>Share Results</button>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      )}
    </div>
  );
}
