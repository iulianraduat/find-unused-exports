// Advanced API service with complex TypeScript patterns and error handling

// Type definitions for API responses
export interface ApiResponse<T = any> {
  data: T
  status: number
  message: string
  timestamp: string
  requestId: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// Request configuration types
export interface RequestConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  signal?: AbortSignal
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'api-key'
  token?: string
  username?: string
  password?: string
  apiKey?: string
  apiKeyHeader?: string
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

// Custom error classes
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message)
    this.name = 'ApiServiceError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Main API service class with advanced features
export class ApiService {
  private baseUrl: string
  private defaultConfig: RequestConfig
  private authConfig?: AuthConfig
  private interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>
    response: Array<(response: Response) => Response | Promise<Response>>
  } = { request: [], response: [] }

  constructor(baseUrl: string, defaultConfig: RequestConfig = {}, authConfig?: AuthConfig) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...defaultConfig,
    }
    this.authConfig = authConfig
  }

  // Core HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config)
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config)
  }

  // This method is not used anywhere - should be detected as unused
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config)
  }

  // This method is not used anywhere - should be detected as unused
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config)
  }

  // This method is not used anywhere - should be detected as unused
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config)
  }

  // This method is not used anywhere - should be detected as unused
  async head(endpoint: string, config?: RequestConfig): Promise<Response> {
    const response = await this.makeRequest('HEAD', endpoint, undefined, config)
    return response
  }

  // Paginated requests
  // This method is not used anywhere - should be detected as unused
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 20,
    config?: RequestConfig,
  ): Promise<PaginatedResponse<T>> {
    const params = { page: page.toString(), limit: limit.toString() }
    const mergedConfig = { ...config, params: { ...config?.params, ...params } }
    return this.request<T[]>('GET', endpoint, undefined, mergedConfig) as Promise<PaginatedResponse<T>>
  }

  // Batch requests
  // This method is not used anywhere - should be detected as unused
  async batch<T>(requests: Array<{ method: HttpMethod; endpoint: string; data?: any }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map((req) => this.request<T>(req.method, req.endpoint, req.data))
    return Promise.all(promises)
  }

  // File upload
  // This method is not used anywhere - should be detected as unused
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const uploadConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Remove Content-Type to let browser set it with boundary
      },
    }
    delete uploadConfig.headers?.['Content-Type']

    return this.request<T>('POST', endpoint, formData, uploadConfig)
  }

  // Core request method with retry logic and error handling
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const mergedConfig = { ...this.defaultConfig, ...config }
    let lastError: Error

    for (let attempt = 0; attempt <= (mergedConfig.retries || 0); attempt++) {
      try {
        const response = await this.makeRequest(method, endpoint, data, mergedConfig)
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as Error

        if (attempt === (mergedConfig.retries || 0)) {
          break
        }

        // Only retry on network errors or 5xx status codes
        if (error instanceof NetworkError || (error instanceof ApiServiceError && error.status >= 500)) {
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
          continue
        }

        throw error
      }
    }

    throw lastError!
  }

  private async makeRequest(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<Response> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = await this.buildHeaders(config?.headers)

    // Apply request interceptors
    let finalConfig = { ...config, headers }
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig)
    }

    const requestInit: RequestInit = {
      method,
      headers: finalConfig.headers,
      signal: config?.signal,
    }

    if (data && method !== 'GET' && method !== 'HEAD') {
      requestInit.body = data instanceof FormData ? data : JSON.stringify(data)
    }

    try {
      let response = await fetch(url, requestInit)

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response)
      }

      return response
    } catch (error) {
      throw new NetworkError('Network request failed', error as Error)
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await this.safeJsonParse(response)
      throw new ApiServiceError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData?.code || 'HTTP_ERROR',
        errorData,
      )
    }

    const data = await this.safeJsonParse(response)

    // Handle different response formats
    if (this.isApiResponse(data)) {
      return data
    }

    // Wrap plain data in ApiResponse format
    return {
      data,
      status: response.status,
      message: 'Success',
      timestamp: new Date().toISOString(),
      requestId: response.headers.get('x-request-id') || this.generateRequestId(),
    }
  }

  private async safeJsonParse(response: Response): Promise<any> {
    try {
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } catch {
      return null
    }
  }

  private isApiResponse(data: any): data is ApiResponse {
    return data && typeof data === 'object' && 'data' in data && 'status' in data
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  private async buildHeaders(additionalHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers = { ...this.defaultConfig.headers, ...additionalHeaders }

    if (this.authConfig) {
      switch (this.authConfig.type) {
        case 'bearer':
          if (this.authConfig.token) {
            headers['Authorization'] = `Bearer ${this.authConfig.token}`
          }
          break
        case 'basic':
          if (this.authConfig.username && this.authConfig.password) {
            const credentials = btoa(`${this.authConfig.username}:${this.authConfig.password}`)
            headers['Authorization'] = `Basic ${credentials}`
          }
          break
        case 'api-key':
          if (this.authConfig.apiKey) {
            const headerName = this.authConfig.apiKeyHeader || 'X-API-Key'
            headers[headerName] = this.authConfig.apiKey
          }
          break
      }
    }

    return headers
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Interceptor methods
  // This method is not used anywhere - should be detected as unused
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>): void {
    this.interceptors.request.push(interceptor)
  }

  // This method is not used anywhere - should be detected as unused
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.interceptors.response.push(interceptor)
  }

  // Configuration methods
  // This method is not used anywhere - should be detected as unused
  setAuth(authConfig: AuthConfig): void {
    this.authConfig = authConfig
  }

  // This method is not used anywhere - should be detected as unused
  updateDefaultConfig(config: Partial<RequestConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }
}

// Factory functions
// This function is not used anywhere - should be detected as unused
export function createApiClient(baseUrl: string, config?: RequestConfig, auth?: AuthConfig): ApiService {
  return new ApiService(baseUrl, config, auth)
}

// This function is not used anywhere - should be detected as unused
export function createAuthenticatedClient(baseUrl: string, token: string): ApiService {
  return new ApiService(baseUrl, {}, { type: 'bearer', token })
}

// Constants and configurations
export const API_ENDPOINTS = {
  USERS: '/users',
  POSTS: '/posts',
  COMMENTS: '/comments',
  AUTH: '/auth',
  UPLOAD: '/upload',
  HEALTH: '/health',
} as const

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]

// This constant is not used anywhere - should be detected as unused
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// This constant is not used anywhere - should be detected as unused
export const DEFAULT_REQUEST_CONFIG: RequestConfig = {
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

// This type is not used anywhere - should be detected as unused
export type ApiClientConfig = {
  baseUrl: string
  timeout?: number
  retries?: number
  auth?: AuthConfig
  interceptors?: {
    request?: Array<(config: RequestConfig) => RequestConfig>
    response?: Array<(response: Response) => Response>
  }
}
