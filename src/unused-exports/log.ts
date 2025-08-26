import { appendFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { sep as pathSep } from 'path'
import { OutputChannel, window, workspace } from 'vscode'

export function resetLog() {
  if (isLogOnlyLastRunEnabled() === false) {
    return
  }

  const logPath = getLogPath()
  if (logPath === undefined) {
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
  if (debug === false) {
    return tsNow
  }

  const msg = context !== undefined ? `${category}: ${JSON.stringify(context, null, 2)}` : category
  logInVSCodeOutput(msg, ms1970Utc ? tsNow - ms1970Utc : undefined)
  return tsNow
}

function isDebugEnabled(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.debug', false)
}

let ochannel: OutputChannel | undefined

export function showOutputWindow() {
  ochannel?.show()
}

function logInVSCodeOutput(msg: string, durationMs?: number) {
  if (!ochannel) {
    ochannel = window.createOutputChannel('Find unused exports')
  }

  const logMsg = durationMs !== undefined ? `${msg} (${durationMs}ms)` : msg
  ochannel.appendLine(logMsg)

  if (isLogInFileEnabled() === false) {
    return
  }

  const logPath = getLogPath()
  if (logPath === undefined) {
    return
  }

  try {
    appendFileSync(logPath, logMsg)
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
  const vscodePath = `${rootPath}${pathSep}.vscode`
  if (existsSync(vscodePath) === false) {
    mkdirSync(vscodePath)
  }
  return `${vscodePath}${pathSep}find-unused-exports.log`
}
