// Shared constants across the monorepo
export const API_ENDPOINTS = {
  USERS: '/api/users',
  POSTS: '/api/posts',
  COMMENTS: '/api/comments',
  AUTH: '/api/auth',
  UPLOAD: '/api/upload',
  NOTIFICATIONS: '/api/notifications',
} as const

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  MODERATE: 'moderate',
} as const

export const EVENT_TYPES = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
} as const

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  POST_TITLE_MAX_LENGTH: 200,
  POST_CONTENT_MAX_LENGTH: 10000,
  COMMENT_MAX_LENGTH: 1000,
} as const

export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  POST_PREFIX: 'post:',
  COMMENT_PREFIX: 'comment:',
  SESSION_PREFIX: 'session:',
  RATE_LIMIT_PREFIX: 'rate_limit:',
} as const

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_PATH: '/uploads',
} as const

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  API_REQUESTS_PER_MINUTE: 60,
  UPLOAD_REQUESTS_PER_HOUR: 10,
} as const

// UNUSED EXPORTS - These should be detected by the extension
export const UNUSED_CONSTANTS = {
  DEPRECATED_API_VERSION: 'v0.1',
  OLD_CACHE_TTL: 3600,
  LEGACY_PERMISSIONS: ['legacy_read', 'legacy_write'],
} as const

export const ANOTHER_UNUSED_CONSTANT = 'This is never used'

export enum UnusedEnum {
  OPTION_ONE = 'one',
  OPTION_TWO = 'two',
  OPTION_THREE = 'three',
}

export interface UnusedInterface {
  id: string
  name: string
  value: number
}

export type UnusedType = {
  status: 'active' | 'inactive'
  metadata: Record<string, any>
}

export function unusedFunction(): string {
  return 'This function is never used'
}

export class UnusedClass {
  private value: string = ''

  setValue(value: string): void {
    this.value = value
  }

  getValue(): string {
    return this.value
  }
}
