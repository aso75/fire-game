
import React from 'react';
import { GameState, Lore } from '../types';
import { audio } from '../services/audio';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  level: number;
  lore: Lore;
  isLoadingLore: boolean;
  onStart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, score, level, lore, isLoadingLore, onStart }) => {
  const handleStart = () => {
    // Initializing audio on user interaction
    audio.playLevelUp();
    onStart();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* HUD Header */}
      <div className="flex justify-between items-start pt-safe">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-3 w-32 shadow-xl">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Score</div>
          <div className="text-xl font-bold font-mono text-sky-400">{score.toLocaleString()}</div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-3 w-32 shadow-xl text-right">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Sector</div>
          <div className={`text-xl font-bold font-mono ${lore.isBossLevel ? 'text-pink-500 animate-pulse' : 'text-amber-400'}`}>
            {level}
          </div>
        </div>
      </div>

      {/* Sector Lore Banner */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-sm text-center">
          <div className={`transition-all duration-1000 ${isLoadingLore ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
            {lore.isBossLevel && (
              <div className="mb-2 text-red-500 font-black tracking-[0.5em] text-lg animate-pulse">
                WARNING: ELITE UNIT
              </div>
            )}
            <h2 className={`text-sm font-black uppercase tracking-[0.3em] drop-shadow-md ${lore.isBossLevel ? 'text-pink-400' : 'text-sky-300'}`}>
              {lore.title}
            </h2>
            <p className="text-[10px] text-slate-400 italic mt-1 px-8 leading-tight">
              {lore.description}
            </p>
          </div>
        </div>
      )}

      {/* Menus */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6">
          <div className="max-w-sm w-full space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 drop-shadow-2xl">
                NEBULA STRIKE
              </h1>
              <p className="text-slate-400 text-sm tracking-widest uppercase">AI-Driven Tactical Combat</p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="text-slate-300 text-xs leading-relaxed italic">
                "{lore.description}"
              </div>
              <button 
                onClick={handleStart}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all uppercase tracking-widest"
              >
                Launch Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-red-950/40 backdrop-blur-md px-6">
          <div className="max-w-sm w-full space-y-6 text-center">
            <h2 className="text-6xl font-black text-red-500 drop-shadow-lg">WASTED</h2>
            <div className="space-y-1">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Final Tally</p>
              <p className="text-4xl font-mono font-bold text-white">{score.toLocaleString()}</p>
            </div>
            <button 
              onClick={handleStart}
              className="w-full py-4 bg-white text-slate-950 font-bold rounded-xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            >
              Request Reinforcements
            </button>
          </div>
        </div>
      )}

      {/* Decorative corners */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 m-2 rounded-tl-lg transition-colors ${lore.isBossLevel ? 'border-pink-500' : 'border-sky-500/30'}`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 m-2 rounded-tr-lg transition-colors ${lore.isBossLevel ? 'border-pink-500' : 'border-sky-500/30'}`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 m-2 rounded-bl-lg transition-colors ${lore.isBossLevel ? 'border-pink-500' : 'border-sky-500/30'}`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 m-2 rounded-br-lg transition-colors ${lore.isBossLevel ? 'border-pink-500' : 'border-sky-500/30'}`} />
    </div>
  );
};

export default UIOverlay;
