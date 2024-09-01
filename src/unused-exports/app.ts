import { delimiter } from 'path';
import { OverviewContext } from '../overviewContext';
import { detectCircularImports } from './circularImports';
import { makeContext } from './context';
import { getExports } from './exports';
import { fixPathSeparator, pathResolve } from './fsUtils';
import { getOnlyProjectImports } from './importedFiles';
import { getImports } from './imports';
import { log, resetLog } from './log';
import { getNotUsed, sortNotUsedFn, TNotUsed } from './notUsed';
import { getParsedFiles } from './parsedFiles';
import { buildRelations, TRelation } from './relations';
import { getSourceFiles } from './sourceFiles';
import { getOnlyUsefullFiles } from './usefullFiles';

const fixPath = (path: string, prefixLen: number): string =>
  fixPathSeparator(path.substring(prefixLen));

async function makePathRelativeToProject(
  relations: TRelation[],
  absPathToPrj: string
): Promise<void> {
  const pathDelim = delimiter;
  const len = absPathToPrj.length + pathDelim.length;
  relations.forEach((r) => {
    r.path = fixPath(r.path, len);

    if (r.imports === undefined) {
      return;
    }

    r.imports.forEach((i) => (i.path = fixPath(i.path, len)));
  });
}

export async function app(
  absPathToPrj: string,
  overviewContext: OverviewContext
): Promise<TNotUsed[]> {
  const startTime = new Date();

  resetLog();
  log(startTime.toISOString());
  let ts = log('⚙️ Path to project', pathResolve(absPathToPrj));
  const context = await makeContext(absPathToPrj, overviewContext);
  const sourceFiles = await getSourceFiles(absPathToPrj, context);
  ts = log('🕒 Finding the sources took', undefined, ts);
  const parsedFiles = await getParsedFiles(sourceFiles);
  ts = log('🕒 Parsing the files took', undefined, ts);
  const projectFiles = await getOnlyProjectImports(context, parsedFiles);
  ts = log('🎯 Processed files', projectFiles.length, ts);
  const usefullFiles = await getOnlyUsefullFiles(projectFiles);
  ts = log('🎯 Files having imports|exports', usefullFiles.length, ts);

  const imports = await getImports(usefullFiles);
  ts = log('🎯 Total imports', imports.length, ts);
  const exports = await getExports(usefullFiles, imports);
  ts = log('🎯 Total exports', exports.length, ts);
  const relations = await buildRelations(imports, exports, context.main);
  await makePathRelativeToProject(relations, absPathToPrj);
  ts = log('🎯 Analysed files', relations.length, ts);
  const notUsed = await getNotUsed(relations);
  const finalList = notUsed.sort(sortNotUsedFn);
  const numNotUsedExports = finalList.reduce(
    (acc, { notUsedExports }) => acc + (notUsedExports?.length ?? 0),
    0
  );
  ts = log('🎯 Not used exports', numNotUsedExports, ts);
  finalList.forEach(({ filePath, notUsedExports }) => {
    notUsedExports?.forEach((name) =>
      log('🎯 Not used export', `${filePath}: ${name}`)
    );
  }, 0);

  const [unusedExportsAndCircularImportsList, numCircularImports] =
    await detectCircularImports(relations, finalList, ts);

  const endTime = new Date();
  const timeDiffMs: number = endTime.getTime() - startTime.getTime();
  log('🕒 Total ellapsed time (ms)', timeDiffMs);
  log(
    '------------------------------------------------------------------------'
  );

  overviewContext.filesHavingImportsOrExports = usefullFiles.length;
  overviewContext.foundCircularImports = numCircularImports;
  overviewContext.notUsedExports = numNotUsedExports;
  overviewContext.processedFiles = projectFiles.length;
  overviewContext.totalEllapsedTime = timeDiffMs;
  overviewContext.totalExports = exports.length;
  overviewContext.totalImports = imports.length;

  return unusedExportsAndCircularImportsList;
}
