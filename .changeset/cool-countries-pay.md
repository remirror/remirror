---
'@remirror/core': minor
'@remirror/extension-auto-link': patch
'@remirror/extension-bidi': patch
'@remirror/extension-blockquote': patch
'@remirror/extension-bold': patch
'@remirror/extension-code': patch
'@remirror/extension-code-block': patch
'@remirror/extension-collaboration': patch
'@remirror/extension-diff': patch
'@remirror/extension-drop-cursor': patch
'@remirror/extension-emoji': patch
'@remirror/extension-epic-mode': patch
'@remirror/extension-gap-cursor': patch
'@remirror/extension-heading': patch
'@remirror/extension-history': patch
'@remirror/extension-horizontal-rule': patch
'@remirror/extension-image': patch
'@remirror/extension-italic': patch
'@remirror/extension-link': patch
'@remirror/extension-mention': patch
'@remirror/extension-paragraph': patch
'@remirror/extension-placeholder': patch
'@remirror/extension-positioner': patch
'@remirror/extension-react-ssr': patch
'@remirror/extension-search': patch
'@remirror/extension-strike': patch
'@remirror/extension-trailing-node': patch
'@remirror/extension-underline': patch
'@remirror/extension-yjs': patch
'@remirror/extension-embed': patch
'@remirror/extension-list': patch
'@remirror/preset-table': patch
---

Remove the first parameter `extensions` from the lifecycle methods `onCreate`, `onView` and `onDestroy`.

Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

```
onCreate
onView
onStateUpdate
onDestroy
createAttributes
createCommands
createPlugin
createExternalPlugins
createSuggestions
createHelpers
fromObject
onSetOptions
```
