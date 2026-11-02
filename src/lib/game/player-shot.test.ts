import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROJECTILE } from "@/lib/constants/game";
import { EntityManager } from "@/lib/game/EntityManager";

describe("player shot cap", () => {
  it("keeps a single player shot on screen", () => {
    const manager = new EntityManager();

    const first = manager.tryPlayerShot();
    assert.ok(first);
    assert.equal(first.isPlayerProjectile, true);
    assert.equal(manager.shotCount, 1);
    assert.equal(
      manager.projectiles.filter((projectile) => projectile.isPlayerProjectile)
        .length,
      PROJECTILE.CAPS.PLAYER_MAX
    );

    manager.player.lastShot = 0;
    assert.equal(manager.tryPlayerShot(), null);
    assert.equal(manager.shotCount, 1);

    manager.projectiles.length = 0;
    manager.player.lastShot = 0;
    const next = manager.tryPlayerShot();
    assert.ok(next);
    assert.equal(manager.shotCount, 2);
    assert.equal(
      manager.projectiles.filter((projectile) => projectile.isPlayerProjectile)
        .length,
      1
    );
  });
});
