// src/components/game/GameCanvas.tsx
import React, { useCallback, useEffect, useRef } from "react";
import { GAME_DIMENSIONS } from "@/lib/constants/game";
import { Entity } from "@/lib/entities/entity";

interface GameCanvasProps {
  entities: Entity[];
  background?: string;
  className?: string;
  onReady?: (context: CanvasRenderingContext2D) => void;
  version?: number;
}

interface RenderableEntity extends Entity {
  renderOrder?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  entities,
  background = "#000",
  className = "",
  onReady,
  version = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Could not get 2D context");
      return;
    }

    mainCtxRef.current = ctx;

    // Notify parent component that canvas is ready
    if (onReady) {
      onReady(ctx);
    }
  }, [onReady]);

  // Render function
  const render = useCallback(() => {
    if (!canvasRef.current || !mainCtxRef.current) return;

    const ctx = mainCtxRef.current;

    // Clear canvas
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT);

    // Render grid for debug purposes (comment out in production)
    if (process.env.NODE_ENV === "development") {
      renderDebugGrid(ctx);
    }

    // Sort entities by their render order (if specified)
    const sortedEntities = [...entities].sort(
      (a: RenderableEntity, b: RenderableEntity) => {
        return (a.renderOrder ?? 0) - (b.renderOrder ?? 0);
      }
    );

    // Render all entities
    sortedEntities.forEach((entity) => {
      if (!entity.isDestroyed) {
        entity.render(ctx);
      }
    });

    // Continue render loop
    animationFrameRef.current = requestAnimationFrame(render);
  }, [background, entities]);

  // Set up render loop
  useEffect(() => {
    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      // Clean up render loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [entities, background, render, version]); // Recreate loop when entities/background/version changes

  // Debug grid rendering
  const renderDebugGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= GAME_DIMENSIONS.WIDTH; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_DIMENSIONS.HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= GAME_DIMENSIONS.HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_DIMENSIONS.WIDTH, y);
      ctx.stroke();
    }
  };

  // Handle canvas scaling on mount
  useEffect(() => {
    if (!canvasRef.current || !mainCtxRef.current) return;

    const canvas = canvasRef.current;
    const context = mainCtxRef.current;

    // Scale canvas for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = GAME_DIMENSIONS.WIDTH;
    const height = GAME_DIMENSIONS.HEIGHT;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(devicePixelRatio, devicePixelRatio);

    // Enable image smoothing for crisp pixel art
    context.imageSmoothingEnabled = false;

    return () => {
      // Clean up if needed
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_DIMENSIONS.WIDTH}
      height={GAME_DIMENSIONS.HEIGHT}
      className={`block ${className}`}
      style={{
        imageRendering: "pixelated", // Crisp pixel art rendering
        backgroundColor: background,
      }}
    />
  );
};

export enum RENDER_ORDER {
  BACKGROUND = 0,
  BARRIERS = 1,
  PROJECTILES = 2,
  ALIENS = 3,
  PLAYER = 4,
  EFFECTS = 5,
}

export default GameCanvas;
