# @remirror/react-editors

## 0.1.9

> 2021-09-13

### Patch Changes

- feat: detect emails as links

* Add a white border to the handle to make it more recognizable.

* Updated dependencies []:
  - remirror@1.0.23

## 0.1.8

> 2021-09-07

### Patch Changes

- Unchained commands should use a new transaction to prevent leaking of previous command steps

* Remove react dependency from wysiwyg-preset: An earlier commit upgraded the tables from simple to fancy tables. As a side effect, this had introduced a dependency from wysiwyg to the react-part of remirror. This change removes this dependency again.

* Updated dependencies []:
  - remirror@1.0.22
  - @remirror/extension-react-tables@1.0.9
  - @remirror/react@1.0.9

## 0.1.7

> 2021-09-04

### Patch Changes

- Don't discard node attributes when resizing.

- Updated dependencies []:
  - remirror@1.0.21

## 0.1.6

> 2021-09-02

### Patch Changes

- Fix an out of range error when there is nothing in the dropdown menu.

- Updated dependencies []:
  - remirror@1.0.20
  - @remirror/react@1.0.8

## 0.1.5

> 2021-09-01

### Patch Changes

- Fix an issue that causes clicking a nested checkbox won't toggle its checked state.

- Updated dependencies []:
  - remirror@1.0.19

## 0.1.4

> 2021-09-01

### Patch Changes

- fix: task list wasn't available in wysiwyg editors

* Don't create a node selection within the `toggleCheckboxChecked` command.

* Updated dependencies []:
  - remirror@1.0.18

## 0.1.3

> 2021-08-30

### Patch Changes

- Reset some CSS on IMG separator nodes.

- Updated dependencies []:
  - @remirror/styles@1.1.2
  - remirror@1.0.17
  - @remirror/react@1.0.7

## 0.1.2

> 2021-08-30

### Patch Changes

- Don't require a `NodeSelection` to fire `toggleCheckboxChecked` anymore.

- Updated dependencies []:
  - remirror@1.0.16

## 0.1.1

> 2021-08-29

### Patch Changes

- Override the default browser style about the nested list, so that users can tell the different between two adjacent nested lists.

* Improve commands `toggleBulletList`, `toggleOrderedList` and `toggleTaskList`. Now you can toggle list between bullet list, ordered list and task list.

- Don't install `@remirror/theme` as a dependency of `@remirror/core`.

* Add a new `UploadExtension` to the built-in preset, which will manage all upload states from `FileExtension` and other extensions in the future.

  **Breaking changes**: `UploadContext` and `FileUploader` are now exported by `@remirror/core` instead of `@remirror/extension-file`.

* Updated dependencies []:
  - @remirror/styles@1.1.1
  - remirror@1.0.15
  - @remirror/react@1.0.6

## 0.1.0

> 2021-08-26

### Minor Changes

- Add pre-packaged editors

  Remirror makes building editors simple. Yet, some developers just want to have a out-of-the-box editor that can be plugged into their application. For this, we provide the pre-packaged editors.

### Patch Changes

- Add a `helpers` property to the `BasePositionerProps`. This will make it easier to use preconfigured helpers in the positioners.

- Updated dependencies []:
  - remirror@1.0.14
  - @remirror/react@1.0.5

## 0.0.14

> 2021-08-25

### Patch Changes

- Fixes a bug that causes the editor to insert an empty task list when deleting all content in the editor. Closes #1163.

- Updated dependencies []:
  - remirror@1.0.13

## 0.0.13

> 2021-08-22

### Patch Changes

- Exports `remirror/styles`.

- Updated dependencies []:
  - remirror@1.0.12

## 0.0.12

> 2021-08-22

### Patch Changes

- Set `sideEffect` from `@remirror/i18n`'s package.json as true.

* Exports `remirror/styles`.

* Updated dependencies []:
  - remirror@1.0.11
  - @remirror/react@1.0.4

## 0.0.11

> 2021-08-20

### Patch Changes

- Fix eager parsing of style attribute, and limit valid `line-height` values in `NodeFormattingExtension`

- Updated dependencies []:
  - remirror@1.0.10

## 0.0.10

> 2021-08-18

### Patch Changes

- Remove the playground API from `remirror`.

* Update dependency `prosemirror-gapcursor` to `^1.1.5`.

- Remove the playground API from `@remirror/react`.

- Updated dependencies []:
  - remirror@1.0.9
  - @remirror/pm@1.0.2
  - @remirror/react@1.0.3

## 0.0.9

> 2021-08-18

### Patch Changes

- Publish a version of `@remirror/extension-node-formatting` without code modification.

- Updated dependencies []:
  - remirror@1.0.8

## 0.0.8

> 2021-08-18

### Patch Changes

- Updated dependencies [[`937c3332d`](https://github.com/remirror/remirror/commit/937c3332d11ff28f5c218e3ed77a85b4a817b067)]:
  - remirror@1.0.7

## 0.0.7

> 2021-08-13

### Patch Changes

- Updated dependencies [[`662edfdaa`](https://github.com/remirror/remirror/commit/662edfdaa6ab7954edd4946b6f06da6d36288042)]:
  - remirror@1.0.6

## 0.0.6

> 2021-08-08

### Patch Changes

- Updated dependencies [[`1d83e4fde`](https://github.com/remirror/remirror/commit/1d83e4fde5a92b68b68d4b1a8e2260b4a985b3cd)]:
  - remirror@1.0.5

## 0.0.5

> 2021-08-04

### Patch Changes

- Updated dependencies [[`ec998d82b`](https://github.com/remirror/remirror/commit/ec998d82b5f2926b4d1eb36eb62d0557aab8fe4b)]:
  - remirror@1.0.4

## 0.0.4

> 2021-07-26

### Patch Changes

- Updated dependencies [[`ecad7e4be`](https://github.com/remirror/remirror/commit/ecad7e4beed04778de8060b06c93c8e893d73ed2)]:
  - remirror@1.0.3

## 0.0.3

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

- Updated dependencies [[`22115ea9e`](https://github.com/remirror/remirror/commit/22115ea9ed1977d20b7019d065d6a31d39b359eb), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b), [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b)]:
  - @remirror/react@1.0.2
  - create-context-state@1.0.1
  - @remirror/styles@1.0.1
  - remirror@1.0.2

## 0.0.2

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - remirror@1.0.1
  - @remirror/core-helpers@1.0.1
  - @remirror/pm@1.0.1
  - @remirror/react@1.0.1

## 0.0.1

> 2021-07-17

### Patch Changes

- Updated dependencies [[`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc), [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`28b81a858`](https://github.com/remirror/remirror/commit/28b81a8580670c4ebc06ad04db088a4b684237bf), [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0)]:
  - remirror@1.0.0
  - @remirror/react@1.0.0
  - create-context-state@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/styles@1.0.0
