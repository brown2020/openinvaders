// src/components/game/GameCanvas.tsx

import React, { useCallback, useEffect, useRef } from 'react';
import { GAME_DIMENSIONS } from '@/lib/constants/game';
import { Entity } from '@/lib/entities/entity';
import { ParticleSystem, Starfield, ScreenShake, CRTEffect } from '@/lib/effects';
import { GAME_COLORS } from '@/types/game';

interface GameCanvasProps {
  entities: Entity[];
  particleSystem: ParticleSystem;
  starfield: Starfield;
  screenShake: ScreenShake;
  crtEffect: CRTEffect;
  className?: string;
  version?: number;
}

/**
 * Main game canvas component with visual effects
 */
const GameCanvas: React.FC<GameCanvasProps> = ({
  entities,
  particleSystem,
  starfield,
  screenShake,
  crtEffect,
  className = '',
  version = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      console.error('Could not get 2D context');
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

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
  }, []);

  // Render function
  const render = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;

    const ctx = ctxRef.current;

    ctx.save();

    // Apply screen shake
    screenShake.apply(ctx);

    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, GAME_DIMENSIONS.HEIGHT);
    bgGradient.addColorStop(0, '#0a0a18');
    bgGradient.addColorStop(0.5, '#0a0a12');
    bgGradient.addColorStop(1, '#0f0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, GAME_DIMENSIONS.WIDTH, GAME_DIMENSIONS.HEIGHT);

    // Draw starfield
    starfield.render(ctx);

    // Draw subtle grid lines for depth
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_DIMENSIONS.WIDTH; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_DIMENSIONS.HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_DIMENSIONS.HEIGHT; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_DIMENSIONS.WIDTH, y);
      ctx.stroke();
    }

    // Render all entities
    entities.forEach((entity) => {
      if (!entity.isDestroyed && entity.isActive) {
        entity.render(ctx);
      }
    });

    // Render particles
    particleSystem.render(ctx);

    // Apply CRT effects
    crtEffect.render(ctx);

    // Draw screen border glow
    drawBorderGlow(ctx);

    ctx.restore();

    // Continue render loop
    animationFrameRef.current = requestAnimationFrame(render);
  }, [entities, particleSystem, starfield, screenShake, crtEffect]);

  // Set up render loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [render, version]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_DIMENSIONS.WIDTH}
      height={GAME_DIMENSIONS.HEIGHT}
      className={`block rounded-lg ${className}`}
      style={{
        imageRendering: 'pixelated',
        boxShadow: `
          0 0 20px ${GAME_COLORS.PRIMARY}44,
          0 0 40px ${GAME_COLORS.PRIMARY}22,
          inset 0 0 60px rgba(0,0,0,0.5)
        `,
      }}
    />
  );
};

/**
 * Draw glowing border effect
 */
function drawBorderGlow(ctx: CanvasRenderingContext2D): void {
  const width = GAME_DIMENSIONS.WIDTH;
  const height = GAME_DIMENSIONS.HEIGHT;
  const borderWidth = 3;

  // Top edge
  const topGradient = ctx.createLinearGradient(0, 0, 0, 30);
  topGradient.addColorStop(0, `${GAME_COLORS.PRIMARY}66`);
  topGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, width, 30);

  // Bottom edge
  const bottomGradient = ctx.createLinearGradient(0, height - 30, 0, height);
  bottomGradient.addColorStop(0, 'transparent');
  bottomGradient.addColorStop(1, `${GAME_COLORS.PRIMARY}44`);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, height - 30, width, 30);

  // Side edges
  const leftGradient = ctx.createLinearGradient(0, 0, 20, 0);
  leftGradient.addColorStop(0, `${GAME_COLORS.PRIMARY}44`);
  leftGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = leftGradient;
  ctx.fillRect(0, 0, 20, height);

  const rightGradient = ctx.createLinearGradient(width - 20, 0, width, 0);
  rightGradient.addColorStop(0, 'transparent');
  rightGradient.addColorStop(1, `${GAME_COLORS.PRIMARY}44`);
  ctx.fillStyle = rightGradient;
  ctx.fillRect(width - 20, 0, 20, height);

  // Corner accents
  ctx.strokeStyle = GAME_COLORS.PRIMARY;
  ctx.lineWidth = 2;
  
  // Top left
  ctx.beginPath();
  ctx.moveTo(borderWidth, 20);
  ctx.lineTo(borderWidth, borderWidth);
  ctx.lineTo(20, borderWidth);
  ctx.stroke();
  
  // Top right
  ctx.beginPath();
  ctx.moveTo(width - 20, borderWidth);
  ctx.lineTo(width - borderWidth, borderWidth);
  ctx.lineTo(width - borderWidth, 20);
  ctx.stroke();
  
  // Bottom left
  ctx.beginPath();
  ctx.moveTo(borderWidth, height - 20);
  ctx.lineTo(borderWidth, height - borderWidth);
  ctx.lineTo(20, height - borderWidth);
  ctx.stroke();
  
  // Bottom right
  ctx.beginPath();
  ctx.moveTo(width - 20, height - borderWidth);
  ctx.lineTo(width - borderWidth, height - borderWidth);
  ctx.lineTo(width - borderWidth, height - 20);
  ctx.stroke();
}

export default GameCanvas;
