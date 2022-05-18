# @remirror/extension-file

## 0.3.25

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4
  - @remirror/react@1.0.37
  - @remirror/react-components@1.0.34

## 0.3.24

> 2022-05-03

### Patch Changes

- Insert emoticons when hitting the Enter key (rather than requiring a space)

- Updated dependencies []:
  - @remirror/react@1.0.36
  - @remirror/react-components@1.0.33
  - @remirror/pm@1.0.17

## 0.3.23

> 2022-04-26

### Patch Changes

- Add a new hook `useExtensionEvent`. You can use it to add event handlers to your extension. It's simpler and easier to use than the existed `useExtension` hook.

  It accepts an extension class, an event name and a memoized handler. It's important to make sure that the handler is memoized to avoid needless updates.

  Here is an example of using `useExtensionEvent`:

  ```ts
  import { useCallback } from 'react';
  import { HistoryExtension } from 'remirror/extensions';
  import { useExtensionEvent } from '@remirror/react';

  const RedoLogger = () => {
    useExtensionEvent(
      HistoryExtension,
      'onRedo',
      useCallback(() => log('a redo just happened'), []),
    );

    return null;
  };
  ```

* Update dependencies.

- Fix a crash with React v18 in development mode.

- Updated dependencies []:
  - @remirror/react@1.0.35
  - @remirror/react-components@1.0.32

## 0.3.22

> 2022-04-25

### Patch Changes

- Fix a potential out of range error.

- Updated dependencies []:
  - @remirror/react@1.0.34
  - @remirror/react-components@1.0.31

## 0.3.21

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/react@1.0.33
  - @remirror/react-components@1.0.30

## 0.3.20

> 2022-04-20

### Patch Changes

- Reorder the external plugins of the tables extensions, to avoid highlighting cells while resizing.

  Proposed by Pierre\_ on Discord

* Prevent marks in MentionAtom, to prevent input rules being triggered within the node

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
  - @remirror/react@1.0.32
  - @remirror/react-components@1.0.29
  - @remirror/core@1.4.2

## 0.3.19

> 2022-04-04

### Patch Changes

- deleted an incorrect preselectClass style on react-table-extension

- Updated dependencies []:
  - @remirror/react@1.0.31

## 0.3.18

> 2022-04-01

### Patch Changes

- Borders will be applied for table headers on hover of column controller

- Updated dependencies []:
  - @remirror/react@1.0.30

## 0.3.17

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/react@1.0.29
  - @remirror/react-components@1.0.28

## 0.3.16

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/react@1.0.28
  - @remirror/react-components@1.0.27

## 0.3.15

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - @remirror/react@1.0.27
  - @remirror/react-components@1.0.26

## 0.3.14

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/react@1.0.26
  - @remirror/react-components@1.0.25

## 0.3.13

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6
  - @remirror/react@1.0.25
  - @remirror/react-components@1.0.24

## 0.3.12

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1
  - @remirror/react@1.0.24
  - @remirror/react-components@1.0.23

## 0.3.11

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
  - @remirror/react@1.0.23
  - @remirror/react-components@1.0.22

## 0.3.10

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4
  - @remirror/react@1.0.22
  - @remirror/react-components@1.0.21

## 0.3.9

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
  - @remirror/theme@1.2.0
  - @remirror/react@1.0.21
  - @remirror/react-components@1.0.20

## 0.3.8

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/react@1.0.20
  - @remirror/react-components@1.0.19
  - @remirror/theme@1.1.5

## 0.3.7

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/react@1.0.19
  - @remirror/react-components@1.0.18

## 0.3.6

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/react@1.0.18
  - @remirror/react-components@1.0.17

## 0.3.5

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/pm@1.0.8
  - @remirror/react-components@1.0.16
  - @remirror/core@1.3.2
  - @remirror/react@1.0.17

## 0.3.4

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/react@1.0.16
  - @remirror/react-components@1.0.15
  - @remirror/pm@1.0.7

