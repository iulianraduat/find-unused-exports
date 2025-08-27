// Main entry point demonstrating ignored files configuration
import { debounce, TIMING_CONSTANTS } from './lib/utils.js'
import { add, MATH_CONSTANTS, subtract } from './src/core/calculator.js'
import { DEFAULT_PRECISION, formatNumber, isEven } from './src/utils/helpers.ts'

console.log('=== Ignored Files Configuration Demo ===')

console.log('\n--- Calculator Demo ---')
console.log('Using functions from src/core/calculator.js (included in analysis):')

// Use calculator functions
const sum = add(10, 5)
const difference = subtract(10, 5)

console.log(`Sum: ${formatNumber(sum)}`)
console.log(`Difference: ${formatNumber(difference)}`)
console.log(`Is sum even? ${isEven(sum)}`)
console.log(`PI constant: ${MATH_CONSTANTS.PI}`)

console.log('\n--- Utility Functions Demo ---')
console.log('Using functions from lib/utils.js (included in analysis):')

// Use debounced function
const debouncedLog = debounce((message) => {
  console.log(`Debounced: ${message}`)
}, TIMING_CONSTANTS.DEFAULT_DEBOUNCE)

debouncedLog('Hello from debounced function!')

// Demonstrate number utilities
const testNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log('Number analysis:')
testNumbers.forEach((num) => {
  console.log(`  ${formatNumber(num)}: ${isEven(num) ? 'even' : 'odd'}`)
})

console.log('\n--- Configuration Information ---')
console.log('Default precision:', DEFAULT_PRECISION)
console.log('Timing constants:', TIMING_CONSTANTS)

console.log('\n--- File Analysis Rules ---')
console.log('✅ Files in src/ are analyzed (except tests and legacy)')
console.log('✅ Files in lib/ are analyzed (except vendor/)')
console.log('✅ Files in include/ are analyzed')
console.log('❌ Files in src/legacy/ are excluded')
console.log('❌ Files in lib/vendor/ are excluded')
console.log('❌ Test files (*.test.*, *.spec.*) are excluded')
console.log('❌ Files in __tests__/ and __mocks__/ are excluded')
console.log('❌ Configuration files are excluded')
console.log('❌ Build output directories are excluded')
console.log('❌ Documentation and asset files are excluded')

console.log('\n--- Export Analysis Rules ---')
console.log('❌ Main exports are NOT considered used (considerMainExportsUsed: false)')
console.log('✅ Exports used within the same file are ignored')
console.log('❌ Unused types, enums, and interfaces are flagged')
console.log('❌ React lifecycle methods and hooks are ignored via regex')
console.log('❌ API endpoints and event handlers are ignored via regex')

// This export should be detected as unused since considerMainExportsUsed is false
export function mainExportFunction() {
  return 'This main export should be detected as unused'
}

// This export should also be detected as unused
export const UNUSED_MAIN_CONSTANT = {
  version: '1.0.0',
  description: 'Unused constant in main file',
}

// This would be an interface in TypeScript, but this is a JS file
// so we'll use a regular object instead
export const UnusedMainInterface = {
  // This is unused and should be detected
}
