// Authentication service
import { ApiClient } from '@/services/ApiClient'
import { API_CONFIG } from '@/config/api'
import { User, LoginCredentials, RegisterData, AuthResponse } from './types'

export class AuthService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient(API_CONFIG.baseUrl)
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth + '/login', credentials)

    if (response.success) {
      this.setAuthToken(response.data.token)
      return response.data
    }

    throw new Error(response.message || 'Login failed')
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth + '/register', data)

    if (response.success) {
      this.setAuthToken(response.data.token)
      return response.data
    }

    throw new Error(response.message || 'Registration failed')
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.apiClient.get<User>(API_CONFIG.endpoints.auth + '/me')

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || 'Failed to get current user')
  }

  // This method is not used anywhere - should be detected as unused
  async logout(): Promise<void> {
    await this.apiClient.post(API_CONFIG.endpoints.auth + '/logout')
    this.clearAuthToken()
  }

  // This method is not used anywhere - should be detected as unused
  async refreshToken(): Promise<string> {
    const response = await this.apiClient.post<{ token: string }>(API_CONFIG.endpoints.auth + '/refresh')

    if (response.success) {
      this.setAuthToken(response.data.token)
      return response.data.token
    }

    throw new Error(response.message || 'Token refresh failed')
  }

  // This method is not used anywhere - should be detected as unused
  async requestPasswordReset(email: string): Promise<void> {
    const response = await this.apiClient.post(API_CONFIG.endpoints.auth + '/password-reset', { email })

    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed')
    }
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
    this.apiClient.setAuthHeader(`Bearer ${token}`)
  }

  private clearAuthToken(): void {
    localStorage.removeItem('auth_token')
    this.apiClient.clearAuthHeader()
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}
