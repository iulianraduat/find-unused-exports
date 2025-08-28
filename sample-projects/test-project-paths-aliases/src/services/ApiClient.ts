// API client using path aliases
import { ApiResponse, RequestConfig } from '@/types/api'
import { formatUrl } from '~/utils/url'
import { handleError } from '@/utils/error'

export class ApiClient {
  private baseUrl: string
  private defaultConfig: RequestConfig

  constructor(baseUrl: string, config: RequestConfig = {}) {
    this.baseUrl = baseUrl
    this.defaultConfig = config
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = formatUrl(this.baseUrl, endpoint)
      const response = await fetch(url, {
        method: 'GET',
        ...this.defaultConfig,
        ...config,
      })

      const data = await response.json()
      return {
        data,
        success: response.ok,
        status: response.status,
      }
    } catch (error) {
      return handleError(error)
    }
  }

  // This method is not used anywhere - should be detected as unused
  async post<T>(endpoint: string, body: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = formatUrl(this.baseUrl, endpoint)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultConfig.headers,
          ...config?.headers,
        },
        body: JSON.stringify(body),
        ...this.defaultConfig,
        ...config,
      })

      const data = await response.json()
      return {
        data,
        success: response.ok,
        status: response.status,
      }
    } catch (error) {
      return handleError(error)
    }
  }

  // This method is not used anywhere - should be detected as unused
  async delete(endpoint: string, config?: RequestConfig): Promise<ApiResponse<void>> {
    try {
      const url = formatUrl(this.baseUrl, endpoint)
      const response = await fetch(url, {
        method: 'DELETE',
        ...this.defaultConfig,
        ...config,
      })

      return {
        data: undefined,
        success: response.ok,
        status: response.status,
      }
    } catch (error) {
      return handleError(error)
    }
  }
}

// This function is not used anywhere - should be detected as unused
export function createApiClient(baseUrl: string, config?: RequestConfig): ApiClient {
  return new ApiClient(baseUrl, config)
}
