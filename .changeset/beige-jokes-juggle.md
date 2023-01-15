---
'@remirror/extension-events': patch
---

This patch fixes an issue where `useHover` cannot catch the marks with [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) set to `false`.
