import { existsSync, lstatSync, readFileSync } from 'fs'
import { posix, resolve } from 'path'
import { glob } from 'glob'
import { OverviewContext } from '../overviewContext'
import { log } from './log'

export const readJsonFile = (
  path: string,
  overviewContext: OverviewContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { [kes: string]: any } | undefined => {
  if (existsSync(path) === false) {
    return undefined
  }

  try {
    let content = readFileSync(path, 'utf8')
    /* we remove the comments from it */
    content = content.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => (g ? '' : m))
    return JSON.parse(content)
  } catch (e) {
    if (e instanceof Error) {
      log(`Error parsing "${path}"`, e.message ?? e)
      overviewContext.errors?.push(`Error parsing "${path}": ${e.message ?? e}`)
    }
    return undefined
  }
}

export const readFile = (path: string): string => readFileSync(path, 'utf8')

export const isDirectory = (path: string) => {
  try {
    return lstatSync(path).isDirectory()
  } catch {
    return false
  }
}

export const isFile = (path: string) => {
  try {
    return lstatSync(path).isFile()
  } catch {
    return false
  }
}

export function getAdjustedPath(pathToPrj: string, globPath: string) {
  return globPath.replace(pathToPrj, '')
}

export function pathResolve(...pathSegments: string[]) {
  const res = resolve(...pathSegments).replace(/\\/g, '/')
  return fixDriverLetterCase(res)
}

export function fixPathSeparator(filePath: string) {
  return filePath.replace(/\\/g, '/')
}

const rePathWithDriverLetter = /^[A-Z]:/
export function fixDriverLetterCase(filePath: string) {
  if (!rePathWithDriverLetter.test(filePath)) {
    return filePath
  }

  const driverLetter = filePath.substring(0, 1).toLowerCase()
  const restPath = filePath.substring(1)
  return driverLetter + restPath
}

export function globSync(globRe: string, cwd: string = '.', globIgnore?: string[]) {
  const ignore = globIgnore?.map(posix.normalize)
  const res = glob.sync(globRe, {
    cwd,
    ignore,
    nodir: true,
    realpath: true,
    posix: true,
    absolute: true,
  })
  return res?.map((filePath) => filePath.replace('//?/', ''))
}
