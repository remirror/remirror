# jest-remirror

## 3.0.0-beta.7

> 2024-07-19

### Patch Changes

- c4c4fa512: Forward-port the removal of the validate property from `main`
- Updated dependencies [c4c4fa512]
  - @remirror/preset-core@3.0.0-beta.7
  - jest-prosemirror@3.0.0-beta.5
  - @remirror/core@3.0.0-beta.7
  - @remirror/dom@3.0.0-beta.7
  - @remirror/pm@3.0.0-beta.5

## 3.0.0-beta.6

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/preset-core@3.0.0-beta.6
  - jest-prosemirror@3.0.0-beta.4
  - @remirror/core@3.0.0-beta.6
  - @remirror/dom@3.0.0-beta.6
  - @remirror/pm@3.0.0-beta.4

## 3.0.0-beta.5

> 2023-11-20

### Major Changes

- 469d7ce8f: Remove deprecated properties `start` and `end`, use `from` and `to` respectively instead.

  Remove deprecated function `jsdomExtras`, use `jsdomPolyfills` instead.

### Patch Changes

- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
- Updated dependencies [469d7ce8f]
  - jest-prosemirror@3.0.0-beta.3
  - @remirror/core@3.0.0-beta.5
  - @remirror/preset-core@3.0.0-beta.5
  - @remirror/pm@3.0.0-beta.3
  - @remirror/dom@3.0.0-beta.5

## 3.0.0-beta.4

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/preset-core@3.0.0-beta.4
  - jest-prosemirror@3.0.0-beta.2
  - @remirror/core@3.0.0-beta.4
  - @remirror/dom@3.0.0-beta.4
  - @remirror/pm@3.0.0-beta.2

## 3.0.0-beta.3

> 2023-11-08

### Patch Changes

- Updated dependencies [46e903ed9]
  - @remirror/core@3.0.0-beta.3
  - @remirror/dom@3.0.0-beta.3
  - @remirror/preset-core@3.0.0-beta.3

## 3.0.0-beta.2

> 2023-11-07

### Patch Changes

- Updated dependencies [47bda7aab]
  - @remirror/core@3.0.0-beta.2
  - @remirror/dom@3.0.0-beta.2
  - @remirror/preset-core@3.0.0-beta.2

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- Updated dependencies [b1d683fdb]
- Updated dependencies [d3954076f]
- Updated dependencies [0e4abae1b]
  - @remirror/pm@3.0.0-beta.1
  - @remirror/core@3.0.0-beta.1
  - @remirror/preset-core@3.0.0-beta.1
  - jest-prosemirror@3.0.0-beta.1
  - @remirror/dom@3.0.0-beta.1

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [3f76519f3]
- Updated dependencies [8f5467ae6]
  - @remirror/core@3.0.0-beta.0
  - @remirror/preset-core@3.0.0-beta.0
  - jest-prosemirror@3.0.0-beta.0
  - @remirror/dom@3.0.0-beta.0
  - @remirror/pm@3.0.0-beta.0

## 2.1.5

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
- Updated dependencies [e88cf35bb]
  - @remirror/preset-core@2.0.16
  - jest-prosemirror@2.1.3
  - @remirror/core@2.0.13
  - @remirror/dom@2.0.16
  - @remirror/pm@2.0.5

## 2.1.4

> 2023-03-10

### Patch Changes

