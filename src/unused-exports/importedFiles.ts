import path from 'node:path'
import { TContext } from './context'
import { fixDriverLetterCase, globSync, isDirectory, isFile, pathResolve } from './fsUtilities'
import { log } from './log'
import { TTsImport, TTsParsed } from './parsedFiles'

const defaultModuleSuffixes = ['']

export async function getOnlyProjectImports(context: TContext, parsedFiles: TTsParsed[]): Promise<TTsParsed[]> {
  const { allowJs, moduleSuffixes = defaultModuleSuffixes, paths, pathToBaseUrl } = context

  for (const tsParsed of parsedFiles) {
    const { path: filePath, imports } = tsParsed
    const mapFunction = makeImportAbs(pathToBaseUrl, path.dirname(filePath), moduleSuffixes, paths, allowJs)
    tsParsed.imports = imports
      .map((element) => mapFunction(element))
      .filter((element) => importValid(element))
      .filter(Boolean)
  }

  return parsedFiles
}

function importValid(anImport: TTsImport | undefined): anImport is TTsImport {
  return anImport !== undefined
}

const makeImportAbs =
  (pathToBaseUrl: string, filePath: string, moduleSuffixes: string[], paths: TContext['paths'], allowJs?: boolean) =>
  (anImport: TTsImport): TTsImport | undefined => {
    const relativePath = anImport.path

    if (paths) {
      for (const key in paths) {
        const aliasPaths = paths[key]
        const keyPattern = wildcardToPattern(key)
        const pattern = new RegExp(`^${keyPattern}$`)
        if (!pattern.test(relativePath)) {
          continue
        }

        for (const mapPath of aliasPaths) {
          const replacement = mapPath.replaceAll('*', '$1')
          const tryPath = relativePath.replace(pattern, replacement)
          const absPath = pathResolve(pathToBaseUrl, tryPath)
          const exactPath = resolveFilePath(absPath, moduleSuffixes, allowJs)
          if (exactPath) {
            return {
              ...anImport,
              path: exactPath,
            }
          }
        }
      }
    }

    let absPath = pathResolve(filePath, relativePath)
    let exactPath = resolveFilePath(absPath, moduleSuffixes, allowJs)
    if (exactPath) {
      return {
        ...anImport,
        path: exactPath,
      }
    }

    absPath = pathResolve(pathToBaseUrl, relativePath)
    exactPath = resolveFilePath(absPath, moduleSuffixes, allowJs)
    if (exactPath) {
      return {
        ...anImport,
        path: exactPath,
      }
    }

    return undefined
  }

const wildcardRe = /\*/g
function wildcardToPattern(key: string): string {
  return key.replaceAll(wildcardRe, '(.*)')
}

const getGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}.{ts,tsx,js,jsx}` : `${path}.{ts,tsx}`

const getDirirectoryGlobRegexp = (rootPath: string, allowJs?: boolean): string =>
  pathResolve(rootPath, allowJs ? `index.{ts,tsx,js,jsx}` : `index.{ts,tsx}`)

function resolveFilePath(filePath: string, moduleSuffixes: string[], allowJs?: boolean): string | undefined {
  if (isFile(filePath)) {
    return filePath
  }

  try {
    const resourceFile = doGlob('file', getGlobRegexp, filePath, moduleSuffixes, allowJs)
    if (resourceFile) {
      return resourceFile
    }

    if (!isDirectory(filePath)) {
      return
    }

    const resourceDirectory = doGlob('folder', getDirirectoryGlobRegexp, filePath, moduleSuffixes, allowJs)
    if (resourceDirectory) {
      return resourceDirectory
    }
  } catch {
    return
  }

  return undefined
}

function doGlob(
  tryMode: string,
  getGlobRegexp: (path: string, allowJs?: boolean | undefined) => string,
  filePath: string,
  moduleSuffixes: string[],
  allowJs?: boolean,
) {
  const length = moduleSuffixes.length
  for (let index = 0; index < length; index++) {
    const extendedFilePath = filePath + moduleSuffixes[index]
    const resource = doOneGlob(tryMode, getGlobRegexp, extendedFilePath, allowJs)
    if (resource) {
      return resource
    }
  }
  return
}

function doOneGlob(
  tryMode: string,
  getGlobRegexp: (path: string, allowJs?: boolean | undefined) => string,
  filePath: string,
  allowJs?: boolean,
): string | undefined {
  try {
    const globRe = getGlobRegexp(filePath, allowJs)
    const resource = globSync(globRe)?.[0]
    return resource ? fixDriverLetterCase(resource) : undefined
  } catch (error) {
    if (error instanceof Error) {
      log(`Exception glob: cannot resolve path to '${filePath}'. Tried ${tryMode}`, error?.message || error)
    }
    throw error
  }
}
