import { Player } from "@/lib/entities/player";
import { Alien } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { Ufo, getUfoScore } from "@/lib/entities/ufo";
import { PLAYER } from "@/lib/constants/game";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

export interface CollisionEvent {
  type: 'ALIEN_KILLED' | 'PLAYER_HIT' | 'BARRIER_HIT' | 'UFO_KILLED' | 'GAME_OVER' | 'ALIEN_LANDED';
  payload?: any;
  points?: number;
  position?: { x: number; y: number };
}

export class CollisionManager {
  checkCollisions(
    player: Player,
    aliens: Alien[],
    barriers: Barrier[],
    projectiles: Projectile[],
    ufo: Ufo | null
  ): CollisionEvent[] {
    const events: CollisionEvent[] = [];

    // Check projectile collisions
    for (const projectile of projectiles) {
      if (!projectile.isActive) continue;

      if (projectile.isPlayerProjectile) {
        // Check alien hits
        let hitAlien = false;
        for (const alien of aliens) {
          if (!alien.isDestroyed && projectile.collidesWith(alien)) {
            alien.isDestroyed = true;
            projectile.isActive = false;
            events.push({
              type: 'ALIEN_KILLED',
              payload: { alien },
              points: alien.points,
              position: { x: alien.position.x, y: alien.position.y }
            });
            soundManager.play(SoundType.ALIEN_KILLED);
            hitAlien = true;
            break;
          }
        }
        if (hitAlien) continue;

        // Check UFO hit
        if (ufo && ufo.isActive && projectile.collidesWith(ufo)) {
          projectile.isActive = false;
          const points = getUfoScore();
          events.push({
            type: 'UFO_KILLED',
            payload: { ufo },
            points,
            position: { x: ufo.position.x, y: ufo.position.y }
          });
          soundManager.play(SoundType.EXPLOSION);
          ufo.isActive = false; // Mark for cleanup
        }

      } else {
        // Alien projectile hits player
        if (projectile.collidesWith(player)) {
          projectile.isActive = false;
          player.lives--;
          events.push({
            type: 'PLAYER_HIT',
            payload: { lives: player.lives }
          });
          soundManager.play(SoundType.PLAYER_HIT);
          if (player.lives <= 0) {
            events.push({ type: 'GAME_OVER' });
            soundManager.play(SoundType.GAME_OVER);
          }
        }
      }

      // Check barrier hits (both player and alien projectiles)
      if (projectile.isActive) {
        for (const barrier of barriers) {
          if (!barrier.isDestroyed && projectile.collidesWith(barrier)) {
            projectile.isActive = false;
            barrier.damage(projectile.position.x, projectile.position.y);
            events.push({
              type: 'BARRIER_HIT',
              payload: { barrier }
            });
            soundManager.play(SoundType.EXPLOSION);
            break;
          }
        }
      }
    }

    // Check if aliens reached bottom
    for (const alien of aliens) {
      if (
        !alien.isDestroyed &&
        alien.position.y + alien.dimensions.height >= PLAYER.Y_POSITION
      ) {
        events.push({ type: 'ALIEN_LANDED' });
        events.push({ type: 'GAME_OVER' });
        soundManager.play(SoundType.GAME_OVER);
        break;
      }
    }

    return events;
  }
}
