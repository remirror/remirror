---
'@remirror/extension-list': patch
---

Merge a patch from the upstream prosemirror-schema-list: https://github.com/ProseMirror/prosemirror-schema-list/commit/38867345f6d97d6793655ed77c16f1a7b18f6846

Make sure liftListItem doesn't crash when multiple items can't be merged.

Fix a crash in `liftListItem` that happens when list items that can't be merged are lifted together.
