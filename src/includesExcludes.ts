import {
  Event,
  EventEmitter,
  ProviderResult,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode'
import { Core, someCoreRefreshing } from './core'
import { Refreshing } from './refreshing'

export class IncludesProvider implements TreeDataProvider<TIncludeExcludeEntry> {
  // eslint-disable-next-line unicorn/prefer-event-target
  private _onDidChangeTreeData: EventEmitter<TIncludeExcludeEntry | undefined | null> = new EventEmitter<
    TIncludeExcludeEntry | undefined | null
  >()
  public readonly onDidChangeTreeData: Event<TIncludeExcludeEntry | undefined | null> = this._onDidChangeTreeData.event

  constructor(private cores: Core[]) {
    for (const core of cores) core.registerListener(this.refresh)
  }

  public refresh = () => {
    this._onDidChangeTreeData.fire(null)
  }

  public getParent(): ProviderResult<TIncludeExcludeEntry> {
    return null
  }

  public getTreeItem(element: TIncludeExcludeEntry): TreeItem {
    return element
  }

  public getChildren(): Thenable<TIncludeExcludeEntry[]> {
    const someRefreshing = someCoreRefreshing(this.cores)
    if (someRefreshing) {
      return Promise.resolve([Refreshing as TIncludeExcludeEntry])
    }

    const items: TIncludeExcludeEntry[] = []

    for (const core of this.cores) {
      const context = core.getOverviewContext()
      if (context.globInclude) {
        for (const globInclude of context.globInclude) {
          const count = context.countGlobInclude[globInclude] || 0
          items.push(new TIncludeExcludeEntry(globInclude, 'file-text', count))
        }
      }
    }

    return Promise.resolve(items)
  }
}

export class ExcludesProvider implements TreeDataProvider<TIncludeExcludeEntry> {
  // eslint-disable-next-line unicorn/prefer-event-target
  private _onDidChangeTreeData: EventEmitter<TIncludeExcludeEntry | undefined | null> = new EventEmitter<
    TIncludeExcludeEntry | undefined | null
  >()
  public readonly onDidChangeTreeData: Event<TIncludeExcludeEntry | undefined | null> = this._onDidChangeTreeData.event

  constructor(private cores: Core[]) {
    for (const core of cores) core.registerListener(this.refresh)
  }

  public refresh = () => {
    this._onDidChangeTreeData.fire(null)
  }

  public getParent(): ProviderResult<TIncludeExcludeEntry> {
    return null
  }

  public getTreeItem(element: TIncludeExcludeEntry): TreeItem {
    return element
  }

  public getChildren(): Thenable<TIncludeExcludeEntry[]> {
    const someRefreshing = someCoreRefreshing(this.cores)
    if (someRefreshing) {
      return Promise.resolve([Refreshing as TIncludeExcludeEntry])
    }

    const items: TIncludeExcludeEntry[] = []

    for (const core of this.cores) {
      const context = core.getOverviewContext()
      if (context.globExclude) {
        for (const [index, globExclude] of context.globExclude.entries()) {
          const isDefault = context.numDefaultExclude && index < context.numDefaultExclude
          items.push(new TIncludeExcludeEntry(globExclude, 'file-text', isDefault ? 'default' : undefined))
        }
      }
    }

    return Promise.resolve(items)
  }
}

class TIncludeExcludeEntry extends TreeItem {
  constructor(label: string, icon?: string, description?: string | number) {
    super(label, TreeItemCollapsibleState.None)

    if (icon) {
      this.iconPath = new ThemeIcon(icon)
    }
    if (description !== undefined) {
      this.description = `${description}`
    }
  }
}
