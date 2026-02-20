import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Strip invisible Unicode directional formatting characters that can wrap
// pasted URLs (e.g. U+2068 FIRST STRONG ISOLATE, U+2069 POP DIRECTIONAL ISOLATE)
export function normalizeLocation(str) {
  if (!str) return str;
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').trim();
}
