// Application configuration
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean
  features: FeatureFlags
}

export interface FeatureFlags {
  enableAnalytics: boolean
  enableNotifications: boolean
  enableDarkMode: boolean
  enableExperimentalFeatures: boolean
}

export const APP_CONFIG: AppConfig = {
  name: 'Path Aliases Demo',
  version: '1.0.0',
  environment: 'development',
  debug: true,
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableDarkMode: true,
    enableExperimentalFeatures: false,
  },
}

// This constant is not used anywhere - should be detected as unused
export const UNUSED_APP_CONFIG = {
  theme: 'light',
  locale: 'en-US',
  timezone: 'UTC',
}
