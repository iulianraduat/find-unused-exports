import * as glob from 'glob';
import * as path from 'path';
import { TContext } from './context';

export interface TTsFile {
  path: string;
}

export const getSourceFiles = (
  pathToPrj: string,
  context: TContext
): TTsFile[] => {
  const { allowJs, exclude, include, files } = context;

  const globRegexp = getGlobRegexp(allowJs);
  const globIgnore = getGlobIgnore(exclude);
  const globRoots = getGlobRoots(pathToPrj, files, include);

  const res1 = globFiles(files, globRegexp, undefined);
  const res2 = globFiles(globRoots, globRegexp, globIgnore);
  return [...res1, ...res2];
};

const getGlobRegexp = (allowJs?: boolean): string =>
  allowJs ? '**/*.?(ts|js)?(x)' : '**/*.ts?(x)';

const getGlobIgnore = (exclude?: string[]): string[] =>
  exclude ? ['**/*.d.ts', ...exclude] : ['**/*.d.ts'];

const getGlobRoots = (
  pathToPrj: string,
  files?: string[],
  include?: string[]
): string[] => {
  const pathFiles: string[] | undefined = files?.map((f) =>
    path.resolve(pathToPrj, f)
  );

  const pathInclude: string[] | undefined = include?.map((f) =>
    path.resolve(pathToPrj, f)
  );

  if (!pathFiles && !pathInclude) {
    return [pathToPrj];
  }

  return [...(pathFiles ?? []), ...(pathInclude ?? [])];
};

const globFiles = (
  paths: string[] | undefined,
  globRegexp: string,
  globIgnore: string[] | undefined
): TTsFile[] => {
  if (!paths) {
    return [];
  }

  const res: TTsFile[][] = paths.map((f) =>
    globFile(f, globRegexp, globIgnore)
  );

  let flattedRes: TTsFile[] = [];
  res.forEach((r) => (flattedRes = flattedRes.concat(r)));
  return flattedRes;
};

const globFile = (
  pathToFile: string,
  globRegexp: string,
  globIgnore: string[] | undefined
): TTsFile[] => {
  const res: TTsFile[] = [];
  glob
    .sync(globRegexp, {
      cwd: pathToFile,
      ignore: globIgnore,
      nodir: false,
      nosort: true,
    })
    .filter((f: any) => {
      res.push({
        path: path.resolve(pathToFile, f),
      });
    });
  return res;
};
