// Advanced calculator module with comprehensive ES module patterns

// Basic arithmetic operations (used)
export function add(a, b) {
  validateNumbers(a, b)
  return a + b
}

export function subtract(a, b) {
  validateNumbers(a, b)
  return a - b
}

export function multiply(a, b) {
  validateNumbers(a, b)
  return a * b
}

// Advanced operations (unused - should be detected)
export function divide(a, b) {
  validateNumbers(a, b)
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

export function power(base, exponent) {
  validateNumbers(base, exponent)
  return Math.pow(base, exponent)
}

export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial is only defined for non-negative integers')
  }
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

export function sqrt(n) {
  validateNumbers(n)
  if (n < 0) {
    throw new Error('Square root of negative number is not real')
  }
  return Math.sqrt(n)
}

export function abs(n) {
  validateNumbers(n)
  return Math.abs(n)
}

export function round(n, decimals = 0) {
  validateNumbers(n, decimals)
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}

export function floor(n) {
  validateNumbers(n)
  return Math.floor(n)
}

export function ceil(n) {
  validateNumbers(n)
  return Math.ceil(n)
}

// Trigonometric functions (unused)
export function sin(angle) {
  validateNumbers(angle)
  return Math.sin(angle)
}

export function cos(angle) {
  validateNumbers(angle)
  return Math.cos(angle)
}

export function tan(angle) {
  validateNumbers(angle)
  return Math.tan(angle)
}

export function toRadians(degrees) {
  validateNumbers(degrees)
  return degrees * (Math.PI / 180)
}

export function toDegrees(radians) {
  validateNumbers(radians)
  return radians * (180 / Math.PI)
}

// Statistical functions (unused)
export function mean(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Mean requires a non-empty array of numbers')
  }
  numbers.forEach(validateNumbers)
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

export function median(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Median requires a non-empty array of numbers')
  }
  numbers.forEach(validateNumbers)
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function mode(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Mode requires a non-empty array of numbers')
  }
  numbers.forEach(validateNumbers)

  const frequency = {}
  let maxFreq = 0
  let modes = []

  numbers.forEach((num) => {
    frequency[num] = (frequency[num] || 0) + 1
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num]
      modes = [num]
    } else if (frequency[num] === maxFreq && !modes.includes(num)) {
      modes.push(num)
    }
  })

  return modes.length === numbers.length ? [] : modes
}

export function standardDeviation(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Standard deviation requires a non-empty array of numbers')
  }
  numbers.forEach(validateNumbers)

  const avg = mean(numbers)
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2))
  const avgSquaredDiff = mean(squaredDiffs)
  return Math.sqrt(avgSquaredDiff)
}

// Utility functions
function validateNumbers(...args) {
  args.forEach((arg) => {
    if (typeof arg !== 'number' || isNaN(arg)) {
      throw new Error(`Expected number, got ${typeof arg}: ${arg}`)
    }
  })
}

// Complex number operations (unused)
export class ComplexNumber {
  constructor(real, imaginary = 0) {
    validateNumbers(real, imaginary)
    this.real = real
    this.imaginary = imaginary
  }

  add(other) {
    if (!(other instanceof ComplexNumber)) {
      other = new ComplexNumber(other, 0)
    }
    return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary)
  }

  subtract(other) {
    if (!(other instanceof ComplexNumber)) {
      other = new ComplexNumber(other, 0)
    }
    return new ComplexNumber(this.real - other.real, this.imaginary - other.imaginary)
  }

  multiply(other) {
    if (!(other instanceof ComplexNumber)) {
      other = new ComplexNumber(other, 0)
    }
    return new ComplexNumber(
      this.real * other.real - this.imaginary * other.imaginary,
      this.real * other.imaginary + this.imaginary * other.real,
    )
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary)
  }

  toString() {
    if (this.imaginary === 0) return this.real.toString()
    if (this.real === 0) return `${this.imaginary}i`
    const sign = this.imaginary >= 0 ? '+' : '-'
    return `${this.real} ${sign} ${Math.abs(this.imaginary)}i`
  }
}

// Constants and configurations
export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
  SQRT_2: Math.sqrt(2),
  SQRT_3: Math.sqrt(3),
  LN_2: Math.LN2,
  LN_10: Math.LN10,
  LOG_2_E: Math.LOG2E,
  LOG_10_E: Math.LOG10E,
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_MATH_CONSTANT = {
  GOLDEN_RATIO: 1.618033988749,
  SILVER_RATIO: 1 + Math.sqrt(2),
  EULER_MASCHERONI: 0.5772156649015329,
  CATALAN: 0.915965594177219015054603514932384110774,
}

// This constant is not used anywhere - should be detected as unused
export const CALCULATION_MODES = {
  DEGREES: 'degrees',
  RADIANS: 'radians',
  GRADIANS: 'gradians',
}

// This constant is not used anywhere - should be detected as unused
export const PRECISION_LEVELS = {
  LOW: 2,
  MEDIUM: 4,
  HIGH: 8,
  ULTRA: 16,
}

// Default export (unused)
export default {
  add,
  subtract,
  multiply,
  divide,
  MATH_CONSTANTS,
  ComplexNumber,
}
