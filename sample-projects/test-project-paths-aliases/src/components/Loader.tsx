// Loader component with multiple variants
import React from 'react'
import { cn } from '@/utils/classNames'

export interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400',
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', variant = 'spinner', color = 'primary', className }) => {
  const baseClasses = cn(sizeClasses[size], colorClasses[color], className)

  if (variant === 'spinner') {
    return (
      <svg
        className={cn(baseClasses, 'animate-spin')}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(sizeClasses[size], colorClasses[color], 'bg-current rounded-full animate-pulse')}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return <div className={cn(baseClasses, 'bg-current rounded-full animate-pulse')} />
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-1',
              size === 'xs' ? 'h-3' : size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-12',
              colorClasses[color],
              'bg-current animate-pulse',
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

// Full page loader overlay
export interface LoaderOverlayProps {
  visible: boolean
  message?: string
  size?: LoaderProps['size']
  variant?: LoaderProps['variant']
}

export const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ visible, message, size = 'lg', variant = 'spinner' }) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <Loader size={size} variant={variant} />
          {message && <p className="text-gray-600 text-center">{message}</p>}
        </div>
      </div>
    </div>
  )
}

// UNUSED EXPORTS - These should be detected by the extension
export function unusedLoaderFunction(): string {
  return 'This function is never used'
}

export const UNUSED_LOADER_CONSTANT = {
  defaultSize: 'md',
  defaultVariant: 'spinner',
}

export interface UnusedLoaderInterface {
  id: string
  duration: number
  autoHide: boolean
}

export type UnusedLoaderType = {
  state: 'loading' | 'complete' | 'error'
  progress: number
}

export class UnusedLoaderClass {
  private isLoading: boolean = false

  start(): void {
    this.isLoading = true
  }

  stop(): void {
    this.isLoading = false
  }

  getState(): boolean {
    return this.isLoading
  }
}
