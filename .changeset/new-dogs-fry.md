---
'@remirror/core': minor
'@remirror/core-utils': minor
'@remirror/extension-link': minor
---

Add a new mark input rule parameter property, `updateCaptured` which allows the developer to tweak the details of the captured detail rule. This provides a workaround for the a lack of support for the `lookbehind` regex in **Safari** and other browsers.

Fixes #574.
