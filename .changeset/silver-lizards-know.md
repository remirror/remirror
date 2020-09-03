---
'@remirror/core': minor
'@remirror/core-helpers': minor
---

Make `focus` command chainable and add `manager.tr` property for creating chainable commands. This means that the `focus` method returned by `useRemirror()` can now be safely used within a controlled editor. It uses the shared chainable transaction so that the state update does not override other state updates.
