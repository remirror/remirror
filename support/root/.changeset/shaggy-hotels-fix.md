---
'@remirror/core': minor
---

Previously the `useRemirror` hook only updated when the provider was updated. There are times when you want to listen to specific changes from inside the editor.

The `useRemirror` hook now takes an optional `onChange` argument which is called on every change to the editor state. With this you can react to updates in your editor and add some really cool effects.
