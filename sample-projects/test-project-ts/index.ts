// Main application entry point demonstrating complex TypeScript patterns
import {
  User,
  UserService,
  CreateUserRequest,
  UserPermission,
  validateEmail,
  DEFAULT_USER_PREFERENCES,
} from './src/models/User'
import { ApiService, ApiResponse, RequestConfig } from './src/services/ApiService'
import { formatDate, capitalize, CONSTANTS } from './src/utils/helpers'

// Create instances with configuration
const userServiceConfig = {
  maxUsers: 1000,
  enableEvents: true,
  defaultRole: 'user' as const,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
}

const userService = new UserService(userServiceConfig)

const apiConfig: RequestConfig = {
  timeout: 15000,
  retries: 2,
  headers: {
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web',
  },
}

const apiService = new ApiService('https://api.example.com', apiConfig)

// Create sample users with complex data
const createSampleUsers = async () => {
  const usersToCreate: CreateUserRequest[] = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      profile: {
        bio: 'Software engineer passionate about TypeScript',
        location: 'San Francisco, CA',
        socialLinks: {
          github: 'johndoe',
          twitter: '@johndoe',
        },
      },
      permissions: [
        { resource: 'profile', actions: ['read', 'update'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'projects', actions: ['create', 'read', 'update'] },
      ],
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      profile: {
        bio: 'Product manager and UX enthusiast',
        location: 'New York, NY',
        website: 'https://janesmith.dev',
        socialLinks: {
          linkedin: 'jane-smith',
          github: 'janesmith',
        },
      },
      permissions: [
        { resource: 'profile', actions: ['read', 'update'] },
        { resource: 'team', actions: ['read', 'manage'] },
        { resource: 'analytics', actions: ['read'] },
      ],
    },
  ]

  const createdUsers: User[] = []

  for (const userData of usersToCreate) {
    // Validate email before creating user
    if (!validateEmail(userData.email)) {
      console.error(`Invalid email: ${userData.email}`)
      continue
    }

    try {
      const user = userService.createUser(userData)
      createdUsers.push(user)

      console.log('Created user:', {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: formatDate(user.createdAt),
        permissionCount: user.permissions.length,
      })
    } catch (error) {
      console.error(`Failed to create user ${userData.name}:`, error)
    }
  }

  return createdUsers
}

// Simulate complex API interactions
async function demonstrateApiUsage() {
  try {
    console.log('\n--- API Usage Demonstration ---')

    // Fetch user data
    const userResponse = await apiService.get<User>('/users/1')
    console.log('Fetched user data:', {
      status: userResponse.status,
      message: userResponse.message,
      userId: userResponse.data.id,
      userName: userResponse.data.name,
    })

    // Create new user via API
    const newUserData: CreateUserRequest = {
      name: 'API User',
      email: 'api.user@example.com',
      permissions: [{ resource: 'profile', actions: ['read', 'update'] }],
    }

    const createResponse = await apiService.post<User>('/users', newUserData)
    console.log('Created user via API:', {
      status: createResponse.status,
      requestId: createResponse.requestId,
      userId: createResponse.data.id,
    })
  } catch (error) {
    console.error('API operation failed:', error)
  }
}

// Main application flow
async function main() {
  console.log('=== TypeScript Example Application ===')
  console.log('Configuration:', {
    maxRetryAttempts: CONSTANTS.MAX_RETRY_ATTEMPTS,
    defaultTimeout: CONSTANTS.DEFAULT_TIMEOUT,
    userServiceMaxUsers: userServiceConfig.maxUsers,
  })

  // Create sample users
  console.log('\n--- Creating Sample Users ---')
  const users = await createSampleUsers()

  // Display user preferences
  console.log('\n--- Default User Preferences ---')
  console.log('Theme:', DEFAULT_USER_PREFERENCES.theme)
  console.log('Notifications:', DEFAULT_USER_PREFERENCES.notifications)
  console.log('Language:', DEFAULT_USER_PREFERENCES.language)

  // Demonstrate API usage
  await demonstrateApiUsage()

  // Display summary
  console.log('\n--- Summary ---')
  console.log(`Total users created: ${users.length}`)
  users.forEach((user) => {
    console.log(`- ${capitalize(user.name)} (${user.email})`)
  })
}

// Run the application
main().catch((error) => {
  console.error('Application failed:', error)
  process.exit(1)
})

// This export should be detected as unused if considerMainExportsUsed is false
export function considerMeUsed() {}

// This export is also unused and should be detected
export const UNUSED_EXPORT = 'This export is not used anywhere'

// This interface is not used anywhere - should be detected as unused
export interface UnusedInterface {
  id: number
  name: string
}
