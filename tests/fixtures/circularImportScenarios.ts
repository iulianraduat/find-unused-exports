/**
 * Test fixtures for circular import detection scenarios
 */

import { TNotUsed } from '../../src/unused-exports/notUsed'
import { TRelation } from '../../src/unused-exports/relations'

export interface CircularImportScenario {
  name: string
  description: string
  relations: TRelation[]
  initialNodes: TNotUsed[]
  expectedCircularCount: number
  expectedCircularPaths: string[][]
}

export const circularImportScenarios: CircularImportScenario[] = [
  {
    name: 'simple-two-file-cycle',
    description: 'Basic circular import between two files',
    relations: [
      {
        path: '/src/components/Button.ts',
        imports: [{ path: '/src/components/Icon.ts', names: ['Icon'] }],
        exports: { used: ['Button'] },
      },
      {
        path: '/src/components/Icon.ts',
        imports: [{ path: '/src/components/Button.ts', names: ['Button'] }],
        exports: { used: ['Icon'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 1,
    expectedCircularPaths: [['/src/components/Button.ts', '/src/components/Icon.ts']],
  },

  {
    name: 'three-file-cycle',
    description: 'Circular import chain through three files',
    relations: [
      {
        path: '/src/services/UserService.ts',
        imports: [{ path: '/src/services/AuthService.ts', names: ['AuthService'] }],
        exports: { used: ['UserService'] },
      },
      {
        path: '/src/services/AuthService.ts',
        imports: [{ path: '/src/services/DataService.ts', names: ['DataService'] }],
        exports: { used: ['AuthService'] },
      },
      {
        path: '/src/services/DataService.ts',
        imports: [{ path: '/src/services/UserService.ts', names: ['UserService'] }],
        exports: { used: ['DataService'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 1,
    expectedCircularPaths: [
      ['/src/services/UserService.ts', '/src/services/AuthService.ts', '/src/services/DataService.ts'],
    ],
  },

  {
    name: 'multiple-separate-cycles',
    description: 'Two separate circular import chains',
    relations: [
      // First cycle: A -> B -> A
      {
        path: '/src/utils/helperA.ts',
        imports: [{ path: '/src/utils/helperB.ts', names: ['helperB'] }],
        exports: { used: ['helperA'] },
      },
      {
        path: '/src/utils/helperB.ts',
        imports: [{ path: '/src/utils/helperA.ts', names: ['helperA'] }],
        exports: { used: ['helperB'] },
      },
      // Second cycle: C -> D -> C
      {
        path: '/src/models/ModelC.ts',
        imports: [{ path: '/src/models/ModelD.ts', names: ['ModelD'] }],
        exports: { used: ['ModelC'] },
      },
      {
        path: '/src/models/ModelD.ts',
        imports: [{ path: '/src/models/ModelC.ts', names: ['ModelC'] }],
        exports: { used: ['ModelD'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 2,
    expectedCircularPaths: [
      ['/src/utils/helperA.ts', '/src/utils/helperB.ts'],
      ['/src/models/ModelC.ts', '/src/models/ModelD.ts'],
    ],
  },

  {
    name: 'complex-four-file-cycle',
    description: 'Complex circular import through four files',
    relations: [
      {
        path: '/src/components/Header.ts',
        imports: [{ path: '/src/components/Navigation.ts', names: ['Navigation'] }],
        exports: { used: ['Header'] },
      },
      {
        path: '/src/components/Navigation.ts',
        imports: [{ path: '/src/components/Menu.ts', names: ['Menu'] }],
        exports: { used: ['Navigation'] },
      },
      {
        path: '/src/components/Menu.ts',
        imports: [{ path: '/src/components/MenuItem.ts', names: ['MenuItem'] }],
        exports: { used: ['Menu'] },
      },
      {
        path: '/src/components/MenuItem.ts',
        imports: [{ path: '/src/components/Header.ts', names: ['Header'] }],
        exports: { used: ['MenuItem'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 1,
    expectedCircularPaths: [
      [
        '/src/components/Header.ts',
        '/src/components/Navigation.ts',
        '/src/components/Menu.ts',
        '/src/components/MenuItem.ts',
      ],
    ],
  },

  {
    name: 'no-circular-imports',
    description: 'Linear dependency chain with no cycles',
    relations: [
      {
        path: '/src/utils/base.ts',
        imports: [],
        exports: { used: ['baseFunction'] },
      },
      {
        path: '/src/utils/helper.ts',
        imports: [{ path: '/src/utils/base.ts', names: ['baseFunction'] }],
        exports: { used: ['helperFunction'] },
      },
      {
        path: '/src/services/api.ts',
        imports: [{ path: '/src/utils/helper.ts', names: ['helperFunction'] }],
        exports: { used: ['apiCall'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 0,
    expectedCircularPaths: [],
  },

  {
    name: 'cycle-with-unused-exports',
    description: 'Circular import where one file has only unused exports',
    relations: [
      {
        path: '/src/legacy/oldModule.ts',
        imports: [{ path: '/src/legacy/deprecatedModule.ts', names: ['deprecatedFunction'] }],
        exports: { notUsed: ['oldFunction'] }, // Only unused exports
      },
      {
        path: '/src/legacy/deprecatedModule.ts',
        imports: [{ path: '/src/legacy/oldModule.ts', names: ['oldFunction'] }],
        exports: { used: ['deprecatedFunction'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 0, // Should not detect cycle because oldModule has no used exports
    expectedCircularPaths: [],
  },

  {
    name: 'cycle-with-mixed-exports',
    description: 'Circular import with files having both used and unused exports',
    relations: [
      {
        path: '/src/mixed/moduleA.ts',
        imports: [{ path: '/src/mixed/moduleB.ts', names: ['usedExportB'] }],
        exports: {
          used: ['usedExportA'],
          notUsed: ['unusedExportA'],
        },
      },
      {
        path: '/src/mixed/moduleB.ts',
        imports: [{ path: '/src/mixed/moduleA.ts', names: ['usedExportA'] }],
        exports: {
          used: ['usedExportB'],
          notUsed: ['unusedExportB'],
        },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 1,
    expectedCircularPaths: [['/src/mixed/moduleA.ts', '/src/mixed/moduleB.ts']],
  },

  {
    name: 'self-referencing-file',
    description: 'File that imports from itself',
    relations: [
      {
        path: '/src/recursive/recursiveModule.ts',
        imports: [{ path: '/src/recursive/recursiveModule.ts', names: ['recursiveFunction'] }],
        exports: { used: ['recursiveFunction'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 0, // Self-referencing should not count as circular import
    expectedCircularPaths: [],
  },

  {
    name: 'diamond-dependency-no-cycle',
    description: 'Diamond dependency pattern without circular imports',
    relations: [
      {
        path: '/src/diamond/base.ts',
        imports: [],
        exports: { used: ['BaseClass'] },
      },
      {
        path: '/src/diamond/left.ts',
        imports: [{ path: '/src/diamond/base.ts', names: ['BaseClass'] }],
        exports: { used: ['LeftClass'] },
      },
      {
        path: '/src/diamond/right.ts',
        imports: [{ path: '/src/diamond/base.ts', names: ['BaseClass'] }],
        exports: { used: ['RightClass'] },
      },
      {
        path: '/src/diamond/top.ts',
        imports: [
          { path: '/src/diamond/left.ts', names: ['LeftClass'] },
          { path: '/src/diamond/right.ts', names: ['RightClass'] },
        ],
        exports: { used: ['TopClass'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 0,
    expectedCircularPaths: [],
  },

  {
    name: 'multiple-imports-same-files',
    description: 'Circular import with multiple imports between same files',
    relations: [
      {
        path: '/src/multi/fileX.ts',
        imports: [{ path: '/src/multi/fileY.ts', names: ['exportY1', 'exportY2'] }],
        exports: { used: ['exportX1', 'exportX2'] },
      },
      {
        path: '/src/multi/fileY.ts',
        imports: [{ path: '/src/multi/fileX.ts', names: ['exportX1'] }],
        exports: { used: ['exportY1', 'exportY2'] },
      },
    ],
    initialNodes: [],
    expectedCircularCount: 1,
    expectedCircularPaths: [['/src/multi/fileX.ts', '/src/multi/fileY.ts']],
  },

  {
    name: 'existing-nodes-with-circular',
    description: 'Scenario where nodes already exist and circular imports are added',
    relations: [
      {
        path: '/src/existing/moduleA.ts',
        imports: [{ path: '/src/existing/moduleB.ts', names: ['functionB'] }],
        exports: { used: ['functionA'] },
      },
      {
        path: '/src/existing/moduleB.ts',
        imports: [{ path: '/src/existing/moduleA.ts', names: ['functionA'] }],
        exports: { used: ['functionB'] },
      },
    ],
    initialNodes: [
      {
        filePath: '/src/existing/moduleA.ts',
        isCompletelyUnused: false,
        isExpanded: false,
        notUsedExports: ['unusedExportA'],
      },
      {
        filePath: '/src/existing/moduleB.ts',
        isCompletelyUnused: false,
        isExpanded: false,
        notUsedExports: ['unusedExportB'],
      },
    ],
    expectedCircularCount: 1,
    expectedCircularPaths: [['/src/existing/moduleA.ts', '/src/existing/moduleB.ts']],
  },
]

/**
 * Helper function to create a test scenario with custom parameters
 */
export const createCircularImportScenario = (
  name: string,
  relations: TRelation[],
  expectedCircularCount: number,
  initialNodes: TNotUsed[] = [],
): CircularImportScenario => ({
  name,
  description: `Custom scenario: ${name}`,
  relations,
  initialNodes,
  expectedCircularCount,
  expectedCircularPaths: [], // Will be determined by the test
})

/**
 * Helper function to create a simple two-file circular import
 */
export const createSimpleCircularImport = (
  file1: string,
  file2: string,
  export1: string = 'export1',
  export2: string = 'export2',
): TRelation[] => [
  {
    path: file1,
    imports: [{ path: file2, names: [export2] }],
    exports: { used: [export1] },
  },
  {
    path: file2,
    imports: [{ path: file1, names: [export1] }],
    exports: { used: [export2] },
  },
]

/**
 * Helper function to create a linear dependency chain (no cycles)
 */
export const createLinearDependencyChain = (files: string[]): TRelation[] => {
  const relations: TRelation[] = []

  for (let index = 0; index < files.length; index++) {
    const relation: TRelation = {
      path: files[index],
      imports: index > 0 ? [{ path: files[index - 1], names: [`export${index - 1}`] }] : [],
      exports: { used: [`export${index}`] },
    }
    relations.push(relation)
  }

  return relations
}
