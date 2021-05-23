import * as path from 'path';
import { readJsonFile } from './fsUtils';

export interface TContext {
  allowJs?: boolean;
  baseUrl?: string;
  exclude?: string[];
  files?: string[];
  include?: string[];
  pathToPrj: string;
}

/**
 * We read the tsconfig.json to find which files will be included and if they can be imported relative to baseUrl
 * @param path is the location of the project's root
 */
export const makeContext = (pathToPrj: string): TContext => {
  const pathToTsconfig = path.resolve(pathToPrj, 'tsconfig.json');
  const tsconfig = readJsonFile(pathToTsconfig) || {};

  const { compilerOptions, exclude, files, include } = tsconfig;
  const jsConfig = { allowJs: true };
  const { allowJs, baseUrl, outDir } = compilerOptions || jsConfig;

  const res = {
    allowJs,
    baseUrl: baseUrl ? path.resolve(pathToPrj, baseUrl) : undefined,
    exclude: getExclude(exclude, outDir),
    files,
    include,
    pathToPrj,
  };
  return res;
};

const getExclude = (exclude?: string[], outDir?: string): string[] | undefined => {
  if (exclude) {
    const excludeDirs = exclude.map((dir) => (dir.indexOf('*') < 0 ? `${dir}/**` : dir));

    if (outDir) {
      excludeDirs.push(`${outDir}/**`);
    }

    return excludeDirs;
  }

  const dirs = ['node_modules/**', 'bower_components/**', 'jspm_packages/**'];
  if (outDir) {
    dirs.push(`${outDir}/**`);
  }
  return dirs;
};
