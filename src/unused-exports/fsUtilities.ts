import fs from 'node:fs'
import nodePath from 'node:path'
import { glob } from 'glob'
import { OverviewContext } from '../overviewContext'
import { log } from './log'

export const readJsonFile = (
  path: string,
  overviewContext: OverviewContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { [kes: string]: any } | undefined => {
  if (!fs.existsSync(path)) {
    return undefined
  }

  try {
    let content = fs.readFileSync(path, 'utf8')
    /* we remove the comments from it */
    content = content.replaceAll(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\S\s]*?\*\/)/g, (m, g) => (g ? '' : m))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(content) as { [kes: string]: any }
    return parsed
  } catch (error) {
    if (error instanceof Error) {
      log(`Error parsing "${path}"`, error.message ?? error)
      overviewContext.errors?.push(`Error parsing "${path}": ${error.message ?? error}`)
    }
    return undefined
  }
}

export const readFile = (path: string): string => fs.readFileSync(path, 'utf8')

export const isDirectory = (path: string) => {
  try {
    return fs.lstatSync(path).isDirectory()
  } catch {
    return false
  }
}

export const isFile = (path: string) => {
  try {
    return fs.lstatSync(path).isFile()
  } catch {
    return false
  }
}

export function getAdjustedPath(pathToPrj: string, globPath: string) {
  return globPath.replace(pathToPrj, '')
}

export function pathResolve(...pathSegments: string[]) {
  return fixDriverLetterCase(nodePath.resolve(...pathSegments).replaceAll('\\', '/'))
}

export function fixPathSeparator(filePath: string) {
  return filePath.replaceAll('\\', '/')
}

const rePathWithDriverLetter = /^[A-Z]:/
export function fixDriverLetterCase(filePath: string) {
  if (!rePathWithDriverLetter.test(filePath)) {
    return filePath
  }

  const driverLetter = filePath.slice(0, 1).toLowerCase()
  const restPath = filePath.slice(1)
  return driverLetter + restPath
}

export function globSync(globRe: string, cwd: string = '.', globIgnore?: string[]) {
  const ignore = globIgnore?.map((element) => nodePath.posix.normalize(element))
  const result = glob.sync(globRe, {
    cwd,
    ignore,
    nodir: true,
    realpath: true,
    posix: true,
    absolute: true,
  })
  return result?.map((filePath) => filePath.replace('//?/', ''))
}
