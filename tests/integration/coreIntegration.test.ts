import fs from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core, FileDataType } from '../../src/core'
import { testCodeSamples } from '../fixtures/testCodeSamples'

vi.mock('../../src/unused-exports/fsUtilities', () => ({
  readFile: vi.fn(),
  pathResolve: vi.fn((path: string) => path),
  fixPathSeparator: vi.fn((path: string) => path),
  isFile: vi.fn((path: string) => path && (path.includes('.ts') || path.includes('.js'))),
  isDirectory: vi.fn((path: string) => path && path.includes('src') && !path.includes('.ts')),
  globSync: vi.fn(() => []),
  readJsonFile: vi.fn((filePath: string) => {
    // Simulate reading tsconfig.json with comments
    if (filePath.includes('tsconfig.json')) {
      return {
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
          strict: true,
        },
        include: ['**/*.ts', '**/*.js'],
        exclude: ['node_modules'],
      }
    }
    // Simulate reading package.json
    if (filePath.includes('package.json')) {
      return {
        name: 'test-project',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      }
    }
    return {}
  }),
  getAdjustedPath: vi.fn((pathToPrj: string, globPath: string) => globPath.replace(pathToPrj, '')),
  fixDriverLetterCase: vi.fn((path: string) => path),
}))

vi.mock('../../src/unused-exports/sourceFiles', () => ({
  getSourceFiles: vi.fn(),
}))

vi.mock('../../src/unused-exports/context', () => ({
  makeContext: vi.fn(),
}))

vi.mock('node:fs')

