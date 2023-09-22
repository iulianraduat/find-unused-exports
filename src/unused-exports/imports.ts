import { log } from './log';
import { TTsImport, TTsParsed, varNameRe } from './parsedFiles';

export async function getImports(parsedFiles: TTsParsed[]): Promise<TImport[]> {
  const arr: TImport[] = [];
  parsedFiles.forEach(parseImport(arr));
  return arr;
}

const parseImport =
  (arr: TImport[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, imports } = parsedFile;
    imports.forEach(addParsedImports(arr, path));
  };

const addParsedImports =
  (arr: TImport[], path: string) => (anImport: TTsImport) => {
    const { name, path: fromPath } = anImport;
    const names = getImportedNames(name);
    names.forEach((name) =>
      arr.push({
        inPath: path,
        name,
        fromPath,
      })
    );
  };

const defaultOrGroupRe = new RegExp(`${varNameRe}|\\*|,|\\{[^\\}]*\\}`, 'gi');
const varNameInGroupRe = new RegExp(`${varNameRe}|,}`, 'gi');

const getImportedNames = (name: string): string[] => {
  defaultOrGroupRe.lastIndex = 0;
  const arr = [];
  let res1: RegExpExecArray | null;
  while ((res1 = defaultOrGroupRe.exec(name)) !== null) {
    /* Prevent browsers from getting stuck in an infinite loop */
    if (res1.index === defaultOrGroupRe.lastIndex) {
      defaultOrGroupRe.lastIndex++;
      log('Detected RegExp infinite loop (re)', defaultOrGroupRe.source);
      log('Detected RegExp infinite loop (str)', name);
    }

    const foundName1 = res1[0];
    const ch1 = foundName1[0];
    if (foundName1 === '*') {
      arr.push('*');
      continue;
    }
    if (ch1 !== '{') {
      arr.push('default');
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

export interface TImport {
  inPath: string;
  name: string;
  fromPath: string;
}
