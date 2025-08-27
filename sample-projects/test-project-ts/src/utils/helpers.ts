// Enhanced utility functions with comprehensive examples
export function formatDate(date: Date, format: DateFormat = 'iso'): string {
  switch (format) {
    case 'iso':
      return date.toISOString()
    case 'short':
      return date.toLocaleDateString()
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'time':
      return date.toLocaleTimeString()
    case 'datetime':
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    default:
      return date.toString()
  }
}

export type DateFormat = 'iso' | 'short' | 'long' | 'time' | 'datetime'

export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

// Object utilities
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T

  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// Validation utilities
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Async utilities
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, delayMs: number = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt)
      }
    }
  }

  throw lastError!
}

// Constants
export const CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  DEFAULT_TIMEOUT: 5000,
  API_VERSION: 'v1',
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const

// UNUSED EXPORTS - These should be detected by the extension
export function unusedHelperFunction(): string {
  return 'This function is never used'
}

export const UNUSED_HELPER_CONSTANT = {
  value: 'unused',
  number: 42,
}

export class UnusedHelperClass {
  private data: string[] = []

  addData(item: string): void {
    this.data.push(item)
  }

  getData(): string[] {
    return this.data
  }
}

export interface UnusedHelperInterface {
  id: string
  name: string
  value: number
}

export type UnusedHelperType = {
  status: 'active' | 'inactive'
  metadata: Record<string, any>
}

export enum UnusedHelperEnum {
  OPTION_A = 'a',
  OPTION_B = 'b',
  OPTION_C = 'c',
}
