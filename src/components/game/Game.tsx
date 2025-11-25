// src/components/game/Game.tsx

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useGameEngine } from '@/hooks/useGameEngine';
import GameCanvas from './GameCanvas';
import GameOverlay from './GameOverlay';
import GameHUD from './GameHUD';
import GameControls from './GameControls';
import TacticalAdvisor from './TacticalAdvisor';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { soundManager } from '@/lib/sounds/SoundManager';
import { ScoreNotification } from './ScoreNotification';

/**
 * Main game container component
 */
const Game: React.FC = () => {
  const {
    status,
    score,
    highScore,
    wave,
    lives,
    isSoundEnabled,
    setStatus,
    toggleSound,
    resetGame: resetStore,
  } = useGameStore();

  const {
    entities,
    entitiesVersion,
    notifications,
    particleSystem,
    starfield,
    screenShake,
    crtEffect,
    movePlayer,
    shoot,
    resetGame: resetEngine,
  } = useGameEngine();

  const [showHelp, setShowHelp] = useState(false);

  // Sync sound manager with store
  useEffect(() => {
    soundManager.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  const handleRestart = () => {
    resetStore();
    resetEngine(true);
  };

  const handleStart = () => {
    resetStore();
    resetEngine(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Game Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 mb-4 pixel-font tracking-wider animate-pulse">
        SPACE INVADERS
      </h1>

      {/* HUD */}
      <GameHUD
        score={score}
        highScore={highScore}
        wave={wave}
        lives={lives}
      />

      {/* Game Container */}
      <div className="relative">
        <GameCanvas
          entities={entities}
          particleSystem={particleSystem}
          starfield={starfield}
          screenShake={screenShake}
          crtEffect={crtEffect}
          version={entitiesVersion}
          className="border-2 border-cyan-500/30"
        />

        {/* Game Overlay */}
        <GameOverlay
          gameState={status}
          score={score}
          highScore={highScore}
          wave={wave}
          onStart={handleStart}
          onRestart={handleRestart}
          onResume={() => setStatus('PLAYING')}
        />

        {/* Score Notifications */}
        {notifications.map((notification) => (
          <ScoreNotification
            key={notification.id}
            score={notification.score}
            position={notification.position}
          />
        ))}

        {/* Tactical Advisor */}
        <TacticalAdvisor
          score={score}
          wave={wave}
          lives={lives}
          gameStatus={status}
        />
      </div>

      {/* Game Controls */}
      <GameControls
        gameState={status}
        onPause={() => setStatus('PAUSED')}
        onResume={() => setStatus('PLAYING')}
        onRestart={handleRestart}
        onToggleSound={toggleSound}
        onShowHelp={() => setShowHelp(true)}
        onMoveLeft={(isMoving) => movePlayer('left', isMoving)}
        onMoveRight={(isMoving) => movePlayer('right', isMoving)}
        onShoot={shoot}
        isSoundEnabled={isSoundEnabled}
      />

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-sm">
          <DialogTitle className="text-2xl text-cyan-400 pixel-font text-center">
            HOW TO PLAY
          </DialogTitle>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-cyan-300 pixel-font">MOVE</div>
              <div className="text-slate-300">← → or A/D</div>
              <div className="text-cyan-300 pixel-font">FIRE</div>
              <div className="text-slate-300">SPACE</div>
              <div className="text-cyan-300 pixel-font">PAUSE</div>
              <div className="text-slate-300">P</div>
              <div className="text-cyan-300 pixel-font">RESTART</div>
              <div className="text-slate-300">R</div>
            </div>
            
            <div className="border-t border-cyan-500/30 pt-4">
              <h4 className="text-cyan-400 pixel-font mb-2 text-sm">SCORING</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-pink-400">●</span>
                  <span className="text-slate-300">Top Row: 30 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">●</span>
                  <span className="text-slate-300">Mid Row: 20 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">●</span>
                  <span className="text-slate-300">Bot Row: 10 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-fuchsia-400">●</span>
                  <span className="text-slate-300">UFO: 50-300 pts</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
