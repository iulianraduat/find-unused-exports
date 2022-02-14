import * as vscode from 'vscode';

interface OverviewContext {
  filesHavingImportsOrExports: number;
  foundCircularImports: number;
  lastRun: Date;
  notUsedExports: number;
  processedFiles: number;
  totalEllapsedTime: number;
  totalExports: number;
  totalImports: number;
}

export class OverviewProvider implements vscode.TreeDataProvider<TOverviewEntry> {
  private _onDidChangeTreeData: vscode.EventEmitter<TOverviewEntry | undefined> = new vscode.EventEmitter<
    TOverviewEntry | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TOverviewEntry | undefined> = this._onDidChangeTreeData.event;
  private overviewContext: OverviewContext = {
    filesHavingImportsOrExports: 0,
    foundCircularImports: 0,
    lastRun: new Date(),
    notUsedExports: 0,
    processedFiles: 0,
    totalEllapsedTime: 0,
    totalExports: 0,
    totalImports: 0,
  };

  constructor() {}

  public update(overviewContext: Omit<OverviewContext, 'lastRun'>): void {
    this.overviewContext = { ...overviewContext, lastRun: new Date() };
    this._onDidChangeTreeData.fire(undefined);
  }

  public getTreeItem(element: TOverviewEntry): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TOverviewEntry): Thenable<TOverviewEntry[]> {
    if (element) {
      return Promise.resolve([]);
    }

    return Promise.resolve([
      this.map2DateTime('lastRun', 'Last run'),
      this.map2OverviewEntry('processedFiles', 'Processed files'),
      this.map2OverviewEntry('filesHavingImportsOrExports', 'Files having imports|exports'),
      this.map2OverviewEntry('totalImports', 'Total imports'),
      this.map2OverviewEntry('totalExports', 'Total exports'),
      this.map2OverviewEntry('notUsedExports', 'Not used exports'),
      this.map2OverviewEntry('foundCircularImports', 'Found circular imports'),
      this.map2OverviewEntry('totalEllapsedTime', 'Total ellapsed time (ms)'),
    ]);
  }

  private map2DateTime(key: keyof OverviewContext, label: string): TOverviewEntry {
    const dt = this.overviewContext[key] as Date;
    return new vscode.TreeItem(`${label}: ${dt.toISOString()}`);
  }

  private map2OverviewEntry(key: keyof OverviewContext, label: string): TOverviewEntry {
    return new vscode.TreeItem(`${label}: ${this.overviewContext[key]}`);
  }
}

type TOverviewEntry = vscode.TreeItem;
