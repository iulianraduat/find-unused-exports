import { TTsParsed } from './parsedFiles'

export async function getOnlyUsefullFiles(files: TTsParsed[]): Promise<TTsParsed[]> {
  return files.filter((file) => isNotEmpty(file.imports) || isNotEmpty(file.exports))
}

const isNotEmpty = (array?: unknown[]): boolean => (array ? array.length > 0 : false)
