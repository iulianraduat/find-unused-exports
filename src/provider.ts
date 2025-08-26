import { unlink } from 'fs'
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from 'vscode'
import { Core, FileDataType, someCoreRefreshing } from './core'
import { Refreshing } from './refreshing'
import { DependencyType, TDependency } from './tdependency'
import { TNotUsed } from './unused-exports/notUsed'
import { isResultExpanded } from './unused-exports/settings'
import { addToIgnoreFilenames } from './unused-exports/vscUtils'

export class Provider implements TreeDataProvider<TDependency> {
  /* We need to have it also undefined as an empty array means that the user removed all entries */
  private cacheFolders: TDependency[] | undefined
  private cacheHidden: string[]
  private dependencyType: DependencyType

  protected isNotHidden = (node: TDependency): boolean => {
    return this.cacheHidden.includes(node.id) === false
  }

  private _onDidChangeTreeData: EventEmitter<TDependency | undefined> = new EventEmitter<TDependency | undefined>()
  public readonly onDidChangeTreeData: Event<TDependency | undefined> = this._onDidChangeTreeData.event

  constructor(
    private cores: Core[],
    private getNodeIfDisabled: (() => TDependency | undefined) | undefined,
    private fileDataType: FileDataType,
    private mapFile2Dependency: (
      parent: TDependency,
      node: TNotUsed,
      collapsibleState: TreeItemCollapsibleState,
      isNotHidden: (node: TDependency) => boolean,
    ) => TDependency,
    private getNoResultsNode: (core: Core) => TDependency,
    private allowCollapseRoot: boolean,
  ) {
    this.cacheHidden = []
    this.dependencyType = getDependencyTypeFrom(fileDataType)

    cores.forEach((core) => core.registerListener(this.refresh))
  }

  public refresh = () => {
    this.cacheHidden = []

    const someRefreshing = someCoreRefreshing(this.cores)
    if (someRefreshing) {
      this.cacheFolders = [Refreshing]
      this._onDidChangeTreeData.fire(undefined)
      return
    }

    const node = this.getNodeIfDisabled?.()
    if (node) {
      this.cacheFolders = [node]
      this._onDidChangeTreeData.fire(undefined)
      return
    }

    /* we need to give a chance to VSCode to update the status bar */
    const collapsibleState = isResultExpanded() ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed

    /* We add the folders */
    this.cacheFolders = this.cores.map((core) => {
      const node = new TDependency(
        undefined,
        core.getOverviewContext().workspaceName,
        DependencyType.FOLDER,
        core.getOverviewContext().workspaceName,
        false,
        undefined,
        undefined,
        collapsibleState,
      )
      node.core = core
      return node
    })

    /* We add the files */
    this.cacheFolders.forEach((folder) => {
      folder.children = this.getFiles(folder)
    })

    this.cacheHidden = []
    this._onDidChangeTreeData.fire(undefined)
  }

  private getFiles(parent: TDependency): TDependency[] | undefined {
    const core = parent.core
    if (core === undefined) {
      return
    }

    const files = core.getFilesData(this.fileDataType)

    if (files.length === 0) {
      return [this.getNoResultsNode(core)]
    }

    const collapsibleState = isResultExpanded() ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed
    const rows = files
      .map((file) => this.mapFile2Dependency(parent, file, collapsibleState, this.isNotHidden))
      .filter(this.isNotHidden)
    return rows
  }

  public ignoreFile(node: TDependency): void {
    if (!node.absFilePath) {
      return
    }

    addToIgnoreFilenames(node.absFilePath)

    /* We also need to hide it now */
    this.hideFileOrExport(node)
  }

  public hideFileOrExport(node: TDependency): void {
    /* Strange enough, node can also be undefined */
    if (node === undefined || this.cacheFolders === undefined) {
      return
    }

    if (node.parent === undefined) {
      this.cacheFolders = this.cacheFolders.filter((folder) => folder.id !== node.id)
      this._onDidChangeTreeData.fire(undefined)
      return
    }

    node.parent.children = node.parent.children?.filter((file) => file.id !== node.id)

    /* If there is no longer a child of the expected type for this provider then we remove the file too */
    const hideParentNode = this.getHideParentNode(node.parent.children)
    if (hideParentNode && node.parent.parent) {
      const parentNodeId = node.parent.id
      node.parent.parent.children = node.parent.parent.children?.filter((file) => file.id !== parentNodeId)
    }

    /* For the case that we have only one folder displayed and its root is hidden */
    if (node.parent.parent === undefined && this.cacheFolders?.length === 1) {
      this._onDidChangeTreeData.fire(undefined)
      return
    }

    this._onDidChangeTreeData.fire(hideParentNode ? undefined : node.parent)
  }

  public deleteFile(node: TDependency): void {
    const filePath = node.absFilePath
    if (filePath === undefined) {
      return
    }

    unlink(filePath, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        window.showInformationMessage(`Cannot delete ${filePath}`)
        return
      }

      this.hideFileOrExport(node)
    })
  }

  public expandAll() {
    this.setExpandForAll(true)
  }

  public collapseAll() {
    this.setExpandForAll(false)
  }

  private setExpandForAll(isExpanded: boolean) {
    if (this.cacheFolders === undefined) {
      return
    }

    this.cacheFolders = this.cacheFolders.map((folder) => {
      folder.children = folder.children?.map((file) => file.clone(isExpanded))
      return folder.clone(isExpanded)
    })

    /* As a folder has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined)
  }

  /* TreeDataProvider specific functions */

  public getParent(element: TDependency) {
    return element.parent
  }

  public getTreeItem(element: TDependency): TreeItem {
    return element
  }

  public getChildren(element?: TDependency): Thenable<TDependency[]> {
    if (element?.children) {
      return Promise.resolve(element?.children)
    }

    /* If we are in a workspace automaticaly created by VSCode for a folder or a workspace with only one folder we skip one level */
    if (this.allowCollapseRoot && this.cacheFolders?.length === 1 && this.cacheFolders?.[0].children) {
      return Promise.resolve(this.cacheFolders[0].children)
    }

    return Promise.resolve(this.cacheFolders ?? [])
  }

  private getHideParentNode(children: TDependency[] | undefined) {
    if (children === undefined) {
      return false
    }

    if (children.length === 0) {
      return true
    }

    return children.some((child) => child.type === this.dependencyType) === false
  }
}

function getDependencyTypeFrom(fileDataType: FileDataType): DependencyType {
  switch (fileDataType) {
    case FileDataType.UNUSED_EXPORTS:
      return DependencyType.UNUSED_EXPORT
    case FileDataType.CIRCULAR_IMPORTS:
      return DependencyType.CIRCULAR_IMPORT
    default:
      return DependencyType.DISABLED
  }
}
