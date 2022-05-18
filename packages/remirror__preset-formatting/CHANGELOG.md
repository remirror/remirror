# @remirror/preset-formatting

## 1.0.29

> 2022-05-18

### Patch Changes

- Support font sizes using `min`, `max` or `clamp`. Avoid error if value cannot be parsed.

* Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

- Fix paste of tables in React Tables extension

- Updated dependencies []:
  - @remirror/extension-font-size@1.0.23
  - @remirror/core@1.4.4
  - @remirror/extension-bold@1.0.21
  - @remirror/extension-columns@1.0.21
  - @remirror/extension-heading@1.0.22
  - @remirror/extension-italic@1.0.21
  - @remirror/extension-node-formatting@1.0.24
  - @remirror/extension-strike@1.0.21
  - @remirror/extension-sub@1.0.21
  - @remirror/extension-sup@1.0.21
  - @remirror/extension-text-case@1.0.21
  - @remirror/extension-text-color@1.0.24
  - @remirror/extension-text-highlight@1.0.24
  - @remirror/extension-underline@1.0.21
  - @remirror/extension-whitespace@1.0.21

## 1.0.28

> 2022-05-03

### Patch Changes

- Simplify the paste rule regex.

- Updated dependencies []:
  - @remirror/extension-heading@1.0.21
  - @remirror/pm@1.0.17

## 1.0.27

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/extension-bold@1.0.20
  - @remirror/extension-columns@1.0.20
  - @remirror/extension-font-size@1.0.22
  - @remirror/extension-heading@1.0.20
  - @remirror/extension-italic@1.0.20
  - @remirror/extension-node-formatting@1.0.23
  - @remirror/extension-strike@1.0.20
  - @remirror/extension-sub@1.0.20
  - @remirror/extension-sup@1.0.20
  - @remirror/extension-text-case@1.0.20
  - @remirror/extension-text-color@1.0.23
  - @remirror/extension-text-highlight@1.0.23
  - @remirror/extension-underline@1.0.20
  - @remirror/extension-whitespace@1.0.20

## 1.0.26

> 2022-04-20

### Patch Changes

- Prevent italic input rule activation in middle of words

* Fix an error with auto link preventing input rules at the end of a document

* Updated dependencies []:
  - @remirror/extension-italic@1.0.19
  - @remirror/core@1.4.2
  - @remirror/extension-bold@1.0.19
  - @remirror/extension-columns@1.0.19
  - @remirror/extension-font-size@1.0.21
  - @remirror/extension-heading@1.0.19
  - @remirror/extension-node-formatting@1.0.22
  - @remirror/extension-strike@1.0.19
  - @remirror/extension-sub@1.0.19
  - @remirror/extension-sup@1.0.19
  - @remirror/extension-text-case@1.0.19
  - @remirror/extension-text-color@1.0.22
  - @remirror/extension-text-highlight@1.0.22
  - @remirror/extension-underline@1.0.19
  - @remirror/extension-whitespace@1.0.19

## 1.0.25

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-bold@1.0.18
  - @remirror/extension-columns@1.0.18
  - @remirror/extension-font-size@1.0.20
  - @remirror/extension-heading@1.0.18
  - @remirror/extension-italic@1.0.18
  - @remirror/extension-node-formatting@1.0.21
  - @remirror/extension-strike@1.0.18
  - @remirror/extension-sub@1.0.18
  - @remirror/extension-sup@1.0.18
  - @remirror/extension-text-case@1.0.18
  - @remirror/extension-text-color@1.0.21
  - @remirror/extension-text-highlight@1.0.21
  - @remirror/extension-underline@1.0.18
  - @remirror/extension-whitespace@1.0.18

## 1.0.24

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/extension-bold@1.0.17
  - @remirror/extension-columns@1.0.17
  - @remirror/extension-font-size@1.0.19
  - @remirror/extension-heading@1.0.17
  - @remirror/extension-italic@1.0.17
  - @remirror/extension-node-formatting@1.0.20
  - @remirror/extension-strike@1.0.17
  - @remirror/extension-sub@1.0.17
  - @remirror/extension-sup@1.0.17
  - @remirror/extension-text-case@1.0.17
  - @remirror/extension-text-color@1.0.20
  - @remirror/extension-text-highlight@1.0.20
  - @remirror/extension-underline@1.0.17
  - @remirror/extension-whitespace@1.0.17

