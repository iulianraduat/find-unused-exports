import * as glob from "glob";
import * as path from "path";
import * as vscode from "vscode";
import { TContext } from "./context";
import { isDirectory, isFile } from "./fsUtils";
import { TTsImport, TTsParsed } from "./parsedFiles";

export const getOnlyProjectImports = (
  context: TContext,
  parsedFiles: TTsParsed[]
): TTsParsed[] => {
  const { baseUrl } = context;

  parsedFiles.forEach((tsParsed) => {
    const { path: filePath, imports } = tsParsed;
    tsParsed.imports = imports
      .map(makeImportAbs(baseUrl, path.dirname(filePath)))
      .filter(importValid);
  });

  return parsedFiles;
};

const importValid = (anImport: TTsImport): boolean =>
  anImport.path !== undefined;

const makeImportAbs = (baseUrl: string | undefined, filePath: string) => (
  anImport: TTsImport
): TTsImport => {
  const { path: relPath } = anImport;

  const absPath = path.resolve(filePath, relPath);
  const exactPath = resolveFilePath(absPath);
  if (exactPath) {
    return {
      ...anImport,
      path: exactPath,
    };
  }

  if (baseUrl) {
    const absPath = path.resolve(baseUrl, relPath);
    const exactPath = resolveFilePath(absPath);
    if (exactPath) {
      return {
        ...anImport,
        path: exactPath,
      };
    }
  }

  return {
    ...anImport,
    path: relPath,
  };
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
    cwd: ".",
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
    cwd: ".",
    nodir: false,
    nosort: true,
  });
  return resDir?.length === 1 ? path.resolve(resDir[0]) : undefined;
};

const getDirGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}/index.(ts|js)?(x)` : `${path}/index.ts?(x)`;

const getGlobRegexp = (path: string, allowJs?: boolean): string =>
  allowJs ? `${path}.(ts|js)?(x)` : `${path}.ts?(x)`;
