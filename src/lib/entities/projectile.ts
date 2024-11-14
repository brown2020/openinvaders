// src/lib/entities/projectile.ts
import { Entity, EntityConfig } from "./entity";
import { PROJECTILE, GAME_DIMENSIONS } from "../constants/game";

export interface ProjectileConfig extends EntityConfig {
  velocity: { x: number; y: number };
  isPlayerProjectile: boolean;
}

export class Projectile extends Entity {
  isPlayerProjectile: boolean;

  constructor(config: ProjectileConfig) {
    super(config);
    this.velocity = config.velocity;
    this.isPlayerProjectile = config.isPlayerProjectile;
  }

  update(deltaTime: number): void {
    const frameVelocityX = (this.velocity.x * deltaTime) / 16.67;
    const frameVelocityY = (this.velocity.y * deltaTime) / 16.67;

    this.position.x += frameVelocityX;
    this.position.y += frameVelocityY;

    if (this.position.y < 0 || this.position.y > GAME_DIMENSIONS.HEIGHT) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.isPlayerProjectile
      ? PROJECTILE.PLAYER.COLOR
      : PROJECTILE.ALIEN.COLOR;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.dimensions.width,
      this.dimensions.height
    );
  }
}
