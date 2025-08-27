// Test file (should be excluded from analysis)
import { add, subtract, multiply, divide } from './calculator.js'

describe('Calculator', () => {
  test('add function', () => {
    expect(add(2, 3)).toBe(5)
  })

  test('subtract function', () => {
    expect(subtract(5, 3)).toBe(2)
  })

  test('multiply function', () => {
    expect(multiply(3, 4)).toBe(12)
  })

  test('divide function', () => {
    expect(divide(10, 2)).toBe(5)
    expect(() => divide(10, 0)).toThrow('Division by zero')
  })
})

// These exports should be ignored because this is a test file
export const TEST_HELPER = 'helper'
export function setupTest() {
  return 'test setup'
}
