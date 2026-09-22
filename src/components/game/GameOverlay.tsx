// src/components/game/GameOverlay.tsx

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ALIEN } from "@/lib/constants/game";
import { AlienType, GameStatus } from "@/types/game";
import { Rocket, Play, RotateCcw, Trophy } from "lucide-react";
import { AlienIcon } from "./AlienIcon";

interface GameOverlayProps {
  gameState: GameStatus;
  score: number;
  highScore: number;
  wave: number;
  onStart: () => void;
  onRestart: () => void;
  onResume: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  score,
  highScore,
  wave,
  onStart,
  onRestart,
  onResume,
}) => {
  const [isBlinkVisible, setIsBlinkVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinkVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (gameState === "PLAYING") {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
  }, [gameState]);

  if (gameState === "PLAYING") {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="absolute inset-0 m-0 w-full h-full max-w-none max-h-none bg-slate-950/90 backdrop-blur-sm flex items-center justify-center rounded-lg animate-overlay-fade-in border-0 p-0 open:flex"
      aria-label={
        gameState === "MENU"
          ? "Main menu"
          : gameState === "PAUSED"
            ? "Game paused"
            : "Game over"
      }
      onCancel={(event) => {
        // Keep pause/menu under game control; Escape is handled by GameControls.
        event.preventDefault();
      }}
    >
      {gameState === "MENU" && (
        <MenuOverlay onStart={onStart} isBlinkVisible={isBlinkVisible} />
      )}
      {gameState === "PAUSED" && (
        <PausedOverlay
          score={score}
          onResume={onResume}
          isBlinkVisible={isBlinkVisible}
        />
      )}
      {gameState === "GAME_OVER" && (
        <GameOverOverlay
          score={score}
          highScore={highScore}
          wave={wave}
          onRestart={onRestart}
          isBlinkVisible={isBlinkVisible}
        />
      )}
    </dialog>
  );
};

const MenuOverlay: React.FC<{
  onStart: () => void;
  isBlinkVisible: boolean;
}> = ({ onStart, isBlinkVisible }) => (
  <div className="text-center px-8">
    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 mb-8 pixel-font text-glow-green">
      SPACE INVADERS
    </h2>

    <div className="mb-8 space-y-3">
      {(
        [
          { type: "TOP" as AlienType, points: ALIEN.POINTS.TOP_ROW },
          { type: "MIDDLE" as AlienType, points: ALIEN.POINTS.MIDDLE_ROW },
          { type: "BOTTOM" as AlienType, points: ALIEN.POINTS.BOTTOM_ROW },
        ] as const
      ).map((alien) => (
        <div
          key={alien.type}
          className="flex items-center justify-center gap-4"
        >
          <AlienIcon type={alien.type} className="w-8 h-6" />
          <span className="text-white pixel-font text-sm">
            = {alien.points} PTS
          </span>
        </div>
      ))}

      <div className="flex items-center justify-center gap-4">
        <div className="w-8 h-4 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded" />
        <span className="text-white pixel-font text-sm">= ??? PTS</span>
      </div>
    </div>

    <Button
      onClick={onStart}
      size="lg"
      className="w-56 h-14 bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 text-white font-bold pixel-font text-lg border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/25"
    >
      <Rocket className="w-5 h-5 mr-2" aria-hidden="true" />
      START GAME
    </Button>

    <p
      className="text-cyan-400/60 text-sm mt-4 pixel-font"
      style={{ opacity: isBlinkVisible ? 1 : 0.3 }}
    >
      Press SPACE to Start
    </p>
  </div>
);

const PausedOverlay: React.FC<{
  score: number;
  onResume: () => void;
  isBlinkVisible: boolean;
}> = ({ score, onResume, isBlinkVisible }) => (
  <div className="text-center px-8">
    <h2 className="text-4xl text-yellow-400 mb-6 pixel-font text-glow-cyan">
      PAUSED
    </h2>
    <p className="text-cyan-300/80 mb-8 pixel-font text-sm">
      Current Score:{" "}
      <span className="text-green-400">{score.toLocaleString()}</span>
    </p>
    <Button
      onClick={onResume}
      size="lg"
      className="w-48 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold pixel-font border-2 border-yellow-400/50"
    >
      <Play className="w-5 h-5 mr-2" aria-hidden="true" />
      RESUME
    </Button>
    <p
      className="text-yellow-400/60 text-sm mt-4 pixel-font"
      style={{ opacity: isBlinkVisible ? 1 : 0.3 }}
    >
      Press P to Resume
    </p>
  </div>
);

const GameOverOverlay: React.FC<{
  score: number;
  highScore: number;
  wave: number;
  onRestart: () => void;
  isBlinkVisible: boolean;
}> = ({ score, highScore, wave, onRestart, isBlinkVisible }) => {
  const isNewHighScore = score === highScore && score > 0;

  return (
    <div className="text-center px-8">
      <h2 className="text-4xl text-red-500 mb-6 pixel-font text-glow-pink">
        GAME OVER
      </h2>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center px-8">
          <span className="text-cyan-400/70 pixel-font text-sm">SCORE</span>
          <span className="text-green-400 pixel-font text-lg">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center px-8">
          <span className="text-cyan-400/70 pixel-font text-sm">HIGH SCORE</span>
          <span className="text-cyan-400 pixel-font text-lg">
            {highScore.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center px-8">
          <span className="text-cyan-400/70 pixel-font text-sm">
            WAVES CLEARED
          </span>
          <span className="text-yellow-400 pixel-font text-lg">{wave - 1}</span>
        </div>
      </div>

      {isNewHighScore && (
        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
          <Trophy className="w-6 h-6" aria-hidden="true" />
          <span className="pixel-font text-lg">NEW HIGH SCORE!</span>
          <Trophy className="w-6 h-6" aria-hidden="true" />
        </div>
      )}

      <Button
        onClick={onRestart}
        size="lg"
        className="w-48 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold pixel-font border-2 border-red-400/50"
      >
        <RotateCcw className="w-5 h-5 mr-2" aria-hidden="true" />
        PLAY AGAIN
      </Button>

      <p
        className="text-red-400/60 text-sm mt-4 pixel-font"
        style={{ opacity: isBlinkVisible ? 1 : 0.3 }}
      >
        Press SPACE to Restart
      </p>
    </div>
  );
};

export default GameOverlay;
