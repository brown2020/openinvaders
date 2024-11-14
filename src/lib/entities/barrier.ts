// src/lib/entities/barrier.ts
import { Entity, EntityConfig } from "./entity";
import { BARRIER } from "../constants/game";

export interface BarrierConfig extends EntityConfig {
  damageState?: number;
}

export class Barrier extends Entity {
  damageState: number;
  pixelData: boolean[][];

  constructor(config: BarrierConfig) {
    super(config);
    this.damageState = config.damageState || 0;
    this.pixelData = this.initializePixelData();
  }

  private initializePixelData(): boolean[][] {
    const data: boolean[][] = Array(this.dimensions.height)
      .fill(false)
      .map(() => Array(this.dimensions.width).fill(true));

    for (let y = 0; y < this.dimensions.height / 3; y++) {
      for (let x = 0; x < this.dimensions.width; x++) {
        if (
          (x < this.dimensions.width / 3 && y < x) ||
          (x > (this.dimensions.width * 2) / 3 && y < this.dimensions.width - x)
        ) {
          data[y][x] = false;
        }
      }
    }

    return data;
  }

  update(deltaTime: number): void {
    console.log("deltaTime", deltaTime);
    // Barriers don't need regular updates
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.damageState * this.dimensions.width,
        0,
        this.dimensions.width,
        this.dimensions.height,
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
    } else {
      ctx.fillStyle = "#0f0";
      for (let y = 0; y < this.dimensions.height; y++) {
        for (let x = 0; x < this.dimensions.width; x++) {
          if (this.pixelData[y][x]) {
            ctx.fillRect(this.position.x + x, this.position.y + y, 1, 1);
          }
        }
      }
    }
  }

  damage(x: number, y: number, radius: number = 3): void {
    const localX = Math.floor(x - this.position.x);
    const localY = Math.floor(y - this.position.y);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = localX + dx;
        const py = localY + dy;
        if (
          px >= 0 &&
          px < this.dimensions.width &&
          py >= 0 &&
          py < this.dimensions.height
        ) {
          if (Math.random() < (this.damageState + 1) / BARRIER.DAMAGE_STATES) {
            this.pixelData[py][px] = false;
          }
        }
      }
    }

    const remainingPixels = this.pixelData.flat().filter(Boolean).length;
    const totalPixels = this.dimensions.width * this.dimensions.height;
    this.damageState = Math.floor(
      (1 - remainingPixels / totalPixels) * BARRIER.DAMAGE_STATES
    );

    if (this.damageState >= BARRIER.DAMAGE_STATES) {
      this.isDestroyed = true;
    }
  }
}
