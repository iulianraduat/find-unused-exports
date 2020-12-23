import * as glob from 'glob';
import * as path from 'path';
import { TContext } from './context';
import { isDirectory, isFile } from './fsUtils';
import { TTsImport, TTsParsed } from './parsedFiles';

export const getOnlyProjectImports = (
  context: TContext,
  parsedFiles: TTsParsed[]
): TTsParsed[] => {
  const { allowJs, baseUrl } = context;

  parsedFiles.forEach((tsParsed) => {
    const { path: filePath, imports } = tsParsed;
    const mapFn = makeImportAbs(baseUrl, path.dirname(filePath), allowJs);
    tsParsed.imports = imports.map(mapFn).filter(importValid) as TTsImport[];
  });

  return parsedFiles;
};

const importValid = (anImport: TTsImport | undefined): boolean =>
  anImport !== undefined;

const makeImportAbs = (
  baseUrl: string | undefined,
  filePath: string,
  allowJs?: boolean
) => (anImport: TTsImport): TTsImport | undefined => {
  const { path: relPath } = anImport;

  const absPath = path.resolve(filePath, relPath);
  const exactPath = resolveFilePath(absPath, allowJs);
  if (exactPath) {
    return {
      ...anImport,
      path: exactPath,
    };
  }

  if (baseUrl) {
    const absPath = path.resolve(baseUrl, relPath);
    const exactPath = resolveFilePath(absPath, allowJs);
    if (exactPath) {
      return {
        ...anImport,
        path: exactPath,
      };
    }
  }

  return undefined;
};

const resolveFilePath = (
  filePath: string,
  allowJs?: boolean
): string | undefined => {
  if (isFile(filePath)) {
    return filePath;
  }

  /* try it as file */
  const globReFile = getGlobRegexp(filePath, allowJs);
  const resFile = glob.sync(globReFile, {
    cwd: '.',
    nodir: false,
    nosort: true,
  });
  if (resFile?.length === 1) {
    return path.resolve(resFile[0]);
  }

  if (isDirectory(filePath) === false) {
    return;
  }

  /* try it as directory */
  const globReDir = getDirGlobRegexp(filePath, allowJs);
  const resDir = glob.sync(globReDir, {
    cwd: '.',
    nodir: false,
    nosort: true,
  });
  return resDir?.length === 1 ? path.resolve(resDir[0]) : undefined;
};

const getDirGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}/index.@(ts|js)?(x)` : `${path}/index.ts?(x)`;

const getGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}.@(ts|js)?(x)` : `${path}.ts?(x)`;
