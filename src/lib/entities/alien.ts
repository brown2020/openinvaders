// src/lib/entities/alien.ts

import { Entity, EntityConfig, Position } from "./entity";
import {
  ALIEN,
  PROJECTILE,
  GAME_DIMENSIONS,
  FRAME_TIME,
} from "@/lib/constants/game";
import { Projectile, ProjectileConfig } from "./projectile";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";
import { ALIEN_TYPE_COLORS } from "@/lib/constants/colors";
import { RenderLayer, AlienType } from "@/types/game";
import { renderPixelArt, drawMultiGlow } from "@/lib/utils/canvas";

// Authentic Space Invaders pixel art patterns
// TOP: Squid (8x8 original, padded to 12x8 for consistency)
// MIDDLE: Crab (11x8 original, padded to 12x8)
// BOTTOM: Octopus (12x8 original)
const ALIEN_PIXELS = {
  // Squid - top row alien (30 points in original)
  TOP: [
    [
      "    ##      ",
      "   ####     ",
      "  ######    ",
      " ## ## ##   ",
      " ########   ",
      "   #  #     ",
      "  #    #    ",
      " #      #   ",
    ],
    [
      "    ##      ",
      "   ####     ",
      "  ######    ",
      " ## ## ##   ",
      " ########   ",
      "  #    #    ",
      "  ##  ##    ",
      " #  ##  #   ",
    ],
  ],
  // Crab - middle row aliens (20 points in original)
  MIDDLE: [
    [
      "  #      #  ",
      "   #    #   ",
      "  ########  ",
      " ## #### ## ",
      "############",
      "# ######## #",
      "# #      # #",
      "   ##  ##   ",
    ],
    [
      "  #      #  ",
      "#  #    #  #",
      "# ######## #",
      "### #### ###",
      "############",
      " ########## ",
      "  #      #  ",
      " #        # ",
    ],
  ],
  // Octopus - bottom row aliens (10 points in original)
  BOTTOM: [
    [
      "   ######   ",
      " ########## ",
      "############",
      "###  ##  ###",
      "############",
      "  ###  ###  ",
      " ##  ##  ## ",
      "##        ##",
    ],
    [
      "   ######   ",
      " ########## ",
      "############",
      "###  ##  ###",
      "############",
      "   ##  ##   ",
      "  ##    ##  ",
      "   #    #   ",
    ],
  ],
};

// Use shared color mapping from colors.ts
const ALIEN_COLORS = ALIEN_TYPE_COLORS;

export interface AlienConfig extends EntityConfig {
  type: AlienType;
  row: number;
  column: number;
  formationPosition: Position;
}

/**
 * Alien formation state interface
 */
interface AlienFormationState {
  direction: number;
  moveTimer: number;
  currentInterval: number;
  update: (aliens: Alien[], deltaTime: number) => void;
  reset: () => void;
}

/**
 * Manages the alien formation movement
 */
export const alienFormation: AlienFormationState = {
  direction: 1,
  moveTimer: 0,
  currentInterval: ALIEN.MOVE_INTERVAL,

  update(aliens: Alien[], deltaTime: number): void {
    this.moveTimer += deltaTime;

    if (this.moveTimer < this.currentInterval) return;
    this.moveTimer = 0;

    // Calculate bounds in single pass (avoid spread operator)
    let leftMost = Infinity;
    let rightMost = -Infinity;
    let aliveCount = 0;

    for (let i = 0; i < aliens.length; i++) {
      const alien = aliens[i];
      if (!alien.isDestroyed) {
        aliveCount++;
        if (alien.position.x < leftMost) leftMost = alien.position.x;
        const right = alien.position.x + alien.dimensions.width;
        if (right > rightMost) rightMost = right;
      }
    }

    if (aliveCount === 0) return;

    const hitEdge =
      (rightMost >= GAME_DIMENSIONS.WIDTH - GAME_DIMENSIONS.MARGIN &&
        this.direction > 0) ||
      (leftMost <= GAME_DIMENSIONS.MARGIN && this.direction < 0);

    if (hitEdge) {
      for (let i = 0; i < aliens.length; i++) {
        if (!aliens[i].isDestroyed) {
          aliens[i].position.y += ALIEN.STEP_DROP;
        }
      }
      this.direction *= -1;
    } else {
      for (let i = 0; i < aliens.length; i++) {
        if (!aliens[i].isDestroyed) {
          aliens[i].position.x += ALIEN.STEP_X * this.direction;
        }
      }
    }

    // Play next note in 4-note march cycle (authentic Space Invaders sound)
    soundManager.playMarchNote();

    // Speed up as aliens are destroyed
    const ratio = aliveCount / (ALIEN.ROWS * ALIEN.COLS);
    const scaled =
      ALIEN.MIN_MOVE_INTERVAL +
      (ALIEN.MOVE_INTERVAL - ALIEN.MIN_MOVE_INTERVAL) * ratio;
    this.currentInterval = Math.max(
      ALIEN.MIN_MOVE_INTERVAL,
      Math.floor(scaled)
    );
  },

  reset(): void {
    this.direction = 1;
    this.moveTimer = 0;
    this.currentInterval = ALIEN.MOVE_INTERVAL;
  },
};

