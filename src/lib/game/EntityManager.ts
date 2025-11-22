import { Player } from "@/lib/entities/player";
import { Alien, AlienFormation } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { Ufo } from "@/lib/entities/ufo";
import { GAME_DIMENSIONS, PLAYER, ALIEN, BARRIER, UFO, PROJECTILE } from "@/lib/constants/game";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

export class EntityManager {
  player: Player;
  aliens: Alien[];
  barriers: Barrier[];
  projectiles: Projectile[];
  ufo: Ufo | null;
  nextUfoSpawnTime: number;

  constructor() {
    this.player = this.createPlayer();
    this.aliens = this.createAliens();
    this.barriers = this.createBarriers();
    this.projectiles = [];
    this.ufo = null;
    this.nextUfoSpawnTime = 0;
  }

  private createPlayer(): Player {
    return new Player({
      position: {
        x: GAME_DIMENSIONS.WIDTH / 2 - PLAYER.WIDTH / 2,
        y: PLAYER.Y_POSITION,
      },
      dimensions: {
        width: PLAYER.WIDTH,
        height: PLAYER.HEIGHT,
      },
    });
  }

  private createAliens(): Alien[] {
    const aliens: Alien[] = [];
    for (let row = 0; row < ALIEN.ROWS; row++) {
      for (let col = 0; col < ALIEN.COLS; col++) {
        const type = row === 0 ? "TOP" : row < 3 ? "MIDDLE" : "BOTTOM";
        const formationPosition = {
          x: col * ALIEN.HORIZONTAL_SPACING + GAME_DIMENSIONS.MARGIN,
          y: row * ALIEN.VERTICAL_SPACING + ALIEN.INITIAL_Y,
        };

        aliens.push(
          new Alien({
            type,
            row,
            column: col,
            formationPosition,
            position: { ...formationPosition },
            dimensions: {
              width: ALIEN.WIDTH,
              height: ALIEN.HEIGHT,
            },
          })
        );
      }
    }
    return aliens;
  }

  private createBarriers(): Barrier[] {
    const barriers: Barrier[] = [];
    const barrierSpacing =
      (GAME_DIMENSIONS.WIDTH - BARRIER.COUNT * BARRIER.WIDTH) /
      (BARRIER.COUNT + 1);

    for (let i = 0; i < BARRIER.COUNT; i++) {
      barriers.push(
        new Barrier({
          position: {
            x: barrierSpacing + (barrierSpacing + BARRIER.WIDTH) * i,
            y: BARRIER.Y_POSITION,
          },
          dimensions: {
            width: BARRIER.WIDTH,
            height: BARRIER.HEIGHT,
          },
        })
      );
    }
    return barriers;
  }

  update(deltaTime: number, timestamp: number, wave: number): void {
    // Update player
    this.player.update(deltaTime);

    // Update alien formation
    AlienFormation.update(this.aliens, deltaTime);

    // Update individual aliens and handle shooting
    const alienShots = this.projectiles.filter(p => !p.isPlayerProjectile).length;
    
    this.aliens.forEach((alien) => {
      if (!alien.isDestroyed) {
        alien.update(deltaTime);

        // Alien shooting
        if (
          Math.random() < (ALIEN.BASE_SHOOT_CHANCE + ALIEN.WAVE_SHOOT_MULTIPLIER * wave) * (deltaTime / 1000) &&
          alien.canShoot(this.aliens) &&
          alienShots < PROJECTILE.CAPS.ALIEN_MAX
        ) {
          this.projectiles.push(alien.shoot());
          soundManager.play(SoundType.SHOOT);
        }
      }
    });

    // Update barriers
    this.barriers.forEach((barrier) => {
      if (!barrier.isDestroyed) {
        barrier.update(deltaTime);
      }
    });

    // Update UFO
    if (timestamp >= this.nextUfoSpawnTime && !this.ufo) {
        // Initial spawn time check or respawn
        if (this.nextUfoSpawnTime === 0) {
             this.nextUfoSpawnTime = timestamp + (UFO.MIN_SPAWN_MS + Math.random() * (UFO.MAX_SPAWN_MS - UFO.MIN_SPAWN_MS));
        } else {
            const fromLeft = Math.random() < 0.5;
            this.ufo = new Ufo({ fromLeft });
        }
    }

    if (this.ufo) {
      this.ufo.update(deltaTime);
      if (!this.ufo.isActive) {
        this.ufo = null;
        this.nextUfoSpawnTime = timestamp + (UFO.MIN_SPAWN_MS + Math.random() * (UFO.MAX_SPAWN_MS - UFO.MIN_SPAWN_MS));
      }
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.update(deltaTime);
      return (
        projectile.isActive &&
        projectile.position.y >= 0 &&
        projectile.position.y <= GAME_DIMENSIONS.HEIGHT
      );
    });
  }

  reset(fullReset: boolean = false): void {
    if (fullReset) {
         this.barriers = this.createBarriers();
    }
    this.player = this.createPlayer(); // Always reset player position
    this.aliens = this.createAliens();
    this.projectiles = [];
    this.ufo = null;
    this.nextUfoSpawnTime = performance.now() + (UFO.MIN_SPAWN_MS + Math.random() * (UFO.MAX_SPAWN_MS - UFO.MIN_SPAWN_MS));
    AlienFormation.reset();
  }

  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
  }
}
