---
'@remirror/core': minor
'@remirror/core-types': minor
'@remirror/core-utils': minor
'@remirror/pm': minor
'@remirror/extension-history': patch
'@remirror/extension-code-block': patch
'@remirror/react': patch
---

Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.
