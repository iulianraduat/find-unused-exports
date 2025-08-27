// Main application entry point demonstrating mixed module systems
import { add, subtract, multiply, MATH_CONSTANTS } from './src/calculator.js'
import EventEmitter from './src/eventEmitter.js'

// CommonJS require for data processor
const { processArray, sortData, DEFAULT_CONFIG } = require('./src/dataProcessor.js')

// Create event emitter instance
const emitter = new EventEmitter()

// Set up event listeners
emitter.on('calculation', (result) => {
  console.log('Calculation result:', result)
})

emitter.on('data-processed', (data) => {
  console.log('Processed data:', data)
})

// Perform calculations
const sum = add(10, 5)
const difference = subtract(10, 5)
const product = multiply(10, 5)

console.log('Math operations:')
console.log('Sum:', sum)
console.log('Difference:', difference)
console.log('Product:', product)
console.log('PI:', MATH_CONSTANTS.PI)

// Emit calculation events
emitter.emit('calculation', sum)
emitter.emit('calculation', product)

// Process some data
const rawData = ['  hello  ', null, 'world', '', '  javascript  ']
const processed = processArray(rawData)
console.log('Processed array:', processed)

const dataToSort = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
]

const sorted = sortData(dataToSort, 'age')
console.log('Sorted data:', sorted)
console.log('Config:', DEFAULT_CONFIG)

emitter.emit('data-processed', sorted)
