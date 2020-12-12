---
'@remirror/core-utils': patch
---

Fix `getMarkRange` not returning the entire mark length, instead stopping at the first change in mark. This fix also resolves the infinite loop described in #823.
