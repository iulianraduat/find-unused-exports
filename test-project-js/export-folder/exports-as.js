// Exporting individual features
export const name11 = '',
  name12 = 0;
export let name21, name22;
export let name31 = '',
  name32 = '';
export var name41, name42;
export var name51 = '',
  name52 = 0;

export function functionName() {}
export class ClassName {}

// Export list
const name61 = '';
const name62 = 0;
export { name61, name62 };

// Renaming exports
export { name61 as name71, name62 as name72 };

// Exporting destructured assignments with renaming
const o = {
  name81: '',
  field82: 0,
};
export const { name81, field82: name82 } = o;
