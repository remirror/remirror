# @remirror/extension-codemirror5

## 1.0.0-next.54

> 2020-11-19

### Major Changes

- [`d720bcd4`](https://github.com/remirror/remirror/commit/d720bcd43cd8589bbb2bcc7c12104229113f212a) [#791](https://github.com/remirror/remirror/pull/791) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Rename codemirror package to include the version number: `@remirror/extension-codemirror5`. This is to allow a future seperate version which supports the currently in development `codemirror@6`.

  Make `codemirror` and `@types/codemirror` peer dependencies of the `@remirror/extension-codemirror5` package. Most setups will need to install codemirror in order to add language support to the code editor. To avoid bundling multiple versions of the same codebase a peer dependency architecture seems to work.

### Minor Changes

- [`b1df359b`](https://github.com/remirror/remirror/commit/b1df359b32996212a4357fb78bb6a8d2929bcf4f) [#780](https://github.com/remirror/remirror/pull/780) Thanks [@ocavue](https://github.com/ocavue)! - Add new`@remirror/extension-codemirror5` package which can be used as an alternative to the `@remirror/extension-codeblock` for representing code blocks with syntax highlighting in your editor.

### Patch Changes

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
