import fs from 'node:fs'
import path from 'node:path'
import { workspace } from 'vscode'
import { fixPathSeparator } from './fsUtilities'

interface TConfig {
  ignore: {
    files?: string[]
  }
}

function getConfig(): TConfig | undefined {
  const configPath = getConfigPath()
  if (configPath === undefined) {
    return
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(content) as TConfig
    if (config.ignore.files && !Array.isArray(config.ignore.files)) {
      throw new Error('findUnusedExports.ignore.files must be an array')
    }
    return config
  } catch {
    return
  }
}

function getConfigPath() {
  const workspaceFolders = workspace.workspaceFolders
  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return
  }

  const rootPath = workspaceFolders[0].uri.fsPath
  const vscodePath = path.join(rootPath, '.vscode')
  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath)
  }
  return path.join(vscodePath, 'find-unused-exports.json')
}

function getIgnoreFilenames(): string[] {
  const config = getConfig()
  if (config === undefined) {
    return []
  }

  return config.ignore.files ?? []
}

export function addToIgnoreFilenames(filePath: string) {
  const configPath = getConfigPath()
  if (configPath === undefined) {
    return
  }

  const fixedFilepath = fixPathSeparator(filePath)

  const alreadyIgnoredFiles = getIgnoreFilenames()
  if (alreadyIgnoredFiles.includes(fixedFilepath)) {
    return
  }

  alreadyIgnoredFiles.push(fixedFilepath)
  const config: TConfig = { ignore: { files: alreadyIgnoredFiles } }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

export function isFileIgnored(filePath: string): boolean {
  const configPath = getConfigPath()
  if (configPath === undefined) {
    return false
  }

  const alreadyIgnoredFiles = getIgnoreFilenames()
  return alreadyIgnoredFiles.includes(filePath)
}
