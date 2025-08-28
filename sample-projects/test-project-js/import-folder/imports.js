import expression from '../export-folder/default-expression'
import * as allExports from '../export-folder/exports'

import { name11, name12 } from '../export-folder/exports'
import { name21 as alias21, name22 as alias22 } from '../export-folder/exports'
import { name31, name32 as alias32 } from '../export-folder/exports'
import { name41 as alias41, name42 } from '../export-folder/exports'
import { name51 /**/, name52, name61 /**/, name62 } from '../export-folder/exports'
/* these imports should be "catch" by "import * as" */
// import { name71, name72, name81, name82 } from '../export-folder/exports';

/* these imports should be "catch" by "import * as" */
// import { functionName, ClassName } from '../export-folder/exports';

import defaultMember1, { name99 } from '../export-folder/mixed'
import defaultMember2, * as aliasDefault from '../export-folder/default-expression'
import defaultMember3 from '../export-folder/default-expression'

console.log(expression)
console.log(allExports)
console.log(name11, name12)
console.log(alias21, alias22)
console.log(name31, alias32)
console.log(alias41, name42)
console.log(name51, name52, name61, name62)
console.log(allExports.name71, allExports.name72, allExports.name81, allExports.name82)
console.log(allExports.functionName, allExports.ClassName)
console.log(defaultMember1)
console.log(name99)
console.log(defaultMember2)
console.log(aliasDefault)
console.log(defaultMember3)
