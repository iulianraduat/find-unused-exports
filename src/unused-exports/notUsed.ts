import { TRelation } from './relations'
import { isResultExpanded } from './settings'

export async function getNotUsed(relations: TRelation[]): Promise<TNotUsed[]> {
  const nodes: TNotUsed[] = []

  relations.forEach((rel) => {
    const { exports, path } = rel
    const isLeaking: boolean = exports?.notUsed !== undefined

    if (isLeaking === false) {
      return
    }

    const isCompletelyUnused: boolean = isLeaking
      ? exports?.used?.length === undefined || exports?.used?.length === 0
      : false

    const notUsedExports = exports?.notUsed?.sort()

    const node: TNotUsed = {
      filePath: path,
      isCompletelyUnused,
      isExpanded: isResultExpanded(),
      notUsedExports,
    }
    nodes.push(node)
  })
  return nodes
}

export const sortNotUsedFn = (a: TNotUsed, b: TNotUsed): number => a.filePath.localeCompare(b.filePath)

export interface TNotUsed {
  circularImports?: string[]
  filePath: string
  isCompletelyUnused: boolean
  isExpanded: boolean
  notUsedExports?: string[]
}
