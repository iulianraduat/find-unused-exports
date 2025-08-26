export interface OverviewContext {
  countGlobInclude: Record<string, number>
  errors?: string[]
  filesHavingImportsOrExports: number
  foundCircularImports: number
  globExclude?: string[]
  globInclude?: string[]
  info?: string
  lastRun: Date
  notUsedExports: number
  numDefaultExclude?: number
  pathToPrj: string
  processedFiles: number
  totalEllapsedTime: number
  totalExports: number
  totalImports: number
  workspaceName: string
}

export function addGlobInclude(context: OverviewContext, glob: string, count: number) {
  if (context.globInclude === undefined) {
    context.globInclude = []
  }

  if (context.globInclude.some((globInclude) => globInclude === glob) === false) {
    context.globInclude.push(glob)
  }

  context.countGlobInclude[glob] = Math.max(context.countGlobInclude[glob] || 0, count)
}
