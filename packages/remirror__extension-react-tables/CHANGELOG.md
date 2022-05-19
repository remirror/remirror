# @remirror/extension-react-tables

## 1.0.37

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core-utils@1.1.9
  - @remirror/core@1.4.4
  - @remirror/extension-positioner@1.2.5
  - @remirror/extension-tables@1.0.24
  - @remirror/preset-core@1.0.27
  - @remirror/react-components@1.0.34
  - @remirror/react-core@1.2.1
  - @remirror/react-hooks@1.0.34

## 1.0.36

> 2022-05-03

### Patch Changes

- Insert emoticons when hitting the Enter key (rather than requiring a space)

- Updated dependencies []:
  - @remirror/react-components@1.0.33
  - @remirror/react-hooks@1.0.33
  - @remirror/pm@1.0.17

## 1.0.35

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
  - @remirror/react-core@1.2.0
  - @remirror/react-components@1.0.32
  - @remirror/react-hooks@1.0.32

## 1.0.34

> 2022-04-25

### Patch Changes

- Fix a potential out of range error.

- Updated dependencies []:
  - @remirror/react-components@1.0.31
  - @remirror/react-hooks@1.0.31

## 1.0.33

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/extension-positioner@1.2.4
  - @remirror/extension-tables@1.0.23
  - @remirror/preset-core@1.0.26
  - @remirror/react-components@1.0.30
  - @remirror/react-core@1.1.3
  - @remirror/react-hooks@1.0.30

## 1.0.32

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
  - @remirror/extension-tables@1.0.22
  - @remirror/react-components@1.0.29
  - @remirror/react-hooks@1.0.29
  - @remirror/core-utils@1.1.8
  - @remirror/core@1.4.2
  - @remirror/extension-positioner@1.2.3
  - @remirror/preset-core@1.0.25
  - @remirror/react-core@1.1.2

## 1.0.31

> 2022-04-04

### Patch Changes

- deleted an incorrect preselectClass style on react-table-extension

## 1.0.30

> 2022-04-01

### Patch Changes

- Borders will be applied for table headers on hover of column controller

## 1.0.29

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-positioner@1.2.2
  - @remirror/extension-tables@1.0.21
  - @remirror/preset-core@1.0.24
  - @remirror/react-components@1.0.28
  - @remirror/react-core@1.1.1
  - @remirror/react-hooks@1.0.28

## 1.0.28

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/react-core@1.1.0
  - @remirror/extension-positioner@1.2.1
  - @remirror/extension-tables@1.0.20
  - @remirror/preset-core@1.0.23
  - @remirror/react-components@1.0.27
  - @remirror/react-hooks@1.0.27

## 1.0.27

> 2022-03-06

### Patch Changes

