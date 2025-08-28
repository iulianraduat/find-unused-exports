import { workspace } from 'vscode'
import { log } from './log'
import { TNotUsed } from './notUsed'
import { TRelation } from './relations'
import { isResultExpanded } from './settings'

export async function detectCircularImports(
  relations: TRelation[],
  nodes: TNotUsed[],
  ts?: number,
): Promise<[TNotUsed[], number]> {
  if (!isCircularImportsEnabled()) {
    return [nodes, 0]
  }

  const optimizedRelations = getOptimizedRelations(relations)
  if (optimizedRelations.length === 0) {
    log('🎯 Found circular imports', 0, ts)
    return [nodes, 0]
  }

  const mapRelations: Record<string, string[]> = array2map4relations(optimizedRelations)
  const cycles = findCirculars(mapRelations)
  addCyclesToNodes(cycles, nodes)

  log('🎯 Found circular imports', cycles.length, ts)
  return [nodes, cycles.length]
}

export function isCircularImportsEnabled() {
  return workspace.getConfiguration().get('findUnusedExports.detectCircularImports', false)
}

/* Relations */

function getOptimizedRelations(relations: TRelation[]): TRelation[] {
  let previousRelations = relations
  while (true) {
    const newRelations = optimizeRelations(previousRelations)
    if (newRelations.length === previousRelations.length) {
      return previousRelations
    }
    previousRelations = newRelations
  }
}

function optimizeRelations(relations: TRelation[]): TRelation[] {
  return relations
    .map((relation) => toRelationImports(relation, relations))
    .filter((relation) => relation !== undefined && hasRelationExports(relation)) as TRelation[]
}

function toRelationImports(relation: TRelation, relations: TRelation[]): TRelation | undefined {
  const { imports } = relation
  if (imports === undefined || imports.length === 0) {
    return undefined
  }

  relation.imports = imports.filter((imp) => stillExists(imp.path, relations))
  if (relation.imports.length === 0) {
    return undefined
  }

  return relation
}

function hasRelationExports(relation: TRelation): boolean {
  const { exports } = relation
  if (exports === undefined || exports.used === undefined || exports.used.length === 0) {
    return false
  }

  return true
}

function stillExists(path: string, relations: TRelation[]): boolean {
  return relations.some((relation) => relation.path === path)
}

function array2map4relations(relations: TRelation[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const relation of relations) {
    map[relation.path] = relation.imports?.map((imp) => imp.path) || []
  }
  return map
}

/* Detection */

function findCirculars(tree: Record<string, string[]>): string[][] {
  const circulars: string[][] = []

  function visit(id: string, used: string[]): void {
    const index = used.indexOf(id)
    if (index !== -1) {
      const circularPath = index === 0 ? used : used.slice(index)
      /* we avoid pushing an array which will be empty in final */
      if (circularPath.length > 1) {
        circulars.push(circularPath)
      }
      return
    }

    if (tree[id] === undefined) {
      return
    }

    used.push(id)

    const deps = tree[id]
    if (!deps) {
      return
    }

    delete tree[id]
    for (const dep of deps) visit(dep, [...used])
  }

  for (const id in tree) {
    visit(id, [])
  }

  return circulars
}

/* cycles to nodes */

function addCyclesToNodes(cycles: string[][], nodes: TNotUsed[]): void {
  for (const c of cycles) addCycleToNodes(c, nodes)
}

function addCycleToNodes(circularImportsPath: string[], nodes: TNotUsed[]): void {
  const path = circularImportsPath.shift()
  if (circularImportsPath.length === 0 || !path) {
    return
  }

  const foundNode = nodes.find((n) => n.filePath === path)
  if (foundNode) {
    foundNode.circularImports = circularImportsPath
    return
  }

  nodes.push({
    circularImports: circularImportsPath,
    filePath: path,
    isCompletelyUnused: false,
    isExpanded: isResultExpanded(),
  })
}
