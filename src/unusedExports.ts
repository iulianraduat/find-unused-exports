import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Core } from './core';
import { DEPENDENCY_TYPE, TDependency } from './tdependency';
import { TNotUsed } from './unused-exports/notUsed';
import { isResultExpanded } from './unused-exports/settings';

/* We need to have it also undefined as an empty array means that the user removed all entries */
let cacheFiles: TDependency[] | undefined;
let cacheHidden: string[] = [];

function isNotHidden(node: TDependency): boolean {
  return cacheHidden.includes(node.id) === false;
}

export class UnusedExportsProvider implements vscode.TreeDataProvider<TDependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<TDependency | undefined> = new vscode.EventEmitter<
    TDependency | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TDependency | undefined> = this._onDidChangeTreeData.event;

  constructor(private common: Core) {
    common.registerListener(this.refresh.bind(this));
  }

  public refresh(): void {
    cacheFiles = undefined;
    cacheHidden = [];
    this._onDidChangeTreeData.fire(undefined);
  }

  public hideFileOrExport(node: TDependency): void {
    /* Strange enough, node can also be undefined */
    if (node === undefined || cacheFiles === undefined) {
      return;
    }

    if (node.parent === undefined) {
      /* We need to remove the file directly in cache to avoid a change of the expanse/collapse */
      cacheFiles = cacheFiles.filter((file) => file.id !== node.id);

      /* as a file has nothing as parent we need to provide null to fire() */
      this._onDidChangeTreeData.fire(undefined);
      return;
    }

    /* we want to hide it in TreeView without doing any refresh */
    cacheHidden.push(node.id);

    this._onDidChangeTreeData.fire(node.parent);
  }

  public deleteFile(rootPath: string, node: TDependency): void {
    const relFilePath = node.label;
    const filePath: string = path.resolve(rootPath, relFilePath);

    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        vscode.window.showInformationMessage(`Cannot delete ${relFilePath}`);
        return;
      }

      this.hideFileOrExport(node);
    });
  }

  public expandAll() {
    if (cacheFiles === undefined) {
      return;
    }

    cacheFiles = cacheFiles.map((file) => file.clone(true));

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  public collapseAll() {
    if (cacheFiles === undefined) {
      return;
    }

    cacheFiles = cacheFiles.map((file) => file.clone(false));

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  /* TreeDataProvider specific functions */

  public getParent(element: TDependency) {
    return element.parent;
  }

  public getTreeItem(element: TDependency): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TDependency): Thenable<TDependency[]> {
    if (element) {
      return Promise.resolve(this.unusedExportsInFile(element));
    }

    return Promise.resolve(this.getFiles());
  }

  private getFiles(): TDependency[] {
    if (cacheFiles) {
      return cacheFiles;
    }

    const files = this.common.getUnusedExports();

    if (files.length === 0) {
      return [NoUnusedExports];
    }

    cacheFiles = files.map(this.mapFile2Dependency).filter(isNotHidden);
    return cacheFiles;
  }

  private mapFile2Dependency(node: TNotUsed): TDependency {
    const { filePath, isCompletelyUnused, notUsedExports } = node;

    const collapsibleState = isResultExpanded()
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    const cmd = {
      command: 'unusedExports.openFile',
      title: 'Open',
      arguments: [filePath],
    };

    return new TDependency(
      undefined,
      filePath,
      DEPENDENCY_TYPE.FILE,
      filePath,
      isCompletelyUnused,
      notUsedExports,
      undefined,
      collapsibleState,
      cmd
    );
  }

  private unusedExportsInFile(node: TDependency): TDependency[] {
    const mapFn = this.mapUnusedExport2Dependency(node);
    return node.notUsedExports?.map(mapFn).filter(isNotHidden) ?? [];
  }

  private mapUnusedExport2Dependency(node: TDependency) {
    const filePath: string = node.label;
    return (notUsedExport: string): TDependency => {
      return new TDependency(
        node,
        `${filePath}::${notUsedExport}`,
        DEPENDENCY_TYPE.UNUSED_EXPORT,
        notUsedExport,
        false,
        undefined,
        undefined,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'unusedExports.findInFile',
          title: 'Find the unused export in file',
          arguments: [filePath, notUsedExport],
        }
      );
    };
  }
}

const NoUnusedExports: TDependency = new TDependency(
  undefined,
  '-',
  DEPENDENCY_TYPE.EMPTY,
  'No unused exports',
  false,
  undefined,
  undefined,
  vscode.TreeItemCollapsibleState.None
);
