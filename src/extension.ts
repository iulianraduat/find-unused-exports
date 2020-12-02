'use strict';

import * as vscode from 'vscode';
import { TDependency, UnusedExportsProvider } from './unusedExports';

// find-unused-exports:ignore-next-line-exports
export const activate = (context: vscode.ExtensionContext) => {
  if (!vscode.workspace.rootPath) {
    return;
  }

  const unusedExportsProvider = new UnusedExportsProvider(vscode.workspace.rootPath);

  vscode.window.registerTreeDataProvider('unusedExports', unusedExportsProvider);

  let disposable: vscode.Disposable;
  disposable = vscode.commands.registerCommand('unusedExports.refresh', () => unusedExportsProvider.refresh());
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.openFile', (filePath: string) =>
    unusedExportsProvider.open(filePath)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'unusedExports.findUnusedExportInFile',
    (filePath: string, unusedExport: string) => unusedExportsProvider.findUnsedExportInFile(filePath, unusedExport)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.deleteFile', (node: TDependency) =>
    unusedExportsProvider.delete(node)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('unusedExports.hideFileOrExport', (node: TDependency) =>
    unusedExportsProvider.hide(node)
  );
  context.subscriptions.push(disposable);
};
