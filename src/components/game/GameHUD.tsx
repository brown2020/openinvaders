// src/components/game/GameHUD.tsx

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { EXTRA_LIFE } from "@/lib/constants/game";

/**
 * Ship icon component for lives display (authentic to original game)
 */
const ShipIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    width="20"
    height="12"
    viewBox="0 0 20 12"
    className={active ? "text-cyan-400" : "text-slate-600"}
  >
    <path
      d="M9 0h2v2h-2zM8 2h4v2H8zM4 4h12v2H4zM2 6h16v2H2zM2 8h16v4H2z"
      fill="currentColor"
    />
  </svg>
);

interface GameHUDProps {
  score: number;
  highScore: number;
  wave: number;
  lives: number;
}

/**
 * Heads-up display showing score, lives, and wave information
 */
const GameHUD: React.FC<GameHUDProps> = ({ score, highScore, wave, lives }) => {
  return (
    <div className="w-full max-w-[800px] mb-3">
      <div className="flex justify-between items-center px-2 py-2 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-cyan-500/20">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-500/70 pixel-font uppercase tracking-widest">
            Score
          </span>
          <motion.span
            key={score}
            initial={{ scale: 1.2, color: "#ffffff" }}
            animate={{ scale: 1, color: "#00ff88" }}
            className="text-lg md:text-xl font-bold pixel-font text-green-400"
          >
            {score.toLocaleString().padStart(6, "0")}
          </motion.span>
        </div>

        {/* Wave */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500/70 pixel-font uppercase tracking-widest">
            Wave
          </span>
          <motion.div
            key={wave}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-lg md:text-xl font-bold pixel-font text-yellow-400">
              {wave}
            </span>
          </motion.div>
        </div>

        {/* High Score */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500/70 pixel-font uppercase tracking-widest">
            High Score
          </span>
          <span className="text-lg md:text-xl font-bold pixel-font text-cyan-400">
            {highScore.toLocaleString().padStart(6, "0")}
          </span>
        </div>

        {/* Lives (shown as ship icons like original arcade) */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-cyan-500/70 pixel-font uppercase tracking-widest">
            Lives
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: EXTRA_LIFE.MAX_LIVES }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={{
                  scale: i < lives ? 1 : 0.5,
                  opacity: i < lives ? 1 : 0.15,
                }}
                className={i >= 3 ? "hidden sm:block" : ""}
              >
                <ShipIcon active={i < lives} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
