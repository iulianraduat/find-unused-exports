import { vi } from 'vitest'

declare global {
  var mockVSCode: {
    workspace: {
      getConfiguration: ReturnType<typeof vi.fn>
      workspaceFolders: any[]
      onDidChangeConfiguration: ReturnType<typeof vi.fn>
      onDidChangeWorkspaceFolders: ReturnType<typeof vi.fn>
      findFiles: ReturnType<typeof vi.fn>
      openTextDocument: ReturnType<typeof vi.fn>
      getWorkspaceFolder: ReturnType<typeof vi.fn>
      asRelativePath: ReturnType<typeof vi.fn>
      createFileSystemWatcher: ReturnType<typeof vi.fn>
    }
    window: {
      showInformationMessage: ReturnType<typeof vi.fn>
      showWarningMessage: ReturnType<typeof vi.fn>
      showErrorMessage: ReturnType<typeof vi.fn>
      showQuickPick: ReturnType<typeof vi.fn>
      showInputBox: ReturnType<typeof vi.fn>
      createOutputChannel: ReturnType<typeof vi.fn>
      createTreeView: ReturnType<typeof vi.fn>
      registerTreeDataProvider: ReturnType<typeof vi.fn>
      activeTextEditor: any
      onDidChangeActiveTextEditor: ReturnType<typeof vi.fn>
      visibleTextEditors: any[]
      showTextDocument: ReturnType<typeof vi.fn>
    }
    commands: {
      registerCommand: ReturnType<typeof vi.fn>
      executeCommand: ReturnType<typeof vi.fn>
      getCommands: ReturnType<typeof vi.fn>
    }
    languages: {
      createDiagnosticCollection: ReturnType<typeof vi.fn>
      registerCodeActionsProvider: ReturnType<typeof vi.fn>
      registerHoverProvider: ReturnType<typeof vi.fn>
    }
    Uri: {
      file: ReturnType<typeof vi.fn>
      parse: ReturnType<typeof vi.fn>
    }
    Range: ReturnType<typeof vi.fn>
    Position: ReturnType<typeof vi.fn>
    Location: ReturnType<typeof vi.fn>
    Diagnostic: ReturnType<typeof vi.fn>
    DiagnosticSeverity: {
      Error: number
      Warning: number
      Information: number
      Hint: number
    }
    TreeItemCollapsibleState: {
      None: number
      Collapsed: number
      Expanded: number
    }
    TreeItem: ReturnType<typeof vi.fn>
    EventEmitter: ReturnType<typeof vi.fn>
    ConfigurationTarget: {
      Global: number
      Workspace: number
      WorkspaceFolder: number
    }
    StatusBarAlignment: {
      Left: number
      Right: number
    }
    TextDocumentChangeEvent: ReturnType<typeof vi.fn>
    extensions: {
      getExtension: ReturnType<typeof vi.fn>
      all: any[]
    }
    env: {
      machineId: string
      sessionId: string
      language: string
      clipboard: {
        readText: ReturnType<typeof vi.fn>
        writeText: ReturnType<typeof vi.fn>
      }
    }
  }
}

export {}
