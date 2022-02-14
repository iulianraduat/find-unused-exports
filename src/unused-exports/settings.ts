import * as vscode from 'vscode';

export function isResultExpanded(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.defaultResultExpanded', false);
}
