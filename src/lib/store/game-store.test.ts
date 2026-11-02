import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";

const memory = new Map<string, string>();
if (typeof globalThis.window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
}
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: () => null,
    length: 0,
  },
});

let useGameStore: typeof import("./game-store").useGameStore;

describe("life and score counter", () => {
  before(async () => {
    ({ useGameStore } = await import("./game-store"));
  });

  beforeEach(() => {
    useGameStore.setState({
      score: 0,
      lives: 3,
      extraLifeAwarded: false,
      lastKillTime: 0,
      combo: 0,
      highScore: 0,
      wave: 1,
    });
  });

  it("adds the extra life on the same counter a hit spends", () => {
    useGameStore.setState({ score: 1490, lives: 2 });
    const awarded = useGameStore.getState().incrementScore(20);
    assert.equal(awarded, 20);
    assert.equal(useGameStore.getState().lives, 3);
    assert.equal(useGameStore.getState().score, 1510);

    assert.equal(useGameStore.getState().loseLife(), 2);
    assert.equal(useGameStore.getState().lives, 2);
  });

  it("starts, pauses, ends, and restarts without dropping the high score", () => {
    useGameStore.setState({
      status: "MENU",
      score: 250,
      highScore: 400,
      wave: 4,
      lives: 1,
      isSoundEnabled: true,
      combo: 3,
      lastKillTime: 1,
      extraLifeAwarded: true,
    });

    useGameStore.getState().resetGame();
    const playing = useGameStore.getState();
    assert.equal(playing.status, "PLAYING");
    assert.equal(playing.score, 0);
    assert.equal(playing.wave, 1);
    assert.equal(playing.lives, 3);
    assert.equal(playing.combo, 0);
    assert.equal(playing.lastKillTime, 0);
    assert.equal(playing.extraLifeAwarded, false);
    assert.equal(playing.highScore, 400);
    assert.equal(playing.isSoundEnabled, true);

    useGameStore.getState().setStatus("PAUSED");
    assert.equal(useGameStore.getState().status, "PAUSED");
    assert.equal(useGameStore.getState().score, 0);

    useGameStore.getState().setStatus("PLAYING");
    useGameStore.getState().setStatus("GAME_OVER");
    assert.equal(useGameStore.getState().status, "GAME_OVER");
    assert.equal(useGameStore.getState().highScore, 400);

    useGameStore.getState().resetGame();
    assert.equal(useGameStore.getState().status, "PLAYING");
    assert.equal(useGameStore.getState().score, 0);
    assert.equal(useGameStore.getState().lives, 3);
    assert.equal(useGameStore.getState().highScore, 400);

    useGameStore.getState().toggleSound();
    assert.equal(useGameStore.getState().isSoundEnabled, false);
  });

  it("returns combo-adjusted points and stops at zero lives", () => {
    useGameStore.getState().incrementScore(10);
    const comboAward = useGameStore.getState().incrementScore(10);
    assert.equal(comboAward, 12);
    assert.equal(useGameStore.getState().score, 22);

    useGameStore.setState({ lives: 1 });
    assert.equal(useGameStore.getState().loseLife(), 0);
    assert.equal(useGameStore.getState().loseLife(), 0);
  });
});
