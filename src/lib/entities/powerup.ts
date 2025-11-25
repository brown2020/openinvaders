// src/lib/entities/powerup.ts

import { Entity, EntityConfig } from './entity';
import { POWERUP, PowerUpType } from '../constants/powerups';
import { RenderLayer, GAME_COLORS } from '@/types/game';
import { GAME_DIMENSIONS } from '../constants/game';

interface PowerUpConfig {
  type: PowerUpType;
  position: { x: number; y: number };
}

const POWERUP_COLORS: Record<PowerUpType, { bg: string; icon: string }> = {
  SHIELD: { bg: '#00ffff', icon: 'S' },
  MULTI_SHOT: { bg: '#ff00ff', icon: 'M' },
  SPEED_BOOST: { bg: '#ffff00', icon: '⚡' },
};

/**
 * Power-up entity that falls from destroyed aliens
 */
export class PowerUp extends Entity {
  readonly type: PowerUpType;
  private pulsePhase: number = 0;
  private rotationAngle: number = 0;

  constructor({ type, position }: PowerUpConfig) {
    super({
      position,
      dimensions: {
        width: POWERUP.WIDTH,
        height: POWERUP.HEIGHT,
      },
    });
    this.type = type;
    this.isActive = true;
    this.renderLayer = RenderLayer.PARTICLES;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    const dt = deltaTime / 16.67;

    // Move downward
    this.position.y += POWERUP.FALL_SPEED * dt;

    // Animate
    this.pulsePhase += deltaTime * 0.005;
    this.rotationAngle += deltaTime * 0.002;

    // Deactivate if off screen
    if (this.position.y > GAME_DIMENSIONS.HEIGHT + this.dimensions.height) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY = this.position.y + this.dimensions.height / 2;
    const { bg: color, icon } = POWERUP_COLORS[this.type];
    const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.15;
    const radius = (this.dimensions.width / 2) * pulseFactor;

    ctx.save();

    // Draw outer glow
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 2
    );
    glowGradient.addColorStop(0, `${color}66`);
    glowGradient.addColorStop(0.5, `${color}33`);
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw main circle with gradient
    const mainGradient = ctx.createRadialGradient(
      centerX - 3, centerY - 3, 0,
      centerX, centerY, radius
    );
    mainGradient.addColorStop(0, '#ffffff');
    mainGradient.addColorStop(0.3, color);
    mainGradient.addColorStop(1, this.darkenColor(color, 0.5));

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = mainGradient;
    ctx.fill();

    // Draw icon
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, centerX, centerY);

    // Draw sparkle effect
    this.drawSparkles(ctx, centerX, centerY, radius, color);

    ctx.restore();
  }

  private drawSparkles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ): void {
    const sparkleCount = 4;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    for (let i = 0; i < sparkleCount; i++) {
      const angle = this.rotationAngle + (i * Math.PI * 2) / sparkleCount;
      const sparkleRadius = radius * 1.5;
      const sparkleX = x + Math.cos(angle) * sparkleRadius;
      const sparkleY = y + Math.sin(angle) * sparkleRadius;
      const sparkleSize = 3 + Math.sin(this.pulsePhase + i) * 2;

      ctx.beginPath();
      ctx.moveTo(sparkleX - sparkleSize, sparkleY);
      ctx.lineTo(sparkleX + sparkleSize, sparkleY);
      ctx.moveTo(sparkleX, sparkleY - sparkleSize);
      ctx.lineTo(sparkleX, sparkleY + sparkleSize);
      ctx.stroke();
    }
  }

  private darkenColor(hex: string, factor: number): string {
    const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
    const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
    const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Collect this power-up
   */
  collect(): void {
    this.isActive = false;
    this.isDestroyed = true;
  }
}
