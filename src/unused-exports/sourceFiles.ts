import * as glob from 'glob';
import * as path from 'path';
import { addGlobInclude, OverviewContext } from '../overviewContext';
import { TContext } from './context';
import { getAdjustedPath } from './fsUtils';
import { log } from './log';

export interface TTsFile {
  path: string;
}

const defaultExclude = ['**/node_modules/**/*', '**/*.d.ts'];

export function getSourceFiles(
  pathToPrj: string,
  context: TContext
): TTsFile[] {
  const { allowJs, exclude = [], include, files } = context;

  /* A glob must use only forward slashes */
  const globRegexp = getGlobRegexp(allowJs);
  const globExclude = fixPaths(exclude);
  const globExcludeExtended = fixPaths([...defaultExclude, ...exclude]);
  const explicitFiles = getRoots(files);
  const globInclude = getRoots(include, globRegexp);

  context.overviewContext.pathToPrj = pathToPrj;

  if (files === undefined && include === undefined) {
    const res: TTsFile[] = [];
    context.overviewContext.globInclude = [globRegexp];
    context.overviewContext.globExclude = globExcludeExtended;
    context.overviewContext.numDefaultExclude = defaultExclude.length;
    globFile(
      res,
      pathToPrj,
      globRegexp,
      globExcludeExtended,
      context.overviewContext
    );
    return res;
  }

  /* We want to see the stats before doing the actions */
  const includes = include
    ? globInclude.map((gi) => applyGlob(gi, globRegexp))
    : [];
  const includeGlobs: string[] = files
    ? [...explicitFiles, ...includes]
    : includes;
  context.overviewContext.globInclude = includeGlobs;
  context.overviewContext.globExclude = globExclude;
  context.overviewContext.numDefaultExclude = undefined;

  const res: TTsFile[] = [];
  if (files !== undefined) {
    globFiles(
      res,
      pathToPrj,
      explicitFiles,
      globExclude,
      context.overviewContext
    );
  }
  if (include !== undefined) {
    globFiles(res, pathToPrj, includes, globExclude, context.overviewContext);
  }
  return res;
}

const getGlobRegexp = (allowJs?: boolean): string =>
  allowJs ? '**/*.@(ts|js)?(x)' : '**/*.ts?(x)';

function fixPaths(paths: string[]): string[] {
  return paths.map((f) => fixPath(f));
}

const reBackslash = new RegExp('\\\\', 'g');
function fixPath(filePath: string) {
  const fsSep = path.sep;
  switch (path.sep) {
    case '/':
      return filePath;
    case '\\':
      return filePath.replace(reBackslash, '/');
    default:
      return filePath;
  }
}

function getRoots(files?: string[], globRegexp?: string): string[] {
  if (files === undefined) {
    return ['.'];
  }

  const pathFiles = files.map((f) => applyGlob(f, globRegexp));
  return pathFiles;
}

function applyGlob(filePath: string, globRegexp?: string): string {
  if (globRegexp === undefined) {
    return filePath;
  }

  /* we match "/*" at the end of string */
  const reMatchAll = /\/\*$/;
  /* we keep "/*" plus the extensions */
  const ext = globRegexp.substring('**'.length);
  const fixedFilePath = filePath.replace(reMatchAll, ext);
  return fixedFilePath;
}

function globFiles(
  res: TTsFile[],
  pathToPrj: string,
  globRegexp: string[],
  globIgnore: string[] | undefined,
  ctx: OverviewContext
) {
  globRegexp.forEach((gre) => globFile(res, pathToPrj, gre, globIgnore, ctx));
}

function globFile(
  res: TTsFile[],
  pathToFolder: string,
  globRegexp: string,
  globIgnore: string[] | undefined,
  ctx: OverviewContext
) {
  log('Using glob rule', path.resolve(pathToFolder, globRegexp));
  globIgnore &&
    log(
      'And glob ignore rules',
      globIgnore.map((aGlobIgnore) => path.resolve(pathToFolder, aGlobIgnore))
    );
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
  addGlobInclude(
    ctx,
    getAdjustedPath(fixPath(pathToFolder), globRegexp),
    count
  );
}
