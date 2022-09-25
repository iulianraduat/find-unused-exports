import * as fs from 'fs';
import * as path from 'path';
import { OverviewContext } from '../overviewContext';
import { pathResolve, readJsonFile } from './fsUtils';

export interface TContext {
  allowJs?: boolean;
  baseUrl?: string;
  exclude?: string[];
  files?: string[];
  include?: string[];
  main?: string;
  moduleSuffixes?: string[];
  overviewContext: OverviewContext;
  pathToPrj: string;
}

/**
 * We read the tsconfig.json to find which files will be included and if they can be imported relative to baseUrl
 * @param path is the location of the project's root
 */
export const makeContext = (
  pathToPrj: string,
  overviewContext: OverviewContext
): TContext => {
  const pathToTsconfig = pathResolve(pathToPrj, 'tsconfig.json');
  const pathToJsconfig = pathResolve(pathToPrj, 'jsconfig.json');
  let tsconfig = readJsonFile(pathToTsconfig, overviewContext);
  if (tsconfig === undefined) {
    tsconfig = readJsonFile(pathToJsconfig, overviewContext);
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
  const { allowJs, baseUrl, moduleSuffixes, outDir } =
    compilerOptions || jsConfig;

  /* We are looking for custom include/exclude rules in package.json and .findUnusedExports.json */
  const pathToPackageJson = pathResolve(pathToPrj, 'package.json');
  const packageJson = readJsonFile(pathToPackageJson, overviewContext);
  const main = packageJson?.main;
  const includeFindUnusedExports1 = packageJson?.findUnusedExports?.include;
  const excludeFindUnusedExports1 = packageJson?.findUnusedExports?.exclude;

  const pathToFindUnusedExportsConfig = pathResolve(
    pathToPrj,
    '.findUnusedExports.json'
  );
  const findUnusedExportsConfig = readJsonFile(
    pathToFindUnusedExportsConfig,
    overviewContext
  );
  const includeFindUnusedExports2 = findUnusedExportsConfig?.include;
  const excludeFindUnusedExports2 = findUnusedExportsConfig?.exclude;

  const includeFindUnusedExports = mixArrays(
    includeFindUnusedExports1,
    includeFindUnusedExports2
  );
  const excludeFindUnusedExports = mixArrays(
    excludeFindUnusedExports1,
    excludeFindUnusedExports2
  );

  const res: TContext = {
    allowJs,
    baseUrl: baseUrl ? pathResolve(pathToPrj, baseUrl) : undefined,
    exclude: getExclude(
      pathToPrj,
      mixArrays(exclude, excludeFindUnusedExports),
      outDir
    ),
    files,
    include: getInclude(
      pathToPrj,
      mixArrays(include, includeFindUnusedExports)
    ),
    main: main ? pathResolve(pathToPrj, main) : undefined,
    moduleSuffixes,
    overviewContext,
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

function getInclude(
  pathToPrj: string,
  include?: string[]
): string[] | undefined {
  if (include === undefined) {
    return;
  }

  const includeDirs = include.map((dir) => getGlobDir(pathToPrj, dir));
  return includeDirs;
}

function getExclude(
  pathToPrj: string,
  exclude?: string[],
  outDir?: string
): string[] | undefined {
  if (exclude) {
    const excludeDirs = exclude.map((dir) => getGlobDir(pathToPrj, dir));

    if (outDir) {
      excludeDirs.push(`${outDir}/**/*`);
    }

    return excludeDirs;
  }

  const defaultExcludeDirs = [
    'node_modules/**/*',
    'bower_components/**/*',
    'jspm_packages/**/*',
  ];
  if (outDir) {
    defaultExcludeDirs.push(`${outDir}/**/*`);
  }
  return defaultExcludeDirs;
}

function getGlobDir(pathToPrj: string, fsPath: string): string {
  const dir = pathResolve(pathToPrj, fsPath);
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()
    ? `${fsPath}/**/*`
    : fsPath;
}
