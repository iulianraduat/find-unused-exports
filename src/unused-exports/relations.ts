import { TExport } from './exports';
import { TImport } from './imports';

export const buildRelations = (
  imports: TImport[],
  exports: TExport[]
): TRelation[] => {
  const arr: TRelation[] = [];

  imports.forEach(addImport(arr));
  exports.forEach(addExport(arr));

  return arr;
};

const addImport = (arr: TRelation[]) => (anImport: TImport) => {
  const { inPath, name, fromPath } = anImport;

  let entry = findEntry(arr, inPath);
  if (entry === undefined) {
    entry = {
      path: inPath,
    };
    arr.push(entry);
  }

  if (entry.imports === undefined) {
    entry.imports = [];
  }

  let importEntry = findImport(entry.imports, fromPath);
  if (importEntry === undefined) {
    importEntry = {
      path: fromPath,
      names: [],
    };
    entry.imports.push(importEntry);
  }

  importEntry.names.push(name);
};

const addExport = (arr: TRelation[]) => (anExport: TExport) => {
  const { inPath, name, isUsed } = anExport;

  let entry = findEntry(arr, inPath);
  if (entry === undefined) {
    entry = {
      path: inPath,
    };
    arr.push(entry);
  }

  if (entry.exports === undefined) {
    entry.exports = {};
  }

  if (isUsed) {
    if (entry.exports.used === undefined) {
      entry.exports.used = [];
    }

    entry.exports.used.push(name);
    return;
  }

  if (entry.exports.notUsed === undefined) {
    entry.exports.notUsed = [];
  }

  entry.exports.notUsed.push(name);
};

const findEntry = (arr: TRelation[], path: string) =>
  arr.find((entry) => entry.path === path);

const findImport = (imports: TRelationImport[], path: string) =>
  imports.find((i) => i.path === path);

export interface TRelation {
  exports?: TRelationExport;
  imports?: TRelationImport[];
  path: string;
}

interface TRelationExport {
  notUsed?: string[];
  used?: string[];
}

export interface TRelationImport {
  names: string[];
  path: string;
}
