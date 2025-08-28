import { workspace } from 'vscode'
import { readFile } from './fsUtilities'
import { log } from './log'
import { TTsFile } from './sourceFiles'

export interface TTsParsed extends TTsFile {
  exports: TTsExport[]
  imports: TTsImport[]
}

export interface TTsExport {
  name: 'default' | string
  path?: string
}

export interface TTsImport {
  name: string
  path: string
}

export async function getParsedFiles(files: TTsFile[]): Promise<TTsParsed[]> {
  return files.map((element) => parseFile(element))
}

function parseFile(file: TTsFile): TTsParsed {
  let ts = log('📑 Parse file', file.path)
  const content = readFile(file.path)
  /* we want to ignore any import/export present in a comment */
  const fixedContent = fixContent(content)
  ts = log('└ Normalizing the content took', undefined, ts)
  const imports = getImports(fixedContent)
  ts = log('└ Found imports', imports.length, ts)
  const exports = getExports(fixedContent)
  log('└ Found exports', exports.length, ts)
  return {
    ...file,
    exports,
    imports,
  }
}

const fileNameRe = `("[^"\\s]+"|'[^'\\s]+'|\`[^\`\\s]+\`)`
/* we need to remove the above start and end quotes */
const fixPath = (path: string) => (path.length >= 3 ? path.slice(1, -1) : '')

const validIECharsRe = `(?:\\b[*_$a-zA-Z0-9{,}\\s\r\n]+?)`
const importExportFromRegex = [
  new RegExp(`\\bimport\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`, 'g'),
  new RegExp(`\\bimport\\s+type\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`, 'g'),
  new RegExp(`\\bexport\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`, 'g'),
]

export const variableNameRe = `[_$a-zA-Z0-9]+`
const asVariableNameRe = new RegExp(`\\s+as\\s+${variableNameRe}`, 'g')
const listNamesRe = `\\{(?:${variableNameRe}|,|\\s+)+\\}`
const allValidNamesRe = `(?:\\*|${variableNameRe}|${listNamesRe}|,)+`
const exactAllValidNamesRe = new RegExp(`^${allValidNamesRe}$`)

const spacesRe = new RegExp(`\\s+|\r|\n`, 'g')
const typeSpacesRe = new RegExp(`\\btype(?:\\s+|\r|\n)`, 'g')
const removeSpaces = (txt: string) => txt.replaceAll(spacesRe, '')
const removeTypeSpaces = (txt: string) => removeSpaces(txt.replaceAll(typeSpacesRe, ''))

const importRequireRegexps = [
  new RegExp(`\\b(?:import|require)\\s*${fileNameRe}`, 'g'),
  new RegExp(`\\b(?:import|require)\\s*\\(\\s*${fileNameRe}\\s*\\)`, 'g'),
]

function getImports(content: string): TTsImport[] {
  const result: TTsImport[] = []

  /* find all `import|export ... from "module-name"` ; remove `as ...` */
  const matches1 = getMatches(importExportFromRegex, content, asVariableNameRe)
  if (matches1)
    for (const match of matches1) {
      const [importedNames, fromPath] = match
      const importedNamesWithoutSpaces = removeTypeSpaces(importedNames)
      if (exactAllValidNamesRe.test(importedNamesWithoutSpaces)) {
        result.push({
          name: importedNamesWithoutSpaces,
          path: fixPath(fromPath),
        })
      }
    }

  /* find all `import|require("module-name")` */
  const matches2 = getMatches(importRequireRegexps, content)
  if (matches2)
    for (const match of matches2) {
      const [fromPath] = match
      result.push({
        name: '*',
        path: fixPath(fromPath),
      })
    }

  return result
}

const individualExportRegexps = [
  new RegExp(`\\bexport\\s+(default)\\s`, 'g'),
  new RegExp(`\\bexport\\s+(?:class|const|let|var|enum|type|interface|function\\*?)\\s+(${variableNameRe})`, 'g'),
]

const destructuredExportsRegexps = [new RegExp(`\\bexport\\s+(?:const|let|var)\\s+\\{\\s*([^}]+)\\s*\\}`, 'g')]
const variableNameColonRe = new RegExp(`${variableNameRe}\\s*:\\s*`, 'gi')

