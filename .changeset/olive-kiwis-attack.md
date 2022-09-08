---
'@remirror/extension-link': patch
---

Auto link adjacent character detection.

Remove auto link if the link becomes invalid.

**Before:**

"window.confirm" results in "[window.co](//window.co)nfirm"

**After:**

"window.confirm" results in "window.confirm"

New options `findAutoLinks` and `isValidUrl` that if provided are used instead of `autoLinkAllowedTLDs` and `autoLinkRegex` to find and validate a link.

URLs are very ambiguous the new options allow to find valid auto links without adding additional complexity to the link extension.

Library examples to find URLs in text.

- [linkify-it](https://www.npmjs.com/package/linkify-it)
- [linkifyjs](https://www.npmjs.com/package/linkifyjs)

It is worth mentioning that the `autoLinkRegex` can be modified to exclude adjacent punctuations from an auto link.

Regex suggestion from @whawker

`/(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;`

**Examples**

- [www.remirror.io/test](www.remirror.io/test)? - excluding sentence punctuation
- "[www.remirror.io/test](www.remirror.io/test)" - surround link with quotation marks
- ([www.remirror.io/(test)](<www.remirror.io/(test)>))- link with balanced parentheses in path surrounded by parentheses
