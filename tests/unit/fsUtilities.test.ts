import fs from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OverviewContext } from '../../src/overviewContext'
import { readJsonFile } from '../../src/unused-exports/fsUtilities'

// Mock node:fs for this test file
vi.mock('node:fs', () => {
  const mockFunctions = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  }
  return {
    default: mockFunctions,
    ...mockFunctions,
  }
})

describe('fsUtilities', () => {
  let mockExistsSync: any
  let mockReadFileSync: any
  let overviewContext: OverviewContext

  beforeEach(() => {
    vi.clearAllMocks()
    mockExistsSync = vi.mocked(fs.existsSync)
    mockReadFileSync = vi.mocked(fs.readFileSync)
    const mockOverviewContext: OverviewContext = {
      errors: [],
      countGlobInclude: {},
      filesHavingImportsOrExports: 0,
      foundCircularImports: 0,
      lastRun: new Date(),
      notUsedExports: 0,
      pathToPrj: '/test',
      processedFiles: 0,
      totalEllapsedTime: 0,
      totalExports: 0,
      totalImports: 0,
      workspaceName: 'test',
    }
    overviewContext = mockOverviewContext
  })

  describe('readJsonFile', () => {
    it('should return undefined if file does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = readJsonFile('/nonexistent/file.json', overviewContext)

      expect(result).toBeUndefined()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('should parse valid JSON without comments', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  "name": "test",
  "version": "1.0.0"
}`)

      const result = readJsonFile('/test/package.json', overviewContext)

      expect(result).toEqual({
        name: 'test',
        version: '1.0.0',
      })
    })

    it('should parse JSON with single-line comments (//) correctly', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  // This is a comment
  "compilerOptions": {
    "target": "ES2022", // Another comment
    "module": "commonjs"
  },
  // Final comment
  "include": ["**/*.ts"]
}`)

      const result = readJsonFile('/test/tsconfig.json', overviewContext)

      expect(result).toEqual({
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
        },
        include: ['**/*.ts'],
      })
    })

    it('should parse JSON with multi-line comments (/* */) correctly', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  /* This is a
     multi-line comment */
  "compilerOptions": {
    "target": "ES2022",
    /* Another multi-line
       comment here */
    "module": "commonjs"
  },
  "include": ["**/*.ts"]
}`)

      const result = readJsonFile('/test/tsconfig.json', overviewContext)

      expect(result).toEqual({
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
        },
        include: ['**/*.ts'],
      })
    })

    it('should parse JSON with mixed comment types', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  // Single line comment
  "compilerOptions": {
    /* Multi-line comment
       spanning multiple lines */
    "target": "ES2022", // End of line comment
    "module": "commonjs"
  },
  /* Another block comment */
  "include": ["**/*.ts"] // Final comment
}`)

      const result = readJsonFile('/test/tsconfig.json', overviewContext)

      expect(result).toEqual({
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
        },
        include: ['**/*.ts'],
      })
    })

    it('should not remove comments inside string values', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  // This comment should be removed
  "description": "This string contains // and /* */ but they should stay",
  "script": "echo 'Hello // World /* test */'"
}`)

      const result = readJsonFile('/test/package.json', overviewContext)

      expect(result).toEqual({
        description: 'This string contains // and /* */ but they should stay',
        script: "echo 'Hello // World /* test */'",
      })
    })

    it('should handle escaped quotes in strings correctly', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  // Comment to remove
  "name": "test-project",
  "description": "String with \\"escaped quotes\\" inside"
}`)

      const result = readJsonFile('/test/config.json', overviewContext)

      expect(result).toEqual({
        name: 'test-project',
        description: 'String with "escaped quotes" inside',
      })
    })

    it('should handle parsing errors gracefully', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('{ invalid json }')

      const result = readJsonFile('/test/invalid.json', overviewContext)

      expect(result).toBeUndefined()
      expect(overviewContext.errors).toHaveLength(1)
      expect(overviewContext.errors?.[0]).toContain('Error parsing "/test/invalid.json"')
    })

    it('should handle file read errors gracefully', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = readJsonFile('/test/protected.json', overviewContext)

      expect(result).toBeUndefined()
      expect(overviewContext.errors).toHaveLength(1)
      expect(overviewContext.errors?.[0]).toContain('Error parsing "/test/protected.json"')
    })

    it('should handle complex tsconfig.json with comments like in real projects', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(`{
  // TypeScript configuration for test mocks
  "compilerOptions": {
    // Target and module settings
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],

    // Output configuration
    "outDir": "./dist",
    "rootDir": ".",

    // Strict type checking
    "strict": true,
    "noImplicitAny": false, // Allow for test flexibility
    "strictNullChecks": true,

    /* Module resolution settings
       for better compatibility */
    "moduleResolution": "node",
    "baseUrl": ".",
    "esModuleInterop": true
  },
  // Include test files
  "include": ["**/*.ts", "**/*.js"],
  // Exclude node_modules and build outputs
  "exclude": ["node_modules", "dist"]
}`)

      const result = readJsonFile('/test/tsconfig.json', overviewContext)

      expect(result).toEqual({
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
          lib: ['ES2022'],
          outDir: './dist',
          rootDir: '.',
          strict: true,
          noImplicitAny: false,
          strictNullChecks: true,
          moduleResolution: 'node',
          baseUrl: '.',
          esModuleInterop: true,
        },
        include: ['**/*.ts', '**/*.js'],
        exclude: ['node_modules', 'dist'],
      })
    })
  })
})
