import { TTsParsed, TTsExport } from "./parsedFiles";
import { TImport } from "./imports";

export const getExports = (
  parsedFiles: TTsParsed[],
  imports: TImport[]
): TExport[] => {
  const arr: TExport[] = [];
  parsedFiles.forEach(parseExport(arr, imports));
  return arr;
};

const parseExport = (arr: TExport[], imports: TImport[]) => (
  parsedFile: TTsParsed
): void => {
  const { path, exports } = parsedFile;
  exports.forEach(addParsedExports(arr, imports, path));
};

const addParsedExports = (arr: TExport[], imports: TImport[], path: string) => (
  anExport: TTsExport
) => {
  const { name, path: fromPath } = anExport;
  const isUsed = itIsUsed(path, name, imports);
  arr.push({
    inPath: path,
    name,
    fromPath,
    isUsed,
  });
};

const itIsUsed = (path: string, name: string, imports: TImport[]): boolean =>
  imports.find(
    (anImport) => anImport.fromPath === path && anImport.name === name
  ) !== undefined;

export interface TExport {
  inPath: string;
  name: string;
  fromPath?: string;
  isUsed: boolean;
}
