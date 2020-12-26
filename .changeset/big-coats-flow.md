---
'@remirror/core': patch
'@remirror/extension-auto-link': patch
'@remirror/extension-blockquote': patch
'@remirror/extension-bold': patch
'@remirror/extension-code': patch
'@remirror/extension-code-block': patch
'@remirror/extension-emoji': patch
'@remirror/extension-hard-break': patch
'@remirror/extension-heading': patch
'@remirror/extension-history': patch
'@remirror/extension-horizontal-rule': patch
'@remirror/extension-italic': patch
'@remirror/extension-link': patch
'@remirror/extension-mention': patch
'@remirror/extension-search': patch
'@remirror/extension-strike': patch
'@remirror/extension-underline': patch
'@remirror/extension-yjs': patch
'@remirror/extension-list': patch
---

Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

```
createKeymap
createInputRules
createPasteRules
```
