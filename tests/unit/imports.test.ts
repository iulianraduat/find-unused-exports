import { describe, expect, it } from 'vitest'
import { getImports } from '../../src/unused-exports/imports'
import { TTsParsed } from '../../src/unused-exports/parsedFiles'

describe('imports', () => {
  describe('getImports', () => {
    it('should process basic named imports', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file1.ts',
          exports: [],
          imports: [
            { name: '{namedImport1}', path: './module1' },
            { name: '{namedImport2}', path: './module2' },
          ],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        inPath: '/test/file1.ts',
        name: 'namedImport1',
        fromPath: './module1',
      })
      expect(result[1]).toEqual({
        inPath: '/test/file1.ts',
        name: 'namedImport2',
        fromPath: './module2',
      })
    })

    it('should process default imports', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file2.ts',
          exports: [],
          imports: [{ name: 'defaultImport', path: './module' }],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        inPath: '/test/file2.ts',
        name: 'default',
        fromPath: './module',
      })
    })

    it('should process wildcard imports', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file3.ts',
          exports: [],
          imports: [{ name: '*', path: './module' }],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        inPath: '/test/file3.ts',
        name: '*',
        fromPath: './module',
      })
    })

    it('should process destructured imports', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file4.ts',
          exports: [],
          imports: [{ name: '{import1,import2,import3}', path: './module' }],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        inPath: '/test/file4.ts',
        name: 'import1',
        fromPath: './module',
      })
      expect(result[1]).toEqual({
        inPath: '/test/file4.ts',
        name: 'import2',
        fromPath: './module',
      })
      expect(result[2]).toEqual({
        inPath: '/test/file4.ts',
        name: 'import3',
        fromPath: './module',
      })
    })

    it('should process mixed import types', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file5.ts',
          exports: [],
          imports: [
            { name: 'defaultImport', path: './module1' },
            { name: '{named1,named2}', path: './module2' },
            { name: '*', path: './module3' },
          ],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(4)

      // Check default import
      const defaultImport = result.find((index) => index.name === 'default')
      expect(defaultImport).toEqual({
        inPath: '/test/file5.ts',
        name: 'default',
        fromPath: './module1',
      })

      // Check named imports
      const named1 = result.find((index) => index.name === 'named1')
      const named2 = result.find((index) => index.name === 'named2')
      expect(named1?.fromPath).toBe('./module2')
      expect(named2?.fromPath).toBe('./module2')

      // Check wildcard import
      const wildcardImport = result.find((index) => index.name === '*')
      expect(wildcardImport?.fromPath).toBe('./module3')
    })

    it('should handle multiple files', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/file1.ts',
          exports: [],
          imports: [
            { name: 'import1', path: './module1' },
            { name: 'import2', path: './module2' },
          ],
        },
        {
          path: '/test/file2.ts',
          exports: [],
          imports: [
            { name: '{named1,named2}', path: './module3' },
            { name: '*', path: './module4' },
          ],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(5)

      // Check file1 imports
      const file1Imports = result.filter((index) => index.inPath === '/test/file1.ts')
      expect(file1Imports).toHaveLength(2)

      // Check file2 imports
      const file2Imports = result.filter((index) => index.inPath === '/test/file2.ts')
      expect(file2Imports).toHaveLength(3) // 2 named + 1 wildcard
    })

    it('should handle empty imports array', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/empty.ts',
          exports: [],
          imports: [],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(0)
    })

    it('should handle complex destructured imports with spaces', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/complex.ts',
          exports: [],
          imports: [{ name: '{import1 as renamed, import2, import3}', path: './module' }],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(5)

      const importNames = result.map((index) => index.name).sort()
      // The parser extracts all tokens including 'as' and 'renamed'
      expect(importNames).toContain('import1')
      expect(importNames).toContain('import2')
      expect(importNames).toContain('import3')
    })

    it('should handle imports with different path formats', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/paths.ts',
          exports: [],
          imports: [
            { name: 'relative', path: './relative' },
            { name: 'absolute', path: '/absolute/path' },
            { name: 'nodeModule', path: 'node-module' },
            { name: 'scoped', path: '@scope/package' },
          ],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result).toHaveLength(4)

      const paths = result.map((index) => index.fromPath).sort()
      expect(paths).toEqual(['./relative', '/absolute/path', '@scope/package', 'node-module'])
    })

    it('should handle edge cases with empty import names', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/test/edge.ts',
          exports: [],
          imports: [
            { name: '', path: './module1' },
            { name: '{}', path: './module2' },
          ],
        },
      ]

      const result = await getImports(mockParsedFiles)

      // Should handle empty names gracefully - empty imports should be filtered out
      expect(result).toHaveLength(0)
    })

    it('should preserve original file paths in inPath', async () => {
      const mockParsedFiles: TTsParsed[] = [
        {
          path: '/very/long/path/to/file.ts',
          exports: [],
          imports: [{ name: 'test', path: './module' }],
        },
      ]

      const result = await getImports(mockParsedFiles)

      expect(result[0].inPath).toBe('/very/long/path/to/file.ts')
    })
  })
})
