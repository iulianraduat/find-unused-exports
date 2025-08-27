// Component-related types
export interface ComponentProps {
  children: string
  className?: string
  id?: string
}

export interface ComponentState {
  mounted: boolean
  visible: boolean
}

// This interface is not used anywhere - should be detected as unused
export interface ComponentConfig {
  autoMount: boolean
  lazy: boolean
  timeout: number
}
