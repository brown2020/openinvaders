// src/lib/entities/alien.ts
import { Entity, EntityConfig, Position } from "./entity";
import { ALIEN, PROJECTILE, GAME_DIMENSIONS } from "@/lib/constants/game";
import { Projectile, ProjectileConfig } from "./projectile";
import { soundManager } from "@/lib/sounds/SoundManager";
import { SoundType } from "@/lib/sounds/SoundTypes";

export type AlienType = "TOP" | "MIDDLE" | "BOTTOM";

export interface AlienConfig extends EntityConfig {
  type: AlienType;
  row: number;
  column: number;
  formationPosition: Position;
}

export class AlienFormation {
  private static direction: number = 1; // 1 for right, -1 for left
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

    // March sound cadence
    soundManager.play(SoundType.ALIEN_MOVE);
    this.marchStepIndex = (this.marchStepIndex + 1) % 4;

    // Interval scales with remaining aliens (fewer aliens -> faster)
    const ratio = alive.length / (ALIEN.ROWS * ALIEN.COLS);
    // Map ratio in (0,1] to interval in [MIN_MOVE_INTERVAL, MOVE_INTERVAL]
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

  constructor(config: AlienConfig) {
    super(config);
    this.type = config.type;
    this.row = config.row;
    this.column = config.column;
    this.formationPosition = config.formationPosition;
    this.points = this.getPoints();
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationDuration = 500;
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
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationDuration) {
      this.animationFrame = (this.animationFrame + 1) % 2;
      this.animationTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.sprite && !this.isDestroyed) {
      // Draw from sprite sheet based on alien type and animation frame
      const typeOffset = this.getTypeOffset();
      ctx.drawImage(
        this.sprite,
        this.animationFrame * this.dimensions.width,
        typeOffset,
        this.dimensions.width,
        this.dimensions.height,
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
    } else {
      // Fallback rendering
      ctx.fillStyle = this.getColorByType();
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
    }
  }

  private getTypeOffset(): number {
    switch (this.type) {
      case "TOP":
        return 0;
      case "MIDDLE":
        return this.dimensions.height;
      case "BOTTOM":
        return this.dimensions.height * 2;
    }
  }

  private getColorByType(): string {
    switch (this.type) {
      case "TOP":
        return "#ff0000";
      case "MIDDLE":
        return "#ff7f00";
      case "BOTTOM":
        return "#ffff00";
    }
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