## 1.0.23

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6
  - @remirror/extension-bold@1.0.16
  - @remirror/extension-columns@1.0.16
  - @remirror/extension-font-size@1.0.18
  - @remirror/extension-heading@1.0.16
  - @remirror/extension-italic@1.0.16
  - @remirror/extension-node-formatting@1.0.19
  - @remirror/extension-strike@1.0.16
  - @remirror/extension-sub@1.0.16
  - @remirror/extension-sup@1.0.16
  - @remirror/extension-text-case@1.0.16
  - @remirror/extension-text-color@1.0.19
  - @remirror/extension-text-highlight@1.0.19
  - @remirror/extension-underline@1.0.16
  - @remirror/extension-whitespace@1.0.16

## 1.0.22

> 2022-02-09

### Patch Changes

- Fix Ctrl+Click making the selected text invisible on Windows

- Updated dependencies []:
  - @remirror/extension-text-color@1.0.18
  - @remirror/extension-text-highlight@1.0.18

## 1.0.21

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
  - @remirror/extension-bold@1.0.15
  - @remirror/extension-columns@1.0.15
  - @remirror/extension-font-size@1.0.17
  - @remirror/extension-heading@1.0.15
  - @remirror/extension-italic@1.0.15
  - @remirror/extension-node-formatting@1.0.18
  - @remirror/extension-strike@1.0.15
  - @remirror/extension-sub@1.0.15
  - @remirror/extension-sup@1.0.15
  - @remirror/extension-text-case@1.0.15
  - @remirror/extension-text-color@1.0.17
  - @remirror/extension-text-highlight@1.0.17
  - @remirror/extension-underline@1.0.15
  - @remirror/extension-whitespace@1.0.15

## 1.0.20

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4
  - @remirror/extension-bold@1.0.14
  - @remirror/extension-columns@1.0.14
  - @remirror/extension-font-size@1.0.16
  - @remirror/extension-heading@1.0.14
  - @remirror/extension-italic@1.0.14
  - @remirror/extension-node-formatting@1.0.17
  - @remirror/extension-strike@1.0.14
  - @remirror/extension-sub@1.0.14
  - @remirror/extension-sup@1.0.14
  - @remirror/extension-text-case@1.0.14
  - @remirror/extension-text-color@1.0.16
  - @remirror/extension-text-highlight@1.0.16
  - @remirror/extension-underline@1.0.14
  - @remirror/extension-whitespace@1.0.14

## 1.0.19

> 2022-01-16

### Patch Changes

- Fix a runtime error when getting font size before the editor view is initialized.

- Updated dependencies []:
  - @remirror/extension-font-size@1.0.15

## 1.0.18

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
  - @remirror/extension-text-color@1.0.15
  - @remirror/extension-text-highlight@1.0.15

## 1.0.17

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/extension-bold@1.0.13
  - @remirror/extension-columns@1.0.13
  - @remirror/extension-font-size@1.0.14
  - @remirror/pm@1.0.10
  - @remirror/extension-heading@1.0.13
  - @remirror/extension-italic@1.0.13
  - @remirror/extension-node-formatting@1.0.16
  - @remirror/extension-strike@1.0.13
  - @remirror/extension-sub@1.0.13
  - @remirror/extension-sup@1.0.13
  - @remirror/extension-text-case@1.0.13
  - @remirror/extension-text-color@1.0.14
  - @remirror/extension-text-highlight@1.0.14
  - @remirror/extension-underline@1.0.13
  - @remirror/extension-whitespace@1.0.13

## 1.0.16

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2
  - @remirror/extension-bold@1.0.12
  - @remirror/extension-columns@1.0.12
  - @remirror/extension-font-size@1.0.13
  - @remirror/extension-heading@1.0.12
  - @remirror/extension-italic@1.0.12
  - @remirror/extension-node-formatting@1.0.15
  - @remirror/extension-strike@1.0.12
  - @remirror/extension-sub@1.0.12
  - @remirror/extension-sup@1.0.12
  - @remirror/extension-text-case@1.0.12
  - @remirror/extension-text-color@1.0.13
  - @remirror/extension-text-highlight@1.0.13
  - @remirror/extension-underline@1.0.12
  - @remirror/extension-whitespace@1.0.12

## 1.0.15

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-bold@1.0.11
  - @remirror/extension-columns@1.0.11
  - @remirror/extension-font-size@1.0.12
  - @remirror/extension-heading@1.0.11
  - @remirror/extension-italic@1.0.11
  - @remirror/extension-node-formatting@1.0.14
  - @remirror/extension-strike@1.0.11
  - @remirror/extension-sub@1.0.11
  - @remirror/extension-sup@1.0.11
  - @remirror/extension-text-case@1.0.11
  - @remirror/extension-text-color@1.0.12
  - @remirror/extension-text-highlight@1.0.12
  - @remirror/extension-underline@1.0.11
  - @remirror/extension-whitespace@1.0.11
  - @remirror/pm@1.0.7

