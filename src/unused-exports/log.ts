import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function resetLog() {
  if (isLogOnlyLastRunEnabled() === false) {
    return;
  }

  const logPath = getLogPath();
  if (logPath === undefined) {
    return;
  }

  try {
    fs.rmSync(logPath);
  } catch {
    return;
  }
}

function isLogOnlyLastRunEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.logOnlyLastRun', false);
}

export function log(category: string, context?: any, ms1970Utc?: number): number {
  const tsNow = Date.now();

  const debug = isDebugEnabled();
  if (debug === false) {
    return tsNow;
  }

  const msg = context !== undefined ? `${category}: ${JSON.stringify(context, null, 2)}` : category;
  logInVSCodeOutput(msg, ms1970Utc ? tsNow - ms1970Utc : undefined);
  return tsNow;
}

function isDebugEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.debug', false);
}

let ochannel: vscode.OutputChannel | undefined;

export function showOutputWindow() {
  ochannel?.show();
}

function logInVSCodeOutput(msg: string, durationMs?: number) {
  if (!ochannel) {
    ochannel = vscode.window.createOutputChannel('Find unused exports');
  }

  const logMsg = durationMs !== undefined ? `${msg} (${durationMs}ms)` : msg;
  ochannel.appendLine(logMsg);

  if (isLogInFileEnabled() === false) {
    return;
  }

  const logPath = getLogPath();
  if (logPath === undefined) {
    return;
  }

  try {
    fs.appendFileSync(logPath, logMsg);
    fs.appendFileSync(logPath, '\n');
  } catch {
    return;
  }
}

function isLogInFileEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.logInFile', false);
}

function getLogPath(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const vscodePath = `${rootPath}${path.sep}.vscode`;
  if (fs.existsSync(vscodePath) === false) {
    fs.mkdirSync(vscodePath);
  }
  return `${vscodePath}${path.sep}find-unused-exports.log`;
}
