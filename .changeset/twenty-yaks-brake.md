---
'@remirror/extension-markdown': minor
---

Fix the html sanitizing on HTML output from markdown. Removed the default html sanitizer because it doesn't provide any security guarantees and it's not been called due to a bug in the markdown extension.
