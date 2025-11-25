// src/lib/entities/alien.ts

import { Entity, EntityConfig, Position } from './entity';
import { ALIEN, PROJECTILE, GAME_DIMENSIONS } from '@/lib/constants/game';
import { Projectile, ProjectileConfig } from './projectile';
import { soundManager } from '@/lib/sounds/SoundManager';
import { SoundType } from '@/lib/sounds/SoundTypes';
import { RenderLayer, GAME_COLORS, AlienType } from '@/types/game';

// Pixel art patterns for different alien types (12x8 grid)
const ALIEN_PIXELS = {
  TOP: [
    [
      '    ####    ',
      '  ########  ',
      ' ########## ',
      ' ##  ##  ## ',
      ' ########## ',
      '   ##  ##   ',
      '  ##    ##  ',
      ' ##      ## ',
    ],
    [
      '    ####    ',
      '  ########  ',
      ' ########## ',
      ' ##  ##  ## ',
      ' ########## ',
      '  ##    ##  ',
      '   ##  ##   ',
      '    ####    ',
    ],
  ],
  MIDDLE: [
    [
      '  #      #  ',
      '   #    #   ',
      '  ########  ',
      ' ## #### ## ',
      '############',
      '# ######## #',
      '# #      # #',
      '   ##  ##   ',
    ],
    [
      '  #      #  ',
      '#  #    #  #',
      '# ######## #',
      '### #### ###',
      '############',
      ' ########## ',
      '  #      #  ',
      ' #        # ',
    ],
  ],
  BOTTOM: [
    [
      '   ######   ',
      ' ########## ',
      '############',
      '###  ##  ###',
      '############',
      '  ###  ###  ',
      ' ##  ##  ## ',
      '##        ##',
    ],
    [
      '   ######   ',
      ' ########## ',
      '############',
      '###  ##  ###',
      '############',
      '   ##  ##   ',
      '  ##    ##  ',
      '   #    #   ',
    ],
  ],
};

const ALIEN_COLORS: Record<AlienType, string> = {
  TOP: GAME_COLORS.ALIEN_TOP,
  MIDDLE: GAME_COLORS.ALIEN_MIDDLE,
  BOTTOM: GAME_COLORS.ALIEN_BOTTOM,
};

export interface AlienConfig extends EntityConfig {
  type: AlienType;
  row: number;
  column: number;
  formationPosition: Position;
}

/**
 * Manages the alien formation movement
 */
export class AlienFormation {
  private static direction: number = 1;
  private static moveTimer: number = 0;
  private static currentInterval: number = ALIEN.MOVE_INTERVAL;
  private static marchStepIndex: number = 0;

  static update(aliens: Alien[], deltaTime: number): void {
    this.moveTimer += deltaTime;

    if (this.moveTimer < this.currentInterval) return;
    this.moveTimer = 0;

    const alive = aliens.filter((a) => !a.isDestroyed);
    if (alive.length === 0) return;

    const leftMost = Math.min(...alive.map((a) => a.position.x));
    const rightMost = Math.max(
      ...alive.map((a) => a.position.x + a.dimensions.width)
    );

    const hitEdge =
      (rightMost >= GAME_DIMENSIONS.WIDTH - GAME_DIMENSIONS.MARGIN &&
        this.direction > 0) ||
      (leftMost <= GAME_DIMENSIONS.MARGIN && this.direction < 0);

    if (hitEdge) {
      alive.forEach((alien) => {
        alien.position.y += ALIEN.STEP_DROP;
      });
      this.direction *= -1;
    } else {
      alive.forEach((alien) => {
        alien.position.x += ALIEN.STEP_X * this.direction;
      });
    }

    // March sound
    soundManager.play(SoundType.ALIEN_MOVE);
    this.marchStepIndex = (this.marchStepIndex + 1) % 4;

    // Speed up as aliens are destroyed
    const ratio = alive.length / (ALIEN.ROWS * ALIEN.COLS);
    const scaled =
      ALIEN.MIN_MOVE_INTERVAL +
      (ALIEN.MOVE_INTERVAL - ALIEN.MIN_MOVE_INTERVAL) * ratio;
    this.currentInterval = Math.max(
      ALIEN.MIN_MOVE_INTERVAL,
      Math.floor(scaled)
    );
  }

  static reset(): void {
    this.direction = 1;
    this.moveTimer = 0;
    this.currentInterval = ALIEN.MOVE_INTERVAL;
    this.marchStepIndex = 0;
  }
}

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
      case 'TOP':
        return ALIEN.POINTS.TOP_ROW;
      case 'MIDDLE':
        return ALIEN.POINTS.MIDDLE_ROW;
      case 'BOTTOM':
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
    const centerY = this.position.y + this.dimensions.height / 2 + this.hoverOffset;

    ctx.save();

    // Draw glow
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, this.dimensions.width * 0.8
    );
    glowGradient.addColorStop(0, `${color}44`);
    glowGradient.addColorStop(0.5, `${color}22`);
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      this.position.x - 10,
      this.position.y - 10 + this.hoverOffset,
      this.dimensions.width + 20,
      this.dimensions.height + 20
    );

    // Draw pixel art alien
    this.renderPixelAlien(ctx, color);

    // Draw eyes glow
    this.renderEyes(ctx);

    ctx.restore();
  }

  private renderPixelAlien(ctx: CanvasRenderingContext2D, color: string): void {
    const pixels = ALIEN_PIXELS[this.type][this.animationFrame];
    const pixelSize = 2.5;
    const startX = this.position.x + (this.dimensions.width - 12 * pixelSize) / 2;
    const startY = this.position.y + (this.dimensions.height - 8 * pixelSize) / 2 + this.hoverOffset;

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

    for (let row = 0; row < pixels.length; row++) {
      for (let col = 0; col < pixels[row].length; col++) {
        if (pixels[row][col] === '#') {
          ctx.fillRect(
            startX + col * pixelSize,
            startY + row * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }

    ctx.shadowBlur = 0;
  }

  private renderEyes(ctx: CanvasRenderingContext2D): void {
    const eyeOffset = this.type === 'TOP' ? 2 : (this.type === 'MIDDLE' ? 3 : 2);
    const eyeY = this.position.y + 6 * 2.5 + this.hoverOffset;
    const leftEyeX = this.position.x + this.dimensions.width / 2 - 5;
    const rightEyeX = this.position.x + this.dimensions.width / 2 + 5;

    // Glowing eyes
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.arc(leftEyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  shoot(): Projectile {
    const projectileConfig: ProjectileConfig = {
      position: {
        x: this.position.x + this.dimensions.width / 2 - PROJECTILE.ALIEN.WIDTH / 2,
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
