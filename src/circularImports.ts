import * as path from 'path';
import * as vscode from 'vscode';
import { Core, TFileDataType } from './core';
import { Provider } from './provider';
import { DEPENDENCY_TYPE, TDependency } from './tdependency';
import { isCircularImportsEnabled } from './unused-exports/circularImports';
import { pathResolve } from './unused-exports/fsUtils';
import { TNotUsed } from './unused-exports/notUsed';

export class CircularImportsProvider extends Provider {
  constructor(cores: Core[]) {
    super(
      cores,
      areCircularImportsEnabled,
      TFileDataType.CIRCULAR_IMPORTS,
      mapFile2Dependency,
      getNoCircularImports,
      false
    );
  }
}

function mapFile2Dependency(
  parent: TDependency,
  node: TNotUsed,
  collapsibleState: vscode.TreeItemCollapsibleState
): TDependency {
  const { filePath, circularImports } = node;

  const pathToPrj = parent.core?.getOverviewContext().pathToPrj;
  const absFilePath = resolvePath(pathToPrj, filePath);

  const row = new TDependency(
    parent,
    `${parent.id}::${filePath}`,
    DEPENDENCY_TYPE.FILE,
    filePath,
    false,
    undefined,
    circularImports,
    collapsibleState,
    {
      command: 'unusedExports.findInFile',
      title: 'Find the circular import in file',
      arguments: [absFilePath, getFileBaseName(circularImports?.[0])],
    }
  );
  row.absFilePath = absFilePath;
  row.children = circularImportsInFile(pathToPrj, filePath, row);
  return row;
}

function circularImportsInFile(
  pathToPrj: string | undefined,
  firstPathname: string,
  node: TDependency
): TDependency[] {
  const mapFn = mapCircularImport2Dependency(pathToPrj, firstPathname, node);
  return node.circularImports?.map(mapFn) ?? [];
}

function mapCircularImport2Dependency(
  pathToPrj: string | undefined,
  firstPathname: string,
  parent: TDependency
) {
  return (circularImport: string, index: number): TDependency => {
    const absFilePath = resolvePath(pathToPrj, circularImport);
    const nextImport = getNextImport(
      firstPathname,
      parent.circularImports,
      index
    );

    return new TDependency(
      parent,
      `${parent.id}::${circularImport}`,
      DEPENDENCY_TYPE.CIRCULAR_IMPORT,
      circularImport,
      false,
      undefined,
      undefined,
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'unusedExports.findInFile',
        title: 'Find the circular import in file',
        arguments: [absFilePath, nextImport],
      }
    );
  };
}

function getNextImport(
  firstPathname: string,
  circularImports: string[] | undefined,
  index: number
): string {
  if (circularImports === undefined) {
    return '';
  }

  index++;
  const pathname =
    index < circularImports.length ? circularImports[index] : firstPathname;
  return getFileBaseName(pathname);
}

const regNextImport = /([^\/\\]+)(?:\.[^.]+)$/;
function getFileBaseName(pathname?: string): string {
  if (pathname === undefined) {
    return '';
  }

  return regNextImport.exec(pathname)?.[1] ?? '';
}

function resolvePath(pathToPrj: string | undefined, filePath: string) {
  return pathToPrj ? pathResolve(pathToPrj, filePath) : pathResolve(filePath);
}

function getNoCircularImports(core: Core) {
  return new TDependency(
    undefined,
    core.getOverviewContext().workspaceName + '::NoCircularImports',
    DEPENDENCY_TYPE.EMPTY,
    'No circular imports'
  );
}

function areCircularImportsEnabled(): TDependency | undefined {
  if (isCircularImportsEnabled()) {
    return;
  }

  return new TDependency(
    undefined,
    'NoCircularImportsEnabled',
    DEPENDENCY_TYPE.DISABLED,
    'The detection of circular imports is disabled'
  );
}
