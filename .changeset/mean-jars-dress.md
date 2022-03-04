---
'@remirror/extension-positioner': minor
---

Add the ability to force update positioners with a new command `forceUpdatePositioners`.

This can be useful to update positioners when the view is updated in a way that doesn't trigger a ProseMirror state change. For instance when an image URL is loaded and the document is reflowed.
