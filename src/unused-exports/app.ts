import * as path from 'path';
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

const makePathRelativeToProject = (
  relations: TRelation[],
  absPathToPrj: string
): void => {
  const pathDelim = path.delimiter;
  const len = absPathToPrj.length + pathDelim.length;
  relations.forEach((r) => {
    r.path = fixPath(r.path, len);

    if (r.imports === undefined) {
      return;
    }

    r.imports.forEach((i) => (i.path = fixPath(i.path, len)));
  });
};

export function app(
  absPathToPrj: string,
  overviewContext: OverviewContext
): TNotUsed[] {
  const startTime = new Date();

  resetLog();
  log(startTime.toISOString());
  let ts = log('Path to project', pathResolve(absPathToPrj));
  const context = makeContext(absPathToPrj, overviewContext);
  const sourceFiles = getSourceFiles(absPathToPrj, context);
  ts = log('Finding the sources took', undefined, ts);
  const parsedFiles = getParsedFiles(sourceFiles);
  ts = log('Parsing the files took', undefined, ts);
  const projectFiles = getOnlyProjectImports(context, parsedFiles);
  ts = log('Processed files', projectFiles.length, ts);
  const usefullFiles = getOnlyUsefullFiles(projectFiles);
  ts = log('Files having imports|exports', usefullFiles.length, ts);

  const imports = getImports(usefullFiles);
  ts = log('Total imports', imports.length, ts);
  const exports = getExports(usefullFiles, imports);
  ts = log('Total exports', exports.length, ts);
  const relations = buildRelations(imports, exports, context.main);
  makePathRelativeToProject(relations, absPathToPrj);
  ts = log('Analysed files', relations.length, ts);
  const notUsed = getNotUsed(relations);
  const finalList = notUsed.sort(sortNotUsedFn);
  const numNotUsedExports = finalList.length;
  ts = log('Not used exports', numNotUsedExports, ts);

  const [unusedExportsAndCircularImportsList, numCircularImports] =
    detectCircularImports(relations, finalList, ts);

  const endTime = new Date();
  const timeDiffMs: number = endTime.getTime() - startTime.getTime();
  log('Total ellapsed time (ms)', timeDiffMs);
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
