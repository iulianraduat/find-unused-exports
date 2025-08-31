import { accessSync } from 'fs';
import { join as pathJoin } from 'path';
import {
  commands,
  Selection,
  TextDocument,
  TextEditor,
  window,
  workspace,
} from 'vscode';
import { OverviewContext } from './overviewContext';
import { app } from './unused-exports/app';
import { TNotUsed } from './unused-exports/notUsed';

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

  private cacheFiles?: TNotUsed[];
  private listeners: Array<(ready: boolean) => void> = [];
  private lockRefresh: boolean = false;

  constructor(workspaceName: string, private workspaceRoot: string) {
    this.overviewContext.workspaceName = workspaceName;
    this.overviewContext.pathToPrj = workspaceRoot;
  }

  public registerListener(listener: (ready: boolean) => void) {
    if (!this.listeners) {
      this.listeners = [];
    }
    this.listeners.push(listener);
  }

  public async refresh() {
    if (this.lockRefresh) {
      return;
    }

    // We announce all listeners that we refresh
    this.lockRefresh = true;
    this.cacheFiles = undefined;
    this.listeners.forEach((listener) => listener(false));
    await this.doAnalyse();
    // It must happen before we inform the listeners otherwise isRefreshing is returning true
    this.lockRefresh = false;
    this.listeners.forEach((listener) => listener(true));
  }

  public isRefreshing() {
    return this.lockRefresh;
  }

  private doAnalyse(): Promise<TNotUsed[] | undefined> {
    this.overviewContext.lastRun = new Date();

    return new Promise(async (resolve) => {
      const packageJsonPath = pathJoin(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath) === false) {
        this.overviewContext.info = 'No package.json found in workspace';
        resolve(undefined);
        return;
      }

      /* We use the catched values */
      if (this.cacheFiles) {
        resolve(this.cacheFiles);
        return;
      }

      const files = await app(this.workspaceRoot, this.overviewContext);
      this.cacheFiles = files;
      resolve(files);
    });
  }

  public getOverviewContext() {
    return this.overviewContext;
  }

  public getFilesData(type: FileDataType): TNotUsed[] {
    const cache = this.cacheFiles ?? [];

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
    workspace.openTextDocument(filePath).then((doc) => {
      window.showTextDocument(doc);
    });
  }

  public static findInFile(
    filePath: string,
    unusedExportOrCircularImport: string
  ): void {
    workspace.openTextDocument(filePath).then((doc) => {
      window.showTextDocument(doc).then(() => {
        const editor: TextEditor | undefined = window.activeTextEditor;
        const document: TextDocument | undefined = editor?.document;
        if (editor === undefined || document === undefined) {
          return;
        }

        const num = document.lineCount;
        for (let i = 0; i < num; i++) {
          const line = document.lineAt(i);
          if (line.text.includes(unusedExportOrCircularImport)) {
            const start = line.text.indexOf(unusedExportOrCircularImport);
            const end = start + unusedExportOrCircularImport.length;
            editor.selection = new Selection(i, start, i, end);
            break;
          }
        }
        commands.executeCommand('actions.find');
      });
    });
  }

  private pathExists(p: string): boolean {
    try {
      accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}

export function someCoreRefreshing(cores: Array<Core>) {
  return cores.some((core) => core.isRefreshing());
}

export enum FileDataType {
  UNUSED_EXPORTS,
  CIRCULAR_IMPORTS,
}
