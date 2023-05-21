---
'remirror': patch
'@remirror/extension-link': patch
---

Disable link click handler when contenteditable is `false`. This fixes an issue that causes clicking a link in an uneditable editor will open the link twice.
