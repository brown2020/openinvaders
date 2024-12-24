export const POWERUP = {
  WIDTH: 24,
  HEIGHT: 24,
  FALL_SPEED: 2,
  SPAWN_CHANCE: 0.1, // 10% chance when killing an alien
  DURATION: {
    SHIELD: 10000, // 10 seconds
    MULTI_SHOT: 8000, // 8 seconds
    SPEED_BOOST: 12000, // 12 seconds
  },
  EFFECTS: {
    SPEED_BOOST_MULTIPLIER: 1.5,
    MULTI_SHOT_COUNT: 3,
  },
} as const;

export type PowerUpType = "SHIELD" | "MULTI_SHOT" | "SPEED_BOOST";

export const POWERUP_SPRITES = {
  SHIELD: "/assets/sprites/powerup_shield.png",
  MULTI_SHOT: "/assets/sprites/powerup_multishot.png",
  SPEED_BOOST: "/assets/sprites/powerup_speed.png",
} as const;
