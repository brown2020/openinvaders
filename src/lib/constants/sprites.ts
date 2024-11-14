// src/lib/constants/sprites.ts
export const SPRITE_PATHS = {
  PLAYER: "/assets/sprites/player.png",
  ALIEN_1: "/assets/sprites/alien1.png",
  ALIEN_2: "/assets/sprites/alien2.png",
  ALIEN_3: "/assets/sprites/alien3.png",
  BARRIER: "/assets/sprites/barrier.png",
  EXPLOSION: "/assets/sprites/explosion.png",
} as const;

export const SPRITE_ANIMATIONS = {
  ALIEN: {
    FRAMES: 2, // Number of frames in alien animation
    FRAME_TIME: 500, // Time per frame in ms
  },
  EXPLOSION: {
    FRAMES: 4,
    FRAME_TIME: 100,
  },
} as const;

// Animation frame sequences for different sprites
export const SPRITE_FRAMES = {
  ALIEN_1: {
    idle: [0, 1],
    destroy: [2, 3, 4, 5],
  },
  ALIEN_2: {
    idle: [0, 1],
    destroy: [2, 3, 4, 5],
  },
  ALIEN_3: {
    idle: [0, 1],
    destroy: [2, 3, 4, 5],
  },
  BARRIER: {
    damage: [0, 1, 2, 3], // Different damage states
  },
} as const;

export const SPRITE_SIZES = {
  ALIEN_1: { width: 32, height: 32 },
  ALIEN_2: { width: 32, height: 32 },
  ALIEN_3: { width: 32, height: 32 },
  PLAYER: { width: 48, height: 32 },
  BARRIER: { width: 72, height: 54 },
  EXPLOSION: { width: 32, height: 32 },
} as const;

// Define sound effects paths
export const SOUND_EFFECTS = {
  PLAYER_SHOOT: "/assets/sounds/shoot.wav",
  ALIEN_SHOOT: "/assets/sounds/alien_shoot.wav",
  EXPLOSION: "/assets/sounds/explosion.wav",
  ALIEN_DEATH: "/assets/sounds/alien_death.wav",
  GAME_OVER: "/assets/sounds/game_over.wav",
  EXTRA_LIFE: "/assets/sounds/extra_life.wav",
} as const;
