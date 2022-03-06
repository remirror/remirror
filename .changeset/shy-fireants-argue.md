---
'@remirror/dom': patch
'@remirror/react-core': patch
---

`onChange` shouldn't be called if the transaction is canceled by `filterTransaction`.
