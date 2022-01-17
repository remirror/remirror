# prosemirror-resizable-view

## 1.1.8

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

## 1.1.7

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.5
  - @remirror/core-utils@1.1.4

## 1.1.6

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4
  - @remirror/core-utils@1.1.3

## 1.1.5

> 2021-11-04

### Patch Changes

- Fix an issue where the resizable view is too tall on a small viewpoint.

## 1.1.4

> 2021-10-24

### Patch Changes

- Fix a bug that causes initial size CSS in resizable view not be set.

## 1.1.3

> 2021-10-24

### Patch Changes

- Make sure that the `width` and `height` attribute of `<img>` and `<iframe>` HTML elements is an integer without a unit.

## 1.1.2

> 2021-10-23

### Patch Changes

- Fixed an issue that causes resizable image's height can't be updated during resizing.

* ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

* Updated dependencies []:
  - @remirror/core-helpers@1.0.3
  - @remirror/core-utils@1.1.2

## 1.1.1

> 2021-10-01

### Patch Changes

- Set correct label and icon for task list (#1157).

* Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

- Stop hiding error details in production.

- Updated dependencies []:
  - @remirror/core-utils@1.1.1
  - @remirror/core-helpers@1.0.2

## 1.1.0

> 2021-09-13

### Minor Changes

- Add a white border to the handle to make it more recognizable.

## 1.0.1

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

## 1.0.0

> 2021-07-24

### Major Changes

- [#1023](https://github.com/remirror/remirror/pull/1023) [`0423ce7a8`](https://github.com/remirror/remirror/commit/0423ce7a8d63aaeb2baa4bfd4e7a54647730cab5) Thanks [@ocavue](https://github.com/ocavue)! - Make `ResizableNodeView` as an abstract class.

### Patch Changes

- Updated dependencies [[`0423ce7a8`](https://github.com/remirror/remirror/commit/0423ce7a8d63aaeb2baa4bfd4e7a54647730cab5)]:
  - @remirror/core-utils@1.1.0

## 0.1.1

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

## 0.1.0

> 2021-07-17

### Minor Changes

- [#927](https://github.com/remirror/remirror/pull/927) [`e0f1bec4a`](https://github.com/remirror/remirror/commit/e0f1bec4a1e8073ce8f5500d62193e52321155b9) Thanks [@ocavue](https://github.com/ocavue)! - New `prosemirror-resizable-view` package.

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8)]:
  - @remirror/core-helpers@1.0.0
