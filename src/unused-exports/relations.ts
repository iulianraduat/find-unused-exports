import { TExport } from './exports';
import { TImport } from './imports';
import { log } from './log';
import { areMainExportsUsed } from './settings';

export const buildRelations = (
  imports: TImport[],
  exports: TExport[],
  mainInPackageJson?: string
): TRelation[] => {
  const arr: TRelation[] = [];
  imports.forEach(addImport(arr));
  exports.forEach(addExport(arr, mainInPackageJson));
  return arr;
};

const addImport = (arr: TRelation[]) => (anImport: TImport) => {
  const { inPath, name, fromPath } = anImport;

  let entry = findEntry(arr, inPath);
  if (entry === undefined) {
    entry = { path: inPath };
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

const addExport =
  (arr: TRelation[], mainInPackageJson?: string) => (anExport: TExport) => {
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

    /* We want to consider all exports in the file used in the main field of package.json as being used */
    if (inPath === mainInPackageJson && areMainExportsUsed()) {
      log(
        `Consider export of "${name}" in "${inPath}" as being used (findUnusedExports.considerMainExportsUsed is enabled).`
      );
      return;
    }

    /* There are generated code which exports multiple types with the same name (like an interface and a const) */
    if (entry.exports.notUsed.some((knownName) => knownName === name)) {
      log(
        `Multiple unused exports with the same name "${name}" in "${inPath}".`
      );
      return;
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

interface TRelationImport {
  names: string[];
  path: string;
}