const exportListRegexps = [
  new RegExp(`\\bexport\\s*(\\{\\s*[^}]+\\s*\\})`, 'g'),
  new RegExp(`\\bexport\\s+type\\s*(\\{\\s*[^}]+\\s*\\})`, 'g'),
]
const variableNameAsRe = new RegExp(`${variableNameRe}\\s+as\\s+`, 'gi')
const typePrefixingTypeRe = new RegExp(`\\btype\\s+`, 'gi')

const aggregatedExportsRegexps = [
  new RegExp(`\\bexport\\s*(\\*)\\s*from\\s*${fileNameRe}`, 'g'),
  new RegExp(`\\bexport\\s*(\\*(?:\\s*as\\s+${variableNameRe}\\s+))\\s*from\\s*${fileNameRe}`, 'g'),
]
const starAsRe = new RegExp(`\\*\\s*as\\s+`, 'gi')

function getExports(content: string): TTsExport[] {
  const result: TTsExport[] = []

  /* find all `export default|class|const|let|var|enum|type|interface|function|function*` */
  const matches1 = getMatches(individualExportRegexps, content)
  if (matches1)
    for (const match of matches1) {
      const [exportedName] = match
      result.push({
        name: exportedName,
        path: undefined,
      })
    }

  /* find all `export const|let|var {name1, name2: bar}` */
  const matches2 = getMatches(destructuredExportsRegexps, content)
  if (matches2)
    for (const match of matches2) {
      const [exportedNames] = match
      const exportedNamesWithoutColon = removeSpaces(exportedNames.replaceAll(variableNameColonRe, ''))
      result.push({
        name: exportedNamesWithoutColon,
        path: undefined,
      })
    }

  /* find all `export {variable1 as name1, variable2 as default, variable3} from "module-name"` */
  const matches3 = getMatches(exportListRegexps, content)
  if (matches3)
    for (const match of matches3) {
      const [exportedNames] = match
      const names = removeSpaces(exportedNames.replaceAll(variableNameAsRe, '').replaceAll(typePrefixingTypeRe, ''))
      result.push({
        name: names,
        path: undefined,
      })
    }

  /* find all `export * as name from "module-name"` */
  const matches4 = getMatches(aggregatedExportsRegexps, content)
  if (matches4)
    for (const match of matches4) {
      const [exportedName, fromPath] = match
      const exportedNameWithoutAs = removeSpaces(exportedName.replaceAll(starAsRe, ''))
      result.push({
        name: exportedNameWithoutAs,
        path: exportedNameWithoutAs === '*' ? fromPath : undefined,
      })
    }

  return result
}

function getMatches(regexps: RegExp[], content: string, fixRe?: RegExp): string[][] | undefined {
  const array: string[][] = []
  for (const regexp of regexps) {
    regexp.lastIndex = 0
    let result: RegExpExecArray | null
    while ((result = regexp.exec(content)) !== null) {
      /* Prevent browsers from getting stuck in an infinite loop */
      if (result.index === regexp.lastIndex) {
        regexp.lastIndex++
        log('Detected RegExp infinite loop', regexp.source)
      }

      result.shift()
      const match = result.map((r) => {
        if (r && fixRe) {
          r = r.replace(fixRe, '')
        }

        return r
      })
      array.push(match)
    }
  }
  return array.length === 0 ? undefined : array
}

function isShowIgnoredExportsEnabled(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.showIgnoredExports', false)
}

const reCommentExport = /\/\/\s*find-unused-exports:ignore-next-line-exports\b.*\r?\nexport\b.*/gm
const reCommentMultiLine = /\/\*.*?\*\//gs
const reCommentSingleLine = /\/\/.*/g
const reStringBacktick = /`[^`]+`/g
function fixContent(content: string): string {
  let newContent = content
  if (!isShowIgnoredExportsEnabled()) {
    newContent = newContent.replaceAll(reCommentExport, '')
  }

  return newContent
    .replaceAll(reCommentMultiLine, '')
    .replaceAll(reCommentSingleLine, '')
    .replaceAll(reStringBacktick, '')
}
