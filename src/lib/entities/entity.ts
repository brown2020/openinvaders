// src/lib/entities/entity.ts

import { Position, Dimensions, Velocity, BoundingBox, RenderLayer } from '@/types/game';

export type { Position, Dimensions as EntityDimensions };

export interface EntityConfig {
  position: Position;
  dimensions: Dimensions;
  sprite?: HTMLImageElement;
}

/**
 * Base entity class for all game objects
 */
export abstract class Entity {
  position: Position;
  dimensions: Dimensions;
  velocity: Velocity;
  sprite?: HTMLImageElement;
  isDestroyed: boolean;
  isActive: boolean;
  renderLayer: RenderLayer;

  constructor(config: EntityConfig) {
    this.position = { ...config.position };
    this.dimensions = { ...config.dimensions };
    this.sprite = config.sprite;
    this.velocity = { x: 0, y: 0 };
    this.isDestroyed = false;
    this.isActive = true;
    this.renderLayer = RenderLayer.BACKGROUND;
  }

  /**
   * Update entity state
   */
  abstract update(deltaTime: number): void;

  /**
   * Render entity to canvas
   */
  abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * Get axis-aligned bounding box for collision detection
   */
  getBoundingBox(): BoundingBox {
    return {
      left: this.position.x,
      right: this.position.x + this.dimensions.width,
      top: this.position.y,
      bottom: this.position.y + this.dimensions.height,
    };
  }

  /**
   * Get center position
   */
  getCenter(): Position {
    return {
      x: this.position.x + this.dimensions.width / 2,
      y: this.position.y + this.dimensions.height / 2,
    };
  }

  /**
   * Check collision with another entity
   */
  collidesWith(other: Entity): boolean {
    if (this.isDestroyed || other.isDestroyed) return false;
    if (!this.isActive || !other.isActive) return false;

    const a = this.getBoundingBox();
    const b = other.getBoundingBox();

    return !(
      a.left >= b.right ||
      a.right <= b.left ||
      a.top >= b.bottom ||
      a.bottom <= b.top
    );
  }

  /**
   * Get distance to another entity
   */
  distanceTo(other: Entity): number {
    const a = this.getCenter();
    const b = other.getCenter();
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
}
