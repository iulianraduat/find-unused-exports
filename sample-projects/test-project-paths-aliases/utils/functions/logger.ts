// Logging utilities accessible via @functions alias
export function logEvent(event: string, data?: any): void {
  console.log(`[EVENT] ${event}:`, data)
}

export function logError(error: Error, context?: string): void {
  console.error(`[ERROR] ${context || 'Unknown'}:`, error.message)
}

// This function is not used anywhere - should be detected as unused
export function logWarning(message: string, data?: any): void {
  console.warn(`[WARNING] ${message}:`, data)
}

// This function is not used anywhere - should be detected as unused
export function logDebug(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${message}:`, data)
  }
}

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const

// This constant is not used anywhere - should be detected as unused
export const DEFAULT_LOG_CONFIG = {
  level: LOG_LEVELS.INFO,
  timestamp: true,
  colors: true,
} as const
