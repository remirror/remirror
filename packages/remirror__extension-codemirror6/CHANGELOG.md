# @remirror/extension-codemirror6

## 0.2.1

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core@1.3.3
  - @remirror/pm@1.0.10

## 0.2.0

> 2021-12-30

### Minor Changes

- Add a new keybinging `Backspace` to the `codeMirror` node.

  Add a new option `toggleName` to `CodeMirrorExtension`, which is the name of the node that the codeMirror block should toggle back and forth from when pressing `Backspace`.

## 0.1.1

> 2021-12-28

### Patch Changes

- Fixed an input rules issue.

## 0.1.0

> 2021-12-24

### Minor Changes

- First version of `@remirror/extension-codemirror6`.
