// src/lib/entities/projectile.ts

import { Entity, EntityConfig } from "./entity";
import { GAME_DIMENSIONS, FRAME_TIME } from "../constants/game";
import { GAME_COLORS } from "@/lib/constants/colors";
import { RenderLayer } from "@/types/game";

const TRAIL_LENGTH = 8;

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface ProjectileConfig extends EntityConfig {
  velocity: { x: number; y: number };
  isPlayerProjectile: boolean;
}

export class Projectile extends Entity {
  isPlayerProjectile: boolean;
  // Pre-allocated ring buffer for trail points (avoids GC pressure)
  private trailBuffer: TrailPoint[] = Array.from(
    { length: TRAIL_LENGTH },
    () => ({
      x: 0,
      y: 0,
      alpha: 0,
    })
  );
  private trailHead: number = 0;
  private trailCount: number = 0;

  constructor(config: ProjectileConfig) {
    super(config);
    this.velocity = { ...config.velocity };
    this.isPlayerProjectile = config.isPlayerProjectile;
    this.renderLayer = RenderLayer.PROJECTILES;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / FRAME_TIME;

    // Add current position to ring buffer (reuse existing object)
    const point = this.trailBuffer[this.trailHead];
    point.x = this.position.x + this.dimensions.width / 2;
    point.y = this.position.y + this.dimensions.height / 2;
    point.alpha = 1;

    this.trailHead = (this.trailHead + 1) % TRAIL_LENGTH;
    if (this.trailCount < TRAIL_LENGTH) {
      this.trailCount++;
    }

    // Update alpha values for all trail points
    for (let i = 0; i < this.trailCount; i++) {
      const idx = (this.trailHead - 1 - i + TRAIL_LENGTH) % TRAIL_LENGTH;
      this.trailBuffer[idx].alpha = 1 - i / this.trailCount;
    }

    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Deactivate if out of bounds
    if (this.position.y < 0 || this.position.y > GAME_DIMENSIONS.HEIGHT) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY = this.position.y + this.dimensions.height / 2;
    const color = this.isPlayerProjectile
      ? GAME_COLORS.PROJECTILE_PLAYER
      : GAME_COLORS.PROJECTILE_ALIEN;

    ctx.save();

    // Draw trail from ring buffer
    if (this.trailCount > 1) {
      for (let i = 1; i < this.trailCount; i++) {
        const idx = (this.trailHead - 1 - i + TRAIL_LENGTH) % TRAIL_LENGTH;
        const prevIdx = (this.trailHead - i + TRAIL_LENGTH) % TRAIL_LENGTH;
        const point = this.trailBuffer[idx];
        const prevPoint = this.trailBuffer[prevIdx];

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = point.alpha * 0.5;
        ctx.lineWidth = this.dimensions.width * (1 - i / this.trailCount);
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    // Draw glow
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      this.dimensions.width * 3
    );
    glowGradient.addColorStop(0, `${color}88`);
    glowGradient.addColorStop(0.5, `${color}44`);
    glowGradient.addColorStop(1, "transparent");

    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      centerX - this.dimensions.width * 3,
      centerY - this.dimensions.height,
      this.dimensions.width * 6,
      this.dimensions.height * 2
    );

    // Draw projectile body with gradient
    const bodyGradient = ctx.createLinearGradient(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + this.dimensions.height
    );

    if (this.isPlayerProjectile) {
      bodyGradient.addColorStop(0, "#ffffff");
      bodyGradient.addColorStop(0.3, color);
      bodyGradient.addColorStop(1, `${color}88`);
    } else {
      bodyGradient.addColorStop(0, `${color}88`);
      bodyGradient.addColorStop(0.7, color);
      bodyGradient.addColorStop(1, "#ffffff");
    }

    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // Draw elongated shape
    ctx.beginPath();
    if (this.isPlayerProjectile) {
      // Player projectile - pointed top
      ctx.moveTo(centerX, this.position.y);
      ctx.lineTo(this.position.x + this.dimensions.width, this.position.y + 4);
      ctx.lineTo(
        this.position.x + this.dimensions.width,
        this.position.y + this.dimensions.height
      );
      ctx.lineTo(this.position.x, this.position.y + this.dimensions.height);
      ctx.lineTo(this.position.x, this.position.y + 4);
    } else {
      // Alien projectile - wavy/zigzag pattern
      const time = performance.now() * 0.01;
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x + this.dimensions.width, this.position.y);
      ctx.lineTo(
        this.position.x + this.dimensions.width + Math.sin(time) * 2,
        this.position.y + this.dimensions.height
      );
      ctx.lineTo(
        this.position.x + Math.sin(time) * 2,
        this.position.y + this.dimensions.height
      );
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
