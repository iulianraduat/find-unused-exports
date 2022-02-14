'use strict';

import * as vscode from 'vscode';
import { CircularImportsProvider } from './circularImports';
import { Common } from './common';
import { OverviewProvider } from './overview';
import { TDependency } from './tdependency';
import { log, showOutputWindow } from './unused-exports/log';
import { UnusedExportsProvider } from './unusedExports';

// find-unused-exports:ignore-next-line-exports
export const activate = (context: vscode.ExtensionContext) => {
  const workspaceRoot = vscode.workspace.rootPath;
  if (!workspaceRoot) {
    vscode.window.showInformationMessage('We cannot check an empty workspace!');
    return;
  }

  const overviewProvider = new OverviewProvider();
  vscode.window.registerTreeDataProvider('overview', overviewProvider);

  const common = new Common(workspaceRoot, overviewProvider);

  const unusedExportsProvider = new UnusedExportsProvider(common);
  vscode.window.registerTreeDataProvider('unusedExports', unusedExportsProvider);

  const circularImportsProvider = new CircularImportsProvider(common);
  vscode.window.registerTreeDataProvider('circularImports', circularImportsProvider);

  let disposable: vscode.Disposable;
  disposable = vscode.commands.registerCommand('unusedExports.refresh', () => common.refresh());
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.showOutput', () => showOutputWindow());
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.expandAllUnusedExports', () => {
    unusedExportsProvider.expandAll();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.collapseAllUnusedExports', () => {
    unusedExportsProvider.collapseAll();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.expandAllCircularImports', () => {
    circularImportsProvider.expandAll();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.collapseAllCircularImports', () => {
    circularImportsProvider.collapseAll();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.enableCircularImports', () => {
    vscode.workspace
      .getConfiguration()
      .update('findUnusedExports.detectCircularImports', true)
      /* Unfortunatelly without setTimeout refresh() still uses the old value */
      .then(() => setTimeout(() => common.refresh(), 0));
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.disableCircularImports', () => {
    vscode.workspace
      .getConfiguration()
      .update('findUnusedExports.detectCircularImports', false)
      /* Unfortunatelly without setTimeout refresh() still uses the old value */
      .then(() => setTimeout(() => common.refresh(), 0));
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.openFile', (filePath: string) => common.open(filePath));
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.hideFileOrExport', (node: TDependency) =>
    unusedExportsProvider.hideFileOrExport(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.hideFile', (node: TDependency) =>
    circularImportsProvider.hideFile(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.deleteFile', (node: TDependency) =>
    unusedExportsProvider.deleteFile(workspaceRoot, node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.findInFile',
    (filePath: string, unusedExportOrCircularImport: string) =>
      common.findInFile(filePath, unusedExportOrCircularImport)
  );
  context.subscriptions.push(disposable);
};
