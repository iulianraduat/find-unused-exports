import { existsSync } from 'node:fs'
import path from 'node:path'
import { vi } from 'vitest'
import { Core, FileDataType } from '../../src/core'
import { UnusedExportsProvider } from '../../src/unusedExports'

/**
 * Common test utilities for integration tests
 */
export class IntegrationTestHelpers {
  static readonly rootDir = path.resolve(__dirname, '../..')

  /**
   * Creates a standardized VS Code mock configuration
   */
  static createVSCodeMock(overrides: Record<string, any> = {}) {
    return {
      workspace: {
        getConfiguration: vi.fn(() => ({
          get: vi.fn((key: string, defaultValue?: any) => {
            if (key === 'findUnusedExports.detectCircularImports') {
              return overrides.detectCircularImports ?? false
            }
            return defaultValue
          }),
          has: vi.fn(),
          inspect: vi.fn(),
          update: vi.fn(),
        })),
        workspaceFolders: overrides.workspaceFolders || [],
        onDidChangeConfiguration: vi.fn(),
        onDidChangeWorkspaceFolders: vi.fn(),
        findFiles: vi.fn(),
        openTextDocument: vi.fn(),
        getWorkspaceFolder: vi.fn(),
        asRelativePath: vi.fn(),
        createFileSystemWatcher: vi.fn(() => ({
          onDidCreate: vi.fn(),
          onDidChange: vi.fn(),
          onDidDelete: vi.fn(),
          dispose: vi.fn(),
        })),
      },
      window: {
        showInformationMessage: vi.fn(),
        showWarningMessage: vi.fn(),
        showErrorMessage: vi.fn(),
        showQuickPick: vi.fn(),
        showInputBox: vi.fn(),
        showTextDocument: vi.fn(),
        createOutputChannel: vi.fn(() => ({
          appendLine: vi.fn(),
          append: vi.fn(),
          clear: vi.fn(),
          show: vi.fn(),
          hide: vi.fn(),
          dispose: vi.fn(),
        })),
        createTreeView: vi.fn(() => ({
          reveal: vi.fn(),
          dispose: vi.fn(),
        })),
        registerTreeDataProvider: vi.fn(),
        activeTextEditor: undefined,
        onDidChangeActiveTextEditor: vi.fn(),
        visibleTextEditors: [],
      },
      commands: {
        registerCommand: vi.fn(),
        executeCommand: vi.fn(),
        getCommands: vi.fn(),
      },
      languages: {
        createDiagnosticCollection: vi.fn(() => ({
          set: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          dispose: vi.fn(),
        })),
        registerCodeActionsProvider: vi.fn(),
        registerHoverProvider: vi.fn(),
      },
      Uri: {
        file: vi.fn((path: string) => ({ fsPath: path, path, scheme: 'file' })),
        parse: vi.fn(),
      },
      Range: vi.fn(),
      Position: vi.fn(),
      Location: vi.fn(),
      Selection: vi.fn(),
      Diagnostic: vi.fn(),
      DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3,
      },
      TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2,
      },
      TreeItem: vi.fn(),
      ThemeIcon: vi.fn((id: string) => ({ id })),
      EventEmitter: vi.fn(() => ({
        event: vi.fn(() => ({ dispose: vi.fn() })),
        fire: vi.fn(),
        dispose: vi.fn(),
      })),
      ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3,
      },
      StatusBarAlignment: {
        Left: 1,
        Right: 2,
      },
      TextDocumentChangeEvent: vi.fn(),
      extensions: {
        getExtension: vi.fn(),
        all: [],
      },
      env: {
        machineId: 'test-machine-id',
        sessionId: 'test-session-id',
        language: 'en',
        clipboard: {
          readText: vi.fn(),
          writeText: vi.fn(),
        },
      },
      ...overrides,
    }
  }

  /**
   * Checks if a project path exists and skips test if not
   */
  static checkProjectExists(projectPath: string): boolean {
    if (!existsSync(projectPath)) {
      console.warn(`Skipping test: ${projectPath} does not exist`)
      return false
    }
    return true
  }

  /**
   * Creates a Core instance for testing
   */
  static async createCore(projectName: string, projectPath: string): Promise<Core> {
    const core = new Core(projectName, projectPath)
    await core.refresh()
    return core
  }

  /**
   * Creates Core and Provider instances for VS Code integration testing
   */
  static async setupCoreAndProvider(projectPath: string): Promise<{ core: Core; provider: UnusedExportsProvider }> {
    const projectName = path.basename(projectPath)
    const core = new Core(projectName, projectPath)
    const provider = new UnusedExportsProvider([core])
    await core.refresh()
    return { core, provider }
  }

  /**
   * Common assertions for unused exports data
   */
  static validateUnusedExportsData(unusedExports: any[]) {
    expect(Array.isArray(unusedExports)).toBe(true)
    for (const file of unusedExports) {
      expect(typeof file.filePath).toBe('string')
      expect(Array.isArray(file.notUsedExports)).toBe(true)
    }
  }

  /**
   * Common assertions for circular imports data
   */
  static validateCircularImportsData(circularImports: any[]) {
    expect(Array.isArray(circularImports)).toBe(true)
    for (const file of circularImports) {
      expect(typeof file.filePath).toBe('string')
      expect(Array.isArray(file.circularImports)).toBe(true)

      if (file.circularImports) {
        for (const circular of file.circularImports) {
          expect(circular).toBeDefined()
          expect(['string', 'object'].includes(typeof circular)).toBe(true)
        }
      }
    }
  }

  /**
   * Common assertions for context data
   */
  static validateContextData(context: any) {
    expect(context).toBeDefined()
    expect(typeof context.processedFiles).toBe('number')
    expect(typeof context.totalExports).toBe('number')
    expect(typeof context.totalImports).toBe('number')
  }

  /**
   * Performance test helper
   */
  static async measurePerformance<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now()
    const result = await operation()
    const endTime = Date.now()
    return { result, duration: endTime - startTime }
  }

  /**
   * Common test project paths
   */
  static getProjectPath(projectName: string): string {
    return path.join(this.rootDir, 'sample-projects', projectName)
  }

  /**
   * Setup workspace folders for VS Code mock
   */
  static createWorkspaceFolder(projectPath: string) {
    return {
      uri: { fsPath: projectPath },
      name: path.basename(projectPath),
      index: 0,
    }
  }

  /**
   * Common test for basic project analysis
   */
  static async testBasicProjectAnalysis(projectPath: string, expectedMinFiles = 1) {
    if (!this.checkProjectExists(projectPath)) return

    const projectName = path.basename(projectPath)
    const core = await this.createCore(projectName, projectPath)

    const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS)
    const circularImports = core.getFilesData(FileDataType.CIRCULAR_IMPORTS)
    const context = core.getOverviewContext()

    this.validateUnusedExportsData(unusedExports)
    this.validateCircularImportsData(circularImports)
    this.validateContextData(context)
    expect(context.processedFiles).toBeGreaterThanOrEqual(expectedMinFiles)

    return { core, unusedExports, circularImports, context }
  }

  /**
   * Common test for circular imports
   */
  static async testCircularImports(projectPath: string, enableCircularImports = true) {
    if (!this.checkProjectExists(projectPath)) return

    // Setup VS Code mock with circular imports enabled
    if (enableCircularImports) {
      globalThis.mockVSCode = this.createVSCodeMock({
        detectCircularImports: true,
        workspaceFolders: [this.createWorkspaceFolder(projectPath)],
      })
    }

    const projectName = path.basename(projectPath)
    const core = await this.createCore(projectName, projectPath)

    const circularImports = core.getFilesData(FileDataType.CIRCULAR_IMPORTS)
    this.validateCircularImportsData(circularImports)

    return { core, circularImports }
  }
}
