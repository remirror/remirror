---
'@remirror/extension-link': patch
---

Fix some bugs with the `LinkExtension` around auto linking.

- The `autoLink` option now defaults to `false` and has an impact on the extension functionality. Fixes #682.
- Non-auto links which match the automatic urls are no longer overwritten by automated links.
