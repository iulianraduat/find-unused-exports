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
  path?: string;
}

export interface TTsImport {
  name: string;
  path: string;
}

export async function getParsedFiles(files: TTsFile[]): Promise<TTsParsed[]> {
  return files.map(parseFile);
}

function parseFile(file: TTsFile): TTsParsed {
  let ts = log('📑 Parse file', file.path);
  const content = readFile(file.path);
  /* we want to ignore any import/export present in a comment */
  const fixedContent = fixContent(content);
  ts = log('└ Normalizing the content took', undefined, ts);
  const imports = getImports(fixedContent);
  ts = log('└ Found imports', imports.length, ts);
  const exports = getExports(fixedContent);
  log('└ Found exports', exports.length, ts);
  return {
    ...file,
    exports,
    imports,
  };
}

const fileNameRe = `("[^"\\s]+"|'[^'\\s]+'|\`[^\`\\s]+\`)`;
/* we need to remove the above start and end quotes */
const fixPath = (path: string) =>
  path.length >= 3 ? path.substring(1, path.length - 1) : '';

const validIECharsRe = `(?:\\b[*_$a-zA-Z0-9{,}\\s\r\n]+?)`;
const importExportFromRegex = [
  new RegExp(`\\bimport\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`, 'g'),
  new RegExp(
    `\\bimport\\s+type\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`,
    'g'
  ),
  new RegExp(`\\bexport\\s*(${validIECharsRe})\\s*from\\s*${fileNameRe}`, 'g'),
];

export const varNameRe = `[_$a-zA-Z0-9]+`;
const asVarNameRe = new RegExp(`\\s+as\\s+${varNameRe}`, 'g');
const listNamesRe = `\\{(?:${varNameRe}|,|\\s+)+\\}`;
const allValidNamesRe = `(?:\\*|${varNameRe}|${listNamesRe}|,)+`;
const exactAllValidNamesRe = new RegExp(`^${allValidNamesRe}$`);

const spacesRe = new RegExp(`\\s+|\r|\n`, 'g');
const typeSpacesRe = new RegExp(`\\btype(?:\\s+|\r|\n)`, 'g');
const removeSpaces = (txt: string) => txt.replace(spacesRe, '');
const removeTypeSpaces = (txt: string) =>
  removeSpaces(txt.replace(typeSpacesRe, ''));

const importRequireRegexps = [
  new RegExp(`\\b(?:import|require)\\s*${fileNameRe}`, 'g'),
  new RegExp(`\\b(?:import|require)\\s*\\(\\s*${fileNameRe}\\s*\\)`, 'g'),
];

function getImports(content: string): TTsImport[] {
  const res: TTsImport[] = [];

  /* find all `import|export ... from "module-name"` ; remove `as ...` */
  const matches1 = getMatches(importExportFromRegex, content, asVarNameRe);
  matches1?.forEach((match) => {
    const [importedNames, fromPath] = match;
    const importedNamesWithoutSpaces = removeTypeSpaces(importedNames);
    if (exactAllValidNamesRe.test(importedNamesWithoutSpaces)) {
      res.push({
        name: importedNamesWithoutSpaces,
        path: fixPath(fromPath),
      });
    }
  });

  /* find all `import|require("module-name")` */
  const matches2 = getMatches(importRequireRegexps, content);
  matches2?.forEach((match) => {
    const [fromPath] = match;
    res.push({
      name: '*',
      path: fixPath(fromPath),
    });
  });

  return res;
}

const individualExportRegexps = [
  new RegExp(`\\bexport\\s+(default)\\s`, 'g'),
  new RegExp(
    `\\bexport\\s+(?:class|const|let|var|enum|type|interface|function\\*?)\\s+(${varNameRe})`,
    'g'
  ),
];

const destructuredExportsRegexps = [
  new RegExp(`\\bexport\\s+(?:const|let|var)\\s+\\{\\s*([^}]+)\\s*\\}`, 'g'),
];
const varNameColonRe = new RegExp(`${varNameRe}\\s*:\\s*`, 'gi');

const exportListRegexps = [
  new RegExp(`\\bexport\\s*(\\{\\s*[^}]+\\s*\\})`, 'g'),
  new RegExp(`\\bexport\\s+type\\s*(\\{\\s*[^}]+\\s*\\})`, 'g'),
];
const varNameAsRe = new RegExp(`${varNameRe}\\s+as\\s+`, 'gi');
const typePrefixingTypeRe = new RegExp(`\\btype\\s+`, 'gi');

const aggregatedExportsRegexps = [
  new RegExp(`\\bexport\\s*(\\*)\\s*from\\s*${fileNameRe}`, 'g'),
  new RegExp(
    `\\bexport\\s*(\\*(?:\\s*as\\s+${varNameRe}\\s+))\\s*from\\s*${fileNameRe}`,
    'g'
  ),
];
const starAsRe = new RegExp(`\\*\\s*as\\s+`, 'gi');

function getExports(content: string): TTsExport[] {
  const res: TTsExport[] = [];

  /* find all `export default|class|const|let|var|enum|type|interface|function|function*` */
  const matches1 = getMatches(individualExportRegexps, content);
  matches1?.forEach((match) => {
    const [exportedName] = match;
    res.push({
      name: exportedName,
      path: undefined,
    });
  });

  /* find all `export const|let|var {name1, name2: bar}` */
  const matches2 = getMatches(destructuredExportsRegexps, content);
  matches2?.forEach((match) => {
    const [exportedNames] = match;
    const exportedNamesWithoutColon = removeSpaces(
      exportedNames.replace(varNameColonRe, '')
    );
    res.push({
      name: exportedNamesWithoutColon,
      path: undefined,
    });
  });

  /* find all `export {variable1 as name1, variable2 as default, variable3} from "module-name"` */
  const matches3 = getMatches(exportListRegexps, content);
  matches3?.forEach((match) => {
    const [exportedNames] = match;
    const names = removeSpaces(
      exportedNames.replace(varNameAsRe, '').replace(typePrefixingTypeRe, '')
    );
    res.push({
      name: names,
      path: undefined,
    });
  });

  /* find all `export * as name from "module-name"` */
  const matches4 = getMatches(aggregatedExportsRegexps, content);
  matches4?.forEach((match) => {
    const [exportedName, fromPath] = match;
    const exportedNameWithoutAs = removeSpaces(
      exportedName.replace(starAsRe, '')
    );
    res.push({
      name: exportedNameWithoutAs,
      path: exportedNameWithoutAs === '*' ? fromPath : undefined,
    });
  });

  return res;
}

function getMatches(
  regexps: RegExp[],
  content: string,
  fixRe?: RegExp
): string[][] | undefined {
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
        if (r && fixRe) {
          r = r.replace(fixRe, '');
        }

        return r;
      });
      arr.push(match);
    }
  });
  return arr.length === 0 ? undefined : arr;
}

function isShowIgnoredExportsEnabled(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get('findUnusedExports.showIgnoredExports', false);
}

const reCommentExport =
  /\/\/\s*find-unused-exports:ignore-next-line-exports\b.*\r?\nexport\b.*/gm;
const reCommentMultiLine = /\/\*.*?\*\//gs;
const reCommentSingleLine = /\/\/.*/g;
const reStringBacktick = /`[^`]+`/g;
function fixContent(content: string): string {
  let newContent = content;
  if (isShowIgnoredExportsEnabled() === false) {
    newContent = newContent.replace(reCommentExport, '');
  }

  return newContent
    .replace(reCommentMultiLine, '')
    .replace(reCommentSingleLine, '')
    .replace(reStringBacktick, '');
}
