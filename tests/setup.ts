import path from 'node:path'
import { vi } from 'vitest'

// Removed global node:fs mock to allow individual tests to set up their own mocks

// Mock file system utilities
vi.mock('../../src/unused-exports/fsUtilities', async (importOriginal) => {
  const actual: typeof importOriginal = await importOriginal()
  return {
    ...actual,
    readJsonFile: vi.fn((path: string) => {
      // Mock JSON file reading for configuration
      if (path.includes('package.json')) {
        return {
          name: 'test-project',
          main: 'index.ts',
        }
      }
      if (path.includes('.findUnusedExports.json')) {
        return {
          include: ['src/**/*.ts'],
          exclude: ['test/**/*'],
        }
      }
      if (path.includes('tsconfig.json')) {
        return {
          compilerOptions: {
            target: 'es2020',
            module: 'commonjs',
          },
        }
      }
      return
    }),
    readFile: vi.fn((path: string) => {
      // Mock file content based on path
      if (path.includes('index.ts')) {
        return `
          import { helper } from './src/main'
          console.log(helper())
        `
      }
      if (path.includes('main.ts')) {
        return `
          export const helper = () => 'helper'
          export const unusedExport = 'unused'
        `
      }
      if (path.includes('helpers.ts')) {
        return `
          export const utilityHelper = () => 'utility'
          export const anotherUnused = 'unused'
        `
      }
      return ''
    }),
    isDirectory: vi.fn((path: string) => {
      // Mock directory detection
      return path.includes('src') && !path.includes('.ts')
    }),
    isFile: vi.fn((path: string) => {
      // Mock file detection
      return path.includes('.ts') || path.includes('.js')
    }),
    getAdjustedPath: vi.fn((pathToPrj: string, globPath: string) => {
      return globPath.replace(pathToPrj, '')
    }),
    pathResolve: vi.fn((...pathSegments: string[]) => {
      // Properly handle path resolution to avoid double paths
      const result = path.resolve(...pathSegments)
      return result.replaceAll('\\', '/')
    }),
    fixPathSeparator: vi.fn((path: string) => path.replaceAll('\\', '/')),
    fixDriverLetterCase: vi.fn((path: string) => path),
    globSync: vi.fn((globRe: string, cwd: string = '.') => {
      // Mock globSync to return absolute paths like the real implementation
      // This prevents the double path issue in sourceFiles.ts
      const basePath = cwd.replaceAll('\\', '/')
      if (cwd.includes('sample-projects') || cwd.includes('test-project')) {
        return [`${basePath}/index.ts`, `${basePath}/src/main.ts`, `${basePath}/src/utils/helpers.ts`]
      }
      if (cwd.includes('/tmp/') || cwd.includes('temp')) {
        // For temporary test directories
        return [`${basePath}/src/included.ts`, `${basePath}/src/main.ts`, `${basePath}/src/utils/helpers.ts`]
      }
      return []
    }),
  }
})

// Mock Node.js path module for tests
vi.mock('node:path', async (importOriginal) => {
  const actual: typeof importOriginal = await importOriginal()
  return {
    ...actual,
    resolve: vi.fn((...pathSegments: string[]) => {
      // Handle test paths properly
      const joined = pathSegments.join('/')
      if (joined.includes('__dirname')) {
        return joined.replace('__dirname', process.cwd())
      }
      return joined
    }),
    basename: vi.fn((path: string, ext?: string) => {
      const parts = path.split('/')
      const filename = parts.at(-1) || ''
      if (ext && filename.endsWith(ext)) {
        return filename.slice(0, -ext.length)
      }
      return filename
    }),
    extname: vi.fn((path: string) => {
      const parts = path.split('.')
      return parts.length > 1 ? '.' + (parts.at(-1) || '') : ''
    }),
  }
})

// Mock VS Code API
const mockVSCode = {
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
      has: vi.fn(),
      inspect: vi.fn(),
      update: vi.fn(),
    })),
    workspaceFolders: [],
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
}

// Mock the vscode module
vi.mock('vscode', () => mockVSCode)

// Global test utilities
globalThis.mockVSCode = mockVSCode

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
  expect.hasAssertions()
})

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks()
})
