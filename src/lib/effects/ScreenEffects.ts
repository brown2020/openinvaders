// src/lib/effects/ScreenEffects.ts

import { GAME_DIMENSIONS } from '@/lib/constants/game';

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
  private scanlineOpacity = 0.08;
  private vignetteStrength = 0.3;
  private enabled = true;

  /**
   * Render CRT scanlines
   */
  renderScanlines(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${this.scanlineOpacity})`;
    
    for (let y = 0; y < GAME_DIMENSIONS.HEIGHT; y += 3) {
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
    const radius = Math.max(GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT) * 0.7;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.3,
      centerX, centerY, radius
    );
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteStrength})`);

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

/**
 * Glow effect helper
 */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity = 0.5
): void {
  ctx.save();
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, `${color}${Math.floor(intensity * 128).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, 'transparent');
  
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Draw a glowing rectangle
 */
export function drawGlowRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  glowSize = 8
): void {
  ctx.save();
  
  // Draw glow layers
  for (let i = glowSize; i > 0; i -= 2) {
    const alpha = (1 - i / glowSize) * 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur = i * 2;
    ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.fillRect(x - i, y - i, width + i * 2, height + i * 2);
  }
  
  // Draw solid core
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  
  ctx.restore();
}

/**
 * Draw text with glow effect
 */
export function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string,
  glowSize = 10
): void {
  ctx.save();
  
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw glow
  ctx.shadowColor = color;
  ctx.shadowBlur = glowSize;
  ctx.fillStyle = color;
  
  // Multiple passes for stronger glow
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text, x, y);
  }
  
  // Draw solid text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  
  ctx.restore();
}

