import * as vscode from 'vscode';
import { Common } from './common';
import { DEPENDENCY_TYPE, TDependency } from './tdependency';
import { TNotUsed } from './unused-exports/notUsed';
import { isResultExpanded } from './unused-exports/settings';

let cacheFiles: TDependency[] = [];
let cacheHidden: string[] = [];

function addToCacheHidden(node: TDependency) {
  cacheFiles = [];
  cacheHidden.push(node.id);
}

function isNotHidden(node: TDependency): boolean {
  return cacheHidden.includes(node.id) === false;
}

export class CircularImportsProvider implements vscode.TreeDataProvider<TDependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<TDependency | undefined> = new vscode.EventEmitter<
    TDependency | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TDependency | undefined> = this._onDidChangeTreeData.event;

  constructor(private common: Common) {
    common.registerListener(this.refresh.bind(this));
  }

  public refresh(): void {
    cacheFiles = [];
    cacheHidden = [];
    this._onDidChangeTreeData.fire(undefined);
  }

  public hideFile(node: TDependency): void {
    /* we want to hide it in TreeView without doing any refresh */
    addToCacheHidden(node);

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  public expandAll() {
    cacheFiles = cacheFiles.map((file) => file.clone(true));

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  public collapseAll() {
    cacheFiles = cacheFiles.map((file) => file.clone(false));

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  /* TreeDataProvider specific functions */

  public getTreeItem(element: TDependency): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TDependency): Thenable<TDependency[]> {
    if (element) {
      return Promise.resolve(this.circularImportsInFile(element));
    }

    return Promise.resolve(this.getFiles());
  }

  private getFiles(): TDependency[] {
    if (cacheFiles.length > 0) {
      return cacheFiles;
    }

    const files = this.common.getCircularImports();

    if (files.length === 0) {
      return [NoCircularImports];
    }

    cacheFiles = files.map(this.mapFile2Dependency).filter(isNotHidden);
    return cacheFiles;
  }

  private mapFile2Dependency(node: TNotUsed): TDependency {
    const { filePath, isCompletelyUnused, circularImports } = node;

    const collapsibleState = isResultExpanded()
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    const cmd = {
      command: 'unusedExports.findInFile',
      title: 'Find the circular import in file',
      arguments: [filePath, getFileBaseName(node.circularImports?.[0] || '')],
    };

    return new TDependency(
      undefined,
      filePath,
      DEPENDENCY_TYPE.FILE,
      filePath,
      isCompletelyUnused,
      undefined,
      circularImports,
      collapsibleState,
      cmd
    );
  }

  private circularImportsInFile(node: TDependency): TDependency[] {
    const mapFn = this.mapCircularImport2Dependency(node);
    return node.circularImports?.map(mapFn) ?? [];
  }

  private mapCircularImport2Dependency(node: TDependency) {
    const filePath: string = node.label;
    return (circularImport: string, index: number): TDependency => {
      const nextImport = this.getNextImport(node.label, node.circularImports, index);

      return new TDependency(
        node,
        `${filePath}::${circularImport}`,
        DEPENDENCY_TYPE.CIRCULAR_IMPORT,
        circularImport,
        false,
        undefined,
        undefined,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'unusedExports.findInFile',
          title: 'Find the circular import in file',
          arguments: [circularImport, nextImport],
        }
      );
    };
  }

  private getNextImport(firstPathname: string, circularImports: string[] | undefined, index: number): string {
    if (circularImports === undefined) {
      return '';
    }

    index++;
    const pathname = index < circularImports.length ? circularImports[index] : firstPathname;
    return getFileBaseName(pathname);
  }
}

const NoCircularImports: TDependency = new TDependency(
  undefined,
  '-',
  DEPENDENCY_TYPE.EMPTY,
  'No circular imports',
  false,
  undefined,
  undefined,
  vscode.TreeItemCollapsibleState.None
);

const regNextImport = /([^\/\\]+)(?:\.[^.]+)$/;
function getFileBaseName(pathname: string): string {
  return regNextImport.exec(pathname)![1] ?? '';
}
