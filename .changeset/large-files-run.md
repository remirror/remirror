---
'@remirror/core-utils': minor
'@remirror/core': minor
---

Update return signature of `getMarkRange` from `@remirror/core-utils` to also include the `mark` found. Additionally, to better support optional chaining it now returns `undefined` instead of `false` when no range can be found.
