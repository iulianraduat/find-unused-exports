import {
  commands,
  TreeItemCollapsibleState,
  Uri,
  window,
  workspace,
} from 'vscode';
import { Core, FileDataType } from './core';
import { Provider } from './provider';
import { DependencyType, TDependency } from './tdependency';
import { pathResolve } from './unused-exports/fsUtils';
import { TNotUsed } from './unused-exports/notUsed';

export class UnusedExportsProvider extends Provider {
  constructor(cores: Core[]) {
    super(
      cores,
      undefined,
      FileDataType.UNUSED_EXPORTS,
      mapFile2Dependency,
      getNoUnusedExports,
      true
    );
  }

  public async refresh() {
    super.refresh();

    if (!this.cacheFolders?.length) {
      commands.executeCommand(
        'setContext',
        'showSaveAllUnusedExportsButton',
        false
      );
      return;
    }

    const entries = await this.getChildren(this.cacheFolders[0]);
    commands.executeCommand(
      'setContext',
      'showSaveAllUnusedExportsButton',
      entries.length > 0 && entries[0].type !== DependencyType.EMPTY
    );
  }

  public async saveAll() {
    const filename = await this.askForFilenameCsvJson();
    if (!filename || !this.cacheFolders?.length) {
      return;
    }

    const entries = await this.getChildren(this.cacheFolders[0]);
    if (!entries.length) {
      return;
    }

    if (filename.fsPath.endsWith('csv')) {
      this.saveAllInCsv(filename, entries);
    } else {
      this.saveAllInJson(filename, entries);
    }
  }

  private async saveAllInCsv(filename: Uri, entries: TDependency[]) {
    const lines: string[] = ['filepath,unused exported'];

    for (const item of entries) {
      const exports = await this.getChildren(item);
      for (const { label } of exports) {
        lines.push(`${item.label},${label}`);
      }
    }

    const csv = lines.join('\n');
    const data = new TextEncoder().encode(csv);
    await workspace.fs.writeFile(filename, data);
    window.showInformationMessage('CSV written successfully');
  }

  private async saveAllInJson(filename: Uri, entries: TDependency[]) {
    const json: Record<string, string[]> = {};

    for (const item of entries) {
      const exports = await this.getChildren(item);
      json[item.label] = exports.map(({ label }) => label);
    }

    const content = JSON.stringify(json, null, 2);
    const data = new TextEncoder().encode(content);
    await workspace.fs.writeFile(filename, data);
    window.showInformationMessage('JSON written successfully');
  }

  private async askForFilenameCsvJson() {
    if (!this.cacheFolders) {
      window.showInformationMessage('No unused exports');
      return;
    }

    const filename = await window.showSaveDialog({
      saveLabel: 'Export unused exports',
      filters: {
        'CSV Files': ['csv'],
        'JSON Files': ['json'],
      },
    });

    if (!filename) {
      // window.showWarningMessage('No filename provided');
      return;
    }

    return filename;
  }
}

function mapFile2Dependency(
  parent: TDependency,
  node: TNotUsed,
  collapsibleState: TreeItemCollapsibleState,
  isNotHidden: (node: TDependency) => boolean
): TDependency {
  const { filePath, isCompletelyUnused, notUsedExports } = node;

  const pathToPrj = parent.core?.getOverviewContext().pathToPrj;
  const absFilePath = pathToPrj ? pathResolve(pathToPrj, filePath) : filePath;

  const row = new TDependency(
    parent,
    `${parent.id}::${filePath}`,
    DependencyType.FILE,
    filePath,
    isCompletelyUnused,
    notUsedExports,
    undefined,
    collapsibleState,
    {
      command: 'unusedExports.openFile',
      title: 'Open',
      arguments: [absFilePath],
    }
  );
  row.absFilePath = absFilePath;
  row.children = unusedExportsInFile(row, isNotHidden);
  return row;
}

function unusedExportsInFile(
  parent: TDependency,
  isNotHidden: (node: TDependency) => boolean
): TDependency[] {
  const mapFn = mapUnusedExport2Dependency(parent);
  return parent.notUsedExports?.map(mapFn).filter(isNotHidden) ?? [];
}

function mapUnusedExport2Dependency(parent: TDependency) {
  return (notUsedExport: string): TDependency => {
    return new TDependency(
      parent,
      `${parent.id}::${notUsedExport}`,
      DependencyType.UNUSED_EXPORT,
      notUsedExport,
      false,
      undefined,
      undefined,
      TreeItemCollapsibleState.None,
      {
        command: 'unusedExports.findInFile',
        title: 'Find the unused export in file',
        arguments: [parent.absFilePath, notUsedExport],
      }
    );
  };
}

function getNoUnusedExports(core: Core) {
  return new TDependency(
    undefined,
    core.getOverviewContext().workspaceName + '::NoUnusedExports',
    DependencyType.EMPTY,
    'No unused exports'
  );
}
