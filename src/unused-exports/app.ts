import * as path from 'path';
import { makeContext } from './context';
import { getExports } from './exports';
import { getOnlyProjectImports } from './importedFiles';
import { getImports } from './imports';
import { log } from './log';
import { getNotUsed, sortNotUsedFn, TNotUsed } from './notUsed';
import { getParsedFiles } from './parsedFiles';
import { buildRelations, TRelation } from './relations';
import { getSourceFiles } from './sourceFiles';
import { getOnlyUsefullFiles } from './usefullFiles';

const fixPath = (path: string, prefixLen: number): string => path.substr(prefixLen).replace(/\\/g, '/');

const makePathRelativeToProject = (relations: TRelation[], absPathToPrj: string): void => {
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

export const app = (absPathToPrj: string): TNotUsed[] => {
  log('Path to project', absPathToPrj);
  const context = makeContext(absPathToPrj);
  const sourceFiles = getSourceFiles(absPathToPrj, context);
  const parsedFiles = getParsedFiles(sourceFiles);
  const projectFiles = getOnlyProjectImports(context, parsedFiles);
  log('Processed files', projectFiles.length);
  const usefullFiles = getOnlyUsefullFiles(projectFiles);
  log('Files having imports|exports', usefullFiles.length);

  const imports = getImports(usefullFiles);
  log('Total imports', imports.length);
  const exports = getExports(usefullFiles, imports);
  log('Total exports', exports.length);
  const relations = buildRelations(imports, exports);
  makePathRelativeToProject(relations, absPathToPrj);
  log('Analysed files', relations.length);
  const notUsed = getNotUsed(relations);
  const finalList = notUsed.sort(sortNotUsedFn);
  log('Not used exports', finalList.length);
  log('------------------------------------------------------------------------');
  return finalList;
};
