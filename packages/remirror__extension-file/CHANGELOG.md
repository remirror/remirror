# @remirror/extension-file

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
