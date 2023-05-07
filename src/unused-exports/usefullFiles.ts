import { glob } from 'glob';
import { TTsParsed } from './parsedFiles';

export const getOnlyUsefullFiles = (files: TTsParsed[]): TTsParsed[] =>
  files.filter((file) => isNotEmpty(file.imports) || isNotEmpty(file.exports));

const isNotEmpty = (arr?: unknown[]): boolean => (arr ? arr.length > 0 : false);

export function globSync(globRe: string, cwd: string = '.', globIgnore?: string[]): string[] {
  const res = glob.sync(globRe, {
    cwd,
    ignore: globIgnore,
    nodir: true,
    realpath: true,
    posix: true,
    absolute: true,
  });
  return res?.map((filePath) => filePath.replace('//?/', ''));
}
