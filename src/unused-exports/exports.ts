import { TTsParsed, TTsExport, varNameRe } from './parsedFiles';
import { TImport } from './imports';
import { log } from './log';

export const getExports = (parsedFiles: TTsParsed[], imports: TImport[]): TExport[] => {
  const arr: TExport[] = [];
  parsedFiles.forEach(parseExport(arr, imports));
  return arr;
};

const parseExport =
  (arr: TExport[], imports: TImport[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, exports } = parsedFile;
    exports.forEach(addParsedExports(arr, imports, path));
  };

const addParsedExports = (arr: TExport[], imports: TImport[], path: string) => (anExport: TTsExport) => {
  const { name, path: fromPath } = anExport;

  const names = getExportedNames(name);
  names.forEach((name) => {
    const isUsed = itIsUsed(path, name, imports);
    arr.push({
      inPath: path,
      name,
      fromPath,
      isUsed,
    });
  });
};

const groupRe = new RegExp(`${varNameRe}|,|\\{[^\\}]*\\}`, 'gi');
const varNameInGroupRe = new RegExp(`${varNameRe}|,}`, 'gi');

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

    const foundName1 = res1[0];
    const ch1 = foundName1[0];
    if (ch1 !== '{') {
      arr.push(foundName1);
      continue;
    }

    varNameInGroupRe.lastIndex = 0;
    const varNameInGroup = foundName1.substring(0, foundName1.length - 1);
    let res2: RegExpExecArray | null;
    while ((res2 = varNameInGroupRe.exec(varNameInGroup)) !== null) {
      /* Prevent browsers from getting stuck in an infinite loop */
      if (res2.index === varNameInGroupRe.lastIndex) {
        varNameInGroupRe.lastIndex++;
        log('Detected RegExp infinite loop (re)', varNameInGroupRe.source);
        log('Detected RegExp infinite loop (str)', varNameInGroup);
      }

      const foundName2 = res2[0];
      if (foundName2 !== ',') {
        arr.push(foundName2);
      }
    }
  }
  return arr;
};

const itIsUsed = (path: string, name: string, imports: TImport[]): boolean =>
  imports.find((anImport) => anImport.fromPath === path && (anImport.name === name || anImport.name === '*')) !==
  undefined;

export interface TExport {
  inPath: string;
  name: string;
  fromPath?: string;
  isUsed: boolean;
}
