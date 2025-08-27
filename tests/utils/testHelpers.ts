import { vi } from 'vitest'
import { createMockFileSystem, setupMockWorkspace } from '../mocks/vscode'
import type { TestFile, TestProject } from '../fixtures/testProjects'

/**
 * Test utilities for setting up test environments
 */

export const setupTestProject = (project: TestProject) => {
  // Create file system from project files
  const fileMap: Record<string, string> = {}
  for (const file of project.files) {
    fileMap[file.path] = file.content
  }

  // Setup mock file system
  createMockFileSystem(fileMap)

  // Setup workspace
  const workspaceFolder = `/test`
  setupMockWorkspace([workspaceFolder], project.config || {})

  return {
    workspaceFolder,
    files: fileMap,
    expectedUnusedExports: project.expectedUnusedExports,
    expectedCircularImports: project.expectedCircularImports || [],
  }
}

export const createTempFile = (path: string, content: string): TestFile => ({
  path,
  content,
})

export const mockFileExists = (path: string, exists = true) => {
  // Mock file system checks
  vi.mocked(globalThis.mockVSCode.workspace.findFiles).mockImplementation((pattern) => {
    if (pattern.includes(path) && exists) {
      return Promise.resolve([{ fsPath: path, path, scheme: 'file' }])
    }
    return Promise.resolve([])
  })
}

export const mockConfiguration = (config: Record<string, any>) => {
  vi.mocked(globalThis.mockVSCode.workspace.getConfiguration).mockReturnValue({
    get: vi.fn((key: string, defaultValue?: any) => config[key] ?? defaultValue),
    has: vi.fn((key: string) => key in config),
    inspect: vi.fn(),
    update: vi.fn(),
  })
}

export const waitForAsync = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

export const expectArrayToContain = <T>(actual: T[], expected: T[]) => {
  for (const item of expected) {
    expect(actual).toContain(item)
  }
}

export const expectArrayToNotContain = <T>(actual: T[], notExpected: T[]) => {
  for (const item of notExpected) {
    expect(actual).not.toContain(item)
  }
}

/**
 * Helper to create a minimal VS Code extension context for testing
 */
export const createMockExtensionContext = () => ({
  subscriptions: [],
  workspaceState: {
    get: vi.fn(),
    update: vi.fn(),
    keys: vi.fn(() => []),
  },
  globalState: {
    get: vi.fn(),
    update: vi.fn(),
    keys: vi.fn(() => []),
    setKeysForSync: vi.fn(),
  },
  extensionPath: '/mock/extension/path',
  extensionUri: { fsPath: '/mock/extension/path', path: '/mock/extension/path', scheme: 'file' },
  environmentVariableCollection: {
    persistent: true,
    replace: vi.fn(),
    append: vi.fn(),
    prepend: vi.fn(),
    get: vi.fn(),
    forEach: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  },
  asAbsolutePath: vi.fn((relativePath: string) => `/mock/extension/path/${relativePath}`),
  storageUri: undefined,
  storagePath: undefined,
  globalStorageUri: { fsPath: '/mock/global/storage', path: '/mock/global/storage', scheme: 'file' },
  globalStoragePath: '/mock/global/storage',
  logUri: { fsPath: '/mock/log', path: '/mock/log', scheme: 'file' },
  logPath: '/mock/log',
  extensionMode: 1, // Normal mode
  extension: {
    id: 'test.find-unused-exports',
    extensionPath: '/mock/extension/path',
    isActive: true,
    packageJSON: {},
    extensionKind: 1,
    exports: undefined,
    activate: vi.fn(),
    extensionUri: { fsPath: '/mock/extension/path', path: '/mock/extension/path', scheme: 'file' },
  },
})

/**
 * Helper to assert that a function throws with a specific message
 */
export const expectToThrow = async (functionParam: () => Promise<any> | any, expectedMessage?: string) => {
  try {
    await functionParam()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage)
    }
  }
}
