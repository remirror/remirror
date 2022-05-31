# jest-prosemirror

[![npm](https://img.shields.io/npm/dm/jest-prosemirror.svg?&logo=npm)](https://www.npmjs.com/package/jest-prosemirror)

## The problem

You want to write tests for some of your prosemirror editor but you don't know where to start. You know you should avoid testing implementation details and just want to be sure that your commands and plugins produce the correct underlying prosemirror state.

## This solution

`jest-prosemirror` takes inspiration from the [`testing-library`](https://github.com/testing-library/react-testing-library) mantra and enables you to write more intuitive tests for your prosemirror editor.

## Installation

```bash
yarn add jest-prosemirror # yarn
pnpm add jest-prosemirror # pnpm
npm install jest-prosemirror # npm
```

## Getting started

### Quick setup

For a quick setup add the following to your jest.config.js file.

```js
module.exports = {
  setupFilesAfterEnv: ['jest-prosemirror/environment'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

This will automatically:

- Add the jest assertions `toTransformNode` and `toEqualProsemirrorNode`.

If you are using typescript then add this to your `tsconfig.json` file for global type support.

```json
{
  "compilerOptions": {
    "types": ["jest-prosemirror"]
  }
}
```

### Manual setup

Create a `jest.framework.dom.ts` file and add the following

```ts
// jest.framework.dom.ts

import { prosemirrorMatchers } from 'jest-prosemirror';

// Add jest-prosemirror assertions
expect.extend(prosemirrorMatchers);
```

In your `jest.config.js` file add this to the configuration

```js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.framework.dom.ts'],
  testEnvironment: 'jsdom', // Required for dom manipulation
};
```

## Snapshot serializer

This package exports a serializer for better snapshot testing of prosemirror primitives. To set this up add the following to your `jest.config.js` file.

```js
module.exports = {
  snapshotSerializers: ['jest-prosemirror/serializer'],
};
```

Alternatively, you can add the following to your `jest.framework.dom.ts` file.

```ts
// jest.framework.dom.ts

import { prosemirrorSerializer } from 'jest-prosemirror';

// Add the serializer for use throughout all the configured test files.
expect.addSnapshotSerializer(prosemirrorSerializer);
```

## Jest Matchers

### `toTransformNode`

A utility from jest-prosemirror which tests that a command transforms the prosemirror node in the desired way.

```ts
import { doc, p, schema, strong } from 'jest-prosemirror';
import { removeMark } from 'remirror/core/utils';

test('remove the mark', () => {
  const type = schema.marks.bold;
  const from = doc(p(strong('<start>bold<end>')));
  const to = doc(p('bold'));

  expect(removeMark({ type })).toTransformNode({ from, to });
});
```

This tests that mark has been removed by the provided command.

The `to` property is optional and can be left blank to test that the node is identical after the transform.

### `toEqualProsemirrorNode`

Tests that two prosemirror documents are equal. Pass in the expected document and it checks that they are the same.

```ts
import { createEditor, doc, p } from 'jest-prosemirror';
import { removeNodeAtPosition } from 'remirror/core/utils';

test('remove block top level node at specified position', () => {
  const {
    state: { tr },
  } = createEditor(doc(p('x'), p('one')));
  const newTr = removeNodeAtPosition({ pos: 3, tr });

  expect(newTr).not.toBe(tr);
  expect(newTr.doc).toEqualProsemirrorNode(doc(p('x')));
});
```

## `createEditor`

Create a test prosemirror editor.

The call to create editor can be chained with various commands to enable testing of the editor at each step without the need for intermediate holding variables.

```ts
import { createEditor, doc, p } from 'jest-remirror';
import { suggest } from 'prosemirror-suggest';

test('`keyBindings`', () => {
  const keyBindings = {
    Enter: jest.fn((params: SuggestKeyBindingParameter) => {
      params.command();
    }),
  };

  const plugin = suggest({
    char: '@',
    name: 'at',
    keyBindings,
    matchOffset: 0,
    createCommand:
      ({ view }) =>
      () =>
        view.dispatch(view.state.tr.insertText('awesome')),
  });

  createEditor(doc(p('<cursor>')), { plugins: [plugin] })
    .insertText('@')
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualProsemirrorNode(doc(p('@awesome')));
    });
});
```

### Parameters

#### taggedDoc - `TaggedProsemirrorNode`

The tagged prosemirror node to inject into the editor.

#### options - `CreateEditorOptions`

The following options which include all [DirectEditorProps](http://prosemirror.net/docs/ref/#view.DirectEditorProps) except for `state`.

| **Property** | **Type** | **Default** | **Description** |
| --- | :-: | :-: | --- |
| `autoClean` | `boolean` | `true` | Whether to auto remove the editor from the dom after each test. It is advisable to leave this unchanged. |
| `plugins` | `Plugin[]` | `[]` | The plugins that the test editor should use. |
| `rules` | `InputRule[]` | `[]` | The input rules that the test editor should use. |

### Returns

#### start - `number`

The start of the current selection.

#### end - `number | undefined`

The end of the current selection.

#### selection - `Selection`

The current prosemirror selection

#### schema - `EditorSchema`

The prosemirror schema.

#### state - `EditorState`

The prosemirror state.

#### view - `EditorView`

The prosemirror view.

#### overwrite - `(doc: TaggedProsemirrorNode) => ReturnType<typeof createEditor>`

Overwrite all the current content within the editor.

**`doc`** - the new content to use.

#### command - `(command: CommandFunction) => ReturnType<typeof createEditor>`

Run the command within the prosemirror editor.

```ts
test('commands are run', () => {
  createEditor(doc(p('<cursor>')))
    .command((state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.insertText('hello'));
      }
    })
    .callback((content) => {
      expect(content.state.doc).toEqualProsemirrorDocument(doc(p('hello')));
    });
});
```

**`command`** - the command function to run.

#### insertText - `(text: string) => ReturnType<typeof createEditor>`

Insert text into the editor at the current position.

**`text`** - the text to insert

#### jumpTo - `(start: 'start' | 'end' | number, end?: number) => ReturnType<typeof createEditor>`

Jump to the specified position in the editor.

**`start`** - a number position or the shorthand 'start' | 'end'. **`[end]`** - the option end position of the new selection.

#### shortcut - `(mod: string) => ReturnType<typeof createEditor>`

Type a keyboard shortcut - e.g. `Mod-Enter`.

**NOTE** This only simulates the events. For example an `Mod-Enter` would run all enter key handlers but not actually create a new line. I'd welcome a pull request to fix this shortcoming.

**`mod`** - the keyboard shortcut to type

#### press - `(char: string) => ReturnType<typeof createEditor>`

Simulate a keypress which is run through the editor's key handlers.

**NOTE** This only simulates the events. For example an `Enter` would run all enter key handlers but not actually create a new line. I'd welcome a pull request to fix this shortcoming.

**`char`** - the character to type

#### fire - `(params: Omit<FireEventAtPositionParameter, 'view'>) => ReturnType<typeof createEditor>`

Fire an event in the editor. This api is not the most well tested and can be quite flakey.

**`params`** - the fire event parameters

#### callback - `(fn: (content: ReturnValueCallbackParameter) => void) => ReturnType<typeof createEditor>`

Callback function which receives the `start`, `end`, `state`, `view`, `schema` and `selection` properties and allows for easier testing of the current state of the editor.

## Acknowledgements

This package borrows very heavily from [prosemirror-test-builder](https://www.npmjs.com/package/prosemirror-test-builder)
