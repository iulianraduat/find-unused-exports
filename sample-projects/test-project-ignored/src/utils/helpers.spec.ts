// Spec file - should be excluded from analysis
import { formatNumber, isEven, isOdd, clamp } from './helpers'

// These test functions use exports that might otherwise be considered unused
export function testFormatNumber(): void {
  console.assert(formatNumber(1000) === '1,000', 'Format number should work')
}

export function testIsEven(): void {
  console.assert(isEven(4) === true, 'isEven should work')
  console.assert(isEven(3) === false, 'isEven should work')
}

export function testIsOdd(): void {
  console.assert(isOdd(3) === true, 'isOdd should work')
  console.assert(isOdd(4) === false, 'isOdd should work')
}

export function testClamp(): void {
  console.assert(clamp(5, 0, 10) === 5, 'clamp should work')
  console.assert(clamp(-5, 0, 10) === 0, 'clamp should work')
  console.assert(clamp(15, 0, 10) === 10, 'clamp should work')
}

// This interface should be ignored since spec files are excluded
export interface TestConfig {
  timeout: number
  retries: number
}

// Run tests
testFormatNumber()
testIsEven()
testIsOdd()
testClamp()

console.log('All helper tests passed!')
