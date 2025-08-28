/**
 * Shared types and interfaces
 * Used across multiple components to demonstrate type sharing
 */

// Base configuration interface used by circular import components
export interface SharedConfig {
  enabled?: boolean
  debug?: boolean
  version?: string
}

// Shared utility types
export type Status = 'active' | 'inactive' | 'pending'
export type Priority = 'low' | 'medium' | 'high'

// Common data structures
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  status: Status
}

// Shared configuration options
export interface AppConfig extends SharedConfig {
  name: string
  environment: 'development' | 'production' | 'test'
  features: FeatureFlags
}

export interface FeatureFlags {
  enableCircularImports: boolean
  enableAdvancedFeatures: boolean
  enableDebugging: boolean
}

// Unused shared types - SHOULD be flagged as unused
export interface UnusedSharedType {
  obsolete: string
  deprecated: boolean
}

export type UnusedUtilityType = 'never' | 'used'

export const UNUSED_SHARED_CONSTANT = 'This constant is never imported'
