// Validation utilities
import { ComponentProps } from '@/types/component'

export function validateProps(props: ComponentProps): boolean {
  return !!(props && props.children !== undefined)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// This function is not used anywhere - should be detected as unused
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// This function is not used anywhere - should be detected as unused
export function validateRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== ''
}

export const VALIDATION_RULES = {
  EMAIL: validateEmail,
  REQUIRED: validateRequired,
} as const

// This constant is not used anywhere - should be detected as unused
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required',
  INVALID_URL: 'Please enter a valid URL',
} as const
