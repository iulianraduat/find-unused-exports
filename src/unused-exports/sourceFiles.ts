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
  const globExclude = getGlobIgnore(exclude);
  const explicitFiles = getRoots(pathToPrj, files);
  const globInclude = getRoots(pathToPrj, include);

  if (files === undefined && include === undefined) {
    const res: TTsFile[] = [];
    globFile(res, pathToPrj, globRegexp, globExclude);
    return res;
  }

  const res: TTsFile[] = [];
  if (files !== undefined) {
    globFiles(res, pathToPrj, explicitFiles);
  }
  if (include !== undefined) {
    globFiles(res, pathToPrj, globInclude, globExclude);
  }
  return res;
};

const getGlobRegexp = (allowJs?: boolean): string => (allowJs ? '**/*.@(ts|js)?(x)' : '**/*.ts?(x)');

const getGlobIgnore = (exclude: string[] = []): string[] => ['**/*.d.ts', 'node_modules/**/*', ...exclude];

function getRoots(pathToPrj: string, files?: string[]): string[] {
  if (files === undefined) {
    return [pathToPrj];
  }

  const pathFiles = files.map((f) => path.resolve(pathToPrj, f));
  return pathFiles;
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
