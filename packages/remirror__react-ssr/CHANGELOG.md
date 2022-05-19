# @remirror/react-ssr

## 1.0.24

> 2022-05-18

### Patch Changes

- Add support for parsing CSS functions (`min,`max`and`clamp`) to`extractPixelSize`.

* Fix paste of tables in React Tables extension

* Updated dependencies []:
  - @remirror/core@1.4.4
  - @remirror/extension-react-ssr@1.0.24

## 1.0.23

> 2022-04-26

### Patch Changes

- Update dependencies.

- Updated dependencies []:
  - @remirror/extension-react-ssr@1.0.23

## 1.0.22

> 2022-04-21

### Patch Changes

- Avoid adding `pluginState` to the constructor, as it leading to sharing between multiple instances

- Updated dependencies []:
  - @remirror/core@1.4.3
  - @remirror/extension-react-ssr@1.0.22

## 1.0.21

> 2022-04-20

### Patch Changes

- Fix an error with auto link preventing input rules at the end of a document

- Updated dependencies []:
  - @remirror/core@1.4.2
  - @remirror/extension-react-ssr@1.0.21

## 1.0.20

> 2022-03-25

### Patch Changes

- Add an `isViewEditable` helper to determine if the view content is editable.

  Expose the return type of `onAppendTransaction`

- Updated dependencies []:
  - @remirror/core@1.4.1
  - @remirror/extension-react-ssr@1.0.20

## 1.0.19

> 2022-03-17

### Patch Changes

- Expose appended transactions via the onChange handler

- Updated dependencies []:
  - @remirror/core@1.4.0
  - @remirror/extension-react-ssr@1.0.19

## 1.0.18

> 2022-02-22

### Patch Changes

- Fix auto link behaviour when performing an undo.

  Return only unique ranges from `getChangedRanges`.

- Updated dependencies []:
  - @remirror/core@1.3.6
  - @remirror/extension-react-ssr@1.0.18

## 1.0.17

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
  - @remirror/extension-react-ssr@1.0.17

## 1.0.16

> 2022-02-04

### Patch Changes

- Simplify how auto link works in the link extension, to simplify maintainance and fix a few issues.

- Updated dependencies []:
  - @remirror/core@1.3.4
  - @remirror/extension-react-ssr@1.0.16

## 1.0.15

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10
  - @remirror/extension-react-ssr@1.0.15

## 1.0.14

> 2021-12-06

### Patch Changes

- Fix an issue that cause `draggable` React node views unable to be draged.

- Updated dependencies []:
  - @remirror/extension-react-ssr@1.0.14

## 1.0.13

> 2021-11-23

### Patch Changes

- Fix the browser exports paths in `package.json`.

- Updated dependencies []:
  - @remirror/pm@1.0.8
  - @remirror/core@1.3.2
  - @remirror/extension-react-ssr@1.0.13

## 1.0.12

> 2021-11-23

### Patch Changes

- Fix an issue that causes uploading files failed to be updated after a replace step.

- Updated dependencies []:
  - @remirror/core@1.3.1
  - @remirror/extension-react-ssr@1.0.12
  - @remirror/pm@1.0.7

## 1.0.11

> 2021-11-10

### Patch Changes

- Implement the `stopEvent` method in `ReactNodeView`.

* Add new method `hasHandlers` to extensions.

* Updated dependencies []:
  - @remirror/extension-react-ssr@1.0.11
  - @remirror/core@1.3.0

## 1.0.10

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core@1.2.2
  - @remirror/extension-react-ssr@1.0.10
  - @remirror/pm@1.0.6

## 1.0.9

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core@1.2.1
  - @remirror/extension-react-ssr@1.0.9
  - @remirror/pm@1.0.4

## 1.0.8

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
  - @remirror/extension-react-ssr@1.0.8

## 1.0.7

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core@1.1.3
  - @remirror/extension-react-ssr@1.0.7
  - @remirror/pm@1.0.3

## 1.0.6

> 2021-09-17

### Patch Changes

- Improve performance for dynamic attributes.

- Updated dependencies []:
  - @remirror/core@1.1.2
  - @remirror/extension-react-ssr@1.0.6

## 1.0.5

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

- Updated dependencies []:
  - @remirror/core@1.1.1
  - @remirror/extension-react-ssr@1.0.5

## 1.0.4

> 2021-08-29

### Patch Changes

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/core@1.1.0
  - @remirror/extension-react-ssr@1.0.4

## 1.0.3

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

- Updated dependencies []:
  - @remirror/core@1.0.3
  - @remirror/extension-react-ssr@1.0.3

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

- Updated dependencies [[`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/extension-react-ssr@1.0.2

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1
  - @remirror/extension-react-ssr@1.0.1
  - @remirror/pm@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Patch Changes

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0
  - @remirror/extension-react-ssr@1.0.0
  - @remirror/pm@1.0.0

## 1.0.0-next.1

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- b3153b4c: Deprecate unused packages in the latest version.

## 0.11.0

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0
  - @remirror/react-renderer@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/react-renderer@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/react-renderer@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core@0.7.4
  - @remirror/react-portals@0.7.4
  - @remirror/react-renderer@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/react-portals@0.7.3
  - @remirror/react-renderer@0.7.3
