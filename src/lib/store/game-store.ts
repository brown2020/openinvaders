// src/lib/store/game-store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { GameStatus, GameStore } from "@/types/game";
import { EXTRA_LIFE } from "@/lib/constants/game";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

/**
 * Game state store with Zustand
 * Manages all game state including score, lives, wave, and settings
 */
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        status: "MENU" as GameStatus,
        score: 0,
        highScore: 0,
        wave: 1,
        lives: 3,
        isSoundEnabled: true,
        combo: 0,
        lastKillTime: 0,
        extraLifeAwarded: false, // Track if extra life at 1500 pts was given

        // Actions
        setStatus: (status) => set({ status }),

        incrementScore: (points) =>
          set((state) => {
            const now = Date.now();
            const timeSinceLastKill = now - state.lastKillTime;

            // Combo system: kills within 1 second maintain combo
            let newCombo = state.combo;
            let bonusMultiplier = 1;

            if (timeSinceLastKill < 1000 && state.lastKillTime > 0) {
              newCombo = Math.min(state.combo + 1, 10); // Max 10x combo
              bonusMultiplier = 1 + newCombo * 0.1; // 10% bonus per combo level
            } else {
              newCombo = 1;
            }

            const totalPoints = Math.floor(points * bonusMultiplier);
            const newScore = state.score + totalPoints;

            // Check for extra life at threshold (original game feature)
            let newLives = state.lives;
            let extraLifeAwarded = state.extraLifeAwarded;
            if (
              !state.extraLifeAwarded &&
              state.score < EXTRA_LIFE.SCORE_THRESHOLD &&
              newScore >= EXTRA_LIFE.SCORE_THRESHOLD
            ) {
              newLives = Math.min(state.lives + 1, EXTRA_LIFE.MAX_LIVES);
              extraLifeAwarded = true;
              soundManager.play(SoundType.EXTRA_LIFE);
            }

            return {
              score: newScore,
              highScore: Math.max(newScore, state.highScore),
              combo: newCombo,
              lastKillTime: now,
              lives: newLives,
              extraLifeAwarded,
            };
          }),

        incrementWave: () =>
          set((state) => ({
            wave: state.wave + 1,
            combo: 0, // Reset combo between waves
          })),

        setLives: (lives) => set({ lives }),

        toggleSound: () =>
          set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

        resetGame: () =>
          set(() => ({
            score: 0,
            wave: 1,
            lives: 3,
            status: "PLAYING" as GameStatus,
            combo: 0,
            lastKillTime: 0,
            extraLifeAwarded: false, // Reset for new game
            // High score and sound settings persist
          })),
      }),
      {
        name: "space-invaders-storage",
        partialize: (state) => ({
          highScore: state.highScore,
          isSoundEnabled: state.isSoundEnabled,
        }),
      }
    ),
    { name: "GameStore" }
  )
);
