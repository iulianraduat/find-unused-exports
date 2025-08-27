// Enhanced User model with comprehensive type definitions
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: UserPermission[]
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  metadata: UserMetadata
}

export interface UserProfile {
  bio?: string
  avatar?: string
  location?: string
  website?: string
  socialLinks?: SocialLinks
  skills?: string[]
  experience?: WorkExperience[]
}

export interface SocialLinks {
  github?: string
  twitter?: string
  linkedin?: string
  website?: string
}

export interface WorkExperience {
  company: string
  position: string
  startDate: Date
  endDate?: Date
  description?: string
}

export interface UserPermission {
  resource: string
  actions: PermissionAction[]
  conditions?: PermissionCondition[]
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'admin'

export interface PermissionCondition {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith'
  value: any
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  categories: {
    security: boolean
    updates: boolean
    marketing: boolean
    social: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showLocation: boolean
  allowSearchEngineIndexing: boolean
}

export interface UserMetadata {
  source: 'registration' | 'invitation' | 'import' | 'api'
  ipAddress?: string
  userAgent?: string
  referrer?: string
  tags: string[]
  customFields: Record<string, any>
}

export interface CreateUserRequest {
  name: string
  email: string
  role?: UserRole
  profile?: Partial<UserProfile>
  permissions?: UserPermission[]
  preferences?: Partial<UserPreferences>
  metadata?: Partial<UserMetadata>
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  profile?: Partial<UserProfile>
  permissions?: UserPermission[]
  preferences?: Partial<UserPreferences>
  isActive?: boolean
}

// Default configurations
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  notifications: {
    email: true,
    push: true,
    sms: false,
    categories: {
      security: true,
      updates: true,
      marketing: false,
      social: true,
    },
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showLocation: false,
    allowSearchEngineIndexing: true,
  },
}

export const DEFAULT_USER_PERMISSIONS: UserPermission[] = [
  {
    resource: 'profile',
    actions: ['read', 'update'],
  },
  {
    resource: 'settings',
    actions: ['read', 'update'],
  },
]

// Utility functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole)
}

export function hasPermission(user: User, resource: string, action: PermissionAction): boolean {
  return user.permissions.some((permission) => permission.resource === resource && permission.actions.includes(action))
}

export function isUserActive(user: User): boolean {
  return user.isActive && (!user.lastLoginAt || Date.now() - user.lastLoginAt.getTime() < 90 * 24 * 60 * 60 * 1000) // 90 days
}

// User service class
export class UserService {
  private users: Map<string, User> = new Map()
  private config: UserServiceConfig

  constructor(config: UserServiceConfig) {
    this.config = config
  }

  createUser(request: CreateUserRequest): User {
    if (!validateEmail(request.email)) {
      throw new Error('Invalid email address')
    }

    if (this.users.size >= this.config.maxUsers) {
      throw new Error('Maximum user limit reached')
    }

    const user: User = {
      id: this.generateUserId(),
      name: request.name,
      email: request.email,
      role: request.role || UserRole.USER,
      profile: request.profile || {},
      permissions: request.permissions || DEFAULT_USER_PERMISSIONS,
      preferences: { ...DEFAULT_USER_PREFERENCES, ...request.preferences },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      metadata: {
        source: 'registration',
        tags: [],
        customFields: {},
        ...request.metadata,
      },
    }

    this.users.set(user.id, user)
    return user
  }

  getUser(id: string): User | undefined {
    return this.users.get(id)
  }

  updateUser(id: string, updates: UpdateUserRequest): User | undefined {
    const user = this.users.get(id)
    if (!user) return undefined

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)
    return updatedUser
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export interface UserServiceConfig {
  maxUsers: number
  enableEvents: boolean
  defaultRole: UserRole
  passwordPolicy: PasswordPolicy
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

// UNUSED EXPORTS - These should be detected by the extension
export interface UnusedUserInterface {
  id: string
  data: any
}

export class UnusedUserClass {
  private value: string = ''

  setValue(value: string): void {
    this.value = value
  }
}

export const UNUSED_USER_CONSTANT = 'This is never used'

export function unusedUserFunction(): void {
  console.log('This function is never called')
}

export enum UnusedUserEnum {
  OPTION_ONE = 'one',
  OPTION_TWO = 'two',
}

export type UnusedUserType = {
  name: string
  value: number
}
