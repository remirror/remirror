---
'jest-prosemirror': minor
---

The editor element in `createEditor` is now appended to `document.body` before `EditorView` is initialized. This allows the use of `createEditor` with plugins that depend on the DOM.
