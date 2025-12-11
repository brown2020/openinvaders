// src/lib/utils/color.ts

/**
 * Adjust brightness of a hex color
 * @param hex - Hex color string (e.g., "#ff0088")
 * @param factor - Brightness factor (0-2, where 1 is unchanged)
 * @returns RGB color string
 */
export function adjustBrightness(hex: string, factor: number): string {
  const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert alpha (0-1) to hex string for appending to color
 * @param alpha - Alpha value (0-1)
 * @returns Two-character hex string
 */
export function alphaToHex(alpha: number): string {
  return Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, "0");
}
