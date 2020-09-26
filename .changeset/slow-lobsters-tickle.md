---
'@remirror/core-utils': minor
---

Add new helpers `getChangedRanges`, `getChangedNodeRanges` and `getChangedNodes` which take a transaction and return a list of changed ranges, node ranges or nodes with positions.

This is useful for increasing the performance and only checking the parts of the document that have changed between updates.