## 1.0.14

> 2021-11-17

### Patch Changes

- fix: removeFontSize should respect user text selection

- Updated dependencies []:
  - @remirror/extension-font-size@1.0.11

## 1.0.13

> 2021-11-10

### Patch Changes

- Add new method `hasHandlers` to extensions.

- Updated dependencies []:
  - @remirror/core@1.3.0
  - @remirror/extension-bold@1.0.10
  - @remirror/extension-columns@1.0.10
  - @remirror/extension-font-size@1.0.10
  - @remirror/extension-heading@1.0.10
  - @remirror/extension-italic@1.0.10
  - @remirror/extension-node-formatting@1.0.13
  - @remirror/extension-strike@1.0.10
  - @remirror/extension-sub@1.0.10
  - @remirror/extension-sup@1.0.10
  - @remirror/extension-text-case@1.0.10
  - @remirror/extension-text-color@1.0.11
  - @remirror/extension-text-highlight@1.0.11
  - @remirror/extension-underline@1.0.10
  - @remirror/extension-whitespace@1.0.10

## 1.0.12

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/extension-bold@1.0.9
  - @remirror/extension-columns@1.0.9
  - @remirror/extension-font-size@1.0.9
  - @remirror/extension-heading@1.0.9
  - @remirror/extension-italic@1.0.9
  - @remirror/extension-node-formatting@1.0.12
  - @remirror/extension-strike@1.0.9
  - @remirror/extension-sub@1.0.9
  - @remirror/extension-sup@1.0.9
  - @remirror/extension-text-case@1.0.9
  - @remirror/extension-text-color@1.0.10
  - @remirror/extension-text-highlight@1.0.10
  - @remirror/extension-underline@1.0.9
  - @remirror/extension-whitespace@1.0.9
  - @remirror/pm@1.0.6

## 1.0.11

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/extension-bold@1.0.8
  - @remirror/extension-columns@1.0.8
  - @remirror/extension-font-size@1.0.8
  - @remirror/extension-heading@1.0.8
  - @remirror/extension-italic@1.0.8
  - @remirror/extension-node-formatting@1.0.11
  - @remirror/extension-strike@1.0.8
  - @remirror/extension-sub@1.0.8
  - @remirror/extension-sup@1.0.8
  - @remirror/extension-text-case@1.0.8
  - @remirror/extension-text-color@1.0.9
  - @remirror/extension-text-highlight@1.0.9
  - @remirror/extension-underline@1.0.8
  - @remirror/extension-whitespace@1.0.8
  - @remirror/pm@1.0.4

## 1.0.10

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
  - @remirror/extension-bold@1.0.7
  - @remirror/extension-columns@1.0.7
  - @remirror/extension-font-size@1.0.7
  - @remirror/extension-heading@1.0.7
  - @remirror/extension-italic@1.0.7
  - @remirror/extension-node-formatting@1.0.10
  - @remirror/extension-strike@1.0.7
  - @remirror/extension-sub@1.0.7
  - @remirror/extension-sup@1.0.7
  - @remirror/extension-text-case@1.0.7
  - @remirror/extension-text-color@1.0.8
  - @remirror/extension-text-highlight@1.0.8
  - @remirror/extension-underline@1.0.7
  - @remirror/extension-whitespace@1.0.7

## 1.0.9

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/extension-bold@1.0.6
  - @remirror/extension-columns@1.0.6
  - @remirror/extension-font-size@1.0.6
  - @remirror/extension-heading@1.0.6
  - @remirror/extension-italic@1.0.6
  - @remirror/extension-node-formatting@1.0.9
  - @remirror/extension-strike@1.0.6
  - @remirror/extension-sub@1.0.6
  - @remirror/extension-sup@1.0.6
  - @remirror/extension-text-case@1.0.6
  - @remirror/extension-text-color@1.0.7
  - @remirror/extension-text-highlight@1.0.7
  - @remirror/extension-underline@1.0.6
  - @remirror/extension-whitespace@1.0.6
  - @remirror/pm@1.0.3

## 1.0.8

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-bold@1.0.5
  - @remirror/extension-columns@1.0.5
  - @remirror/extension-font-size@1.0.5
  - @remirror/extension-heading@1.0.5
  - @remirror/extension-italic@1.0.5
  - @remirror/extension-node-formatting@1.0.8
  - @remirror/extension-strike@1.0.5
  - @remirror/extension-sub@1.0.5
  - @remirror/extension-sup@1.0.5
  - @remirror/extension-text-case@1.0.5
  - @remirror/extension-text-color@1.0.6
  - @remirror/extension-text-highlight@1.0.6
  - @remirror/extension-underline@1.0.5
  - @remirror/extension-whitespace@1.0.5

