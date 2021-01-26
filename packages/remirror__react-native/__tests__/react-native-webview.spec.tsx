import { bundle, transpile } from 'bundler.macro';

test('it can transpile a file', () => {
  expect(transpile('../__fixtures__/transpile.fixture.ts')).toMatchInlineSnapshot(`
    "function TestFunction() {
      console.log('This is a function');
    }"
  `);
});

test('it can bundle a file', () => {
  expect(bundle('../__fixtures__/bundle.fixture.ts', 'Awesome')).toMatchInlineSnapshot(`
    "var Awesome = (function (exports) {
      'use strict';

      function fn() {
        return 'awesome';
      }

      const a = fn();

      exports.a = a;
      exports.default = fn;

      Object.defineProperty(exports, '__esModule', { value: true });

      return exports;

    }({}));
    "
  `);
});
