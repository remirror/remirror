---
'@remirror/react-hooks': patch
---

Fix bug in `useMentionAtom` where asynchronous exits, like clicking, would not trigger an exit. Now the state is manually reset when the command is run.
