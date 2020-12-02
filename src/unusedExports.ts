import { TNotUsed } from './unused-exports/notUsed';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { app } from './unused-exports/app';
import { log } from './unused-exports/log';

const cacheFiles: Record<string, TNotUsed[]> = {};
const cacheHidden: Record<string, string[]> = {};

function addToCacheHidden(workspaceRoot: string, node: TDependency) {
  if (cacheHidden[workspaceRoot] === undefined) {
    cacheHidden[workspaceRoot] = [];
  }
  cacheHidden[workspaceRoot].push(node.key);
}

function isInCacheHidden(workspaceRoot: string, node: TDependency): boolean {
  if (cacheHidden[workspaceRoot] === undefined) {
    return false;
  }

  return cacheHidden[workspaceRoot].includes(node.key);
}

export class UnusedExportsProvider implements vscode.TreeDataProvider<TDependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<TDependency | undefined> = new vscode.EventEmitter<
    TDependency | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TDependency | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  public refresh(): void {
    delete cacheFiles[this.workspaceRoot];
    delete cacheHidden[this.workspaceRoot];
    this._onDidChangeTreeData.fire(undefined);
  }

  public open(filePath: string): void {
    vscode.workspace.openTextDocument(path.resolve(this.workspaceRoot, filePath)).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }

  public findUnsedExportInFile(filePath: string, unusedExport: string): void {
    vscode.workspace.openTextDocument(path.resolve(this.workspaceRoot, filePath)).then((doc) => {
      vscode.window.showTextDocument(doc).then(() => {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        const document: vscode.TextDocument | undefined = editor?.document;
        if (editor === undefined || document === undefined) {
          return;
        }

        const num = document.lineCount;
        for (let i = 0; i < num; i++) {
          const line = document.lineAt(i);
          if (line.text.includes(unusedExport)) {
            const start = line.text.indexOf(unusedExport);
            const end = start + unusedExport.length;
            editor.selection = new vscode.Selection(i, start, i, end);
            break;
          }
        }
        vscode.commands.executeCommand('actions.find');
      });
    });
  }

  public delete(node: TDependency): void {
    const relFilePath = node.label;
    const filePath: string = path.resolve(this.workspaceRoot, relFilePath);

    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        this.showInformationMessage(`Cannot delete ${relFilePath}`);
        return;
      }

      /* we want to hide it in TreeView without doing any refresh */
      addToCacheHidden(this.workspaceRoot, node);

      /* as a file has nothing as parent we need to provide null to fire() */
      this._onDidChangeTreeData.fire(undefined);
    });
  }

  public hide(node: TDependency): void {
    /* we want to hide it in TreeView without doing any refresh */
    addToCacheHidden(this.workspaceRoot, node);

    /* as a file has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  public getTreeItem(element: TDependency): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TDependency): Thenable<TDependency[]> {
    if (!this.workspaceRoot) {
      return this.noWorkspace();
    }

    if (element) {
      return this.unusedExportsInFile(element);
    }

    return this.filesWithUnusedExports();
  }

  private noWorkspace(): Thenable<TDependency[]> {
    this.showInformationMessage('No dependency checks in an empty workspace!');
    return Promise.resolve([]);
  }

  private unusedExportsInFile(element: TDependency): Thenable<TDependency[]> {
    return Promise.resolve(this.getUnusedExports(element));
  }

  private filesWithUnusedExports(): Thenable<TDependency[]> {
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    if (this.pathExists(packageJsonPath)) {
      return Promise.resolve(this.getFilesWithUnusedExports());
    }

    this.showInformationMessage('Workspace has no package.json');
    return Promise.resolve([]);
  }

  private getFilesWithUnusedExports(): TDependency[] {
    const files = cacheFiles[this.workspaceRoot] || app(this.workspaceRoot);
    cacheFiles[this.workspaceRoot] = files;

    if (files.length === 0) {
      return [NoUnusedExports];
    }

    return files.map(this.mapFile2Dependency).filter(this.isNotDeleted);
  }

  private mapFile2Dependency(node: TNotUsed): TDependency {
    const { filePath, isCompletelyUnused, notUsedExports } = node;
    return new TDependency(
      filePath,
      filePath,
      isCompletelyUnused,
      notUsedExports,
      vscode.TreeItemCollapsibleState.Collapsed,
      {
        command: 'unusedExports.openFile',
        title: 'Open',
        arguments: [filePath],
      },
      node
    );
  }

  private getUnusedExports(node: TDependency): TDependency[] {
    const mapFn = this.mapUnusedExport2Dependency(node);
    return node.notUsedExports?.map(mapFn).filter(this.isNotDeleted) ?? [];
  }

  private mapUnusedExport2Dependency(node: TDependency) {
    const filePath: string = node.label;
    return (notUsedExport: string): TDependency => {
      return new TDependency(
        `${filePath}::${notUsedExport}`,
        notUsedExport,
        false,
        undefined,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'unusedExports.findUnusedExportInFile',
          title: 'Find unused export in file',
          arguments: [filePath, notUsedExport],
        }
      );
    };
  }

  private isNotDeleted = (node: TDependency): boolean => {
    return isInCacheHidden(this.workspaceRoot, node) === false;
  };

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }

  private showInformationMessage(msg: string) {
    vscode.window.showInformationMessage(msg);
  }

  private isNotUsedExportNode(node: TDependency): boolean {
    return node.contextValue === 'notUsedExport';
  }
}

export class TDependency extends vscode.TreeItem {
  constructor(
    public readonly key: string,
    public readonly label: string,
    private isCompletelyUnused: boolean,
    public readonly notUsedExports: string[] | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly notUsedObj?: TNotUsed
  ) {
    super(label, collapsibleState);

    this.description = this.isCompletelyUnused ? 'not used' : '';
    this.iconPath = this.getIconPath();
    this.contextValue = this.getContextValue();
  }

  private getIconPath() {
    const icon = this.isFile() ? 'dependency.svg' : 'export.svg';
    return {
      light: path.join(__filename, '..', '..', 'resources', 'light', icon),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', icon),
    };
  }

  private getContextValue(): string {
    if (this.isFile()) {
      return this.isCompletelyUnused ? 'fileNotUsed' : 'file';
    }

    return 'notUsedExport';
  }

  private isFile(): boolean {
    return this.notUsedExports !== undefined;
  }
}

const NoUnusedExports: TDependency = new TDependency(
  '-',
  'No unused exports',
  false,
  undefined,
  vscode.TreeItemCollapsibleState.None
);
