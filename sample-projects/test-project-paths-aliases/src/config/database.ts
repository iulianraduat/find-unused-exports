// Database configuration
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  poolSize: number
  connectionTimeout: number
}

export const DATABASE_CONFIG: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'app_db',
  username: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASS || 'password',
  ssl: process.env.NODE_ENV === 'production',
  poolSize: 10,
  connectionTimeout: 5000,
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_DB_CONFIG = {
  maxConnections: 100,
  idleTimeout: 30000,
  acquireTimeout: 60000,
}
