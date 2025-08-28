// Comprehensive data processing utilities with CommonJS patterns

const _ = require('lodash')
const fs = require('fs')
const path = require('path')

// Core data processing functions (used)
function processArray(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array')
  }
  return arr
    .filter((item) => item !== null && item !== '')
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
}

function sortData(data, key, order = 'asc') {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }

  const sorted = _.sortBy(data, key)
  return order === 'desc' ? sorted.reverse() : sorted
}

// Advanced data processing functions (unused - should be detected)
function groupData(data, key) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  return _.groupBy(data, key)
}

function aggregateData(data, aggregator) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  if (typeof aggregator !== 'function') {
    throw new Error('Aggregator must be a function')
  }
  return data.reduce(aggregator, {})
}

function filterData(data, predicate) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function')
  }
  return data.filter(predicate)
}

function transformData(data, transformer) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  if (typeof transformer !== 'function') {
    throw new Error('Transformer must be a function')
  }
  return data.map(transformer)
}

function flattenData(data, depth = 1) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  return _.flattenDeep(data)
}

function uniqueData(data, key) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  return key ? _.uniqBy(data, key) : _.uniq(data)
}

function chunkData(data, size) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }
  if (typeof size !== 'number' || size <= 0) {
    throw new Error('Size must be a positive number')
  }
  return _.chunk(data, size)
}

function mergeData(...datasets) {
  return datasets.reduce((merged, dataset) => {
    if (!Array.isArray(dataset)) {
      throw new Error('All datasets must be arrays')
    }
    return merged.concat(dataset)
  }, [])
}

function intersectData(data1, data2, key) {
  if (!Array.isArray(data1) || !Array.isArray(data2)) {
    throw new Error('Both datasets must be arrays')
  }
  return key ? _.intersectionBy(data1, data2, key) : _.intersection(data1, data2)
}

function differenceData(data1, data2, key) {
  if (!Array.isArray(data1) || !Array.isArray(data2)) {
    throw new Error('Both datasets must be arrays')
  }
  return key ? _.differenceBy(data1, data2, key) : _.difference(data1, data2)
}

// Statistical analysis functions (unused)
function calculateStats(data, key) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }

  const values = key
    ? data.map((item) => item[key]).filter((val) => typeof val === 'number')
    : data.filter((val) => typeof val === 'number')

  if (values.length === 0) {
    return { count: 0, sum: 0, mean: 0, min: 0, max: 0, median: 0 }
  }

  const sorted = values.sort((a, b) => a - b)
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / values.length
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

  return {
    count: values.length,
    sum,
    mean,
    min: Math.min(...values),
    max: Math.max(...values),
    median,
  }
}

function findOutliers(data, key, threshold = 1.5) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }

  const values = key
    ? data.map((item) => item[key]).filter((val) => typeof val === 'number')
    : data.filter((val) => typeof val === 'number')

  if (values.length === 0) return []

  const sorted = values.sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - threshold * iqr
  const upperBound = q3 + threshold * iqr

  return values.filter((val) => val < lowerBound || val > upperBound)
}

function normalizeData(data, key, min = 0, max = 1) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }

  const values = key
    ? data.map((item) => item[key]).filter((val) => typeof val === 'number')
    : data.filter((val) => typeof val === 'number')

  if (values.length === 0) return data

  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const range = dataMax - dataMin

  if (range === 0) return data

  return data.map((item) => {
    if (key && typeof item === 'object') {
      return {
        ...item,
        [key]: min + ((item[key] - dataMin) / range) * (max - min),
      }
    } else if (typeof item === 'number') {
      return min + ((item - dataMin) / range) * (max - min)
    }
    return item
  })
}

// File I/O functions (unused)
function loadDataFromFile(filePath, format = 'json') {
  try {
    const fullPath = path.resolve(filePath)
    const data = fs.readFileSync(fullPath, 'utf8')

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.parse(data)
      case 'csv':
        return parseCSV(data)
      case 'txt':
        return data.split('\n').filter((line) => line.trim())
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  } catch (error) {
    throw new Error(`Failed to load data from ${filePath}: ${error.message}`)
  }
}

function saveDataToFile(data, filePath, format = 'json') {
  try {
    const fullPath = path.resolve(filePath)
    const dir = path.dirname(fullPath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    let content
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        break
      case 'csv':
        content = formatCSV(data)
        break
      case 'txt':
        content = Array.isArray(data) ? data.join('\n') : String(data)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    fs.writeFileSync(fullPath, content, 'utf8')
    return true
  } catch (error) {
    throw new Error(`Failed to save data to ${filePath}: ${error.message}`)
  }
}

// Helper functions for file I/O
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n')
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map((h) => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }

  return data
}

function formatCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvLines = [headers.join(',')]

  data.forEach((row) => {
    const values = headers.map((header) => row[header] || '')
    csvLines.push(values.join(','))
  })

  return csvLines.join('\n')
}

// Validation functions (unused)
function validateDataStructure(data, schema) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array')
  }

  if (typeof schema !== 'object') {
    throw new Error('Schema must be an object')
  }

  const errors = []

  data.forEach((item, index) => {
    Object.keys(schema).forEach((key) => {
      const expectedType = schema[key]
      const actualValue = item[key]

      if (expectedType === 'required' && (actualValue === undefined || actualValue === null)) {
        errors.push(`Item ${index}: Missing required field '${key}'`)
      } else if (expectedType !== 'required' && actualValue !== undefined && typeof actualValue !== expectedType) {
        errors.push(`Item ${index}: Field '${key}' should be ${expectedType}, got ${typeof actualValue}`)
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function sanitizeData(data, options = {}) {
  const { removeNulls = true, trimStrings = true, removeEmptyObjects = true, removeEmptyArrays = true } = options

  if (Array.isArray(data)) {
    let result = data.map((item) => sanitizeData(item, options))

    if (removeNulls) {
      result = result.filter((item) => item !== null && item !== undefined)
    }

    if (removeEmptyArrays && result.length === 0) {
      return undefined
    }

    return result
  }

  if (typeof data === 'object' && data !== null) {
    const result = {}

    Object.keys(data).forEach((key) => {
      const value = sanitizeData(data[key], options)
      if (value !== undefined) {
        result[key] = value
      }
    })

    if (removeEmptyObjects && Object.keys(result).length === 0) {
      return undefined
    }

    return result
  }

  if (typeof data === 'string' && trimStrings) {
    return data.trim()
  }

  return data
}

// Configuration objects
const DEFAULT_CONFIG = {
  sortOrder: 'asc',
  filterNulls: true,
  trimStrings: true,
  batchSize: 1000,
  enableLogging: false,
}

// This constant is not used anywhere - should be detected as unused
const UNUSED_CONFIG = {
  batchSize: 100,
  timeout: 5000,
  retries: 3,
  cacheEnabled: true,
  compressionLevel: 6,
}

// This constant is not used anywhere - should be detected as unused
const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
  UNDEFINED: 'undefined',
}

// This constant is not used anywhere - should be detected as unused
const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
  NATURAL: 'natural',
}

// This constant is not used anywhere - should be detected as unused
const FILE_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XML: 'xml',
  YAML: 'yaml',
  TXT: 'txt',
}

// Main module exports using various CommonJS patterns
module.exports = {
  // Core functions (used)
  processArray,
  sortData,
  DEFAULT_CONFIG,

  // Advanced functions (unused)
  groupData,
  aggregateData,
  filterData,
  transformData,
  flattenData,
  uniqueData,
  chunkData,
  mergeData,
  intersectData,
  differenceData,

  // Statistical functions (unused)
  calculateStats,
  findOutliers,
  normalizeData,

  // File I/O functions (unused)
  loadDataFromFile,
  saveDataToFile,

  // Validation functions (unused)
  validateDataStructure,
  sanitizeData,

  // Constants (unused)
  UNUSED_CONFIG,
  DATA_TYPES,
  SORT_ORDERS,
  FILE_FORMATS,
}

// Additional named exports using exports object
exports.processArraySync = processArray
exports.sortDataSync = sortData
exports.groupDataSync = groupData
exports.aggregateDataSync = aggregateData

// Individual function exports (unused)
exports.quickSort = (arr) => arr.sort()
exports.binarySearch = (arr, target) => arr.indexOf(target)
exports.linearSearch = (arr, target) => arr.findIndex((item) => item === target)

// Class-based exports (unused)
class DataProcessor {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  process(data) {
    return processArray(data)
  }

  sort(data, key) {
    return sortData(data, key, this.config.sortOrder)
  }

  group(data, key) {
    return groupData(data, key)
  }
}

exports.DataProcessor = DataProcessor

// Factory function (unused)
exports.createProcessor = (config) => new DataProcessor(config)

// Utility exports (unused)
exports.utils = {
  parseCSV,
  formatCSV,
  sanitizeData,
  validateDataStructure,
}

// Version and metadata (unused)
exports.version = '1.0.0'
exports.author = 'Data Processing Team'
exports.description = 'Comprehensive data processing utilities'
