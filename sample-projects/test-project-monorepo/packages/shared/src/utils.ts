// Comprehensive shared utility functions

import { ValidationError, FilterOptions, SortOptions, SearchOptions } from './types'

// Date and time utilities
export function formatDate(date: Date, format: 'iso' | 'short' | 'long' = 'iso'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US')
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'iso':
    default:
      return date.toISOString().split('T')[0]
  }
}

export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${id}` : id
}

// This function is not used anywhere - should be detected as unused
export function formatDateTime(date: Date, includeSeconds: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  }
  return date.toLocaleString('en-US', options)
}

// This function is not used anywhere - should be detected as unused
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(date, 'short')
}

// This function is not used anywhere - should be detected as unused
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// This function is not used anywhere - should be detected as unused
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// This function is not used anywhere - should be detected as unused
export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
      code: 'MIN_LENGTH',
      value: password.length,
    })
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
      code: 'MISSING_UPPERCASE',
    })
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
      code: 'MISSING_LOWERCASE',
    })
  }

  if (!/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
      code: 'MISSING_NUMBER',
    })
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
      code: 'MISSING_SPECIAL',
    })
  }

  return errors
}

// This function is not used anywhere - should be detected as unused
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// This function is not used anywhere - should be detected as unused
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

// String utilities
// This function is not used anywhere - should be detected as unused
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// This function is not used anywhere - should be detected as unused
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// This function is not used anywhere - should be detected as unused
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/\s+/g, '')
}

// This function is not used anywhere - should be detected as unused
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// This function is not used anywhere - should be detected as unused
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

// Array utilities
// This function is not used anywhere - should be detected as unused
export function groupBy<T, K extends string | number | symbol>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    },
    {} as Record<K, T[]>,
  )
}

// This function is not used anywhere - should be detected as unused
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)]
  }

  const seen = new Set()
  return array.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

// This function is not used anywhere - should be detected as unused
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be positive')

  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// This function is not used anywhere - should be detected as unused
export function sortBy<T>(array: T[], options: SortOptions[]): T[] {
  return [...array].sort((a, b) => {
    for (const option of options) {
      const aValue = (a as any)[option.field]
      const bValue = (b as any)[option.field]

      if (aValue < bValue) return option.order === 'asc' ? -1 : 1
      if (aValue > bValue) return option.order === 'asc' ? 1 : -1
    }
    return 0
  })
}

// This function is not used anywhere - should be detected as unused
export function filterBy<T>(array: T[], filters: FilterOptions[]): T[] {
  return array.filter((item) => {
    return filters.every((filter) => {
      const value = (item as any)[filter.field]

      switch (filter.operator) {
        case 'equals':
          return value === filter.value
        case 'not_equals':
          return value !== filter.value
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'starts_with':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
        case 'ends_with':
          return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
        case 'greater_than':
          return value > filter.value
        case 'less_than':
          return value < filter.value
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value)
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(value)
        default:
          return true
      }
    })
  })
}

// This function is not used anywhere - should be detected as unused
export function searchIn<T>(array: T[], options: SearchOptions): T[] {
  if (!options.query.trim()) return array

  const query = options.query.toLowerCase()

  return array.filter((item) => {
    return options.fields.some((field) => {
      const value = String((item as any)[field] || '').toLowerCase()

      if (options.fuzzy) {
        // Simple fuzzy search - check if all characters of query exist in order
        let queryIndex = 0
        for (let i = 0; i < value.length && queryIndex < query.length; i++) {
          if (value[i] === query[queryIndex]) {
            queryIndex++
          }
        }
        return queryIndex === query.length
      } else {
        return value.includes(query)
      }
    })
  })
}

// Object utilities
// This function is not used anywhere - should be detected as unused
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach((key) => {
      ;(cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }
  return obj
}

// This function is not used anywhere - should be detected as unused
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

// This function is not used anywhere - should be detected as unused
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// This function is not used anywhere - should be detected as unused
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

// Helper function for deepMerge
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

// Function composition utilities
// This function is not used anywhere - should be detected as unused
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func(...args)
    }, wait)

    if (callNow) func(...args)
  }
}

// This function is not used anywhere - should be detected as unused
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// This function is not used anywhere - should be detected as unused
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T & { cache: Map<string, ReturnType<T>>; clear: () => void } {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T & { cache: Map<string, ReturnType<T>>; clear: () => void }

  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized
}

// Async utilities
// This function is not used anywhere - should be detected as unused
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// This function is not used anywhere - should be detected as unused
export async function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, delay: number = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break
      await sleep(delay * Math.pow(2, attempt - 1)) // Exponential backoff
    }
  }

  throw lastError!
}

// This function is not used anywhere - should be detected as unused
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)),
  ])
}

// Constants
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: 'Minimum length not met',
  MAX_LENGTH: 'Maximum length exceeded',
  INVALID_FORMAT: 'Invalid format',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
} as const

// This constant is not used anywhere - should be detected as unused
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// This constant is not used anywhere - should be detected as unused
export const MIME_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  HTML: 'text/html',
  CSS: 'text/css',
  JS: 'application/javascript',
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
} as const

// This constant is not used anywhere - should be detected as unused
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/DD/YYYY HH:mm:ss',
} as const

// This constant is not used anywhere - should be detected as unused
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\()]{10,}$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const
