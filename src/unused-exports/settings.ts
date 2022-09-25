import * as vscode from 'vscode';

export function areMainExportsUsed(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get('findUnusedExports.considerMainExportsUsed', false);
}

export function isResultExpanded(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get('findUnusedExports.defaultResultExpanded', false);
}
