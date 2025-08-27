// Button component with path alias imports
import { ComponentProps } from '@/types/component'
import { validateProps } from '@/utils/validation'
import { logEvent } from '@functions/logger'

export interface ButtonProps extends ComponentProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

export class Button {
  private props: ButtonProps

  constructor(props: ButtonProps) {
    if (!validateProps(props)) {
      throw new Error('Invalid button props')
    }
    this.props = props
    logEvent('button_created', { variant: props.variant, size: props.size })
  }

  render(): string {
    const { variant, size, disabled, children } = this.props
    const classes = [`btn-${variant}`, `btn-${size}`]

    if (disabled) {
      classes.push('btn-disabled')
    }

    return `<button class="${classes.join(' ')}" ${disabled ? 'disabled' : ''}>${children}</button>`
  }

  // This method is not used anywhere - should be detected as unused
  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled
  }

  // This method is not used anywhere - should be detected as unused
  getVariant(): string {
    return this.props.variant
  }
}

// This function is not used anywhere - should be detected as unused
export function createButton(props: ButtonProps): Button {
  return new Button(props)
}

// This constant is not used anywhere - should be detected as unused
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
} as const
