---
'@remirror/core-utils': patch
---

Fix `getChangedNodeRanges` when resolving content that may no longer be within the range of the full document. This addresses the issues raised in [#797](https://github.com/remirror/remirror/issues/797) and [#764](https://github.com/remirror/remirror/issues/764).
