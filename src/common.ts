import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { OverviewProvider } from './overview';
import { app } from './unused-exports/app';
import { TNotUsed } from './unused-exports/notUsed';

const cacheFiles: Record<string, TNotUsed[]> = {};
const listeners: Record<string, Array<() => void>> = {};

export class Common {
  constructor(private workspaceRoot: string, private overviewProvider: OverviewProvider) {
    this.doAnalyse();
  }

  private doAnalyse() {
    new Promise(async (resolve) => {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath) === false) {
        vscode.window.showInformationMessage('No package.json found in workspace');
        return;
      }

      /* We use the catched values */
      if (cacheFiles[this.workspaceRoot]) {
        return;
      }

      const files = app(this.workspaceRoot, this.overviewProvider);
      cacheFiles[this.workspaceRoot] = files;

      resolve(undefined);
    });
  }

  public registerListener(listener: () => void) {
    if (listeners[this.workspaceRoot] === undefined) {
      listeners[this.workspaceRoot] = [];
    }
    listeners[this.workspaceRoot].push(listener);
  }

  public async refresh() {
    delete cacheFiles[this.workspaceRoot];
    await this.doAnalyse();
    listeners[this.workspaceRoot].forEach((listener) => listener());
  }

  public getUnusedExports(): TNotUsed[] {
    return (
      cacheFiles[this.workspaceRoot]?.filter((node) => node.notUsedExports && node.notUsedExports.length > 0) ?? []
    );
  }

  public getCircularImports(): TNotUsed[] {
    return (
      cacheFiles[this.workspaceRoot]?.filter((node) => node.circularImports && node.circularImports.length > 0) ?? []
    );
  }

  /* utility functions */

  public open(filePath: string): void {
    vscode.workspace.openTextDocument(path.resolve(this.workspaceRoot, filePath)).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }

  public findInFile(filePath: string, unusedExportOrCircularImport: string): void {
    vscode.workspace.openTextDocument(path.resolve(this.workspaceRoot, filePath)).then((doc) => {
      vscode.window.showTextDocument(doc).then(() => {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        const document: vscode.TextDocument | undefined = editor?.document;
        if (editor === undefined || document === undefined) {
          return;
        }

        const num = document.lineCount;
        for (let i = 0; i < num; i++) {
          const line = document.lineAt(i);
          if (line.text.includes(unusedExportOrCircularImport)) {
            const start = line.text.indexOf(unusedExportOrCircularImport);
            const end = start + unusedExportOrCircularImport.length;
            editor.selection = new vscode.Selection(i, start, i, end);
            break;
          }
        }
        vscode.commands.executeCommand('actions.find');
      });
    });
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}
