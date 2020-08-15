---
'@remirror/core': patch
'@remirror/core-types': patch
---

Fix #518 caused by the way the `EditorWrapper` was setting up listeners to events from the `RemirrorManager`. Previously the failure became apparent when used in an uncontrolled editor in `StrictMode`.

Set the default `CommandFunction` type parameter to be `EditorSchema` for better code completion when creating an extension.
