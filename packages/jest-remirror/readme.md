# jest-remirror

[![npm](https://img.shields.io/npm/dm/jest-remirror.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/jest-remirror) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fextension-mention&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/jest-remirror/package.json) [![NPM](https://img.shields.io/npm/l/jest-remirror.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/package%3A%20jest-remirror.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%20jest-remirror) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/package%3A%20jest-remirror.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%20jest-remirror)

## Installation

```bash
yarn add jest-remirror
```

## Getting started

### Quick setup

For a quick setup add the following to your jest.config.js file.

```js
/* jest.config.js */

module.exports = {
  setupFilesAfterEnv: ['jest-remirror/environment'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

This will automatically

- inject the required JSDOM polyfills
- ensure that `@testing-library/react` cleans up the DOM after each test
- Add the jest assertions `toEqualRemirrorDocument` and `toMatchRemirrorSnapshot`.

If you are using typescript then add this to your `tsconfig.json` file for global type support.

```json
{
  "compilerOptions": {
    "types": ["jest-remirror"]
  }
}
```

### Manual setup

Create a `jest.framework.dom.ts` file and add the following

```ts
/* jest.framework.dom.ts */

import { jsdomExtras, jsdomPolyfill, remirrorMatchers } from 'jest-remirror';

/* Add jest-remirror assertions */
expect.extend(remirrorMatchers);

/* Polyfills for jsdom */
jsdomPolyfill();

/* Extras for prosemirror testing */
jsdomExtras();
```

In your `jest.config.js` file add this to the configuration

```js
/* jest.config.js */

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.framework.dom.ts'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

## The problem

Testing contenteditable is really difficult, especially with `jsdom`. There are certain events that can't be fired and it's often hard to conceptualize how the test result translates to the actual user experience.

## A solution

`jest-remirror` makes rendering the remirror editor painless so that you can test that your extensions:

- have the intended effect on the HTML output
- call the correct callbacks

Under the hood `jest-remirror` leans heavily on `@testing-library/react` to render an instance of your test editor to the dom and provides a number of utilities exposed when calling the `renderEditor` method.

## Example

```ts
import { renderEditor } from 'jest-remirror';
import { EmojiExtension } from '@remirror/extension-emoji';

test('emoticons replaced with emoji', () => {
  const {
    nodes: { p, doc },
    add,
  } = renderEditor({ plainNodes: [], others: [new EmojiExtension()] });

  add(doc(p('<cursor>')))
    .insertText(':-)')
    .callback(content => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
    });
});
```

## Acknowledgements

This package borrows very heavily from [@atlaskit/editor-test-helpers](https://www.npmjs.com/package/@atlaskit/editor-test-helpers)
