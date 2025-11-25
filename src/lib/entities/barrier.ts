// src/lib/entities/barrier.ts

import { Entity, EntityConfig } from "./entity";
import { BARRIER } from "../constants/game";
import { RenderLayer, GAME_COLORS } from "@/types/game";

export interface BarrierConfig extends EntityConfig {
  damageState?: number;
}

export class Barrier extends Entity {
  damageState: number;
  pixelData: boolean[][];
  private glowIntensity: number = 1;
  private readonly pixelScale: number = 2;

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

    for (let y = 0; y < archHeight; y++) {
      for (let x = 0; x < cols; x++) {
        // Left corner
        if (x < archWidth && y < archWidth - x) {
          data[y][x] = false;
        }
        // Right corner
        if (x >= cols - archWidth && y < x - (cols - archWidth - 1)) {
          data[y][x] = false;
        }
      }
    }

    // Create notch at bottom center
    const notchWidth = Math.floor(cols * 0.35);
    const notchHeight = Math.floor(rows * 0.35);
    const notchStart = Math.floor((cols - notchWidth) / 2);

    for (let y = rows - notchHeight; y < rows; y++) {
      for (let x = notchStart; x < notchStart + notchWidth; x++) {
        data[y][x] = false;
      }
    }

    return data;
  }

  update(_deltaTime: number): void {
    // Subtle pulsing glow
    this.glowIntensity = 0.6 + Math.sin(performance.now() * 0.002) * 0.2;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed) return;

    ctx.save();

    // Calculate damage opacity
    const healthPercent = 1 - this.damageState / BARRIER.DAMAGE_STATES;
    const baseColor = GAME_COLORS.BARRIER;

    // Draw glow effect
    const glowGradient = ctx.createRadialGradient(
      this.position.x + this.dimensions.width / 2,
      this.position.y + this.dimensions.height / 2,
      0,
      this.position.x + this.dimensions.width / 2,
      this.position.y + this.dimensions.height / 2,
      this.dimensions.width * 0.8
    );
    glowGradient.addColorStop(
      0,
      `${baseColor}${Math.floor(this.glowIntensity * 40)
        .toString(16)
        .padStart(2, "0")}`
    );
    glowGradient.addColorStop(1, "transparent");

    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      this.position.x - 20,
      this.position.y - 20,
      this.dimensions.width + 40,
      this.dimensions.height + 40
    );

    // Draw pixels
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 4;

    for (let y = 0; y < this.pixelData.length; y++) {
      for (let x = 0; x < this.pixelData[y].length; x++) {
        if (this.pixelData[y][x]) {
          // Add some color variation based on position
          const brightness = 0.7 + Math.sin((x + y) * 0.5) * 0.15;
          ctx.fillStyle = this.adjustBrightness(baseColor, brightness);

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

  private adjustBrightness(hex: string, factor: number): string {
    // Parse hex color
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    return `rgb(${newR}, ${newG}, ${newB})`;
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

    // Update damage state based on remaining pixels
    const remainingPixels = this.pixelData.flat().filter(Boolean).length;
    const totalPixels = this.pixelData.length * this.pixelData[0].length;
    const damagePercent = 1 - remainingPixels / totalPixels;

    this.damageState = Math.floor(damagePercent * BARRIER.DAMAGE_STATES);

    if (remainingPixels < totalPixels * 0.1) {
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
