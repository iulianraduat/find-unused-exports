import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { sep as pathSep } from 'path';
import { workspace } from 'vscode';
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
    const content = readFileSync(configPath, 'utf8');
    const config: TConfig = JSON.parse(content);
    if (config.ignore.files && Array.isArray(config.ignore.files) === false) {
      throw new Error();
    }
    return config;
  } catch (err) {
    return;
  }
}

function getConfigPath(): string | undefined {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const vscodePath = `${rootPath}${pathSep}.vscode`;
  if (existsSync(vscodePath) === false) {
    mkdirSync(vscodePath);
  }
  return `${vscodePath}${pathSep}find-unused-exports.json`;
}

function getIgnoreFilenames(): string[] {
  const config = getConfig();
  if (config === undefined) {
    return [];
  }

  return config.ignore.files ?? [];
}

export function addToIgnoreFilenames(filePath: string): void {
  const configPath = getConfigPath();
  if (configPath === undefined) {
    return;
  }

  const fixedFilepath = fixPathSeparator(filePath);

  const alreadyIgnoredFiles = getIgnoreFilenames();
  if (alreadyIgnoredFiles.includes(fixedFilepath)) {
    return;
  }

  alreadyIgnoredFiles.push(fixedFilepath);
  const config: TConfig = { ignore: { files: alreadyIgnoredFiles } };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function isFileIgnored(filePath: string): boolean {
  const configPath = getConfigPath();
  if (configPath === undefined) {
    return false;
  }

  const alreadyIgnoredFiles = getIgnoreFilenames();
  return alreadyIgnoredFiles.includes(filePath);
}
