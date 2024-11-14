// src/lib/sound/SoundManager.ts
import { SoundType } from "./SoundTypes";

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundType, HTMLAudioElement>;
  private muted: boolean = false;

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

  private loadSounds() {
    // Define base64 encoded sound data
    const soundData = {
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

    // Create audio elements for each sound
    Object.entries(soundData).forEach(([type, data]) => {
      const audio = new Audio(data);
      audio.volume = 0.3; // Set default volume
      this.sounds.set(type as SoundType, audio);
    });
  }

  // In SoundManager.ts, update the play method:
  public play(type: SoundType) {
    console.log("Attempting to play sound:", type);
    if (this.muted) {
      console.log("Sound is muted");
      return;
    }

    const sound = this.sounds.get(type);
    if (sound) {
      console.log("Playing sound:", type);
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = sound.volume;
      clone.play().catch((error) => {
        console.warn("Sound playback failed:", error);
      });
    } else {
      console.warn("Sound not found:", type);
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const soundManager = SoundManager.getInstance();
