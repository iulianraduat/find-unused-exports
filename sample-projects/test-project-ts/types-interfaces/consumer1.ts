import type { IUsedInterface, TUsedType } from './my-types1'

const a: IUsedInterface = {
  property: 'used',
}

const b: TUsedType = {
  field: 'used',
}

console.log(a, b)
