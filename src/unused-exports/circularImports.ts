import * as vscode from 'vscode';
import { log } from './log';
import { TNotUsed } from './notUsed';
import { TRelation, TRelationImport } from './relations';

interface TImport {
  path: string;
  imports?: string[];
}

export function detectCircularImports(
  relations: TRelation[],
  nodes: TNotUsed[]
): TNotUsed[] {
  if (isCircularImportsEnabled() === false) {
    return nodes;
  }

  let countCircularImports = 0;

  const mapImports: Record<string, string[]> = {};
  const onlyImports = parseForImports(relations).filter(hasImports);
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

function isCircularImportsEnabled(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get('findUnusedExports.detectCircularImports', true);
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

function hasImports(anImport: TImport): boolean {
  return anImport.imports !== undefined && anImport.imports.length > 0;
}

function checkForCircularImport(
  nodes: TNotUsed[],
  path: string,
  mapImports: Record<string, string[]>
) {
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
