---
'@remirror/core': minor
'@remirror/core-constants': minor
'@remirror/core-utils': minor
'@remirror/extension-italic': patch
'@remirror/extension-mention': minor
'prosemirror-suggest': minor
---

Add `invalidMarks` support.

- Add the ability to disable all input rules if a certain mark is active.
- Fix the `ItalicExtension` regex which was over eager.
- Expose `decorationSet` for the `prosemirror-suggest` state.
- Export `markActiveInRange`, `rangeHasMarks`, `positionHasMarks` from `prosemirror-suggest`.
- Add helpers `getMarksByTags` and `getNodesByTags` to the `TagsExtension`.
