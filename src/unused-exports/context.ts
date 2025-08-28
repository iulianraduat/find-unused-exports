import { existsSync, lstatSync } from 'node:fs'
import path from 'node:path'
import { OverviewContext } from '../overviewContext'
import { pathResolve, readJsonFile } from './fsUtilities'
import { log } from './log'

export interface TContext {
  allowJs?: boolean
  exclude?: string[]
  files?: string[]
  include?: string[]
  main?: string
  moduleSuffixes?: string[]
  overviewContext: OverviewContext
  pathToBaseUrl: string
  pathToPrj: string
  paths?: Record<string, Array<string>>
}

/**
 * We read the tsconfig.json to find which files will be included and if they can be imported relative to baseUrl
 * @param path is the location of the project's root
 */
export async function makeContext(pathToPrj: string, overviewContext: OverviewContext): Promise<TContext> {
  const pathToTsconfig = pathResolve(pathToPrj, 'tsconfig.json')
  const pathToJsconfig = pathResolve(pathToPrj, 'jsconfig.json')
  let tsconfig = readJsonFile(pathToTsconfig, overviewContext)
  if (tsconfig) {
    log('⚙️ Loading ts configuration from', pathToTsconfig)
  } else {
    tsconfig = readJsonFile(pathToJsconfig, overviewContext)
    if (tsconfig) {
      log('⚙️ Loading js configuration from', pathToJsconfig)
      const { compilerOptions = {} } = tsconfig
      tsconfig.compilerOptions = {
        ...(typeof compilerOptions === 'object' && compilerOptions !== null ? compilerOptions : {}),
        /* we want to find all .js and .jsx files for a javascript project */
        allowJs: true,
      }
    }
  }

  // Process tsconfig references recursively to collect all includes/excludes
  const processedTsconfig = await processTsconfigReferences(pathToTsconfig, tsconfig, overviewContext, new Set())

  const { compilerOptions, exclude, files, include } = processedTsconfig || {}
  const jsConfig = { allowJs: true }
  const { allowJs, baseUrl, moduleSuffixes, outDir, paths } = compilerOptions || jsConfig

  /* We are looking for custom include/exclude rules in package.json and .findUnusedExports.json */
  const pathToPackageJson = pathResolve(pathToPrj, 'package.json')
  const packageJson = readJsonFile(pathToPackageJson, overviewContext)
  const main = packageJson?.main
  const includeFindUnusedExports1 = packageJson?.findUnusedExports?.include
  const excludeFindUnusedExports1 = packageJson?.findUnusedExports?.exclude
  if (includeFindUnusedExports1 || excludeFindUnusedExports1) {
    log('⚙️ Loading findUnusedExports configuration from', pathToPackageJson)
  }

  const pathToFindUnusedExportsConfig = pathResolve(pathToPrj, '.findUnusedExports.json')
  const findUnusedExportsConfig = readJsonFile(pathToFindUnusedExportsConfig, overviewContext)
  const includeFindUnusedExports2 = findUnusedExportsConfig?.include
  const excludeFindUnusedExports2 = findUnusedExportsConfig?.exclude
  if (includeFindUnusedExports2 || excludeFindUnusedExports2) {
    log('⚙️ Loading findUnusedExports configuration from', pathToFindUnusedExportsConfig)
  }

  const includeFindUnusedExports = mixArrays(includeFindUnusedExports1, includeFindUnusedExports2)
  const excludeFindUnusedExports = mixArrays(excludeFindUnusedExports1, excludeFindUnusedExports2)

  return {
    allowJs,
    exclude: getExclude(pathToPrj, excludeFindUnusedExports ?? exclude, excludeFindUnusedExports ? undefined : outDir),
    files: includeFindUnusedExports ? undefined : files,
    include: getInclude(pathToPrj, includeFindUnusedExports ?? include),
    main: main ? pathResolve(pathToPrj, main) : undefined,
    moduleSuffixes,
    overviewContext,
    pathToBaseUrl: baseUrl ? pathResolve(pathToPrj, baseUrl) : pathToPrj,
    pathToPrj,
    paths,
  }
}

function mixArrays(a?: unknown, b?: unknown): string[] | undefined {
  if (a === undefined && b === undefined) {
    return undefined
  }

  if (!Array.isArray(a) && !Array.isArray(b)) {
    return undefined
  }

  if (!Array.isArray(a)) {
    return b as string[]
  }

  if (!Array.isArray(b)) {
    return a as string[]
  }

  return [...(a as string[]), ...(b as string[])]
}

