---
"@remirror/extension-mention": patch
---

Fixes #263 by adding `this.getExtraAttrs(node)` to the `MentionExtension.schema.parseDOM` attribute. Now custom attributes passed into the `extraAttrs` options will be parsed from the DOM.
