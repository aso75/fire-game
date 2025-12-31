
import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import UIOverlay from './components/UIOverlay';
import { GameState, Lore } from './types';
import { fetchSectorLore } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  // Fix: Added missing 'isBossLevel' property to satisfy the Lore interface
  const [lore, setLore] = useState<Lore>({ 
    title: 'Nebula Strike', 
    description: 'Prepare for deployment.',
    isBossLevel: false
  });
  const [isLoadingLore, setIsLoadingLore] = useState(false);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setLevel(1);
    updateLore(1);
  };

  const updateLore = async (lvl: number) => {
    setIsLoadingLore(true);
    const newLore = await fetchSectorLore(lvl);
    setLore(newLore);
    setIsLoadingLore(false);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAMEOVER);
  };

  const handleLevelUp = (newLvl: number) => {
    setLevel(newLvl);
    updateLore(newLvl);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans text-white">
      {/* Game Canvas */}
      <Game 
        gameState={gameState} 
        onGameOver={handleGameOver} 
        onLevelUp={handleLevelUp}
        onScoreUpdate={setScore}
      />

      {/* UI Overlay (Menus, HUD) */}
      <UIOverlay 
        gameState={gameState} 
        score={score} 
        level={level}
        lore={lore}
        isLoadingLore={isLoadingLore}
        onStart={startGame} 
      />

      {/* Mobile Controls Hint */}
      {gameState === GameState.PLAYING && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-50 animate-pulse text-xs">
          DRAG TO MOVE • AUTOMATIC FIRE
        </div>
      )}
    </div>
  );
};

export default App;
