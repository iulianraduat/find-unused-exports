import {
  DecorationOptions,
  DecorationRenderOptions,
  Range,
  TextDocument,
  TextEditor,
  ThemeColor,
  window,
  workspace,
} from 'vscode';
import { Core, FileDataType } from './core';
import { TNotUsed } from './unused-exports/notUsed';

const themeWarningFgColor = new ThemeColor('editorWarning.foreground');
const decorationType = window.createTextEditorDecorationType({
  backgroundColor: new ThemeColor('editorWarning.background'),
  color: themeWarningFgColor,
  fontStyle: 'italic',
  opacity: '0.6',
  textDecoration: 'underline wavy',
  textDecorationColor: themeWarningFgColor,
  overviewRulerColor: themeWarningFgColor,
  overviewRulerLane: 2,
} as DecorationRenderOptions);

const settingHighlightUnusedExportsInEditor =
  'findUnusedExports.highlightUnusedExportsInEditor';

export class UnusedExportsDecorator {
  private cores: Core[];
  private activeEditor?: TextEditor;
  private willUpdate?: boolean;

  constructor(cores: Core[]) {
    this.cores = cores;
    this.activeEditor = window.activeTextEditor;

    // We want to see the highlights in the current editor after the extension finds unused exports
    cores.forEach((core) =>
      core.registerListener((ready: boolean) => {
        if (!this.willUpdate && ready) {
          this.willUpdate = true;
          // We queue the execution
          setTimeout(() => this.updateDecorations(), 0);
        }
      })
    );

    window.onDidChangeActiveTextEditor((editor) => {
      this.activeEditor = editor;
      this.updateDecorations(editor);
    });

    workspace.onDidChangeTextDocument((event) => {
      const activeTextEditor = this.activeEditor;

      if (
        event.document === activeTextEditor?.document &&
        event.contentChanges.length > 0 &&
        event.document.isDirty
      ) {
        this.updateDecorations(activeTextEditor);
      }
    });

    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(settingHighlightUnusedExportsInEditor)) {
        this.updateDecorations();
      }
    });

    this.updateDecorations();
  }

  public updateDecorations(editor?: TextEditor): void {
    this.willUpdate = false;

    const target = editor ? [editor] : window.visibleTextEditors;
    for (const activeTextEditor of target) {
      if (!activeTextEditor?.document.fileName) {
        continue;
      }

      if (!isHighlightUnusedExportsInEditorEnabled()) {
        activeTextEditor.setDecorations(decorationType, []);
        continue;
      }

      const document = activeTextEditor.document;
      const filePath = document.fileName;

      const core = this.findCoreForFile(filePath);
      if (!core) {
        continue;
      }

      const unusedExportsData = this.getUnusedExportsForFile(core, filePath);
      if (!unusedExportsData?.notUsedExports) {
        activeTextEditor.setDecorations(decorationType, []);
        continue;
      }

      const decorations: DecorationOptions[] = [];
      for (const unusedExport of unusedExportsData.notUsedExports) {
        this.findExportInDocument(decorations, document, unusedExport);
      }

      activeTextEditor.setDecorations(decorationType, decorations);
    }
  }

  private findCoreForFile(filePath: string): Core | undefined {
    return this.cores.find((core) => {
      const workspaceRoot = core.getOverviewContext().pathToPrj;
      return filePath.startsWith(workspaceRoot);
    });
  }

  private getUnusedExportsForFile(
    core: Core,
    filePath: string
  ): TNotUsed | undefined {
    const unusedExportsData = core.getFilesData(FileDataType.UNUSED_EXPORTS);
    const workspaceRoot = core.getOverviewContext().pathToPrj;
    const relativePath = filePath
      .replace(workspaceRoot, '')
      .replace(/^[/\\]/, '')
      .replace(/\\/g, '/');

    return unusedExportsData.find(({ filePath }) => filePath === relativePath);
  }

  private findExportInDocument(
    decorations: DecorationOptions[],
    document: TextDocument,
    exportName: string
  ) {
    const code = document.getText();
    const reExportName = new RegExp(`(export[^;]+)\\b(${exportName})\\b`);
    const match = reExportName.exec(code);
    if (!match) {
      return;
    }

    const startOffset = match.index + match[1].length;
    const endOffset = startOffset + match[2].length;
    const startPos = document.positionAt(startOffset);
    const endPos = document.positionAt(endOffset);
    const range = new Range(startPos, endPos);
    decorations.push({
      range,
      hoverMessage: `⚠️Unused export: ${exportName}\n\nThis export is not imported anywhere in the project\n\n_(as reported by Find Unused Exports extension)_.`,
    });
    return;
  }

  public dispose(): void {
    decorationType.dispose();
  }
}

function isHighlightUnusedExportsInEditorEnabled(): boolean {
  return workspace
    .getConfiguration()
    .get(settingHighlightUnusedExportsInEditor, false);
}
