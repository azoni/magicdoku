import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import GameBoard from './GameBoard';
import { AdminHome, CategoryEditor } from './Admin';
import PuzzleCreator from './PuzzleCreator';
import CustomPuzzle from './CustomPuzzle';
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

// Import game configs
import * as mtg from './games/mtg';
import * as fab from './games/fab';
import * as gymnastics from './games/gymnastics';

const games = {
  mtg,
  fab,
  gymnastics,
};

// Home Page
function Home() {
  const [communityPuzzles, setCommunityPuzzles] = useState([]);
  const [loadingPuzzles, setLoadingPuzzles] = useState(true);
  const [gameImages, setGameImages] = useState({ mtg: '', fab: '', gymnastics: '' });

  useEffect(() => {
    async function loadData() {
      try {
        // Load community puzzles
        const puzzlesRef = collection(db, 'customPuzzles');
        const q = query(puzzlesRef, orderBy('createdAt', 'desc'), limit(6));
        const snapshot = await getDocs(q);
        
        const puzzles = [];
        snapshot.forEach(doc => {
          puzzles.push({ id: doc.id, ...doc.data() });
        });
        setCommunityPuzzles(puzzles);
        
        // Load game images
        const settingsRef = doc(db, 'settings', 'gameImages');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const images = settingsSnap.data();
          setGameImages({ 
            mtg: images.mtg || '', 
            fab: images.fab || '',
            gymnastics: images.gymnastics || '',
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoadingPuzzles(false);
    }
    
    loadData();
  }, []);

  return (
    <div className="app">
      <div className="home">
        <h1>TCG<span className="accent">DOKU</span></h1>
        <p className="tagline">Daily puzzle games</p>
        
        {/* Daily Puzzles */}
        <h2 className="section-title">Daily Puzzles</h2>
        <div className="game-grid">
          <Link to="/mtg" className="game-card mtg">
            {gameImages.mtg && (
              <div className="game-card-image">
                <img src={gameImages.mtg} alt="Magic: The Gathering" />
              </div>
            )}
            <div className="game-card-content">
              <h2>Magic: The Gathering</h2>
              <p>Match cards by color, type, mana value, and more</p>
            </div>
          </Link>
          
          <Link to="/fab" className="game-card fab">
            {gameImages.fab && (
              <div className="game-card-image">
                <img src={gameImages.fab} alt="Flesh and Blood" />
              </div>
            )}
            <div className="game-card-content">
              <h2>Flesh and Blood</h2>
              <p>Match cards by class, pitch, cost, and more</p>
            </div>
          </Link>
          
          <Link to="/gymnastics" className="game-card gymnastics">
            {gameImages.gymnastics && (
              <div className="game-card-image">
                <img src={gameImages.gymnastics} alt="Gymnastics" />
              </div>
            )}
            <div className="game-card-content">
              <h2>Gymnastics</h2>
              <p>Match skills by apparatus, difficulty, and type</p>
            </div>
          </Link>
        </div>

        {/* Create Your Own */}
        <div className="create-section">
          <Link to="/create" className="create-button">
            Create Your Own Puzzle
          </Link>
        </div>

        {/* Community Puzzles */}
        <h2 className="section-title">Community Puzzles</h2>
        {loadingPuzzles ? (
          <div className="loading-small">Loading puzzles...</div>
        ) : communityPuzzles.length > 0 ? (
          <div className="community-grid">
            {communityPuzzles.map(puzzle => (
              <Link 
                key={puzzle.id} 
                to={`/puzzle/${puzzle.id}`} 
                className={`community-card ${puzzle.gameId}`}
              >
                <div className="community-header">
                  <span className="community-game">
                    {puzzle.gameId === 'mtg' ? 'MTG' : puzzle.gameId === 'fab' ? 'FAB' : 'GYM'}
                  </span>
                </div>
                <h3>{puzzle.name}</h3>
                <p className="community-meta">
                  by {puzzle.creatorName || 'Anonymous'}
                  {puzzle.plays > 0 && ` • ${puzzle.plays} plays`}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="no-puzzles">No community puzzles yet. Be the first to create one!</p>
        )}
        
        <Link to="/admin" className="admin-link">Admin Panel</Link>
      </div>
    </div>
  );
}

// Game Page Wrapper
function GamePage() {
  const { gameId } = useParams();
  const game = games[gameId];
  
  if (!game) {
    return (
      <div className="app">
        <div className="home">
          <h1>Game not found</h1>
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    );
  }
  
  return <GameBoard game={game} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<PuzzleCreator />} />
      <Route path="/puzzle/:puzzleId" element={<CustomPuzzle />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/:gameId" element={<CategoryEditor />} />
      <Route path="/:gameId" element={<GamePage />} />
    </Routes>
  );
}

export default App;
