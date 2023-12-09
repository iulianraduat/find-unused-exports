import { type IUsedInterface, type TUsedType } from './my-types2';

const a: IUsedInterface = {
  property: 'used',
};

const b: TUsedType = {
  field: 'used',
};

console.log(a, b);
