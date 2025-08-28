import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getParsedFiles } from '../../src/unused-exports/parsedFiles'
import { TTsFile } from '../../src/unused-exports/sourceFiles'
import { testCodeSamples } from '../fixtures/testCodeSamples'

// Mock the fsUtils module
vi.mock('../../src/unused-exports/fsUtilities', () => ({
  readFile: vi.fn(),
}))

// Mock the log module
vi.mock('../../src/unused-exports/log', () => ({
  log: vi.fn(() => Date.now()),
}))

describe('parsedFiles', () => {
  let mockReadFile: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockReadFile = vi.mocked((await import('../../src/unused-exports/fsUtilities')).readFile)
  })

  describe('getParsedFiles', () => {
    it('should parse basic named exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'basic-named-exports')
      const files: TTsFile[] = [{ path: '/test/basic.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('/test/basic.ts')
      expect(result[0].exports).toHaveLength(6)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('myVariable')
      expect(exportNames).toContain('myFunction')
      expect(exportNames).toContain('MyClass')
      expect(exportNames).toContain('MyInterface')
      expect(exportNames).toContain('MyType')
      expect(exportNames).toContain('MyEnum')
    })

    it('should parse default exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'default-exports')
      const files: TTsFile[] = [{ path: '/test/default.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(1)
      expect(result[0].exports[0].name).toBe('default')
    })

    it('should parse mixed exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'mixed-exports')
      const files: TTsFile[] = [{ path: '/test/mixed.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(3)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('helper')
      expect(exportNames).toContain('{default}')
      expect(exportNames).toContain('{utilityHelper}')
    })

    it('should parse destructured exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'destructured-exports')
      const files: TTsFile[] = [{ path: '/test/destructured.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(1)

      // Check that destructured exports are parsed correctly
      // Only object destructuring is currently supported, not array destructuring
      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('prop1,renamedProp')
    })

    it('should parse re-exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 're-exports')
      const files: TTsFile[] = [{ path: '/test/reexports.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(4)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('{namedExport}')
      expect(exportNames).toContain('{renamedDefault}')
      expect(exportNames).toContain('*')
      expect(exportNames).toContain('namespace')
    })

    it('should parse basic imports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'basic-imports')
      const files: TTsFile[] = [{ path: '/test/imports.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].imports).toHaveLength(5)

      const imports = result[0].imports
      expect(imports.find((index) => index.path === './module1')).toBeDefined()
      expect(imports.find((index) => index.path === './module2')).toBeDefined()
      expect(imports.find((index) => index.path === './module3')).toBeDefined()
      expect(imports.find((index) => index.path === './module4')).toBeDefined()
      expect(imports.find((index) => index.path === './module5')).toBeDefined()
    })

    it('should parse type-only imports and exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'type-only')
      const files: TTsFile[] = [{ path: '/test/types.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)

      // Check imports - includes re-export imports
      expect(result[0].imports).toHaveLength(3)
      const typeImport = result[0].imports.find((index) => index.name === '{TypeImport}')
      expect(typeImport?.path).toBe('./types')

      // Check exports
      expect(result[0].exports).toHaveLength(2)
      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('{TypeExport}')
      expect(exportNames).toContain('LocalType')
    })

    it('should parse complex mixed patterns', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'complex-mixed')
      const files: TTsFile[] = [{ path: '/test/complex.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)

      // Check imports
      expect(result[0].imports).toHaveLength(4)
      const importPaths = result[0].imports.map((index) => index.path)
      expect(importPaths).toContain('react')
      expect(importPaths).toContain('./types')
      expect(importPaths).toContain('./utils')

      // Check exports
      expect(result[0].exports).toHaveLength(3)
      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('Props')
      expect(exportNames).toContain('MyComponent')
      expect(exportNames).toContain('default')
    })

    it('should handle comments and strings correctly', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'edge-cases-comments')
      const files: TTsFile[] = [{ path: '/test/comments.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)

      // Should only find the real export, not the ones in comments or strings
      expect(result[0].exports).toHaveLength(2)
      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('realExport')
    })

    it('should parse namespace exports', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'namespace-exports')
      const files: TTsFile[] = [{ path: '/test/namespace.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(3)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('value')
      expect(exportNames).toContain('helper')
      expect(exportNames).toContain('{MyNamespace}')
    })

    it('should parse generator functions', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'generator-functions')
      const files: TTsFile[] = [{ path: '/test/generators.ts' }]

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(1)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('generatorFunction')
    })

    it('should handle ignored exports when showIgnoredExports is false', async () => {
      const sample = testCodeSamples.find((s) => s.name === 'ignored-exports')
      const files: TTsFile[] = [{ path: '/test/ignored.ts' }]

      // Mock VS Code configuration to return false for showIgnoredExports
      vi.mocked(globalThis.mockVSCode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn().mockReturnValue(false),
        has: vi.fn(),
        inspect: vi.fn(),
        update: vi.fn(),
      } as any)

      mockReadFile.mockReturnValue(sample?.content)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(2)

      const exportNames = result[0].exports.map((e) => e.name)
      expect(exportNames).toContain('normalExport')
      expect(exportNames).toContain('anotherNormalExport')
      expect(exportNames).not.toContain('ignoredExport')
    })

    it('should handle multiple files', async () => {
      const files: TTsFile[] = [{ path: '/test/file1.ts' }, { path: '/test/file2.ts' }]

      mockReadFile
        .mockReturnValueOnce('export const export1 = "value1";')
        .mockReturnValueOnce('export const export2 = "value2";')

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(2)
      expect(result[0].path).toBe('/test/file1.ts')
      expect(result[1].path).toBe('/test/file2.ts')
      expect(result[0].exports[0].name).toBe('export1')
      expect(result[1].exports[0].name).toBe('export2')
    })

    it('should handle empty files', async () => {
      const files: TTsFile[] = [{ path: '/test/empty.ts' }]

      mockReadFile.mockReturnValue('')

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(0)
      expect(result[0].imports).toHaveLength(0)
    })

    it('should handle files with only comments', async () => {
      const files: TTsFile[] = [{ path: '/test/comments-only.ts' }]

      mockReadFile.mockReturnValue(`
        // This is a comment
        /* This is a block comment */
        // Another comment
      `)

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].exports).toHaveLength(0)
      expect(result[0].imports).toHaveLength(0)
    })

    it('should preserve file path information', async () => {
      const files: TTsFile[] = [{ path: '/very/long/path/to/file.ts' }]

      mockReadFile.mockReturnValue('export const test = "value";')

      const result = await getParsedFiles(files)

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('/very/long/path/to/file.ts')
    })
  })
})
