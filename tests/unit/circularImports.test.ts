import { beforeEach, describe, expect, it, vi } from 'vitest'
import { detectCircularImports, isCircularImportsEnabled } from '../../src/unused-exports/circularImports'
import { TNotUsed } from '../../src/unused-exports/notUsed'
import { TRelation } from '../../src/unused-exports/relations'
import {
  circularImportScenarios,
  createLinearDependencyChain,
  createSimpleCircularImport,
} from '../fixtures/circularImportScenarios'

// Mock log function
vi.mock('../../src/unused-exports/log', () => ({
  log: vi.fn(),
}))

// Mock settings
vi.mock('../../src/unused-exports/settings', () => ({
  isResultExpanded: vi.fn(() => false),
}))

describe('Circular Imports Detection', () => {
  let mockGetConfiguration: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfiguration = globalThis.mockVSCode.workspace.getConfiguration
  })

  describe('isCircularImportsEnabled', () => {
    it('should return true when circular imports detection is enabled', () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      expect(isCircularImportsEnabled()).toBe(true)
    })

    it('should return false when circular imports detection is disabled', () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(false),
      })

      expect(isCircularImportsEnabled()).toBe(false)
    })

    it('should return false by default when configuration is not set', () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(false), // Default value is false, not undefined
      })

      expect(isCircularImportsEnabled()).toBe(false)
    })
  })

  describe('detectCircularImports', () => {
    let mockNodes: TNotUsed[]

    beforeEach(() => {
      mockNodes = [
        {
          filePath: '/src/file1.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
        {
          filePath: '/src/file2.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export2'],
        },
      ]
    })

    it('should return original nodes when circular imports detection is disabled', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(false),
      })

      const relations: TRelation[] = []
      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(resultNodes).toBe(mockNodes)
      expect(count).toBe(0)
    })

    it('should detect simple circular import between two files', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file1.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(1)
      expect(resultNodes.length).toBeGreaterThanOrEqual(2) // At least the original nodes

      // Find the node with circular imports
      const circularNode = resultNodes.find((node) => node.circularImports && node.circularImports.length > 0)
      expect(circularNode).toBeDefined()
      expect(circularNode?.circularImports).toContain('/src/file2.ts')
    })

    it('should detect complex circular import chain with three files', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file3.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
        {
          path: '/src/file3.ts',
          imports: [{ path: '/src/file1.ts', names: ['import3'] }],
          exports: { used: ['export3'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(1)
      expect(resultNodes.length).toBeGreaterThanOrEqual(2)

      // Should have at least one node with circular imports
      const nodesWithCircularImports = resultNodes.filter(
        (node) => node.circularImports && node.circularImports.length > 0,
      )
      expect(nodesWithCircularImports.length).toBeGreaterThan(0)
    })

    it('should handle multiple separate circular import chains', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        // First circular chain: file1 -> file2 -> file1
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file1.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
        // Second circular chain: file3 -> file4 -> file3
        {
          path: '/src/file3.ts',
          imports: [{ path: '/src/file4.ts', names: ['import3'] }],
          exports: { used: ['export3'] },
        },
        {
          path: '/src/file4.ts',
          imports: [{ path: '/src/file3.ts', names: ['import4'] }],
          exports: { used: ['export4'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(2) // Two separate circular chains

      const nodesWithCircularImports = resultNodes.filter(
        (node) => node.circularImports && node.circularImports.length > 0,
      )
      expect(nodesWithCircularImports.length).toBe(2)
    })

    it('should not detect circular imports when there are none', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file3.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
        {
          path: '/src/file3.ts',
          imports: [], // No imports, breaks potential cycle
          exports: { used: ['export3'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(0)
      expect(resultNodes).toBe(mockNodes) // Should return original nodes unchanged
    })

    it('should handle files with no exports in circular chains', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          // No exports property
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file1.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, mockNodes)

      // Should still detect circular import even if one file has no exports
      expect(count).toBe(0) // No circular imports detected because file1 has no exports
    })

    it('should handle files with only unused exports in circular chains', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { notUsed: ['unusedExport1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file1.ts', names: ['import2'] }],
          exports: { notUsed: ['unusedExport2'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, mockNodes)

      // Should not detect circular imports because files don't have used exports
      expect(count).toBe(0)
    })

    it('should optimize relations by removing files without used exports', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file3.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
        {
          path: '/src/file3.ts',
          imports: [{ path: '/src/file1.ts', names: ['import3'] }],
          exports: { notUsed: ['unusedExport'] }, // Only unused exports
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, mockNodes)

      // Should not detect circular imports because file3 gets optimized out
      expect(count).toBe(0)
    })

    it('should handle self-referencing files', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file1.ts', names: ['selfImport'] }],
          exports: { used: ['export1'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, mockNodes)

      // Self-referencing should not be considered a circular import
      expect(count).toBe(0)
    })

    it('should add circular imports to existing nodes when file already exists', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const existingNodes: TNotUsed[] = [
        {
          filePath: '/src/file1.ts',
          isCompletelyUnused: false,
          isExpanded: false,
          notUsedExports: ['export1'],
        },
      ]

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          imports: [{ path: '/src/file2.ts', names: ['import1'] }],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          imports: [{ path: '/src/file1.ts', names: ['import2'] }],
          exports: { used: ['export2'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, existingNodes)

      expect(count).toBe(1)

      // The existing node should have circular imports added
      const file1Node = resultNodes.find((node) => node.filePath === '/src/file1.ts')
      expect(file1Node?.circularImports).toBeDefined()
      expect(file1Node?.circularImports?.length).toBeGreaterThan(0)
    })

    it('should handle empty relations array', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = []

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(0)
      expect(resultNodes).toBe(mockNodes)
    })

    it('should handle relations with no imports', async () => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })

      const relations: TRelation[] = [
        {
          path: '/src/file1.ts',
          exports: { used: ['export1'] },
        },
        {
          path: '/src/file2.ts',
          exports: { used: ['export2'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, mockNodes)

      expect(count).toBe(0)
      expect(resultNodes).toBe(mockNodes)
    })
  })

  describe('Circular Import Scenarios', () => {
    beforeEach(() => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })
    })

    // Test all predefined scenarios
    for (const scenario of circularImportScenarios) {
      it(`should handle scenario: ${scenario.name}`, async () => {
        const [resultNodes, count] = await detectCircularImports(scenario.relations, scenario.initialNodes)

        expect(count).toBe(scenario.expectedCircularCount)

        if (scenario.expectedCircularCount > 0) {
          const nodesWithCircularImports = resultNodes.filter(
            (node) => node.circularImports && node.circularImports.length > 0,
          )
          expect(nodesWithCircularImports.length).toBeGreaterThan(0)
        }
      })
    }

    it('should correctly identify circular paths in simple two-file cycle', async () => {
      const relations = createSimpleCircularImport('/src/A.ts', '/src/B.ts')
      const [resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(1)

      const circularNode = resultNodes.find((node) => node.circularImports && node.circularImports.length > 0)
      expect(circularNode).toBeDefined()
      expect(circularNode?.circularImports).toEqual(['/src/B.ts'])
    })

    it('should not detect cycles in linear dependency chains', async () => {
      const files = ['/src/base.ts', '/src/middle.ts', '/src/top.ts']
      const relations = createLinearDependencyChain(files)
      const [_resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(0)
    })

    it('should handle very long circular chains', async () => {
      const files = Array.from({ length: 10 }, (_, index) => `/src/file${index}.ts`)
      const relations: TRelation[] = []

      // Create a circular chain: file0 -> file1 -> ... -> file9 -> file0
      for (let index = 0; index < files.length; index++) {
        const nextIndex = (index + 1) % files.length
        relations.push({
          path: files[index],
          imports: [{ path: files[nextIndex], names: [`export${nextIndex}`] }],
          exports: { used: [`export${index}`] },
        })
      }

      const [resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(1)

      const circularNode = resultNodes.find((node) => node.circularImports && node.circularImports.length > 0)
      expect(circularNode).toBeDefined()
      expect(circularNode?.circularImports?.length).toBe(files.length - 1)
    })

    it('should handle mixed scenarios with both circular and linear dependencies', async () => {
      const relations: TRelation[] = [
        // Linear chain: A -> B -> C
        {
          path: '/src/A.ts',
          imports: [{ path: '/src/B.ts', names: ['exportB'] }],
          exports: { used: ['exportA'] },
        },
        {
          path: '/src/B.ts',
          imports: [{ path: '/src/C.ts', names: ['exportC'] }],
          exports: { used: ['exportB'] },
        },
        {
          path: '/src/C.ts',
          imports: [],
          exports: { used: ['exportC'] },
        },
        // Circular chain: D -> E -> D
        {
          path: '/src/D.ts',
          imports: [{ path: '/src/E.ts', names: ['exportE'] }],
          exports: { used: ['exportD'] },
        },
        {
          path: '/src/E.ts',
          imports: [{ path: '/src/D.ts', names: ['exportD'] }],
          exports: { used: ['exportE'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(1) // Only one circular chain

      const nodesWithCircularImports = resultNodes.filter(
        (node) => node.circularImports && node.circularImports.length > 0,
      )
      expect(nodesWithCircularImports.length).toBe(1)
    })
  })

  describe('Graph Construction and Cycle Detection Algorithms', () => {
    beforeEach(() => {
      mockGetConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      })
    })

    it('should correctly build dependency graph from relations', async () => {
      const relations: TRelation[] = [
        {
          path: '/src/node1.ts',
          imports: [
            { path: '/src/node2.ts', names: ['export2'] },
            { path: '/src/node3.ts', names: ['export3'] },
          ],
          exports: { used: ['export1'] },
        },
        {
          path: '/src/node2.ts',
          imports: [{ path: '/src/node3.ts', names: ['export3'] }],
          exports: { used: ['export2'] },
        },
        {
          path: '/src/node3.ts',
          imports: [],
          exports: { used: ['export3'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, [])

      // Should not detect any cycles in this DAG
      expect(count).toBe(0)
    })

    it('should detect cycles using depth-first search algorithm', async () => {
      // Create a more complex graph with multiple potential paths
      const relations: TRelation[] = [
        {
          path: '/src/A.ts',
          imports: [{ path: '/src/B.ts', names: ['B'] }],
          exports: { used: ['A'] },
        },
        {
          path: '/src/B.ts',
          imports: [
            { path: '/src/C.ts', names: ['C'] },
            { path: '/src/D.ts', names: ['D'] },
          ],
          exports: { used: ['B'] },
        },
        {
          path: '/src/C.ts',
          imports: [{ path: '/src/A.ts', names: ['A'] }], // Creates cycle A -> B -> C -> A
          exports: { used: ['C'] },
        },
        {
          path: '/src/D.ts',
          imports: [],
          exports: { used: ['D'] },
        },
      ]

      const [resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(1)

      // Should detect the cycle A -> B -> C -> A
      const circularNode = resultNodes.find((node) => node.circularImports && node.circularImports.length > 0)
      expect(circularNode).toBeDefined()
    })

    it('should handle disconnected components in the graph', async () => {
      const relations: TRelation[] = [
        // Component 1: A -> B (no cycle)
        {
          path: '/src/A.ts',
          imports: [{ path: '/src/B.ts', names: ['B'] }],
          exports: { used: ['A'] },
        },
        {
          path: '/src/B.ts',
          imports: [],
          exports: { used: ['B'] },
        },
        // Component 2: C -> D -> C (cycle)
        {
          path: '/src/C.ts',
          imports: [{ path: '/src/D.ts', names: ['D'] }],
          exports: { used: ['C'] },
        },
        {
          path: '/src/D.ts',
          imports: [{ path: '/src/C.ts', names: ['C'] }],
          exports: { used: ['D'] },
        },
        // Component 3: E (isolated)
        {
          path: '/src/E.ts',
          imports: [],
          exports: { used: ['E'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, [])

      expect(count).toBe(1) // Only one cycle in component 2
    })

    it('should optimize relations by removing nodes without used exports', async () => {
      const relations: TRelation[] = [
        {
          path: '/src/A.ts',
          imports: [{ path: '/src/B.ts', names: ['B'] }],
          exports: { used: ['A'] },
        },
        {
          path: '/src/B.ts',
          imports: [{ path: '/src/C.ts', names: ['C'] }],
          exports: { notUsed: ['unusedB'] }, // No used exports
        },
        {
          path: '/src/C.ts',
          imports: [{ path: '/src/A.ts', names: ['A'] }],
          exports: { used: ['C'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, [])

      // Should not detect cycle because B gets optimized out (no used exports)
      expect(count).toBe(0)
    })

    it('should handle optimization iterations correctly', async () => {
      const relations: TRelation[] = [
        {
          path: '/src/A.ts',
          imports: [{ path: '/src/B.ts', names: ['B'] }],
          exports: { used: ['A'] },
        },
        {
          path: '/src/B.ts',
          imports: [{ path: '/src/C.ts', names: ['C'] }],
          exports: { used: ['B'] },
        },
        {
          path: '/src/C.ts',
          imports: [{ path: '/src/D.ts', names: ['D'] }],
          exports: { notUsed: ['unusedC'] }, // No used exports
        },
        {
          path: '/src/D.ts',
          imports: [{ path: '/src/A.ts', names: ['A'] }],
          exports: { used: ['D'] },
        },
      ]

      const [_resultNodes, count] = await detectCircularImports(relations, [])

      // After optimization, C should be removed, breaking the potential cycle
      expect(count).toBe(0)
    })
  })
})
