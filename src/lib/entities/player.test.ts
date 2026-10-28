import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PLAYER_PIXELS } from "./player";

describe("player sprite", () => {
  it("uses a consistent 16-column cannon", () => {
    for (const row of PLAYER_PIXELS) {
      assert.equal(row.length, 16);
    }
  });
});