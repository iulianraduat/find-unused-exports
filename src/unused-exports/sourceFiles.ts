import * as glob from 'glob';
import * as path from 'path';
import { TContext } from './context';
import { log } from './log';

export interface TTsFile {
  path: string;
}

const defaultExclude = ['**/*.d.ts', 'node_modules/**/*', '**/node_modules/**/*'];

export function getSourceFiles(pathToPrj: string, context: TContext): TTsFile[] {
  const { allowJs, exclude, include, files } = context;

  const globRegexp = getGlobRegexp(allowJs);
  const globExclude = getGlobs(pathToPrj, exclude);
  const globExcludeExtended = getGlobs(pathToPrj, [...defaultExclude, ...(exclude || [])]);
  const explicitFiles = getRoots(pathToPrj, files);
  const globInclude = getRoots(pathToPrj, include, globRegexp);

  const fnUpdateFieldCountGlobInclude = (globPath: string, count: number) =>
    context.overviewProvider.updateFieldCountGlobInclude(pathToPrj, globPath, count);

  if (files === undefined && include === undefined) {
    const res: TTsFile[] = [];
    context.overviewProvider.updateFieldsGlob(pathToPrj, [globRegexp], globExclude);
    globFile(res, pathToPrj, globRegexp, globExclude, fnUpdateFieldCountGlobInclude);
    return res;
  }

  /* We want to see the stats before doing the actions */
  const includes = include ? globInclude.map((gi) => applyGlob(gi, globRegexp)) : [];
  const includeGlobs: string[] = files ? [...explicitFiles, ...includes] : includes;
  context.overviewProvider.updateFieldsGlob(pathToPrj, includeGlobs, globExcludeExtended, defaultExclude.length);

  const res: TTsFile[] = [];
  if (files !== undefined) {
    globFiles(res, pathToPrj, explicitFiles, globExclude, fnUpdateFieldCountGlobInclude);
  }
  if (include !== undefined) {
    globFiles(res, pathToPrj, includes, globExclude, fnUpdateFieldCountGlobInclude);
  }
  return res;
}

const getGlobRegexp = (allowJs?: boolean): string => (allowJs ? '**/*.@(ts|js)?(x)' : '**/*.ts?(x)');

function getGlobs(pathToPrj: string, paths: string[] = []): string[] {
  return paths.map(fixPath).map((f) => path.resolve(pathToPrj, f));
}

function fixPath(f: string) {
  const fsSep = path.sep;
  return fsSep !== '/' ? f.replace(/\//g, fsSep) : f;
}

function getRoots(pathToPrj: string, files?: string[], globRegexp?: string): string[] {
  if (files === undefined) {
    return [pathToPrj];
  }

  const pathFiles = files.map((f) => path.resolve(pathToPrj, applyGlob(f, globRegexp)));
  return pathFiles;
}

function applyGlob(filePath: string, globRegexp?: string): string {
  if (globRegexp === undefined) {
    return filePath;
  }

  /* we match "/*" at the end of string */
  const reMatchAll = /\/\*$/;
  /* we keep "/*" plus the extensions */
  const ext = globRegexp.substr('**'.length);
  const fixedFilePath = filePath.replace(reMatchAll, ext);
  return fixedFilePath;
}

function globFiles(
  res: TTsFile[],
  pathToPrj: string,
  globRegexp: string[],
  globIgnore: string[] | undefined,
  fnUpdateFieldCountGlobInclude: (globPath: string, count: number) => void
) {
  globRegexp.forEach((gre) => globFile(res, pathToPrj, gre, globIgnore, fnUpdateFieldCountGlobInclude));
}

function globFile(
  res: TTsFile[],
  pathToFolder: string,
  globRegexp: string,
  globIgnore: string[] | undefined,
  fnUpdateFieldCountGlobInclude: (globPath: string, count: number) => void
) {
  log('Using glob rule', path.resolve(pathToFolder, globRegexp));
  globIgnore && log('And glob ignore rules', globIgnore);
  let count = 0;
  glob
    .sync(globRegexp, {
      cwd: pathToFolder,
      ignore: globIgnore,
      nodir: true,
      nosort: true,
      realpath: true,
    })
    .filter((f: string) => {
      const source = path.resolve(pathToFolder, f);
      log('Found source file', source);
      res.push({
        path: source,
      });
      count++;
    });
  fnUpdateFieldCountGlobInclude(globRegexp, count);
}
