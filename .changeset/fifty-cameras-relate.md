---
'prosemirror-paste-rules': patch
'jest-prosemirror': patch
'jest-remirror': patch
'@remirror/pm': patch
'@remirror/react-editors': patch
---

When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
