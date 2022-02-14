import * as vscode from 'vscode';

interface OverviewContext {
  errors?: string[];
  filesHavingImportsOrExports: number;
  foundCircularImports: number;
  globExclude?: string[];
  globInclude?: string[];
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
    errors: [],
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

  public update(overviewContext: Omit<OverviewContext, 'errors' | 'globExclude' | 'globInclude' | 'lastRun'>): void {
    this.overviewContext = {
      ...overviewContext,
      errors: this.overviewContext.errors,
      globExclude: this.overviewContext.globExclude,
      globInclude: this.overviewContext.globInclude,
      lastRun: new Date(),
    };
    this._onDidChangeTreeData.fire(undefined);
  }

  public updateFieldError(error: string): void {
    this.overviewContext.errors?.push(error);
    this._onDidChangeTreeData.fire(undefined);
  }

  public updateFieldsGlob(globInclude?: string[], globExclude?: string[]): void {
    this.overviewContext.globInclude = globInclude;
    this.overviewContext.globExclude = globExclude;
    this._onDidChangeTreeData.fire(undefined);
  }

  public getTreeItem(element: TOverviewEntry): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TOverviewEntry): Thenable<TOverviewEntry[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const rows = [
      this.map2DateTime('lastRun', 'Last run', 'calendar'),
      this.map2OverviewEntry('processedFiles', 'Processed files', 'files'),
      this.map2OverviewEntry('filesHavingImportsOrExports', 'Files having imports|exports', 'files'),
      this.map2OverviewEntry('totalImports', 'Total imports', 'info'),
      this.map2OverviewEntry('totalExports', 'Total exports', 'info'),
      this.map2OverviewEntry('notUsedExports', 'Not used exports', 'info'),
      this.map2OverviewEntry('foundCircularImports', 'Found circular imports', 'info'),
      this.map2OverviewEntry('totalEllapsedTime', 'Total ellapsed time (ms)', 'watch'),
    ];

    this.overviewContext.globInclude?.forEach((globInclude) =>
      rows.push(this.map2LabelValueIcon('Include', globInclude, 'file-text'))
    );
    this.overviewContext.globExclude?.forEach((globExclude) =>
      rows.push(this.map2LabelValueIcon('Exclude', globExclude, 'file-text'))
    );

    this.overviewContext.errors?.forEach((error) => rows.push(this.map2LabelValueIcon('Warning', error, 'alert')));

    return Promise.resolve(rows);
  }

  private map2DateTime(key: keyof OverviewContext, label: string, icon?: string): TOverviewEntry {
    const dt = this.overviewContext[key] as Date;
    return new TOverviewEntry(`${label}: ${dt.toISOString()}`, icon);
  }

  private map2LabelValueIcon(label: string, globPath: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(`${label}: ${globPath}`, icon);
  }

  private map2OverviewEntry(key: keyof OverviewContext, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(`${label}: ${this.overviewContext[key]}`, icon);
  }
}

class TOverviewEntry extends vscode.TreeItem {
  constructor(label: string, icon?: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    if (icon) {
      this.iconPath = new vscode.ThemeIcon(icon);
    }
  }
}
