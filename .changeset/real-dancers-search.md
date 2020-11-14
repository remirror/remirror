---
'@remirror/extension-link': patch
---

The behaviour of `commands.updateLink.isEnabled()` has been **fixed** to return `false` when the `link` mark can't be applied to the selection. This was fixed by a change in the `@remirror/core-utils` package.
