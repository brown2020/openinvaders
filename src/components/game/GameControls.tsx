// src/components/game/GameControls.tsx

import React, { useCallback, useEffect, useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { GAME_STATES } from '@/lib/constants/game';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

interface GameControlsProps {
  gameState: keyof typeof GAME_STATES;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  onShowHelp: () => void;
  onMoveLeft: (isMoving: boolean) => void;
  onMoveRight: (isMoving: boolean) => void;
  onShoot: () => void;
  isSoundEnabled: boolean;
}

const GameControls = memo<GameControlsProps>(({
  gameState,
  onPause,
  onResume,
  onRestart,
  onToggleSound,
  onShowHelp,
  onMoveLeft,
  onMoveRight,
  onShoot,
  isSoundEnabled,
}) => {
  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isPaused = gameState === GAME_STATES.PAUSED;
  const isMenu = gameState === GAME_STATES.MENU;
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          onMoveLeft(true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          onMoveRight(true);
          break;
        case ' ':
          event.preventDefault();
          if (isPlaying) {
            onShoot();
          } else if (isMenu || isPaused || gameState === GAME_STATES.GAME_OVER) {
            // Space starts/restarts/resumes game
            if (isMenu) {
              onRestart();
            } else if (isPaused) {
              onResume();
            } else {
              onRestart();
            }
          }
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          if (isPlaying) {
            onPause();
          } else if (isPaused) {
            onResume();
          }
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          onRestart();
          break;
        case 'Escape':
          event.preventDefault();
          if (isPlaying) {
            onPause();
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          onMoveLeft(false);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          onMoveRight(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused, isMenu, gameState, onMoveLeft, onMoveRight, onShoot, onPause, onResume, onRestart]);

  // Touch handlers
  const handleTouchStart = useCallback(
    (action: 'left' | 'right' | 'shoot') => {
      if (!isPlaying) return;
      switch (action) {
        case 'left':
          onMoveLeft(true);
          break;
        case 'right':
          onMoveRight(true);
          break;
        case 'shoot':
          onShoot();
          break;
      }
    },
    [isPlaying, onMoveLeft, onMoveRight, onShoot]
  );

  const handleTouchEnd = useCallback(
    (action: 'left' | 'right') => {
      switch (action) {
        case 'left':
          onMoveLeft(false);
          break;
        case 'right':
          onMoveRight(false);
          break;
      }
    },
    [onMoveLeft, onMoveRight]
  );

  return (
    <div className="w-full max-w-[800px] mt-3">
      {/* Control buttons */}
      <div className="flex justify-between items-center gap-2 mb-3 px-2">
        <div className="flex gap-2">
          {/* Pause/Resume */}
          {(isPlaying || isPaused) && (
            <Button
              variant="outline"
              size="icon"
              onClick={isPaused ? onResume : onPause}
              className="w-10 h-10 bg-slate-900/60 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
            >
              {isPaused ? (
                <Play className="h-4 w-4 text-cyan-400" />
              ) : (
                <Pause className="h-4 w-4 text-cyan-400" />
              )}
            </Button>
          )}

          {/* Restart */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRestart}
            className="w-10 h-10 bg-slate-900/60 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
          >
            <RotateCcw className="h-4 w-4 text-cyan-400" />
          </Button>

          {/* Sound toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSound}
            className="w-10 h-10 bg-slate-900/60 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4 text-cyan-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        </div>

        {/* Help button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onShowHelp}
          className="w-10 h-10 bg-slate-900/60 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
        >
          <HelpCircle className="h-4 w-4 text-cyan-400" />
        </Button>
      </div>

      {/* Mobile touch controls */}
      {isTouchDevice && isPlaying && (
        <div className="grid grid-cols-3 gap-3 px-2">
          <Button
            variant="outline"
            className="h-16 bg-slate-900/80 border-cyan-500/30 hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-all"
            onTouchStart={() => handleTouchStart('left')}
            onTouchEnd={() => handleTouchEnd('left')}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronLeft className="w-8 h-8 text-cyan-400" />
          </Button>

          <Button
            variant="outline"
            className="h-16 bg-gradient-to-b from-red-900/80 to-red-950/80 border-red-500/30 hover:bg-red-500/20 active:bg-red-500/40 transition-all"
            onTouchStart={() => handleTouchStart('shoot')}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Crosshair className="w-8 h-8 text-red-400" />
          </Button>

          <Button
            variant="outline"
            className="h-16 bg-slate-900/80 border-cyan-500/30 hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-all"
            onTouchStart={() => handleTouchStart('right')}
            onTouchEnd={() => handleTouchEnd('right')}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronRight className="w-8 h-8 text-cyan-400" />
          </Button>
        </div>
      )}

      {/* Desktop controls hint */}
      {!isTouchDevice && (
        <div className="text-center text-xs text-cyan-500/50 pixel-font px-2">
          ← → MOVE • SPACE FIRE • P PAUSE • R RESTART
        </div>
      )}
    </div>
  );
});

GameControls.displayName = 'GameControls';

export default GameControls;
