// src/components/game/GameOverlay.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_STATES, ALIEN } from "@/lib/constants/game";

// Simple SVG components for the aliens
const Alien1 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path
      fill="currentColor"
      d="M4 24h4v4h4v-4h8v4h4v-4h4v-4h4v-8h-4v-4h-4V4h-4V0h-8v4h-4v4H4v4H0v8h4v4z"
    />
  </svg>
);

const Alien2 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path
      fill="currentColor"
      d="M8 28v-4H4v-4H0V8h4V4h24v4h4v12h-4v4h-4v4h-4v4H8zm4-24v4h8V4h-8z"
    />
  </svg>
);

const Alien3 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path
      fill="currentColor"
      d="M4 28v-4H0V8h4V4h4v4h4V4h8v4h4V4h4v4h4v16h-4v4h-8v-4h-4v4H4zm8-16v4h8v-4h-8z"
    />
  </svg>
);

interface GameOverlayProps {
  gameState: keyof typeof GAME_STATES;
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
  // Blinking effect for "Press SPACE to Start"
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {gameState !== GAME_STATES.PLAYING && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center"
        >
          {gameState === GAME_STATES.MENU && (
            <MenuOverlay onStart={onStart} isVisible={isVisible} />
          )}

          {gameState === GAME_STATES.PAUSED && (
            <PausedOverlay
              score={score}
              onResume={onResume}
              isVisible={isVisible}
            />
          )}

          {gameState === GAME_STATES.GAME_OVER && (
            <GameOverOverlay
              score={score}
              highScore={highScore}
              wave={wave}
              onRestart={onRestart}
              isVisible={isVisible}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MenuOverlay: React.FC<{ onStart: () => void; isVisible: boolean }> = ({
  onStart,
  isVisible,
}) => (
  <motion.div
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    className="text-center pixel-font"
  >
    <h1 className="text-4xl text-green-500 mb-8">SPACE INVADERS</h1>

    <div className="mb-8 space-y-4">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-4 text-green-500"
      >
        <Alien3 className="w-6 h-6" />
        <span>{ALIEN.POINTS.TOP_ROW} POINTS</span>
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 text-green-500"
      >
        <Alien2 className="w-6 h-6" />
        <span>{ALIEN.POINTS.MIDDLE_ROW} POINTS</span>
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 text-green-500"
      >
        <Alien1 className="w-6 h-6" />
        <span>{ALIEN.POINTS.BOTTOM_ROW} POINTS</span>
      </motion.div>
    </div>

    <div className="space-y-2">
      <Button
        variant="outline"
        size="lg"
        onClick={onStart}
        className="w-48 border-green-500 text-green-500 hover:bg-green-500/20 pixel-font"
      >
        START GAME
      </Button>

      <motion.p
        animate={{ opacity: isVisible ? 1 : 0 }}
        className="text-green-500/60 text-sm mt-4"
      >
        Press SPACE to Start
      </motion.p>
    </div>
  </motion.div>
);

const PausedOverlay: React.FC<{
  score: number;
  onResume: () => void;
  isVisible: boolean;
}> = ({ score, onResume, isVisible }) => (
  <motion.div
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    className="text-center pixel-font"
  >
    <h2 className="text-3xl text-green-500 mb-4">PAUSED</h2>
    <p className="text-green-500/80 mb-6">Current Score: {score}</p>
    <Button
      variant="outline"
      size="lg"
      onClick={onResume}
      className="w-48 border-green-500 text-green-500 hover:bg-green-500/20 pixel-font"
    >
      RESUME
    </Button>
    <motion.p
      animate={{ opacity: isVisible ? 1 : 0 }}
      className="text-green-500/60 text-sm mt-4"
    >
      Press P to Resume
    </motion.p>
  </motion.div>
);

const GameOverOverlay: React.FC<{
  score: number;
  highScore: number;
  wave: number;
  onRestart: () => void;
  isVisible: boolean;
}> = ({ score, highScore, wave, onRestart, isVisible }) => (
  <motion.div
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    className="text-center pixel-font"
  >
    <h2 className="text-3xl text-green-500 mb-6">GAME OVER</h2>

    <div className="space-y-2 mb-6 text-green-500/80">
      <motion.p
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Final Score: {score}
      </motion.p>
      <motion.p
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        High Score: {highScore}
      </motion.p>
      <motion.p
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Waves Cleared: {wave}
      </motion.p>
    </div>

    {score === highScore && score > 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-yellow-500 mb-6"
      >
        NEW HIGH SCORE!
      </motion.div>
    )}

    <Button
      variant="outline"
      size="lg"
      onClick={onRestart}
      className="w-48 border-green-500 text-green-500 hover:bg-green-500/20 pixel-font"
    >
      PLAY AGAIN
    </Button>

    <motion.p
      animate={{ opacity: isVisible ? 1 : 0 }}
      className="text-green-500/60 text-sm mt-4"
    >
      Press SPACE to Restart
    </motion.p>
  </motion.div>
);

// Optional: Floating score notification component
export const ScoreNotification: React.FC<{
  score: number;
  position: { x: number; y: number };
}> = ({ score, position }) => (
  <motion.div
    initial={{ opacity: 1, y: position.y, x: position.x }}
    animate={{ opacity: 0, y: position.y - 50 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute text-yellow-500 pixel-font"
  >
    +{score}
  </motion.div>
);

export default GameOverlay;
