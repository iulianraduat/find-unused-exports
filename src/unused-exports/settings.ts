import { workspace } from 'vscode'

export function areMainExportsUsed() {
  return workspace.getConfiguration().get('findUnusedExports.considerMainExportsUsed', false)
}

export function isResultExpanded() {
  return workspace.getConfiguration().get('findUnusedExports.defaultResultExpanded', false)
}
