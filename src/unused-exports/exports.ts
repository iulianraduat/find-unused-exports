import { TImport } from './imports'
import { log } from './log'
import { TTsExport, TTsParsed, variableNameRe } from './parsedFiles'

export async function getExports(parsedFiles: TTsParsed[], imports: TImport[]): Promise<TExport[]> {
  const array: TExport[] = []
  parsedFiles.forEach(parseExport(array, imports, parsedFiles))
  return array
}

const parseExport =
  (array: TExport[], imports: TImport[], parsedFiles: TTsParsed[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, exports } = parsedFile
    exports.forEach(addParsedExports(array, imports, path, parsedFiles))
  }

const addParsedExports =
  (array: TExport[], imports: TImport[], path: string, parsedFiles: TTsParsed[]) => (anExport: TTsExport) => {
    const { name, path: fromPath } = anExport

    const names = getExportedNames(name, fromPath, parsedFiles, path)
    for (const name of names) {
      const isUsed = isItUsed(path, name, imports, parsedFiles)
      array.push({
        inPath: path,
        name,
        fromPath,
        isUsed,
      })
    }
  }

const groupRe = new RegExp(`\\*|${variableNameRe}|\\{[^}]+\\}`, 'g')
const variableNameInGroupRe = new RegExp(variableNameRe, 'g')

const expandWildcardExport = (fromPath: string, parsedFiles: TTsParsed[], _currentPath: string): string[] => {
  const targetFile = parsedFiles.find((file) => {
    const targetBasename = normalizePathForCompare(fromPath)
    const fileBasename = normalizePathForCompare(file.path)
    return fileBasename === targetBasename
  })

  if (!targetFile) {
    return ['*'] // Fallback to original behavior if target file not found
  }

  // Get all exports from the target file, excluding re-exports to avoid circular dependencies
  const expandedNames: string[] = []
  for (const exp of targetFile.exports) {
    if (exp.name === '*') {
      // Skip re-exports to avoid infinite recursion
      continue
    }
    // Simple name extraction without using regex to avoid infinite loops
    if (exp.name.startsWith('{') && exp.name.endsWith('}')) {
      // Handle destructured exports like {a, b, c}
      const content = exp.name.slice(1, -1)
      const names = content
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
      expandedNames.push(...names)
    } else if (exp.name && exp.name !== '*') {
      // Handle simple named exports
      expandedNames.push(exp.name)
    }
  }

  return expandedNames.length > 0 ? expandedNames : ['*']
}

const getExportedNames = (
  name: string,
  fromPath?: string,
  parsedFiles?: TTsParsed[],
  currentPath?: string,
): string[] => {
  groupRe.lastIndex = 0
  const array = []
  let group: RegExpExecArray | null
  while ((group = groupRe.exec(name)) !== null) {
    /* Prevent browsers from getting stuck in an infinite loop */
    if (group.index === groupRe.lastIndex) {
      groupRe.lastIndex++
      log('Detected RegExp infinite loop (re)', groupRe.source)
      log('Detected RegExp infinite loop (str)', name)
    }

    /* It is either a var name or a list of var names */
    const foundName = group[0]
    const ch1 = foundName[0]
    if (ch1 === '*') {
      // Handle export * from './module' - expand to actual exports
      if (fromPath && parsedFiles && currentPath) {
        const expandedNames = expandWildcardExport(fromPath, parsedFiles, currentPath)
        if (Array.isArray(expandedNames) && expandedNames.length > 0) {
          array.push(...expandedNames)
        } else {
          array.push('*')
        }
      } else {
        array.push('*')
      }
    } else if (ch1 === '{') {
      /* It is a list of var names */
      variableNameInGroupRe.lastIndex = 0
      let variableNameInGroup: RegExpExecArray | null
      while ((variableNameInGroup = variableNameInGroupRe.exec(foundName)) !== null) {
        /* Prevent browsers from getting stuck in an infinite loop */
        if (variableNameInGroup.index === variableNameInGroupRe.lastIndex) {
          variableNameInGroupRe.lastIndex++
        }
        array.push(variableNameInGroup[0])
      }
    } else {
      /* It is a var name */
      array.push(foundName)
    }
  }
  return array
}

