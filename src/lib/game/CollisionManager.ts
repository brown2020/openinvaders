// src/lib/game/CollisionManager.ts

import { Player } from '@/lib/entities/player';
import { Alien } from '@/lib/entities/alien';
import { Barrier } from '@/lib/entities/barrier';
import { Projectile } from '@/lib/entities/projectile';
import { Ufo, getUfoScore } from '@/lib/entities/ufo';
import { PLAYER } from '@/lib/constants/game';
import { soundManager } from '@/lib/sounds/SoundManager';
import { SoundType } from '@/lib/sounds/SoundTypes';
import { CollisionEvent, Position } from '@/types/game';

/**
 * Handles all collision detection and resolution
 */
export class CollisionManager {
  /**
   * Check all collisions and return events
   */
  checkCollisions(
    player: Player,
    aliens: Alien[],
    barriers: Barrier[],
    projectiles: Projectile[],
    ufo: Ufo | null
  ): CollisionEvent[] {
    const events: CollisionEvent[] = [];

    // Check projectile collisions
    this.checkProjectileCollisions(player, aliens, barriers, projectiles, ufo, events);

    // Check if aliens reached the bottom
    this.checkAlienLanding(aliens, events);

    return events;
  }

  private checkProjectileCollisions(
    player: Player,
    aliens: Alien[],
    barriers: Barrier[],
    projectiles: Projectile[],
    ufo: Ufo | null,
    events: CollisionEvent[]
  ): void {
    for (const projectile of projectiles) {
      if (!projectile.isActive) continue;

      if (projectile.isPlayerProjectile) {
        // Player projectiles can hit aliens, UFO, and barriers
        this.checkPlayerProjectileHits(projectile, aliens, ufo, barriers, events);
      } else {
        // Alien projectiles can hit player and barriers
        this.checkAlienProjectileHits(projectile, player, barriers, events);
      }
    }
  }

  private checkPlayerProjectileHits(
    projectile: Projectile,
    aliens: Alien[],
    ufo: Ufo | null,
    barriers: Barrier[],
    events: CollisionEvent[]
  ): void {
    // Check alien hits
    for (const alien of aliens) {
      if (!alien.isDestroyed && projectile.collidesWith(alien)) {
        alien.isDestroyed = true;
        projectile.isActive = false;
        
        events.push({
          type: 'ALIEN_KILLED',
          payload: { alien, alienType: alien.type },
          points: alien.points,
          position: { x: alien.position.x + alien.dimensions.width / 2, y: alien.position.y + alien.dimensions.height / 2 },
        });
        
        soundManager.play(SoundType.ALIEN_KILLED);
        return;
      }
    }

    // Check UFO hit
    if (ufo && ufo.isActive && projectile.collidesWith(ufo)) {
      projectile.isActive = false;
      ufo.isActive = false;
      
      const points = getUfoScore();
      events.push({
        type: 'UFO_KILLED',
        payload: { ufo },
        points,
        position: { x: ufo.position.x + ufo.dimensions.width / 2, y: ufo.position.y + ufo.dimensions.height / 2 },
      });
      
      soundManager.play(SoundType.EXPLOSION);
      return;
    }

    // Check barrier hits
    this.checkBarrierHit(projectile, barriers, events);
  }

  private checkAlienProjectileHits(
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
        type: 'PLAYER_HIT',
        payload: { lives: player.lives },
        position: { x: player.position.x + player.dimensions.width / 2, y: player.position.y },
      });
      
      soundManager.play(SoundType.PLAYER_HIT);

      if (player.lives <= 0) {
        events.push({ type: 'GAME_OVER' });
        soundManager.play(SoundType.GAME_OVER);
      }
      return;
    }

    // Check barrier hits
    this.checkBarrierHit(projectile, barriers, events);
  }

  private checkBarrierHit(
    projectile: Projectile,
    barriers: Barrier[],
    events: CollisionEvent[]
  ): void {
    if (!projectile.isActive) return;

    for (const barrier of barriers) {
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
            type: 'BARRIER_HIT',
            payload: { barrier, destroyed: barrier.isDestroyed },
            position: { x: hitX, y: hitY },
          });
          
          soundManager.play(SoundType.EXPLOSION);
          return;
        }
      }
    }
  }

  private checkAlienLanding(aliens: Alien[], events: CollisionEvent[]): void {
    for (const alien of aliens) {
      if (
        !alien.isDestroyed &&
        alien.position.y + alien.dimensions.height >= PLAYER.Y_POSITION
      ) {
        events.push({ type: 'ALIEN_LANDED' });
        events.push({ type: 'GAME_OVER' });
        soundManager.play(SoundType.GAME_OVER);
        return;
      }
    }
  }
}
