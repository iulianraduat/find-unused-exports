// Utility helpers - included in analysis
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function isEven(num: number): boolean {
  return num % 2 === 0
}

// This function is not used anywhere - should be detected as unused
export function isOdd(num: number): boolean {
  return num % 2 !== 0
}

// This function is not used anywhere - should be detected as unused
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export interface NumberFormatter {
  format(num: number): string
}

// This interface is not used anywhere - should be detected as unused
export interface MathUtils {
  add(a: number, b: number): number
  subtract(a: number, b: number): number
}

export const DEFAULT_PRECISION = 2

// This constant is not used anywhere - should be detected as unused
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER
