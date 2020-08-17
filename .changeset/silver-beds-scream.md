---
'@remirror/extension-link': major
'@remirror/preset-wysiwyg': minor
---

Fix issue #298 where selecting all content meant a link couldn't be added afterward.

💥 Add `selectTextOnClick` and default to `false`. Previously the whole link would be selected when clicking on a link. Now it's configurable.
