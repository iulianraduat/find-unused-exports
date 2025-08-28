import path from 'node:path'
import { OverviewContext, addGlobInclude } from '../overviewContext'
import { TContext } from './context'
import { getAdjustedPath, globSync, pathResolve } from './fsUtilities'
import { log } from './log'

export interface TTsFile {
  path: string
}

const defaultExclude = ['**/node_modules/**/*', '**/*.d.ts']

export async function getSourceFiles(pathToPrj: string, context: TContext): Promise<TTsFile[]> {
  const { allowJs, exclude = [], include, files } = context

  /* A glob must use only forward slashes */
  const globRegexp = getGlobRegexp(allowJs)
  const globExclude = fixPaths(exclude)
  const globExcludeExtended = fixPaths([...defaultExclude, ...exclude])
  const explicitFiles = files ? getRoots(files) : undefined
  const globInclude = getRoots(include, globRegexp)

  context.overviewContext.pathToPrj = pathToPrj

  if (files === undefined && include === undefined) {
    const files: TTsFile[] = []
    context.overviewContext.globInclude = [globRegexp]
    context.overviewContext.globExclude = globExcludeExtended
    context.overviewContext.numDefaultExclude = defaultExclude.length
    globFile(files, pathToPrj, globRegexp, globExcludeExtended, context.overviewContext)
    return files
  }

  /* We want to see the stats before doing the actions */
  const includes = include ? globInclude.map((gi) => applyGlob(gi, globRegexp)) : []
  const includeGlobs: string[] = files && explicitFiles ? [...explicitFiles, ...includes] : includes
  context.overviewContext.globInclude = includeGlobs
  context.overviewContext.globExclude = globExclude
  context.overviewContext.numDefaultExclude = undefined

  const sourceFiles: TTsFile[] = []
  if (explicitFiles !== undefined) {
    globFiles(sourceFiles, pathToPrj, explicitFiles, undefined, context.overviewContext)
  }
  if (include !== undefined) {
    globFiles(sourceFiles, pathToPrj, includes, globExclude, context.overviewContext)
  }
  // TODO remove duplicated files
  // - can influence the performance as there can be a lot of files already added in the array
  // - now each duplicated file will be scanned again for imports and exports
  return sourceFiles
}

const getGlobRegexp = (allowJs?: boolean): string => (allowJs ? '**/*.{ts,js}?(x)' : '**/*.ts?(x)')

function fixPaths(paths: string[]): string[] {
  return paths.map((f) => fixPath(f))
}

const reBackslash = new RegExp('\\\\', 'g')
function fixPath(filePath: string) {
  switch (path.sep) {
    case '/': {
      return filePath
    }
    case '\\': {
      return filePath.replaceAll(reBackslash, '/')
    }
    default: {
      return filePath
    }
  }
}

function getRoots(files?: string[], globRegexp?: string): string[] {
  if (files === undefined) {
    return ['.']
  }

  const pathFiles = files.map((f) => applyGlob(f, globRegexp))
  return pathFiles
}

function applyGlob(filePath: string, globRegexp?: string): string {
  if (globRegexp === undefined) {
    return filePath
  }

  /* we match "/*" at the end of string */
  const reMatchAll = /\/\*$/
  /* we keep "/*" plus the extensions */
  const extension = globRegexp.slice('**'.length)
  const fixedFilePath = filePath.replace(reMatchAll, extension)
  return fixedFilePath
}

function globFiles(
  sourceFiles: TTsFile[],
  pathToPrj: string,
  globRegexp: string[],
  globIgnore: string[] | undefined,
  context: OverviewContext,
) {
  for (const gre of globRegexp) globFile(sourceFiles, pathToPrj, gre, globIgnore, context)
}

function globFile(
  sourceFiles: TTsFile[],
  pathToFolder: string,
  globRegexp: string,
  globIgnore: string[] | undefined,
  context: OverviewContext,
) {
  log('📂 Using glob rule', pathResolve(pathToFolder, globRegexp))
  globIgnore &&
    log(
      '📁 And glob ignore rules',
      globIgnore.map((aGlobIgnore) => pathResolve(pathToFolder, aGlobIgnore)),
    )
  let count = 0
  globSync(globRegexp, pathToFolder, globIgnore).filter((f: string) => {
    // globSync returns absolute paths, so we don't need to resolve them again
    const source = f.startsWith('/') || /^[A-Za-z]:/.test(f) ? f : pathResolve(pathToFolder, f)
    log('└ Found source file', source)
    sourceFiles.push({ path: source })
    count++
  })
  addGlobInclude(context, getAdjustedPath(fixPath(pathToFolder), globRegexp), count)
}
