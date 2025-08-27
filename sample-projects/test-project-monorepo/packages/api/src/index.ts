// API package main entry point demonstrating cross-package dependencies
import { UserService } from './userService'
import {
  formatDate,
  generateId,
  validateEmail,
  USER_ROLES,
  THEMES,
  UserRole,
  SortOptions,
  FilterOptions,
  SearchOptions,
} from '@monorepo/shared'

console.log('=== Monorepo API Package Demo ===')

const userService = new UserService()

// Create sample users with different roles and profiles
const createSampleUsers = async () => {
  console.log('\n--- Creating Sample Users ---')

  const usersToCreate = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin' as UserRole,
      profile: {
        bio: 'System administrator with 10+ years experience',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        socialLinks: {
          github: 'johndoe',
          twitter: '@johndoe',
          linkedin: 'john-doe',
        },
      },
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'moderator' as UserRole,
      profile: {
        bio: 'Community moderator and developer advocate',
        location: 'New York, NY',
        socialLinks: {
          github: 'janesmith',
          twitter: '@janesmith',
        },
      },
    },
    {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      role: 'user' as UserRole,
      profile: {
        bio: 'Full-stack developer passionate about TypeScript',
        location: 'Austin, TX',
        socialLinks: {
          github: 'bobwilson',
        },
      },
    },
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'guest' as UserRole,
      profile: {
        bio: 'New to the platform, exploring features',
        location: 'Seattle, WA',
      },
    },
  ]

  const createdUsers = []

  for (const userData of usersToCreate) {
    console.log(`Creating user: ${userData.name} (${userData.email})`)

    // Validate email before creating
    if (!validateEmail(userData.email)) {
      console.error(`❌ Invalid email: ${userData.email}`)
      continue
    }

    const result = userService.createUser(userData.name, userData.email, userData.role, userData.profile)

    if (result.success) {
      console.log(`✅ Created user: ${result.data.name} (ID: ${result.data.id})`)
      console.log(`   Role: ${result.data.role}`)
      console.log(`   Permissions: ${result.data.permissions.length}`)
      console.log(`   Created: ${formatDate(result.data.createdAt)}`)
      createdUsers.push(result.data)
    } else {
      console.error(`❌ Failed to create user: ${result.message}`)
    }
  }

  return createdUsers
}

// Demonstrate pagination and filtering
const demonstratePagination = () => {
  console.log('\n--- Pagination and Filtering Demo ---')

  // Get all users with pagination
  const page1 = userService.getAllUsers(1, 2)
  console.log('Page 1 (limit 2):')
  console.log(`  Total users: ${page1.pagination.total}`)
  console.log(`  Current page: ${page1.pagination.page}`)
  console.log(`  Has next: ${page1.pagination.hasNext}`)
  console.log(`  Users: ${page1.data.map((u) => u.name).join(', ')}`)

  // Get second page
  if (page1.pagination.hasNext) {
    const page2 = userService.getAllUsers(2, 2)
    console.log('Page 2 (limit 2):')
    console.log(`  Users: ${page2.data.map((u) => u.name).join(', ')}`)
  }

  // Filter by role
  const sortOptions: SortOptions[] = [{ field: 'name', order: 'asc' }]

  const filterOptions: FilterOptions[] = [{ field: 'role', operator: 'equals', value: 'user' }]

  const filteredUsers = userService.getAllUsers(1, 10, sortOptions, filterOptions)
  console.log('Filtered users (role = user):')
  console.log(`  Found: ${filteredUsers.data.length} users`)
  filteredUsers.data.forEach((user) => {
    console.log(`  - ${user.name} (${user.role})`)
  })

  // Search users
  const searchOptions: SearchOptions = {
    query: 'john',
    fields: ['name', 'email'],
    fuzzy: false,
  }

  const searchResults = userService.getAllUsers(1, 10, undefined, undefined, searchOptions)
  console.log('Search results (query: "john"):')
  console.log(`  Found: ${searchResults.data.length} users`)
  searchResults.data.forEach((user) => {
    console.log(`  - ${user.name} (${user.email})`)
  })
}

// Demonstrate user lookup and validation
const demonstrateUserOperations = (users: any[]) => {
  console.log('\n--- User Operations Demo ---')

  if (users.length > 0) {
    const firstUser = users[0]

    // Get user by ID
    const foundUser = userService.getUserById(firstUser.id)
    if (foundUser.success) {
      console.log(`Found user by ID: ${foundUser.data?.name}`)
      console.log(`  Email: ${foundUser.data?.email}`)
      console.log(`  Role: ${foundUser.data?.role}`)
      console.log(`  Active: ${foundUser.data?.isActive}`)
      console.log(`  Theme: ${foundUser.data?.profile.preferences.theme}`)
      console.log(
        `  Notifications: ${foundUser.data?.profile.preferences.notifications.email ? 'enabled' : 'disabled'}`,
      )
    }
  }
}

// Main execution
const main = async () => {
  console.log('Current date:', formatDate(new Date()))
  console.log('Generated ID:', generateId('demo'))
  console.log('Available roles:', Object.values(USER_ROLES))
  console.log('Available themes:', Object.values(THEMES))

  // Create sample users
  const users = await createSampleUsers()

  // Demonstrate pagination and filtering
  demonstratePagination()

  // Demonstrate user operations
  demonstrateUserOperations(users)

  console.log('\n--- Summary ---')
  const allUsers = userService.getAllUsers()
  console.log(`Total users created: ${allUsers.data.length}`)

  // Group users by role
  const usersByRole = allUsers.data.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  console.log('Users by role:')
  Object.entries(usersByRole).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`)
  })
}

// Run the demo
main().catch((error) => {
  console.error('Demo failed:', error)
})

// Export the service for external use
export { UserService }

// This export should be detected as unused
export function unusedApiFunction() {
  return 'This function is not used anywhere'
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_API_CONSTANT = {
  version: '1.0.0',
  author: 'API Team',
  description: 'Unused constant for testing',
}

// This interface is not used anywhere - should be detected as unused
export interface UnusedApiInterface {
  id: string
  name: string
  value: number
}
