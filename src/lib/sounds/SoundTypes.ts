// src/lib/sounds/SoundTypes.ts
export enum SoundType {
  SHOOT = "SHOOT",
  EXPLOSION = "EXPLOSION",
  ALIEN_KILLED = "ALIEN_KILLED",
  PLAYER_HIT = "PLAYER_HIT",
  GAME_OVER = "GAME_OVER",
  // Original 4-note march cycle (replaces single ALIEN_MOVE)
  MARCH_1 = "MARCH_1", // Lowest note
  MARCH_2 = "MARCH_2",
  MARCH_3 = "MARCH_3",
  MARCH_4 = "MARCH_4", // Highest note
  // UFO sounds
  UFO_FLYING = "UFO_FLYING",
  UFO_KILLED = "UFO_KILLED",
  // Bonus
  EXTRA_LIFE = "EXTRA_LIFE",
}
