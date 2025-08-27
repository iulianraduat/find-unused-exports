import { describe, it, expect, vi } from 'vitest'
import { getNotUsed, sortNotUsedFunction, TNotUsed } from '../../src/unused-exports/notUsed'
import { TRelation } from '../../src/unused-exports/relations'

// Mock the settings module
vi.mock('../../src/unused-exports/settings', () => ({
  isResultExpanded: vi.fn(() => false),
}))

describe('notUsed', () => {
  describe('getNotUsed', () => {
    it('should identify unused exports in a single file', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            used: ['usedExport'],
            notUsed: ['unusedExport', 'anotherUnusedExport'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        filePath: '/test/file1.ts',
        isCompletelyUnused: false,
        isExpanded: false,
        notUsedExports: ['anotherUnusedExport', 'unusedExport'], // sorted
      })
    })

    it('should handle files with no unused exports', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            used: ['usedExport1', 'usedExport2'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(0) // No unused exports, so no results
    })

    it('should handle files with no exports', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          imports: [{ names: ['import1'], path: './other' }],
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(0) // No exports, so no results
    })

    it('should handle multiple files with mixed usage', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            used: ['usedExport'],
            notUsed: ['unusedExport'],
          },
        },
        {
          path: '/test/file2.ts',
          exports: {
            used: ['allUsed1', 'allUsed2'],
          },
        },
        {
          path: '/test/file3.ts',
          exports: {
            notUsed: ['unused1', 'unused2', 'unused3'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(2) // Only files with unused exports

      const file1Result = result.find((r) => r.filePath === '/test/file1.ts')
      const file3Result = result.find((r) => r.filePath === '/test/file3.ts')

      expect(file1Result?.notUsedExports).toEqual(['unusedExport'])
      expect(file1Result?.isCompletelyUnused).toBe(false)
      expect(file3Result?.notUsedExports).toEqual(['unused1', 'unused2', 'unused3'])
      expect(file3Result?.isCompletelyUnused).toBe(true) // No used exports
    })

    it('should handle undefined exports', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          // No exports property
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(0)
    })

    it('should handle files that are completely unused', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            notUsed: ['export1', 'export2', 'export3'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(1)
      expect(result[0].isCompletelyUnused).toBe(true)
      expect(result[0].notUsedExports).toEqual(['export1', 'export2', 'export3'])
    })

    it('should preserve file path exactly as provided', async () => {
      const relations: TRelation[] = [
        {
          path: '/very/long/path/to/deeply/nested/file.ts',
          exports: {
            notUsed: ['unusedExport'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('/very/long/path/to/deeply/nested/file.ts')
    })

    it('should handle empty relations array', async () => {
      const relations: TRelation[] = []

      const result = await getNotUsed(relations)

      expect(result).toEqual([])
    })

    it('should sort unused exports alphabetically', async () => {
      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            notUsed: ['zExport', 'aExport', 'mExport'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(1)
      expect(result[0].notUsedExports).toEqual(['aExport', 'mExport', 'zExport'])
    })

    it('should use isResultExpanded setting', async () => {
      const mockIsResultExpanded = vi.mocked((await import('../../src/unused-exports/settings')).isResultExpanded)
      mockIsResultExpanded.mockReturnValue(true)

      const relations: TRelation[] = [
        {
          path: '/test/file1.ts',
          exports: {
            notUsed: ['unusedExport'],
          },
        },
      ]

      const result = await getNotUsed(relations)

      expect(result).toHaveLength(1)
      expect(result[0].isExpanded).toBe(true)
    })
  })

  describe('sortNotUsedFn', () => {
    it('should sort by file path alphabetically', () => {
      const notUsedList: TNotUsed[] = [
        {
          filePath: '/test/z-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
        {
          filePath: '/test/a-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export2'],
        },
        {
          filePath: '/test/m-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export3'],
        },
      ]

      const sorted = notUsedList.sort(sortNotUsedFunction)

      expect(sorted[0].filePath).toBe('/test/a-file.ts')
      expect(sorted[1].filePath).toBe('/test/m-file.ts')
      expect(sorted[2].filePath).toBe('/test/z-file.ts')
    })

    it('should handle identical file paths', () => {
      const notUsedList: TNotUsed[] = [
        {
          filePath: '/test/same-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
        {
          filePath: '/test/same-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export2'],
        },
      ]

      const sorted = notUsedList.sort(sortNotUsedFunction)

      expect(sorted).toHaveLength(2)
      expect(sorted[0].filePath).toBe('/test/same-file.ts')
      expect(sorted[1].filePath).toBe('/test/same-file.ts')
    })

    it('should handle case-insensitive sorting (localeCompare)', () => {
      const notUsedList: TNotUsed[] = [
        {
          filePath: '/test/Z-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
        {
          filePath: '/test/a-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export2'],
        },
        {
          filePath: '/test/A-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export3'],
        },
      ]

      const sorted = notUsedList.sort(sortNotUsedFunction)

      // localeCompare sorts case-insensitively by default
      expect(sorted[0].filePath).toBe('/test/a-file.ts')
      expect(sorted[1].filePath).toBe('/test/A-file.ts')
      expect(sorted[2].filePath).toBe('/test/Z-file.ts')
    })

    it('should handle paths with different depths', () => {
      const notUsedList: TNotUsed[] = [
        {
          filePath: '/test/deep/nested/file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
        {
          filePath: '/test/file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export2'],
        },
        {
          filePath: '/test/another/file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export3'],
        },
      ]

      const sorted = notUsedList.sort(sortNotUsedFunction)

      expect(sorted[0].filePath).toBe('/test/another/file.ts')
      expect(sorted[1].filePath).toBe('/test/deep/nested/file.ts')
      expect(sorted[2].filePath).toBe('/test/file.ts')
    })

    it('should handle empty array', () => {
      const notUsedList: TNotUsed[] = []

      const sorted = notUsedList.sort(sortNotUsedFunction)

      expect(sorted).toEqual([])
    })

    it('should handle single item', () => {
      const notUsedList: TNotUsed[] = [
        {
          filePath: '/test/single-file.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
      ]

      const sorted = notUsedList.sort(sortNotUsedFunction)

      expect(sorted).toHaveLength(1)
      expect(sorted[0].filePath).toBe('/test/single-file.ts')
    })
  })
})