- `onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.

- Updated dependencies []:
  - @remirror/react-core@1.0.25
  - @remirror/react-components@1.0.26
  - @remirror/react-hooks@1.0.26

## 1.0.26

> 2022-03-04

### Patch Changes

- Add the ability to force update positioners with a new command `forceUpdatePositioners`.

  This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.

- Updated dependencies []:
  - @remirror/extension-positioner@1.2.0
  - @remirror/preset-core@1.0.22
  - @remirror/react-components@1.0.25
  - @remirror/react-core@1.0.24
  - @remirror/react-hooks@1.0.25

## 1.0.25

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core-utils@1.1.7
  - @remirror/core@1.3.6
  - @remirror/extension-positioner@1.1.18
  - @remirror/extension-tables@1.0.19
  - @remirror/preset-core@1.0.21
  - @remirror/react-components@1.0.24
  - @remirror/react-core@1.0.23
  - @remirror/react-hooks@1.0.24

## 1.0.24

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/theme@1.2.1
  - @remirror/extension-positioner@1.1.17
  - @remirror/extension-tables@1.0.18
  - @remirror/preset-core@1.0.20
  - @remirror/react-components@1.0.23
  - @remirror/react-core@1.0.22
  - @remirror/react-hooks@1.0.23

## 1.0.23

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
  - @remirror/core-utils@1.1.6
  - @remirror/extension-positioner@1.1.16
  - @remirror/extension-tables@1.0.17
  - @remirror/preset-core@1.0.19
  - @remirror/react-components@1.0.22
  - @remirror/react-core@1.0.21
  - @remirror/react-hooks@1.0.22

## 1.0.22

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core-utils@1.1.5
  - @remirror/core@1.3.4
  - @remirror/extension-positioner@1.1.15
  - @remirror/extension-tables@1.0.16
  - @remirror/preset-core@1.0.18
  - @remirror/react-components@1.0.21
  - @remirror/react-core@1.0.20
  - @remirror/react-hooks@1.0.21

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
  - @remirror/theme@1.2.0
  - @remirror/extension-positioner@1.1.14
  - @remirror/extension-tables@1.0.15
  - @remirror/preset-core@1.0.17
  - @remirror/react-components@1.0.20
  - @remirror/react-core@1.0.19
  - @remirror/react-hooks@1.0.20

## 1.0.20

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/core-utils@1.1.4
  - @remirror/pm@1.0.10
  - @remirror/extension-positioner@1.1.13
  - @remirror/extension-tables@1.0.14
  - @remirror/preset-core@1.0.16
  - @remirror/react-components@1.0.19
  - @remirror/react-core@1.0.18
  - @remirror/react-hooks@1.0.19
  - @remirror/icons@1.0.7
  - @remirror/messages@1.0.6
  - @remirror/theme@1.1.5

## 1.0.19

> 2021-12-17

### Patch Changes

- Fix types of copy and paste event handlers

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.12
  - @remirror/preset-core@1.0.15
  - @remirror/react-components@1.0.18
  - @remirror/react-core@1.0.17
  - @remirror/react-hooks@1.0.18

## 1.0.18

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/react-components@1.0.17
  - @remirror/react-core@1.0.16
  - @remirror/react-hooks@1.0.17

## 1.0.17

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/icons@1.0.6
  - @remirror/pm@1.0.8
  - @remirror/react-components@1.0.16
  - @remirror/react-hooks@1.0.16
  - @remirror/core@1.3.2
  - @remirror/extension-positioner@1.1.11
  - @remirror/extension-tables@1.0.13
  - @remirror/preset-core@1.0.14
  - @remirror/react-core@1.0.15

## 1.0.16

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-positioner@1.1.10
  - @remirror/extension-tables@1.0.12
  - @remirror/preset-core@1.0.13
  - @remirror/react-components@1.0.15
  - @remirror/react-core@1.0.14
  - @remirror/react-hooks@1.0.15
  - @remirror/pm@1.0.7

## 1.0.15

> 2021-11-10

### Patch Changes

- Implement the `stopEvent` method in `ReactNodeView`.

* Add new method `hasHandlers` to extensions.

* Updated dependencies []:
  - @remirror/react-components@1.0.14
  - @remirror/react-core@1.0.13
  - @remirror/react-hooks@1.0.14
  - @remirror/core@1.3.0
  - @remirror/extension-positioner@1.1.9
  - @remirror/extension-tables@1.0.11
  - @remirror/preset-core@1.0.12

## 1.0.14

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/core-utils@1.1.3
  - @remirror/extension-positioner@1.1.8
  - @remirror/extension-tables@1.0.10
  - @remirror/icons@1.0.5
  - @remirror/messages@1.0.5
  - @remirror/pm@1.0.6
  - @remirror/preset-core@1.0.11
  - @remirror/react-components@1.0.13
  - @remirror/react-core@1.0.12
  - @remirror/react-hooks@1.0.13

## 1.0.13

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/extension-positioner@1.1.7
  - @remirror/extension-tables@1.0.9
  - @remirror/preset-core@1.0.10
  - @remirror/react-components@1.0.12
  - @remirror/react-core@1.0.11
  - @remirror/react-hooks@1.0.12
  - @remirror/core-utils@1.1.2
  - @remirror/icons@1.0.4
  - @remirror/messages@1.0.4
  - @remirror/pm@1.0.4
  - @remirror/theme@1.1.4

## 1.0.12

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
  - @remirror/extension-positioner@1.1.6
  - @remirror/extension-tables@1.0.8
  - @remirror/preset-core@1.0.9
  - @remirror/react-components@1.0.11
  - @remirror/react-core@1.0.10
  - @remirror/react-hooks@1.0.11

## 1.0.11

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/messages@1.0.3
  - @remirror/core@1.1.3
  - @remirror/extension-positioner@1.1.5
  - @remirror/extension-tables@1.0.7
  - @remirror/preset-core@1.0.8
  - @remirror/react-components@1.0.10
  - @remirror/react-core@1.0.9
  - @remirror/react-hooks@1.0.10
  - @remirror/core-utils@1.1.1
  - @remirror/icons@1.0.3
  - @remirror/pm@1.0.3
  - @remirror/theme@1.1.3

## 1.0.10

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-positioner@1.1.4
  - @remirror/extension-tables@1.0.6
  - @remirror/preset-core@1.0.7
  - @remirror/react-components@1.0.9
  - @remirror/react-core@1.0.8
  - @remirror/react-hooks@1.0.9

## 1.0.9

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-positioner@1.1.3
  - @remirror/extension-tables@1.0.5
  - @remirror/preset-core@1.0.6
  - @remirror/react-components@1.0.8
  - @remirror/react-core@1.0.7
  - @remirror/react-hooks@1.0.8

## 1.0.8

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - @remirror/react-hooks@1.0.7
  - @remirror/react-components@1.0.7

## 1.0.7

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/theme@1.1.2
  - @remirror/extension-positioner@1.1.2
  - @remirror/extension-tables@1.0.4
  - @remirror/preset-core@1.0.5
  - @remirror/react-components@1.0.6
  - @remirror/react-core@1.0.6
  - @remirror/react-hooks@1.0.6

## 1.0.6

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

- Updated dependencies []:
  - @remirror/theme@1.1.1
  - @remirror/extension-positioner@1.1.1
  - @remirror/extension-tables@1.0.3
  - @remirror/preset-core@1.0.4
  - @remirror/react-components@1.0.5
  - @remirror/react-core@1.0.5
  - @remirror/react-hooks@1.0.5
  - @remirror/core@1.1.0

## 1.0.5

> 2021-08-26

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - @remirror/extension-positioner@1.1.0
  - @remirror/preset-core@1.0.3
  - @remirror/react-components@1.0.4
  - @remirror/react-core@1.0.4
  - @remirror/react-hooks@1.0.4

## 1.0.4

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/extension-positioner@1.0.2
  - @remirror/extension-tables@1.0.2
  - @remirror/preset-core@1.0.2
  - @remirror/react-components@1.0.3
  - @remirror/react-core@1.0.3
  - @remirror/react-hooks@1.0.3

## 1.0.3

> 2021-07-26

### Patch Changes

- [#1029](https://github.com/remirror/remirror/pull/1029) [`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2) Thanks [@ocavue](https://github.com/ocavue)! - Update remirror dependencies.

- Updated dependencies [[`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2)]:
  - @remirror/core@1.0.2

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1014](https://github.com/remirror/remirror/pull/1014) [`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by removing `@remirror/icons/all` and `@remirror/react-icons/all-icons` from the package `@remirror/react-tables-extension`.

* [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

* Updated dependencies [[`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/icons@1.0.2
  - @remirror/react-components@1.0.2
  - @remirror/core-utils@1.0.2
  - @remirror/react-core@1.0.2
  - @remirror/react-hooks@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/core-utils@1.0.1
  - @remirror/extension-positioner@1.0.1
  - @remirror/extension-tables@1.0.1
  - @remirror/icons@1.0.1
  - @remirror/messages@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/preset-core@1.0.1
  - @remirror/react-components@1.0.1
  - @remirror/react-core@1.0.1
  - @remirror/react-hooks@1.0.1
  - @remirror/theme@1.0.1

## 1.0.0

> 2021-07-17

### Minor Changes

- [#996](https://github.com/remirror/remirror/pull/996) [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb) Thanks [@whawker](https://github.com/whawker)! - Fix to make React tables compatible with Yjs extension

  The controller injection is now done is a single create transaction, rather than an additional transaction. The previous implementation with multiple rapid transactions triggered conflict resolution behaviour in Yjs, leading to unpredictable behaviour.

  Exposes a `createTable` command from the React Tables extension directly

* [#877](https://github.com/remirror/remirror/pull/877) [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a) Thanks [@ocavue](https://github.com/ocavue)! - Add the new `@remirror/extension-react-tables` package.

- [#911](https://github.com/remirror/remirror/pull/911) [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25) Thanks [@ocavue](https://github.com/ocavue)! - Export `@remirror/extension-react-tables`

* [#911](https://github.com/remirror/remirror/pull/911) [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25) Thanks [@ocavue](https://github.com/ocavue)! - - Use the new type `TableCellMenuComponentProps` to replace `TableCellMenuComponentProps` and `TableCellMenuProps`.
  - `TableCellMenu` only accepts one property `Component` now, which replaces the origin propertys `ButtonComponent` and `PopupComponent`.

### Patch Changes

- [#922](https://github.com/remirror/remirror/pull/922) [`18b8d1b2b`](https://github.com/remirror/remirror/commit/18b8d1b2b336e2611c469e7b637f11b00b8b4399) Thanks [@ocavue](https://github.com/ocavue)! - Fix the problem that the insert button fails when there are other nodes below the table.

  Fix the problem that the table menu is always displayed.

* [#919](https://github.com/remirror/remirror/pull/919) [`0b32e1698`](https://github.com/remirror/remirror/commit/0b32e169875c40551898acf29126070d5b5c798f) Thanks [@ocavue](https://github.com/ocavue)! - Downgrade the dependency `jsx-dom` to an earlier version.

- [#997](https://github.com/remirror/remirror/pull/997) [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2) Thanks [@whawker](https://github.com/whawker)! - Fix exports of Tables extension to expose imports required for React Tables extension

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`3df15a8a2`](https://github.com/remirror/remirror/commit/3df15a8a2a9f594b48ba2abc755109eaf3ee0999), [`3feb9188a`](https://github.com/remirror/remirror/commit/3feb9188a6747f496ea4ed224357d268cf1da8cc), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`b1fc65313`](https://github.com/remirror/remirror/commit/b1fc65313f5be376bb1128c90f54cd1fa168c5c0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c), [`63268b8eb`](https://github.com/remirror/remirror/commit/63268b8ebc03bd9b6d410516abb794f872e571c8), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/extension-tables@1.0.0
  - @remirror/react-hooks@1.0.0
  - @remirror/react-components@1.0.0
  - @remirror/react-core@1.0.0
  - @remirror/extension-positioner@1.0.0
  - @remirror/core-utils@1.0.0
  - @remirror/icons@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0
  - @remirror/theme@1.0.0
