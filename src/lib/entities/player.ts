// src/lib/entities/player.ts

import { Entity, EntityConfig } from "./entity";
import {
  GAME_DIMENSIONS,
  PLAYER,
  PROJECTILE,
  FRAME_TIME,
} from "../constants/game";
import { Projectile, ProjectileConfig } from "./projectile";
import { GAME_COLORS } from "@/lib/constants/colors";
import { RenderLayer } from "@/types/game";
import { renderPixelArt, drawGlow } from "@/lib/utils/canvas";

// Authentic Space Invaders cannon pattern (13x8 original, padded to 16x8)
// The original cannon had a distinctive narrow top and wide base
const PLAYER_PIXELS = [
  "      ##        ",
  "     ####       ",
  "     ####       ",
  " ############ ## ",
  "################",
  "################",
  "################",
  "################",
];

export class Player extends Entity {
  lives: number;
  score: number;
  lastShot: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;

  // Visual effects
  private thrusterPhase: number = 0;
  private hitFlashTime: number = 0;
  private invincibleUntil: number = 0;

  constructor(config: EntityConfig) {
    super(config);
    this.lives = PLAYER.INITIAL_LIVES;
    this.score = 0;
    this.lastShot = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.renderLayer = RenderLayer.PLAYER;
  }

  update(deltaTime: number): void {
    const frameSpeed = (PLAYER.SPEED * deltaTime) / FRAME_TIME;

    if (this.isMovingLeft) {
      this.position.x = Math.max(
        GAME_DIMENSIONS.MARGIN,
        this.position.x - frameSpeed
      );
    }
    if (this.isMovingRight) {
      this.position.x = Math.min(
        GAME_DIMENSIONS.WIDTH - GAME_DIMENSIONS.MARGIN - this.dimensions.width,
        this.position.x + frameSpeed
      );
    }

    // Update thruster animation
    this.thrusterPhase += deltaTime * 0.02;

    // Update hit flash
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const now = performance.now();

    // Invincibility blink
    if (this.invincibleUntil > now) {
      if (Math.floor(now / 100) % 2 === 0) return;
    }

    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY = this.position.y + this.dimensions.height / 2;

    ctx.save();

    // Draw glow effect using shared utility
    drawGlow(
      ctx,
      centerX,
      centerY + 5,
      this.dimensions.width,
      GAME_COLORS.PLAYER,
      0.2
    );

    // Draw thruster flame
    this.renderThruster(ctx, centerX);

    // Determine color based on hit flash
    const mainColor = this.hitFlashTime > 0 ? "#ffffff" : GAME_COLORS.PLAYER;

    // Draw pixel art ship using shared utility
    const pixelSize = 3;
    const startX =
      this.position.x + (this.dimensions.width - 16 * pixelSize) / 2;
    const startY =
      this.position.y + (this.dimensions.height - 8 * pixelSize) / 2;

    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 4;
    renderPixelArt(ctx, PLAYER_PIXELS, startX, startY, pixelSize, mainColor);
    ctx.shadowBlur = 0;

    // Draw cockpit glow
    drawGlow(ctx, centerX, this.position.y + 8, 6, GAME_COLORS.PRIMARY, 1);

    ctx.restore();
  }

  private renderThruster(ctx: CanvasRenderingContext2D, centerX: number): void {
    const thrusterY = this.position.y + this.dimensions.height;
    const flameHeight = 8 + Math.sin(this.thrusterPhase) * 4;
    const flameWidth = 6 + Math.sin(this.thrusterPhase * 1.5) * 2;

    // Main flame
    const flameGradient = ctx.createLinearGradient(
      centerX,
      thrusterY,
      centerX,
      thrusterY + flameHeight
    );
    flameGradient.addColorStop(0, "#ffffff");
    flameGradient.addColorStop(0.3, "#00ffff");
    flameGradient.addColorStop(0.6, "#0088ff");
    flameGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.moveTo(centerX - flameWidth, thrusterY);
    ctx.quadraticCurveTo(
      centerX,
      thrusterY + flameHeight * 1.5,
      centerX + flameWidth,
      thrusterY
    );
    ctx.fillStyle = flameGradient;
    ctx.fill();

    // Side thrusters when moving
    if (this.isMovingLeft || this.isMovingRight) {
      const sideFlameHeight = flameHeight * 0.6;
      const offsetX = this.isMovingLeft ? 8 : -8;

      ctx.beginPath();
      ctx.moveTo(centerX + offsetX - 3, thrusterY);
      ctx.quadraticCurveTo(
        centerX + offsetX,
        thrusterY + sideFlameHeight,
        centerX + offsetX + 3,
        thrusterY
      );
      ctx.fillStyle = flameGradient;
      ctx.fill();
    }
  }

  shoot(): Projectile | null {
    const now = Date.now();
    if (now - this.lastShot >= PLAYER.SHOOT_COOLDOWN) {
      this.lastShot = now;
      const projectileConfig: ProjectileConfig = {
        position: {
          x:
            this.position.x +
            this.dimensions.width / 2 -
            PROJECTILE.PLAYER.WIDTH / 2,
          y: this.position.y,
        },
        dimensions: {
          width: PROJECTILE.PLAYER.WIDTH,
          height: PROJECTILE.PLAYER.HEIGHT,
        },
        velocity: { x: 0, y: PROJECTILE.PLAYER.SPEED },
        isPlayerProjectile: true,
      };
      return new Projectile(projectileConfig);
    }
    return null;
  }

  /**
   * Trigger hit effect
   */
  triggerHitEffect(duration: number = 200): void {
    this.hitFlashTime = duration;
  }

  /**
   * Set temporary invincibility
   */
  setInvincible(duration: number): void {
    this.invincibleUntil = performance.now() + duration;
  }

  /**
   * Check if currently invincible
   */
  isInvincible(): boolean {
    return performance.now() < this.invincibleUntil;
  }
}
