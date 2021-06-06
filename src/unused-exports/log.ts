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

  fs.rmSync(logPath);
}

function isLogOnlyLastRunEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.logOnlyLastRun', false);
}

export function log(category: string, context?: any) {
  const debug = isDebugEnabled();
  if (debug === false) {
    return;
  }

  if (context === undefined) {
    logInVSCodeOutput(category);
    return;
  }

  logInVSCodeOutput(`${category}: ${JSON.stringify(context, null, 2)}`);
}

function isDebugEnabled(): boolean {
  return vscode.workspace.getConfiguration().get('findUnusedExports.debug', false);
}

let ochannel: vscode.OutputChannel | undefined;

const logInVSCodeOutput = (msg: string) => {
  if (!ochannel) {
    ochannel = vscode.window.createOutputChannel('Find unused exports');
  }

  ochannel.appendLine(msg);

  if (isLogInFileEnabled() === false) {
    return;
  }

  const logPath = getLogPath();
  if (logPath === undefined) {
    return;
  }

  try {
    fs.appendFileSync(logPath, msg);
    fs.appendFileSync(logPath, '\n');
  } catch {
    return;
  }
};

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
