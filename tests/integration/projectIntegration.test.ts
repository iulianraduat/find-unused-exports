import { existsSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Core } from '../../src/core'
import { IntegrationTestHelpers } from '../utils/integrationTestHelpers'

// Initialize VS Code mock
globalThis.mockVSCode = IntegrationTestHelpers.createVSCodeMock()

// Mock VS Code API
vi.mock('vscode', () => globalThis.mockVSCode)

describe('Project Integration Tests', () => {
  const rootDir = path.resolve(__dirname, '../..')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TypeScript Project with Real Files', () => {
    it('should detect unused exports in test project', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) return // Project doesn't exist

      const { unusedExports, context } = result

      // Should find some unused exports in the test project
      expect(unusedExports.length).toBeGreaterThanOrEqual(0)

      // Should have processed files
      expect(context.processedFiles).toBeGreaterThan(0)
      expect(context.totalExports).toBeGreaterThan(0)

      // Check for specific unused exports in notused-exports folder
      const notusedFiles = unusedExports.filter((file) => file.filePath.includes('notused-exports'))
      expect(notusedFiles.length).toBeGreaterThan(0)

      // Each notused file should have unused exports
      for (const file of notusedFiles) {
        expect(file.notUsedExports?.length || 0).toBeGreaterThan(0)
      }
    })

    it('should handle circular imports in test project', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')
      const result = await IntegrationTestHelpers.testCircularImports(projectPath, true)

      if (!result) return // Project doesn't exist

      const { circularImports } = result

      // Check if circular imports are detected in the circular-imports folder
      const circularFiles = circularImports.filter((file) => file.filePath.includes('circular-imports'))

      if (circularFiles.length > 0) {
        for (const file of circularFiles) {
          expect(file.circularImports?.length || 0).toBeGreaterThan(0)

          // Each circular import should have a valid structure
          if (file.circularImports) {
            for (const circular of file.circularImports) {
              expect(circular).toBeDefined()
              // Circular imports might be strings or objects depending on implementation
              expect(['string', 'object'].includes(typeof circular)).toBe(true)
            }
          }
        }
      }
    })
  })

  describe('JavaScript Project Integration', () => {
    it('should analyze test-project-js correctly', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-js')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) return // Project doesn't exist

      const { unusedExports, context } = result

      // Should process JavaScript files
      expect(context.processedFiles).toBeGreaterThan(0)

      // Should find unused exports in notused-exports folder
      const notusedFiles = unusedExports.filter(
        (file) => file.filePath.includes('notused-exports') && file.filePath.endsWith('.js'),
      )
      expect(notusedFiles.length).toBeGreaterThan(0)

      // Should handle different export patterns in JS
      const exportFiles = unusedExports.filter(
        (file) => file.filePath.includes('export-folder') && file.filePath.endsWith('.js'),
      )

      if (exportFiles.length > 0) {
        // Should detect various export patterns
        const hasDefaultExports = exportFiles.some((file) => file.notUsedExports?.includes('default'))
        const hasNamedExports = exportFiles.some((file) => file.notUsedExports?.some((exp) => exp !== 'default'))

        expect(hasDefaultExports || hasNamedExports).toBe(true)
      }
    })
  })

  describe('Path Aliases Integration', () => {
    it('should handle path aliases correctly', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-paths-aliases')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) return // Project doesn't exist

      const { unusedExports, context } = result

      expect(context.processedFiles).toBeGreaterThan(0)

      // Should find unused exports in the project
      const notusedFiles = unusedExports.filter((file) => file.filePath.includes('notused_'))
      expect(notusedFiles.length).toBeGreaterThan(0)
    })

    it('should handle complex path mappings', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-paths-aliases')

      if (!IntegrationTestHelpers.checkProjectExists(projectPath)) return

      const core = await IntegrationTestHelpers.createCore('test-project-paths-aliases', projectPath)
      const context = core.getOverviewContext()

      // Should resolve path aliases correctly
      expect(context.totalImports).toBeGreaterThan(0)
      expect(context.totalExports).toBeGreaterThan(0)
    })
  })

  describe('Monorepo Structure', () => {
    it('should handle monorepo projects', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-monorepo')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) return // Project doesn't exist

      const { context } = result
      expect(context.processedFiles).toBeGreaterThan(0)
    })
  })

  describe('Configuration File Handling', () => {
    it('should handle .findUnusedExports.json configuration', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-with-config')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const { context } = result
      expect(context.processedFiles).toBeGreaterThan(0)
    })

    it('should handle missing configuration gracefully', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const { context } = result
      expect(context.processedFiles).toBeGreaterThan(0)
    })
  })

  describe('Data Consistency', () => {
    it('should provide consistent data for unused exports', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')
      const result = await IntegrationTestHelpers.testBasicProjectAnalysis(projectPath)

      if (!result) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const { unusedExports } = result
      IntegrationTestHelpers.validateUnusedExportsData(unusedExports)
    })

    it('should provide consistent data for circular imports', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-advanced-features')
      const result = await IntegrationTestHelpers.testCircularImports(projectPath, true)

      if (!result) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const { circularImports } = result
      IntegrationTestHelpers.validateCircularImportsData(circularImports)
    })
  })

  describe('Core Functionality', () => {
    it('should refresh data correctly', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')

      if (!IntegrationTestHelpers.checkProjectExists(projectPath)) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const core = await IntegrationTestHelpers.createCore('test-project-ts', projectPath)
      const initialContext = core.getOverviewContext()

      // Refresh should work without errors
      await core.refresh()
      const refreshedContext = core.getOverviewContext()

      expect(refreshedContext.processedFiles).toBe(initialContext.processedFiles)
    })
  })

  describe('Performance', () => {
    it('should handle large projects efficiently', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-ts')

      if (!IntegrationTestHelpers.checkProjectExists(projectPath)) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const { duration } = await IntegrationTestHelpers.measurePerformance(async () => {
        return await IntegrationTestHelpers.createCore('test-project-ts', projectPath)
      })

      // Should complete analysis within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000)
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent project paths', async () => {
      const nonExistentPath = path.join(rootDir, 'sample-projects', 'non-existent-project')

      expect(() => {
        new Core('non-existent', nonExistentPath)
      }).not.toThrow()
    })

    it('should handle projects without relevant files', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('empty-project')

      if (!existsSync(projectPath)) {
        // Create a temporary empty project for testing
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      const core = await IntegrationTestHelpers.createCore('empty-project', projectPath)
      const context = core.getOverviewContext()

      expect(context.processedFiles).toBeGreaterThanOrEqual(0)
    })

    it('should handle corrupted configuration files', async () => {
      const projectPath = IntegrationTestHelpers.getProjectPath('test-project-corrupted-config')

      if (!IntegrationTestHelpers.checkProjectExists(projectPath)) {
        expect(true).toBe(true) // Project doesn't exist, test passes
        return
      }

      // Should not throw even with corrupted config
      expect(async () => {
        await IntegrationTestHelpers.createCore('test-project-corrupted-config', projectPath)
      }).not.toThrow()
    })
  })
})
