import { TTsParsed } from './parsedFiles';

export async function getOnlyUsefullFiles(
  files: TTsParsed[]
): Promise<TTsParsed[]> {
  return files.filter(
    (file) => isNotEmpty(file.imports) || isNotEmpty(file.exports)
  );
}

const isNotEmpty = (arr?: unknown[]): boolean => (arr ? arr.length > 0 : false);