function getInclude(pathToPrj: string, include?: string[]): string[] | undefined {
  if (include === undefined) {
    return
  }

  const includeDirectories = include.map((directory) => getGlobDirectory(pathToPrj, directory))
  return includeDirectories
}

function getExclude(pathToPrj: string, exclude?: string[], outDirirectory?: string): string[] | undefined {
  if (exclude) {
    const excludeDirectories = exclude.map((directory) => getGlobDirectory(pathToPrj, directory))

    if (outDirirectory) {
      excludeDirectories.push(`${outDirirectory}/**/*`)
    }

    return excludeDirectories
  }

  const defaultExcludeDirectories = ['node_modules/**/*', 'bower_components/**/*', 'jspm_packages/**/*']
  if (outDirirectory) {
    defaultExcludeDirectories.push(`${outDirirectory}/**/*`)
  }
  return defaultExcludeDirectories
}

function getGlobDirectory(pathToPrj: string, fsPath: string): string {
  const directory = pathResolve(pathToPrj, fsPath)
  return existsSync(directory) && lstatSync(directory).isDirectory() ? `${fsPath}/**/*` : fsPath
}

/**
 * Recursively processes tsconfig references to collect all includes/excludes
 * @param tsconfigPath Path to the current tsconfig file
 * @param tsconfig The parsed tsconfig object
 * @param overviewContext Context for error reporting
 * @param visited Set of visited paths to prevent circular references
 * @returns Combined tsconfig with all referenced includes/excludes
 */
async function processTsconfigReferences(
  tsconfigPath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tsconfig: any,
  overviewContext: OverviewContext,
  visited: Set<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  if (!tsconfig || visited.has(tsconfigPath)) {
    return tsconfig
  }

  visited.add(tsconfigPath)
  const result = { ...tsconfig }
  const references = tsconfig.references

  if (!Array.isArray(references)) {
    return result
  }

  const allIncludes: string[] = [...(tsconfig.include || [])]
  const allExcludes: string[] = [...(tsconfig.exclude || [])]
  const tsconfigDirectory = path.dirname(tsconfigPath)

  for (const reference of references) {
    if (!reference || typeof reference !== 'object') {
      continue
    }

    const referencePath = (reference as { path?: string }).path
    if (!referencePath || typeof referencePath !== 'string') {
      continue
    }

    // Resolve the reference path relative to the current tsconfig directory
    let resolvedReferencePath = path.resolve(tsconfigDirectory, referencePath)

    // If the path doesn't end with .json, try to find tsconfig.json in that directory
    if (!resolvedReferencePath.endsWith('.json')) {
      const tsconfigInDirectory = path.join(resolvedReferencePath, 'tsconfig.json')
      resolvedReferencePath = existsSync(tsconfigInDirectory) ? tsconfigInDirectory : `${resolvedReferencePath}.json`
    }

    if (!existsSync(resolvedReferencePath)) {
      log(`⚠️ Referenced tsconfig not found: ${resolvedReferencePath}`)
      continue
    }

    const referencedTsconfig = readJsonFile(resolvedReferencePath, overviewContext)
    if (!referencedTsconfig) {
      continue
    }

    // Recursively process the referenced tsconfig
    const processedReference = await processTsconfigReferences(
      resolvedReferencePath,
      referencedTsconfig,
      overviewContext,
      visited,
    )

    if (processedReference) {
      const referenceDirectory = path.dirname(resolvedReferencePath)

      // Add includes from referenced tsconfig, making paths relative to the original project
      if (Array.isArray(processedReference.include)) {
        for (const includePath of processedReference.include) {
          const absoluteIncludePath = path.resolve(referenceDirectory, includePath)
          const relativeToOriginal = path.relative(path.dirname(tsconfigPath), absoluteIncludePath)
          allIncludes.push(relativeToOriginal)
        }
      }

      // Add excludes from referenced tsconfig, making paths relative to the original project
      if (Array.isArray(processedReference.exclude)) {
        for (const excludePath of processedReference.exclude) {
          const absoluteExcludePath = path.resolve(referenceDirectory, excludePath)
          const relativeToOriginal = path.relative(path.dirname(tsconfigPath), absoluteExcludePath)
          allExcludes.push(relativeToOriginal)
        }
      }
    }
  }

  // Update the result with combined includes/excludes
  if (allIncludes.length > 0) {
    result.include = allIncludes
  }
  if (allExcludes.length > 0) {
    result.exclude = allExcludes
  }

  return result
}
