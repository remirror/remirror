---
'@remirror/extension-link': patch
'remirror': patch
'@remirror/preset-wysiwyg': patch
'@remirror/react-editors': patch
---

Delay trigger of `onUpdateLink` till the end of the execution queue to prevent updates on stale state.
