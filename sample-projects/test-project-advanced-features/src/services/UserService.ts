/**
 * User service with various export patterns
 * Demonstrates service layer with used and unused methods
 */

import { ApiClient } from '@/api/ApiClient'
import type { CreateUserRequest, User } from '@/types/api'
import { Logger } from '@/utils/Logger'
import { validateUser } from '@/utils/validation'

// Used class - should NOT be flagged
export class UserService {
  private apiClient: ApiClient
  private logger: Logger

  constructor() {
    this.apiClient = new ApiClient()
    this.logger = new Logger('UserService')
  }

  // Used method - should NOT be flagged
  async getAllUsers(): Promise<User[]> {
    this.logger.info('Fetching all users')
    return this.apiClient.get<User[]>('/users')
  }

  // Used method - should NOT be flagged
  async getUserById(id: string): Promise<User | null> {
    this.logger.info(`Fetching user ${id}`)
    return this.apiClient.get<User>(`/users/${id}`)
  }

  // Used method - should NOT be flagged
  async createUser(userData: CreateUserRequest): Promise<User> {
    if (!validateUser(userData)) {
      throw new Error('Invalid user data')
    }

    this.logger.info('Creating new user')
    return this.apiClient.post<User>('/users', userData)
  }

  // Unused method - SHOULD be flagged
  async deleteAllUsers(): Promise<void> {
    this.logger.warn('Deleting all users - this should never be called!')
    return this.apiClient.delete('/users/all')
  }

  // Unused method - SHOULD be flagged
  async exportUsersToCSV(): Promise<string> {
    const users = await this.getAllUsers()
    return users.map((u) => `${u.id},${u.name},${u.email}`).join('\n')
  }
}

// Used function - should NOT be flagged (used in UserService)
export function validateUserData(user: CreateUserRequest): boolean {
  return !!(user.name && user.email)
}

// Unused function - SHOULD be flagged
export function formatUserName(user: User): string {
  return `${user.name} (${user.email})`
}

// Used constant - should NOT be flagged
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const

// Unused constant - SHOULD be flagged
export const DEPRECATED_ROLES = {
  MODERATOR: 'moderator',
  EDITOR: 'editor',
} as const

// Used type - should NOT be flagged
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Unused type - SHOULD be flagged
export type DeprecatedRole = (typeof DEPRECATED_ROLES)[keyof typeof DEPRECATED_ROLES]

// Used interface - should NOT be flagged
export interface UserServiceConfig {
  apiUrl: string
  timeout: number
  retries: number
}

// Unused interface - SHOULD be flagged
export interface LegacyUserConfig {
  oldApiUrl: string
  deprecatedTimeout: number
}
