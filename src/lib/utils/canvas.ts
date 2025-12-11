// src/lib/utils/canvas.ts

import { alphaToHex } from "./color";

/**
 * Render pixel art from a string pattern
 * @param ctx - Canvas context
 * @param pixels - Array of strings where '#' represents a filled pixel
 * @param x - Start X position
 * @param y - Start Y position
 * @param pixelSize - Size of each pixel
 * @param color - Fill color
 */
export function renderPixelArt(
  ctx: CanvasRenderingContext2D,
  pixels: readonly string[],
  x: number,
  y: number,
  pixelSize: number,
  color: string
): void {
  ctx.fillStyle = color;

  for (let row = 0; row < pixels.length; row++) {
    const rowData = pixels[row];
    for (let col = 0; col < rowData.length; col++) {
      if (rowData[col] === "#") {
        ctx.fillRect(
          x + col * pixelSize,
          y + row * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

/**
 * Draw a radial glow effect
 * @param ctx - Canvas context
 * @param centerX - Center X position
 * @param centerY - Center Y position
 * @param radius - Glow radius
 * @param color - Base color (hex format)
 * @param innerAlpha - Alpha at center (0-1)
 * @param outerAlpha - Alpha at edge (0-1), defaults to 0
 */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
  innerAlpha: number = 0.25,
  outerAlpha: number = 0
): void {
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );

  const innerHex = alphaToHex(innerAlpha);
  const outerHex = alphaToHex(outerAlpha);

  gradient.addColorStop(0, `${color}${innerHex}`);
  gradient.addColorStop(
    1,
    outerHex === "00" ? "transparent" : `${color}${outerHex}`
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
}

/**
 * Draw a multi-stop radial glow (for more complex glow effects)
 * @param ctx - Canvas context
 * @param centerX - Center X position
 * @param centerY - Center Y position
 * @param radius - Glow radius
 * @param color - Base color (hex format)
 * @param stops - Array of [position, alpha] tuples
 */
export function drawMultiGlow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
  stops: [number, number][]
): void {
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );

  for (const [position, alpha] of stops) {
    const hex = alphaToHex(alpha);
    gradient.addColorStop(
      position,
      alpha === 0 ? "transparent" : `${color}${hex}`
    );
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
}
