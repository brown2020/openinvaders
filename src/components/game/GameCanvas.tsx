// src/components/game/GameCanvas.tsx

import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { GAME_DIMENSIONS } from "@/lib/constants/game";
import { Entity } from "@/lib/entities/entity";
import {
  ParticleSystem,
  Starfield,
  ScreenShake,
  CRTEffect,
} from "@/lib/effects";
import { GAME_COLORS } from "@/lib/constants/colors";

interface GameCanvasProps {
  entities: Entity[];
  particleSystem: ParticleSystem;
  starfield: Starfield;
  screenShake: ScreenShake;
  crtEffect: CRTEffect;
  className?: string;
  version?: number;
  isPaused?: boolean;
}

// Grid configuration
const GRID_SIZE = 64;
const GRID_COLOR = "rgba(0, 255, 136, 0.03)";
const BORDER_GLOW_SIZE = 30;
const BORDER_WIDTH = 3;
const CORNER_SIZE = 20;

/**
 * Main game canvas component with visual effects
 */
const GameCanvas: React.FC<GameCanvasProps> = ({
  entities,
  particleSystem,
  starfield,
  screenShake,
  crtEffect,
  className = "",
  version = 0,
  isPaused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Cached gradient refs
  const gradientsRef = useRef<{
    background: CanvasGradient | null;
    borderTop: CanvasGradient | null;
    borderBottom: CanvasGradient | null;
    borderLeft: CanvasGradient | null;
    borderRight: CanvasGradient | null;
  }>({
    background: null,
    borderTop: null,
    borderBottom: null,
    borderLeft: null,
    borderRight: null,
  });

  // Pre-render grid to offscreen canvas
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas and cache gradients
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
      console.error("Could not get 2D context");
      return;
    }

    ctxRef.current = ctx;

    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_DIMENSIONS.WIDTH * dpr;
    canvas.height = GAME_DIMENSIONS.HEIGHT * dpr;
    canvas.style.width = `${GAME_DIMENSIONS.WIDTH}px`;
    canvas.style.height = `${GAME_DIMENSIONS.HEIGHT}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // Cache gradients (created once)
    const { WIDTH, HEIGHT } = GAME_DIMENSIONS;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bgGradient.addColorStop(0, "#0a0a18");
    bgGradient.addColorStop(0.5, "#0a0a12");
    bgGradient.addColorStop(1, "#0f0a1a");
    gradientsRef.current.background = bgGradient;

    // Border gradients
    const topGradient = ctx.createLinearGradient(0, 0, 0, BORDER_GLOW_SIZE);
    topGradient.addColorStop(0, `${GAME_COLORS.PRIMARY}66`);
    topGradient.addColorStop(1, "transparent");
    gradientsRef.current.borderTop = topGradient;

    const bottomGradient = ctx.createLinearGradient(
      0,
      HEIGHT - BORDER_GLOW_SIZE,
      0,
      HEIGHT
    );
    bottomGradient.addColorStop(0, "transparent");
    bottomGradient.addColorStop(1, `${GAME_COLORS.PRIMARY}44`);
    gradientsRef.current.borderBottom = bottomGradient;

    const leftGradient = ctx.createLinearGradient(0, 0, CORNER_SIZE, 0);
    leftGradient.addColorStop(0, `${GAME_COLORS.PRIMARY}44`);
    leftGradient.addColorStop(1, "transparent");
    gradientsRef.current.borderLeft = leftGradient;

    const rightGradient = ctx.createLinearGradient(
      WIDTH - CORNER_SIZE,
      0,
      WIDTH,
      0
    );
    rightGradient.addColorStop(0, "transparent");
    rightGradient.addColorStop(1, `${GAME_COLORS.PRIMARY}44`);
    gradientsRef.current.borderRight = rightGradient;

    // Pre-render grid to offscreen canvas
    const gridCanvas = document.createElement("canvas");
    gridCanvas.width = WIDTH;
    gridCanvas.height = HEIGHT;
    const gridCtx = gridCanvas.getContext("2d");

    if (gridCtx) {
      gridCtx.strokeStyle = GRID_COLOR;
      gridCtx.lineWidth = 1;
      gridCtx.beginPath();

      for (let x = 0; x <= WIDTH; x += GRID_SIZE) {
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, HEIGHT);
      }
      for (let y = 0; y <= HEIGHT; y += GRID_SIZE) {
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(WIDTH, y);
      }

      gridCtx.stroke();
      gridCanvasRef.current = gridCanvas;
    }
  }, []);

  // Render function
  const render = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;

    const ctx = ctxRef.current;
    const gradients = gradientsRef.current;
    const { WIDTH, HEIGHT } = GAME_DIMENSIONS;

    ctx.save();

    // Apply screen shake
    screenShake.apply(ctx);

    // Draw cached background gradient
    if (gradients.background) {
      ctx.fillStyle = gradients.background;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    // Draw starfield
    starfield.render(ctx);

    // Draw pre-rendered grid
    if (gridCanvasRef.current) {
      ctx.drawImage(gridCanvasRef.current, 0, 0);
    }

    // Render all entities
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (!entity.isDestroyed && entity.isActive) {
        entity.render(ctx);
      }
    }

    // Render particles
    particleSystem.render(ctx);

    // Apply CRT effects
    crtEffect.render(ctx);

    // Draw screen border glow with cached gradients
    drawBorderGlow(ctx, gradients, WIDTH, HEIGHT);

    ctx.restore();

    // Continue render loop only if not paused
    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(render);
    }
  }, [entities, particleSystem, starfield, screenShake, crtEffect, isPaused]);

  // Set up render loop (respects pause state)
  useEffect(() => {
    // Always render at least once (for pause screen display)
    animationFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [render, version, isPaused]);

  // Memoize box shadow style
  const canvasStyle = useMemo(
    () => ({
      imageRendering: "pixelated" as const,
      boxShadow: `
      0 0 20px ${GAME_COLORS.PRIMARY}44,
      0 0 40px ${GAME_COLORS.PRIMARY}22,
      inset 0 0 60px rgba(0,0,0,0.5)
    `,
    }),
    []
  );

  return (
    <canvas
      ref={canvasRef}
      width={GAME_DIMENSIONS.WIDTH}
      height={GAME_DIMENSIONS.HEIGHT}
      className={`block rounded-lg ${className}`}
      style={canvasStyle}
    />
  );
};

/**
 * Draw glowing border effect using cached gradients
 */
function drawBorderGlow(
  ctx: CanvasRenderingContext2D,
  gradients: {
    borderTop: CanvasGradient | null;
    borderBottom: CanvasGradient | null;
    borderLeft: CanvasGradient | null;
    borderRight: CanvasGradient | null;
  },
  width: number,
  height: number
): void {
  // Draw edge gradients
  if (gradients.borderTop) {
    ctx.fillStyle = gradients.borderTop;
    ctx.fillRect(0, 0, width, BORDER_GLOW_SIZE);
  }

  if (gradients.borderBottom) {
    ctx.fillStyle = gradients.borderBottom;
    ctx.fillRect(0, height - BORDER_GLOW_SIZE, width, BORDER_GLOW_SIZE);
  }

  if (gradients.borderLeft) {
    ctx.fillStyle = gradients.borderLeft;
    ctx.fillRect(0, 0, CORNER_SIZE, height);
  }

  if (gradients.borderRight) {
    ctx.fillStyle = gradients.borderRight;
    ctx.fillRect(width - CORNER_SIZE, 0, CORNER_SIZE, height);
  }

  // Corner accents (static, cheap to draw)
  ctx.strokeStyle = GAME_COLORS.PRIMARY;
  ctx.lineWidth = 2;

  // Top left
  ctx.beginPath();
  ctx.moveTo(BORDER_WIDTH, CORNER_SIZE);
  ctx.lineTo(BORDER_WIDTH, BORDER_WIDTH);
  ctx.lineTo(CORNER_SIZE, BORDER_WIDTH);
  ctx.stroke();

  // Top right
  ctx.beginPath();
  ctx.moveTo(width - CORNER_SIZE, BORDER_WIDTH);
  ctx.lineTo(width - BORDER_WIDTH, BORDER_WIDTH);
  ctx.lineTo(width - BORDER_WIDTH, CORNER_SIZE);
  ctx.stroke();

  // Bottom left
  ctx.beginPath();
  ctx.moveTo(BORDER_WIDTH, height - CORNER_SIZE);
  ctx.lineTo(BORDER_WIDTH, height - BORDER_WIDTH);
  ctx.lineTo(CORNER_SIZE, height - BORDER_WIDTH);
  ctx.stroke();

  // Bottom right
  ctx.beginPath();
  ctx.moveTo(width - CORNER_SIZE, height - BORDER_WIDTH);
  ctx.lineTo(width - BORDER_WIDTH, height - BORDER_WIDTH);
  ctx.lineTo(width - BORDER_WIDTH, height - CORNER_SIZE);
  ctx.stroke();
}

export default GameCanvas;
