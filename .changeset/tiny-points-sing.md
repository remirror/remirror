---
'@remirror/extension-code-block': patch
'@remirror/react': patch
'remirror': patch
---

Revert the `prettier` dependency to v2.8.8 in `@remirror/extension-code-block`.

Prettier v3 has changed all APIs to be asynchronous. ProseMirror's APIs are mostly synchronous, so using Prettier v3's API would be challenging (although possible). `@prettier/sync` provides a synchronous Prettier v3 API, but this library can only be used in a Node.js environment, so we cannot use it either.
