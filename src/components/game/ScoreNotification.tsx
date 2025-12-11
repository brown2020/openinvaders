// src/components/game/ScoreNotification.tsx

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GAME_COLORS } from "@/lib/constants/colors";

interface ScoreNotificationProps {
  score: number;
  position: { x: number; y: number };
}

/**
 * Get color for score value (pure function for memoization)
 */
function getScoreColor(score: number): string {
  if (score >= 300) return GAME_COLORS.UFO; // UFO
  if (score >= 100) return GAME_COLORS.PROJECTILE_ALIEN; // High value
  if (score >= 30) return GAME_COLORS.ALIEN_TOP; // Top row
  if (score >= 20) return GAME_COLORS.ALIEN_MIDDLE; // Middle row
  return GAME_COLORS.ALIEN_BOTTOM; // Bottom row
}

/**
 * Floating score notification that appears when enemies are destroyed
 */
export const ScoreNotification: React.FC<ScoreNotificationProps> = ({
  score,
  position,
}) => {
  // Memoize color calculation
  const scoreColor = useMemo(() => getScoreColor(score), [score]);

  return (
    <motion.div
      initial={{
        opacity: 1,
        y: position.y,
        x: position.x,
        scale: 1.5,
      }}
      animate={{
        opacity: 0,
        y: position.y - 60,
        scale: 0.8,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none z-50"
      style={{
        textShadow: `0 0 10px ${scoreColor}, 0 0 20px ${scoreColor}`,
      }}
    >
      <span
        className="pixel-font text-lg font-bold"
        style={{ color: scoreColor }}
      >
        +{score}
      </span>
    </motion.div>
  );
};

export default ScoreNotification;
