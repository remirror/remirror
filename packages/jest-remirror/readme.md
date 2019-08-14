# jest-remirror

[![npm](https://img.shields.io/npm/dm/jest-remirror.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/jest-remirror) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fextension-mention&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/jest-remirror/package.json) [![NPM](https://img.shields.io/npm/l/jest-remirror.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/package%3A%20jest-remirror.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%20jest-remirror) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/package%3A%20jest-remirror.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3Apackage%3A%20jest-remirror)

## Installation

Ensure the following is installed as it will be responsible for creating the test editor

```bash
yarn add @testing-library/react
```

```bash
yarn add jest-remirror
```

## Getting started

### Quick setup

For a quick and simple setup add the following to your jest.config.js file.

```js
/* jest.config.js */

module.exports = {
  //...
  setupFilesAfterEnv: ['jest-remirror/environment'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

This will automatically

- inject the required JSDOM polyfills
- ensure that `@testing-library/react` cleans up the DOM after each test
- Add the jest assertions `toEqualRemirrorDocument` and `toMatchRemirrorSnapshot`.

If you are using typescript then add this to your `tsconfig.json` file for type support.

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

/* Auto cleanup DOM after each test */
require('@testing-library/react/cleanup-after-each');

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
  //...
  setupFilesAfterEnv: ['<rootDir>/jest.framework.dom.ts'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

## The problem

Testing contenteditable is really difficult, especially with `jsdom`. There are certain events that can't be fired and it's often hard to conceptualize how the test result translates to the actual user experience.

## A solution

`jest-remirror` makes rendering the remirror editor painless so that you can test that your extensions are:

- having the intended effect on the HTML output
- calling the correct callbacks

Under the hood `jest-remirror` leans heavily on `@testing-library/react` to render an instance of your test editor to the dom and provide a number of utilities exposed when calling the `renderEditor` method.

## Example

```ts
import { renderEditor } from 'jest-remirror';
import { Mention, MentionOptions } from '@remirror/extension-mention';

/**
 * A utility method to help make writing the tests easier. It runs renderEditor to inject the editor into the dom and pass along any params.
 */
const create = (params: MentionOptions<'mentionAt'> = { name: 'mentionAt' }) =>
  renderEditor({
    attrNodes: [new Mention({ name: 'mentionAt', mentionClassName: 'custom', ...params })],
  });

describe('Mention#command', () => {
  let {
    nodes: { doc, paragraph },
    view,
    attrNodes: { mentionAt },
    actions,
    add,
  } = create();

  beforeEach(() => {
    ({
      nodes: { doc, paragraph },
      view,
      attrNodes: { mentionAt },
      actions,
      add,
    } = create());
  });

  it('replaces text at the current position', () => {
    const { actions } = add(doc(paragraph('This is ', '<cursor>')));
    const atMention = mentionAt({ id: 'test', label: '@test' });

    // Run the command the command
    actions.createMention(attrs);

    expect(view.state).toContainRemirrorDocument(paragraph('This is an ', atMention()));
  });
});

describe('plugin', () => {
  const options = {
    name: 'mentionAt' as 'mentionAt',
    mentionClassName: 'custom',
  };

  const mocks = {
    onEnter: jest.fn(),
    onChange: jest.fn(),
    onKeyDown: jest.fn(),
    onExit: jest.fn(),
  };

  it('uses default noop callbacks', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      view,
    } = renderEditor({
      attrNodes: [new Mention(options)],
    });

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p(`This ${label} `));
  });

  it('injects the mention at the correct place', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      attrNodes: { mentionAt },
      view,
    } = renderEditor(
      {
        attrNodes: [
          new Mention({
            ...options,
            ...mocks,
            onExit: ({ command, query }) => {
              command({ id: query!, label: `@${query}`, appendText: '' });
            },
          }),
        ],
      },
      {},
    );

    const mentionNode = mentionAt({ id, label });

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p('This ', mentionNode(), ' '));
    expect(mocks.onEnter).toHaveBeenCalledTimes(1);
    expect(mocks.onChange).toHaveBeenCalledTimes(id.length - 1);
    expect(mocks.onKeyDown).toHaveBeenCalledTimes(id.length);
  });
});
```

## Acknowledgements

This package borrows very heavily from [@atlaskit/editor-test-helpers](https://www.npmjs.com/package/@atlaskit/editor-test-helpers)
