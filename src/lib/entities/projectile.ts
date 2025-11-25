// src/lib/entities/projectile.ts

import { Entity, EntityConfig } from './entity';
import { PROJECTILE, GAME_DIMENSIONS } from '../constants/game';
import { RenderLayer, GAME_COLORS } from '@/types/game';

export interface ProjectileConfig extends EntityConfig {
  velocity: { x: number; y: number };
  isPlayerProjectile: boolean;
}

export class Projectile extends Entity {
  isPlayerProjectile: boolean;
  private trailPoints: { x: number; y: number; alpha: number }[] = [];

  constructor(config: ProjectileConfig) {
    super(config);
    this.velocity = { ...config.velocity };
    this.isPlayerProjectile = config.isPlayerProjectile;
    this.renderLayer = RenderLayer.PROJECTILES;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 16.67;

    // Add current position to trail
    this.trailPoints.unshift({
      x: this.position.x + this.dimensions.width / 2,
      y: this.position.y + this.dimensions.height / 2,
      alpha: 1,
    });

    // Limit trail length
    if (this.trailPoints.length > 8) {
      this.trailPoints.pop();
    }

    // Fade trail
    this.trailPoints.forEach((point, index) => {
      point.alpha = 1 - (index / this.trailPoints.length);
    });

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

    // Draw trail
    if (this.trailPoints.length > 1) {
      for (let i = 1; i < this.trailPoints.length; i++) {
        const point = this.trailPoints[i];
        const prevPoint = this.trailPoints[i - 1];
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = point.alpha * 0.5;
        ctx.lineWidth = this.dimensions.width * (1 - i / this.trailPoints.length);
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    // Draw glow
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, this.dimensions.width * 3
    );
    glowGradient.addColorStop(0, `${color}88`);
    glowGradient.addColorStop(0.5, `${color}44`);
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      centerX - this.dimensions.width * 3,
      centerY - this.dimensions.height,
      this.dimensions.width * 6,
      this.dimensions.height * 2
    );

    // Draw projectile body with gradient
    const bodyGradient = ctx.createLinearGradient(
      this.position.x, this.position.y,
      this.position.x, this.position.y + this.dimensions.height
    );
    
    if (this.isPlayerProjectile) {
      bodyGradient.addColorStop(0, '#ffffff');
      bodyGradient.addColorStop(0.3, color);
      bodyGradient.addColorStop(1, `${color}88`);
    } else {
      bodyGradient.addColorStop(0, `${color}88`);
      bodyGradient.addColorStop(0.7, color);
      bodyGradient.addColorStop(1, '#ffffff');
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
      ctx.lineTo(this.position.x + this.dimensions.width, this.position.y + this.dimensions.height);
      ctx.lineTo(this.position.x, this.position.y + this.dimensions.height);
      ctx.lineTo(this.position.x, this.position.y + 4);
    } else {
      // Alien projectile - wavy/zigzag pattern
      const time = performance.now() * 0.01;
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x + this.dimensions.width, this.position.y);
      ctx.lineTo(this.position.x + this.dimensions.width + Math.sin(time) * 2, 
                 this.position.y + this.dimensions.height);
      ctx.lineTo(this.position.x + Math.sin(time) * 2, 
                 this.position.y + this.dimensions.height);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
