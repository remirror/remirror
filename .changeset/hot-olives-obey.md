---
'@remirror/core-utils': patch
---

Fix `removeMark` when called with `dispatch = undefined`. This means that `command.<NAME>.isEnabled()` checks should all be fixed if they are using `removeMark` as mentioned in [#784](https://github.com/remirror/remirror/issues/784).
