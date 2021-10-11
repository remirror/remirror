---
'@remirror/extension-list': minor
---

Improved the behavior of decreasing indentation in a list. A list item won't be able to lift out of list anymore when the user dedent it. Indenting across different types of lists is more consistent.

Exported a new helper function `dedentList`.

Deprecated `sharedLiftListItem`.
