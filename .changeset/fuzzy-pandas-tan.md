---
'@remirror/core': minor
---

`RemirrorManager.create` can now accept a function which returns an array of extensions and presets. This `lazy` creation allows for optimizations to be made elsewhere in the codebase.
