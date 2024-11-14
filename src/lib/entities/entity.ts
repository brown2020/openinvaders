// src/lib/entities/entity.ts
export type Position = {
  x: number;
  y: number;
};

export type EntityDimensions = {
  width: number;
  height: number;
};

export type EntityConfig = {
  position: Position;
  dimensions: EntityDimensions;
  sprite?: HTMLImageElement;
};

export abstract class Entity {
  position: Position;
  dimensions: EntityDimensions;
  velocity: Position;
  sprite?: HTMLImageElement;
  isDestroyed: boolean;
  isActive: boolean;

  constructor(config: EntityConfig) {
    this.position = config.position;
    this.dimensions = config.dimensions;
    this.sprite = config.sprite;
    this.velocity = { x: 0, y: 0 };
    this.isDestroyed = false;
    this.isActive = true;
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  getBoundingBox() {
    return {
      left: this.position.x,
      right: this.position.x + this.dimensions.width,
      top: this.position.y,
      bottom: this.position.y + this.dimensions.height,
    };
  }

  collidesWith(other: Entity): boolean {
    const a = this.getBoundingBox();
    const b = other.getBoundingBox();

    return !(
      a.left >= b.right ||
      a.right <= b.left ||
      a.top >= b.bottom ||
      a.bottom <= b.top
    );
  }
}
