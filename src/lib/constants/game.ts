// src/lib/constants/game.ts

/**
 * Frame time reference for delta time normalization (~60fps)
 */
export const FRAME_TIME = 16.67;

/**
 * Game canvas dimensions
 */
export const GAME_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 600,
  MARGIN: 40,
} as const;

/**
 * Player configuration
 */
export const PLAYER = {
  SPEED: 6, // Slightly faster for better responsiveness
  WIDTH: 48,
  HEIGHT: 32,
  INITIAL_LIVES: 3,
  SHOOT_COOLDOWN: 200, // Slightly faster firing
  Y_POSITION: 550,
  INVINCIBILITY_DURATION: 1500,
} as const;

/**
 * Alien configuration
 */
export const ALIEN = {
  ROWS: 5,
  COLS: 11,
  WIDTH: 32,
  HEIGHT: 32,
  HORIZONTAL_SPACING: 48,
  VERTICAL_SPACING: 44,
  INITIAL_Y: 100,
  MOVE_INTERVAL: 900, // Base interval (adjusted by alien count)
  MIN_MOVE_INTERVAL: 50, // Minimum interval when few aliens remain
  STEP_X: 12, // Step size matching original proportions
  STEP_DROP: 16, // Original: 8px * 2 scale factor
  POINTS: {
    TOP_ROW: 30,
    MIDDLE_ROW: 20,
    BOTTOM_ROW: 10,
  },
  BASE_SHOOT_CHANCE: 0.012,
  WAVE_SHOOT_MULTIPLIER: 0.003,
} as const;

/**
 * Barrier configuration
 */
export const BARRIER = {
  COUNT: 4,
  WIDTH: 72,
  HEIGHT: 54,
  Y_POSITION: 480, // Slightly higher
  SPACING: 160,
  DAMAGE_STATES: 4,
} as const;

/**
 * Projectile configuration
 */
export const PROJECTILE = {
  PLAYER: {
    SPEED: -10, // Faster player shots
    WIDTH: 4,
    HEIGHT: 14,
    COLOR: "#00ff88",
  },
  ALIEN: {
    SPEED: 4.5, // Slightly slower alien shots for fairness
    WIDTH: 4,
    HEIGHT: 14,
    COLOR: "#ff6600",
  },
  CAPS: {
    PLAYER_MAX: 1, // Original: only 1 player shot on screen
    ALIEN_MAX: 3, // Original: max 3 alien shots
  },
} as const;

/**
 * UFO configuration
 */
export const UFO = {
  WIDTH: 48,
  HEIGHT: 22,
  SPEED: 2.5,
  Y_POSITION: 55,
  MIN_SPAWN_MS: 10000,
  MAX_SPAWN_MS: 25000,
  // Original deterministic scoring based on shot count (mod 15)
  SCORE_TABLE: [100, 50, 50, 100, 150, 100, 100, 50, 300, 100, 100, 100, 50, 150, 100],
} as const;

/**
 * Extra life configuration (original game feature)
 */
export const EXTRA_LIFE = {
  SCORE_THRESHOLD: 1500, // Award extra life at this score
  MAX_LIVES: 6, // Maximum lives cap
} as const;
