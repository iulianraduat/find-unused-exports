import * as vscode from 'vscode';

interface OverviewContext {
  countGlobInclude: Record<string, number>;
  errors?: string[];
  filesHavingImportsOrExports: number;
  foundCircularImports: number;
  globExclude?: string[];
  globInclude?: string[];
  lastRun: Date;
  notUsedExports: number;
  numDefaultExclude?: number;
  pathToPrj: string;
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
    countGlobInclude: {},
    errors: [],
    filesHavingImportsOrExports: 0,
    foundCircularImports: 0,
    lastRun: new Date(),
    notUsedExports: 0,
    pathToPrj: '',
    processedFiles: 0,
    totalEllapsedTime: 0,
    totalExports: 0,
    totalImports: 0,
  };

  constructor() {}

  public update(
    overviewContext: Omit<
      OverviewContext,
      'countGlobInclude' | 'errors' | 'globExclude' | 'globInclude' | 'lastRun' | 'numDefaultExclude' | 'pathToPrj'
    >
  ): void {
    this.overviewContext = {
      ...overviewContext,
      countGlobInclude: this.overviewContext.countGlobInclude,
      errors: this.overviewContext.errors,
      globExclude: this.overviewContext.globExclude,
      globInclude: this.overviewContext.globInclude,
      lastRun: new Date(),
      numDefaultExclude: this.overviewContext.numDefaultExclude,
      pathToPrj: this.overviewContext.pathToPrj,
    };
    this._onDidChangeTreeData.fire(undefined);
  }

  public updateFieldError(error: string): void {
    this.overviewContext.errors?.push(error);
    this._onDidChangeTreeData.fire(undefined);
  }

  public updateFieldsGlob(
    pathToPrj: string,
    globInclude?: string[],
    globExclude?: string[],
    numDefaultExclude?: number
  ): void {
    this.overviewContext.pathToPrj = pathToPrj;
    this.overviewContext.globInclude = globInclude?.map((globPath) => this.getAdjustedPath(pathToPrj, globPath));
    this.overviewContext.globExclude = globExclude?.map((globPath) => this.getAdjustedPath(pathToPrj, globPath));
    this.overviewContext.numDefaultExclude = numDefaultExclude;
    this._onDidChangeTreeData.fire(undefined);
  }

  public updateFieldCountGlobInclude(pathToPrj: string, globPath: string, count: number) {
    const key = this.getAdjustedPath(pathToPrj, globPath);
    this.overviewContext.countGlobInclude[key] = count;
    this._onDidChangeTreeData.fire(undefined);
  }

  /* We want to have path relative to projects root */
  private getAdjustedPath(pathToPrj: string, globPath: string) {
    return globPath.replace(pathToPrj, '');
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
      this.map2OverviewEntry('pathToPrj', "Project's root", 'folder-opened'),
    ];

    this.overviewContext.globInclude?.forEach((globInclude) =>
      rows.push(
        this.map2LabelValueIcon(
          'Include',
          globInclude,
          'file-text',
          this.overviewContext.countGlobInclude[globInclude] || 0
        )
      )
    );
    this.overviewContext.globExclude?.forEach((globExclude, index) =>
      rows.push(
        this.map2LabelValueIcon(
          'Exclude',
          globExclude,
          'file-text',
          this.overviewContext.numDefaultExclude && index < this.overviewContext.numDefaultExclude
            ? 'default'
            : undefined
        )
      )
    );

    this.overviewContext.errors?.forEach((error) => rows.push(this.map2LabelValueIcon('Warning', error, 'alert')));

    return Promise.resolve(rows);
  }

  private map2DateTime(key: keyof OverviewContext, label: string, icon?: string): TOverviewEntry {
    const dt = this.overviewContext[key] as Date;
    return new TOverviewEntry(`${label}: ${dt.toISOString()}`, icon);
  }

  private map2LabelValueIcon(
    label: string,
    globPath: string,
    icon: string | undefined,
    description?: string | number
  ): TOverviewEntry {
    return new TOverviewEntry(`${label}: ${globPath}`, icon, description);
  }

  private map2OverviewEntry(key: keyof OverviewContext, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(`${label}: ${this.overviewContext[key]}`, icon);
  }
}

class TOverviewEntry extends vscode.TreeItem {
  constructor(label: string, icon?: string, description?: string | number) {
    super(label, vscode.TreeItemCollapsibleState.None);

    if (icon) {
      this.iconPath = new vscode.ThemeIcon(icon);
    }
    if (description !== undefined) {
      this.description = `${description}`;
    }
  }
}
