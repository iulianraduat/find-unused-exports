import { workspace } from 'vscode'

export function areMainExportsUsed(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.considerMainExportsUsed', false)
}

export function isResultExpanded(): boolean {
  return workspace.getConfiguration().get('findUnusedExports.defaultResultExpanded', false)
}
