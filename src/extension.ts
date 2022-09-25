'use strict';

import * as vscode from 'vscode';
import { CircularImportsProvider } from './circularImports';
import { Core } from './core';
import { OverviewProvider } from './overview';
import { disposeStatusBarItem, initStatusBarItem } from './statusBarItem';
import { TDependency } from './tdependency';
import { showOutputWindow } from './unused-exports/log';
import { UnusedExportsProvider } from './unusedExports';

// find-unused-exports:ignore-next-line-exports
export function activate(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showInformationMessage('We cannot check an empty workspace!');
    return;
  }

  initStatusBarItem();

  const cores = workspaceFolders.map(
    (wsf) => new Core(wsf.name, wsf.uri.fsPath)
  );

  const overviewProvider = new OverviewProvider(cores);
  vscode.window.registerTreeDataProvider('overview', overviewProvider);

  const unusedExportsProvider = new UnusedExportsProvider(cores);
  vscode.window.registerTreeDataProvider(
    'unusedExports',
    unusedExportsProvider
  );

  const circularImportsProvider = new CircularImportsProvider(cores);
  vscode.window.registerTreeDataProvider(
    'circularImports',
    circularImportsProvider
  );

  let disposable: vscode.Disposable;
  disposable = vscode.commands.registerCommand('unusedExports.refresh', () =>
    refreshAllCores(cores)
  );
  context.subscriptions.push(disposable);

  disposable: vscode.Disposable;
  disposable = vscode.commands.registerCommand(
    'unusedExports.refreshAndShowSideView',
    () => {
      refreshAllCores(cores);
      vscode.commands.executeCommand('unusedExports.focus');
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.showOutput', () =>
    showOutputWindow()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.expandAllUnusedExports',
    () => {
      unusedExportsProvider.expandAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.collapseAllUnusedExports',
    () => {
      unusedExportsProvider.collapseAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.expandAllCircularImports',
    () => {
      circularImportsProvider.expandAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.collapseAllCircularImports',
    () => {
      circularImportsProvider.collapseAll();
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.enableCircularImports',
    () => {
      vscode.workspace
        .getConfiguration()
        .update('findUnusedExports.detectCircularImports', true)
        .then(() => refreshAllCores(cores));
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.disableCircularImports',
    () => {
      vscode.workspace
        .getConfiguration()
        .update('findUnusedExports.detectCircularImports', false)
        .then(() => refreshAllCores(cores));
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.openFile',
    (filePath: string) => Core.open(filePath)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.hideFileOrExport',
    (node: TDependency) => unusedExportsProvider.hideFileOrExport(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.hideFile',
    (node: TDependency) => circularImportsProvider.hideFileOrExport(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.deleteFile',
    (node: TDependency) => unusedExportsProvider.deleteFile(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.findInFile',
    (filePath: string, unusedExportOrCircularImport: string) =>
      Core.findInFile(filePath, unusedExportOrCircularImport)
  );
  context.subscriptions.push(disposable);
}

// find-unused-exports:ignore-next-line-exports
export function deactivate() {
  disposeStatusBarItem();
}

function refreshAllCores(cores: Core[]) {
  cores.forEach((core) => core.refresh());
}
