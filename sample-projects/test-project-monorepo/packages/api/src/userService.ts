// Comprehensive user service using shared types and utilities
import {
  User,
  UserRole,
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  UserProfile,
  UserPreferences,
  Permission,
  SortOptions,
  FilterOptions,
  SearchOptions,
  generateId,
  validateEmail,
  formatDate,
  VALIDATION_MESSAGES,
  USER_ROLES,
  THEMES,
} from '@monorepo/shared'

export class UserService {
  private users: Map<string, User> = new Map()
  private readonly defaultPermissions: Permission[] = [
    {
      id: generateId('perm'),
      resource: 'profile',
      actions: ['read', 'update'],
      scope: 'personal',
    },
  ]

  createUser(name: string, email: string, role: UserRole = 'user', profile?: Partial<UserProfile>): ApiResponse<User> {
    const validationErrors = this.validateUserData(name, email)

    if (validationErrors.length > 0) {
      return {
        data: null as any,
        success: false,
        message: 'Validation failed',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 0,
        },
      }
    }

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === email)
    if (existingUser) {
      return {
        data: null as any,
        success: false,
        message: 'User with this email already exists',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 0,
        },
      }
    }

    const now = new Date()
    const user: User = {
      id: generateId('user'),
      name,
      email,
      role,
      profile: {
        avatar: profile?.avatar,
        bio: profile?.bio,
        location: profile?.location,
        website: profile?.website,
        socialLinks: profile?.socialLinks || {},
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false,
            frequency: 'immediate',
          },
        },
      },
      permissions: this.getPermissionsForRole(role),
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }

    this.users.set(user.id, user)

    return {
      data: user,
      success: true,
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 5,
      },
    }
  }

  getUserById(id: string): ApiResponse<User | null> {
    const user = this.users.get(id)

    return {
      data: user || null,
      success: !!user,
      message: user ? 'User found' : 'User not found',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 2,
      },
    }
  }

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    sortOptions?: SortOptions[],
    filters?: FilterOptions[],
    search?: SearchOptions,
  ): PaginatedResponse<User> {
    let userArray = Array.from(this.users.values())

    // Apply filters
    if (filters && filters.length > 0) {
      userArray = this.applyFilters(userArray, filters)
    }

    // Apply search
    if (search && search.query.trim()) {
      userArray = this.applySearch(userArray, search)
    }

    // Apply sorting
    if (sortOptions && sortOptions.length > 0) {
      userArray = this.applySorting(userArray, sortOptions)
    }

    // Apply pagination
    const total = userArray.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = userArray.slice(startIndex, endIndex)

    return {
      data: paginatedUsers,
      success: true,
      message: `Found ${total} users`,
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        version: '1.0.0',
        processingTime: 10,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  updateUser(id: string, updates: Partial<User>): ApiResponse<User | null> {
    const user = this.users.get(id)

    if (!user) {
      return {
        data: null,
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 2,
        },
      }
    }

    // Validate updates
    if (updates.email && !validateEmail(updates.email)) {
      return {
        data: null,
        success: false,
        message: VALIDATION_MESSAGES.INVALID_EMAIL,
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 3,
        },
      }
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)

    return {
      data: updatedUser,
      success: true,
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 8,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  deleteUser(id: string): ApiResponse<boolean> {
    const user = this.users.get(id)

    if (!user) {
      return {
        data: false,
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 2,
        },
      }
    }

    this.users.delete(id)

    return {
      data: true,
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 5,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  updateUserPreferences(id: string, preferences: Partial<UserPreferences>): ApiResponse<User | null> {
    const user = this.users.get(id)

    if (!user) {
      return {
        data: null,
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 2,
        },
      }
    }

    const updatedUser: User = {
      ...user,
      profile: {
        ...user.profile,
        preferences: {
          ...user.profile.preferences,
          ...preferences,
        },
      },
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)

    return {
      data: updatedUser,
      success: true,
      message: 'User preferences updated successfully',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 6,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  getUsersByRole(role: UserRole): ApiResponse<User[]> {
    const users = Array.from(this.users.values()).filter((user) => user.role === role)

    return {
      data: users,
      success: true,
      message: `Found ${users.length} users with role ${role}`,
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 5,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  getActiveUsers(): ApiResponse<User[]> {
    const activeUsers = Array.from(this.users.values()).filter((user) => user.isActive)

    return {
      data: activeUsers,
      success: true,
      message: `Found ${activeUsers.length} active users`,
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 4,
      },
    }
  }

  // This method is not used anywhere - should be detected as unused
  deactivateUser(id: string): ApiResponse<User | null> {
    const user = this.users.get(id)

    if (!user) {
      return {
        data: null,
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: generateId('req'),
        meta: {
          version: '1.0.0',
          processingTime: 2,
        },
      }
    }

    const updatedUser: User = {
      ...user,
      isActive: false,
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)

    return {
      data: updatedUser,
      success: true,
      message: 'User deactivated successfully',
      timestamp: new Date().toISOString(),
      requestId: generateId('req'),
      meta: {
        version: '1.0.0',
        processingTime: 5,
      },
    }
  }

  private validateUserData(name: string, email: string): ValidationError[] {
    const errors: ValidationError[] = []

    if (!name || name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: VALIDATION_MESSAGES.REQUIRED,
        code: 'REQUIRED',
      })
    }

    if (!email || email.trim().length === 0) {
      errors.push({
        field: 'email',
        message: VALIDATION_MESSAGES.REQUIRED,
        code: 'REQUIRED',
      })
    } else if (!validateEmail(email)) {
      errors.push({
        field: 'email',
        message: VALIDATION_MESSAGES.INVALID_EMAIL,
        code: 'INVALID_FORMAT',
      })
    }

    return errors
  }

  private getPermissionsForRole(role: UserRole): Permission[] {
    const basePermissions = [...this.defaultPermissions]

    switch (role) {
      case 'admin':
        basePermissions.push(
          {
            id: generateId('perm'),
            resource: 'users',
            actions: ['create', 'read', 'update', 'delete', 'manage'],
            scope: 'global',
          },
          {
            id: generateId('perm'),
            resource: 'projects',
            actions: ['create', 'read', 'update', 'delete', 'manage'],
            scope: 'global',
          },
        )
        break
      case 'moderator':
        basePermissions.push(
          {
            id: generateId('perm'),
            resource: 'users',
            actions: ['read', 'update'],
            scope: 'organization',
          },
          {
            id: generateId('perm'),
            resource: 'projects',
            actions: ['read', 'update'],
            scope: 'organization',
          },
        )
        break
      case 'user':
        basePermissions.push({
          id: generateId('perm'),
          resource: 'projects',
          actions: ['create', 'read', 'update'],
          scope: 'personal',
        })
        break
      case 'guest':
        // Only default permissions
        break
    }

    return basePermissions
  }

  private applyFilters(users: User[], filters: FilterOptions[]): User[] {
    return users.filter((user) => {
      return filters.every((filter) => {
        const value = (user as any)[filter.field]

        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'not_equals':
            return value !== filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'starts_with':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          case 'ends_with':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
          case 'greater_than':
            return value > filter.value
          case 'less_than':
            return value < filter.value
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value)
          case 'not_in':
            return Array.isArray(filter.value) && !filter.value.includes(value)
          default:
            return true
        }
      })
    })
  }

  private applySearch(users: User[], search: SearchOptions): User[] {
    if (!search.query.trim()) return users

    const query = search.query.toLowerCase()

    return users.filter((user) => {
      return search.fields.some((field) => {
        const value = String((user as any)[field] || '').toLowerCase()

        if (search.fuzzy) {
          // Simple fuzzy search
          let queryIndex = 0
          for (let i = 0; i < value.length && queryIndex < query.length; i++) {
            if (value[i] === query[queryIndex]) {
              queryIndex++
            }
          }
          return queryIndex === query.length
        } else {
          return value.includes(query)
        }
      })
    })
  }

  private applySorting(users: User[], sortOptions: SortOptions[]): User[] {
    return [...users].sort((a, b) => {
      for (const option of sortOptions) {
        const aValue = (a as any)[option.field]
        const bValue = (b as unknown)[option.field]

        if (aValue < bValue) return option.order === 'asc' ? -1 : 1
        if (aValue > bValue) return option.order === 'asc' ? 1 : -1
      }
      return 0
    })
  }
}
