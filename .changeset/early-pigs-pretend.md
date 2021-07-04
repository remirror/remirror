---
'@remirror/extension-list': minor
---

- Add a new input rule to `TaskListItemExtension`. When a user types `[]`, `[ ]`, `[x]` or `[X]` at the begin of a list item, the editor will turn this list item into a task list item and do other some necessary transforms.
- Add a new command `liftListItemOutOfList` to `ListItemExtension`, which can lift the content inside a list item out of list.
