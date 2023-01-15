---
'@remirror/extension-events': patch
---

This patch fixes an issue where `EventsExtension` cannot get the marks with [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) set to `false` for a `hover` event.
