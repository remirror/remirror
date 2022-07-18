---
'prosemirror-paste-rules': patch
---

When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
