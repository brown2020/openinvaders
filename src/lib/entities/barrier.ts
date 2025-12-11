// src/lib/entities/barrier.ts

import { Entity, EntityConfig } from "./entity";
import { BARRIER } from "../constants/game";
import { GAME_COLORS } from "@/lib/constants/colors";
import { RenderLayer } from "@/types/game";
import { adjustBrightness } from "@/lib/utils/color";
import { drawGlow } from "@/lib/utils/canvas";

export interface BarrierConfig extends EntityConfig {
  damageState?: number;
}

export class Barrier extends Entity {
  damageState: number;
  pixelData: boolean[][];
  private glowIntensity: number = 1;
  private readonly pixelScale: number = 2;
  private remainingPixels: number = 0;
  private totalPixels: number = 0;

  constructor(config: BarrierConfig) {
    super(config);
    this.damageState = config.damageState || 0;
    this.pixelData = this.initializePixelData();
    this.renderLayer = RenderLayer.BARRIERS;
  }

  private initializePixelData(): boolean[][] {
    const cols = Math.floor(this.dimensions.width / this.pixelScale);
    const rows = Math.floor(this.dimensions.height / this.pixelScale);

    const data: boolean[][] = Array(rows)
      .fill(false)
      .map(() => Array(cols).fill(true));

    // Create arch shape at top
    const archHeight = Math.floor(rows * 0.35);
    const archWidth = Math.floor(cols * 0.35);

    let removedPixels = 0;

    for (let y = 0; y < archHeight; y++) {
      for (let x = 0; x < cols; x++) {
        // Left corner
        if (x < archWidth && y < archWidth - x) {
          data[y][x] = false;
          removedPixels++;
        }
        // Right corner
        if (x >= cols - archWidth && y < x - (cols - archWidth - 1)) {
          data[y][x] = false;
          removedPixels++;
        }
      }
    }

    // Create notch at bottom center
    const notchWidth = Math.floor(cols * 0.35);
    const notchHeight = Math.floor(rows * 0.35);
    const notchStart = Math.floor((cols - notchWidth) / 2);

    for (let y = rows - notchHeight; y < rows; y++) {
      for (let x = notchStart; x < notchStart + notchWidth; x++) {
        if (data[y][x]) {
          data[y][x] = false;
          removedPixels++;
        }
      }
    }

    // Track total and remaining pixels incrementally
    this.totalPixels = rows * cols;
    this.remainingPixels = this.totalPixels - removedPixels;

    return data;
  }

  update(_deltaTime: number): void {
    // Subtle pulsing glow
    this.glowIntensity = 0.6 + Math.sin(performance.now() * 0.002) * 0.2;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed) return;

    ctx.save();

    const baseColor = GAME_COLORS.BARRIER;
    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY = this.position.y + this.dimensions.height / 2;

    // Draw glow effect using shared utility
    drawGlow(
      ctx,
      centerX,
      centerY,
      this.dimensions.width * 0.8,
      baseColor,
      this.glowIntensity * 0.16
    );

    // Draw pixels
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 4;

    for (let y = 0; y < this.pixelData.length; y++) {
      for (let x = 0; x < this.pixelData[y].length; x++) {
        if (this.pixelData[y][x]) {
          // Add some color variation based on position
          const brightness = 0.7 + Math.sin((x + y) * 0.5) * 0.15;
          ctx.fillStyle = adjustBrightness(baseColor, brightness);

          ctx.fillRect(
            this.position.x + x * this.pixelScale,
            this.position.y + y * this.pixelScale,
            this.pixelScale,
            this.pixelScale
          );
        }
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  damage(x: number, y: number, radius: number = 4): void {
    const localX = Math.floor((x - this.position.x) / this.pixelScale);
    const localY = Math.floor((y - this.position.y) / this.pixelScale);
    const scaledRadius = Math.ceil(radius / this.pixelScale);

    let pixelsDestroyed = 0;

    for (let dy = -scaledRadius; dy <= scaledRadius; dy++) {
      for (let dx = -scaledRadius; dx <= scaledRadius; dx++) {
        const px = localX + dx;
        const py = localY + dy;

        if (
          px >= 0 &&
          px < this.pixelData[0].length &&
          py >= 0 &&
          py < this.pixelData.length
        ) {
          // Distance-based destruction probability
          const distance = Math.sqrt(dx * dx + dy * dy);
          const destroyChance = 1 - (distance / scaledRadius) * 0.5;

          if (this.pixelData[py][px] && Math.random() < destroyChance) {
            this.pixelData[py][px] = false;
            pixelsDestroyed++;
          }
        }
      }
    }

    // Update remaining pixels incrementally (no array allocation)
    this.remainingPixels -= pixelsDestroyed;

    // Calculate damage state from tracked values
    const damagePercent = 1 - this.remainingPixels / this.totalPixels;
    this.damageState = Math.floor(damagePercent * BARRIER.DAMAGE_STATES);

    if (this.remainingPixels < this.totalPixels * 0.1) {
      this.isDestroyed = true;
    }
  }

  /**
   * Check if a point hits any pixel in this barrier
   */
  hitsPixel(x: number, y: number): boolean {
    const localX = Math.floor((x - this.position.x) / this.pixelScale);
    const localY = Math.floor((y - this.position.y) / this.pixelScale);

    if (
      localX >= 0 &&
      localX < this.pixelData[0].length &&
      localY >= 0 &&
      localY < this.pixelData.length
    ) {
      return this.pixelData[localY][localX];
    }
    return false;
  }
}
