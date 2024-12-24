import React from "react";
import { motion } from "framer-motion";

interface ScoreNotificationProps {
  score: number;
  position: { x: number; y: number };
}

export const ScoreNotification: React.FC<ScoreNotificationProps> = ({
  score,
  position,
}) => (
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
