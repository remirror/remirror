# @remirror/preset-formatting

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
