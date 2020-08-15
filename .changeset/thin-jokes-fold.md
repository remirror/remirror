---
'@remirror/core-utils': minor
'@remirror/core': minor
'@remirror/extension-code': patch
'@remirror/extension-bold': patch
'@remirror/extension-italic': patch
'@remirror/extension-strike': patch
---

Add `ignoreWhitespace` option to `markInputRule` for ignoring a matching input rule if the capture groups is only whitespace. Apply to all wrapping input rules for `MarkExtension`'s in the `project`.

Fix #506 `ItalicExtension` issue with input rule being greedy and capturing one preceding character when activated within a text block.
