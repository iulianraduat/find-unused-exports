import * as path from 'path';
import { makeContext } from './context';
import { getExports } from './exports';
import { getOnlyProjectImports } from './importedFiles';
import { getImports } from './imports';
import { getNotUsed, TNotUsed, sortNotUsedFn } from './notUsed';
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
  const context = makeContext(absPathToPrj);
  const sourceFiles = getSourceFiles(absPathToPrj, context);
  const parsedFiles = getParsedFiles(sourceFiles);
  const projectFiles = getOnlyProjectImports(context, parsedFiles);
  const usefullFiles = getOnlyUsefullFiles(projectFiles);

  const imports = getImports(usefullFiles);
  const exports = getExports(usefullFiles, imports);
  const relations = buildRelations(imports, exports);
  makePathRelativeToProject(relations, absPathToPrj);
  const notUsed = getNotUsed(relations);
  return notUsed.sort(sortNotUsedFn);
};
