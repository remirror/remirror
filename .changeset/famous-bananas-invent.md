---
'@remirror/core': patch
'@remirror/react': patch
'@remirror/core-utils': patch
---

Fix the broken build in production caused by comparing the mangled `Constructor.name` to an expected value.

- Make `@types/node` an optional peer dependency of `@remirror/core-utils`.
