/**
 * Circular import example - Part A
 * This file creates a circular dependency with CircularImportB
 * The extension should detect this circular import
 */

import type { SharedConfig } from '@/types/shared'
import { ComponentB } from './CircularImportB'

// Used class that creates circular dependency
export class ComponentA {
  private componentB: ComponentB
  private config: ConfigA

  constructor(config: ConfigA) {
    this.config = config
    this.componentB = new ComponentB({
      name: 'ComponentB',
      parentComponent: this, // This creates the circular reference
    })
  }

  processData(data: string): string {
    return this.componentB.transform(data)
  }

  getConfig(): ConfigA {
    return this.config
  }
}

// Used interface that's part of the circular dependency
export interface ConfigA extends SharedConfig {
  name: string
  componentB?: ComponentB // Circular type reference
}

// Used function that's part of the circular dependency
export function createComponentA(config: Partial<ConfigA>): ComponentA {
  return new ComponentA({
    name: 'ComponentA',
    ...config,
  })
}

// Unused export in circular import context - SHOULD be flagged
export function unusedCircularFunction(): void {
  console.log('This function is never used but is part of a circular import')
}

// Used type that references the circular dependency
export type ComponentPair = {
  componentA: ComponentA
  componentB: ComponentB
}

// Unused type - SHOULD be flagged
export type UnusedCircularType = {
  obsolete: string
}
