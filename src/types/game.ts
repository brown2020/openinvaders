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
export type GameStatus = "MENU" | "PLAYING" | "PAUSED" | "GAME_OVER";

/**
 * Alien types based on row position
 */
export type AlienType = "TOP" | "MIDDLE" | "BOTTOM";

/**
 * Collision event types with discriminated union for type safety
 */
export type CollisionEvent =
  | {
      type: "ALIEN_KILLED";
      payload: { alienType: AlienType };
      points: number;
      position: Position;
    }
  | {
      type: "UFO_KILLED";
      points: number;
      position: Position;
    }
  | {
      type: "PLAYER_HIT";
      payload: { lives: number };
      position: Position;
    }
  | {
      type: "BARRIER_HIT";
      payload: { destroyed: boolean };
      position: Position;
    }
  | { type: "GAME_OVER" }
  | { type: "ALIEN_LANDED" };

/**
 * Helper type to extract event type string
 */
export type CollisionEventType = CollisionEvent["type"];

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
  extraLifeAwarded: boolean; // Track if extra life at 1500 pts was given
}

/**
 * Game store actions interface
 */
export interface GameActions {
  setStatus: (status: GameStatus) => void;
  incrementScore: (points: number) => void;
  incrementWave: () => void;
  setLives: (lives: number) => void;
  toggleSound: () => void;
  resetGame: () => void;
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
}
