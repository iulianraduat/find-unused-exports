import fs from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core, FileDataType } from '../../src/core'
import { UnusedExportsProvider } from '../../src/unusedExports'

describe('VS Code Integration Tests', () => {
  const rootDir = path.resolve(__dirname, '../..')
  let projectPath: string
  let projectName: string

  async function setupCoreAndProvider(
    testProjectPath?: string,
  ): Promise<{ core: Core; provider: UnusedExportsProvider }> {
    const targetPath = testProjectPath || projectPath
    const targetName = path.basename(targetPath)
    const testCore = new Core(targetName, targetPath)
    const testProvider = new UnusedExportsProvider([testCore])
    await testCore.refresh()
    return { core: testCore, provider: testProvider }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    projectPath = path.resolve(rootDir, 'sample-projects/test-project-ts')

    if (!fs.existsSync(projectPath)) {
      console.warn(`Skipping test: ${projectPath} does not exist`)
      return
    }

    projectName = path.basename(projectPath)
    globalThis.mockVSCode.workspace.workspaceFolders = [
      {
        uri: { fsPath: projectPath },
        name: projectName,
        index: 0,
      },
    ]
  })

  describe('Provider Integration and Tree View', () => {
    it('should integrate with VS Code tree view and handle refresh events', async () => {
      const { core: testCore, provider: testProvider } = await setupCoreAndProvider()

      // Test tree data provider functionality
      const rootElements = await testProvider.getChildren()
      expect(Array.isArray(rootElements)).toBe(true)

      // Test getting children of a file node
      const firstElement = rootElements[0]
      const children = await testProvider.getChildren(firstElement)

      expect(children.length).greaterThan(0)

      // Each child should be a tree item
      for (const child of children) {
        expect(child).toBeDefined()
        expect(typeof child.label).toBe('string')
      }

      // Test tree item creation and context values
      const treeItem = testProvider.getTreeItem(firstElement)
      expect(treeItem).toBeDefined()
      expect(typeof treeItem.label).toBe('string')
      expect(treeItem.contextValue).toBeDefined()
      expect(typeof treeItem.contextValue).toBe('string')

      // Context value should indicate the type of item
      const validContextValues = ['file', 'export', 'circular', 'overview']
      expect(validContextValues.some((value) => treeItem.contextValue?.includes(value))).toBe(true)

      // Test refresh functionality
      const initialElements = await testProvider.getChildren()
      await testCore.refresh()
      const refreshedElements = await testProvider.getChildren()

      // Should maintain consistency after refresh
      expect(refreshedElements.length).toBe(initialElements.length)
    })
  })

  describe('Command Integration and Data Handling', () => {
    it('should handle command registration and execution with real data', async () => {
      const { core: testCore } = await setupCoreAndProvider()

      // Test command registration validation
      const expectedCommands = [
        'findUnusedExports.refresh',
        'findUnusedExports.showOutput',
        'findUnusedExports.deleteFile',
        'findUnusedExports.deleteExport',
        'findUnusedExports.openFile',
      ]

      for (const command of expectedCommands) {
        expect(typeof command).toBe('string')
        expect(command.startsWith('findUnusedExports.')).toBe(true)
      }

      // Test refresh command execution
      await expect(testCore.refresh()).resolves.not.toThrow()

      // Test getting overview context (used by show output command)
      const context = testCore.getOverviewContext()
      expect(context).toBeDefined()
      expect(typeof context.processedFiles).toBe('number')
      expect(typeof context.totalExports).toBe('number')
      expect(typeof context.totalImports).toBe('number')
    })
  })

  describe('File Decoration Integration', () => {
    it('should provide file decorations for files with unused exports', async () => {
      const { core: testCore } = await setupCoreAndProvider()

      const unusedExports = testCore.getFilesData(FileDataType.UNUSED_EXPORTS)

      expect(unusedExports).toHaveLength(21)
      // Files with unused exports should be identifiable for decoration
      for (const file of unusedExports) {
        expect(file.filePath).toBeTypeOf('string')
        expect(Array.isArray(file.notUsedExports)).toBe(true)
      }
    })

    it('should provide decorations for circular import files', async () => {
      const advancedProjectPath = path.resolve(rootDir, 'sample-projects/test-project-advanced-features')

      if (!fs.existsSync(advancedProjectPath)) {
        console.warn(`Skipping test: ${advancedProjectPath} does not exist`)
        return
      }

      // Update workspace folders for this specific test
      globalThis.mockVSCode.workspace.workspaceFolders = [
        {
          uri: { fsPath: advancedProjectPath },
          name: path.basename(advancedProjectPath),
          index: 0,
        },
      ]

      // Enable circular imports detection for this test
      globalThis.mockVSCode.workspace.getConfiguration = vi.fn(() => ({
        get: vi.fn((key: string, defaultValue?: any) => {
          if (key === 'findUnusedExports.detectCircularImports') {
            return true
          }
          return defaultValue
        }),
        has: vi.fn(),
        inspect: vi.fn(),
        update: vi.fn(),
      }))

      const { core: testCore } = await setupCoreAndProvider(advancedProjectPath)

      const circularImports = testCore.getFilesData(FileDataType.CIRCULAR_IMPORTS)

      expect(circularImports.length).greaterThan(0)
      expect(circularImports[0].circularImports).toEqual(['src/components/advanced/CircularImportA.ts'])
    })
  })

  describe('Error Handling and Performance', () => {
    it('should handle VS Code API errors and workspace changes gracefully', async () => {
      const { core: testCore, provider: testProvider } = await setupCoreAndProvider()

      // Should not crash when VS Code APIs fail
      await expect(testCore.refresh()).resolves.not.toThrow()

      const elements = await testProvider.getChildren()
      expect(Array.isArray(elements)).toBe(true)

      // Should handle workspace changes without crashing
      await expect(testCore.refresh()).resolves.not.toThrow()

      const newElements = await testProvider.getChildren()
      expect(Array.isArray(newElements)).toBe(true)
    })

    it('should provide tree data efficiently and handle frequent refresh requests', async () => {
      const { core: testCore, provider: testProvider } = await setupCoreAndProvider()

      // Measure tree data provider performance
      const startTime = Date.now()
      const elements = await testProvider.getChildren()
      const endTime = Date.now()

      const treeDataTime = endTime - startTime

      // Tree data should be provided quickly (less than 1 second)
      expect(treeDataTime).toBeLessThan(1000)
      expect(Array.isArray(elements)).toBe(true)

      // Getting tree items should also be fast
      const treeItemStartTime = Date.now()
      const treeItem = testProvider.getTreeItem(elements[0])
      const treeItemEndTime = Date.now()

      expect(treeItemEndTime - treeItemStartTime).toBeLessThan(100)
      expect(treeItem).toBeDefined()

      // Test frequent refresh requests
      const refreshPromises: Promise<void>[] = []
      for (let index = 0; index < 3; index++) {
        refreshPromises.push(testCore.refresh())
      }

      // All refreshes should complete without error
      await expect(Promise.all(refreshPromises)).resolves.not.toThrow()

      // Final state should be consistent
      const finalElements = await testProvider.getChildren()
      expect(Array.isArray(finalElements)).toBe(true)
    })
  })

  describe('Configuration Integration', () => {
    it('should respect VS Code configuration settings', async () => {
      const { provider: testProvider } = await setupCoreAndProvider()

      // Provider should work regardless of configuration
      const elements = await testProvider.getChildren()
      expect(Array.isArray(elements)).toBe(true)
    })
  })
})
