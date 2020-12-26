---
'@remirror/core': major
'@remirror/core-constants': minor
'@remirror/core-utils': patch
'@remirror/extension-blockquote': patch
'@remirror/extension-bold': patch
'@remirror/extension-code': patch
'@remirror/extension-code-block': patch
'@remirror/extension-hard-break': patch
'@remirror/extension-heading': patch
'@remirror/extension-image': patch
'@remirror/extension-italic': patch
'@remirror/extension-link': patch
'@remirror/extension-mention': patch
'@remirror/extension-paragraph': patch
'@remirror/extension-strike': patch
'@remirror/extension-text': patch
'@remirror/extension-trailing-node': patch
'@remirror/extension-underline': patch
'@remirror/extension-embed': patch
'@remirror/extension-list': patch
'@remirror/preset-table': patch
---

Support for extending the `ExtensionTag` with your own custom types and names to close #465. Deprecates `NodeGroup` and `MarkGroup` which will be removed in a future version.

- A small breaking change removes some related type exports from `@remirror/core`.
- Add the ability to `mutateTag` for creating custom tags in custom extensions.
- Update several to use `tags` as a replacement for the spec group.
