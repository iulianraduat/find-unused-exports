import { appendFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { OutputChannel, window, workspace } from 'vscode'

export function resetLog() {
  if (!isLogOnlyLastRunEnabled()) {
    return
  }

  const logPath = getLogPath()
  if (typeof logPath !== 'string') {
    return
  }

  try {
    rmSync(logPath)
  } catch {
    return
  }
}

function isLogOnlyLastRunEnabled(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.logOnlyLastRun', false)
}

export function log(category: string, context?: unknown, ms1970Utc?: number): number {
  const tsNow = Date.now()

  const debug = isDebugEnabled()
  if (!debug) {
    return tsNow
  }

  const message = context === undefined ? category : `${category}: ${JSON.stringify(context, null, 2)}`
  logInVSCodeOutput(message, ms1970Utc ? tsNow - ms1970Utc : undefined)
  return tsNow
}

function isDebugEnabled(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.debug', false)
}

let ochannel: OutputChannel | undefined

export function showOutputWindow() {
  ochannel?.show()
}

function logInVSCodeOutput(message: string, durationMs?: number) {
  if (!ochannel) {
    ochannel = window.createOutputChannel('Find unused exports')
  }

  const logMessage = durationMs === undefined ? message : `${message} (${durationMs}ms)`
  ochannel.appendLine(logMessage)

  if (!isLogInFileEnabled()) {
    return
  }

  const logPath = getLogPath()
  if (logPath === undefined) {
    return
  }

  try {
    appendFileSync(logPath, logMessage)
    appendFileSync(logPath, '\n')
  } catch {
    return
  }
}

function isLogInFileEnabled(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.logInFile', false)
}

function getLogPath(): string | undefined {
  const workspaceFolders = workspace.workspaceFolders
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return
  }

  const rootPath = workspaceFolders[0].uri.fsPath
  const vscodePath = path.join(rootPath, '.vscode')
  if (!existsSync(vscodePath)) {
    mkdirSync(vscodePath)
  }
  return path.join(vscodePath, 'find-unused-exports.log')
}
