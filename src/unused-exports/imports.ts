import { log } from './log'
import { TTsImport, TTsParsed, variableNameRe } from './parsedFiles'

export async function getImports(parsedFiles: TTsParsed[]): Promise<TImport[]> {
  const array: TImport[] = []
  parsedFiles.forEach(parseImport(array))
  return array
}

const parseImport =
  (array: TImport[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, imports } = parsedFile
    imports.forEach(addParsedImports(array, path))
  }

const addParsedImports = (array: TImport[], path: string) => (anImport: TTsImport) => {
  const { name, path: fromPath } = anImport
  const names = getImportedNames(name)
  for (const name of names)
    array.push({
      inPath: path,
      name,
      fromPath,
    })
}

const defaultOrGroupRe = new RegExp(`${variableNameRe}|\\*|,|\\{[^\\}]*\\}`, 'gi')
const variableNameInGroupRe = new RegExp(`${variableNameRe}|,}`, 'gi')

const getImportedNames = (name: string): string[] => {
  defaultOrGroupRe.lastIndex = 0
  const array = []
  let resource1: RegExpExecArray | null
  while ((resource1 = defaultOrGroupRe.exec(name)) !== null) {
    /* Prevent browsers from getting stuck in an infinite loop */
    if (resource1.index === defaultOrGroupRe.lastIndex) {
      defaultOrGroupRe.lastIndex++
      log('Detected RegExp infinite loop (re)', defaultOrGroupRe.source)
      log('Detected RegExp infinite loop (str)', name)
    }

    const foundName1 = resource1[0]
    const ch1 = foundName1[0]
    if (foundName1 === '*') {
      array.push('*')
      continue
    }
    if (ch1 !== '{') {
      array.push('default')
      continue
    }

    variableNameInGroupRe.lastIndex = 0
    const variableNameInGroup = foundName1.slice(0, Math.max(0, foundName1.length - 1))
    let resource2: RegExpExecArray | null
    while ((resource2 = variableNameInGroupRe.exec(variableNameInGroup)) !== null) {
      /* Prevent browsers from getting stuck in an infinite loop */
      if (resource2.index === variableNameInGroupRe.lastIndex) {
        variableNameInGroupRe.lastIndex++
        log('Detected RegExp infinite loop (re)', variableNameInGroupRe.source)
        log('Detected RegExp infinite loop (str)', variableNameInGroup)
      }

      const foundName2 = resource2[0]
      if (foundName2 !== ',') {
        array.push(foundName2)
      }
    }
  }
  return array
}

export interface TImport {
  inPath: string
  name: string
  fromPath: string
}
