import { TTsFile } from './sourceFiles';
import { readFile } from './fsUtils';

export interface TTsParsed extends TTsFile {
  exports: TTsExport[];
  imports: TTsImport[];
}

export interface TTsExport {
  name: 'default' | string;
  path?: string;
}

export interface TTsImport {
  name: string;
  path: string;
}

export const getParsedFiles = (files: TTsFile[]): TTsParsed[] => files.map(parseFile);

const parseFile = (file: TTsFile): TTsParsed => {
  const content = readFile(file.path);
  /* we want to ignore any import/export present in a comment */
  const fixedContent = fixContent(content);
  const imports = getImports(fixedContent);
  const exports = getExports(fixedContent);
  return {
    ...file,
    exports,
    imports,
  };
};

export const varNameRe = `[_\\$a-z0-9]+`;
const fileNameRe = `["']([^"']+)["']`;
const fromFileNameRe = `\\s*from\\s*${fileNameRe}`;
const listSeparatorRe = `\\s*,\\s*`;
const nameRe = `${varNameRe}(?:\\s+as\\s+${varNameRe})?`;
const namesRe = `\\{\\s*(?:${nameRe}|${listSeparatorRe})+\\s*\\}`;

const importRe = `import\\s*`;
const importNamesRe = `(?:${nameRe}|${namesRe}|${listSeparatorRe})+`;

const importRegexps = [
  new RegExp(`${importRe}(${importNamesRe})${fromFileNameRe}`, 'gi'),
  new RegExp(`${importRe}(\\*\\s*as)\\s+(${varNameRe})${fromFileNameRe}`, 'gi'),
];

const defaultImportRegexps = [new RegExp(`(?:import|require)\\s*\\(\\s*${fileNameRe}\\s*\\)`, 'gi')];
const getImports = (content: string): TTsImport[] => {
  const res: TTsImport[] = [];

  const matches1 = getMatches(importRegexps, content);
  matches1?.forEach((match) => {
    const [importedNames, fromPath] = match;
    res.push({
      name: importedNames,
      path: fromPath,
    });
  });

  const matches2 = getMatches(defaultImportRegexps, content);
  matches2?.forEach((match) => {
    const [fromPath] = match;
    res.push({
      name: 'default',
      path: fromPath,
    });
  });

  return res;
};

const exportRe = `export\\s+(?:type\\s+)?`;
const defaultRe = `default`;

const exportRegexps = [
  new RegExp(`${exportRe}(${defaultRe})\\s`, 'gi'),
  new RegExp(`${exportRe}(?:class|const|enum|type|interface)\\s+(${varNameRe})`, 'gi'),
  /* 
  // It catches export const as exportRe nameRe
    new RegExp(
    `${exportRe}((?:${nameRe}|${namesRe}|${listSeparatorRe})+)\\s`,
    'gi'
  ),
 */
  new RegExp(`${exportRe}(\\*\\s+as)\\s+(${varNameRe})\\s${fromFileNameRe}`, 'gi'),
];
const getExports = (content: string): TTsExport[] => {
  const matches = getMatches(exportRegexps, content);
  const res: TTsExport[] = [];
  matches?.forEach((match) => {
    const [exportedName, fromPath] = match;
    res.push({
      name: exportedName,
      path: fromPath,
    });
  });
  return res;
};

const getMatches = (regexps: RegExp[], content: string): string[][] | undefined => {
  const arr: string[][] = [];
  regexps.forEach((regexp) => {
    let res: RegExpExecArray | null;
    while ((res = regexp.exec(content)) !== null) {
      res.shift();
      const match = res.map(removeSpaces);
      arr.push(match);
    }
  });
  return arr.length === 0 ? undefined : arr;
};

const removeSpaces = (txt: string) => txt.replace(/\s+/g, '');

// const reStringComment = /"(?:\\.|\\\n|\\\r|[^"])*(?:import\s|export\s)(?:\\.|\\\n|\\\r|[^"])*"|'(?:\\.|\\\n|\\\r|[^'])*(?:import\s|export\s)(?:\\.|\\\n|\\\r|[^'])*'|`(?:\\.|\\\n|\\\r|[^`])*(?:import\s|export\s)(?:\\.|\\\n|\\\r|[^`])*`|\/\*(?:.|\n|\r)*?\*\/|\/\/.*/g;
const reComment = /\/\*(?:.|\n|\r)*?\*\/|\/\/.*/g;
const fixContent = (content: string): string => content.replace(reComment, '');

/*
const getReStringChars = (char: string): string =>
  `(?:\\\\.|\\\\\\n|\\\\\\r|[^${char}])*`;
const reImportExportChars = `(?:import\\s|export\\s)`;
const getReString = (char: string): string => {
  const stringChars = getReStringChars(char);
  return `${char}${stringChars}${reImportExportChars}${stringChars}${char}`;
};
const reStringDoubleQuote = getReString(`"`);
const reStringSingleQuote = getReString(`'`);
const reStringBacktick = getReString("`");
const reCommentMultiLine = `\\/\\*(?:.|\\n|\\r)*?\\*\\/`;
const reCommentSingleLine = `\\/\\/.*`;
const reStringComment = new RegExp(
  `${reStringDoubleQuote}|${reStringSingleQuote}|${reStringBacktick}|${reCommentMultiLine}|${reCommentSingleLine}`,
  "g"
);
*/
/*
/import\s*((?:[_\$a-z0-9]+(?:\s+as\s+[_\$a-z0-9]+)?|\{\s*(?:[_\$a-z0-9]+(?:\s+as\s+[_\$a-z0-9]+)?|\s*,\s*)+\s*\}|\s*,\s*)+)\s*from\s*["']([^"']+)["']/gi

group 1: names
group 2: path

import a from './f';
import {a} from './f';
import a, {a} from './f';
import {a, b} from './f';
import a, {a, b} from './f';
import {a, b}, a from './f';
import { a } from './f';
import a,{ a } from './f';
import { a,b } from './f';
import a,{ a,b } from './f';
import { a,b },a from './f';



/export\s+((?:default\s)?\s*(?:class|const|enum)\s+([_\$a-z0-9]+))/gi
/export\s+((?:default\s)?\s*function)\s/gi
/export\s+(\*\s+as)\s+([_\$a-z0-9]+)\s\s*from\s*["']([^"']+)["']/gi

group 1: default? class|const|enum|function
group 2: name (not for function)

group 1: * as name
group 2: name
group 3: path

export default class a {}
export default const a = '';
export default enum a {}
export default function (){}
export class a {}
export const a = '';
export enum a {}
export function (){}
export a as b;
export {a as b, c};
export { a as b,c };
export * as a from 'b';
*/