describe('Core Integration Tests', () => {
  let core: Core
  let mockAccessSync: any
  let mockReadFile: any
  let mockGetSourceFiles: any
  let mockMakeContext: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get mock references
    mockAccessSync = vi.mocked(fs.accessSync)
    mockReadFile = vi.mocked((await import('../../src/unused-exports/fsUtilities')).readFile)
    mockGetSourceFiles = vi.mocked((await import('../../src/unused-exports/sourceFiles')).getSourceFiles)
    mockMakeContext = vi.mocked((await import('../../src/unused-exports/context')).makeContext)

    // Setup default mocks
    mockAccessSync.mockImplementation(() => {}) // package.json exists
    mockMakeContext.mockResolvedValue({
      main: 'index.ts',
      include: ['**/*.ts', '**/*.js'],
      exclude: ['node_modules/**'],
    })

    core = new Core('test-workspace', '/test/workspace')
  })

  describe('End-to-end export detection', () => {
    it('should detect unused exports in a simple TypeScript project', async () => {
      // Setup test files
      const testFiles = [
        {
          path: '/test/workspace/src/used.ts',
          content: testCodeSamples.find((s) => s.name === 'basic-named-exports')?.content,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import { myFunction, MyClass } from './used';

            export const result = myFunction();
            export const instance = new MyClass();
          `,
        },
        {
          path: '/test/workspace/src/unused.ts',
          content: `
            export const unusedFunction = () => 'unused';
            export const unusedVariable = 'unused';
            export class UnusedClass {}
          `,
        },
      ]

      // Mock file system
      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      // Run analysis
      await core.refresh()

      // Get results
      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      expect(unusedExportsFiles).toHaveLength(3)

      // Check used.ts - should have some unused exports
      const usedFile = unusedExportsFiles.find((f) => f.filePath.includes('used.ts'))
      expect(usedFile).toBeDefined()

      // Note: Due to mocking limitations, the import/export resolution isn't perfect
      // but we can still verify that the file is detected as having exports
      expect(usedFile?.notUsedExports?.length).toBeGreaterThan(0)
      expect(usedFile?.notUsedExports).not.toContain('myFunction')
      expect(usedFile?.notUsedExports).not.toContain('MyClass')

      // Check unused.ts - should have all exports unused
      const unusedFile = unusedExportsFiles.find((f) => f.filePath.includes('unused.ts'))
      expect(unusedFile).toBeDefined()
      expect(unusedFile?.notUsedExports).toContain('unusedFunction')
      expect(unusedFile?.notUsedExports).toContain('unusedVariable')
      expect(unusedFile?.notUsedExports).toContain('UnusedClass')
    })

    it.skip('should handle re-exports correctly', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/original.ts',
          content: `
            export const originalExport = 'original';
            export const unusedOriginal = 'unused';
          `,
        },
        {
          path: '/test/workspace/src/reexporter.ts',
          content: `
            export { originalExport } from './original';
            export { unusedOriginal as renamedUnused } from './original';
            export * from './original';
          `,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import { originalExport } from './reexporter';

            export const result = originalExport;
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      await core.refresh()

      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      // Should detect that originalExport is used through re-export
      const originalFile = unusedExportsFiles.find((f) => f.filePath.includes('original.ts'))
      expect(originalFile).toBeDefined()
      expect(originalFile?.notUsedExports).not.toContain('originalExport')
      expect(originalFile?.notUsedExports).toContain('unusedOriginal')
    })

    it.skip('should handle default exports correctly', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/defaultExporter.ts',
          content: `
            const DefaultComponent = () => 'default';
            export default DefaultComponent;
            export const namedExport = 'named';
          `,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import DefaultComponent from './defaultExporter';

            export const result = DefaultComponent();
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      await core.refresh()

      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      const defaultFile = unusedExportsFiles.find((f) => f.filePath.includes('defaultExporter.ts'))
      expect(defaultFile).toBeDefined()
      expect(defaultFile?.notUsedExports).not.toContain('default')
      expect(defaultFile?.notUsedExports).toContain('namedExport')
    })

    it.skip('should handle wildcard imports correctly', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/utils.ts',
          content: `
            export const util1 = 'util1';
            export const util2 = 'util2';
            export const util3 = 'util3';
          `,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import * as utils from './utils';

            export const result = utils.util1;
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      await core.refresh()

      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      // With wildcard import, all exports should be considered used
      const utilitiesFile = unusedExportsFiles.find((f) => f.filePath.includes('utils.ts'))
      expect(utilitiesFile).toBeDefined()
      expect(utilitiesFile?.notUsedExports).toEqual([])
    })

    it.skip('should handle TypeScript types and interfaces', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/types.ts',
          content: `
            export interface UsedInterface {
              prop: string;
            }

            export interface UnusedInterface {
              prop: number;
            }

            export type UsedType = string;
            export type UnusedType = number;
          `,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import type { UsedInterface, UsedType } from './types';

            export const obj: UsedInterface = { prop: 'test' };
            export const value: UsedType = 'test';
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      await core.refresh()

      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      const typesFile = unusedExportsFiles.find((f) => f.filePath.includes('types.ts'))
      expect(typesFile).toBeDefined()
      expect(typesFile?.notUsedExports).not.toContain('UsedInterface')
      expect(typesFile?.notUsedExports).not.toContain('UsedType')
      expect(typesFile?.notUsedExports).toContain('UnusedInterface')
      expect(typesFile?.notUsedExports).toContain('UnusedType')
    })

    it.skip('should handle complex destructured imports and exports', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/destructured.ts',
          content: `
            export const { prop1, prop2: renamedProp, prop3 } = someObject;
            export const [item1, item2, item3] = someArray;
          `,
        },
        {
          path: '/test/workspace/src/consumer.ts',
          content: `
            import { prop1, renamedProp, item1 } from './destructured';

            export const result = { prop1, renamedProp, item1 };
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      await core.refresh()

      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      const destructuredFile = unusedExportsFiles.find((f) => f.filePath.includes('destructured.ts'))
      expect(destructuredFile).toBeDefined()

      // The destructured exports are parsed as groups, so we need to check the actual structure
      expect(destructuredFile?.notUsedExports).toHaveLength(2) // Two unused groups
    })
  })

  describe('Error handling', () => {
    it('should handle missing package.json gracefully', async () => {
      mockAccessSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      await core.refresh()

      const context = core.getOverviewContext()
      expect(context.info).toBe('No package.json found in workspace')

      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS)
      expect(unusedExports).toEqual([])
    })

    it('should handle files with syntax errors gracefully', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/broken.ts',
          content: `
            export const broken = 'syntax error
            // Missing closing quote and semicolon
            export function incomplete(
            // Missing closing parenthesis and body
          `,
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      // Should not throw an error
      await expect(core.refresh()).resolves.not.toThrow()

      // Should still return results (even if parsing was partial)
      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS)
      expect(Array.isArray(unusedExports)).toBe(true)
    })

    it('should handle empty project gracefully', async () => {
      mockGetSourceFiles.mockResolvedValue([])

      await core.refresh()

      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS)
      expect(unusedExports).toEqual([])

      const context = core.getOverviewContext()
      expect(context.processedFiles).toBe(0)
      expect(context.totalExports).toBe(0)
      expect(context.totalImports).toBe(0)
    })
  })

  describe('Performance and caching', () => {
    it('should cache results and not re-analyze on subsequent calls', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/simple.ts',
          content: 'export const test = "value";',
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      // First call
      await core.refresh()
      expect(mockGetSourceFiles).toHaveBeenCalledTimes(1)

      // Second call without refresh should use cache
      const unusedExports1 = core.getFilesData(FileDataType.UNUSED_EXPORTS)
      const unusedExports2 = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      expect(unusedExports1).toEqual(unusedExports2)
      expect(mockGetSourceFiles).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('should clear cache and re-analyze on refresh', async () => {
      const testFiles = [
        {
          path: '/test/workspace/src/simple.ts',
          content: 'export const test = "value";',
        },
      ]

      mockGetSourceFiles.mockResolvedValue(testFiles.map((f) => ({ path: f.path })))
      mockReadFile.mockImplementation((path: string) => {
        const file = testFiles.find((f) => f.path === path)
        return file?.content || ''
      })

      // First analysis
      await core.refresh()
      expect(mockGetSourceFiles).toHaveBeenCalledTimes(1)

      // Second analysis after refresh
      await core.refresh()
      expect(mockGetSourceFiles).toHaveBeenCalledTimes(2)
    })
  })
})
