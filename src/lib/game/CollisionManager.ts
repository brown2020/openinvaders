// src/lib/game/CollisionManager.ts

import { Player } from "@/lib/entities/player";
import { Alien } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { Ufo, getUfoScore } from "@/lib/entities/ufo";
import { PLAYER } from "@/lib/constants/game";
import { CollisionEvent } from "@/types/game";

/** Stored shot count for UFO scoring (set via checkCollisions) */
let currentShotCount = 0;

/**
 * Check all collisions and return events
 * @param shotCount - Player shot count for deterministic UFO scoring
 */
export function checkCollisions(
  player: Player,
  aliens: Alien[],
  barriers: Barrier[],
  projectiles: Projectile[],
  ufo: Ufo | null,
  shotCount: number = 0
): CollisionEvent[] {
  const events: CollisionEvent[] = [];
  currentShotCount = shotCount;

  // Check projectile collisions
  checkProjectileCollisions(player, aliens, barriers, projectiles, ufo, events);

  // Check if aliens are marching through barriers (original game feature)
  checkAlienBarrierCollisions(aliens, barriers);

  // Check if aliens reached the bottom
  checkAlienLanding(aliens, events);

  return events;
}

function checkProjectileCollisions(
  player: Player,
  aliens: Alien[],
  barriers: Barrier[],
  projectiles: Projectile[],
  ufo: Ufo | null,
  events: CollisionEvent[]
): void {
  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];
    if (!projectile.isActive) continue;

    if (projectile.isPlayerProjectile) {
      checkPlayerProjectileHits(projectile, aliens, ufo, barriers, events);
    } else {
      checkAlienProjectileHits(projectile, player, barriers, events);
    }
  }
}

function checkPlayerProjectileHits(
  projectile: Projectile,
  aliens: Alien[],
  ufo: Ufo | null,
  barriers: Barrier[],
  events: CollisionEvent[]
): void {
  // Check alien hits
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i];
    if (!alien.isDestroyed && projectile.collidesWith(alien)) {
      alien.isDestroyed = true;
      projectile.isActive = false;

      events.push({
        type: "ALIEN_KILLED",
        payload: { alienType: alien.type },
        points: alien.points,
        position: {
          x: alien.position.x + alien.dimensions.width / 2,
          y: alien.position.y + alien.dimensions.height / 2,
        },
      });
      return;
    }
  }

  // Check UFO hit
  if (ufo && ufo.isActive && projectile.collidesWith(ufo)) {
    projectile.isActive = false;
    ufo.isActive = false;

    // Use deterministic scoring based on shot count (original game mechanic)
    const points = getUfoScore(currentShotCount);
    events.push({
      type: "UFO_KILLED",
      points,
      position: {
        x: ufo.position.x + ufo.dimensions.width / 2,
        y: ufo.position.y + ufo.dimensions.height / 2,
      },
    });
    return;
  }

  // Check barrier hits
  checkBarrierHit(projectile, barriers, events);
}

function checkAlienProjectileHits(
  projectile: Projectile,
  player: Player,
  barriers: Barrier[],
  events: CollisionEvent[]
): void {
  // Check player hit (skip if invincible)
  if (!player.isInvincible() && projectile.collidesWith(player)) {
    projectile.isActive = false;
    player.lives--;
    player.triggerHitEffect();
    player.setInvincible(1500); // 1.5 second invincibility

    events.push({
      type: "PLAYER_HIT",
      payload: { lives: player.lives },
      position: {
        x: player.position.x + player.dimensions.width / 2,
        y: player.position.y,
      },
    });

    if (player.lives <= 0) {
      events.push({ type: "GAME_OVER" });
    }
    return;
  }

  // Check barrier hits
  checkBarrierHit(projectile, barriers, events);
}

function checkBarrierHit(
  projectile: Projectile,
  barriers: Barrier[],
  events: CollisionEvent[]
): void {
  if (!projectile.isActive) return;

  for (let i = 0; i < barriers.length; i++) {
    const barrier = barriers[i];
    if (!barrier.isDestroyed && projectile.collidesWith(barrier)) {
      // Check pixel-level collision
      const hitX = projectile.position.x + projectile.dimensions.width / 2;
      const hitY = projectile.isPlayerProjectile
        ? projectile.position.y
        : projectile.position.y + projectile.dimensions.height;

      if (barrier.hitsPixel(hitX, hitY)) {
        projectile.isActive = false;
        barrier.damage(hitX, hitY, 5);

        events.push({
          type: "BARRIER_HIT",
          payload: { destroyed: barrier.isDestroyed },
          position: { x: hitX, y: hitY },
        });
        return;
      }
    }
  }
}

/**
 * Check if aliens are marching through barriers (original game feature)
 * Aliens destroy barrier pixels as they overlap
 */
function checkAlienBarrierCollisions(
  aliens: Alien[],
  barriers: Barrier[]
): void {
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i];
    if (alien.isDestroyed) continue;

    for (let j = 0; j < barriers.length; j++) {
      const barrier = barriers[j];
      if (barrier.isDestroyed) continue;

      // Check if alien overlaps with barrier
      if (alien.collidesWith(barrier)) {
        // Damage the barrier in the overlapping area
        const overlapLeft = Math.max(alien.position.x, barrier.position.x);
        const overlapRight = Math.min(
          alien.position.x + alien.dimensions.width,
          barrier.position.x + barrier.dimensions.width
        );
        const overlapTop = Math.max(alien.position.y, barrier.position.y);
        const overlapBottom = Math.min(
          alien.position.y + alien.dimensions.height,
          barrier.position.y + barrier.dimensions.height
        );

        // Damage multiple points in the overlap area
        const centerX = (overlapLeft + overlapRight) / 2;
        const centerY = (overlapTop + overlapBottom) / 2;
        barrier.damage(centerX, centerY, 8);
      }
    }
  }
}

function checkAlienLanding(aliens: Alien[], events: CollisionEvent[]): void {
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i];
    if (
      !alien.isDestroyed &&
      alien.position.y + alien.dimensions.height >= PLAYER.Y_POSITION
    ) {
      events.push({ type: "ALIEN_LANDED" });
      events.push({ type: "GAME_OVER" });
      return;
    }
  }
}
