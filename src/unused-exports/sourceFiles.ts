import * as glob from 'glob';
import * as path from 'path';
import { TContext } from './context';
import { log } from './log';

export interface TTsFile {
  path: string;
}

export const getSourceFiles = (pathToPrj: string, context: TContext): TTsFile[] => {
  const { allowJs, exclude, include, files } = context;

  const globRegexp = getGlobRegexp(allowJs);
  const globExclude = getGlobExclude(pathToPrj, exclude);
  const explicitFiles = getRoots(pathToPrj, files);
  const globInclude = getRoots(pathToPrj, include, globRegexp);

  if (files === undefined && include === undefined) {
    const res: TTsFile[] = [];
    globFile(res, pathToPrj, globRegexp, globExclude);
    return res;
  }

  const res: TTsFile[] = [];
  if (files !== undefined) {
    globFiles(res, pathToPrj, explicitFiles, globExclude);
  }
  if (include !== undefined) {
    const includes = globInclude.map((gi) => applyGlob(gi, globRegexp));
    globFiles(res, pathToPrj, includes, globExclude);
  }
  return res;
};

const getGlobRegexp = (allowJs?: boolean): string => (allowJs ? '**/*.@(ts|js)?(x)' : '**/*.ts?(x)');

const getGlobExclude = (pathToPrj: string, exclude: string[] = []): string[] => {
  let list = ['**/*.d.ts', 'node_modules/**/*', '**/node_modules/**/*', ...exclude];
  const fsSep = path.sep;
  if (fsSep !== '/') {
    list = list.map((f) => f.replace(/\//g, fsSep));
  }
  list = list.map((f) => path.resolve(pathToPrj, f));
  return list;
};

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

function globFiles(res: TTsFile[], pathToPrj: string, globRegexp: string[], globIgnore?: string[]) {
  globRegexp.forEach((gre) => globFile(res, pathToPrj, gre, globIgnore));
}

function globFile(res: TTsFile[], pathToFolder: string, globRegexp: string, globIgnore?: string[]) {
  log('Using glob rule', path.resolve(pathToFolder, globRegexp));
  globIgnore && log('And glob ignore rules', globIgnore);
  glob
    .sync(globRegexp, {
      cwd: pathToFolder,
      ignore: globIgnore,
      nodir: true,
      nosort: true,
    })
    .filter((f: string) => {
      const source = path.resolve(pathToFolder, f);
      log('Found source file', source);
      res.push({
        path: source,
      });
    });
}
