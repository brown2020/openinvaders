import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GAME_STATES } from '@/lib/constants/game';

export type GameStatus = keyof typeof GAME_STATES;

interface GameState {
  // Game Status
  status: GameStatus;
  score: number;
  highScore: number;
  wave: number;
  lives: number;
  isSoundEnabled: boolean;

  // Actions
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  incrementScore: (points: number) => void;
  setHighScore: (score: number) => void;
  setWave: (wave: number) => void;
  incrementWave: () => void;
  setLives: (lives: number) => void;
  decrementLives: () => void;
  toggleSound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        status: 'MENU',
        score: 0,
        highScore: 0,
        wave: 1,
        lives: 3,
        isSoundEnabled: true,

        setStatus: (status) => set({ status }),
        setScore: (score) => set({ score }),
        incrementScore: (points) =>
          set((state) => {
            const newScore = state.score + points;
            return {
              score: newScore,
              highScore: Math.max(newScore, state.highScore),
            };
          }),
        setHighScore: (highScore) => set({ highScore }),
        setWave: (wave) => set({ wave }),
        incrementWave: () => set((state) => ({ wave: state.wave + 1 })),
        setLives: (lives) => set({ lives }),
        decrementLives: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
        toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
        resetGame: () =>
          set((state) => ({
            score: 0,
            wave: 1,
            lives: 3,
            status: 'PLAYING',
            // Highscore and sound settings persist
          })),
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({ highScore: state.highScore, isSoundEnabled: state.isSoundEnabled }), // Only persist high score and settings
      }
    )
  )
);

