import path from 'node:path'
import { OverviewContext } from '../overviewContext'
import { detectCircularImports } from './circularImports'
import { makeContext } from './context'
import { getExports } from './exports'
import { fixPathSeparator, pathResolve } from './fsUtilities'
import { getOnlyProjectImports } from './importedFiles'
import { getImports } from './imports'
import { log, resetLog } from './log'
import { TNotUsed, getNotUsed, sortNotUsedFunction } from './notUsed'
import { getParsedFiles } from './parsedFiles'
import { TRelation, buildRelations } from './relations'
import { getSourceFiles } from './sourceFiles'
import { getOnlyUsefullFiles } from './usefullFiles'

const fixPath = (path: string, prefixLength: number): string => fixPathSeparator(path.slice(Math.max(0, prefixLength)))

async function makePathRelativeToProject(relations: TRelation[], absPathToPrj: string): Promise<void> {
  const length = absPathToPrj.length + path.delimiter.length
  for (const r of relations) {
    r.path = fixPath(r.path, length)

    if (r.imports === undefined) {
      continue
    }

    for (const index of r.imports) index.path = fixPath(index.path, length)
  }
}

export async function app(absPathToPrj: string, overviewContext: OverviewContext): Promise<TNotUsed[]> {
  const startTime = new Date()

  resetLog()
  log(startTime.toISOString())
  let ts = log('⚙️ Path to project', pathResolve(absPathToPrj))
  const context = await makeContext(absPathToPrj, overviewContext)
  const sourceFiles = await getSourceFiles(absPathToPrj, context)
  ts = log('🕒 Finding the sources took', undefined, ts)
  const parsedFiles = await getParsedFiles(sourceFiles)
  ts = log('🕒 Parsing the files took', undefined, ts)
  const projectFiles = await getOnlyProjectImports(context, parsedFiles)
  ts = log('🎯 Processed files', projectFiles.length, ts)
  const usefullFiles = await getOnlyUsefullFiles(projectFiles)
  ts = log('🎯 Files having imports|exports', usefullFiles.length, ts)

  const imports = await getImports(usefullFiles)
  ts = log('🎯 Total imports', imports.length, ts)
  const exports = await getExports(usefullFiles, imports)
  ts = log('🎯 Total exports', exports.length, ts)
  const relations = await buildRelations(imports, exports, context.main)
  await makePathRelativeToProject(relations, absPathToPrj)
  ts = log('🎯 Analysed files', relations.length, ts)
  const notUsed = await getNotUsed(relations)
  const finalList = notUsed.sort(sortNotUsedFunction)
  const numberNotUsedExports = finalList.reduce(
    (accumulator, { notUsedExports }) => accumulator + (notUsedExports?.length ?? 0),
    0,
  )
  ts = log('🎯 Not used exports', numberNotUsedExports, ts)
  for (const { filePath, notUsedExports } of finalList) {
    if (notUsedExports) for (const name of notUsedExports) log('🎯 Not used export', `${filePath}: ${name}`)
  }

  const [unusedExportsAndCircularImportsList, numberCircularImports] = await detectCircularImports(
    relations,
    finalList,
    ts,
  )

  const endTime = new Date()
  const timeDiffMs: number = endTime.getTime() - startTime.getTime()
  log('🕒 Total ellapsed time (ms)', timeDiffMs)
  log('------------------------------------------------------------------------')

  overviewContext.filesHavingImportsOrExports = usefullFiles.length
  overviewContext.foundCircularImports = numberCircularImports
  overviewContext.notUsedExports = numberNotUsedExports
  overviewContext.processedFiles = projectFiles.length
  overviewContext.totalEllapsedTime = timeDiffMs
  overviewContext.totalExports = exports.length
  overviewContext.totalImports = imports.length

  return unusedExportsAndCircularImportsList
}
