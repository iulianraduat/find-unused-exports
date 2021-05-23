import { TTsImport, TTsParsed, varNameRe } from './parsedFiles';

export const getImports = (parsedFiles: TTsParsed[]): TImport[] => {
  const arr: TImport[] = [];
  parsedFiles.forEach(parseImport(arr));
  return arr;
};

const parseImport =
  (arr: TImport[]) =>
  (parsedFile: TTsParsed): void => {
    const { path, imports } = parsedFile;
    imports.forEach(addParsedImports(arr, path));
  };

const addParsedImports = (arr: TImport[], path: string) => (anImport: TTsImport) => {
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
  const re = new RegExp(defaultOrGroupRe, 'gi');
  const arr = [];
  let res1: string[] | null;
  while ((res1 = re.exec(name)) !== null) {
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

    const varNameInGroup = foundName1.substring(0, foundName1.length - 1);
    let res2: string[] | null;
    while ((res2 = varNameInGroupRe.exec(varNameInGroup)) !== null) {
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
