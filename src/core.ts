import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { OverviewContext } from './overviewContext';
import { app } from './unused-exports/app';
import { TNotUsed } from './unused-exports/notUsed';

const cacheFiles: Record<string, TNotUsed[]> = {};
const listeners: Record<string, Array<() => void>> = {};

export class Core {
  private overviewContext: OverviewContext = {
    countGlobInclude: {},
    errors: [],
    filesHavingImportsOrExports: 0,
    foundCircularImports: 0,
    lastRun: new Date(),
    notUsedExports: 0,
    pathToPrj: '',
    processedFiles: 0,
    totalEllapsedTime: 0,
    totalExports: 0,
    totalImports: 0,
    workspaceName: '',
  };

  constructor(workspaceName: string, private workspaceRoot: string) {
    this.overviewContext.workspaceName = workspaceName;
    this.overviewContext.pathToPrj = workspaceRoot;
    this.doAnalyse();
  }

  private doAnalyse(): Promise<TNotUsed[] | undefined> {
    this.overviewContext.lastRun = new Date();

    return new Promise((resolve) => {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath) === false) {
        this.overviewContext.info = 'No package.json found in workspace';
        resolve(undefined);
        return;
      }

      /* We use the catched values */
      if (cacheFiles[this.workspaceRoot]) {
        resolve(cacheFiles[this.workspaceRoot]);
        return;
      }

      const files = app(this.workspaceRoot, this.overviewContext);
      cacheFiles[this.workspaceRoot] = files;
      resolve(files);
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

  public getOverviewContext() {
    return this.overviewContext;
  }

  public getFilesData(type: FileDataType): TNotUsed[] {
    const cache = cacheFiles[this.workspaceRoot];
    if (cache === undefined) {
      return [];
    }

    switch (type) {
      case FileDataType.CIRCULAR_IMPORTS:
        return cache.filter((node) =>
          this.isListNotEmpty(node.circularImports)
        );
      case FileDataType.UNUSED_EXPORTS:
        return cache.filter((node) => this.isListNotEmpty(node.notUsedExports));
    }
  }

  private isListNotEmpty(list?: string[]) {
    if (list === undefined) {
      return false;
    }

    return list.length > 0;
  }

  /* utility functions */

  public static open(filePath: string): void {
    vscode.workspace.openTextDocument(filePath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  }

  public static findInFile(
    filePath: string,
    unusedExportOrCircularImport: string
  ): void {
    vscode.workspace.openTextDocument(filePath).then((doc) => {
      vscode.window.showTextDocument(doc).then(() => {
        const editor: vscode.TextEditor | undefined =
          vscode.window.activeTextEditor;
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

export enum FileDataType {
  UNUSED_EXPORTS,
  CIRCULAR_IMPORTS,
}
