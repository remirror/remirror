---
'@remirror/extension-link': patch
---

# fix(ext-link): not auto detecting adjacent text

Closes issue [1732](https://github.com/remirror/remirror/issues/1732)

## Before this change:

Auto link detection did not detect adjacent text.

### Example:

Insert "window.confirm" results in "[window.co](//window.co)nfirm"

## After this change:

Adjacent text is detected and possibly removes invalid link or creates a link

### Example:

Insert "window.confirm" results in "window.confirm"

Added "adjacentPunctuations" option to configure which adjacent punctuation are excluded from links
