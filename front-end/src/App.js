import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomCode" element={<Game />} />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;