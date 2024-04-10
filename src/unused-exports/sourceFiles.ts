import * as path from 'path';
import { addGlobInclude, OverviewContext } from '../overviewContext';
import { TContext } from './context';
import { getAdjustedPath, globSync, pathResolve } from './fsUtils';
import { log } from './log';

export interface TTsFile {
  path: string;
}

const defaultExclude = ['**/node_modules/**/*', '**/*.d.ts'];

export async function getSourceFiles(
  pathToPrj: string,
  context: TContext
): Promise<TTsFile[]> {
  const { allowJs, exclude = [], include, files } = context;

  /* A glob must use only forward slashes */
  const globRegexp = getGlobRegexp(allowJs);
  const globExclude = fixPaths(exclude);
  const globExcludeExtended = fixPaths([...defaultExclude, ...exclude]);
  const explicitFiles = files ? getRoots(files) : undefined;
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
  const includeGlobs: string[] =
    files && explicitFiles ? [...explicitFiles, ...includes] : includes;
  context.overviewContext.globInclude = includeGlobs;
  context.overviewContext.globExclude = globExclude;
  context.overviewContext.numDefaultExclude = undefined;

  const res: TTsFile[] = [];
  if (explicitFiles !== undefined) {
    globFiles(
      res,
      pathToPrj,
      explicitFiles,
      undefined,
      context.overviewContext
    );
  }
  if (include !== undefined) {
    globFiles(res, pathToPrj, includes, globExclude, context.overviewContext);
  }
  // TODO remove duplicated files
  // - can influence the performance as there can be a lot of files already added in the array
  // - now each duplicated file will be scanned again for imports and exports
  return res;
}

const getGlobRegexp = (allowJs?: boolean): string =>
  allowJs ? '**/*.{ts,js}?(x)' : '**/*.ts?(x)';

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
  log('📂 Using glob rule', pathResolve(pathToFolder, globRegexp));
  globIgnore &&
    log(
      '📁 And glob ignore rules',
      globIgnore.map((aGlobIgnore) => pathResolve(pathToFolder, aGlobIgnore))
    );
  let count = 0;
  globSync(globRegexp, pathToFolder, globIgnore).filter((f: string) => {
    const source = pathResolve(pathToFolder, f);
    log('└ Found source file', source);
    res.push({ path: source });
    count++;
  });
  addGlobInclude(
    ctx,
    getAdjustedPath(fixPath(pathToFolder), globRegexp),
    count
  );
}
