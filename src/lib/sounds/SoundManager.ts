// src/lib/sounds/SoundManager.ts

import { SoundType } from "./SoundTypes";

/**
 * Sound manager for game audio using module pattern
 * Lazy loads sounds on first play to avoid blocking initial load
 */

const sounds = new Map<SoundType, HTMLAudioElement>();
let muted = false;
let volume = 0.3;
let loaded = false;

// Base64 encoded sound data for immediate playback
const soundData: Record<SoundType, string> = {
  [SoundType.SHOOT]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAGBggICgoMDA4ODw8P8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A8PDgwMCggIBgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
  [SoundType.EXPLOSION]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAP//gIBAQODg/////4CAgEBAwMD////////w8ODgwMCgoICAYGBAQCAgAAD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A",
  [SoundType.ALIEN_KILLED]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAEBA4OD///8AAICAwMD////w8ODgwMCgoICAYGBAQCAgAAD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A",
  [SoundType.PLAYER_HIT]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//",
  [SoundType.GAME_OVER]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P///w==",
  [SoundType.ALIEN_MOVE]:
    "data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAGBggICgoMDA4ODw8P8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A8PDgwMCggIBgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
};

/**
 * Lazy load sounds on first use
 */
function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;

  Object.entries(soundData).forEach(([type, data]) => {
    const audio = new Audio(data);
    audio.volume = volume;
    sounds.set(type as SoundType, audio);
  });
}

export const soundManager = {
  /**
   * Play a sound effect (lazy loads on first play)
   */
  play(type: SoundType): void {
    if (muted) return;

    ensureLoaded();

    const sound = sounds.get(type);
    if (sound) {
      // Clone audio for overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    }
  },

  /**
   * Set muted state
   */
  setMuted(isMuted: boolean): void {
    muted = isMuted;
  },

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    muted = !muted;
    return muted;
  },

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return muted;
  },

  /**
   * Set master volume (0-1)
   */
  setVolume(newVolume: number): void {
    volume = Math.max(0, Math.min(1, newVolume));
    sounds.forEach((sound) => {
      sound.volume = volume;
    });
  },

  /**
   * Get current volume
   */
  getVolume(): number {
    return volume;
  },
};