## 1.0.7

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-bold@1.0.4
  - @remirror/extension-columns@1.0.4
  - @remirror/extension-font-size@1.0.4
  - @remirror/extension-heading@1.0.4
  - @remirror/extension-italic@1.0.4
  - @remirror/extension-node-formatting@1.0.7
  - @remirror/extension-strike@1.0.4
  - @remirror/extension-sub@1.0.4
  - @remirror/extension-sup@1.0.4
  - @remirror/extension-text-case@1.0.4
  - @remirror/extension-text-color@1.0.5
  - @remirror/extension-text-highlight@1.0.5
  - @remirror/extension-underline@1.0.4
  - @remirror/extension-whitespace@1.0.4

## 1.0.6

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/extension-text-color@1.0.4
  - @remirror/extension-text-highlight@1.0.4

## 1.0.5

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Don't install `@remirror/theme` as a dependency of `@remirror/core`.

- Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

- Updated dependencies []:
  - @remirror/extension-text-color@1.0.3
  - @remirror/extension-text-highlight@1.0.3
  - @remirror/core@1.1.0
  - @remirror/extension-bold@1.0.3
  - @remirror/extension-columns@1.0.3
  - @remirror/extension-font-size@1.0.3
  - @remirror/extension-heading@1.0.3
  - @remirror/extension-italic@1.0.3
  - @remirror/extension-node-formatting@1.0.6
  - @remirror/extension-strike@1.0.3
  - @remirror/extension-sub@1.0.3
  - @remirror/extension-sup@1.0.3
  - @remirror/extension-text-case@1.0.3
  - @remirror/extension-underline@1.0.3
  - @remirror/extension-whitespace@1.0.3

## 1.0.4

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/extension-bold@1.0.2
  - @remirror/extension-columns@1.0.2
  - @remirror/extension-font-size@1.0.2
  - @remirror/extension-heading@1.0.2
  - @remirror/extension-italic@1.0.2
  - @remirror/extension-node-formatting@1.0.5
  - @remirror/extension-strike@1.0.2
  - @remirror/extension-sub@1.0.2
  - @remirror/extension-sup@1.0.2
  - @remirror/extension-text-case@1.0.2
  - @remirror/extension-text-color@1.0.2
  - @remirror/extension-text-highlight@1.0.2
  - @remirror/extension-underline@1.0.2
  - @remirror/extension-whitespace@1.0.2

## 1.0.3

> 2021-08-20

### Patch Changes

- Fix eager parsing of style attribute, and limit valid `line-height` values in `NodeFormattingExtension`

- Updated dependencies []:
  - @remirror/extension-node-formatting@1.0.4

## 1.0.2

> 2021-08-18

### Patch Changes

- Publish a version of `@remirror/extension-node-formatting` without code modification.

- Updated dependencies []:
  - @remirror/extension-node-formatting@1.0.3

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/extension-bold@1.0.1
  - @remirror/extension-columns@1.0.1
  - @remirror/extension-font-size@1.0.1
  - @remirror/extension-heading@1.0.1
  - @remirror/extension-italic@1.0.1
  - @remirror/extension-node-formatting@1.0.1
  - @remirror/extension-strike@1.0.1
  - @remirror/extension-sub@1.0.1
  - @remirror/extension-sup@1.0.1
  - @remirror/extension-text-case@1.0.1
  - @remirror/extension-text-color@1.0.1
  - @remirror/extension-text-highlight@1.0.1
  - @remirror/extension-underline@1.0.1
  - @remirror/extension-whitespace@1.0.1
  - @remirror/pm@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - @remirror/extension-sub@1.0.0
  - @remirror/extension-bold@1.0.0
  - @remirror/extension-columns@1.0.0
  - @remirror/extension-font-size@1.0.0
  - @remirror/extension-heading@1.0.0
  - @remirror/extension-italic@1.0.0
  - @remirror/extension-node-formatting@1.0.0
  - @remirror/extension-strike@1.0.0
  - @remirror/extension-sup@1.0.0
  - @remirror/extension-text-case@1.0.0
  - @remirror/extension-text-color@1.0.0
  - @remirror/extension-text-highlight@1.0.0
  - @remirror/extension-underline@1.0.0
  - @remirror/extension-whitespace@1.0.0
  - @remirror/pm@1.0.0
