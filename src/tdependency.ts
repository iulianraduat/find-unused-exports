import * as path from 'path';
import * as vscode from 'vscode';

export enum DEPENDENCY_TYPE {
  FILE,
  UNUSED_EXPORT,
  CIRCULAR_IMPORT,
  EMPTY,
}

export class TDependency extends vscode.TreeItem {
  constructor(
    public readonly parent: TDependency | undefined,
    public readonly id: string,
    private readonly type: DEPENDENCY_TYPE,
    public readonly label: string,
    private readonly isCompletelyUnused: boolean,
    public readonly notUsedExports: string[] | undefined,
    public readonly circularImports: string[] | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.description = this.isCompletelyUnused ? 'not used' : '';
    this.tooltip = this.getTooltip(type);
    this.iconPath = this.getIconPath(type);
    this.contextValue = this.getContextValue();
  }

  public clone(isExpanded: boolean) {
    return new TDependency(
      this.parent,
      this.id + (isExpanded ? '_expanded' : '_collapsed'),
      this.type,
      this.label,
      this.isCompletelyUnused,
      this.notUsedExports,
      this.circularImports,
      isExpanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
      this.command
    );
  }

  private getIconPath(type: DEPENDENCY_TYPE) {
    const icon: string = this.getIconName(type);
    return {
      light: path.join(__filename, '..', '..', 'resources', 'light', icon),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', icon),
    };
  }

  private getIconName(type: DEPENDENCY_TYPE) {
    switch (type) {
      case DEPENDENCY_TYPE.FILE:
        return 'dependency.svg';
      case DEPENDENCY_TYPE.UNUSED_EXPORT:
        return 'export.svg';
      case DEPENDENCY_TYPE.CIRCULAR_IMPORT:
        return 'circle.svg';
      case DEPENDENCY_TYPE.EMPTY:
        return 'dependency.svg';
    }
  }

  private getTooltip(type: DEPENDENCY_TYPE) {
    switch (type) {
      case DEPENDENCY_TYPE.FILE:
        return undefined;
      case DEPENDENCY_TYPE.UNUSED_EXPORT:
        return 'not used export';
      case DEPENDENCY_TYPE.CIRCULAR_IMPORT:
        return 'circular import';
      case DEPENDENCY_TYPE.EMPTY:
        return '';
    }
  }

  private getContextValue(): string {
    switch (this.type) {
      case DEPENDENCY_TYPE.FILE:
        return this.isCompletelyUnused ? 'fileNotUsed' : 'file';
      case DEPENDENCY_TYPE.UNUSED_EXPORT:
        return 'notUsedExport';
      case DEPENDENCY_TYPE.CIRCULAR_IMPORT:
        return 'circularImport';
      case DEPENDENCY_TYPE.EMPTY:
        return 'noUnusedExports';
    }
  }
}
