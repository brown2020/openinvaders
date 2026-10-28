import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Player } from "@/lib/entities/player";
import { Projectile } from "@/lib/entities/projectile";
import { EntityManager } from "@/lib/game/EntityManager";
import { checkCollisions } from "@/lib/game/CollisionManager";
import { PROJECTILE } from "@/lib/constants/game";

describe("shared lives counter", () => {
  it("does not spend a life inside collision detection", () => {
    const player = new Player({
      position: { x: 100, y: 550 },
      dimensions: { width: 48, height: 32 },
    });
    player.lives = 2;
    const shot = new Projectile({
      position: { x: 110, y: 555 },
      dimensions: { width: 4, height: 14 },
      velocity: { x: 0, y: 1 },
      isPlayerProjectile: false,
    });

    const events = checkCollisions(player, [], [], [shot], null, 0);
    assert.equal(player.lives, 2);
    assert.equal(
      events.some((event) => event.type === "PLAYER_HIT"),
      true
    );
    assert.equal(
      events.some((event) => event.type === "GAME_OVER"),
      false
    );
  });

  it("keeps the store's life count when a wave rebuilds the ship", () => {
    const manager = new EntityManager();
    manager.reset(false, 1);
    assert.equal(manager.player.lives, 1);
    manager.reset(true, 3);
    assert.equal(manager.player.lives, 3);
  });

  it("never spawns more alien shots than the cap in one frame", () => {
    const manager = new EntityManager();
    const random = Math.random;
    Math.random = () => 0;
    try {
      manager.update(16, 0, 1);
      const alienShots = manager.projectiles.filter(
        (projectile) => !projectile.isPlayerProjectile
      );
      assert.equal(alienShots.length, PROJECTILE.CAPS.ALIEN_MAX);
    } finally {
      Math.random = random;
      manager.reset(true, 3);
    }
  });
});
