// API-related types
export interface ApiResponse<T> {
  data: T
  success: boolean
  status: number
  error?: string
}

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

// This interface is not used anywhere - should be detected as unused
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
  }
}

// This type is not used anywhere - should be detected as unused
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
