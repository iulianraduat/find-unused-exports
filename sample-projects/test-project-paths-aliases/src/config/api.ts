// API configuration
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers: Record<string, string>
  endpoints: ApiEndpoints
}

export interface ApiEndpoints {
  users: string
  posts: string
  comments: string
  auth: string
  upload: string
}

export const API_CONFIG: ApiConfig = {
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  endpoints: {
    users: '/users',
    posts: '/posts',
    comments: '/comments',
    auth: '/auth',
    upload: '/upload',
  },
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_API_CONFIG = {
  version: 'v1',
  rateLimit: 1000,
  cacheTtl: 300,
}
