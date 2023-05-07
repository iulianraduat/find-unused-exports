import { TTsParsed } from './parsedFiles';

export const getOnlyUsefullFiles = (files: TTsParsed[]): TTsParsed[] =>
  files.filter((file) => isNotEmpty(file.imports) || isNotEmpty(file.exports));

const isNotEmpty = (arr?: unknown[]): boolean => (arr ? arr.length > 0 : false);
