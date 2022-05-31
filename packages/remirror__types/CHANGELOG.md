# @remirror/types

## 1.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

## 0.1.1

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

## 0.1.0

> 2021-07-17

### Minor Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`9b4a3bdb8`](https://github.com/remirror/remirror/commit/9b4a3bdb8e1c594d353c5c5be2844133cda0f51a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new package which contains all the non-ProseMirror specific types. The package also re-exports `type-fest` to prevent the need for multiple usages of this library within the codebase.
