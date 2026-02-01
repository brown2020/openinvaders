// src/lib/sounds/SoundManager.ts

import { SoundType } from "./SoundTypes";

/**
 * Sound manager with Web Audio API for authentic 8-bit sounds
 * Features the iconic 4-note march cycle from original Space Invaders
 */

let audioContext: AudioContext | null = null;
let muted = false;
let volume = 0.3;
let marchNoteIndex = 0;

// March note frequencies (approximating original descending bass line)
// Original used ~55Hz, ~49Hz, ~46Hz, ~44Hz (A1-G#1-F#1-F1 range)
const MARCH_FREQUENCIES = [55, 49, 46, 41]; // Hz

// Sound configurations for Web Audio synthesis
interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  decay?: boolean;
  sweep?: { start: number; end: number };
}

const soundConfigs: Partial<Record<SoundType, SoundConfig>> = {
  [SoundType.MARCH_1]: { frequency: MARCH_FREQUENCIES[0], duration: 0.1, type: "square" },
  [SoundType.MARCH_2]: { frequency: MARCH_FREQUENCIES[1], duration: 0.1, type: "square" },
  [SoundType.MARCH_3]: { frequency: MARCH_FREQUENCIES[2], duration: 0.1, type: "square" },
  [SoundType.MARCH_4]: { frequency: MARCH_FREQUENCIES[3], duration: 0.1, type: "square" },
  [SoundType.SHOOT]: { frequency: 880, duration: 0.1, type: "square", sweep: { start: 880, end: 440 } },
  [SoundType.EXPLOSION]: { frequency: 100, duration: 0.3, type: "sawtooth", decay: true },
  [SoundType.ALIEN_KILLED]: { frequency: 800, duration: 0.15, type: "square", sweep: { start: 800, end: 200 } },
  [SoundType.PLAYER_HIT]: { frequency: 200, duration: 0.4, type: "sawtooth", sweep: { start: 400, end: 50 } },
  [SoundType.GAME_OVER]: { frequency: 200, duration: 1.0, type: "sawtooth", sweep: { start: 400, end: 50 } },
  [SoundType.UFO_KILLED]: { frequency: 600, duration: 0.3, type: "square", sweep: { start: 800, end: 200 } },
  [SoundType.EXTRA_LIFE]: { frequency: 880, duration: 0.3, type: "square", sweep: { start: 440, end: 880 } },
};

/**
 * Get or create AudioContext (lazy initialization)
 */
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  // Resume if suspended (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a synthesized sound using Web Audio API
 */
function playSynthSound(config: SoundConfig): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = config.type;
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  // Frequency handling
  if (config.sweep) {
    oscillator.frequency.setValueAtTime(config.sweep.start, now);
    oscillator.frequency.linearRampToValueAtTime(config.sweep.end, now + config.duration);
  } else {
    oscillator.frequency.setValueAtTime(config.frequency, now);
  }

  // Volume envelope
  gainNode.gain.setValueAtTime(volume * 0.5, now);
  if (config.decay) {
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);
  } else {
    gainNode.gain.setValueAtTime(volume * 0.5, now);
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
  }

  oscillator.start(now);
  oscillator.stop(now + config.duration);
}

// UFO flying sound state
let ufoOscillator: OscillatorNode | null = null;
let ufoGain: GainNode | null = null;

/**
 * Start continuous UFO flying sound
 */
function startUfoSound(): void {
  const ctx = getAudioContext();
  if (!ctx || ufoOscillator) return;

  ufoOscillator = ctx.createOscillator();
  ufoGain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  // Create warbling UFO sound
  ufoOscillator.type = "sine";
  ufoOscillator.frequency.setValueAtTime(400, ctx.currentTime);

  lfo.type = "sine";
  lfo.frequency.setValueAtTime(8, ctx.currentTime); // Wobble rate
  lfoGain.gain.setValueAtTime(50, ctx.currentTime); // Wobble depth

  lfo.connect(lfoGain);
  lfoGain.connect(ufoOscillator.frequency);

  ufoOscillator.connect(ufoGain);
  ufoGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  ufoGain.connect(ctx.destination);

  lfo.start();
  ufoOscillator.start();
}

/**
 * Stop UFO flying sound
 */
function stopUfoSound(): void {
  if (ufoOscillator) {
    ufoOscillator.stop();
    ufoOscillator.disconnect();
    ufoOscillator = null;
  }
  if (ufoGain) {
    ufoGain.disconnect();
    ufoGain = null;
  }
}

export const soundManager = {
  /**
   * Play a sound effect
   */
  play(type: SoundType): void {
    if (muted) return;

    // Handle UFO flying specially
    if (type === SoundType.UFO_FLYING) {
      startUfoSound();
      return;
    }

    const config = soundConfigs[type];
    if (config) {
      playSynthSound(config);
    }
  },

  /**
   * Stop a continuous sound
   */
  stop(type: SoundType): void {
    if (type === SoundType.UFO_FLYING) {
      stopUfoSound();
    }
  },

  /**
   * Play the next note in the 4-note march cycle
   * Call this on each alien formation step for authentic sound
   */
  playMarchNote(): void {
    if (muted) return;

    const marchTypes = [
      SoundType.MARCH_1,
      SoundType.MARCH_2,
      SoundType.MARCH_3,
      SoundType.MARCH_4,
    ];

    const config = soundConfigs[marchTypes[marchNoteIndex]];
    if (config) {
      playSynthSound(config);
    }

    marchNoteIndex = (marchNoteIndex + 1) % 4;
  },

  /**
   * Reset march note cycle (e.g., on new wave)
   */
  resetMarchCycle(): void {
    marchNoteIndex = 0;
  },

  /**
   * Set muted state
   */
  setMuted(isMuted: boolean): void {
    muted = isMuted;
    if (isMuted) {
      stopUfoSound();
    }
  },

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    muted = !muted;
    if (muted) {
      stopUfoSound();
    }
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
    if (ufoGain) {
      const ctx = getAudioContext();
      if (ctx) {
        ufoGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      }
    }
  },

  /**
   * Get current volume
   */
  getVolume(): number {
    return volume;
  },
};
