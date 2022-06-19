import * as glob from 'glob';
import * as path from 'path';
import { TContext } from './context';
import { isDirectory, isFile } from './fsUtils';
import { log } from './log';
import { TTsImport, TTsParsed } from './parsedFiles';

const defaultModuleSuffixes = [''];

export const getOnlyProjectImports = (
  context: TContext,
  parsedFiles: TTsParsed[]
): TTsParsed[] => {
  const { allowJs, baseUrl, moduleSuffixes = defaultModuleSuffixes } = context;

  parsedFiles.forEach((tsParsed) => {
    const { path: filePath, imports } = tsParsed;
    const mapFn = makeImportAbs(
      baseUrl,
      path.dirname(filePath),
      moduleSuffixes,
      allowJs
    );
    tsParsed.imports = imports.map(mapFn).filter(importValid) as TTsImport[];
  });

  return parsedFiles;
};

const importValid = (anImport: TTsImport | undefined): boolean =>
  anImport !== undefined;

const makeImportAbs =
  (
    baseUrl: string | undefined,
    filePath: string,
    moduleSuffixes: string[],
    allowJs?: boolean
  ) =>
  (anImport: TTsImport): TTsImport | undefined => {
    const { path: relPath } = anImport;

    const absPath = path.resolve(filePath, relPath);
    const exactPath = resolveFilePath(absPath, moduleSuffixes, allowJs);
    if (exactPath) {
      return {
        ...anImport,
        path: exactPath,
      };
    }

    if (baseUrl) {
      const absPath = path.resolve(baseUrl, relPath);
      const exactPath = resolveFilePath(absPath, moduleSuffixes, allowJs);
      if (exactPath) {
        return {
          ...anImport,
          path: exactPath,
        };
      }
    }

    return undefined;
  };

const getGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}.@(ts|tsx|js|jsx)` : `${path}.@(ts|tsx)`;

const getDirGlobRegexp = (rootPath: string, allowJs?: boolean): string =>
  path.resolve(
    rootPath,
    allowJs ? `index.@(ts|tsx|js|jsx)` : `index.@(ts|tsx)`
  );

function resolveFilePath(
  filePath: string,
  moduleSuffixes: string[],
  allowJs?: boolean
): string | undefined {
  if (isFile(filePath)) {
    return filePath;
  }

  try {
    /* try it as file */
    const globReFile = getGlobRegexp(filePath, allowJs);
    const resFile = doGlob(
      'file',
      getGlobRegexp,
      filePath,
      moduleSuffixes,
      allowJs
    );
    if (resFile) {
      return resFile;
    }

    if (isDirectory(filePath) === false) {
      return;
    }

    /* try it as directory */
    const resDir = doGlob(
      'folder',
      getDirGlobRegexp,
      filePath,
      moduleSuffixes,
      allowJs
    );
    if (resDir) {
      return resDir;
    }
  } catch (err) {
    return;
  }

  // log(`Cannot resolve path to '${filePath}'. Tried`, [filePath, moduleSuffixes, globReFile, globReDir]);
  return undefined;
}

function doGlob(
  tryMode: string,
  getGlobRegexp: (path: string, allowJs?: boolean | undefined) => string,
  filePath: string,
  moduleSuffixes: string[],
  allowJs?: boolean
) {
  const len = moduleSuffixes.length;
  for (let i = 0; i < len; i++) {
    const extendedFilePath = filePath + moduleSuffixes[i];
    const res = doOneGlob(tryMode, getGlobRegexp, extendedFilePath, allowJs);
    if (res) {
      return res;
    }
    log(`Cannot resolve path to '${extendedFilePath}'. Tried`, [
      tryMode,
      filePath,
      moduleSuffixes,
      i,
      allowJs,
    ]);
  }
  return undefined;
}

function doOneGlob(
  tryMode: string,
  getGlobRegexp: (path: string, allowJs?: boolean | undefined) => string,
  filePath: string,
  allowJs?: boolean
) {
  try {
    const globRe = getGlobRegexp(filePath, allowJs);
    const res = glob.sync(globRe, {
      cwd: '.',
      nodir: true,
      nosort: true,
      realpath: true,
    });
    if (res?.length === 1) {
      return path.resolve(res[0]);
    }
  } catch (err: any) {
    log(
      `Exception glob: cannot resolve path to '${filePath}'. Tried ${tryMode}`,
      err?.message || err
    );
    throw err;
  }
  return undefined;
}
