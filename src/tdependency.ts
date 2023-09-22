import * as path from 'path';
import * as vscode from 'vscode';
import { Core } from './core';

export enum DependencyType {
  FOLDER,
  FILE,
  UNUSED_EXPORT,
  CIRCULAR_IMPORT,
  EMPTY,
  DISABLED,
  REFRESH,
}

export class TDependency extends vscode.TreeItem {
  public absFilePath?: string;
  public children?: TDependency[];
  private _core?: Core;

  constructor(
    public readonly parent: TDependency | undefined,
    public id: string,
    public readonly type: DependencyType,
    public readonly label: string,
    private readonly isCompletelyUnused?: boolean,
    public readonly notUsedExports?: string[],
    public readonly circularImports?: string[],
    public collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.description = this.getDescription();
    this.tooltip = this.getTooltip();
    this.iconPath = this.getIconName();
    this.contextValue = this.getContextValue();
  }

  public clone(isExpanded: boolean) {
    if (this.children === undefined) {
      return this;
    }

    this.id = this.id + (isExpanded ? 1 : 0);
    this.collapsibleState = isExpanded
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
    return this;
  }

  public addChild(child: TDependency) {
    if (this.children === undefined) {
      this.children = [];
    }

    this.children.push(child);
  }

  private getDescription() {
    switch (this.type) {
      case DependencyType.FOLDER:
        return '';
      case DependencyType.FILE:
        return this.isCompletelyUnused ? 'not used' : '';
      default:
        return undefined;
    }
  }

  private getIconName() {
    switch (this.type) {
      case DependencyType.FOLDER:
        return new vscode.ThemeIcon('folder-opened');
      case DependencyType.FILE:
        return this.getIconPath('dependency.svg');
      case DependencyType.UNUSED_EXPORT:
        return this.getIconPath('export.svg');
      case DependencyType.CIRCULAR_IMPORT:
        return this.getIconPath('circle.svg');
      case DependencyType.EMPTY:
        return new vscode.ThemeIcon('check');
      case DependencyType.DISABLED:
        return new vscode.ThemeIcon('circle-large-outline');
      case DependencyType.REFRESH:
        return new vscode.ThemeIcon('refresh');
    }
  }

  private getIconPath(icon: string) {
    return {
      light: path.join(__filename, '..', '..', 'resources', 'light', icon),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', icon),
    };
  }

  private getTooltip() {
    switch (this.type) {
      case DependencyType.FOLDER:
        return this.core?.getOverviewContext().pathToPrj;
      case DependencyType.UNUSED_EXPORT:
        return 'not used export';
      case DependencyType.CIRCULAR_IMPORT:
        return 'circular import';
      default:
        return undefined;
    }
  }

  private getContextValue(): string | undefined {
    switch (this.type) {
      case DependencyType.FOLDER:
        return 'folder';
      case DependencyType.FILE:
        return this.isCompletelyUnused ? 'fileNotUsed' : 'file';
      case DependencyType.UNUSED_EXPORT:
        return 'notUsedExport';
      case DependencyType.CIRCULAR_IMPORT:
        return 'circularImport';
      default:
        return 'nothingFound';
    }
  }

  set core(value: Core | undefined) {
    this._core = value;
    this.tooltip = this.getTooltip();
  }

  get core() {
    return this._core;
  }
}
