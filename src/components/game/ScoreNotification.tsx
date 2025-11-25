// src/components/game/ScoreNotification.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreNotificationProps {
  score: number;
  position: { x: number; y: number };
}

/**
 * Floating score notification that appears when enemies are destroyed
 */
export const ScoreNotification: React.FC<ScoreNotificationProps> = ({
  score,
  position,
}) => {
  // Determine color based on score value
  const getScoreColor = () => {
    if (score >= 300) return '#ff00ff'; // UFO - magenta
    if (score >= 100) return '#ff6600'; // High value - orange
    if (score >= 30) return '#ff0066'; // Top row - pink
    if (score >= 20) return '#ff9900'; // Middle row - orange
    return '#ffff00'; // Bottom row - yellow
  };

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
        ease: 'easeOut',
      }}
      className="absolute pointer-events-none z-50"
      style={{
        textShadow: `0 0 10px ${getScoreColor()}, 0 0 20px ${getScoreColor()}`,
      }}
    >
      <span 
        className="pixel-font text-lg font-bold"
        style={{ color: getScoreColor() }}
      >
        +{score}
      </span>
    </motion.div>
  );
};

export default ScoreNotification;