// Normalize both absolute file paths and module specifiers (e.g., './file', 'file')
// to a comparable basename without extension.
const normalizePathForCompare = (p: string): string => {
  const cleaned = p
    .replace(/^['"]+/u, '')
    .replaceAll(/['"]+/gu, '')
    .replace(/^\.\//u, '')
    .replaceAll('\\', '/')
  const withoutExtension = cleaned.replace(/\.(tsx?|jsx?)$/u, '')
  const parts = withoutExtension.split('/')
  return parts.at(-1) || withoutExtension
}

const isItUsed = (path: string, name: string, imports: TImport[], parsedFiles?: TTsParsed[]): boolean => {
  // Check for direct imports (normalize module specifier vs absolute path)
  const directImport = imports.find((anImport) => {
    const importBase = normalizePathForCompare(anImport.fromPath)
    const exportBase = normalizePathForCompare(path)
    return importBase === exportBase && (anImport.name === name || anImport.name === '*')
  })

  if (directImport) {
    return true
  }

  // Check for re-exports: if this export is being re-exported by another file,
  // we need to check if that re-export is ultimately used
  if (parsedFiles) {
    return isUsedThroughReExports(path, name, imports, parsedFiles, new Set())
  }

  return false
}

const isUsedThroughReExports = (
  originalPath: string,
  exportName: string,
  allImports: TImport[],
  parsedFiles: TTsParsed[],
  visited: Set<string>,
): boolean => {
  // Prevent infinite loops
  const key = `${originalPath}:${exportName}`
  if (visited.has(key)) {
    return false
  }
  visited.add(key)

  const originalBasename = normalizePathForCompare(originalPath)

  // Find files that re-export from the original file
  // A re-export means: file imports from original AND exports the same symbol
  const reExportingFiles = parsedFiles.filter((file) => {
    // Check if this file imports from the original file
    const hasImportFromOriginal = file.imports.some((imp) => {
      const importBasename = normalizePathForCompare(imp.path)
      const pathsMatch = importBasename === originalBasename
      // For re-exports, we need to check if this import could include our export
      // This includes: exact name match, wildcard (*), or destructured imports containing the name
      const nameMatches =
        imp.name === exportName || imp.name === '*' || (imp.name.includes('{') && imp.name.includes(exportName))

      return pathsMatch && nameMatches
    })

    if (!hasImportFromOriginal) {
      return false
    }

    // Check if this file also exports the same symbol (making it a re-export)
    const hasMatchingExport = file.exports.some((exp) => {
      // Handle wildcard exports: export * from './original'
      if (exp.name === '*' && exp.path) {
        const expPathBase = normalizePathForCompare(exp.path)
        return expPathBase === originalBasename
      }
      // Handle named exports: export { originalExport } from './original'
      if (exp.name.includes('{') && exp.name.includes('}')) {
        const exportedNames = exp.name
          .replaceAll(/[{}]/g, '')
          .split(',')
          .map((n) => n.trim())
        return exportedNames.includes(exportName)
      }
      // Handle direct name exports
      return exp.name === exportName
    })

    return hasImportFromOriginal && hasMatchingExport
  })

  // For each re-exporting file, check if the re-export is used
  for (const reExportingFile of reExportingFiles) {
    const directlyUsed = allImports.some((imp) => {
      const impBase = normalizePathForCompare(imp.fromPath)
      const reExpBase = normalizePathForCompare(reExportingFile.path)
      const baseMatch = impBase === reExpBase
      const nameMatch = imp.name === exportName || imp.name === '*'
      return baseMatch && nameMatch
    })

    if (directlyUsed) {
      return true
    }

    if (isUsedThroughReExports(reExportingFile.path, exportName, allImports, parsedFiles, visited)) {
      return true
    }
  }

  return false
}

export interface TExport {
  inPath: string
  name: string
  fromPath?: string
  isUsed: boolean
}
