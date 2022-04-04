# prosemirror-trailing-node

## 1.0.8

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

## 1.0.7

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

## 1.0.6

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-constants@1.0.2
  - @remirror/core-helpers@1.0.5

## 1.0.5

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4

## 1.0.4

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core-helpers@1.0.3

## 1.0.3

> 2021-10-01

### Patch Changes

- Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

* Stop hiding error details in production.

* Updated dependencies []:
  - @remirror/core-helpers@1.0.2
  - @remirror/core-constants@1.0.1

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core-helpers@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8)]:
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
