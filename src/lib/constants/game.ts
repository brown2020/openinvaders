// src/lib/constants/game.ts
export const GAME_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 600,
  MARGIN: 40, // Margin from edges
} as const;

export const PLAYER = {
  SPEED: 5,
  WIDTH: 48,
  HEIGHT: 32,
  INITIAL_LIVES: 3,
  SHOOT_COOLDOWN: 250, // ms between shots
  Y_POSITION: 550, // Fixed Y position from top
} as const;

export const ALIEN = {
  ROWS: 5,
  COLS: 11,
  WIDTH: 32,
  HEIGHT: 32,
  HORIZONTAL_SPACING: 48,
  VERTICAL_SPACING: 48,
  INITIAL_Y: 100, // Starting Y position
  MOVE_INTERVAL: 1000, // Initial step interval (ms)
  MIN_MOVE_INTERVAL: 100, // Fastest possible step interval
  STEP_X: 16, // Pixels moved horizontally per step
  STEP_DROP: 24, // Pixels moved down when hitting an edge
  POINTS: {
    TOP_ROW: 30, // Points for top row aliens
    MIDDLE_ROW: 20, // Points for middle row aliens
    BOTTOM_ROW: 10, // Points for bottom row aliens
  },
  BASE_SHOOT_CHANCE: 0.015, // Base probability of an alien shooting each frame
  WAVE_SHOOT_MULTIPLIER: 0.002, // Additional shoot chance per wave
} as const;

export const BARRIER = {
  COUNT: 4,
  WIDTH: 72,
  HEIGHT: 54,
  Y_POSITION: 500, // Fixed Y position from top
  SPACING: 160, // Space between barriers
  DAMAGE_STATES: 4, // Number of damage states before destruction
} as const;

export const PROJECTILE = {
  PLAYER: {
    SPEED: -8, // Negative because up is negative in canvas
    WIDTH: 4,
    HEIGHT: 12,
    COLOR: "#fff",
  },
  ALIEN: {
    SPEED: 5,
    WIDTH: 4,
    HEIGHT: 12,
    COLOR: "#ff0",
  },
  CAPS: {
    PLAYER_MAX: 1,
    ALIEN_MAX: 3,
  },
} as const;

export const GAME_STATES = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
} as const;

export const SCORE = {
  EXTRA_LIFE_AT: 10000, // Score needed for extra life
  HIGH_SCORE_KEY: "spaceInvaders_highScore", // localStorage key
} as const;

export const UFO = {
  WIDTH: 40,
  HEIGHT: 20,
  SPEED: 2.5,
  Y_POSITION: 60,
  MIN_SPAWN_MS: 8000,
  MAX_SPAWN_MS: 20000,
  SCORES: [50, 100, 150, 300],
} as const;