- 652a6d33a: Set `jest` as an optional peer dependency. This will make [Vitest](https://vitest.dev/) users easier.
- Updated dependencies [7a6811d96]
- Updated dependencies [652a6d33a]
  - @remirror/pm@2.0.4
  - jest-prosemirror@2.1.2
  - @remirror/core@2.0.12
  - @remirror/dom@2.0.15
  - @remirror/preset-core@2.0.15

## 2.1.3

> 2023-01-15

### Patch Changes

- @remirror/preset-core@2.0.14
- @remirror/dom@2.0.14

## 2.1.2

> 2022-12-29

### Patch Changes

- 64fe7d6b1: Add jsdom polyfill for `element.scrollIntoView`.
  - jest-prosemirror@2.1.1
  - @remirror/core@2.0.11
  - @remirror/pm@2.0.3
  - @remirror/dom@2.0.13
  - @remirror/preset-core@2.0.13

## 2.1.1

> 2022-12-26

### Patch Changes

- Updated dependencies [2d9ac815b]
  - @remirror/core@2.0.10
  - @remirror/dom@2.0.12
  - @remirror/preset-core@2.0.12

## 2.1.0

> 2022-12-10

### Minor Changes

- 46c1762e3: Add `ProsemirrorTestChain.copied`. This is the copied content of selected content as an object with the `html` and `text` properties. The `text` property is the `text/plain` clipboard data. The `html` property is the `text/html` clipboard data.
- 46c1762e3: Improve `ProsemirrorTestChain.paste`. It's behavior is closer to ProseMirror's paste behavior. It now accepts an object with the `html` and `text` properties. The `text` property is used to set the `text/plain` clipboard data. The `html` property is used to set the `text/html` clipboard data. It also accepts an option `plainText` property which is used to simulate a plain text paste (e.g. press `Ctrl-Shift-V` or `Command-Shift-V`).

### Patch Changes

- Updated dependencies [c24854eef]
- Updated dependencies [f62c04ad3]
- Updated dependencies [46c1762e3]
- Updated dependencies [46c1762e3]
  - @remirror/pm@2.0.2
  - jest-prosemirror@2.1.0
  - @remirror/core@2.0.9
  - @remirror/dom@2.0.11
  - @remirror/preset-core@2.0.11

## 2.0.10

> 2022-11-25

### Patch Changes

- @remirror/preset-core@2.0.10
- jest-prosemirror@2.0.8
- @remirror/core@2.0.8
- @remirror/dom@2.0.10

## 2.0.9

> 2022-11-21

### Patch Changes

- @remirror/preset-core@2.0.9
- @remirror/dom@2.0.9

## 2.0.8

> 2022-10-27

### Patch Changes

- Updated dependencies [b637f9f3e]
  - @remirror/pm@2.0.1
  - @remirror/preset-core@2.0.8
  - jest-prosemirror@2.0.7
  - @remirror/core@2.0.7
  - @remirror/dom@2.0.8

## 2.0.7

> 2022-10-11

### Patch Changes

- Expose the ability to split and merge cells in the default React tables menu
- Fixes a bug that causes `ReferenceError: window is not defined` when parsing HTML on the server.
- Catch when `posFromDom` returns -1, which causes a thrown error when attempting to resolve the pos
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.7
  - @remirror/preset-core@2.0.7
  - jest-prosemirror@2.0.6
  - @remirror/core@2.0.6

## 2.0.6

> 2022-09-29

### Patch Changes

- Do not use `instanceof` in `isDomNode` anymore. This increases the compatibility on Node.js environments, where might exist more than one DOM API implementation.
- Updated dependencies
  - jest-prosemirror@2.0.5
  - @remirror/core@2.0.5
  - @remirror/dom@2.0.6
  - @remirror/preset-core@2.0.6

## 2.0.5

> 2022-09-23

### Patch Changes

- Update dependencies.
- Updated dependencies
  - jest-prosemirror@2.0.4
  - @remirror/core@2.0.4
  - @remirror/dom@2.0.5
  - @remirror/preset-core@2.0.5

## 2.0.4

> 2022-09-22

### Patch Changes

- Don't require `jsdom` in the browser environment.

  This patch moves the `require('jsdom')` code into a standalone package [`get-dom-document`](https://www.npmjs.com/package/get-dom-document), which use the `browser` field in `package.json` to avoid bundling `jsdom` in the browser environment.

- Updated dependencies
  - jest-prosemirror@2.0.3
  - @remirror/core@2.0.3
  - @remirror/dom@2.0.4
  - @remirror/preset-core@2.0.4

## 2.0.3

> 2022-09-21

### Patch Changes

- Decorate the `insertHorizontalRule` command
- Make the task list button in `ListButtonGroup` optional

  Add a new hook `useHasExtension` which checks for the presence of an extension in the manager

- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.2
  - @remirror/dom@2.0.3
  - @remirror/preset-core@2.0.3
  - jest-prosemirror@2.0.2

## 2.0.2

> 2022-09-20

### Patch Changes

- Fix an issue that causes `isSafari` to crash.
- Updated dependencies
  - @remirror/core@2.0.1
  - jest-prosemirror@2.0.1
  - @remirror/dom@2.0.2
  - @remirror/preset-core@2.0.2

## 2.0.1

> 2022-09-19

### Patch Changes

- Adds four new events `doubleClick`, `doubleClickMark`, `tripleClick` and `tripleClickMark`. They have the same interface as the existing `click` and `clickMark` event, but are triggered when the user double or triple clicks.
- Updated dependencies
  - @remirror/dom@2.0.1
  - @remirror/preset-core@2.0.1

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Improve the calculation of changed ranges by utilising mapping
- Update ProseMirror dependencies.
- Update ProseMirror packages.
- Update prosemirror packages.
- Support both ESM and CJS.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Clarify the TS return type for `pmBuild`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Correct diff message ouputed by `toEqualRemirrorState`.
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes `domino` from the codebase.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0
  - @remirror/core@2.0.0
  - @remirror/dom@2.0.0
  - @remirror/preset-core@2.0.0
  - @remirror/pm@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Removes `domino` from the codebase.
- Support both ESM and CJS.
- Update ProseMirror packages.
- Clarify the TS return type for `pmBuild`.
- Try to require JSDOM implicitly in node environment.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Update prosemirror packages.
- SSR features are removed.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror dependencies.
- Expose the return type of the throttle and debounce helpers
- Improve the calculation of changed ranges by utilising mapping
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.19
  - @remirror/core@2.0.0-beta.19
  - @remirror/dom@2.0.0-beta.19
  - @remirror/preset-core@2.0.0-beta.19
  - @remirror/pm@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Support both ESM and CJS.
- Update ProseMirror packages.
- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Update prosemirror packages.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror dependencies.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.18
  - @remirror/preset-core@2.0.0-beta.18
  - @remirror/core@2.0.0-beta.18
  - jest-prosemirror@2.0.0-beta.18
  - @remirror/pm@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Update ProseMirror packages.
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- SSR features are removed.
- Update prosemirror packages.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror dependencies.
- Improve the calculation of changed ranges by utilising mapping
- Update ProseMirror packages to latest versions.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Correct diff message ouputed by `toEqualRemirrorState`.
- Removes `domino` from the codebase.
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.17
  - jest-prosemirror@2.0.0-beta.17
  - @remirror/core@2.0.0-beta.17
  - @remirror/dom@2.0.0-beta.17
  - @remirror/preset-core@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Update ProseMirror dependencies.
- Removes `domino` from the codebase.
- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- Improve the calculation of changed ranges by utilising mapping
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Support both ESM and CJS.
- SSR features are removed.
- Update ProseMirror packages.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.16
  - jest-prosemirror@2.0.0-beta.16
  - @remirror/core@2.0.0-beta.16
  - @remirror/dom@2.0.0-beta.16
  - @remirror/preset-core@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages.
- Update prosemirror packages.
- Removes `domino` from the codebase.
- Expose the return type of the throttle and debounce helpers
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Support both ESM and CJS.
- Update ProseMirror dependencies.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror packages to latest versions.
- Correct diff message ouputed by `toEqualRemirrorState`.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.15
  - @remirror/preset-core@2.0.0-beta.15
  - @remirror/pm@2.0.0-beta.15
  - jest-prosemirror@2.0.0-beta.15
  - @remirror/core@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages to latest versions.
- Update ProseMirror packages.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror dependencies.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Update prosemirror packages.
- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.14
  - @remirror/preset-core@2.0.0-beta.14
  - @remirror/core@2.0.0-beta.14
  - jest-prosemirror@2.0.0-beta.14
  - @remirror/pm@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update prosemirror packages.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update ProseMirror packages.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Try to require JSDOM implicitly in node environment.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Correct diff message ouputed by `toEqualRemirrorState`.
- Update ProseMirror dependencies.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.13
  - @remirror/pm@2.0.0-beta.13
  - @remirror/dom@2.0.0-beta.13
  - @remirror/preset-core@2.0.0-beta.13
  - @remirror/core@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Update ProseMirror dependencies.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Correct diff message ouputed by `toEqualRemirrorState`.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Update ProseMirror packages.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Update prosemirror packages.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.12
  - @remirror/core@2.0.0-beta.12
  - @remirror/dom@2.0.0-beta.12
  - @remirror/pm@2.0.0-beta.12
  - @remirror/preset-core@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages.
- SSR features are removed.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.11
  - @remirror/preset-core@2.0.0-beta.11
  - jest-prosemirror@2.0.0-beta.11
  - @remirror/core@2.0.0-beta.11
  - @remirror/pm@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Update prosemirror packages.
- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Update ProseMirror packages.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Update ProseMirror packages to latest versions.
- Add a customisible floating button to completely delete React tables.

  Fix creating React tables from markdown initial state.

  Fix copy and paste of React tables, which resulted in duplicated controlled cells.

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.10
  - jest-prosemirror@2.0.0-beta.10
  - @remirror/core@2.0.0-beta.10
  - @remirror/dom@2.0.0-beta.10
  - @remirror/preset-core@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update ProseMirror packages to latest versions.
- Update prosemirror packages.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- SSR features are removed.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.9
  - @remirror/core@2.0.0-beta.9
  - @remirror/dom@2.0.0-beta.9
  - @remirror/pm@2.0.0-beta.9
  - @remirror/preset-core@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- Update ProseMirror packages to latest versions.
- SSR features are removed.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Try to require JSDOM implicitly in node environment.
- Update ProseMirror packages.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.8
  - @remirror/preset-core@2.0.0-beta.8
  - @remirror/pm@2.0.0-beta.8
  - jest-prosemirror@2.0.0-beta.8
  - @remirror/core@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- SSR features are removed.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Update ProseMirror packages to latest versions.
- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- Update ProseMirror packages.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core@2.0.0-beta.7
  - @remirror/dom@2.0.0-beta.7
  - @remirror/preset-core@2.0.0-beta.7
  - @remirror/pm@2.0.0-beta.7
  - jest-prosemirror@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Set style `white-space` as `break-spaces` to wrap end-of-lines spaces.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Try to require JSDOM implicitly in node environment.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Correct diff message ouputed by `toEqualRemirrorState`.
- Update prosemirror packages.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.6
  - @remirror/preset-core@2.0.0-beta.6
  - @remirror/pm@2.0.0-beta.6
  - jest-prosemirror@2.0.0-beta.6
  - @remirror/core@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Correct diff message ouputed by `toEqualRemirrorState`.
- Try to require JSDOM implicitly in node environment.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Removes the following CSS variables:

  ```
  --rmr-color-selection-background: Highlight;
  --rmr-color-selection-shadow: inherit;
  --rmr-color-selection-text: HighlightText;
  --rmr-color-selection-caret: inherit;
  ```

  This brings more natural selection colors to the editor.

- Update prosemirror packages.
- SSR features are removed.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.5
  - @remirror/core@2.0.0-beta.5
  - @remirror/dom@2.0.0-beta.5
  - @remirror/preset-core@2.0.0-beta.5
  - @remirror/pm@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Correct diff message ouputed by `toEqualRemirrorState`.
- Update prosemirror packages.
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- Try to require JSDOM implicitly in node environment.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.4
  - jest-prosemirror@2.0.0-beta.4
  - @remirror/core@2.0.0-beta.4
  - @remirror/dom@2.0.0-beta.4
  - @remirror/preset-core@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Update prosemirror packages.
- Standardize the `contextmenu` and `hover` events to return event as first parameter
- Expose the return type of the throttle and debounce helpers
- SSR features are removed.
- Update ProseMirror packages to latest versions.
- Correct diff message ouputed by `toEqualRemirrorState`.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/pm@2.0.0-beta.3
  - jest-prosemirror@2.0.0-beta.3
  - @remirror/core@2.0.0-beta.3
  - @remirror/dom@2.0.0-beta.3
  - @remirror/preset-core@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Minor Changes

- Add a new Jest matcher `toEqualRemirrorState`, which can check that `EditorState` passed in has the same document and same selection as the expected tagged document.

  ```ts
  test('jest test', () => {
    // Only checks that the document is the same
    expect(view.state).toEqualRemirrorState(doc(p(`This is SPARTA`)));

    // Checks both document and selection
    expect(view.state).toEqualRemirrorState(doc(p(`This is <head>SPARTA<anchor>`)));
    expect(view.state).not.toEqualRemirrorState(doc(p(`This is <cursor>SPARTA`)));
  });
  ```

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Update prosemirror packages.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - jest-prosemirror@2.0.0-beta.2
  - @remirror/core@2.0.0-beta.2
  - @remirror/dom@2.0.0-beta.2
  - @remirror/pm@2.0.0-beta.2
  - @remirror/preset-core@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Standardize the `contextmenu` and `hover` events to return event as first parameter
- SSR features are removed.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/dom@2.0.0-beta.1
  - @remirror/preset-core@2.0.0-beta.1
  - @remirror/core@2.0.0-beta.1
  - jest-prosemirror@2.0.0-beta.1
  - @remirror/pm@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - jest-prosemirror@2.0.0-beta.0
  - @remirror/core@2.0.0-beta.0
  - @remirror/dom@2.0.0-beta.0
  - @remirror/pm@2.0.0-beta.0
  - @remirror/preset-core@2.0.0-beta.0

## 1.0.46

> 2022-05-31

### Patch Changes

- Lock ProseMirror pacakges to lower versions.

  The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

  See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624

- Updated dependencies []:
  - @remirror/pm@1.0.20
  - jest-prosemirror@1.0.29

## 1.0.45

> 2022-05-31

### Patch Changes

- Add the ability to remove all marks via the `removeMark` command, by passing `{ type: null }`

* Fix `removeMark` to support multiple mark ranges

* Updated dependencies []:
  - @remirror/core@1.4.6
  - @remirror/dom@1.0.30
  - @remirror/preset-core@1.0.29
  - jest-prosemirror@1.0.28

## 1.0.44

> 2022-05-24

### Patch Changes

- Add a built in extension allowing external code to subscribe to document changes.

  ```ts
  manager.getExtension(DocChangedExtension).addHandler('docChanged', mock);
  ```

- Updated dependencies []:
  - @remirror/core@1.4.5
  - @remirror/dom@1.0.29
  - @remirror/preset-core@1.0.28

## 1.0.43

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - jest-prosemirror@1.0.27
  - @remirror/core@1.4.4
  - @remirror/dom@1.0.28
  - @remirror/preset-core@1.0.27

## 1.0.42

> 2022-05-16

### Patch Changes

- Fix open depths in node paste rules.

  When excuting a node paste rule, only reset open depths ([openStart](https://prosemirror.net/docs/ref/#model.Slice.openStart) and [openEnd](https://prosemirror.net/docs/ref/#model.Slice.openEnd)) when the node paste rule is actually applied and it's for a block node.

  This patch will fix the extra paragraph after pasting text.

* Throw error when receiving a non-top-level node.

* Updated dependencies []:
  - jest-prosemirror@1.0.26
  - @remirror/pm@1.0.19

## 1.0.41

> 2022-05-05

### Patch Changes

- Add a new option `selectionBuilder` in `YjsOptions`, which will be passed to `yCursorPlugin` directly.

* Update ProseMirror packages.

- Update `y-prosemirror` to `^1.0.19`.

* Allow `transformMatch` to invalidate a paste rule by explicitly returning `false`

* Updated dependencies []:
  - jest-prosemirror@1.0.25
  - @remirror/pm@1.0.18

## 1.0.40

> 2022-05-03

### Patch Changes

- Paste multiple block nodes correctly.

- Updated dependencies []:
  - jest-prosemirror@1.0.24
  - @remirror/pm@1.0.17

## 1.0.39

> 2022-04-26

### Patch Changes

- Update dependencies.

- Updated dependencies []:
  - jest-prosemirror@1.0.23

## 1.0.38

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/dom@1.0.27
  - @remirror/preset-core@1.0.26

## 1.0.37

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

* Create a "stepping stone" for future standardisation of useEvent types

  Add a second parameter to handlers for `hover` and `contextmenu` types, so we can eventually standarise the hook to pass event as the first argument.

  ```tsx
  const handleHover = useCallback(({ event: MouseEvent }, props: HoverEventHandlerState) => {
    const { getNode, hovering, ...rest } = props;
    console.log('node', getNode(), 'is hovering', hovering, 'rest', rest);

    return false;
  }, []);

  useEvent('hover', handleHover);
  ```

* Updated dependencies []:
  - jest-prosemirror@1.0.22
  - @remirror/core@1.4.2
  - @remirror/dom@1.0.26
  - @remirror/preset-core@1.0.25

## 1.0.36

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

- Updated dependencies []:
  - @remirror/pm@1.0.16
  - jest-prosemirror@1.0.21

## 1.0.35

> 2022-03-31

### Patch Changes

- Add support for Unicode Regexp in suggestion matching.

  The change was required to support matching non-latin characters in `MentionAtomExtension` and `MentionExtension` i.e. by using `supportedCharacters: /\p{Letter}+/u` in `matchers` definition.

  There is no need to update the code: changes are backwards compatible with no behavior change at all.

- Updated dependencies []:
  - jest-prosemirror@1.0.20
  - @remirror/pm@1.0.15

## 1.0.34

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

* Add client rect methods when createRange is not available

* Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/dom@1.0.25
  - @remirror/preset-core@1.0.24

## 1.0.33

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/dom@1.0.24
  - @remirror/preset-core@1.0.23

## 1.0.32

> 2022-03-08

### Patch Changes

- When using `prosemirror-suggest`, if `appendTransaction` is `true`, make sure the match state will be updated after every transaction.

- Updated dependencies []:
  - jest-prosemirror@1.0.19
  - @remirror/pm@1.0.14

## 1.0.31

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - @remirror/dom@1.0.23

## 1.0.30

> 2022-03-06

### Patch Changes

- Add `default` filed in the `package.json`.

## 1.0.29

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/dom@1.0.22
  - @remirror/preset-core@1.0.22

## 1.0.28

> 2022-03-01

### Patch Changes

- Fix an issue that causes the selected text being deleted when pasting.

* Make the result more accurate when pasting plain text from the clipboard.

* Updated dependencies []:
  - jest-prosemirror@1.0.18
  - @remirror/pm@1.0.13

## 1.0.27

> 2022-02-25

### Patch Changes

- Fixes an issue that causes invalid duplicate marks when using `pasteRules` plugin.

* Fixes an issue that causes some text nodes to be deleted when using `replaceSelection`.

* Updated dependencies []:
  - jest-prosemirror@1.0.17
  - @remirror/pm@1.0.12

## 1.0.26

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - jest-prosemirror@1.0.16
  - @remirror/core@1.3.6
  - @remirror/dom@1.0.21
  - @remirror/preset-core@1.0.21

## 1.0.25

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/dom@1.0.20
  - @remirror/preset-core@1.0.20

## 1.0.24

> 2022-02-08

### Patch Changes

- Add support for attribute filtering for `useActive` and `useAttrs` hooks when used with marks.

  This provides consistent behaviour for the hook, aligning with functionality provided for node types.

  ```tsx
  const active = useActive();

  // Previously this ignored passed attributes and only checked the mark's type
  //
  // Now this will only return true if mark type is active AND its color attribute is red
  const isActive = active.textColor({ color: 'red' });
  ```

- Updated dependencies []:
  - @remirror/core@1.3.5
  - @remirror/dom@1.0.19
  - @remirror/preset-core@1.0.19
  - jest-prosemirror@1.0.15

## 1.0.23

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - jest-prosemirror@1.0.14
  - @remirror/core@1.3.4
  - @remirror/dom@1.0.18
  - @remirror/preset-core@1.0.18

## 1.0.22

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.11
  - jest-prosemirror@1.0.13

## 1.0.21

> 2022-01-11

### Patch Changes

- Deprecate `getTheme` and `getThemeProps` in favour of new methods `getThemeVar` and `getThemeVarName`.

  This removes a code path that used an ES6 Proxy, which cannot be polyfilled.

  ```
  getTheme((t) => t.color.primary.text) => `var(--rmr-color-primary-text)`

  getThemeProps((t) => t.color.primary.text) => `--rmr-color-primary-text`
  ```

  ```
  getThemeVar('color', 'primary', 'text') => `var(--rmr-color-primary-text)`

  getThemeVarName('color', 'primary', 'text') => `--rmr-color-primary-text`
  ```

- Updated dependencies []:
  - @remirror/dom@1.0.17
  - @remirror/preset-core@1.0.17

## 1.0.20

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/dom@1.0.16
  - jest-prosemirror@1.0.12
  - @remirror/pm@1.0.10
  - @remirror/preset-core@1.0.16

## 1.0.19

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/dom@1.0.15
  - @remirror/preset-core@1.0.15

## 1.0.18

> 2021-12-06

### Patch Changes

- Update ProseMirror dependencies.

- Updated dependencies []:
  - @remirror/pm@1.0.9
  - jest-prosemirror@1.0.11

## 1.0.17

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - jest-prosemirror@1.0.10
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2
  - @remirror/dom@1.0.14
  - @remirror/preset-core@1.0.14

## 1.0.16

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

* Update ProseMirror dependencies.

* Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/dom@1.0.13
  - @remirror/preset-core@1.0.13
  - @remirror/pm@1.0.7
  - jest-prosemirror@1.0.9

## 1.0.15

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0
  - @remirror/dom@1.0.12
  - @remirror/preset-core@1.0.12

## 1.0.14

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - jest-prosemirror@1.0.8
  - @remirror/core@1.2.2
  - @remirror/dom@1.0.11
  - @remirror/pm@1.0.6
  - @remirror/preset-core@1.0.11

## 1.0.13

> 2021-10-29

### Patch Changes

- Update prosemirror packages.

- Updated dependencies []:
  - @remirror/pm@1.0.5
  - jest-prosemirror@1.0.7

## 1.0.12

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/dom@1.0.10
  - @remirror/preset-core@1.0.10
  - jest-prosemirror@1.0.6
  - @remirror/pm@1.0.4

## 1.0.11

> 2021-10-20

### Patch Changes

- Exposes a function `hasUploadingFile` to determine if file uploads are currently taking place.

  When a user drops a file, a file node is created without a href attribute - this attribute is set once the file has uploaded.

  However if a user saves content, before uploads are complete we can be left with "broken" file nodes. This exposed function allows us to check if file uploads are still in progress.

  Addtionally file nodes now render valid DOM attributes. Rather than `href` and `error`, they now render `data-url` and `data-error`.

* **BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured to enable persistent selection. You can set it as `'selection'` to match the default styles provided by `@remirror/styles`.

  If you are using `@remirror/react`, you can enable it like this:

  ```tsx
  import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

  function Editor(): JSX.Element {
    const { manager } = useRemirror({ builtin: { persistentSelectionClass: 'selection' } });
    return (
      <ThemeProvider>
        <Remirror manager={manager} />
      </ThemeProvider>
    );
  }
  ```

  In the interest of performance, the persistent selection will only be displayed if the editor loses focus.

* Updated dependencies []:
  - @remirror/core@1.2.0
  - @remirror/dom@1.0.9
  - @remirror/preset-core@1.0.9

## 1.0.10

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/dom@1.0.8
  - @remirror/preset-core@1.0.8
  - jest-prosemirror@1.0.5
  - @remirror/pm@1.0.3

## 1.0.9

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/dom@1.0.7
  - @remirror/preset-core@1.0.7

## 1.0.8

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/dom@1.0.6
  - @remirror/preset-core@1.0.6

## 1.0.7

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/dom@1.0.5
  - @remirror/preset-core@1.0.5

## 1.0.6

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

- Updated dependencies []:
  - @remirror/dom@1.0.4
  - @remirror/preset-core@1.0.4
  - @remirror/core@1.1.0

## 1.0.5

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/dom@1.0.3
  - @remirror/preset-core@1.0.3

## 1.0.4

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/dom@1.0.2
  - @remirror/preset-core@1.0.2

## 1.0.3

> 2021-08-18

### Patch Changes

- Update dependency `prosemirror-gapcursor` to `^1.1.5`.

- Updated dependencies []:
  - @remirror/pm@1.0.2
  - jest-prosemirror@1.0.4

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

- Updated dependencies [[`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - jest-prosemirror@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - jest-prosemirror@1.0.1
  - @remirror/core@1.0.1
  - @remirror/dom@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/preset-core@1.0.1

## 1.0.0

> 2021-07-17

### Major Changes

- [#983](https://github.com/remirror/remirror/pull/983) [`47df75996`](https://github.com/remirror/remirror/commit/47df75996e26b9e8fc9b070e5444494605321610) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade to [`@testing-library/dom@8.0.0`](https://github.com/testing-library/dom-testing-library/releases/tag/v8.0.0) which has breaking changes for downstream users.

* [#706](https://github.com/remirror/remirror/pull/706) [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Here's what's changed in the beta release.

  - [x] Improved `react` API
  - [x] Full `markdown` support with the `@remirror/extension-markdown` package.
  - [x] Full formatting support
  - [x] i18n support
  - [x] A11y support for react via `reakit`
  - [ ] Component Library (work in progress)
  - [ ] Start adding experimental react native support (mostly done)
  - [ ] Todo list extension (not started)
  - [ ] New math extension (not started)
  - [ ] New pagination extension (not started)
  - [ ] New text wrap extension (not started)

  ### Delayed

  - ~Experimental svelte support~ - This will be added later in the year.

  ## Breaking

  - Upgrade minimum TypeScript version to `4.1`.
  - Editor selection now defaults to the `end` of the document.
  - Rename all `*Parameter` interfaces to `*Props`. With the exception of \[React\]FrameworkParameter which is now \[React\]FrameworkOptions.
  - Remove `Presets` completely. In their place a function that returns a list of `Extension`s should be used. They were clunky, difficult to use and provided little to no value.
  - Add core exports to `remirror` package
  - Add all Extensions and Preset package exports to the `remirror/extensions` subdirectory. It doesn't include framework specific exports which are made available from `@remirror/react`
  - Remove `remirror/react` which has been replaced by `@remirror/react`
  - `@remirror/react` includes which includes all the react exports from all the react packages which can be used with remirror.
  - Remove `@remirror/showcase` - examples have been provided on how to achieve the same effect.
  - Remove `@remirror/react-social`
  - Remove `@remirror/react-wysiwyg`
  - Rename `useRemirror` -> `useRemirrorContext`
  - Replace `useManager` with better `useRemirror` which provides a lot more functionality.
  - Rename `preset-table` to `extension-tables`
  - Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
  - New `createDecorations` extension method for adding decorations to the prosemirror view.
  - Create new decorator pattern for adding `@commands`, `@helper` functions and `@keyBindings`.
  - Deprecate `tags` property on extension and encourage the use of `createTags` which is a method instead.
  - Add `onApplyState` and `onInitState` lifecycle methods.
  - Add `onApplyTransaction` method.
  - Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
  - Rewrite the `DropCursor` to support animations and interactions with media.
  - Add support updating the doc attributes.
  - Deprecate top level context methods `focus` and `blur`. They should now be consumed as commands
  - Remove package `@remirror/extension-auto-link`.

  ### `ExtensionStore`

  - Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
  - Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

  One of the big changes is a hugely improved API for `@remirror/react`.

  ### `@remirror/extension-positioner`

  - New `Rect` interface returned by the positioner `x: number; y: number; width: number; height: number;`
  - Added `visible` property which shows if the position currently visible within the editor viewport.
  - Improved scrolling when using the positioner.
  - Fixed a lot of bugs in the positioner API.
  - This DOMRect represents an absolute position within the document. It is up to your consuming component to consume the rect.
  - `@remirror/react-components` exports `PositionerComponent` which internally
  - Renamed the positioners in line with the new functionality.

  ```tsx
  import React from 'react';
  import { fromHtml, toHtml } from 'remirror';
  import { BoldExtension, CorePreset, ItalicExtension } from 'remirror/extension';
  import { Remirror, useRemirror, useRemirrorContext } from '@remirror/react';

  const Editor = () => {
    const { manager, onChange, state } = useRemirror({
      extensions: () => [new BoldExtension(), new ItalicExtension()],
      content: 'asdfasdf',
      stringHandler: '',
    });

    return <Remirror manager={manager} onChange={onChange} state={state} />;
  };
  ```

  When no children are provided to the

  The previous `useRemirror` is now called `useRemirrorContext` since it plucks the context from the outer `Remirror` Component. The `<RemirrorProvider />` has been renamed to `<Remirror />` and automatically renders an editor.

  `useManager` has been marked as `@internal` (although it is still exported) and going forward you should be using `useRemirror` as shown in the above example.

  Per library expected changes.

  ### `@remirror/extension-tables`

  With the new support for extensions which act as parents to other extensions the table extension has now become a preset extension. It is no longer needed and has been renamed to it's initial name

  ### UI Commands

  - Add commands with UI configuration and i18n text descriptions
  - `@command`, `@keyBinding`, `@helper` decorators for more typesafe configuration of extensions.
  - `NameShortcut` keybindings which can be set in the keymap extension
  - `overrides` property

  ### Accessibility as a priority

  Actively test for the following

  - [ ] Screen Readers
  - [ ] Braille display
  - [ ] Zoom functionality
  - [ ] High contrast for the default theme

  ### Caveats around inference

  - Make sure all your commands in an extension are annotated with a return type of `CommandFunction`. Failure to do so will break all type inference wherever the extension is used.

    ```ts
    import { CommandFunction } from 'remirror';
    ```

  - When setting the name of the extension make sure to use `as const` otherwise it will be a string and ruin autocompletion for extension names, nodes and marks.

    ```ts
    class MyExtension extends PlainExtension {
      get name() {
        return 'makeItConst' as const;
      }
    }
    ```

  ### `@remirror/react-hooks`

  - Rename `useKeymap` to `useKeymaps`. The original `useKeymap` now has a different signature.

  ```tsx
  import { useCallback } from 'react';
  import { BoldExtension } from 'remirror/extensions';
  import {
    Remirror,
    useHelpers,
    useKeymap,
    useRemirror,
    useRemirrorContext,
  } from '@remirror/react';

  const hooks = [
    () => {
      const active = useActive();
      const { insertText } = useCommands();
      const boldActive = active.bold();
      const handler = useCallback(() => {
        if (!boldActive) {
          return false;
        }

        return insertText.original('\n\nWoah there!')(props);
      }, [boldActive, insertText]);

      useKeymap('Shift-Enter', handler); // Add the handler to the keypress pattern.
    },
  ];

  const Editor = () => {
    const { manager } = useRemirror({ extensions: () => [new BoldExtension()] });

    return <Remirror manager={manager} hooks={hooks} />;
  };
  ```

  - The `Remirror` component now has a convenient hooks props. The hooks prop takes an array of zero parameter hook functions which are rendered into the `RemirrorContext`. It's a shorthand to writing out your own components. You can see the pattern in use above.

  ### Commands

  There are new hooks for working with commands.

  - Each command has an `original` method attached for using the original command that was used to create the command. The original command has the same type signature as the `(...args: any[]) => CommandFunction`. So you would call it with the command arguments and then also provide the CommandProps. This is useful when composing commands together or using commands within keyBindings which need to return a boolean.

    - You can see the `insertText.original` being used in the `useKeymap` example above.

  - `useCommands()` provides all the commands as hook. `useChainedCommands` provides all the chainable commands.

    ```tsx
    import { useCallback } from 'react';
    import { useChainedCommands, useKeymap } from '@remirror/react';

    function useLetItGo() {
      const chain = useChainedCommands();
      const handler = useCallback(() => {
        chain.selectText('all').insertText('Let it goo 🤫').run();
      }, [chain]);

      // Whenever the user types `a` they let it all go
      useKeymap('a', handler);
    }
    ```

  ### Dependencies

  - Upgrade React to require minimum versions of ^16.14.0 || ^17. This is because of the codebase now using the [new jsx transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
  - Upgrade TypeScript to a minimum of `4.1`. Several of the new features make use of the new types and it is a requirement to upgrade.
  - General upgrades across all dependencies to using the latest versions.
    - All `prosemirror-*` packages.

  ### Issues addressed

  - Fixes #569
  - Fixes #452
  - Fixes #407
  - Fixes #533
  - Fixes #652
  - Fixes #654
  - Fixes #480
  - Fixes #566
  - Fixes #453
  - Fixes #508
  - Fixes #715
  - Fixes #531
  - Fixes #535
  - Fixes #536
  - Fixes #537
  - Fixes #538
  - Fixes #541
  - Fixes #542
  - Fixes #709
  - Fixes #532
  - Fixes #836
  - Fixes #834
  - Fixes #823
  - Fixes #820
  - Fixes #695
  - Fixes #793
  - Fixes #800
  - Fixes #453
  - Fixes #778
  - Fixes #757
  - Fixes #804
  - Fixes #504
  - Fixes #566
  - Fixes #714
  - Fixes #37

### Minor Changes

- [#905](https://github.com/remirror/remirror/pull/905) [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `from` and `to` to the editor callback in `jest-remirror`.

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`5c981d96d`](https://github.com/remirror/remirror/commit/5c981d96d9344f2507f32a4213bd55c17bfcd92f), [`47df75996`](https://github.com/remirror/remirror/commit/47df75996e26b9e8fc9b070e5444494605321610), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - jest-prosemirror@1.0.0
  - @remirror/dom@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.60
  - @remirror/dom@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/preset-core@1.0.0-next.60
  - jest-prosemirror@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.59
  - @remirror/dom@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/preset-core@1.0.0-next.59
  - jest-prosemirror@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/dom@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/preset-core@1.0.0-next.58
  - jest-prosemirror@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.57
  - @remirror/dom@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/preset-core@1.0.0-next.57
  - jest-prosemirror@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.56
  - @remirror/dom@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/preset-core@1.0.0-next.56
  - jest-prosemirror@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/core@1.0.0-next.55
  - @remirror/dom@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/preset-core@1.0.0-next.55
  - jest-prosemirror@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/dom@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/preset-core@1.0.0-next.54
  - jest-prosemirror@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/dom@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/preset-core@1.0.0-next.53
  - jest-prosemirror@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.52
  - @remirror/dom@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/preset-core@1.0.0-next.52
  - jest-prosemirror@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core@1.0.0-next.51
  - @remirror/dom@1.0.0-next.51
  - @remirror/preset-core@1.0.0-next.51
  - jest-prosemirror@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core@1.0.0-next.50
  - @remirror/dom@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/preset-core@1.0.0-next.50
  - jest-prosemirror@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.49
  - @remirror/dom@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/preset-core@1.0.0-next.49
  - jest-prosemirror@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/dom@1.0.0-next.48
  - @remirror/preset-core@1.0.0-next.48
  - jest-prosemirror@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/dom@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - jest-prosemirror@1.0.0-next.47
  - @remirror/preset-core@1.0.0-next.47

## 1.0.0-next.46

> 2020-10-06

### Patch Changes

- Updated dependencies [[`0198b9fc`](https://github.com/remirror/remirror/commit/0198b9fce5caa1c7d4670e615b92b1231a0c2e26)]:
  - jest-prosemirror@1.0.0-next.46

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/dom@1.0.0-next.45
  - @remirror/preset-core@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- [`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68) [#731](https://github.com/remirror/remirror/pull/731) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix support for `jest-remirror` with versions before the `16` release.

  Deprecate `jsdomExtras` which has been replaced by `jsdomPolyfill`.

* [`8ce923a4`](https://github.com/remirror/remirror/commit/8ce923a46a269a56782704b5bda15e918a897b9a) [#733](https://github.com/remirror/remirror/pull/733) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix incorrect usage of `endsWith` in `ValidityTest`s.

* Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/preset-core@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/dom@1.0.0-next.44
  - jest-prosemirror@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.43
  - jest-prosemirror@1.0.0-next.43
  - @remirror/dom@1.0.0-next.43
  - @remirror/preset-core@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.42
  - jest-prosemirror@1.0.0-next.42
  - @remirror/dom@1.0.0-next.42
  - @remirror/preset-core@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/dom@1.0.0-next.41
  - @remirror/preset-core@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade external dependencies.

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - jest-prosemirror@1.0.0-next.40
  - @remirror/dom@1.0.0-next.40
  - @remirror/preset-core@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/dom@1.0.0-next.39
  - @remirror/preset-core@1.0.0-next.39
  - jest-prosemirror@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/dom@1.0.0-next.38
  - @remirror/preset-core@1.0.0-next.38
  - jest-prosemirror@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - @remirror/dom@1.0.0-next.37
  - @remirror/preset-core@1.0.0-next.37
  - jest-prosemirror@1.0.0-next.37

## 1.0.0-next.36

> 2020-09-13

### Patch Changes

- Updated dependencies [[`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7)]:
  - @remirror/dom@1.0.0-next.36

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`f1b8fc46`](https://github.com/remirror/remirror/commit/f1b8fc46a56877c1b7274f19e808901f9716e25e) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Cleanup matchers.

* [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade linaria and other dependencies

- Updated dependencies [[`f1b8fc46`](https://github.com/remirror/remirror/commit/f1b8fc46a56877c1b7274f19e808901f9716e25e), [`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3)]:
  - jest-prosemirror@1.0.0-next.35
  - @remirror/core@1.0.0-next.35
  - @remirror/dom@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/preset-core@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc) [#668](https://github.com/remirror/remirror/pull/668) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `node` cursor selection. Now it selects the right node position.

* [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be) [#665](https://github.com/remirror/remirror/pull/665) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Refactor `RemirrorManager` and rename `EditorWrapper` to `Framework`.

  - New `BaseFramework` interface which is implemented by the abstract `Framework` class and used by the `RemirrorManager` to keep hold of an instance of the `Framework`.
  - New `attachFramework` method on the manager.
  - Update `doc` property to `document` throughout the codebase. `doc` could be confused with the `doc` node or the actual document. Now it's clearer. Any time `doc` is mentioned in the code base it refers to the `ProseMirror` node. Any time `document` is mentioned it is referring to the DOM.
  - Remove `SocialEditorWrapperComponent` export from `@remirror/react-social`.

- [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0) [#667](https://github.com/remirror/remirror/pull/667) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix name tests for `extensionValidityTest` and `presetValidityTest`.

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be)]:
  - @remirror/core@1.0.0-next.34
  - jest-prosemirror@1.0.0-next.34
  - @remirror/dom@1.0.0-next.34
  - @remirror/preset-core@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 7a34e15d: Add `forwardDelete` to `jest-remirror` and `jest-prosemirror`.
- 92ed4135: Add support for `anchor` and `head` cursors when writing tests. Also fix `selectText` when position is `0`.

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [92ed4135]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [d47bd78f]
  - jest-prosemirror@1.0.0-next.33
  - @remirror/core@1.0.0-next.33
  - @remirror/dom@1.0.0-next.33
  - @remirror/preset-core@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies [[`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d)]:
  - @remirror/core@1.0.0-next.32
  - jest-prosemirror@1.0.0-next.32
  - @remirror/dom@1.0.0-next.32
  - @remirror/preset-core@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Patch Changes

- [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `selectText` command to `CommandsExtension`. Also add `dispatchCommand` for running custom commands to `CommandsExtension`.

  Fix broken command text selection in `jest-remirror` and improve `jest-remirror` type inference for the `renderEditor().view` property.

* [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for using a custom schema when creating the editor.

  - Also add support for additional `plugins` and `nodeView`'s via the manager settings.

* Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/core@1.0.0-next.31
  - @remirror/dom@1.0.0-next.31
  - @remirror/preset-core@1.0.0-next.31
  - jest-prosemirror@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/dom@1.0.0-next.29
  - @remirror/preset-core@1.0.0-next.29
  - jest-prosemirror@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Minor Changes

- [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d) [#591](https://github.com/remirror/remirror/pull/591) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for nested content within `ReactComponent` node views. Also support adding multiple components to the manager via the `nodeViewComponents` setting. Currently `ReactNodeView` components must be defined at initialization, and marks are not supported.

  - Also enforce minimum required extensions for the manager passed to the `RemirrorProvider`.
  - Some general cleanup and refactoring.
  - Add support for composing refs when using `getRootProps`. Now you can add your own ref to the `getRootProps({ ref })` function call which will be populated at the same time.
  - Test the names of `Extension`'s and `Preset`'s in with `extensionValidityTest`.
  - **BREAKING CHANGES** 💥
    - Rename: `ReactSSRExtension` => `ReactSsrExtension`
    - Rename: `ReactComponentExtension.name` from `reactNodeView` => `reactComponent`.
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `SuggestExtension.name` from `suggestions` => `suggest`

### Patch Changes

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/dom@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - jest-prosemirror@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/dom@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - jest-prosemirror@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/dom@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - jest-prosemirror@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/dom@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- 65638a1c: Fix cyclic JSON error when tests when tests failed.
- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

- Updated dependencies [9ab1d0f3]
- Updated dependencies [65638a1c]
- Updated dependencies [45d82746]
- Updated dependencies [113560bb]
  - @remirror/core@1.0.0-next.22
  - jest-prosemirror@1.0.0-next.22
  - @remirror/dom@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/dom@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - jest-prosemirror@0.8.4-next.6
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- 770e3d4a: Update package dependencies.
- 92653907: Upgrade package dependencies.
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/pm@1.0.0-next.20
  - jest-prosemirror@1.0.0-next.5
  - @remirror/core@1.0.0-next.20
  - @remirror/dom@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- Updated dependencies [898c62e0]
  - @remirror/core@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/dom@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.

### Minor Changes

- 720c9b43: Add validity check function exports to `jest-remirror`.

  - `presetValidityTest` for testing your `Preset`.
  - `extensionValidityTest` for testing your `Extension`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- 68c524ee: Remove ESModule build which is not supported by jest.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [68c524ee]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/dom@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - jest-prosemirror@1.0.0-next.4

## 1.0.0-next.15

> 2020-07-31

### Minor Changes

- 843c18e7: Add `chain` method to `RemirrorTestChain` and update select text to receive `all` for selecting all text.

### Patch Changes

- 9de09793: Fix the dependencies.
- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/dom@1.0.0-next.15

## 1.0.0-next.10

> 2020-07-26

### Major Changes

- 9b132f23: Remove `renderEditorString` method for testing SSR editors.

### Patch Changes

- Updated dependencies [6468058a]
  - @remirror/core@1.0.0-next.10
  - @remirror/dom@1.0.0-next.10

## 1.0.0-next.6

> 2020-07-20

### Patch Changes

- cf4656a6: Remove `remirror` from the dependencies of `jest-remirror`

## 1.0.0-next.5

> 2020-07-17

### Patch Changes

- 5ebf2827: Fix broken `jest-prosemirror/environment` import and `jest-remirror/environment` for automatic setup. Also enable the `jest-prosemirror/serializer` to correctly serialize the prosemirror content.
- Updated dependencies [d186b75a]
- Updated dependencies [5ebf2827]
  - remirror@1.0.0-next.5
  - jest-prosemirror@1.0.0-next.3

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/pm@1.0.0-next.4
  - jest-prosemirror@1.0.0-next.2
  - remirror@1.0.0-next.4

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/pm@1.0.0-next.1
  - jest-prosemirror@1.0.0-next.1
  - remirror@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.
- dd16d45d: Rewrite packages using the new API

### Minor Changes

- 9a699e80: Upgrade dependencies to use v26.0.0 of jest.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [8334294e]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [9a699e80]
- Updated dependencies [dd16d45d]
- Updated dependencies [8334294e]
  - @remirror/pm@1.0.0-next.0
  - jest-prosemirror@1.0.0-next.0
  - remirror@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/react@0.13.1

## 0.11.1

### Patch Changes

- 000fdfb0: Upgraded external dependencies with major releases.
- Updated dependencies [d2a288aa]
- Updated dependencies [5888a7aa]
- Updated dependencies [000fdfb0]
  - jest-prosemirror@0.8.2
  - @remirror/core-extensions@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0

## 0.8.1

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - jest-prosemirror@0.8.1
  - @remirror/react-utils@0.7.6
  - @remirror/react@0.7.7

## 0.8.0

### Minor Changes

- 527395be: `renderEditor` now accepts PrioritizedExtensions for more flexible testing.

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - jest-prosemirror@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/react@0.7.6

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/react@0.7.5
  - jest-prosemirror@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react@0.7.3
  - @remirror/react-utils@0.7.3
  - jest-prosemirror@0.7.3
