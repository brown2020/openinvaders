// src/lib/utils.ts
// Classname utility for Tailwind CSS (kept separate for shadcn/ui compatibility)

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export other utilities for convenience
export * from "./utils/index";
