---
'@remirror/extension-annotation': patch
---

Keep `getAnnotations()` referentially stable when annotation data and enriched text have not changed. Refresh the result after content, position, order or custom metadata changes, and recover from mutations of a previously returned array.

Custom metadata supports structural comparison of objects and collections, including circular references. Functions, promises, errors and weak collections use reference equality; uninspectable metadata falls back to a fresh result.
