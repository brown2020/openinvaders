import { useState, useCallback } from "react";
import { GAME_STATES } from "@/lib/constants/game";

type GameState = keyof typeof GAME_STATES;

interface GameStateHook {
  gameState: GameState;
  score: number;
  highScore: number;
  wave: number;
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  incrementWave: () => void;
  resetGame: () => void;
}

export function useGameState(): GameStateHook {
  const [gameState, setGameState] = useState<GameState>(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);

  const incrementScore = useCallback(
    (points: number) => {
      setScore((prevScore) => {
        const newScore = prevScore + points;
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });
    },
    [highScore]
  );

  const incrementWave = useCallback(() => {
    setWave((prev) => prev + 1);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setWave(1);
    setGameState(GAME_STATES.PLAYING);
  }, []);

  return {
    gameState,
    score,
    highScore,
    wave,
    setGameState,
    incrementScore,
    incrementWave,
    resetGame,
  };
}
