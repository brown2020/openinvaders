// src/components/game/GameHUD.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';

interface GameHUDProps {
  score: number;
  highScore: number;
  wave: number;
  lives: number;
}

/**
 * Heads-up display showing score, lives, and wave information
 */
const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  wave,
  lives,
}) => {
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
            initial={{ scale: 1.2, color: '#ffffff' }}
            animate={{ scale: 1, color: '#00ff88' }}
            className="text-lg md:text-xl font-bold pixel-font text-green-400"
          >
            {score.toLocaleString().padStart(6, '0')}
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
            {highScore.toLocaleString().padStart(6, '0')}
          </span>
        </div>

        {/* Lives */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-cyan-500/70 pixel-font uppercase tracking-widest">
            Lives
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: i < lives ? 1 : 0.5,
                  opacity: i < lives ? 1 : 0.2,
                }}
              >
                <Heart
                  className={`w-5 h-5 ${
                    i < lives 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-slate-600'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;

