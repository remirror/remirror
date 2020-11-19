---
'@remirror/extension-codemirror5': major
---

Rename codemirror package to include the version number: `@remirror/extension-codemirror5`. This is to allow a future seperate version which supports the currently in development `codemirror@6`.

Make `codemirror` and `@types/codemirror` peer dependencies of the `@remirror/extension-codemirror5` package. Most setups will need to install codemirror in order to add language support to the code editor. To avoid bundling multiple versions of the same codebase a peer dependency architecture seems to work.
