// Error handling utilities
import { ApiResponse } from '@/types/api'

export function handleError<T>(error: any): ApiResponse<T> {
  console.error('API Error:', error)

  return {
    data: null as any,
    success: false,
    status: 500,
    error: error.message || 'An unexpected error occurred',
  }
}

// This function is not used anywhere - should be detected as unused
export function createError(message: string, code?: string): Error {
  const error = new Error(message)
  if (code) {
    ;(error as any).code = code
  }
  return error
}

// This class is not used anywhere - should be detected as unused
export class ApiError extends Error {
  public status: number
  public code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
