// src/lib/sounds/SoundManager.ts

import { SoundType } from './SoundTypes';

/**
 * Singleton sound manager for game audio
 * Uses base64 encoded sounds for immediate playback
 */
class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundType, HTMLAudioElement>;
  private muted: boolean = false;
  private volume: number = 0.3;

  private constructor() {
    this.sounds = new Map();
    this.loadSounds();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private loadSounds(): void {
    // Base64 encoded sound data for immediate playback
    const soundData: Record<SoundType, string> = {
      [SoundType.SHOOT]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAGBggICgoMDA4ODw8P8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A8PDgwMCggIBgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
      [SoundType.EXPLOSION]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAP//gIBAQODg/////4CAgEBAwMD////////w8ODgwMCgoICAYGBAQCAgAAD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A',
      [SoundType.ALIEN_KILLED]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAEBA4OD///8AAICAwMD////w8ODgwMCgoICAYGBAQCAgAAD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A',
      [SoundType.PLAYER_HIT]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//',
      [SoundType.GAME_OVER]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P////8AAICAwMDg4P///w==',
      [SoundType.ALIEN_MOVE]:
        'data:audio/wav;base64,UklGRh4EAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfoDAAAAAGBggICgoMDA4ODw8P8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A8PDgwMCggIBgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
    };

    // Create audio elements for each sound
    Object.entries(soundData).forEach(([type, data]) => {
      const audio = new Audio(data);
      audio.volume = this.volume;
      this.sounds.set(type as SoundType, audio);
    });
  }

  /**
   * Play a sound effect
   */
  public play(type: SoundType): void {
    if (this.muted) return;

    const sound = this.sounds.get(type);
    if (sound) {
      // Clone audio for overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    }
  }

  /**
   * Set muted state
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Check if muted
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set master volume (0-1)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }
}

export const soundManager = SoundManager.getInstance();
