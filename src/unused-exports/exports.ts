import { TTsParsed, TTsExport, varNameRe } from './parsedFiles';
import { TImport } from './imports';
import { log } from './log';

export async function getExports(
  parsedFiles: TTsParsed[],
  imports: TImport[]
): Promise<TExport[]> {
  const arr: TExport[] = [];
  parsedFiles.forEach(parseExport(arr, imports));
  return arr;
}

const parseExport =
  (arr: TExport[], imports: TImport[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, exports } = parsedFile;
    exports.forEach(addParsedExports(arr, imports, path));
  };

const addParsedExports =
  (arr: TExport[], imports: TImport[], path: string) =>
  (anExport: TTsExport) => {
    const { name, path: fromPath } = anExport;

    const names = getExportedNames(name);
    names.forEach((name) => {
      const isUsed = isItUsed(path, name, imports);
      arr.push({
        inPath: path,
        name,
        fromPath,
        isUsed,
      });
    });
  };

const groupRe = new RegExp(`${varNameRe}|\\{[^}]+\\}`, 'g');
const varNameInGroupRe = new RegExp(varNameRe, 'g');

const getExportedNames = (name: string): string[] => {
  groupRe.lastIndex = 0;
  const arr = [];
  let res1: RegExpExecArray | null;
  while ((res1 = groupRe.exec(name)) !== null) {
    /* Prevent browsers from getting stuck in an infinite loop */
    if (res1.index === groupRe.lastIndex) {
      groupRe.lastIndex++;
      log('Detected RegExp infinite loop (re)', groupRe.source);
      log('Detected RegExp infinite loop (str)', name);
    }

    /* It is either a var name or a list of var names */
    const foundName = res1[0];
    const ch1 = foundName[0];
    if (ch1 !== '{') {
      arr.push(foundName);
      continue;
    }

    varNameInGroupRe.lastIndex = 0;
    let res2: RegExpExecArray | null;
    while ((res2 = varNameInGroupRe.exec(foundName)) !== null) {
      const foundName = res2[0];
      arr.push(foundName);
    }
  }
  return arr;
};

const isItUsed = (path: string, name: string, imports: TImport[]): boolean =>
  imports.find(
    (anImport) =>
      anImport.fromPath === path &&
      (anImport.name === name || anImport.name === '*')
  ) !== undefined;

export interface TExport {
  inPath: string;
  name: string;
  fromPath?: string;
  isUsed: boolean;
}
