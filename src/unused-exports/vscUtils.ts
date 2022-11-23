import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { fixPathSeparator } from './fsUtils';

interface TConfig {
  ignore: {
    files?: string[];
  };
}

const emptyConfig: TConfig = {
  ignore: {},
};

function getConfig(): TConfig | undefined {
  const configPath = getConfigPath();
  if (configPath === undefined) {
    return;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config: TConfig = JSON.parse(content);
    if (config.ignore.files && Array.isArray(config.ignore.files) === false) {
      throw new Error();
    }
    return config;
  } catch (err) {
    fs.writeFileSync(configPath, JSON.stringify(emptyConfig, null, 2));
    return { ...emptyConfig };
  }
}

function getConfigPath(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const vscodePath = `${rootPath}${path.sep}.vscode`;
  if (fs.existsSync(vscodePath) === false) {
    fs.mkdirSync(vscodePath);
  }
  return `${vscodePath}${path.sep}find-unused-exports.json`;
}

export function getIgnoreFilenames(): string[] {
  const config = getConfig();
  if (config === undefined) {
    return [];
  }

  return config.ignore.files ?? [];
}

export function addToIgnoreFilenames(filepath: string): void {
  const configPath = getConfigPath();
  if (configPath === undefined) {
    return;
  }

  const fixedFilepath = fixPathSeparator(filepath);

  const alreadyIgnoredFiles = getIgnoreFilenames();
  if (alreadyIgnoredFiles.includes(fixedFilepath)) {
    return;
  }

  alreadyIgnoredFiles.push(fixedFilepath);
  const config: TConfig = { ignore: { files: alreadyIgnoredFiles } };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function isFileIgnored(filepath: string): boolean {
  const configPath = getConfigPath();
  if (configPath === undefined) {
    return false;
  }

  const alreadyIgnoredFiles = getIgnoreFilenames();
  return alreadyIgnoredFiles.includes(filepath);
}
