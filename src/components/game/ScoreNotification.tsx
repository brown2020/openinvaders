// src/components/game/ScoreNotification.tsx

import React, { useMemo } from "react";
import { GAME_COLORS } from "@/lib/constants/colors";

interface ScoreNotificationProps {
  score: number;
  position: { x: number; y: number };
}

function getScoreColor(score: number): string {
  if (score >= 300) return GAME_COLORS.UFO;
  if (score >= 100) return GAME_COLORS.PROJECTILE_ALIEN;
  if (score >= 30) return GAME_COLORS.ALIEN_TOP;
  if (score >= 20) return GAME_COLORS.ALIEN_MIDDLE;
  return GAME_COLORS.ALIEN_BOTTOM;
}

/**
 * Floating score notification that appears when enemies are destroyed
 */
export const ScoreNotification: React.FC<ScoreNotificationProps> = ({
  score,
  position,
}) => {
  const scoreColor = useMemo(() => getScoreColor(score), [score]);

  return (
    <div
      className="absolute pointer-events-none z-50 animate-score-float"
      style={{
        left: position.x,
        top: position.y,
        textShadow: `0 0 10px ${scoreColor}, 0 0 20px ${scoreColor}`,
      }}
    >
      <span className="pixel-font text-lg font-bold" style={{ color: scoreColor }}>
        +{score}
      </span>
    </div>
  );
};

export default ScoreNotification;
