// src/lib/entities/player.ts
import { Entity, EntityConfig } from "./entity";
import { GAME_DIMENSIONS, PLAYER, PROJECTILE } from "../constants/game";
import { Projectile, ProjectileConfig } from "./projectile";

export class Player extends Entity {
  lives: number;
  score: number;
  lastShot: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;

  constructor(config: EntityConfig) {
    super(config);
    this.lives = PLAYER.INITIAL_LIVES;
    this.score = 0;
    this.lastShot = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  update(deltaTime: number): void {
    const frameSpeed = (PLAYER.SPEED * deltaTime) / 16.67;

    if (this.isMovingLeft) {
      this.position.x = Math.max(
        GAME_DIMENSIONS.MARGIN,
        this.position.x - frameSpeed
      );
    }
    if (this.isMovingRight) {
      this.position.x = Math.min(
        GAME_DIMENSIONS.WIDTH - GAME_DIMENSIONS.MARGIN - this.dimensions.width,
        this.position.x + frameSpeed
      );
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
    } else {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
    }
  }

  shoot(): Projectile | null {
    const now = Date.now();
    if (now - this.lastShot >= PLAYER.SHOOT_COOLDOWN) {
      this.lastShot = now;
      const projectileConfig: ProjectileConfig = {
        position: {
          x:
            this.position.x +
            this.dimensions.width / 2 -
            PROJECTILE.PLAYER.WIDTH / 2,
          y: this.position.y,
        },
        dimensions: {
          width: PROJECTILE.PLAYER.WIDTH,
          height: PROJECTILE.PLAYER.HEIGHT,
        },
        velocity: { x: 0, y: PROJECTILE.PLAYER.SPEED },
        isPlayerProjectile: true,
      };
      return new Projectile(projectileConfig);
    }
    return null;
  }
}
