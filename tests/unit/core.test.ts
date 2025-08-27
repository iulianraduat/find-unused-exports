import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core, FileDataType, someCoreRefreshing } from '../../src/core'
import { TNotUsed } from '../../src/unused-exports/notUsed'

// Mock the app function
vi.mock('../../src/unused-exports/app', () => ({
  app: vi.fn(),
}))

// Mock node:fs for this test file
vi.mock('node:fs', () => {
  const mockFunctions = {
    accessSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  }
  return {
    default: mockFunctions,
    ...mockFunctions,
  }
})

describe('Core', () => {
  let core: Core
  let mockApp: any
  let mockAccessSync: any

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()

    // Get mock references
    mockApp = vi.mocked((await import('../../src/unused-exports/app')).app)
    mockAccessSync = vi.mocked((await import('node:fs')).accessSync)

    // Create core instance
    core = new Core('test-workspace', '/test/workspace')
  })

  describe('constructor', () => {
    it('should initialize with workspace name and root path', () => {
      const context = core.getOverviewContext()
      expect(context.workspaceName).toBe('test-workspace')
      expect(context.pathToPrj).toBe('/test/workspace')
    })

    it('should initialize with default overview context values', () => {
      const context = core.getOverviewContext()
      expect(context.countGlobInclude).toEqual({})
      expect(context.errors).toEqual([])
      expect(context.filesHavingImportsOrExports).toBe(0)
      expect(context.foundCircularImports).toBe(0)
      expect(context.notUsedExports).toBe(0)
      expect(context.processedFiles).toBe(0)
      expect(context.totalEllapsedTime).toBe(0)
      expect(context.totalExports).toBe(0)
      expect(context.totalImports).toBe(0)
    })
  })

  describe('registerListener', () => {
    it('should register a listener function', async () => {
      const listener = vi.fn()
      core.registerListener(listener)

      // Verify listener is registered by triggering refresh
      mockAccessSync.mockImplementation(() => {}) // package.json exists
      mockApp.mockResolvedValue([])

      await core.refresh()

      // Listener should be called twice (before and after refresh)
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple listeners', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      core.registerListener(listener1)
      core.registerListener(listener2)

      mockAccessSync.mockImplementation(() => {})
      mockApp.mockResolvedValue([])

      await core.refresh()

      expect(listener1).toHaveBeenCalledTimes(2)
      expect(listener2).toHaveBeenCalledTimes(2)
    })
  })

  describe('refresh', () => {
    it('should not refresh if already refreshing', async () => {
      mockAccessSync.mockImplementation(() => {})
      mockApp.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      // Start first refresh
      const promise1 = core.refresh()

      // Try to start second refresh while first is running
      const promise2 = core.refresh()

      await Promise.all([promise1, promise2])

      // App should only be called once
      expect(mockApp).toHaveBeenCalledTimes(1)
    })

    it('should clear cache and notify listeners', async () => {
      const listener = vi.fn()
      core.registerListener(listener)

      mockAccessSync.mockImplementation(() => {})
      mockApp.mockResolvedValue([])

      await core.refresh()

      // Listener called before and after refresh
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should handle missing package.json', async () => {
      mockAccessSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      await core.refresh()

      const context = core.getOverviewContext()
      expect(context.info).toBe('No package.json found in workspace')
      expect(mockApp).not.toHaveBeenCalled()
    })

    it('should call app with correct parameters', async () => {
      mockAccessSync.mockImplementation(() => {})
      mockApp.mockResolvedValue([])

      await core.refresh()

      expect(mockApp).toHaveBeenCalledWith('/test/workspace', expect.any(Object))
    })
  })

  describe('isRefreshing', () => {
    it('should return false when not refreshing', () => {
      expect(core.isRefreshing()).toBe(false)
    })

    it('should return true when refreshing', async () => {
      mockAccessSync.mockImplementation(() => {})
      mockApp.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50)))

      const refreshPromise = core.refresh()

      expect(core.isRefreshing()).toBe(true)

      await refreshPromise

      expect(core.isRefreshing()).toBe(false)
    })
  })

  describe('getFilesData', () => {
    const mockNotUsedData: TNotUsed[] = [
      {
        filePath: '/test/file1.ts',
        notUsedExports: ['export1', 'export2'],
        circularImports: [],
        isCompletelyUnused: false,
        isExpanded: false,
      },
      {
        filePath: '/test/file2.ts',
        notUsedExports: [],
        circularImports: ['file3.ts', 'file4.ts'],
        isCompletelyUnused: false,
        isExpanded: false,
      },
      {
        filePath: '/test/file3.ts',
        notUsedExports: ['export3'],
        circularImports: ['file2.ts'],
        isCompletelyUnused: false,
        isExpanded: false,
      },
    ]

    beforeEach(async () => {
      mockAccessSync.mockImplementation(() => {})
      mockApp.mockResolvedValue(mockNotUsedData)
      await core.refresh()
    })

    it('should return files with unused exports', () => {
      const unusedExportsFiles = core.getFilesData(FileDataType.UNUSED_EXPORTS)

      expect(unusedExportsFiles).toHaveLength(2)
      expect(unusedExportsFiles[0].filePath).toBe('/test/file1.ts')
      expect(unusedExportsFiles[1].filePath).toBe('/test/file3.ts')
    })

    it('should return files with circular imports', () => {
      const circularImportsFiles = core.getFilesData(FileDataType.CIRCULAR_IMPORTS)

      expect(circularImportsFiles).toHaveLength(2)
      expect(circularImportsFiles[0].filePath).toBe('/test/file2.ts')
      expect(circularImportsFiles[1].filePath).toBe('/test/file3.ts')
    })

    it('should return empty array when no cache exists', () => {
      const newCore = new Core('test', '/test')

      const unusedExports = newCore.getFilesData(FileDataType.UNUSED_EXPORTS)
      const circularImports = newCore.getFilesData(FileDataType.CIRCULAR_IMPORTS)

      expect(unusedExports).toEqual([])
      expect(circularImports).toEqual([])
    })

    it('should handle undefined arrays in data', () => {
      const dataWithUndefined: TNotUsed[] = [
        {
          filePath: '/test/file1.ts',
          notUsedExports: undefined,
          circularImports: undefined,
          isCompletelyUnused: false,
          isExpanded: false,
        },
      ]

      mockApp.mockResolvedValue(dataWithUndefined)
      const newCore = new Core('test', '/test')

      return newCore.refresh().then(() => {
        const unusedExports = newCore.getFilesData(FileDataType.UNUSED_EXPORTS)
        const circularImports = newCore.getFilesData(FileDataType.CIRCULAR_IMPORTS)

        expect(unusedExports).toEqual([])
        expect(circularImports).toEqual([])
      })
    })
  })

  describe('static methods', () => {
    describe('open', () => {
      it('should open text document and show it', async () => {
        const mockDocument = { uri: { fsPath: '/test/file.ts' } }
        const mockOpenTextDocument = globalThis.mockVSCode.workspace.openTextDocument
        const mockShowTextDocument = globalThis.mockVSCode.window.showTextDocument

        mockOpenTextDocument.mockResolvedValue(mockDocument as any)
        mockShowTextDocument.mockResolvedValue({} as any)

        Core.open('/test/file.ts')

        await new Promise((resolve) => setTimeout(resolve, 0)) // Wait for promise resolution

        expect(mockOpenTextDocument).toHaveBeenCalledWith('/test/file.ts')
        expect(mockShowTextDocument).toHaveBeenCalledWith(mockDocument)
      })
    })

    describe('findInFile', () => {
      it('should find text in file and set selection', async () => {
        const mockDocument = {
          lineCount: 3,
          lineAt: vi
            .fn()
            .mockReturnValueOnce({ text: 'some code here' })
            .mockReturnValueOnce({ text: 'export const testExport = "value"' })
            .mockReturnValueOnce({ text: 'more code' }),
        }

        const mockEditor = {
          document: mockDocument,
          selection: null,
        }

        const mockOpenTextDocument = globalThis.mockVSCode.workspace.openTextDocument
        const mockShowTextDocument = globalThis.mockVSCode.window.showTextDocument
        const mockExecuteCommand = globalThis.mockVSCode.commands.executeCommand

        mockOpenTextDocument.mockResolvedValue(mockDocument as any)
        mockShowTextDocument.mockResolvedValue(mockEditor as any)

        // Mock activeTextEditor
        Object.defineProperty(globalThis.mockVSCode.window, 'activeTextEditor', {
          value: mockEditor,
          writable: true,
        })

        Core.findInFile('/test/file.ts', 'testExport')

        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(mockOpenTextDocument).toHaveBeenCalledWith('/test/file.ts')
        expect(mockExecuteCommand).toHaveBeenCalledWith('actions.find')
      })
    })
  })
})

describe('someCoreRefreshing', () => {
  it('should return true if any core is refreshing', () => {
    const core1 = new Core('test1', '/test1')
    const core2 = new Core('test2', '/test2')

    // Mock one core as refreshing
    vi.spyOn(core1, 'isRefreshing').mockReturnValue(true)
    vi.spyOn(core2, 'isRefreshing').mockReturnValue(false)

    expect(someCoreRefreshing([core1, core2])).toBe(true)
  })

  it('should return false if no cores are refreshing', () => {
    const core1 = new Core('test1', '/test1')
    const core2 = new Core('test2', '/test2')

    vi.spyOn(core1, 'isRefreshing').mockReturnValue(false)
    vi.spyOn(core2, 'isRefreshing').mockReturnValue(false)

    expect(someCoreRefreshing([core1, core2])).toBe(false)
  })

  it('should return false for empty array', () => {
    expect(someCoreRefreshing([])).toBe(false)
  })
})
