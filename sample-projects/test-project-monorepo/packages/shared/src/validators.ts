// Shared validation utilities
import { VALIDATION_RULES } from './constants'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email) {
    errors.push('Email is required')
  } else if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []

  if (!username) {
    errors.push('Username is required')
  } else {
    if (username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
      errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters long`)
    }

    if (username.length > VALIDATION_RULES.USERNAME_MAX_LENGTH) {
      errors.push(`Username must be no more than ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters long`)
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePostTitle(title: string): ValidationResult {
  const errors: string[] = []

  if (!title) {
    errors.push('Post title is required')
  } else {
    if (title.trim().length === 0) {
      errors.push('Post title cannot be empty')
    }

    if (title.length > VALIDATION_RULES.POST_TITLE_MAX_LENGTH) {
      errors.push(`Post title must be no more than ${VALIDATION_RULES.POST_TITLE_MAX_LENGTH} characters long`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePostContent(content: string): ValidationResult {
  const errors: string[] = []

  if (!content) {
    errors.push('Post content is required')
  } else {
    if (content.trim().length === 0) {
      errors.push('Post content cannot be empty')
    }

    if (content.length > VALIDATION_RULES.POST_CONTENT_MAX_LENGTH) {
      errors.push(`Post content must be no more than ${VALIDATION_RULES.POST_CONTENT_MAX_LENGTH} characters long`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateComment(comment: string): ValidationResult {
  const errors: string[] = []

  if (!comment) {
    errors.push('Comment is required')
  } else {
    if (comment.trim().length === 0) {
      errors.push('Comment cannot be empty')
    }

    if (comment.length > VALIDATION_RULES.COMMENT_MAX_LENGTH) {
      errors.push(`Comment must be no more than ${VALIDATION_RULES.COMMENT_MAX_LENGTH} characters long`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUrl(url: string): ValidationResult {
  const errors: string[] = []

  if (!url) {
    errors.push('URL is required')
  } else {
    try {
      new URL(url)
    } catch {
      errors.push('Invalid URL format')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = []

  if (!phone) {
    errors.push('Phone number is required')
  } else {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone)) {
      errors.push('Invalid phone number format')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number,
): ValidationResult {
  const errors: string[] = []

  if (minLength !== undefined && value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`)
  }

  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`${fieldName} must be no more than ${maxLength} characters long`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateNumericRange(value: number, fieldName: string, min?: number, max?: number): ValidationResult {
  const errors: string[] = []

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`)
  } else {
    if (min !== undefined && value < min) {
      errors.push(`${fieldName} must be at least ${min}`)
    }

    if (max !== undefined && value > max) {
      errors.push(`${fieldName} must be no more than ${max}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap((result) => result.errors)

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}

// UNUSED EXPORTS - These should be detected by the extension
export function unusedValidator(value: string): ValidationResult {
  return {
    isValid: true,
    errors: [],
  }
}

export const UNUSED_VALIDATION_RULES = {
  DEPRECATED_MIN_LENGTH: 5,
  OLD_MAX_LENGTH: 50,
} as const

export interface UnusedValidationInterface {
  field: string
  rule: string
  message: string
}

export type UnusedValidationType = 'string' | 'number' | 'boolean' | 'object'

export class UnusedValidatorClass {
  private rules: string[] = []

  addRule(rule: string): void {
    this.rules.push(rule)
  }

  validate(): boolean {
    return this.rules.length > 0
  }
}

export enum UnusedValidationEnum {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  CONDITIONAL = 'conditional',
}
