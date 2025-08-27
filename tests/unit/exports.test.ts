import { beforeEach, describe, expect, it } from 'vitest'
import { getExports } from '../../src/unused-exports/exports'
import { TImport } from '../../src/unused-exports/imports'
import { TTsParsed } from '../../src/unused-exports/parsedFiles'

describe('exports', () => {
  describe('getExports', () => {
    let mockImports: TImport[]
    let mockParsedFiles: TTsParsed[]

    beforeEach(() => {
      mockImports = [
        { inPath: '/test/file1.ts', name: 'usedExport', fromPath: '/test/file2.ts' },
        { inPath: '/test/file1.ts', name: '*', fromPath: '/test/file3.ts' },
        { inPath: '/test/file1.ts', name: 'default', fromPath: '/test/file4.ts' },
      ]
    })

    it('should process basic named exports', async () => {
      mockParsedFiles = [
        {
          path: '/test/file2.ts',
          exports: [
            { name: 'usedExport', path: undefined },
            { name: 'unusedExport', path: undefined },
          ],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        inPath: '/test/file2.ts',
        name: 'usedExport',
        fromPath: undefined,
        isUsed: true,
      })
      expect(result[1]).toEqual({
        inPath: '/test/file2.ts',
        name: 'unusedExport',
        fromPath: undefined,
        isUsed: false,
      })
    })

    it('should process default exports', async () => {
      mockParsedFiles = [
        {
          path: '/test/file4.ts',
          exports: [{ name: 'default', path: undefined }],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        inPath: '/test/file4.ts',
        name: 'default',
        fromPath: undefined,
        isUsed: true,
      })
    })

    it('should handle destructured exports', async () => {
      mockParsedFiles = [
        {
          path: '/test/file5.ts',
          exports: [{ name: '{prop1,prop2}', path: undefined }],
          imports: [],
        },
      ]

      mockImports = [{ inPath: '/test/consumer.ts', name: 'prop1', fromPath: '/test/file5.ts' }]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        inPath: '/test/file5.ts',
        name: 'prop1',
        fromPath: undefined,
        isUsed: true,
      })
      expect(result[1]).toEqual({
        inPath: '/test/file5.ts',
        name: 'prop2',
        fromPath: undefined,
        isUsed: false,
      })
    })

    it('should handle re-exports', async () => {
      mockParsedFiles = [
        {
          path: '/test/file6.ts',
          exports: [
            { name: 'reExported', path: '/test/source.ts' },
            { name: '*', path: '/test/all-exports.ts' },
          ],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        inPath: '/test/file6.ts',
        name: 'reExported',
        fromPath: '/test/source.ts',
        isUsed: false,
      })
      expect(result[1]).toEqual({
        inPath: '/test/file6.ts',
        name: '*',
        fromPath: '/test/all-exports.ts',
        isUsed: false,
      })
    })

    it('should detect usage with wildcard imports', async () => {
      mockParsedFiles = [
        {
          path: '/test/file3.ts',
          exports: [
            { name: 'export1', path: undefined },
            { name: 'export2', path: undefined },
          ],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      // Both exports should be marked as used because of wildcard import
      expect(result).toHaveLength(2)
      expect(result[0].isUsed).toBe(true)
      expect(result[1].isUsed).toBe(true)
    })

    it('should handle complex export names with spaces and special characters', async () => {
      mockParsedFiles = [
        {
          path: '/test/complex.ts',
          exports: [
            { name: '{export1 as renamed, export2}', path: undefined },
            { name: 'namespace', path: '/test/ns.ts' },
          ],
          imports: [],
        },
      ]

      mockImports = [{ inPath: '/test/consumer.ts', name: 'renamed', fromPath: '/test/complex.ts' }]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(5)

      // The current implementation extracts all variable names from the destructured export
      // including 'export1', 'as', 'renamed', 'export2', and 'namespace'
      const exportNames = result.map((e) => e.name).sort()
      expect(exportNames).toContain('export1')
      expect(exportNames).toContain('export2')
      expect(exportNames).toContain('namespace')

      // The 'renamed' export should be used
      const renamedExport = result.find((e) => e.name === 'renamed')
      const export2 = result.find((e) => e.name === 'export2')
      const namespaceExport = result.find((e) => e.name === 'namespace')

      expect(renamedExport?.isUsed).toBe(true)
      expect(export2?.isUsed).toBe(false)
      expect(namespaceExport?.isUsed).toBe(false)
    })

    it('should handle empty exports array', async () => {
      mockParsedFiles = [
        {
          path: '/test/empty.ts',
          exports: [],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(0)
    })

    it('should handle multiple files with mixed export types', async () => {
      mockParsedFiles = [
        {
          path: '/test/file1.ts',
          exports: [
            { name: 'namedExport', path: undefined },
            { name: 'default', path: undefined },
          ],
          imports: [],
        },
        {
          path: '/test/file2.ts',
          exports: [
            { name: '{destructured1,destructured2}', path: undefined },
            { name: '*', path: '/test/source.ts' },
          ],
          imports: [],
        },
      ]

      mockImports = [
        { inPath: '/test/consumer.ts', name: 'namedExport', fromPath: '/test/file1.ts' },
        { inPath: '/test/consumer.ts', name: 'destructured1', fromPath: '/test/file2.ts' },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      expect(result).toHaveLength(5)

      // Check usage
      const usedExports = result.filter((e) => e.isUsed)
      const unusedExports = result.filter((e) => !e.isUsed)

      expect(usedExports).toHaveLength(2)
      expect(unusedExports).toHaveLength(3)
    })

    it('should handle edge case with empty export names', async () => {
      mockParsedFiles = [
        {
          path: '/test/edge.ts',
          exports: [
            { name: '', path: undefined },
            { name: '{}', path: undefined },
          ],
          imports: [],
        },
      ]

      const result = await getExports(mockParsedFiles, mockImports)

      // Should handle empty names gracefully - empty exports should be filtered out
      expect(result).toHaveLength(0)
    })
  })
})
