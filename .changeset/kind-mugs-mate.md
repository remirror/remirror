---
'@remirror/react-hooks': patch
---

Fix issue with `useEmoji`, `useKeymap` and `useEvents` when used together with `useRemirror({ autoUpdate: true })` causing an infinite loop.
