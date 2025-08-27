/**
 * API types and interfaces
 * Demonstrates type-only exports and complex type definitions
 */

// Used base types - should NOT be flagged
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  avatar?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: SocialLinks
}

export interface SocialLinks {
  twitter?: string
  github?: string
  linkedin?: string
}

// Used request/response types - should NOT be flagged
export interface CreateUserRequest {
  name: string
  email: string
  role?: UserRole
  profile?: Partial<UserProfile>
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  profile?: Partial<UserProfile>
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: ResponseMeta
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasNext?: boolean
  hasPrev?: boolean
}

// Used enums - should NOT be flagged
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
}

// Unused types - SHOULD be flagged
export interface DeprecatedUser {
  id: number // old numeric ID
  username: string // old username field
  password: string // should never be exposed
}

export interface ObsoleteApiResponse {
  result: any
  status: number
  timestamp: string
}

export interface UnusedComplexType {
  nested: {
    deep: {
      property: string
      array: Array<{
        id: number
        value: unknown
      }>
    }
  }
}

// Used utility types - should NOT be flagged
export type UserWithoutDates = Omit<User, 'createdAt' | 'updatedAt'>
export type CreateUserData = Pick<User, 'name' | 'email' | 'role'>
export type UserKeys = keyof User
export type PartialUser = Partial<User>

// Unused utility types - SHOULD be flagged
export type DeprecatedUserKeys = keyof DeprecatedUser
export type ObsoleteResponse = Omit<ObsoleteApiResponse, 'timestamp'>

// Used generic types - should NOT be flagged
export type ApiEndpoint<T> = {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  requestType?: T
  responseType: ApiResponse<T>
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: Required<ResponseMeta>
}

// Unused generic types - SHOULD be flagged
export type LegacyEndpoint<T> = {
  url: string
  data: T
}

// Used mapped types - should NOT be flagged
export type UserUpdateFields = {
  [K in keyof UpdateUserRequest]: UpdateUserRequest[K]
}

// Unused mapped types - SHOULD be flagged
export type DeprecatedFields = {
  [K in keyof DeprecatedUser]: string
}

// Used conditional types - should NOT be flagged
export type ApiResult<T> = T extends User ? UserApiResult : GenericApiResult

export interface UserApiResult extends ApiResponse<User> {
  userSpecificField: string
}

export interface GenericApiResult extends ApiResponse<unknown> {
  genericField: string
}

// Unused conditional types - SHOULD be flagged
export type ObsoleteResult<T> = T extends DeprecatedUser ? never : T
