import * as path from 'path';
import * as vscode from 'vscode';
import { Core, FileDataType } from './core';
import { Provider } from './provider';
import { DependencyType, TDependency } from './tdependency';
import { TNotUsed } from './unused-exports/notUsed';
import { pathResolve } from './unused-exports/fsUtils';

export class UnusedExportsProvider extends Provider {
  constructor(cores: Core[]) {
    super(
      cores,
      undefined,
      FileDataType.UNUSED_EXPORTS,
      mapFile2Dependency,
      getNoUnusedExports,
      true
    );
  }
}

function mapFile2Dependency(
  parent: TDependency,
  node: TNotUsed,
  collapsibleState: vscode.TreeItemCollapsibleState,
  isNotHidden: (node: TDependency) => boolean
): TDependency {
  const { filePath, isCompletelyUnused, notUsedExports } = node;

  const pathToPrj = parent.core?.getOverviewContext().pathToPrj;
  const absFilePath = pathToPrj ? pathResolve(pathToPrj, filePath) : filePath;

  const row = new TDependency(
    parent,
    `${parent.id}::${filePath}`,
    DependencyType.FILE,
    filePath,
    isCompletelyUnused,
    notUsedExports,
    undefined,
    collapsibleState,
    {
      command: 'unusedExports.openFile',
      title: 'Open',
      arguments: [absFilePath],
    }
  );
  row.absFilePath = absFilePath;
  row.children = unusedExportsInFile(row, isNotHidden);
  return row;
}

function unusedExportsInFile(
  parent: TDependency,
  isNotHidden: (node: TDependency) => boolean
): TDependency[] {
  const mapFn = mapUnusedExport2Dependency(parent);
  return parent.notUsedExports?.map(mapFn).filter(isNotHidden) ?? [];
}

function mapUnusedExport2Dependency(parent: TDependency) {
  return (notUsedExport: string): TDependency => {
    return new TDependency(
      parent,
      `${parent.id}::${notUsedExport}`,
      DependencyType.UNUSED_EXPORT,
      notUsedExport,
      false,
      undefined,
      undefined,
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'unusedExports.findInFile',
        title: 'Find the unused export in file',
        arguments: [parent.absFilePath, notUsedExport],
      }
    );
  };
}

function getNoUnusedExports(core: Core) {
  return new TDependency(
    undefined,
    core.getOverviewContext().workspaceName + '::NoUnusedExports',
    DependencyType.EMPTY,
    'No unused exports'
  );
}
