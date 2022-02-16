import * as fs from 'fs';
import * as path from 'path';
import { OverviewProvider } from '../overview';
import { readJsonFile } from './fsUtils';

export interface TContext {
  allowJs?: boolean;
  baseUrl?: string;
  exclude?: string[];
  files?: string[];
  include?: string[];
  overviewProvider: OverviewProvider;
  pathToPrj: string;
}

/**
 * We read the tsconfig.json to find which files will be included and if they can be imported relative to baseUrl
 * @param path is the location of the project's root
 */
export const makeContext = (pathToPrj: string, overviewProvider: OverviewProvider): TContext => {
  const pathToTsconfig = path.resolve(pathToPrj, 'tsconfig.json');
  const pathToJsconfig = path.resolve(pathToPrj, 'jsconfig.json');
  let tsconfig = readJsonFile(pathToTsconfig, overviewProvider);
  if (tsconfig === undefined) {
    tsconfig = readJsonFile(pathToJsconfig, overviewProvider);
    if (tsconfig) {
      const { compilerOptions = {} } = tsconfig;
      tsconfig.compilerOptions = {
        ...compilerOptions,
        /* we want to find all .js and .jsx files for a javascript project */
        allowJs: true,
      };
    }
  }

  const { compilerOptions, exclude, files, include } = tsconfig || {};
  const jsConfig = { allowJs: true };
  const { allowJs, baseUrl, outDir } = compilerOptions || jsConfig;

  /* We are looking for custom include/exclude rules in package.json and .findUnusedExports.json */
  const pathToPackageJson = path.resolve(pathToPrj, 'package.json');
  const packageJson = readJsonFile(pathToPackageJson, overviewProvider);
  const includeFindUnusedExports1 = packageJson?.findUnusedExports?.include;
  const excludeFindUnusedExports1 = packageJson?.findUnusedExports?.exclude;

  const pathToFindUnusedExportsConfig = path.resolve(pathToPrj, '.findUnusedExports.json');
  const findUnusedExportsConfig = readJsonFile(pathToFindUnusedExportsConfig, overviewProvider);
  const includeFindUnusedExports2 = findUnusedExportsConfig?.include;
  const excludeFindUnusedExports2 = findUnusedExportsConfig?.exclude;

  const includeFindUnusedExports = mixArrays(includeFindUnusedExports1, includeFindUnusedExports2);
  const excludeFindUnusedExports = mixArrays(excludeFindUnusedExports1, excludeFindUnusedExports2);

  const res = {
    allowJs,
    baseUrl: baseUrl ? path.resolve(pathToPrj, baseUrl) : undefined,
    exclude: getExclude(pathToPrj, mixArrays(exclude, excludeFindUnusedExports), outDir),
    files,
    include: getInclude(pathToPrj, mixArrays(include, includeFindUnusedExports)),
    overviewProvider,
    pathToPrj,
  };
  return res;
};

function mixArrays(a?: unknown, b?: unknown): string[] | undefined {
  if (a === undefined && b === undefined) {
    return undefined;
  }

  if (Array.isArray(a) === false && Array.isArray(b) === false) {
    return undefined;
  }

  if (Array.isArray(a) === false) {
    return b as string[];
  }

  if (Array.isArray(b) === false) {
    return a as string[];
  }

  return [...(a as string[]), ...(b as string[])];
}

function getInclude(pathToPrj: string, include?: string[]): string[] | undefined {
  if (include === undefined) {
    return;
  }

  const includeDirs = include.map((dir) => getGlobDir(pathToPrj, dir));
  return includeDirs;
}

function getExclude(pathToPrj: string, exclude?: string[], outDir?: string): string[] | undefined {
  if (exclude) {
    const excludeDirs = exclude.map((dir) => getGlobDir(pathToPrj, dir));

    if (outDir) {
      excludeDirs.push(`${outDir}/**/*`);
    }

    return excludeDirs;
  }

  const dirs = ['node_modules/**/*', 'bower_components/**/*', 'jspm_packages/**/*'];
  if (outDir) {
    dirs.push(`${outDir}/**/*`);
  }
  return dirs;
}

function getGlobDir(pathToPrj: string, fsPath: string): string {
  const dir = path.resolve(pathToPrj, fsPath);
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory() ? `${fsPath}/**/*` : fsPath;
}
