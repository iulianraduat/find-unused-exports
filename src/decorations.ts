import { DecorationOptions, Range, TextDocument, TextEditor, ThemeColor, window, workspace } from 'vscode'
import { Core } from './core'
import { TNotUsed } from './unused-exports/notUsed'

export class UnusedExportsDecorator {
  private decorationType = window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('editorWarning.background'),
    color: new ThemeColor('editorWarning.foreground'),
    fontStyle: 'italic',
    opacity: '0.6',
    textDecoration: 'underline wavy',
    overviewRulerColor: new ThemeColor('editorWarning.foreground'),
    overviewRulerLane: 2,
  })

  private cores: Core[]
  private activeEditor: TextEditor | undefined

  constructor(cores: Core[]) {
    this.cores = cores
    this.activeEditor = window.activeTextEditor

    window.onDidChangeActiveTextEditor((editor) => {
      this.activeEditor = editor
      this.updateDecorations()
    })

    workspace.onDidChangeTextDocument((event) => {
      if (this.activeEditor && event.document === this.activeEditor.document) {
        this.updateDecorations()
      }
    })

    this.updateDecorations()
  }

  public updateDecorations(): void {
    if (!this.activeEditor) {
      return
    }

    const document = this.activeEditor.document
    const filePath = document.fileName

    const core = this.findCoreForFile(filePath)
    if (!core) {
      return
    }

    const unusedExportsData = this.getUnusedExportsForFile(core, filePath)
    if (!unusedExportsData?.notUsedExports) {
      this.activeEditor.setDecorations(this.decorationType, [])
      return
    }

    const decorations: DecorationOptions[] = []

    for (const unusedExport of unusedExportsData.notUsedExports) {
      const ranges = this.findExportInDocument(document, unusedExport)
      for (const range of ranges) {
        decorations.push({
          range,
          hoverMessage: `⚠️ Unused export: "${unusedExport}"\n\nThis export is not imported or used anywhere in the project`,
        })
      }
    }

    this.activeEditor.setDecorations(this.decorationType, decorations)
  }

  private findCoreForFile(filePath: string): Core | undefined {
    return this.cores.find((core) => {
      const workspaceRoot = core.getOverviewContext().pathToPrj
      return filePath.startsWith(workspaceRoot)
    })
  }

  private getUnusedExportsForFile(core: Core, filePath: string): TNotUsed | undefined {
    const unusedExportsData = core.getFilesData(0)
    const workspaceRoot = core.getOverviewContext().pathToPrj
    const relativePath = filePath.replace(workspaceRoot, '').replace(/^[/\\]/, '')

    return unusedExportsData.find((data) => {
      const dataPath = data.filePath.replace(/^[/\\]/, '')
      return dataPath === relativePath
    })
  }

  private findExportInDocument(document: TextDocument, exportName: string): Range[] {
    const ranges: Range[] = []

    // Simple line-by-line search
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i)
      const text = line.text

      // Look for the export name in lines that start with 'export'
      if (text.trim().startsWith('export')) {
        const nameIndex = text.indexOf(exportName)
        if (nameIndex !== -1) {
          // Make sure it's a word boundary (not part of another word)
          const beforeChar = nameIndex > 0 ? text[nameIndex - 1] : ' '
          const afterChar = nameIndex + exportName.length < text.length ? text[nameIndex + exportName.length] : ' '

          if (/\s|[({=:,]/.test(beforeChar) && /\s|[)}=:,;(]/.test(afterChar)) {
            const startPos = line.range.start.with(i, nameIndex)
            const endPos = line.range.start.with(i, nameIndex + exportName.length)
            ranges.push(new Range(startPos, endPos))
          }
        }
      }
    }

    return ranges
  }

  public dispose(): void {
    this.decorationType.dispose()
  }
}
