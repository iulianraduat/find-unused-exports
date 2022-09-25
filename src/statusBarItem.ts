import * as vscode from 'vscode';

let sbItem: vscode.StatusBarItem;

export function initStatusBarItem() {
  sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  sbItem.command = 'unusedExports.refreshAndShowSideView';
  idleStatusBarItem();
  sbItem.show();
}

export function disposeStatusBarItem() {
  sbItem.hide();
  sbItem.dispose();
}

export function spinStatusBarItem() {
  sbItem.text = '$(loading~spin) Find unused exports';
  sbItem.tooltip = 'Refreshing list of unused exports (and circular imports)';
  sbItem.show();
}

export function idleStatusBarItem() {
  sbItem.text = '$(check) Find unused exports';
  sbItem.tooltip =
    'Click to refresh the list of unused exports (and circular imports) and see the side view';
  sbItem.show();
}
