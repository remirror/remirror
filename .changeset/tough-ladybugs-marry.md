---
"remirror": patch
"@remirror/extension-tables": patch
---

Update the reference from `attrs.style` to `node.attrs.style` as we need to get the style from the node first and then override the background property when updating the table cell style.
