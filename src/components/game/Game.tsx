// src/components/game/Game.tsx
import React, { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import { useGameEngine } from "@/hooks/useGameEngine";
import GameCanvas from "./GameCanvas";
import GameOverlay, { ScoreNotification } from "./GameOverlay";
import GameControls from "./GameControls";
import TacticalAdvisor from "./TacticalAdvisor";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { soundManager } from "@/lib/sounds/SoundManager";

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
    movePlayer,
    shoot,
    resetGame: resetEngine,
  } = useGameEngine();

  const [showHelp, setShowHelp] = useState(false);

  // Sync sound manager
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative">
        <GameCanvas
          entities={entities}
          version={entitiesVersion}
          className="border border-green-500"
        />

        <GameOverlay
          gameState={status}
          score={score}
          highScore={highScore}
          wave={wave}
          onStart={handleStart}
          onRestart={handleRestart}
          onResume={() => setStatus('PLAYING')}
        />

        {notifications.map((notification) => (
          <ScoreNotification
            key={notification.id}
            score={notification.score}
            position={notification.position}
          />
        ))}
        
        <TacticalAdvisor 
          score={score} 
          wave={wave} 
          lives={lives} 
          gameStatus={status} 
        />
      </div>

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
        score={score}
        highScore={highScore}
        lives={lives}
      />

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogTitle className="text-2xl text-green-500 pixel-font">
            HOW TO PLAY
          </DialogTitle>
          <div className="p-4 text-green-500 pixel-font">
            <ul className="space-y-2">
              <li>Use ←/→ or A/D to move</li>
              <li>SPACE to shoot</li>
              <li>P to pause</li>
              <li>ESC to close this help</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
