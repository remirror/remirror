import { DOMOutputSpec } from '../src/core-types';

let spec: DOMOutputSpec;

spec = 'div';
spec = 'p';

spec = ['div', { style: 'display: flex;' }, 0];
spec = ['li', { style: 'display: flex;' }, ['input'], ['div'], ['div'], ['div', 0]];
spec = [
  'div',
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', { attr: '    ' }, ['div'], ['div'], ['div'], ['div'], ['div']],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', ['div'], ['div'], ['div'], ['div', { attr: '    ' }, ['div']]],
  ['div', 0],
];

// @ts-expect-error
spec = 123;
// @ts-expect-error
spec = { hello: '' };
// @ts-expect-error
spec = true;

spec = ['div', 0];
spec = ['div', { style: 'color:red' }, 0];
spec = ['div', ['div', 0]];
spec = ['div', ['div', { style: 'color:red' }], ['div', 0]];

// @ts-expect-error
spec = ['div', 'div', 0];
// @ts-expect-error
spec = ['div', { style: 'color:red' }, 'div', 0];
// @ts-expect-error
spec = ['div', ['div', 'div', 0]];
// @ts-expect-error
spec = ['div', ['div', { style: 'color:red' }], ['div', ['div', { style: 'color:green' }], 0]];
