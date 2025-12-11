// src/lib/entities/ufo.ts

import { Entity, EntityConfig } from "./entity";
import { GAME_DIMENSIONS, UFO, FRAME_TIME } from "@/lib/constants/game";
import { GAME_COLORS } from "@/lib/constants/colors";
import { RenderLayer } from "@/types/game";
import { renderPixelArt, drawMultiGlow } from "@/lib/utils/canvas";

// UFO pixel art pattern (20x8 grid)
const UFO_PIXELS = [
  "      ########      ",
  "   ##############   ",
  "  ################  ",
  " ################## ",
  "####################",
  "  ##  ##  ##  ##  ",
  "   ##        ##   ",
  "    ##      ##    ",
];

export interface UfoConfig {
  fromLeft: boolean;
}

export class Ufo extends Entity {
  private readonly fromLeft: boolean;
  private lightPhase: number = 0;
  private wobblePhase: number = 0;

  constructor(config: UfoConfig) {
    super({
      position: {
        x: config.fromLeft ? -UFO.WIDTH : GAME_DIMENSIONS.WIDTH,
        y: UFO.Y_POSITION,
      },
      dimensions: { width: UFO.WIDTH, height: UFO.HEIGHT },
    });
    this.fromLeft = config.fromLeft;
    this.renderLayer = RenderLayer.UFO;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / FRAME_TIME;
    const dir = this.fromLeft ? 1 : -1;

    this.position.x += UFO.SPEED * dt * dir;

    // Update animation phases
    this.lightPhase += deltaTime * 0.015;
    this.wobblePhase += deltaTime * 0.008;

    // Check if off screen
    if (
      this.position.x < -UFO.WIDTH - 4 ||
      this.position.x > GAME_DIMENSIONS.WIDTH + 4
    ) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const wobbleY = Math.sin(this.wobblePhase) * 3;
    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY = this.position.y + this.dimensions.height / 2 + wobbleY;

    ctx.save();

    // Draw beam effect
    this.renderBeam(ctx, centerX, centerY);

    // Draw outer glow using shared utility
    drawMultiGlow(
      ctx,
      centerX,
      centerY,
      this.dimensions.width * 1.2,
      GAME_COLORS.UFO,
      [
        [0, 0.4],
        [0.5, 0.13],
        [1, 0],
      ]
    );

    // Draw UFO body using shared utility
    const pixelSize = 2;
    const startX =
      this.position.x + (this.dimensions.width - 20 * pixelSize) / 2;
    const startY =
      this.position.y + (this.dimensions.height - 8 * pixelSize) / 2 + wobbleY;

    ctx.shadowColor = GAME_COLORS.UFO;
    ctx.shadowBlur = 8;
    renderPixelArt(ctx, UFO_PIXELS, startX, startY, pixelSize, GAME_COLORS.UFO);
    ctx.shadowBlur = 0;

    // Draw dome
    this.renderDome(ctx, centerX, wobbleY);

    // Draw running lights
    this.renderLights(ctx, centerX, wobbleY);

    ctx.restore();
  }

  private renderDome(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    wobbleY: number
  ): void {
    const domeY = this.position.y + 2 + wobbleY;

    // Dome gradient
    const domeGradient = ctx.createRadialGradient(
      centerX,
      domeY,
      0,
      centerX,
      domeY + 6,
      8
    );
    domeGradient.addColorStop(0, "#88ffff");
    domeGradient.addColorStop(0.5, "#00ffff");
    domeGradient.addColorStop(1, "#008888");

    ctx.beginPath();
    ctx.fillStyle = domeGradient;
    ctx.ellipse(centerX, domeY + 4, 6, 6, 0, Math.PI, 0);
    ctx.fill();

    // Dome highlight
    ctx.beginPath();
    ctx.fillStyle = "#ffffff88";
    ctx.ellipse(centerX - 2, domeY + 2, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderLights(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    wobbleY: number
  ): void {
    const lightY = this.position.y + this.dimensions.height - 4 + wobbleY;
    const lightCount = 5;
    const lightSpacing = this.dimensions.width / (lightCount + 1);

    for (let i = 0; i < lightCount; i++) {
      const lightX = this.position.x + lightSpacing * (i + 1);
      const phase = this.lightPhase + (i / lightCount) * Math.PI * 2;
      const brightness = 0.5 + Math.sin(phase) * 0.5;

      // Light glow
      ctx.beginPath();
      const lightGradient = ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        6
      );

      const lightColor = i % 2 === 0 ? "#ff0088" : "#00ff88";
      lightGradient.addColorStop(0, `${lightColor}`);
      lightGradient.addColorStop(
        0.5,
        `${lightColor}${Math.floor(brightness * 200)
          .toString(16)
          .padStart(2, "0")}`
      );
      lightGradient.addColorStop(1, "transparent");

      ctx.fillStyle = lightGradient;
      ctx.arc(lightX, lightY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBeam(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number
  ): void {
    const beamHeight = GAME_DIMENSIONS.HEIGHT - centerY;
    const beamWidth = this.dimensions.width * 0.4;
    const pulseWidth = beamWidth * (0.8 + Math.sin(this.lightPhase * 2) * 0.2);

    const beamGradient = ctx.createLinearGradient(
      centerX,
      centerY + 10,
      centerX,
      centerY + beamHeight
    );
    beamGradient.addColorStop(0, `${GAME_COLORS.UFO}33`);
    beamGradient.addColorStop(0.5, `${GAME_COLORS.UFO}11`);
    beamGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY + 10);
    ctx.lineTo(centerX - pulseWidth, centerY + beamHeight);
    ctx.lineTo(centerX + pulseWidth, centerY + beamHeight);
    ctx.lineTo(centerX + 10, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = beamGradient;
    ctx.fill();
  }
}

export function getUfoScore(): number {
  const idx = Math.floor(Math.random() * UFO.SCORES.length);
  return UFO.SCORES[idx];
}
