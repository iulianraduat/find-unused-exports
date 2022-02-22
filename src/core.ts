import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { app } from './unused-exports/app';
import { TNotUsed } from './unused-exports/notUsed';

const cacheFiles: Record<string, TNotUsed[]> = {};
const listeners: Record<string, Array<(updatedCore: Core) => void>> = {};

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

  private doAnalyse() {
    new Promise(async (resolve) => {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath) === false) {
        this.overviewContext.info = 'No package.json found in workspace';
        return;
      }

      /* We use the catched values */
      if (cacheFiles[this.workspaceRoot]) {
        return;
      }

      const files = app(this.workspaceRoot, this.overviewContext);
      cacheFiles[this.workspaceRoot] = files;

      resolve(undefined);
    });
  }

  public registerListener(listener: (core: Core) => void) {
    if (listeners[this.workspaceRoot] === undefined) {
      listeners[this.workspaceRoot] = [];
    }
    listeners[this.workspaceRoot].push(listener);
  }

  public async refresh() {
    delete cacheFiles[this.workspaceRoot];
    await this.doAnalyse();
    listeners[this.workspaceRoot].forEach((listener) => listener(this));
  }

  public getOverviewContext() {
    return this.overviewContext;
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

export interface OverviewContext {
  countGlobInclude: Record<string, number>;
  errors?: string[];
  filesHavingImportsOrExports: number;
  foundCircularImports: number;
  globExclude?: string[];
  globInclude?: string[];
  info?: string;
  lastRun: Date;
  notUsedExports: number;
  numDefaultExclude?: number;
  pathToPrj: string;
  processedFiles: number;
  totalEllapsedTime: number;
  totalExports: number;
  totalImports: number;
  workspaceName: string;
}
