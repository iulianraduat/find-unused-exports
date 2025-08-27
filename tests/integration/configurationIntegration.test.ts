import fs from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core, FileDataType } from '../../src/core'

vi.mock('node:fs')
// Mock VS Code API
vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
    })),
    workspaceFolders: [],
  },
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path })),
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
}))

// Mock glob
vi.mock('glob', () => ({
  glob: {
    sync: vi.fn(),
  },
}))

describe('Configuration Integration Tests', () => {
  let core: Core
  let mockAccessSync: any
  let mockReadFileSync: any
  let mockExistsSync: any
  let mockLstatSync: any
  let mockGlobSync: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get mock references
    mockAccessSync = vi.mocked(fs.accessSync)
    mockReadFileSync = vi.mocked(fs.readFileSync)
    mockExistsSync = vi.mocked(fs.existsSync)
    mockLstatSync = vi.mocked(fs.lstatSync)
    mockGlobSync = vi.mocked((await import('glob')).glob.sync)

    // Setup default mocks
    mockAccessSync.mockImplementation(() => {}) // package.json exists
    mockExistsSync.mockReturnValue(true)
    mockLstatSync.mockReturnValue({ isFile: () => true, isDirectory: () => false } as any)
  })

  describe('.findUnusedExports.json Configuration', () => {
    it('should respect include patterns in configuration', async () => {
      const testDir = '/test/workspace'

      // Mock file contents
      const fileContents = {
        [`${testDir}/package.json`]: JSON.stringify({ name: 'test-project', main: 'index.ts' }),
        [`${testDir}/.findUnusedExports.json`]: JSON.stringify({
          include: ['src/**/*.ts'],
          exclude: ['test/**/*'],
        }),
        [`${testDir}/src/included.ts`]: `
          export const includedFunction = () => 'included'
          export const unusedIncluded = 'unused'
        `,
        [`${testDir}/index.ts`]: `
          import { includedFunction } from './src/included'
          console.log(includedFunction())
        `,
      }

      // Mock file system
      mockReadFileSync.mockImplementation((path: string) => {
        return fileContents[path] || ''
      })

      // Mock glob to return only included files
      mockGlobSync.mockReturnValue([`${testDir}/src/included.ts`, `${testDir}/index.ts`])

      core = new Core('test-config', testDir)
      await core.refresh()

      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS) || []

      // Should only include files from src directory
      const includedFiles = unusedExports.filter((file) => file.filePath.includes('src/'))
      const excludedFiles = unusedExports.filter((file) => file.filePath.includes('test/'))

      expect(includedFiles.length).toBeGreaterThan(0)
      expect(excludedFiles.length).toBe(0)

      // Should detect unused export in included file
      const includedFileResult = includedFiles.find((file) => file.filePath.includes('included.ts'))
      expect(includedFileResult).toBeDefined()
      expect(includedFileResult?.notUsedExports).toContain('unusedIncluded')
    })

    it('should handle invalid configuration gracefully', async () => {
      const testDir = '/test/workspace'

      // Mock file contents
      const fileContents = {
        [`${testDir}/package.json`]: JSON.stringify({ name: 'test-project', main: 'src.ts' }),
        [`${testDir}/.findUnusedExports.json`]: '{ invalid json content',
        [`${testDir}/src.ts`]: 'export const test = "value"',
      }

      // Mock file system
      mockReadFileSync.mockImplementation((path: string) => {
        return fileContents[path] || ''
      })

      // Mock glob
      mockGlobSync.mockReturnValue([`${testDir}/src.ts`])

      core = new Core('test-invalid-config', testDir)

      // Should not throw error
      await expect(core.refresh()).resolves.not.toThrow()

      // Should still process files with default configuration
      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS) || []
      expect(Array.isArray(unusedExports)).toBe(true)
    })
  })

  describe('TypeScript Configuration Integration', () => {
    it('should handle tsconfig.json with project references', async () => {
      const testDir = '/test/workspace'

      // Mock file contents for monorepo structure
      const fileContents = {
        [`${testDir}/package.json`]: JSON.stringify({ name: 'monorepo-test', workspaces: ['packages/*'] }),
        [`${testDir}/tsconfig.json`]: JSON.stringify({
          files: [],
          references: [{ path: './packages/package1' }, { path: './packages/package2' }],
        }),
        [`${testDir}/packages/package1/index.ts`]: `
          export const package1Function = () => 'package1'
          export const unusedPackage1 = 'unused'
        `,
        [`${testDir}/packages/package1/tsconfig.json`]: JSON.stringify({
          compilerOptions: { target: 'ES2020', module: 'commonjs', strict: true, composite: true, outDir: './dist' },
          include: ['*.ts'],
        }),
        [`${testDir}/packages/package2/index.ts`]: `
          export const package2Function = () => 'package2'
          export const unusedPackage2 = 'unused'
        `,
        [`${testDir}/packages/package2/tsconfig.json`]: JSON.stringify({
          compilerOptions: { target: 'ES2020', module: 'commonjs', strict: true, composite: true, outDir: './dist' },
          include: ['*.ts'],
        }),
      }

      // Mock file system
      mockReadFileSync.mockImplementation((path: string) => {
        return fileContents[path] || ''
      })

      // Mock glob
      mockGlobSync.mockReturnValue([`${testDir}/packages/package1/index.ts`, `${testDir}/packages/package2/index.ts`])

      core = new Core('test-project-references', testDir)

      // Should handle project references without crashing
      await expect(core.refresh()).resolves.not.toThrow()

      const unusedExports = core.getFilesData(FileDataType.UNUSED_EXPORTS) || []
      expect(Array.isArray(unusedExports)).toBe(true)
    })
  })
})
