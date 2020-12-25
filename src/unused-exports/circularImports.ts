import * as vscode from 'vscode';
import { log } from './log';
import { TNotUsed } from './notUsed';
import { TRelation, TRelationImport } from './relations';

interface TImport {
  path: string;
  imports?: string[];
}

export function detectCircularImports(relations: TRelation[], nodes: TNotUsed[]): TNotUsed[] {
  if (isCircularImportsEnabled() === false) {
    return nodes;
  }

  let prevRelations = relations;
  while (true) {
    const newRelations = optimizeRelations(prevRelations);
    if (newRelations.length === prevRelations.length) {
      break;
    }
    prevRelations = newRelations;
  }

  let countCircularImports = 0;

  const mapImports: Record<string, string[]> = {};
  const onlyImports = parseForImports(prevRelations);
  onlyImports.forEach((anImport) => {
    const { path, imports } = anImport;
    mapImports[path] = imports!;
  });

  onlyImports.forEach((anImport) => {
    const wasFound = checkForCircularImport(nodes, anImport.path, mapImports);
    if (wasFound) {
      countCircularImports++;
    }
  });

  log('Found circular imports', countCircularImports);
  return nodes;
}

function optimizeRelations(relations: TRelation[]): TRelation[] {
  return relations
    .map((rel) => hasRelationImports(rel, relations))
    .filter((rel) => rel !== undefined && hasRelationExports(rel)) as TRelation[];
}

function hasRelationImports(relation: TRelation, relations: TRelation[]): TRelation | undefined {
  const { imports } = relation;
  if (imports === undefined || imports.length === 0) {
    return undefined;
  }

  relation.imports = imports.filter((imp) => stillExists(imp.path, relations));
  if (relation.imports.length === 0) {
    return undefined;
  }

  return relation;
}

function hasRelationExports(relation: TRelation): boolean {
  const { exports } = relation;
  if (exports === undefined || exports.used === undefined || exports.used.length === 0) {
    return false;
  }

  return true;
}

function stillExists(path: string, relations: TRelation[]): boolean {
  return relations.findIndex((rel) => rel.path === path) >= 0;
}

function isCircularImportsEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.detectCircularImports', false);
}

function parseForImports(relations: TRelation[]): TImport[] {
  return relations.map(getImportsForRelation);
}

function getImportsForRelation(relation: TRelation): TImport {
  return {
    path: relation.path,
    imports: relation.imports?.filter(hasPath).map(getPath),
  };
}

function hasPath(relImport: TRelationImport): boolean {
  return relImport.path !== '';
}

function getPath(relImport: TRelationImport): string {
  return relImport.path;
}

function checkForCircularImport(nodes: TNotUsed[], path: string, mapImports: Record<string, string[]>) {
  const circularImportsPath = hasCircularImport([], path, mapImports, path);
  if (circularImportsPath === undefined) {
    return false;
  }

  /* remove the first entry as it is the same as path */
  circularImportsPath.shift();

  if (circularImportsPath.length === 0) {
    return false;
  }

  const foundNode = nodes.find((n) => n.filePath === path);
  if (foundNode) {
    foundNode.circularImports = circularImportsPath;
    return true;
  }

  nodes.push({
    filePath: path,
    isCompletelyUnused: false,
    circularImports: circularImportsPath,
  });
  return true;
}

function hasCircularImport(
  visited: string[],
  path: string,
  mapImports: Record<string, string[]>,
  forPath: string
): string[] | undefined {
  /* we have circular imports in a child */
  if (visited.includes(path)) {
    return;
  }

  const imports = mapImports[path];
  if (imports === undefined) {
    return;
  }

  const newVisited = [...visited, path];
  if (imports.indexOf(forPath) >= 0) {
    return newVisited;
  }

  let mVisited: string[] | undefined = undefined;
  return imports.findIndex((impPath) => {
    mVisited = hasCircularImport(newVisited, impPath, mapImports, forPath);
    return mVisited !== undefined;
  }) >= 0
    ? mVisited
    : undefined;
}
