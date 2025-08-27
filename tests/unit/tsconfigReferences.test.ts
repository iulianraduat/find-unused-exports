import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OverviewContext } from '../../src/overviewContext'
import { makeContext } from '../../src/unused-exports/context'

// Mock node:fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  lstatSync: vi.fn(),
}))

// Mock fsUtilities
vi.mock('../../src/unused-exports/fsUtilities', () => ({
  pathResolve: vi.fn((base: string, path: string) => `${base}/${path}`),
  readJsonFile: vi.fn(),
}))

describe('tsconfig references processing', () => {
  let mockExistsSync: any
  let mockReadJsonFile: any
  let mockLstatSync: any
  let overviewContext: OverviewContext

  beforeEach(async () => {
    vi.clearAllMocks()
    const fs = await import('node:fs')
    const fsUtilities = await import('../../src/unused-exports/fsUtilities')

    mockExistsSync = vi.mocked(fs.existsSync)
    mockReadJsonFile = vi.mocked(fsUtilities.readJsonFile)
    mockLstatSync = vi.mocked(fs.lstatSync)

    overviewContext = {
      addError: vi.fn(),
      addWarning: vi.fn(),
    } as any

    // Default mocks
    mockLstatSync.mockReturnValue({ isDirectory: () => false })
  })

  it('should process tsconfig references recursively', async () => {
    const projectPath = '/test/project'
    const mainTsconfigPath = '/test/project/tsconfig.json'
    const coreTsconfigPath = '/test/project/packages/core/tsconfig.json'
    const utilsTsconfigPath = '/test/project/packages/utils/tsconfig.json'

    // Mock file existence
    mockExistsSync.mockImplementation((path: string) => {
      return [mainTsconfigPath, coreTsconfigPath, utilsTsconfigPath].includes(path)
    })

    // Mock tsconfig contents
    mockReadJsonFile.mockImplementation((path: string) => {
      if (path === mainTsconfigPath) {
        return {
          compilerOptions: { strict: true },
          include: ['src/**/*'],
          exclude: ['node_modules'],
          references: [{ path: './packages/core' }, { path: './packages/utils/tsconfig.json' }],
        }
      }
      if (path === coreTsconfigPath) {
        return {
          compilerOptions: { target: 'ES2020' },
          include: ['src/**/*', 'lib/**/*'],
          exclude: ['**/*.test.ts'],
        }
      }
      if (path === utilsTsconfigPath) {
        return {
          compilerOptions: { module: 'commonjs' },
          include: ['helpers/**/*', 'types/**/*'],
          exclude: ['**/*.spec.ts', 'dist/**/*'],
        }
      }
      return null
    })

    const result = await makeContext(projectPath, overviewContext)

    expect(result).toBeDefined()
    expect(mockReadJsonFile).toHaveBeenCalledWith(mainTsconfigPath, overviewContext)
    expect(mockReadJsonFile).toHaveBeenCalledWith(coreTsconfigPath, overviewContext)
    expect(mockReadJsonFile).toHaveBeenCalledWith(utilsTsconfigPath, overviewContext)
  })

  it('should handle missing referenced tsconfig files gracefully', async () => {
    const projectPath = '/test/project'
    const mainTsconfigPath = '/test/project/tsconfig.json'

    // Mock file existence - main exists, reference doesn't
    mockExistsSync.mockImplementation((path: string) => {
      return path === mainTsconfigPath
    })

    // Mock main tsconfig with reference to non-existent file
    mockReadJsonFile.mockImplementation((path: string) => {
      if (path === mainTsconfigPath) {
        return {
          compilerOptions: { strict: true },
          include: ['src/**/*'],
          references: [{ path: './packages/nonexistent' }],
        }
      }
      return null
    })

    const result = await makeContext(projectPath, overviewContext)

    expect(result).toBeDefined()
    expect(mockReadJsonFile).toHaveBeenCalledWith(mainTsconfigPath, overviewContext)
    // Should not crash when referenced file doesn't exist
  })

  it('should prevent circular references', async () => {
    const projectPath = '/test/project'
    const mainTsconfigPath = '/test/project/tsconfig.json'
    const aTsconfigPath = '/test/project/packages/a/tsconfig.json'
    const bTsconfigPath = '/test/project/packages/b/tsconfig.json'

    // Mock file existence
    mockExistsSync.mockImplementation((path: string) => {
      return [mainTsconfigPath, aTsconfigPath, bTsconfigPath].includes(path)
    })

    // Mock circular references: main -> a -> b -> a
    mockReadJsonFile.mockImplementation((path: string) => {
      if (path === mainTsconfigPath) {
        return {
          include: ['src/**/*'],
          references: [{ path: './packages/a' }],
        }
      }
      if (path === aTsconfigPath) {
        return {
          include: ['a/**/*'],
          references: [{ path: '../b' }],
        }
      }
      if (path === bTsconfigPath) {
        return {
          include: ['b/**/*'],
          references: [{ path: '../a' }], // Circular reference
        }
      }
      return null
    })

    const result = await makeContext(projectPath, overviewContext)

    expect(result).toBeDefined()
    // Should not get stuck in infinite loop
    expect(mockReadJsonFile).toHaveBeenCalledTimes(6) // main tsconfig + package.json + .findUnusedExports.json for each project
  })
})
