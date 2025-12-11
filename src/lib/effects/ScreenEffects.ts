// src/lib/effects/ScreenEffects.ts

import { GAME_DIMENSIONS } from "@/lib/constants/game";
import { CRT } from "@/lib/constants/effects";

/**
 * Screen shake effect controller
 */
export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  private startTime = 0;
  private offsetX = 0;
  private offsetY = 0;

  /**
   * Trigger a screen shake
   */
  trigger(intensity: number, duration: number): void {
    this.intensity = intensity;
    this.duration = duration;
    this.startTime = performance.now();
  }

  /**
   * Update shake effect
   */
  update(): { x: number; y: number } {
    if (this.intensity === 0 || this.duration === 0) {
      this.offsetX = 0;
      this.offsetY = 0;
      return { x: 0, y: 0 };
    }

    const elapsed = performance.now() - this.startTime;
    const progress = elapsed / this.duration;

    if (progress >= 1) {
      this.intensity = 0;
      this.duration = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      return { x: 0, y: 0 };
    }

    // Decay shake over time
    const currentIntensity = this.intensity * (1 - progress);

    this.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    this.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

    return { x: this.offsetX, y: this.offsetY };
  }

  /**
   * Apply shake transform to canvas
   */
  apply(ctx: CanvasRenderingContext2D): void {
    const offset = this.update();
    ctx.translate(offset.x, offset.y);
  }

  /**
   * Reset shake
   */
  reset(): void {
    this.intensity = 0;
    this.duration = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}

/**
 * CRT scanline effect renderer
 */
export class CRTEffect {
  private enabled = true;

  /**
   * Render CRT scanlines
   */
  renderScanlines(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${CRT.SCANLINE_OPACITY})`;

    for (let y = 0; y < GAME_DIMENSIONS.HEIGHT; y += CRT.SCANLINE_SPACING) {
      ctx.fillRect(0, y, GAME_DIMENSIONS.WIDTH, 1);
    }

    ctx.restore();
  }

  /**
   * Render vignette effect
   */
  renderVignette(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;

    const centerX = GAME_DIMENSIONS.WIDTH / 2;
    const centerY = GAME_DIMENSIONS.HEIGHT / 2;
    const radius =
      Math.max(GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT) *
      CRT.VIGNETTE_RADIUS_FACTOR;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * CRT.VIGNETTE_INNER_FACTOR,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, `rgba(0, 0, 0, ${CRT.VIGNETTE_STRENGTH})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT);
    ctx.restore();
  }

  /**
   * Render all CRT effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.renderScanlines(ctx);
    this.renderVignette(ctx);
  }

  /**
   * Toggle CRT effects
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
