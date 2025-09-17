import { Entity, EntityConfig } from "./entity";
import { GAME_DIMENSIONS, UFO } from "@/lib/constants/game";

export interface UfoConfig
  extends Omit<EntityConfig, "position" | "dimensions"> {
  fromLeft: boolean;
}

export class Ufo extends Entity {
  private readonly fromLeft: boolean;

  constructor(config: UfoConfig) {
    super({
      position: {
        x: config.fromLeft ? -UFO.WIDTH : GAME_DIMENSIONS.WIDTH,
        y: UFO.Y_POSITION,
      },
      dimensions: { width: UFO.WIDTH, height: UFO.HEIGHT },
      sprite: config.sprite,
    });
    this.fromLeft = config.fromLeft;
  }

  update(deltaTime: number): void {
    const dir = this.fromLeft ? 1 : -1;
    this.position.x += UFO.SPEED * (deltaTime / 16.67) * dir;
    if (
      this.position.x < -UFO.WIDTH - 4 ||
      this.position.x > GAME_DIMENSIONS.WIDTH + 4
    ) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#f00";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.dimensions.width,
      this.dimensions.height
    );
  }
}

export function getUfoScore(): number {
  const idx = Math.floor(Math.random() * UFO.SCORES.length);
  return UFO.SCORES[idx];
}
