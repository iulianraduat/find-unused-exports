// Main application demonstrating comprehensive path aliases
import { Button, ButtonProps } from '@/components/Button'
import { ApiClient } from '@/services/ApiClient'
import { ApiResponse } from '@/types/api'
import { ComponentProps } from '@/types/component'
import { logEvent, logError } from '@functions/logger'

// Configuration imports using different alias patterns
import { APP_CONFIG, AppConfig } from '@/config/app'
import { API_CONFIG } from '@/config/api'
import { DATABASE_CONFIG } from '@/config/database'

// Feature-based imports
import { AuthService, User, LoginCredentials } from '@/auth'
import { AuthState } from '@auth/types'

// Utility imports with different alias styles
import { validateEmail, formatDate } from '@/utils/validation'
import { debounce, throttle } from '@utils/performance'
import { generateId, slugify } from '~functions/helpers'

console.log('=== Path Aliases Demonstration ===')

// Configuration demonstration
console.log('\n--- Configuration ---')
console.log('App Config:', {
  name: APP_CONFIG.name,
  version: APP_CONFIG.version,
  environment: APP_CONFIG.environment,
  debug: APP_CONFIG.debug,
})

console.log('API Config:', {
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  endpoints: Object.keys(API_CONFIG.endpoints),
})

console.log('Database Config:', {
  host: DATABASE_CONFIG.host,
  port: DATABASE_CONFIG.port,
  database: DATABASE_CONFIG.database,
  ssl: DATABASE_CONFIG.ssl,
})

// Component demonstration
console.log('\n--- Component Creation ---')
const buttonProps: ButtonProps = {
  children: 'Login',
  variant: 'primary',
  size: 'large',
  onClick: () => {
    logEvent('login_button_clicked', { timestamp: new Date().toISOString() })
    handleLogin()
  },
}

const button = new Button(buttonProps)
console.log('Button HTML:', button.render())

// Service demonstration
console.log('\n--- Service Integration ---')
const apiClient = new ApiClient(API_CONFIG.baseUrl)
const authService = new AuthService()

// Authentication flow demonstration
async function handleLogin() {
  const credentials: LoginCredentials = {
    email: 'demo@example.com',
    password: 'password123',
    rememberMe: true,
  }

  try {
    logEvent('login_attempt_started', { email: credentials.email })

    // Validate email using utility function
    if (!validateEmail(credentials.email)) {
      throw new Error('Invalid email format')
    }

    console.log('Attempting login with credentials:', {
      email: credentials.email,
      rememberMe: credentials.rememberMe,
    })

    // Simulate login (would normally call authService.login)
    const mockAuthResponse = {
      user: {
        id: generateId('user'),
        email: credentials.email,
        name: 'Demo User',
        role: 'user' as const,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: generateId('token'),
      refreshToken: generateId('refresh'),
      expiresIn: 3600,
    }

    logEvent('login_success', { userId: mockAuthResponse.user.id })
    console.log('Login successful:', {
      userId: mockAuthResponse.user.id,
      userName: mockAuthResponse.user.name,
      userRole: mockAuthResponse.user.role,
    })

    // Demonstrate user profile operations
    await handleUserProfile(mockAuthResponse.user)
  } catch (error) {
    logError(error as Error, 'handleLogin')
    console.error('Login failed:', (error as Error).message)
  }
}

// User profile operations
async function handleUserProfile(user: User) {
  console.log('\n--- User Profile Operations ---')

  const userSlug = slugify(user.name)
  const formattedDate = formatDate(user.createdAt)

  console.log('User Profile:', {
    id: user.id,
    name: user.name,
    slug: userSlug,
    email: user.email,
    role: user.role,
    emailVerified: user.isEmailVerified,
    memberSince: formattedDate,
  })

  // Simulate fetching user data with debounced function
  const debouncedFetch = debounce(async () => {
    try {
      logEvent('user_data_fetch_started', { userId: user.id })

      const response: ApiResponse<User> = await apiClient.get(`/users/${user.id}`)

      if (response.success) {
        logEvent('user_data_fetch_success', response.data)
        console.log('User data fetched successfully')
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error) {
      logError(error as Error, 'fetchUserData')
    }
  }, 300)

  // Trigger debounced fetch
  debouncedFetch()
}

// API operations demonstration
async function demonstrateApiOperations() {
  console.log('\n--- API Operations ---')

  try {
    // Simulate multiple API calls with throttling
    const throttledApiCall = throttle(async (endpoint: string) => {
      logEvent('api_call_started', { endpoint })

      const response: ApiResponse<any> = await apiClient.get(endpoint)

      if (response.success) {
        logEvent('api_call_success', { endpoint, dataLength: response.data?.length || 0 })
        console.log(`API call to ${endpoint} successful`)
      } else {
        throw new Error(`API call to ${endpoint} failed`)
      }
    }, 1000)

    // Make throttled API calls
    await throttledApiCall('/users')
    await throttledApiCall('/posts')
    await throttledApiCall('/comments')
  } catch (error) {
    logError(error as Error, 'demonstrateApiOperations')
  }
}

// Utility functions demonstration
function demonstrateUtilities() {
  console.log('\n--- Utility Functions ---')

  const testEmails = ['valid@example.com', 'invalid-email', 'another.valid@test.org', 'not-an-email']

  console.log('Email validation results:')
  testEmails.forEach((email) => {
    const isValid = validateEmail(email)
    console.log(`  ${email}: ${isValid ? '✅ valid' : '❌ invalid'}`)
  })

  const testDates = [new Date(), new Date('2023-01-01'), new Date('2024-12-25')]

  console.log('Date formatting results:')
  testDates.forEach((date) => {
    const formatted = formatDate(date)
    console.log(`  ${date.toISOString()}: ${formatted}`)
  })

  const testNames = ['John Doe', 'Jane Smith-Wilson', "Bob O'Connor", 'Alice & Bob Inc.']

  console.log('Slug generation results:')
  testNames.forEach((name) => {
    const slug = slugify(name)
    console.log(`  "${name}": ${slug}`)
  })
}

// Main execution flow
async function main() {
  console.log('Generated session ID:', generateId('session'))
  console.log('Current timestamp:', formatDate(new Date()))

  // Demonstrate utilities
  demonstrateUtilities()

  // Demonstrate API operations
  await demonstrateApiOperations()

  // Simulate user interaction
  console.log('\n--- Simulating User Interaction ---')
  await handleLogin()

  console.log('\n--- Application Summary ---')
  console.log('✅ Path aliases working correctly!')
  console.log('✅ Configuration loaded successfully!')
  console.log('✅ Services initialized!')
  console.log('✅ Components rendered!')
  console.log('✅ Utilities functioning!')
}

// Run the application
main().catch((error) => {
  logError(error as Error, 'main')
})

// Export for external use
export { APP_CONFIG, API_CONFIG, AuthService, Button }

// This export should be detected as unused
export function unusedPathAliasFunction() {
  return 'This function demonstrates unused exports in path aliases project'
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_PATH_ALIAS_CONSTANT = {
  version: '1.0.0',
  description: 'Unused constant for testing path aliases',
  features: ['complex-paths', 'multiple-aliases', 'feature-based-imports'],
}
