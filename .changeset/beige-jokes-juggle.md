---
'@remirror/extension-events': patch
---

This patch fixes an issue where `EventsExtension` cannot get the marks with `inclusive` set to `false` <https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive> for a `hover` event.
