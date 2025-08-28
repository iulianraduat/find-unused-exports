// Core calculator functionality (should be analyzed)
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

export function multiply(a, b) {
  return a * b
}

// This function is not used anywhere - should be detected as unused
export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

// This function is not used anywhere - should be detected as unused
export function power(base, exponent) {
  return Math.pow(base, exponent)
}

export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_MATH_CONSTANT = {
  GOLDEN_RATIO: 1.618033988749,
}
