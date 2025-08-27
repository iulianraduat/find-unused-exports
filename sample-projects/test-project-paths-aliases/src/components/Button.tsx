// Enhanced Button component with comprehensive props and variants
import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { Icon, IconName } from '@/components/Icon'
import { Loader } from '@/components/Loader'
import { cn } from '@/utils/classNames'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: IconName
  rightIcon?: IconName
  children: React.ReactNode
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500',
}

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Variant styles
          buttonVariants[variant],

          // Size styles
          buttonSizes[size],

          // Full width
          fullWidth && 'w-full',

          // Custom className
          className,
        )}
        {...props}
      >
        {loading && <Loader size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} className="mr-2" />}

        {leftIcon && !loading && (
          <Icon name={leftIcon} size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} className="mr-2" />
        )}

        <span className={loading ? 'opacity-70' : ''}>{children}</span>

        {rightIcon && !loading && (
          <Icon name={rightIcon} size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} className="ml-2" />
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

// Button group component for related actions
export interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'sm',
  className,
}) => {
  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
    lg: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6',
  }

  return (
    <div
      className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', spacingClasses[spacing], className)}
    >
      {children}
    </div>
  )
}

// Icon button variant for actions with only icons
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: IconName
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ icon, size = 'md', ...props }, ref) => {
  return (
    <Button ref={ref} size={size} {...props}>
      <Icon name={icon} size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
    </Button>
  )
})

IconButton.displayName = 'IconButton'

// Toggle button for on/off states
export interface ToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed = false, onPressedChange, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onPressedChange?.(!pressed)
      onClick?.(event)
    }

    return (
      <Button
        ref={ref}
        variant={pressed ? 'primary' : 'outline'}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      />
    )
  },
)

ToggleButton.displayName = 'ToggleButton'

// UNUSED EXPORTS - These should be detected by the extension
export function unusedButtonFunction(): string {
  return 'This function is never used'
}

export const UNUSED_BUTTON_CONSTANT = {
  defaultVariant: 'primary',
  defaultSize: 'md',
}

export interface UnusedButtonInterface {
  id: string
  label: string
  action: () => void
}

export type UnusedButtonType = {
  state: 'idle' | 'loading' | 'success' | 'error'
  metadata: Record<string, any>
}

export class UnusedButtonClass {
  private buttons: string[] = []

  addButton(button: string): void {
    this.buttons.push(button)
  }

  getButtons(): string[] {
    return this.buttons
  }
}

export enum UnusedButtonEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}
