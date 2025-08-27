import { describe, it, expect, vi } from 'vitest'
import { basicTypeScriptProject } from '../fixtures/testProjects'
import { createMockExtensionContext, setupTestProject } from '../utils/testHelpers'

describe('Test Setup Verification', () => {
  it('should have VS Code mocks available', () => {
    expect(globalThis.mockVSCode).toBeDefined()
    expect(globalThis.mockVSCode.workspace).toBeDefined()
    expect(globalThis.mockVSCode.window).toBeDefined()
    expect(globalThis.mockVSCode.commands).toBeDefined()
  })

  it('should be able to mock VS Code workspace', () => {
    const mockConfig = { 'findUnusedExports.debug': true }
    globalThis.mockVSCode.workspace.getConfiguration.mockReturnValue({
      get: vi.fn((key: string) => mockConfig[key]),
      has: vi.fn((key: string) => key in mockConfig),
      inspect: vi.fn(),
      update: vi.fn(),
    })

    const config = globalThis.mockVSCode.workspace.getConfiguration()
    expect(config.get('findUnusedExports.debug')).toBe(true)
  })

  it('should be able to create mock extension context', () => {
    const context = createMockExtensionContext()

    expect(context.subscriptions).toEqual([])
    expect(context.extensionPath).toBe('/mock/extension/path')
    expect(context.asAbsolutePath).toBeDefined()
    expect(typeof context.asAbsolutePath).toBe('function')
  })

  it('should be able to setup test project', () => {
    const projectSetup = setupTestProject(basicTypeScriptProject)

    expect(projectSetup.workspaceFolder).toBe('/test')
    expect(projectSetup.expectedUnusedExports).toEqual(['unusedFunction', 'unusedVariable', 'unusedDefault'])
    expect(Object.keys(projectSetup.files)).toHaveLength(5)
  })

  it('should have vitest globals available', () => {
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
    expect(vi).toBeDefined()
  })
})
