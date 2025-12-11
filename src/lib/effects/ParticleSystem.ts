// src/lib/effects/ParticleSystem.ts

import { Position, Particle } from "@/types/game";
import { GAME_COLORS } from "@/lib/constants/colors";
import { GAME_DIMENSIONS, FRAME_TIME } from "@/lib/constants/game";
import { PARTICLE } from "@/lib/constants/effects";

/**
 * High-performance particle system for explosions and effects
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId = 0;

  /**
   * Create an explosion effect at the given position
   */
  createExplosion(position: Position, color?: string, count = 12): void {
    const baseColors = color
      ? [color, "#ffffff", "#ffff00"]
      : GAME_COLORS.EXPLOSION;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const colorIndex = Math.floor(Math.random() * baseColors.length);

      this.particles.push({
        id: this.nextId++,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color: baseColors[colorIndex],
        size: 2 + Math.random() * 3,
      });
    }
  }

  /**
   * Create a spark burst effect
   */
  createSparkBurst(position: Position, color: string, count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;

      this.particles.push({
        id: this.nextId++,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        life: 1,
        maxLife: 1,
        color,
        size: 1 + Math.random() * 2,
      });
    }
  }

  /**
   * Create debris particles for barrier destruction
   */
  createDebris(position: Position, count = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 1 + Math.random() * 2;

      this.particles.push({
        id: this.nextId++,
        x: position.x + (Math.random() - 0.5) * 10,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color: GAME_COLORS.BARRIER,
        size: 1 + Math.random() * 2,
      });
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    const dt = deltaTime / FRAME_TIME;

    this.particles = this.particles.filter((particle) => {
      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Apply gravity and friction
      particle.vy += PARTICLE.GRAVITY * dt;
      particle.vx *= PARTICLE.FRICTION;
      particle.vy *= PARTICLE.FRICTION;

      // Decay life
      particle.life -= PARTICLE.DECAY * dt;

      // Shrink particle
      particle.size *= PARTICLE.SHRINK_RATE;

      // Remove dead particles
      return (
        particle.life > 0 &&
        particle.size > PARTICLE.MIN_SIZE &&
        particle.x >= 0 &&
        particle.x <= GAME_DIMENSIONS.WIDTH &&
        particle.y >= 0 &&
        particle.y <= GAME_DIMENSIONS.HEIGHT
      );
    });
  }

  /**
   * Render all particles
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;

      // Draw glow
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, `${particle.color}88`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.globalAlpha = alpha;
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = alpha * 0.8;
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Get particle count for performance monitoring
   */
  get count(): number {
    return this.particles.length;
  }
}
