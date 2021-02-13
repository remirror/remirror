---
'@remirror/core': patch
---

Initialize the `Extension#store` property with a `previousState` of `undefined` to prevent a crash in certain conditions. This closes [#863](https://github.com/remirror/remirror/pull/863).
