import { Entity } from "./entity";
import { PowerUpType, POWERUP } from "../constants/powerups";

interface PowerUpProps {
  type: PowerUpType;
  position: { x: number; y: number };
}

export class PowerUp extends Entity {
  type: PowerUpType;
  isActive: boolean;

  constructor({ type, position }: PowerUpProps) {
    super({
      position,
      dimensions: {
        width: POWERUP.WIDTH,
        height: POWERUP.HEIGHT,
      },
    });
    this.type = type;
    this.isActive = true;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // Move downward
    this.position.y += POWERUP.FALL_SPEED * (deltaTime / 16);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    // Draw power-up background
    ctx.fillStyle = this.getPowerUpColor();
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.dimensions.width / 2,
      this.position.y + this.dimensions.height / 2,
      this.dimensions.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw power-up symbol
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.getPowerUpSymbol(),
      this.position.x + this.dimensions.width / 2,
      this.position.y + this.dimensions.height / 2
    );
  }

  collect(): void {
    this.isActive = false;
  }

  private getPowerUpColor(): string {
    switch (this.type) {
      case "SHIELD":
        return "#00ffff";
      case "MULTI_SHOT":
        return "#ff00ff";
      case "SPEED_BOOST":
        return "#ffff00";
      default:
        return "#ffffff";
    }
  }

  private getPowerUpSymbol(): string {
    switch (this.type) {
      case "SHIELD":
        return "S";
      case "MULTI_SHOT":
        return "M";
      case "SPEED_BOOST":
        return "⚡";
      default:
        return "?";
    }
  }
}
