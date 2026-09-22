// src/components/game/GameControls.tsx

"use client";

import React, { useCallback, useEffect, useEffectEvent, useSyncExternalStore, memo } from "react";
import { Button } from "@/components/ui/button";
import { GameStatus } from "@/types/game";
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
} from "lucide-react";

const ICON_BUTTON_CLASS =
  "w-10 h-10 bg-slate-900/60 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors";
const TOUCH_BUTTON_CLASS =
  "h-16 bg-slate-900/80 border-cyan-500/30 hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors";

interface GameControlsProps {
  gameState: GameStatus;
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
  }) => {
    const isPlaying = gameState === "PLAYING";
    const isPaused = gameState === "PAUSED";
    const isMenu = gameState === "MENU";
    // SSR-safe touch detection without post-paint setState flash
    const isTouchDevice = useSyncExternalStore(
      () => () => {},
      () => "ontouchstart" in window || navigator.maxTouchPoints > 0,
      () => false
    );

    const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
      if (event.repeat) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          onMoveLeft(true);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          onMoveRight(true);
          break;
        case " ":
          event.preventDefault();
          if (isPlaying) {
            onShoot();
          } else if (isMenu || isPaused || gameState === "GAME_OVER") {
            if (isPaused) {
              onResume();
            } else {
              onRestart();
            }
          }
          break;
        case "p":
        case "P":
          event.preventDefault();
          if (isPlaying) {
            onPause();
          } else if (isPaused) {
            onResume();
          }
          break;
        case "r":
        case "R":
          event.preventDefault();
          onRestart();
          break;
        case "Escape":
          event.preventDefault();
          if (isPlaying) {
            onPause();
          }
          break;
      }
    });

    const onKeyUp = useEffectEvent((event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          onMoveLeft(false);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          onMoveRight(false);
          break;
      }
    });

    useEffect(() => {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }, []);

    const handleTouchStart = useCallback(
      (action: "left" | "right" | "shoot") => {
        if (!isPlaying) return;
        if (action === "left") onMoveLeft(true);
        if (action === "right") onMoveRight(true);
        if (action === "shoot") onShoot();
      },
      [isPlaying, onMoveLeft, onMoveRight, onShoot]
    );

    const handleTouchEnd = useCallback(
      (action: "left" | "right") => {
        if (action === "left") onMoveLeft(false);
        if (action === "right") onMoveRight(false);
      },
      [onMoveLeft, onMoveRight]
    );

    return (
      <div className="w-full max-w-[800px] mt-3">
        <div className="flex justify-between items-center gap-2 mb-3 px-2">
          <div className="flex gap-2">
            {(isPlaying || isPaused) && (
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className={ICON_BUTTON_CLASS}
                aria-label={isPaused ? "Resume game" : "Pause game"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4 text-cyan-400" />
                ) : (
                  <Pause className="h-4 w-4 text-cyan-400" />
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onRestart}
              className={ICON_BUTTON_CLASS}
              aria-label="Restart game"
            >
              <RotateCcw className="h-4 w-4 text-cyan-400" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSound}
              className={ICON_BUTTON_CLASS}
              aria-label={isSoundEnabled ? "Mute sound" : "Unmute sound"}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4 text-cyan-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={onShowHelp}
            className={ICON_BUTTON_CLASS}
            aria-label="Show help"
          >
            <HelpCircle className="h-4 w-4 text-cyan-400" />
          </Button>
        </div>

        {isTouchDevice && isPlaying && (
          <div className="grid grid-cols-3 gap-3 px-2">
            <Button
              variant="outline"
              className={TOUCH_BUTTON_CLASS}
              onTouchStart={() => handleTouchStart("left")}
              onTouchEnd={() => handleTouchEnd("left")}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Move left"
            >
              <ChevronLeft className="w-8 h-8 text-cyan-400" />
            </Button>

            <Button
              variant="outline"
              className="h-16 bg-gradient-to-b from-red-900/80 to-red-950/80 border-red-500/30 hover:bg-red-500/20 active:bg-red-500/40 transition-colors"
              onTouchStart={() => handleTouchStart("shoot")}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Fire"
            >
              <Crosshair className="w-8 h-8 text-red-400" />
            </Button>

            <Button
              variant="outline"
              className={TOUCH_BUTTON_CLASS}
              onTouchStart={() => handleTouchStart("right")}
              onTouchEnd={() => handleTouchEnd("right")}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Move right"
            >
              <ChevronRight className="w-8 h-8 text-cyan-400" />
            </Button>
          </div>
        )}

        {!isTouchDevice && (
          <div className="text-center text-xs text-cyan-500/50 pixel-font px-2">
            ← → MOVE • SPACE FIRE • P PAUSE • R RESTART
          </div>
        )}
      </div>
    );
  }
);

GameControls.displayName = "GameControls";

export default GameControls;
