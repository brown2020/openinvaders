// src/lib/constants/classic.ts

/**
 * Classic Mode settings for authentic Space Invaders experience
 * Toggle these to switch between modern enhanced visuals and retro arcade feel
 */

export const CLASSIC_MODE = {
  // Visual effects (disabled in classic mode)
  ENABLE_GLOW_EFFECTS: true, // Set to false for authentic look
  ENABLE_PARTICLE_EFFECTS: true,
  ENABLE_SCREEN_SHAKE: true,
  ENABLE_CRT_EFFECT: true,
  ENABLE_STARFIELD: true,

  // Entity effects
  ENABLE_ALIEN_HOVER: true, // Subtle floating animation
  ENABLE_ALIEN_EYES: true, // Glowing eyes effect
  ENABLE_THRUSTER_FLAME: true, // Player ship thruster
  ENABLE_UFO_BEAM: true, // UFO tractor beam
  ENABLE_UFO_LIGHTS: true, // UFO running lights
  ENABLE_UFO_WOBBLE: true, // UFO floating animation

  // Gameplay tweaks
  ENABLE_COMBO_SYSTEM: true, // Disable for pure original scoring

  // Colors (original was monochrome green, but colored overlay was common)
  USE_ORIGINAL_COLORS: false, // Set to true for green-only rendering
} as const;

/**
 * Original Space Invaders green color (arcade CRT phosphor)
 */
export const ORIGINAL_GREEN = "#33ff33";

/**
 * Check if a classic mode feature is enabled
 */
export function isClassicFeatureEnabled(
  feature: keyof typeof CLASSIC_MODE
): boolean {
  return CLASSIC_MODE[feature];
}
