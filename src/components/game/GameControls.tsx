// src/components/game/GameControls.tsx
import React, { useCallback, useEffect, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { GAME_STATES } from "@/lib/constants/game";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

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
  score: number;
  highScore: number;
  lives: number;
}

const GameControls = memo<GameControlsProps>(
  ({
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
    score,
    highScore,
    lives,
  }) => {
    const isPlaying = gameState === GAME_STATES.PLAYING;
    const isPaused = gameState === GAME_STATES.PAUSED;
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
      setIsTouchDevice("ontouchstart" in window);
    }, []);

    // Keyboard controls
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat) return; // Prevent key repeat

        switch (event.key) {
          case "ArrowLeft":
          case "a":
            event.preventDefault();
            onMoveLeft(true);
            break;
          case "ArrowRight":
          case "d":
            event.preventDefault();
            onMoveRight(true);
            break;
          case " ":
            event.preventDefault();
            if (isPlaying) {
              onShoot();
            }
            break;
          case "p":
            event.preventDefault();
            if (isPlaying) {
              onPause();
            } else if (isPaused) {
              onResume();
            }
            break;
          case "r":
            event.preventDefault();
            onRestart();
            break;
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        switch (event.key) {
          case "ArrowLeft":
          case "a":
            event.preventDefault();
            onMoveLeft(false);
            break;
          case "ArrowRight":
          case "d":
            event.preventDefault();
            onMoveRight(false);
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [
      isPlaying,
      isPaused,
      onMoveLeft,
      onMoveRight,
      onShoot,
      onPause,
      onResume,
      onRestart,
    ]);

    // Touch/mouse controls
    const handleTouchStart = useCallback(
      (action: "left" | "right" | "shoot") => {
        if (!isPlaying) return;

        switch (action) {
          case "left":
            onMoveLeft(true);
            break;
          case "right":
            onMoveRight(true);
            break;
          case "shoot":
            onShoot();
            break;
        }
      },
      [isPlaying, onMoveLeft, onMoveRight, onShoot]
    );

    const handleTouchEnd = useCallback(
      (action: "left" | "right") => {
        switch (action) {
          case "left":
            onMoveLeft(false);
            break;
          case "right":
            onMoveRight(false);
            break;
        }
      },
      [onMoveLeft, onMoveRight]
    );

    return (
      <div className="w-full max-w-3xl">
        {/* Score Display */}
        <div className="mb-4 p-4 border border-green-500 rounded-lg bg-black/50">
          <div className="grid grid-cols-3 gap-4 text-green-500 pixel-font text-sm md:text-base">
            <div className="text-left">SCORE: {score}</div>
            <div className="text-center">HIGH: {highScore}</div>
            <div className="text-right">LIVES: {lives}</div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex gap-2">
            {/* Pause/Resume Button */}
            {(isPlaying || isPaused) && (
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className="w-10 h-10 border-green-500 hover:bg-green-500/20"
              >
                {isPaused ? (
                  <Play className="h-4 w-4 text-green-500" />
                ) : (
                  <Pause className="h-4 w-4 text-green-500" />
                )}
              </Button>
            )}

            {/* Restart Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onRestart}
              className="w-10 h-10 border-green-500 hover:bg-green-500/20"
            >
              <RotateCcw className="h-4 w-4 text-green-500" />
            </Button>

            {/* Sound Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSound}
              className="w-10 h-10 border-green-500 hover:bg-green-500/20"
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-green-500" />
              )}
            </Button>
          </div>

          {/* Help Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onShowHelp}
            className="w-10 h-10 border-green-500 hover:bg-green-500/20"
          >
            <HelpCircle className="h-4 w-4 text-green-500" />
          </Button>
        </div>

        {/* Mobile Touch Controls */}
        {isTouchDevice && isPlaying && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Left Button */}
            <Button
              variant="outline"
              className="h-16 border-green-500 hover:bg-green-500/20 pixel-font active:bg-green-500/40"
              onTouchStart={() => handleTouchStart("left")}
              onTouchEnd={() => handleTouchEnd("left")}
              onMouseDown={() => handleTouchStart("left")}
              onMouseUp={() => handleTouchEnd("left")}
              onMouseLeave={() => handleTouchEnd("left")}
              onContextMenu={(e) => e.preventDefault()}
            >
              ←
            </Button>

            {/* Fire Button */}
            <Button
              variant="outline"
              className="h-16 border-green-500 hover:bg-green-500/20 pixel-font active:bg-green-500/40"
              onTouchStart={() => handleTouchStart("shoot")}
              onMouseDown={() => handleTouchStart("shoot")}
              onContextMenu={(e) => e.preventDefault()}
            >
              FIRE
            </Button>

            {/* Right Button */}
            <Button
              variant="outline"
              className="h-16 border-green-500 hover:bg-green-500/20 pixel-font active:bg-green-500/40"
              onTouchStart={() => handleTouchStart("right")}
              onTouchEnd={() => handleTouchEnd("right")}
              onMouseDown={() => handleTouchStart("right")}
              onMouseUp={() => handleTouchEnd("right")}
              onMouseLeave={() => handleTouchEnd("right")}
              onContextMenu={(e) => e.preventDefault()}
            >
              →
            </Button>
          </div>
        )}

        {/* Keyboard Controls Info */}
        {!isTouchDevice && (
          <div className="mt-4 text-xs text-green-500/70 pixel-font text-center">
            <p>ARROWS or A/D: Move • SPACE: Fire • P: Pause • R: Restart</p>
          </div>
        )}
      </div>
    );
  }
);

GameControls.displayName = "GameControls";

export default GameControls;
