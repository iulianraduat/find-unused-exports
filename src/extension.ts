'use strict';

import {
  commands,
  Disposable,
  ExtensionContext,
  window,
  workspace,
} from 'vscode';
import { CircularImportsProvider } from './circularImports';
import { Core } from './core';
import { UnusedExportsDecorator } from './decorations';
import { OverviewProvider } from './overview';
import { TDependency } from './tdependency';
import { showOutputWindow } from './unused-exports/log';
import { UnusedExportsProvider } from './unusedExports';

// find-unused-exports:ignore-next-line-exports
export function activate(context: ExtensionContext) {
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    window.showInformationMessage('We cannot check an empty workspace!');
    return;
  }

  const cores = workspaceFolders.map(
    (wsf) => new Core(wsf.name, wsf.uri.fsPath)
  );

  const overviewProvider = new OverviewProvider(cores);
  window.registerTreeDataProvider('overview', overviewProvider);

  const unusedExportsProvider = new UnusedExportsProvider(cores);
  window.registerTreeDataProvider('unusedExports', unusedExportsProvider);

  const circularImportsProvider = new CircularImportsProvider(cores);
  window.registerTreeDataProvider('circularImports', circularImportsProvider);

  // Initialize unused exports decorator
  const unusedExportsDecorator = new UnusedExportsDecorator(cores);
  context.subscriptions.push(unusedExportsDecorator);

  // Register decorator as listener for each core to update decorations
  cores.forEach((core) => {
    core.registerListener(() => {
      setTimeout(() => unusedExportsDecorator.updateDecorations(), 100);
    })
  })

  let disposable: Disposable;
  disposable = commands.registerCommand('unusedExports.refresh', () =>
    refreshAllCores(cores)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.refreshAndShowSideView',
    () => {
      refreshAllCores(cores);
      commands.executeCommand('unusedExports.focus');
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand('unusedExports.showOutput', () =>
    showOutputWindow()
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.expandAllUnusedExports',
    () => {
      unusedExportsProvider.expandAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.collapseAllUnusedExports',
    () => {
      unusedExportsProvider.collapseAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.expandAllCircularImports',
    () => {
      circularImportsProvider.expandAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.collapseAllCircularImports',
    () => {
      circularImportsProvider.collapseAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.enableCircularImports',
    () => {
      workspace
        .getConfiguration()
        .update('findUnusedExports.detectCircularImports', true)
        .then(() => refreshAllCores(cores));
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.disableCircularImports',
    () => {
      workspace
        .getConfiguration()
        .update('findUnusedExports.detectCircularImports', false)
        .then(() => refreshAllCores(cores));
    }
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.openFile',
    (filePath: string) => Core.open(filePath)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.hideFileOrExport',
    (node: TDependency) => unusedExportsProvider.hideFileOrExport(node)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.ignoreFile',
    (node: TDependency) => unusedExportsProvider.ignoreFile(node)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.hideFile',
    (node: TDependency) => circularImportsProvider.hideFileOrExport(node)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.deleteFile',
    (node: TDependency) => unusedExportsProvider.deleteFile(node)
  );
  context.subscriptions.push(disposable);

  disposable = commands.registerCommand(
    'unusedExports.findInFile',
    (filePath: string, unusedExportOrCircularImport: string) =>
      Core.findInFile(filePath, unusedExportOrCircularImport)
  );
  context.subscriptions.push(disposable);

  refreshAllCores(cores);
}

function refreshAllCores(cores: Core[]) {
  cores.forEach((core) => core.refresh());
}

// find-unused-exports:ignore-next-line-exports
export function deactivate() {}
