// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isEmailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// This interface is not used anywhere - should be detected as unused
export interface PasswordResetRequest {
  email: string
  redirectUrl?: string
}

// This interface is not used anywhere - should be detected as unused
export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}
