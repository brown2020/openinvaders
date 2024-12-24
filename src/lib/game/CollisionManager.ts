import { Player } from "@/lib/entities/player";
import { Alien } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { PLAYER } from "@/lib/constants/game";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

interface CollisionResult {
  alienKilled?: { alien: Alien; points: number };
  playerHit?: boolean;
  barrierHit?: { barrier: Barrier; projectile: Projectile };
  gameOver?: boolean;
}

export class CollisionManager {
  checkCollisions(
    player: Player,
    aliens: Alien[],
    barriers: Barrier[],
    projectiles: Projectile[]
  ): CollisionResult {
    const result: CollisionResult = {};

    // Check projectile collisions
    for (const projectile of projectiles) {
      if (projectile.isPlayerProjectile) {
        // Check alien hits
        for (const alien of aliens) {
          if (!alien.isDestroyed && projectile.collidesWith(alien)) {
            alien.isDestroyed = true;
            projectile.isActive = false;
            result.alienKilled = { alien, points: alien.points };
            soundManager.play(SoundType.ALIEN_KILLED);
            break;
          }
        }
      } else {
        // Alien projectile hits player
        if (projectile.collidesWith(player)) {
          projectile.isActive = false;
          player.lives--;
          result.playerHit = true;
          soundManager.play(SoundType.PLAYER_HIT);
          if (player.lives <= 0) {
            result.gameOver = true;
            soundManager.play(SoundType.GAME_OVER);
          }
        }
      }

      // Check barrier hits
      for (const barrier of barriers) {
        if (!barrier.isDestroyed && projectile.collidesWith(barrier)) {
          projectile.isActive = false;
          barrier.damage(projectile.position.x, projectile.position.y);
          result.barrierHit = { barrier, projectile };
          soundManager.play(SoundType.EXPLOSION);
          break;
        }
      }
    }

    // Check if aliens reached bottom
    for (const alien of aliens) {
      if (
        !alien.isDestroyed &&
        alien.position.y + alien.dimensions.height >= PLAYER.Y_POSITION
      ) {
        result.gameOver = true;
        soundManager.play(SoundType.GAME_OVER);
        break;
      }
    }

    return result;
  }
}
