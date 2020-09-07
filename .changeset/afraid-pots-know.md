---
'prosemirror-suggest': minor
---

Multiple improvements to the `prosemirror-suggest` implementation.

Add support for setting a function to determine whether decorations should be ignored. `ShouldDisableDecorations` takes the current state and the active match and returns true when decorations should be disabled.

Add support for `checkNextValidSelection` which is called for all suggesters to provide the opportunity to peek forward into the next valid text selection and decide whether or not any action should be taken. This is used in the `@remirror/extension-mention` to fix [#639](https://github.com/remirror/remirror/issues/639).

Add option `emptySelectionsOnly` to prevent matches when the text selection is not empty.

Prevent non-text selection from triggering matches.

Adds missing range check to `invalidMarks` tests.
