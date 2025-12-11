// src/lib/constants/colors.ts

import { AlienType } from "@/types/game";

/**
 * Color palette for the game
 */
export const GAME_COLORS = {
  // Primary colors
  PRIMARY: "#00ff88",
  PRIMARY_GLOW: "#00ff8844",
  SECONDARY: "#ff0088",
  SECONDARY_GLOW: "#ff008844",

  // Entity colors
  PLAYER: "#00ffff",
  PLAYER_GLOW: "#00ffff44",
  PROJECTILE_PLAYER: "#00ff88",
  PROJECTILE_ALIEN: "#ff6600",

  // Alien colors by type
  ALIEN_TOP: "#ff0066",
  ALIEN_MIDDLE: "#ff9900",
  ALIEN_BOTTOM: "#ffff00",

  // UFO
  UFO: "#ff00ff",
  UFO_GLOW: "#ff00ff66",

  // Barriers
  BARRIER: "#00ff44",

  // UI
  SCORE: "#ffffff",
  HIGH_SCORE: "#ffff00",

  // Effects
  EXPLOSION: ["#ffffff", "#ffff00", "#ff9900", "#ff0000"],

  // Background
  BACKGROUND: "#0a0a12",
  STAR: "#ffffff",
} as const;

export type GameColor = typeof GAME_COLORS;

/**
 * Alien type to color mapping (shared across components)
 */
export const ALIEN_TYPE_COLORS: Record<AlienType, string> = {
  TOP: GAME_COLORS.ALIEN_TOP,
  MIDDLE: GAME_COLORS.ALIEN_MIDDLE,
  BOTTOM: GAME_COLORS.ALIEN_BOTTOM,
} as const;
