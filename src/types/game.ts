// src/types/game.ts

/**
 * Core position type used throughout the game
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Entity dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Velocity vector
 */
export interface Velocity {
  x: number;
  y: number;
}

/**
 * Bounding box for collision detection
 */
export interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Game status states
 */
export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

/**
 * Alien types based on row position
 */
export type AlienType = 'TOP' | 'MIDDLE' | 'BOTTOM';

/**
 * Power-up types
 */
export type PowerUpType = 'SHIELD' | 'MULTI_SHOT' | 'SPEED_BOOST';

/**
 * Sound effect types
 */
export type SoundEffect = 
  | 'SHOOT'
  | 'EXPLOSION'
  | 'ALIEN_KILLED'
  | 'PLAYER_HIT'
  | 'GAME_OVER'
  | 'ALIEN_MOVE'
  | 'POWERUP'
  | 'UFO_FLYBY';

/**
 * Collision event types
 */
export type CollisionEventType =
  | 'ALIEN_KILLED'
  | 'PLAYER_HIT'
  | 'BARRIER_HIT'
  | 'UFO_KILLED'
  | 'GAME_OVER'
  | 'ALIEN_LANDED'
  | 'POWERUP_COLLECTED';

/**
 * Collision event payload
 */
export interface CollisionEvent {
  type: CollisionEventType;
  payload?: Record<string, unknown>;
  points?: number;
  position?: Position;
}

/**
 * Score notification for floating score popups
 */
export interface ScoreNotification {
  id: number;
  score: number;
  position: Position;
  timestamp: number;
}

/**
 * Particle for explosion effects
 */
export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * Screen shake configuration
 */
export interface ScreenShake {
  intensity: number;
  duration: number;
  startTime: number;
}

/**
 * Visual effect configuration
 */
export interface VisualEffect {
  id: number;
  type: 'explosion' | 'hit' | 'powerup';
  position: Position;
  startTime: number;
  duration: number;
}

/**
 * Game store state interface
 */
export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  wave: number;
  lives: number;
  isSoundEnabled: boolean;
  combo: number;
  lastKillTime: number;
}

/**
 * Game store actions interface
 */
export interface GameActions {
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  incrementScore: (points: number) => void;
  setHighScore: (score: number) => void;
  setWave: (wave: number) => void;
  incrementWave: () => void;
  setLives: (lives: number) => void;
  decrementLives: () => void;
  toggleSound: () => void;
  resetGame: () => void;
  incrementCombo: () => void;
  resetCombo: () => void;
}

/**
 * Complete game store type
 */
export type GameStore = GameState & GameActions;

/**
 * Render layer ordering
 */
export enum RenderLayer {
  BACKGROUND = 0,
  STARS = 1,
  BARRIERS = 2,
  PROJECTILES = 3,
  ALIENS = 4,
  UFO = 5,
  PLAYER = 6,
  PARTICLES = 7,
  UI = 8,
}

/**
 * Color palette for the game
 */
export const GAME_COLORS = {
  // Primary colors
  PRIMARY: '#00ff88',
  PRIMARY_GLOW: '#00ff8844',
  SECONDARY: '#ff0088',
  SECONDARY_GLOW: '#ff008844',
  
  // Entity colors
  PLAYER: '#00ffff',
  PLAYER_GLOW: '#00ffff44',
  PROJECTILE_PLAYER: '#00ff88',
  PROJECTILE_ALIEN: '#ff6600',
  
  // Alien colors by type
  ALIEN_TOP: '#ff0066',
  ALIEN_MIDDLE: '#ff9900',
  ALIEN_BOTTOM: '#ffff00',
  
  // UFO
  UFO: '#ff00ff',
  UFO_GLOW: '#ff00ff66',
  
  // Barriers
  BARRIER: '#00ff44',
  
  // UI
  SCORE: '#ffffff',
  HIGH_SCORE: '#ffff00',
  
  // Effects
  EXPLOSION: ['#ffffff', '#ffff00', '#ff9900', '#ff0000'],
  PARTICLE: ['#00ffff', '#00ff88', '#ff0088', '#ffff00'],
  
  // Background
  BACKGROUND: '#0a0a12',
  STAR: '#ffffff',
} as const;

