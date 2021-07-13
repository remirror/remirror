---
'multishift': patch
'@remirror/react-components': patch
---

Fix the situation where passing an array with zero items to `multishift` caused the editor to crash. This was raised in [#971](https://github.com/remirror/remirror/issues/971).
