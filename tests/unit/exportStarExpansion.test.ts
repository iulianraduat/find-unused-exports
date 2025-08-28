import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getExports } from '../../src/unused-exports/exports'
import * as fsUtilities from '../../src/unused-exports/fsUtilities'
import { TTsParsed } from '../../src/unused-exports/parsedFiles'

// Mock fsUtilities
vi.mock('../../src/unused-exports/fsUtilities', () => ({
  readFile: vi.fn(),
  pathResolve: vi.fn((path: string) => path),
  fixPathSeparator: vi.fn((path: string) => path),
  isFile: vi.fn(() => true),
  isDirectory: vi.fn(() => false),
  globSync: vi.fn(() => []),
  readJsonFile: vi.fn(),
  getAdjustedPath: vi.fn((path: string) => path),
  fixDriverLetterCase: vi.fn((path: string) => path),
}))

describe('Export Star Expansion', () => {
  const mockReadFile = vi.mocked(fsUtilities.readFile)
  const mockPathResolve = vi.mocked(fsUtilities.pathResolve)

  beforeEach(() => {
    vi.clearAllMocks()
    mockPathResolve.mockImplementation((path: string) => path)
  })

  it('should expand export * to specific exports from target file', async () => {
    // Mock file contents
    mockReadFile.mockImplementation((path: string) => {
      if (path === '/test/original.ts') {
        return `
          export const originalExport = 'value'
          export function originalFunction() {}
          export class OriginalClass {}
        `
      }
      if (path === '/test/reexporter.ts') {
        return `
          export * from './original'
          export const reexporterOwn = 'own'
        `
      }
      return ''
    })

    const parsedFiles: TTsParsed[] = [
      {
        path: '/test/original.ts',
        imports: [],
        exports: [
          { name: 'originalExport', path: '' },
          { name: 'originalFunction', path: '' },
          { name: 'OriginalClass', path: '' },
        ],
      },
      {
        path: '/test/reexporter.ts',
        imports: [{ name: '*', path: './original' }],
        exports: [
          { name: '*', path: './original' },
          { name: 'reexporterOwn', path: '' },
        ],
      },
    ]

    const imports = [{ inPath: '/test/consumer.ts', name: 'originalExport', fromPath: '/test/reexporter' }]

    const result = await getExports(parsedFiles, imports)

    // Find the reexporter file exports
    const reexporterExports = result.filter((exp) => exp.inPath === '/test/reexporter.ts')

    // Should have expanded the export * to specific exports plus its own export
    expect(reexporterExports.length).toBeGreaterThan(1)

    // Should include the expanded exports from original.ts
    const exportNames = reexporterExports.map((exp) => exp.name)
    expect(exportNames).toContain('originalExport')
    expect(exportNames).toContain('originalFunction')
    expect(exportNames).toContain('OriginalClass')
    expect(exportNames).toContain('reexporterOwn')

    // originalExport should be marked as used since it's imported by consumer
    const originalExportFromReexporter = reexporterExports.find((exp) => exp.name === 'originalExport')
    expect(originalExportFromReexporter?.isUsed).toBe(true)
  })

  it('should handle export * when target file is not found', async () => {
    mockReadFile.mockImplementation((path: string) => {
      if (path === '/test/reexporter.ts') {
        return `export * from './nonexistent'`
      }
      return ''
    })

    const parsedFiles: TTsParsed[] = [
      {
        path: '/test/reexporter.ts',
        imports: [{ name: '*', path: './nonexistent' }],
        exports: [{ name: '*', path: './nonexistent' }],
      },
    ]

    const imports: any[] = []

    const result = await getExports(parsedFiles, imports)

    // Should fallback to original behavior when target file not found
    const reexporterExports = result.filter((exp) => exp.inPath === '/test/reexporter.ts')
    expect(reexporterExports).toHaveLength(1)
    expect(reexporterExports[0].name).toBe('*')
  })

  it('should avoid infinite recursion with circular export *', async () => {
    mockReadFile.mockImplementation((path: string) => {
      if (path === '/test/file1.ts') {
        return `export * from './file2'`
      }
      if (path === '/test/file2.ts') {
        return `export * from './file1'`
      }
      return ''
    })

    const parsedFiles: TTsParsed[] = [
      {
        path: '/test/file1.ts',
        imports: [{ name: '*', path: './file2' }],
        exports: [{ name: '*', path: './file2' }],
      },
      {
        path: '/test/file2.ts',
        imports: [{ name: '*', path: './file1' }],
        exports: [{ name: '*', path: './file1' }],
      },
    ]

    const imports: any[] = []

    const result = await getExports(parsedFiles, imports)

    // Should handle circular references gracefully
    expect(result).toHaveLength(2)
    expect(result.every((exp) => exp.name === '*')).toBe(true)
  })
})
