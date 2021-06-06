import * as vscode from 'vscode';
import { readFile } from './fsUtils';
import { log } from './log';
import { TTsFile } from './sourceFiles';

export interface TTsParsed extends TTsFile {
  exports: TTsExport[];
  imports: TTsImport[];
}

export interface TTsExport {
  name: 'default' | string;
  path: string;
}

export interface TTsImport {
  name: string;
  path: string;
}

export const getParsedFiles = (files: TTsFile[]): TTsParsed[] => files.map(parseFile);

function parseFile(file: TTsFile): TTsParsed {
  let ts = log('Parse file', file.path);
  const content = readFile(file.path);
  /* we want to ignore any import/export present in a comment */
  const fixedContent = fixContent(content);
  ts = log('Normalizing the content took', undefined, ts);
  const imports = getImports(fixedContent);
  ts = log('Found imports', imports.length, ts);
  const exports = getExports(fixedContent);
  log('Found exports', exports.length, ts);
  return {
    ...file,
    exports,
    imports,
  };
}

export const varNameRe = `[_\\$a-zA-Z0-9]+`;
const fileNameRe = `["']([^"']+)["']`;
const fromFileNameRe = `\\s+from\\s*${fileNameRe}`;
const listSeparatorRe = `\\s*,\\s*`;
const nameRe = `${varNameRe}(?:\\s+as\\s+${varNameRe})?`;
const namesRe = `\\{\\s*(?:${nameRe}|${listSeparatorRe})+\\s*\\}`;

const importRe = `import(?:\\s+type)?\\s+`;
const importNamesRe = `(?:${nameRe}|${namesRe}|${listSeparatorRe})+`;

const importRegexps = [
  new RegExp(`${importRe}(${importNamesRe})${fromFileNameRe}`, 'g'),
  new RegExp(`${importRe}(\\*)\\s*as\\s+${varNameRe}${fromFileNameRe}`, 'g'),
];

const importRequireRegexps = [new RegExp(`(?:import|require)\\s*\\(\\s*${fileNameRe}\\s*\\)`, 'g')];
const reAsImport = new RegExp(`\\s+as\\s+${varNameRe}`, 'g');

function getImports(content: string): TTsImport[] {
  const res: TTsImport[] = [];
  const matches1 = getMatches(importRegexps, content, reAsImport);
  matches1?.forEach((match) => {
    const [importedNames, fromPath] = match;
    res.push({
      name: importedNames,
      path: fromPath,
    });
  });

  const matches2 = getMatches(importRequireRegexps, content, reAsImport);
  matches2?.forEach((match) => {
    const [fromPath] = match;
    res.push({
      name: '*',
      path: fromPath,
    });
  });
  return res;
}

const exportRe = `export\\s+`;
const defaultRe = `default`;

const exportRegexps = [
  new RegExp(`${exportRe}(${defaultRe})\\s`, 'g'),
  new RegExp(`${exportRe}(?:class|const|let|var|enum|type|interface|function)\\s+(${varNameRe}|${namesRe})`, 'g'),
  new RegExp(`${exportRe}(${namesRe})`, 'g'),
  new RegExp(`${exportRe}(?:\\*\\s+as)\\s+(${varNameRe})\\s${fromFileNameRe}`, 'g'),
];

const reAsExport = new RegExp(`${varNameRe}\\s+as\\s+`, 'gi');

function getExports(content: string): TTsExport[] {
  const matches = getMatches(exportRegexps, content, reAsExport);
  const res: TTsExport[] = [];
  matches?.forEach((match) => {
    const [exportedName, fromPath] = match;
    res.push({
      name: exportedName,
      path: fromPath,
    });
  });
  return res;
}

function getMatches(regexps: RegExp[], content: string, fixRe?: RegExp): string[][] | undefined {
  const arr: string[][] = [];
  regexps.forEach((regexp) => {
    regexp.lastIndex = 0;
    let res: RegExpExecArray | null;
    while ((res = regexp.exec(content)) !== null) {
      /* Prevent browsers from getting stuck in an infinite loop */
      if (res.index === regexp.lastIndex) {
        regexp.lastIndex++;
        log('Detected RegExp infinite loop', regexp.source);
      }

      res.shift();
      const match = res.map((r) => {
        if (fixRe) {
          r = r.replace(fixRe, '');
        }
        return removeSpaces(r);
      });
      arr.push(match);
    }
  });
  return arr.length === 0 ? undefined : arr;
}

const reSpaces = /\s+/g;
const removeSpaces = (txt: string) => txt.replace(reSpaces, '');

function isShowIgnoredExportsEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.showIgnoredExports', false);
}

const reCommentExport = /\/\/\s*find-unused-exports:ignore-next-line-exports\b.*\r?\nexport\b.*/gm;
const reCommentMultiline = /\/\*.*?\*\//gs;
const reCommentSingleline = /\/\/.*/g;
function fixContent(content: string): string {
  let newContent = content;
  if (isShowIgnoredExportsEnabled() === false) {
    newContent = newContent.replace(reCommentExport, '');
  }

  return newContent.replace(reCommentMultiline, '').replace(reCommentSingleline, '');
}
