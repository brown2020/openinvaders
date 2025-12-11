// src/lib/constants/effects.ts

/**
 * Particle system physics constants
 */
export const PARTICLE = {
  GRAVITY: 0.05,
  FRICTION: 0.98,
  DECAY: 0.02,
  MIN_SIZE: 0.2,
  SHRINK_RATE: 0.98,
} as const;

/**
 * Starfield configuration
 */
export const STARFIELD = {
  LAYER_COUNT: 3,
  STARS_PER_LAYER: 50,
  LAYER_SPEED_MULTIPLIER: 0.1,
  LAYER_SIZE_MULTIPLIER: 0.5,
  BASE_BRIGHTNESS: 0.3,
  BRIGHTNESS_PER_LAYER: 0.25,
  MIN_TWINKLE_SPEED: 0.02,
  TWINKLE_SPEED_VARIANCE: 0.03,
  LARGE_STAR_THRESHOLD: 1,
  GLOW_MULTIPLIER: 3,
} as const;

/**
 * Screen shake configuration
 */
export const SCREEN_SHAKE = {
  // Impact intensities
  ALIEN_KILL: 3,
  UFO_KILL: 8,
  PLAYER_HIT: 10,
  // Durations in ms
  ALIEN_KILL_DURATION: 100,
  UFO_KILL_DURATION: 200,
  PLAYER_HIT_DURATION: 300,
} as const;

/**
 * CRT effect configuration
 */
export const CRT = {
  SCANLINE_OPACITY: 0.08,
  SCANLINE_SPACING: 3,
  VIGNETTE_STRENGTH: 0.3,
  VIGNETTE_RADIUS_FACTOR: 0.7,
  VIGNETTE_INNER_FACTOR: 0.3,
} as const;
