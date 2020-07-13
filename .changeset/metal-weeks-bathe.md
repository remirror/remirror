---
'@remirror/core': minor
'@remirror/react': patch
---

Move `suppressHydrationWarning` prop from core to to react editor. It makes no sense for it to be in core since it only impacts the react editor.
