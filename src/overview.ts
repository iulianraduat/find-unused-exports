import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, workspace } from 'vscode'
import { Core, someCoreRefreshing } from './core'
import { OverviewContext } from './overviewContext'
import { Refreshing } from './refreshing'
import { TDependency } from './tdependency'
import { isResultExpanded } from './unused-exports/settings'

export class OverviewProvider implements TreeDataProvider<TOverviewEntry | TDependency> {
  private _onDidChangeTreeData: EventEmitter<TOverviewEntry | TDependency | undefined> = new EventEmitter<
    TOverviewEntry | undefined
  >()
  public readonly onDidChangeTreeData: Event<TOverviewEntry | TDependency | undefined> = this._onDidChangeTreeData.event

  constructor(private cores: Core[]) {
    cores.forEach((core) => core.registerListener(this.refresh))
  }

  public refresh = () => {
    this._onDidChangeTreeData.fire(undefined)
  }

  public getParent() {
    return undefined
  }

  public getTreeItem(element: TOverviewEntry): TreeItem {
    return element
  }

  public getChildren(element?: TOverviewEntry): Thenable<Array<TOverviewEntry | TDependency>> {
    if (element?.type === OverviewEntryType.FOLDER) {
      return this.getChildFile(element)
    }

    if (element) {
      return Promise.resolve([])
    }

    const someRefreshing = someCoreRefreshing(this.cores)
    if (someRefreshing) {
      return Promise.resolve([Refreshing])
    }

    const rows = this.cores.map((core) => getOverviewNode(core.getOverviewContext()))

    /* If we are in a workspace automaticaly created by VSCode for a folder or a workspace with only one folder we skip one level  */
    if (workspace.workspaceFolders?.length === 1) {
      return this.getChildren(rows[0])
    }

    return Promise.resolve(rows)
  }

  public getChildFile(element: TOverviewEntry): Thenable<TOverviewEntry[]> {
    const ctx = element.ctx

    if (!ctx) {
      return Promise.resolve([])
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
    ]

    ctx.globInclude?.forEach((globInclude) =>
      rows.push(this.map2LabelValueIcon('Include', globInclude, 'file-text', ctx.countGlobInclude[globInclude] || 0)),
    )

    ctx.globExclude?.forEach((globExclude, index) =>
      rows.push(
        this.map2LabelValueIcon(
          'Exclude',
          globExclude,
          'file-text',
          ctx.numDefaultExclude && index < ctx.numDefaultExclude ? 'default' : undefined,
        ),
      ),
    )

    ctx.errors?.forEach((error) => rows.push(this.map2LabelValueIcon('Warning', error, 'alert')))

    return Promise.resolve(rows)
  }

  private map2DateTime(dt: Date, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${dt.toISOString()}`, icon)
  }

  private map2LabelValueIcon(
    label: string,
    globPath: string,
    icon: string | undefined,
    description?: string | number,
  ): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${globPath}`, icon, description)
  }

  private map2OverviewEntry(value: string | number, label: string, icon?: string): TOverviewEntry {
    return new TOverviewEntry(OverviewEntryType.OVERVIEW, `${label}: ${value}`, icon)
  }
}

class TOverviewEntry extends TreeItem {
  constructor(
    public type: OverviewEntryType,
    label: string,
    icon?: string,
    description?: string | number,
    public ctx?: OverviewContext,
  ) {
    super(label, getCollapsibleState(type, description))

    if (icon) {
      this.iconPath = new ThemeIcon(icon)
    }
    if (description !== undefined) {
      this.description = `${description}`
    }
    if (type === OverviewEntryType.FOLDER && ctx?.pathToPrj !== undefined) {
      this.tooltip = ctx.pathToPrj
    }
    if (type === OverviewEntryType.FOLDER && ctx?.pathToPrj !== undefined) {
      this.contextValue = 'folder'
    }
  }
}

function getCollapsibleState(type: OverviewEntryType, description?: string | number): TreeItemCollapsibleState {
  if (type !== OverviewEntryType.FOLDER) {
    return TreeItemCollapsibleState.None
  }

  /* A description means there is no package.json */
  if (description) {
    return TreeItemCollapsibleState.Collapsed
  }

  return isResultExpanded() ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed
}

function getOverviewNode(ctx: OverviewContext): TOverviewEntry {
  return new TOverviewEntry(OverviewEntryType.FOLDER, ctx.workspaceName, 'folder-opened', ctx.info, ctx)
}

enum OverviewEntryType {
  FOLDER,
  OVERVIEW,
}
