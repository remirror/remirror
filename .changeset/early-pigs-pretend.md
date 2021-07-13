---
'@remirror/extension-list': minor
---

- Add a new input rule to `TaskListItemExtension`. When a user types `[]`, `[ ]`, `[x]` or `[X]` at the beginning of a `listItem` node, the editor will turn this node into a `taskListItem` node and also do some necessary transforms.
- Add a new command `liftListItemOutOfList` to `ListItemExtension`, which can lift the content inside a list item out of list.
