import * as vscode from 'vscode';
import { Core, OverviewContext } from './core';
import { isResultExpanded } from './unused-exports/settings';

export class OverviewProvider implements vscode.TreeDataProvider<TOverviewEntry> {
  private _onDidChangeTreeData: vscode.EventEmitter<TOverviewEntry | undefined> = new vscode.EventEmitter<
    TOverviewEntry | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TOverviewEntry | undefined> = this._onDidChangeTreeData.event;

  constructor(private cores: Core[]) {}

  public redraw(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  public getTreeItem(element: TOverviewEntry): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TOverviewEntry): Thenable<TOverviewEntry[]> {
    if (element?.type === OverviewEntryType.FOLDER) {
      return this.getChildFile(element);
    }

    if (element) {
      return Promise.resolve([]);
    }

    const contexts = this.cores.map((core) => core.getOverviewContext());
    const rows = contexts.map(
      (ctx) => new TOverviewEntry(OverviewEntryType.FOLDER, ctx.workspaceName, 'folder-opened', ctx.info, ctx)
    );

    return Promise.resolve(rows);
  }

  public getChildFile(element: TOverviewEntry): Thenable<TOverviewEntry[]> {
    const ctx = element.ctx;

    if (!ctx) {
      return Promise.resolve([]);
    }

    const rows = [
      this.map2DateTime(ctx.lastRun, 'Last run', 'calendar'),
      this.map2OverviewEntry(ctx.processedFiles, 'Processed files', 'files'),
      this.map2OverviewEntry(ctx.filesHavingImportsOrExports, 'Files having imports|exports', 'files'),
      this.map2OverviewEntry(ctx.totalImports, 'Total imports', 'info'),
      this.map2OverviewEntry(ctx.totalExports, 'Total exports', 'info'),
      this.map2OverviewEntry(ctx.notUsedExports, 'Not used exports', 'info'),
      this.map2OverviewEntry(ctx.foundCircularImports, 'Found circular imports', 'info'),
      this.map2OverviewEntry(ctx.totalEllapsedTime, 'Total ellapsed time (ms)', 'watch'),
      this.map2OverviewEntry(ctx.pathToPrj, "Project's root", 'folder-opened'),
    ];

    ctx.globInclude?.forEach((globInclude) =>
      rows.push(this.map2LabelValueIcon('Include', globInclude, 'file-text', ctx.countGlobInclude[globInclude] || 0))
    );

    ctx.globExclude?.forEach((globExclude, index) =>
      rows.push(
        this.map2LabelValueIcon(
          'Exclude',
          globExclude,
          'file-text',
          ctx.numDefaultExclude && index < ctx.numDefaultExclude ? 'default' : undefined
        )
      )
    );

    ctx.errors?.forEach((error) => rows.push(this.map2LabelValueIcon('Warning', error, 'alert')));

    return Promise.resolve(rows);
  }

  private map2DateTime(dt: Date, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${dt.toISOString()}`, icon);
  }

  private map2LabelValueIcon(
    label: string,
    globPath: string,
    icon: string | undefined,
    description?: string | number
  ): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${globPath}`, icon, description);
  }

  private map2OverviewEntry(value: string | number, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${value}`, icon);
  }
}

class TOverviewEntry extends vscode.TreeItem {
  constructor(
    public type: OverviewEntryType,
    label: string,
    icon?: string,
    description?: string | number,
    public ctx?: OverviewContext
  ) {
    super(label, getCollapsibleState(type, description));

    if (icon) {
      this.iconPath = new vscode.ThemeIcon(icon);
    }
    if (description !== undefined) {
      this.description = `${description}`;
    }
    if (type === OverviewEntryType.FOLDER && ctx?.pathToPrj !== undefined) {
      this.tooltip = ctx.pathToPrj;
    }
    if (type === OverviewEntryType.FOLDER && ctx?.pathToPrj !== undefined) {
      this.contextValue = 'folder';
    }
  }
}

function getCollapsibleState(type: OverviewEntryType, description?: string | number): vscode.TreeItemCollapsibleState {
  if (type !== OverviewEntryType.FOLDER) {
    return vscode.TreeItemCollapsibleState.None;
  }

  /* A description means there is no package.json */
  if (description) {
    return vscode.TreeItemCollapsibleState.Collapsed;
  }

  return isResultExpanded() ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
}

enum OverviewEntryType {
  FOLDER,
  OVERVIEW,
}
