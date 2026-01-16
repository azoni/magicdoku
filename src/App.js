import React from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import GameBoard from './GameBoard';

// Import game configs
import * as mtg from './games/mtg';
import * as fab from './games/fab';

const games = {
  mtg,
  fab,
};

// Home Page
function Home() {
  return (
    <div className="app">
      <div className="home">
        <h1>TCG<span className="accent">DOKU</span></h1>
        <p className="tagline">Daily card game puzzles</p>
        
        <div className="game-grid">
          <Link to="/mtg" className="game-card mtg">
            <div className="icon">🎴</div>
            <h2>Magic: The Gathering</h2>
            <p>Match cards by color, type, mana value, and more</p>
          </Link>
          
          <Link to="/fab" className="game-card fab">
            <div className="icon">⚔️</div>
            <h2>Flesh and Blood</h2>
            <p>Match cards by class, pitch, cost, and more</p>
          </Link>
        </div>
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
      <Route path="/:gameId" element={<GamePage />} />
    </Routes>
  );
}

export default App;
