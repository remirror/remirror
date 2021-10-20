---
'@remirror/extension-file': minor
'@remirror/core': patch
---

Exposes a function `hasUploadingFile` to determine if file uploads are currently taking place.

When a user drops a file, a file node is created without a href attribute - this attribute is set once the file has uploaded.

However if a user saves content, before uploads are complete we can be left with "broken" file nodes. This exposed function allows us to check if file uploads are still in progress.

Addtionally file nodes now render valid DOM attributes. Rather than `href` and `error`, they now render `data-url` and `data-error`.
