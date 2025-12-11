// src/components/game/GameOverlay.tsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  if (gameState === "PLAYING") {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameState}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center rounded-lg"
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
      </motion.div>
    </AnimatePresence>
  );
};

const MenuOverlay: React.FC<{
  onStart: () => void;
  isBlinkVisible: boolean;
}> = ({ onStart, isBlinkVisible }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="text-center px-8"
  >
    {/* Animated title */}
    <motion.h1
      className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 mb-8 pixel-font"
      animate={{
        textShadow: [
          "0 0 20px rgba(0, 255, 136, 0.5)",
          "0 0 40px rgba(0, 255, 136, 0.8)",
          "0 0 20px rgba(0, 255, 136, 0.5)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      SPACE INVADERS
    </motion.h1>

    {/* Score table */}
    <div className="mb-8 space-y-3">
      {[
        { type: "TOP" as AlienType, points: ALIEN.POINTS.TOP_ROW },
        { type: "MIDDLE" as AlienType, points: ALIEN.POINTS.MIDDLE_ROW },
        { type: "BOTTOM" as AlienType, points: ALIEN.POINTS.BOTTOM_ROW },
      ].map((alien, i) => (
        <motion.div
          key={alien.type}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="flex items-center justify-center gap-4"
        >
          <AlienIcon type={alien.type} className="w-8 h-6" />
          <span className="text-white pixel-font text-sm">
            = {alien.points} PTS
          </span>
        </motion.div>
      ))}

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4"
      >
        <div className="w-8 h-4 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded" />
        <span className="text-white pixel-font text-sm">= ??? PTS</span>
      </motion.div>
    </div>

    {/* Start button */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <Button
        onClick={onStart}
        size="lg"
        className="w-56 h-14 bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 text-white font-bold pixel-font text-lg border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/25"
      >
        <Rocket className="w-5 h-5 mr-2" />
        START GAME
      </Button>

      <motion.p
        animate={{ opacity: isBlinkVisible ? 1 : 0.3 }}
        className="text-cyan-400/60 text-sm mt-4 pixel-font"
      >
        Press SPACE to Start
      </motion.p>
    </motion.div>
  </motion.div>
);

const PausedOverlay: React.FC<{
  score: number;
  onResume: () => void;
  isBlinkVisible: boolean;
}> = ({ score, onResume, isBlinkVisible }) => (
  <motion.div
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    className="text-center px-8"
  >
    <motion.h2
      animate={{
        textShadow: [
          "0 0 20px rgba(255, 255, 0, 0.5)",
          "0 0 40px rgba(255, 255, 0, 0.8)",
          "0 0 20px rgba(255, 255, 0, 0.5)",
        ],
      }}
      transition={{ duration: 1, repeat: Infinity }}
      className="text-4xl text-yellow-400 mb-6 pixel-font"
    >
      PAUSED
    </motion.h2>

    <p className="text-cyan-300/80 mb-8 pixel-font text-sm">
      Current Score:{" "}
      <span className="text-green-400">{score.toLocaleString()}</span>
    </p>

    <Button
      onClick={onResume}
      size="lg"
      className="w-48 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold pixel-font border-2 border-yellow-400/50"
    >
      <Play className="w-5 h-5 mr-2" />
      RESUME
    </Button>

    <motion.p
      animate={{ opacity: isBlinkVisible ? 1 : 0.3 }}
      className="text-yellow-400/60 text-sm mt-4 pixel-font"
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
  isBlinkVisible: boolean;
}> = ({ score, highScore, wave, onRestart, isBlinkVisible }) => {
  const isNewHighScore = score === highScore && score > 0;

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="text-center px-8"
    >
      <motion.h2
        animate={{
          textShadow: [
            "0 0 20px rgba(255, 0, 100, 0.5)",
            "0 0 40px rgba(255, 0, 100, 0.8)",
            "0 0 20px rgba(255, 0, 100, 0.5)",
          ],
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-4xl text-red-500 mb-6 pixel-font"
      >
        GAME OVER
      </motion.h2>

      <div className="space-y-2 mb-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center px-8"
        >
          <span className="text-cyan-400/70 pixel-font text-sm">SCORE</span>
          <span className="text-green-400 pixel-font text-lg">
            {score.toLocaleString()}
          </span>
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center px-8"
        >
          <span className="text-cyan-400/70 pixel-font text-sm">
            HIGH SCORE
          </span>
          <span className="text-cyan-400 pixel-font text-lg">
            {highScore.toLocaleString()}
          </span>
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center px-8"
        >
          <span className="text-cyan-400/70 pixel-font text-sm">
            WAVES CLEARED
          </span>
          <span className="text-yellow-400 pixel-font text-lg">{wave - 1}</span>
        </motion.div>
      </div>

      {isNewHighScore && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex items-center justify-center gap-2 text-yellow-400 mb-6"
        >
          <Trophy className="w-6 h-6" />
          <span className="pixel-font text-lg">NEW HIGH SCORE!</span>
          <Trophy className="w-6 h-6" />
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onRestart}
          size="lg"
          className="w-48 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold pixel-font border-2 border-red-400/50"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          PLAY AGAIN
        </Button>
      </motion.div>

      <motion.p
        animate={{ opacity: isBlinkVisible ? 1 : 0.3 }}
        className="text-red-400/60 text-sm mt-4 pixel-font"
      >
        Press SPACE to Restart
      </motion.p>
    </motion.div>
  );
};

export default GameOverlay;
