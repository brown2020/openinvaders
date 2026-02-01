// src/lib/game/EntityManager.ts

import { Player } from "@/lib/entities/player";
import { Alien, alienFormation } from "@/lib/entities/alien";
import { Barrier } from "@/lib/entities/barrier";
import { Projectile } from "@/lib/entities/projectile";
import { Ufo } from "@/lib/entities/ufo";
import {
  GAME_DIMENSIONS,
  PLAYER,
  ALIEN,
  BARRIER,
  UFO,
  PROJECTILE,
} from "@/lib/constants/game";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";
import { Entity } from "@/lib/entities/entity";

/**
 * Manages all game entities and their lifecycle
 */
export class EntityManager {
  player: Player;
  aliens: Alien[];
  barriers: Barrier[];
  projectiles: Projectile[];
  ufo: Ufo | null;
  private nextUfoSpawnTime: number;
  /** Track player shot count for deterministic UFO scoring (original game mechanic) */
  shotCount: number;

  constructor() {
    this.player = this.createPlayer();
    this.aliens = this.createAliens();
    this.barriers = this.createBarriers();
    this.projectiles = [];
    this.ufo = null;
    this.nextUfoSpawnTime = this.getNextUfoSpawnTime();
    this.shotCount = 0;
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

  private getNextUfoSpawnTime(): number {
    return (
      performance.now() +
      UFO.MIN_SPAWN_MS +
      Math.random() * (UFO.MAX_SPAWN_MS - UFO.MIN_SPAWN_MS)
    );
  }

  /**
   * Update all entities
   */
  update(deltaTime: number, timestamp: number, wave: number): void {
    // Update player
    this.player.update(deltaTime);

    // Update alien formation movement
    alienFormation.update(this.aliens, deltaTime);

    // Update individual aliens and handle shooting
    this.updateAliens(deltaTime, wave);

    // Update barriers
    this.barriers.forEach((barrier) => {
      if (!barrier.isDestroyed) {
        barrier.update(deltaTime);
      }
    });

    // Handle UFO spawning and updates
    this.updateUfo(deltaTime, timestamp);

    // Update and filter projectiles
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.update(deltaTime);
      return (
        projectile.isActive &&
        projectile.position.y >= 0 &&
        projectile.position.y <= GAME_DIMENSIONS.HEIGHT
      );
    });
  }

  private updateAliens(deltaTime: number, wave: number): void {
    const alienShots = this.projectiles.filter(
      (p) => !p.isPlayerProjectile
    ).length;

    this.aliens.forEach((alien) => {
      if (!alien.isDestroyed) {
        alien.update(deltaTime);

        // Alien shooting logic
        const shootChance =
          (ALIEN.BASE_SHOOT_CHANCE + ALIEN.WAVE_SHOOT_MULTIPLIER * wave) *
          (deltaTime / 1000);

        if (
          Math.random() < shootChance &&
          alien.canShoot(this.aliens) &&
          alienShots < PROJECTILE.CAPS.ALIEN_MAX
        ) {
          this.projectiles.push(alien.shoot());
          soundManager.play(SoundType.SHOOT);
        }
      }
    });
  }

  private updateUfo(deltaTime: number, timestamp: number): void {
    // Spawn UFO if it's time
    if (!this.ufo && timestamp >= this.nextUfoSpawnTime) {
      const fromLeft = Math.random() < 0.5;
      this.ufo = new Ufo({ fromLeft });
      // Start UFO flying sound (authentic warbling sound)
      soundManager.play(SoundType.UFO_FLYING);
    }

    // Update UFO
    if (this.ufo) {
      this.ufo.update(deltaTime);

      if (!this.ufo.isActive) {
        // Stop UFO flying sound when it exits screen
        soundManager.stop(SoundType.UFO_FLYING);
        this.ufo = null;
        this.nextUfoSpawnTime = this.getNextUfoSpawnTime();
      }
    }
  }

  /**
   * Add a projectile to the game
   * Tracks player shot count for deterministic UFO scoring
   */
  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
    // Track player shots for UFO scoring (original game mechanic)
    if (projectile.isPlayerProjectile) {
      this.shotCount++;
    }
  }

  // Reusable array to avoid allocations
  private entityBuffer: Entity[] = [];

  /**
   * Get all active entities for rendering
   * Uses a reusable buffer to minimize allocations
   * Entities are added in render layer order to avoid sorting
   */
  getAllEntities(): Entity[] {
    // Clear buffer without reallocating
    this.entityBuffer.length = 0;

    // Add entities in render layer order (BARRIERS=2, PROJECTILES=3, ALIENS=4, UFO=5, PLAYER=6)

    // Add barriers (layer 2)
    for (let i = 0; i < this.barriers.length; i++) {
      if (!this.barriers[i].isDestroyed) {
        this.entityBuffer.push(this.barriers[i]);
      }
    }

    // Add projectiles (layer 3)
    for (let i = 0; i < this.projectiles.length; i++) {
      if (this.projectiles[i].isActive) {
        this.entityBuffer.push(this.projectiles[i]);
      }
    }

    // Add aliens (layer 4)
    for (let i = 0; i < this.aliens.length; i++) {
      if (!this.aliens[i].isDestroyed) {
        this.entityBuffer.push(this.aliens[i]);
      }
    }

    // Add UFO (layer 5)
    if (this.ufo && this.ufo.isActive) {
      this.entityBuffer.push(this.ufo);
    }

    // Add player (layer 6)
    this.entityBuffer.push(this.player);

    return this.entityBuffer;
  }

  /**
   * Get count of alive aliens
   */
  getAliveAlienCount(): number {
    let count = 0;
    for (let i = 0; i < this.aliens.length; i++) {
      if (!this.aliens[i].isDestroyed) count++;
    }
    return count;
  }

  /**
   * Check if all aliens are destroyed
   */
  areAllAliensDestroyed(): boolean {
    return this.getAliveAlienCount() === 0;
  }

  /**
   * Reset entities for new wave or game restart
   */
  reset(fullReset: boolean = false): void {
    if (fullReset) {
      this.barriers = this.createBarriers();
    }

    this.player = this.createPlayer();
    this.aliens = this.createAliens();
    this.projectiles = [];
    this.ufo = null;
    this.nextUfoSpawnTime = this.getNextUfoSpawnTime();
    alienFormation.reset();
    soundManager.resetMarchCycle();
    if (fullReset) {
      this.shotCount = 0;
    }
  }
}
