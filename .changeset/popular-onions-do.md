---
'@remirror/core': minor
---

Add `output` property to the `RemirrorManager`. The property will throw an error if used before the framework is attached.

Add the `frameworkAttached` property to the `RemirrorManager` which is true when the `manager.output` is available.
