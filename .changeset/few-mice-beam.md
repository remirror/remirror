---
'@remirror/core': patch
---

Fix a bug on `Chrome` which caused the autofocus="false" to trigger the autofocus action. Now `autofocus` being falsey removes the attribute from the dom.
