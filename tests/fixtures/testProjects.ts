/**
 * Test project fixtures for integration testing
 */

export interface TestFile {
  path: string
  content: string
}

export interface TestProject {
  name: string
  files: TestFile[]
  expectedUnusedExports: string[]
  expectedCircularImports?: CircularImport[]
  config?: Record<string, any>
}

export interface CircularImport {
  files: string[]
  chain: string[]
}

export const basicTypeScriptProject: TestProject = {
  name: 'basic-typescript',
  files: [
    {
      path: '/test/src/used.ts',
      content: `
export const usedFunction = () => 'used'
export const usedVariable = 'used'
export default function usedDefault() {
  return 'used default'
}
`,
    },
    {
      path: '/test/src/unused.ts',
      content: `
export const unusedFunction = () => 'unused'
export const unusedVariable = 'unused'
export default function unusedDefault() {
  return 'unused default'
}
`,
    },
    {
      path: '/test/src/index.ts',
      content: `
import { usedFunction, usedVariable } from './used'
import usedDefault from './used'

console.log(usedFunction(), usedVariable, usedDefault())
`,
    },
    {
      path: '/test/package.json',
      content: JSON.stringify(
        {
          name: 'test-project',
          main: 'src/index.ts',
          dependencies: {},
        },
        null,
        2,
      ),
    },
    {
      path: '/test/tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            strict: true,
          },
          include: ['src/**/*'],
        },
        null,
        2,
      ),
    },
  ],
  expectedUnusedExports: ['unusedFunction', 'unusedVariable', 'unusedDefault'],
}

export const circularImportsProject: TestProject = {
  name: 'circular-imports',
  files: [
    {
      path: '/test/src/a.ts',
      content: `
import { functionB } from './b'

export const functionA = () => {
  return functionB()
}
`,
    },
    {
      path: '/test/src/b.ts',
      content: `
import { functionA } from './a'

export const functionB = () => {
  return functionA()
}
`,
    },
    {
      path: '/test/src/c.ts',
      content: `
import { functionD } from './d'

export const functionC = () => {
  return functionD()
}
`,
    },
    {
      path: '/test/src/d.ts',
      content: `
import { functionE } from './e'

export const functionD = () => {
  return functionE()
}
`,
    },
    {
      path: '/test/src/e.ts',
      content: `
import { functionC } from './c'

export const functionE = () => {
  return functionC()
}
`,
    },
  ],
  expectedUnusedExports: [],
  expectedCircularImports: [
    {
      files: ['/test/src/a.ts', '/test/src/b.ts'],
      chain: ['a.ts', 'b.ts', 'a.ts'],
    },
    {
      files: ['/test/src/c.ts', '/test/src/d.ts', '/test/src/e.ts'],
      chain: ['c.ts', 'd.ts', 'e.ts', 'c.ts'],
    },
  ],
}

export const mixedExportsProject: TestProject = {
  name: 'mixed-exports',
  files: [
    {
      path: '/test/src/exports.ts',
      content: `
// Named exports
export const namedUsed = 'used'
export const namedUnused = 'unused'

// Default export
export default function defaultUnused() {
  return 'unused default'
}

// Re-exports
export { reexportedUsed, reexportedUnused } from './other'

// Type exports
export type UsedType = string
export type UnusedType = number

// Interface exports
export interface UsedInterface {
  prop: string
}

export interface UnusedInterface {
  prop: number
}
`,
    },
    {
      path: '/test/src/other.ts',
      content: `
export const reexportedUsed = 'reexported used'
export const reexportedUnused = 'reexported unused'
`,
    },
    {
      path: '/test/src/consumer.ts',
      content: `
import { namedUsed, reexportedUsed } from './exports'
import type { UsedType } from './exports'
import type { UsedInterface } from './exports'

const value: UsedType = namedUsed
const obj: UsedInterface = { prop: reexportedUsed }

console.log(value, obj)
`,
    },
  ],
  expectedUnusedExports: ['namedUnused', 'defaultUnused', 'reexportedUnused', 'UnusedType', 'UnusedInterface'],
}

export const pathAliasesProject: TestProject = {
  name: 'path-aliases',
  files: [
    {
      path: '/test/src/components/Button.ts',
      content: `
export const Button = () => 'button'
export const UnusedButton = () => 'unused button'
`,
    },
    {
      path: '/test/src/utils/helpers.ts',
      content: `
export const helper = () => 'helper'
export const unusedHelper = () => 'unused helper'
`,
    },
    {
      path: '/test/src/index.ts',
      content: `
import { Button } from '@/components/Button'
import { helper } from '@utils/helpers'

console.log(Button(), helper())
`,
    },
    {
      path: '/test/tsconfig.json',
      content: JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            strict: true,
            baseUrl: './src',
            paths: {
              '@/*': ['*'],
              '@utils/*': ['utils/*'],
            },
          },
          include: ['src/**/*'],
        },
        null,
        2,
      ),
    },
  ],
  expectedUnusedExports: ['UnusedButton', 'unusedHelper'],
}

export const allTestProjects = [basicTypeScriptProject, circularImportsProject, mixedExportsProject, pathAliasesProject]
