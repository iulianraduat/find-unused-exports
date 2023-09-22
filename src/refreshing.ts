import { TDependency, DependencyType } from './tdependency';

export const Refreshing = new TDependency(
  undefined,
  '-',
  DependencyType.REFRESH,
  'Refreshing...'
);
