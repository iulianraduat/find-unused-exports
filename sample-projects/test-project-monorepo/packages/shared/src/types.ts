// Comprehensive shared types across the monorepo

// Core entity types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserProfile {
  avatar?: string
  bio?: string
  location?: string
  website?: string
  socialLinks: SocialLinks
  preferences: UserPreferences
}

export interface SocialLinks {
  github?: string
  twitter?: string
  linkedin?: string
  website?: string
}

export interface UserPreferences {
  theme: Theme
  language: string
  timezone: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  frequency: NotificationFrequency
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest'
export type Theme = 'light' | 'dark' | 'auto'
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly'

// Permission system types
export interface Permission {
  id: string
  resource: string
  actions: PermissionAction[]
  scope?: PermissionScope
  conditions?: PermissionCondition[]
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute'
export type PermissionScope = 'global' | 'organization' | 'project' | 'personal'

export interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
  value: any
}

// API response types
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  timestamp: string
  requestId: string
  meta?: ResponseMeta
}

export interface ResponseMeta {
  version: string
  processingTime: number
  rateLimit?: RateLimit
}

export interface RateLimit {
  limit: number
  remaining: number
  resetTime: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  path?: string
  method?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

// Project and organization types
export interface Project {
  id: string
  name: string
  description: string
  organizationId: string
  ownerId: string
  members: ProjectMember[]
  settings: ProjectSettings
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  userId: string
  role: ProjectRole
  joinedAt: Date
  permissions: Permission[]
}

export type ProjectRole = 'owner' | 'admin' | 'developer' | 'viewer'
export type ProjectStatus = 'active' | 'archived' | 'suspended'

export interface ProjectSettings {
  visibility: 'public' | 'private' | 'internal'
  allowExternalCollaborators: boolean
  requireApprovalForChanges: boolean
  enableNotifications: boolean
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string
  website?: string
  logo?: string
  settings: OrganizationSettings
  subscription: Subscription
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  allowPublicProjects: boolean
  requireTwoFactor: boolean
  allowedDomains: string[]
  defaultUserRole: UserRole
}

export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid'

// Event and audit types
export interface AuditEvent {
  id: string
  type: AuditEventType
  actor: AuditActor
  target: AuditTarget
  metadata: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
}

export type AuditEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'permission.granted'
  | 'permission.revoked'
  | 'login.success'
  | 'login.failed'
  | 'password.changed'
  | 'email.changed'

export interface AuditActor {
  type: 'user' | 'system' | 'api'
  id: string
  name: string
}

export interface AuditTarget {
  type: 'user' | 'project' | 'organization' | 'permission'
  id: string
  name: string
}

// Configuration types
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  poolSize: number
  timeout: number
}

export interface RedisConfig {
  host: string
  port: number
  password?: string
  database: number
  keyPrefix: string
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses'
  host?: string
  port?: number
  username?: string
  password?: string
  apiKey?: string
  fromEmail: string
  fromName: string
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Timestamps = {
  createdAt: Date
  updatedAt: Date
}

export type WithTimestamps<T> = T & Timestamps

export type EntityId = string

export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  field: string
  order: SortOrder
}

export interface FilterOptions {
  field: string
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in'
  value: any
}

export interface SearchOptions {
  query: string
  fields: string[]
  fuzzy: boolean
}

// Constants
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  MODERATOR: 'moderator' as const,
  USER: 'user' as const,
  GUEST: 'guest' as const,
} as const

export const PROJECT_ROLES = {
  OWNER: 'owner' as const,
  ADMIN: 'admin' as const,
  DEVELOPER: 'developer' as const,
  VIEWER: 'viewer' as const,
} as const

export const THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
  AUTO: 'auto' as const,
} as const

export const SUBSCRIPTION_PLANS = {
  FREE: 'free' as const,
  PRO: 'pro' as const,
  TEAM: 'team' as const,
  ENTERPRISE: 'enterprise' as const,
} as const

// This interface is not used anywhere - should be detected as unused
export interface UserSettings {
  theme: 'light' | 'dark'
  notifications: boolean
  language: string
}

// This type is not used anywhere - should be detected as unused
export type DatabaseConnection = {
  host: string
  port: number
  database: string
  username: string
  password: string
}

// This constant is not used anywhere - should be detected as unused
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
} as const

// This type is not used anywhere - should be detected as unused
export type WebhookEvent = {
  id: string
  type: string
  payload: Record<string, unknown>
  timestamp: Date
  signature: string
}

// This interface is not used anywhere - should be detected as unused
export interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'lfu'
}
