---
'@remirror/core': minor
'@remirror/extension-bidi': patch
'@remirror/extension-placeholder': patch
---

Remove the first parameter `extensions` from method `onCreate`, `onView` and `onDestroy`.

Switch to using method signatures for extension class methods as discussed in #360. The follow methods have been affected:

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
