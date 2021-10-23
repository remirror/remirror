---
'@remirror/core': patch
'@remirror/core-helpers': patch
'@remirror/core-types': patch
'@remirror/types': patch
---

---

## '@remirror/core-types': patch

Fix types so extraAttributes can be any JSON primitivee value

Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value
