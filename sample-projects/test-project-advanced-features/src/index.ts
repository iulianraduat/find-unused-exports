/**
 * Main entry point for the advanced features test project
 * This file demonstrates various export/import patterns and edge cases
 */

// Used imports - these should NOT be flagged as unused
import { ApiClient } from '@/api/ApiClient'
import { CONFIG } from '@/config/app'
import { UserService } from '@/services/UserService'
import { Logger } from '@/utils/Logger'

// Unused imports - these SHOULD be flagged as unused

// Used exports - these should NOT be flagged as unused
export { ApiClient } from '@/api/ApiClient'
export { UserService } from '@/services/UserService'
export type { ApiResponse, User } from '@/types/api'

// Unused exports - these SHOULD be flagged as unused
export type { ObsoleteInterface } from '@/types/obsolete'
export { LegacyHelper } from '@/utils/LegacyHelper'
export { UnusedClass } from '@/utils/UnusedClass'

// Main application class - used
export class Application {
  private userService: UserService
  private apiClient: ApiClient
  private logger: Logger

  constructor() {
    this.userService = new UserService()
    this.apiClient = new ApiClient(CONFIG.apiUrl)
    this.logger = new Logger('Application')
  }

  async start(): Promise<void> {
    this.logger.info('Starting application...')

    try {
      const users = await this.userService.getAllUsers()
      this.logger.info(`Loaded ${users.length} users`)
    } catch (error) {
      this.logger.error('Failed to start application', error)
    }
  }

  // Unused method - should be flagged
  async obsoleteMethod(): Promise<void> {
    console.log('This method is never called')
  }
}

// Used function - should NOT be flagged
export function createApp(): Application {
  return new Application()
}

// Unused function - SHOULD be flagged
export function deprecatedFunction(): void {
  console.log('This function is never used')
}

// Used constant - should NOT be flagged
export const APP_VERSION = '1.0.0'

// Unused constant - SHOULD be flagged
export const UNUSED_CONSTANT = 'never used'

// Default export - used
const app = new Application()
export default app
