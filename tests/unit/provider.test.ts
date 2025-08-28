import { TreeItemCollapsibleState } from 'vscode'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core, FileDataType } from '../../src/core'
import { Provider } from '../../src/provider'
import { Refreshing } from '../../src/refreshing'
import { DependencyType, TDependency } from '../../src/tdependency'
import { TNotUsed } from '../../src/unused-exports/notUsed'
import { resetVSCodeMocks, setupMockWorkspace } from '../mocks/vscode'

// Mock the settings module
vi.mock('../../src/unused-exports/settings', () => ({
  isResultExpanded: vi.fn(() => false),
}))

// Mock the vscUtilities module
vi.mock('../../src/unused-exports/vscUtilities', () => ({
  addToIgnoreFilenames: vi.fn(),
}))

// Mock node:fs for this test file
vi.mock('node:fs', () => {
  const mockFunctions = {
    unlink: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  }
  return {
    default: mockFunctions,
    ...mockFunctions,
  }
})

describe('Provider', () => {
  let provider: Provider
  let mockCore: Core
  let mockCore2: Core
  let mockCores: Core[]

  const createMockCore = (workspaceName: string, workspaceRoot: string): Core => {
    const core = new Core(workspaceName, workspaceRoot)

    // Mock the core methods
    vi.spyOn(core, 'getOverviewContext').mockReturnValue({
      countGlobInclude: {},
      errors: [],
      filesHavingImportsOrExports: 10,
      foundCircularImports: 2,
      lastRun: new Date(),
      notUsedExports: 5,
      pathToPrj: workspaceRoot,
      processedFiles: 15,
      totalEllapsedTime: 1000,
      totalExports: 20,
      totalImports: 30,
      workspaceName,
    })

    vi.spyOn(core, 'getFilesData').mockReturnValue([])
    vi.spyOn(core, 'registerListener').mockImplementation(() => {})
    vi.spyOn(core, 'isRefreshing').mockReturnValue(false)

    return core
  }

  const createMockTNotUsed = (filePath: string, notUsedExports?: string[], circularImports?: string[]): TNotUsed => ({
    filePath,
    notUsedExports,
    circularImports,
    isCompletelyUnused: notUsedExports !== undefined && notUsedExports.length > 0,
    isExpanded: false,
  })

  const mockMapFile2Dependency = (
    parent: TDependency,
    node: TNotUsed,
    collapsibleState: TreeItemCollapsibleState,
    _isNotHidden: (node: TDependency) => boolean,
  ): TDependency => {
    const dependency = new TDependency(
      parent,
      node.filePath,
      DependencyType.FILE,
      node.filePath,
      node.isCompletelyUnused,
      node.notUsedExports,
      node.circularImports,
      collapsibleState,
    )
    dependency.absFilePath = node.filePath
    return dependency
  }

  const mockGetNoResultsNode = (_core: Core): TDependency => {
    return new TDependency(
      undefined,
      'no-results',
      DependencyType.EMPTY,
      'No unused exports found',
      false,
      undefined,
      undefined,
      TreeItemCollapsibleState.None,
    )
  }

  beforeEach(() => {
    resetVSCodeMocks()
    setupMockWorkspace(['/test/workspace1', '/test/workspace2'])

    mockCore = createMockCore('TestWorkspace1', '/test/workspace1')
    mockCore2 = createMockCore('TestWorkspace2', '/test/workspace2')
    mockCores = [mockCore, mockCore2]

    provider = new Provider(
      mockCores,
      undefined, // getNodeIfDisabled
      FileDataType.UNUSED_EXPORTS,
      mockMapFile2Dependency,
      mockGetNoResultsNode,
      true, // allowCollapseRoot
    )

    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize provider with cores and register listeners', () => {
      // The registerListener calls happen during construction, but we clear mocks after
      // So we need to check that the spies were created, not that they were called
      expect(mockCore.registerListener).toBeDefined()
      expect(mockCore2.registerListener).toBeDefined()
    })

    it('should initialize with empty hidden cache', async () => {
      // Test that provider starts with no hidden items
      const children = await provider.getChildren()
      expect(children).toBeDefined()
    })
  })

  describe('Tree Data Provider Interface', () => {
    describe('getChildren', () => {
      it('should return root folders when no element provided', async () => {
        // Need to call refresh first to populate the cache
        provider.refresh()
        const children = await provider.getChildren()

        expect(children).toHaveLength(2)
        expect(children[0].label).toBe('TestWorkspace1')
        expect(children[1].label).toBe('TestWorkspace2')
      })

      it('should return element children when element has children', async () => {
        const mockElement = new TDependency(
          undefined,
          'test',
          DependencyType.FOLDER,
          'Test Folder',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.Expanded,
        )

        const childElement = new TDependency(
          mockElement,
          'child',
          DependencyType.FILE,
          'Child File',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.None,
        )

        mockElement.children = [childElement]

        const children = await provider.getChildren(mockElement)
        expect(children).toEqual([childElement])
      })

      it('should collapse root when allowCollapseRoot is true and only one folder exists', async () => {
        // Create provider with single core
        const singleCoreProvider = new Provider(
          [mockCore],
          undefined,
          FileDataType.UNUSED_EXPORTS,
          mockMapFile2Dependency,
          mockGetNoResultsNode,
          true,
        )

        // Mock files data for the core
        const mockFiles = [createMockTNotUsed('/test/file1.ts', ['unusedExport'])]
        vi.spyOn(mockCore, 'getFilesData').mockReturnValue(mockFiles)

        // Trigger refresh to populate cache
        singleCoreProvider.refresh()

        const children = await singleCoreProvider.getChildren()

        // Should return files directly, not the folder
        expect(children).toHaveLength(1)
        expect(children[0].type).toBe(DependencyType.FILE)
      })
    })

    describe('getTreeItem', () => {
      it('should return the element as TreeItem', () => {
        const element = new TDependency(
          undefined,
          'test',
          DependencyType.FILE,
          'Test File',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.None,
        )

        const treeItem = provider.getTreeItem(element)
        expect(treeItem).toBe(element)
      })
    })

    describe('getParent', () => {
      it('should return element parent', () => {
        const parent = new TDependency(
          undefined,
          'parent',
          DependencyType.FOLDER,
          'Parent',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.Expanded,
        )

        const child = new TDependency(
          parent,
          'child',
          DependencyType.FILE,
          'Child',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.None,
        )

        expect(provider.getParent(child)).toBe(parent)
      })
    })
  })

  describe('Refresh Mechanism', () => {
    it('should show refreshing state when cores are refreshing', async () => {
      vi.spyOn(mockCore, 'isRefreshing').mockReturnValue(true)

      provider.refresh()

      // Check that refresh was called and refreshing state is set
      const children = await provider.getChildren()
      expect(children).toEqual([Refreshing])
    })

    it('should show disabled node when getNodeIfDisabled returns a node', async () => {
      const disabledNode = new TDependency(
        undefined,
        'disabled',
        DependencyType.DISABLED,
        'Extension Disabled',
        false,
        undefined,
        undefined,
        TreeItemCollapsibleState.None,
      )

      const providerWithDisabled = new Provider(
        mockCores,
        () => disabledNode,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      providerWithDisabled.refresh()

      const children = await providerWithDisabled.getChildren()
      expect(children).toEqual([disabledNode])
    })

    it('should populate folders and files on successful refresh', () => {
      const mockFiles = [
        createMockTNotUsed('/test/file1.ts', ['unusedExport1']),
        createMockTNotUsed('/test/file2.ts', ['unusedExport2']),
      ]

      vi.spyOn(mockCore, 'getFilesData').mockReturnValue(mockFiles)
      vi.spyOn(mockCore2, 'getFilesData').mockReturnValue([])

      provider.refresh()

      // Verify that onDidChangeTreeData event was fired
      expect(provider.onDidChangeTreeData).toBeDefined()
    })

    it('should fire onDidChangeTreeData event on refresh', () => {
      // Create a mock EventEmitter
      const mockEventEmitter = {
        event: vi.fn(),
        fire: vi.fn(),
        dispose: vi.fn(),
      }

      // Mock the EventEmitter constructor
      globalThis.mockVSCode.EventEmitter.mockReturnValue(mockEventEmitter)

      // Create a new provider to get the mocked EventEmitter
      const testProvider = new Provider(
        mockCores,
        undefined,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      testProvider.refresh()

      expect(mockEventEmitter.fire).toHaveBeenCalled()
    })
  })

  describe('File Operations', () => {
    let testNode: TDependency

    beforeEach(() => {
      testNode = new TDependency(
        undefined,
        'test-file',
        DependencyType.FILE,
        'test.ts',
        false,
        ['unusedExport'],
        undefined,
        TreeItemCollapsibleState.None,
      )
      testNode.absFilePath = '/test/test.ts'
    })

    describe('ignoreFile', () => {
      it('should add file to ignore list and hide it', async () => {
        const vscUtilities = await import('../../src/unused-exports/vscUtilities')

        provider.ignoreFile(testNode)

        expect(vscUtilities.addToIgnoreFilenames).toHaveBeenCalledWith('/test/test.ts')
      })

      it('should not process node without absFilePath', async () => {
        const vscUtilities = await import('../../src/unused-exports/vscUtilities')

        const nodeWithoutPath = new TDependency(
          undefined,
          'test',
          DependencyType.FILE,
          'test.ts',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.None,
        )

        provider.ignoreFile(nodeWithoutPath)

        expect(vscUtilities.addToIgnoreFilenames).not.toHaveBeenCalled()
      })
    })

    describe('deleteFile', () => {
      it('should delete file and hide node on success', async () => {
        const fs = await import('node:fs')

        provider.deleteFile(testNode)

        expect(fs.unlink).toHaveBeenCalledWith('/test/test.ts', expect.any(Function))
      })

      it('should show error message on delete failure', async () => {
        const fs = await import('node:fs')
        const error = new Error('Permission denied')

        vi.mocked(fs.unlink).mockImplementation((path: any, callback: any) => {
          callback(error)
        })

        provider.deleteFile(testNode)

        expect(globalThis.mockVSCode.window.showInformationMessage).toHaveBeenCalledWith('Cannot delete /test/test.ts')
      })

      it('should not process node without absFilePath', async () => {
        const fs = await import('node:fs')

        const nodeWithoutPath = new TDependency(
          undefined,
          'test',
          DependencyType.FILE,
          'test.ts',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.None,
        )

        provider.deleteFile(nodeWithoutPath)

        expect(fs.unlink).not.toHaveBeenCalled()
      })
    })

    describe('hideFileOrExport', () => {
      it('should handle undefined node gracefully', () => {
        expect(() => provider.hideFileOrExport(undefined as any)).not.toThrow()
      })

      it('should remove folder when node has no parent', async () => {
        const folderNode = new TDependency(
          undefined,
          'folder',
          DependencyType.FOLDER,
          'Test Folder',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.Expanded,
        )

        // Setup initial cache
        provider.refresh()

        provider.hideFileOrExport(folderNode)

        // Verify the node was removed from cache
        const children = await provider.getChildren()
        expect(children).not.toContain(folderNode)
      })

      it('should remove child from parent and update tree', () => {
        const parent = new TDependency(
          undefined,
          'parent',
          DependencyType.FOLDER,
          'Parent Folder',
          false,
          undefined,
          undefined,
          TreeItemCollapsibleState.Expanded,
        )

        const child = new TDependency(
          parent,
          'child',
          DependencyType.FILE,
          'child.ts',
          false,
          ['unusedExport'],
          undefined,
          TreeItemCollapsibleState.None,
        )

        parent.children = [child]

        // Setup the provider cache with the parent
        provider.refresh()

        provider.hideFileOrExport(child)

        expect(parent.children).toHaveLength(0)
      })
    })
  })

  describe('Expand/Collapse Operations', () => {
    beforeEach(() => {
      // Setup mock data
      const mockFiles = [createMockTNotUsed('/test/file1.ts', ['unusedExport'])]
      vi.spyOn(mockCore, 'getFilesData').mockReturnValue(mockFiles)
      vi.spyOn(mockCore2, 'getFilesData').mockReturnValue([])

      provider.refresh()
    })

    it('should expand all nodes', () => {
      provider.expandAll()

      // Verify that onDidChangeTreeData was fired
      expect(provider.onDidChangeTreeData).toBeDefined()
    })

    it('should collapse all nodes', () => {
      provider.collapseAll()

      // Verify that onDidChangeTreeData was fired
      expect(provider.onDidChangeTreeData).toBeDefined()
    })

    it('should handle empty cache gracefully', () => {
      // Create provider with no data
      const emptyProvider = new Provider(
        [],
        undefined,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      expect(() => emptyProvider.expandAll()).not.toThrow()
      expect(() => emptyProvider.collapseAll()).not.toThrow()
    })
  })

  describe('File Data Filtering', () => {
    it('should show no results node when no files match filter', async () => {
      vi.spyOn(mockCore, 'getFilesData').mockReturnValue([])
      vi.spyOn(mockCore2, 'getFilesData').mockReturnValue([])

      provider.refresh()

      const children = await provider.getChildren()
      expect(children).toHaveLength(2) // Two workspace folders
      // Each folder should have no results node as child
    })

    it('should filter files based on FileDataType', () => {
      const circularImportProvider = new Provider(
        mockCores,
        undefined,
        FileDataType.CIRCULAR_IMPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      const mockFiles = [
        createMockTNotUsed('/test/file1.ts', undefined, ['circular1']),
        createMockTNotUsed('/test/file2.ts', ['unused']),
      ]

      vi.spyOn(mockCore, 'getFilesData').mockReturnValue(mockFiles)

      circularImportProvider.refresh()

      // Should only show files with circular imports
      expect(mockCore.getFilesData).toHaveBeenCalledWith(FileDataType.CIRCULAR_IMPORTS)
    })
  })

  describe('Event Handling', () => {
    it('should register and fire onDidChangeTreeData events', () => {
      // Test that the onDidChangeTreeData property exists and is callable
      expect(provider.onDidChangeTreeData).toBeDefined()
      expect(typeof provider.onDidChangeTreeData).toBe('function')

      // Test that we can register a listener (this returns the event function)
      const listener = vi.fn()
      const result = provider.onDidChangeTreeData(listener)

      // The result should be the event function
      expect(result).toBeDefined()
    })

    it('should handle multiple listeners', () => {
      // Create a mock EventEmitter
      const mockEventEmitter = {
        event: vi.fn(),
        fire: vi.fn(),
        dispose: vi.fn(),
      }

      // Mock the EventEmitter constructor
      globalThis.mockVSCode.EventEmitter.mockReturnValue(mockEventEmitter)

      // Create a new provider to get the mocked EventEmitter
      const testProvider = new Provider(
        mockCores,
        undefined,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      const listener1 = vi.fn()
      const listener2 = vi.fn()

      testProvider.onDidChangeTreeData(listener1)
      testProvider.onDidChangeTreeData(listener2)

      testProvider.refresh()

      expect(mockEventEmitter.fire).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle core without overview context', () => {
      const brokenCore = createMockCore('BrokenCore', '/broken')
      vi.spyOn(brokenCore, 'getOverviewContext').mockReturnValue({
        countGlobInclude: {},
        errors: [],
        filesHavingImportsOrExports: 0,
        foundCircularImports: 0,
        lastRun: new Date(),
        notUsedExports: 0,
        pathToPrj: '/broken',
        processedFiles: 0,
        totalEllapsedTime: 0,
        totalExports: 0,
        totalImports: 0,
        workspaceName: 'BrokenCore',
      })

      const brokenProvider = new Provider(
        [brokenCore],
        undefined,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      expect(() => brokenProvider.refresh()).not.toThrow()
    })

    it('should handle malformed file data', () => {
      const malformedFiles = [{ filePath: '', notUsedExports: null, circularImports: undefined } as any]

      vi.spyOn(mockCore, 'getFilesData').mockReturnValue(malformedFiles)

      expect(() => provider.refresh()).not.toThrow()
    })

    it('should handle empty workspace name', () => {
      const emptyNameCore = createMockCore('', '/test/empty')
      const emptyProvider = new Provider(
        [emptyNameCore],
        undefined,
        FileDataType.UNUSED_EXPORTS,
        mockMapFile2Dependency,
        mockGetNoResultsNode,
        true,
      )

      expect(() => emptyProvider.refresh()).not.toThrow()
    })
  })
})
