/**
 * Circular import example - Part B
 * This file creates a circular dependency with CircularImportA
 * The extension should detect this circular import
 */

import type { SharedConfig } from '@/types/shared'
import { ComponentA } from './CircularImportA'

// Used class that creates circular dependency
export class ComponentB {
  private componentA?: ComponentA
  private config: ConfigB

  constructor(config: ConfigB) {
    this.config = config
    if (config.parentComponent) {
      this.componentA = config.parentComponent
    }
  }

  transform(data: string): string {
    const prefix = this.componentA ? 'A-' : 'B-'
    return `${prefix}${data.toUpperCase()}`
  }

  getParent(): ComponentA | undefined {
    return this.componentA
  }
}

// Used interface that's part of the circular dependency
export interface ConfigB extends SharedConfig {
  name: string
  parentComponent?: ComponentA // Circular type reference
}

// Used function that's part of the circular dependency
export function createComponentB(parentA: ComponentA): ComponentB {
  return new ComponentB({
    name: 'ComponentB',
    parentComponent: parentA,
  })
}

// Unused export in circular import context - SHOULD be flagged
export function anotherUnusedCircularFunction(): void {
  console.log('This function is also never used in the circular import')
}

// Used constant that's part of the circular dependency
export const COMPONENT_B_DEFAULTS: Partial<ConfigB> = {
  name: 'DefaultComponentB',
}

// Unused constant - SHOULD be flagged
export const UNUSED_CIRCULAR_CONSTANT = 'never used'
