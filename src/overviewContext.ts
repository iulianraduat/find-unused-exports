export interface OverviewContext {
  countGlobInclude: Record<string, number>;
  errors?: string[];
  filesHavingImportsOrExports: number;
  foundCircularImports: number;
  globExclude?: string[];
  globInclude?: string[];
  info?: string;
  lastRun: Date;
  notUsedExports: number;
  numDefaultExclude?: number;
  pathToPrj: string;
  processedFiles: number;
  totalEllapsedTime: number;
  totalExports: number;
  totalImports: number;
  workspaceName: string;
}
