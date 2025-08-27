import { TExport } from './exports'
import { TImport } from './imports'
import { log } from './log'
import { areMainExportsUsed } from './settings'
import { isFileIgnored } from './vscUtilities'

export async function buildRelations(
  imports: TImport[],
  exports: TExport[],
  mainInPackageJson?: string,
): Promise<TRelation[]> {
  const array: TRelation[] = []
  imports.forEach(addImport(array))
  exports.forEach(addExport(array, mainInPackageJson))
  return array
}

const addImport = (array: TRelation[]) => (anImport: TImport) => {
  const { inPath, name, fromPath } = anImport

  let entry = findEntry(array, inPath)
  if (!entry) {
    entry = { path: inPath }
    array.push(entry)
  }

  if (!entry.imports) {
    entry.imports = []
  }

  let importEntry = findImport(entry.imports, fromPath)
  if (!importEntry) {
    importEntry = {
      path: fromPath,
      names: [],
    }
    entry.imports.push(importEntry)
  }

  importEntry.names.push(name)
}

const addExport = (array: TRelation[], mainInPackageJson?: string) => (anExport: TExport) => {
  const { inPath, name, isUsed } = anExport

  let entry = findEntry(array, inPath)
  if (!entry) {
    entry = {
      path: inPath,
    }
    array.push(entry)
  }

  if (!entry.exports) {
    entry.exports = {}
  }

  if (isUsed) {
    if (!entry.exports.used) {
      entry.exports.used = []
    }

    entry.exports.used.push(name)
    return
  }

  if (!entry.exports.notUsed) {
    entry.exports.notUsed = []
  }

  /* We want to consider all exports in the file used in the main field of package.json as being used */
  if (inPath === mainInPackageJson && areMainExportsUsed()) {
    log(
      `Consider export of "${name}" in "${inPath}" as being used (findUnusedExports.considerMainExportsUsed is enabled).`,
    )
    return
  }

  /* We ignore what the user specified in .vscode file */
  if (isFileIgnored(inPath)) {
    log(
      `Consider export of "${name}" in "${inPath}" as being used (see ignore.files in .vscode/find-unused-exports.json).`,
    )
    return
  }

  /* If the same file is found by multiple glob rules it will produce duplicates in the tree */
  if (entry.exports.notUsed.includes(name)) {
    return
  }

  entry.exports.notUsed.push(name)
}

const findEntry = (array: TRelation[], path: string) => array.find((entry) => entry.path === path)

const findImport = (imports: TRelationImport[], path: string) => imports.find((index) => index.path === path)

export interface TRelation {
  exports?: TRelationExport
  imports?: TRelationImport[]
  path: string
}

interface TRelationExport {
  notUsed?: string[]
  used?: string[]
}

interface TRelationImport {
  names: string[]
  path: string
}
