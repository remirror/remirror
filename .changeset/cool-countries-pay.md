---
'@remirror/core': minor
'@remirror/extension-bidi': patch
'@remirror/extension-placeholder': patch
---

Switch to using method signatures for extension class methods as discussed in #360.

Remove the first parameter `extensions` from method `onCreate`, `onView` and `onDestroy`.
