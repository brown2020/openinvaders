// src/lib/effects/Starfield.ts

import { GAME_DIMENSIONS, FRAME_TIME } from "@/lib/constants/game";
import { STARFIELD } from "@/lib/constants/effects";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

/**
 * Creates a parallax starfield background with twinkling stars
 */
export class Starfield {
  private stars: Star[] = [];

  constructor() {
    this.initializeStars();
  }

  private initializeStars(): void {
    for (let layer = 0; layer < STARFIELD.LAYER_COUNT; layer++) {
      const layerSpeed = (layer + 1) * STARFIELD.LAYER_SPEED_MULTIPLIER;
      const layerSize = (layer + 1) * STARFIELD.LAYER_SIZE_MULTIPLIER;
      const layerBrightness =
        STARFIELD.BASE_BRIGHTNESS + layer * STARFIELD.BRIGHTNESS_PER_LAYER;

      for (let i = 0; i < STARFIELD.STARS_PER_LAYER; i++) {
        this.stars.push({
          x: Math.random() * GAME_DIMENSIONS.WIDTH,
          y: Math.random() * GAME_DIMENSIONS.HEIGHT,
          size: layerSize + Math.random() * 0.5,
          speed: layerSpeed,
          brightness: layerBrightness + Math.random() * 0.2,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed:
            STARFIELD.MIN_TWINKLE_SPEED +
            Math.random() * STARFIELD.TWINKLE_SPEED_VARIANCE,
        });
      }
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / FRAME_TIME;

    for (const star of this.stars) {
      // Slow downward drift
      star.y += star.speed * dt;

      // Update twinkle
      star.twinklePhase += star.twinkleSpeed * dt;

      // Wrap around
      if (star.y > GAME_DIMENSIONS.HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_DIMENSIONS.WIDTH;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const star of this.stars) {
      const twinkleFactor = 0.5 + 0.5 * Math.sin(star.twinklePhase);
      const alpha = star.brightness * twinkleFactor;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow for larger stars
      if (star.size > STARFIELD.LARGE_STAR_THRESHOLD) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * STARFIELD.GLOW_MULTIPLIER
        );
        gradient.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.3})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.arc(
          star.x,
          star.y,
          star.size * STARFIELD.GLOW_MULTIPLIER,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  reset(): void {
    this.stars = [];
    this.initializeStars();
  }
}
