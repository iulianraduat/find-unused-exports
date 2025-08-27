/**
 * Test fixtures containing various TypeScript/JavaScript code patterns
 * for testing export detection functionality
 */

export interface TestCodeSample {
  name: string
  content: string
  expectedExports: string[]
  expectedImports: string[]
}

export const testCodeSamples: TestCodeSample[] = [
  // Basic named exports
  {
    name: 'basic-named-exports',
    content: `
export const myVariable = 'test';
export function myFunction() {
  return 'hello';
}
export class MyClass {
  constructor() {}
}
export interface MyInterface {
  prop: string;
}
export type MyType = string;
export enum MyEnum {
  VALUE1 = 'value1',
  VALUE2 = 'value2'
}
`,
    expectedExports: ['myVariable', 'myFunction', 'MyClass', 'MyInterface', 'MyType', 'MyEnum'],
    expectedImports: [],
  },

  // Default exports
  {
    name: 'default-exports',
    content: `
export default function defaultFunction() {
  return 'default';
}
`,
    expectedExports: ['default'],
    expectedImports: [],
  },

  // Mixed default and named exports
  {
    name: 'mixed-exports',
    content: `
const mainFunction = () => 'main';
export const helper = 'helper';
export { mainFunction as default };
export { helper as utilityHelper };
`,
    expectedExports: ['helper', 'default', 'utilityHelper'],
    expectedImports: [],
  },

  // Destructured exports
  {
    name: 'destructured-exports',
    content: `
export const { prop1, prop2: renamedProp } = someObject;
export const [item1, item2] = someArray;
`,
    expectedExports: ['prop1,renamedProp', 'item1,item2'],
    expectedImports: [],
  },

  // Re-exports
  {
    name: 're-exports',
    content: `
export { namedExport } from './other-module';
export { default as renamedDefault } from './another-module';
export * from './all-exports';
export * as namespace from './namespace-module';
`,
    expectedExports: ['namedExport', 'renamedDefault', '*', 'namespace'],
    expectedImports: [],
  },

  // Basic imports
  {
    name: 'basic-imports',
    content: `
import defaultImport from './module1';
import { namedImport1, namedImport2 } from './module2';
import * as namespace from './module3';
import { renamed as aliased } from './module4';
const dynamicImport = require('./module5');
`,
    expectedExports: [],
    expectedImports: [
      { name: 'default', path: './module1' },
      { name: 'namedImport1,namedImport2', path: './module2' },
      { name: '*', path: './module3' },
      { name: 'renamed', path: './module4' },
      { name: '*', path: './module5' },
    ],
  },

  // Type-only imports/exports
  {
    name: 'type-only',
    content: `
import type { TypeImport } from './types';
export type { TypeExport } from './other-types';
export type LocalType = string;
`,
    expectedExports: ['TypeExport', 'LocalType'],
    expectedImports: [{ name: 'TypeImport', path: './types' }],
  },

  // Complex mixed patterns
  {
    name: 'complex-mixed',
    content: `
import React, { useState, useEffect } from 'react';
import type { ComponentProps } from './types';
import * as utils from './utils';

export interface Props extends ComponentProps {
  title: string;
}

export const MyComponent: React.FC<Props> = ({ title }) => {
  const [state, setState] = useState('');
  
  useEffect(() => {
    utils.doSomething();
  }, []);

  return <div>{title}</div>;
};

export default MyComponent;
`,
    expectedExports: ['Props', 'MyComponent', 'default'],
    expectedImports: [
      { name: 'default,useState,useEffect', path: 'react' },
      { name: 'ComponentProps', path: './types' },
      { name: '*', path: './utils' },
    ],
  },

  // Edge cases with comments and strings
  {
    name: 'edge-cases-comments',
    content: `
// This is not an export: export const fake = 'fake';
/* 
export const alsoFake = 'fake';
*/
export const realExport = 'real';
const stringWithExport = "export const notAnExport = 'fake'";
const templateString = \`export const alsoNotAnExport = 'fake'\`;
`,
    expectedExports: ['realExport'],
    expectedImports: [],
  },

  // Namespace exports
  {
    name: 'namespace-exports',
    content: `
namespace MyNamespace {
  export const value = 'test';
  export function helper() {}
}
export { MyNamespace };
`,
    expectedExports: ['value', 'helper', 'MyNamespace'],
    expectedImports: [],
  },

  // Generator functions
  {
    name: 'generator-functions',
    content: `
export function* generatorFunction() {
  yield 1;
  yield 2;
}
export async function* asyncGenerator() {
  yield Promise.resolve(1);
}
`,
    expectedExports: ['generatorFunction', 'asyncGenerator'],
    expectedImports: [],
  },

  // Ignored exports (with special comment)
  {
    name: 'ignored-exports',
    content: `
export const normalExport = 'normal';
// find-unused-exports:ignore-next-line-exports
export const ignoredExport = 'ignored';
export const anotherNormalExport = 'normal';
`,
    expectedExports: ['normalExport', 'anotherNormalExport'], // ignoredExport should be filtered out when showIgnoredExports is false
    expectedImports: [],
  },
]

export const createTestFile = (sample: TestCodeSample, filePath: string) => ({
  path: filePath,
  content: sample.content,
  expectedExports: sample.expectedExports,
  expectedImports: sample.expectedImports,
})
