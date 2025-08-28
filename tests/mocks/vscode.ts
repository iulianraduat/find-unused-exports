import { vi } from 'vitest'

/**
 * Extended VS Code mocks for specific testing scenarios
 */

export const createMockWorkspaceFolder = (name: string, uri: string) => ({
  name,
  uri: { fsPath: uri, path: uri, scheme: 'file' },
  index: 0,
})

export const createMockTextDocument = (uri: string, content: string, languageId = 'typescript') => ({
  uri: { fsPath: uri, path: uri, scheme: 'file' },
  fileName: uri,
  isUntitled: false,
  languageId,
  version: 1,
  isDirty: false,
  isClosed: false,
  save: vi.fn(),
  eol: 1,
  lineCount: content.split('\n').length,
  getText: vi.fn(() => content),
  getWordRangeAtPosition: vi.fn(),
  validateRange: vi.fn(),
  validatePosition: vi.fn(),
  offsetAt: vi.fn(),
  positionAt: vi.fn(),
  lineAt: vi.fn(),
})

export const createMockTreeItem = (label: string, collapsibleState = 0) => ({
  label,
  collapsibleState,
  contextValue: undefined,
  command: undefined,
  tooltip: undefined,
  iconPath: undefined,
  resourceUri: undefined,
})

export const createMockDiagnostic = (message: string, range: any, severity = 0) => ({
  message,
  range,
  severity,
  source: 'find-unused-exports',
  code: undefined,
  relatedInformation: [],
})

export const createMockConfiguration = (values: Record<string, any> = {}) => ({
  get: vi.fn((key: string, defaultValue?: any) => values[key] ?? defaultValue),
  has: vi.fn((key: string) => key in values),
  inspect: vi.fn(),
  update: vi.fn(),
})

export const createMockOutputChannel = () => ({
  name: 'Test Output',
  append: vi.fn(),
  appendLine: vi.fn(),
  clear: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  dispose: vi.fn(),
})

export const createMockFileSystemWatcher = () => ({
  onDidCreate: vi.fn(),
  onDidChange: vi.fn(),
  onDidDelete: vi.fn(),
  dispose: vi.fn(),
})

/**
 * Helper to setup workspace with specific folders and configuration
 */
export const setupMockWorkspace = (folders: string[] = [], config: Record<string, any> = {}) => {
  const mockWorkspaceFolders = folders.map((folder, index) => ({
    name: `workspace-${index}`,
    uri: { fsPath: folder, path: folder, scheme: 'file' },
    index,
  }))

  globalThis.mockVSCode.workspace.workspaceFolders = mockWorkspaceFolders
  globalThis.mockVSCode.workspace.getConfiguration.mockReturnValue(createMockConfiguration(config))

  return mockWorkspaceFolders
}

/**
 * Helper to create mock file system structure
 */
export const createMockFileSystem = (files: Record<string, string>) => {
  const mockFiles = new Map(Object.entries(files))

  globalThis.mockVSCode.workspace.findFiles.mockImplementation((pattern: string) => {
    const matchingFiles = [...mockFiles.keys()]
      .filter((path) => path.includes(pattern.replaceAll('**/', '').replaceAll('*', '')))
      .map((path) => ({ fsPath: path, path, scheme: 'file' }))

    return Promise.resolve(matchingFiles)
  })

  globalThis.mockVSCode.workspace.openTextDocument.mockImplementation((uri: any) => {
    const path = typeof uri === 'string' ? uri : uri.fsPath
    const content = mockFiles.get(path) || ''
    return Promise.resolve(createMockTextDocument(path, content))
  })

  return mockFiles
}

/**
 * Helper to reset all VS Code mocks
 */
export const resetVSCodeMocks = () => {
  vi.clearAllMocks()
  globalThis.mockVSCode.workspace.workspaceFolders = []
}