## 0.3.3

> 2021-11-10

### Patch Changes

- Deleting a file using keyboard shortcuts should trigger `onDeleteFile` handler.

* Implement the `stopEvent` method in `ReactNodeView`.

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/react@1.0.15
  - @remirror/react-components@1.0.14
  - @remirror/core@1.3.0

## 0.3.2

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/pm@1.0.6
  - @remirror/react@1.0.14
  - @remirror/react-components@1.0.13

## 0.3.1

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/react@1.0.13
  - @remirror/react-components@1.0.12
  - @remirror/pm@1.0.4
  - @remirror/theme@1.1.4

## 0.3.0

> 2021-10-20

### Minor Changes

- Exposes a function `hasUploadingFile` to determine if file uploads are currently taking place.

  When a user drops a file, a file node is created without a href attribute - this attribute is set once the file has uploaded.

  However if a user saves content, before uploads are complete we can be left with "broken" file nodes. This exposed function allows us to check if file uploads are still in progress.

  Addtionally file nodes now render valid DOM attributes. Rather than `href` and `error`, they now render `data-url` and `data-error`.

### Patch Changes

- **BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured to enable persistent selection. You can set it as `'selection'` to match the default styles provided by `@remirror/styles`.

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

- Updated dependencies []:
  - @remirror/core@1.2.0
  - @remirror/react@1.0.12
  - @remirror/react-components@1.0.11

## 0.2.5

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/react@1.0.11
  - @remirror/react-components@1.0.10
  - @remirror/pm@1.0.3
  - @remirror/theme@1.1.3

## 0.2.4

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/react@1.0.10
  - @remirror/react-components@1.0.9

## 0.2.3

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/react@1.0.9
  - @remirror/react-components@1.0.8

## 0.2.2

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - @remirror/react@1.0.8
  - @remirror/react-components@1.0.7

## 0.2.1

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2
  - @remirror/react@1.0.7
  - @remirror/react-components@1.0.6

## 0.2.0

> 2021-08-29

### Minor Changes

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Updated dependencies []:
  - @remirror/theme@1.1.1
  - @remirror/react@1.0.6
  - @remirror/react-components@1.0.5
  - @remirror/core@1.1.0

## 0.1.5

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/react@1.0.5
  - @remirror/react-components@1.0.4

## 0.1.4

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/react@1.0.4
  - @remirror/react-components@1.0.3

## 0.1.3

> 2021-08-18

### Patch Changes

- Remove the playground API from `@remirror/react`.

- Updated dependencies []:
  - @remirror/pm@1.0.2
  - @remirror/react@1.0.3

## 0.1.2

> 2021-08-10

### Patch Changes

- [#1052](https://github.com/remirror/remirror/pull/1052) [`aa735349e`](https://github.com/remirror/remirror/commit/aa735349e8a1da0a2e7f03670fc9cae4977c9770) Thanks [@ocavue](https://github.com/ocavue)! - Make `FileExtension` selectable by default.

## 0.1.1

> 2021-08-10

### Patch Changes

- [#1050](https://github.com/remirror/remirror/pull/1050) [`28983b4a2`](https://github.com/remirror/remirror/commit/28983b4a26f974982856b4561beec58a7dd87ec4) Thanks [@ocavue](https://github.com/ocavue)! - Export `FileAttributes`.

## 0.1.0

> 2021-08-10

### Minor Changes

- [#1031](https://github.com/remirror/remirror/pull/1031) [`fccb1a68c`](https://github.com/remirror/remirror/commit/fccb1a68c15c8f1c56c5c2561e0573b9932e8cbb) Thanks [@ocavue](https://github.com/ocavue)! - Add the first version of `@remirror/extension-file`.

### Patch Changes

- Updated dependencies [[`fccb1a68c`](https://github.com/remirror/remirror/commit/fccb1a68c15c8f1c56c5c2561e0573b9932e8cbb)]:
  - @remirror/theme@1.1.0