export class Alien extends Entity {
  readonly type: AlienType;
  readonly points: number;
  readonly row: number;
  readonly column: number;
  formationPosition: Position;
  animationFrame: number;
  private animationTimer: number;
  private readonly animationDuration: number;
  private hoverOffset: number = 0;
  private hoverPhase: number;

  constructor(config: AlienConfig) {
    super(config);
    this.type = config.type;
    this.row = config.row;
    this.column = config.column;
    this.formationPosition = { ...config.formationPosition };
    this.points = this.getPoints();
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationDuration = 500;
    this.hoverPhase = Math.random() * Math.PI * 2;
    this.renderLayer = RenderLayer.ALIENS;
  }

  private getPoints(): number {
    switch (this.type) {
      case "TOP":
        return ALIEN.POINTS.TOP_ROW;
      case "MIDDLE":
        return ALIEN.POINTS.MIDDLE_ROW;
      case "BOTTOM":
        return ALIEN.POINTS.BOTTOM_ROW;
    }
  }

  update(deltaTime: number): void {
    // Update animation frame
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationDuration) {
      this.animationFrame = (this.animationFrame + 1) % 2;
      this.animationTimer = 0;
    }

    // Update hover effect
    this.hoverPhase += deltaTime * 0.003;
    this.hoverOffset = Math.sin(this.hoverPhase) * 2;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed) return;

    const color = ALIEN_COLORS[this.type];
    const centerX = this.position.x + this.dimensions.width / 2;
    const centerY =
      this.position.y + this.dimensions.height / 2 + this.hoverOffset;

    ctx.save();

    // Draw glow using shared utility
    drawMultiGlow(ctx, centerX, centerY, this.dimensions.width * 0.8, color, [
      [0, 0.27],
      [0.5, 0.13],
      [1, 0],
    ]);

    // Draw pixel art alien using shared utility
    const pixels = ALIEN_PIXELS[this.type][this.animationFrame];
    const pixelSize = 2.5;
    const startX =
      this.position.x + (this.dimensions.width - 12 * pixelSize) / 2;
    const startY =
      this.position.y +
      (this.dimensions.height - 8 * pixelSize) / 2 +
      this.hoverOffset;

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    renderPixelArt(ctx, pixels, startX, startY, pixelSize, color);
    ctx.shadowBlur = 0;

    // Draw eyes glow
    this.renderEyes(ctx);

    ctx.restore();
  }

  private renderEyes(ctx: CanvasRenderingContext2D): void {
    const eyeY = this.position.y + 6 * 2.5 + this.hoverOffset;
    const centerX = this.position.x + this.dimensions.width / 2;
    const leftEyeX = centerX - 5;
    const rightEyeX = centerX + 5;

    // Glowing eyes
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 4;
    ctx.arc(leftEyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  shoot(): Projectile {
    const projectileConfig: ProjectileConfig = {
      position: {
        x:
          this.position.x +
          this.dimensions.width / 2 -
          PROJECTILE.ALIEN.WIDTH / 2,
        y: this.position.y + this.dimensions.height,
      },
      dimensions: {
        width: PROJECTILE.ALIEN.WIDTH,
        height: PROJECTILE.ALIEN.HEIGHT,
      },
      velocity: { x: 0, y: PROJECTILE.ALIEN.SPEED },
      isPlayerProjectile: false,
    };
    return new Projectile(projectileConfig);
  }

  canShoot(aliens: Alien[]): boolean {
    const myCenter = this.position.x + this.dimensions.width / 2;

    // Check if any alien is below this one in the same column
    return !aliens.some(
      (alien) =>
        alien !== this &&
        !alien.isDestroyed &&
        alien.position.y > this.position.y &&
        alien.position.x < myCenter &&
        alien.position.x + alien.dimensions.width > myCenter
    );
  }
}

// Re-export AlienType from types
export type { AlienType };
