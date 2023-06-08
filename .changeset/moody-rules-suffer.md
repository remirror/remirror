---
'@remirror/extension-mention-atom': patch
'@remirror/react-hooks': patch
'@remirror/react': patch
---

Fix partial matches when using mention atoms, where support characters include whitespace.

Exposed a new option `replacementType` in the `useMentionAtom` hook. This allows you to replace the match **up to where the cursor is placed**, rather than the _entire_ match.

```tsx
const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
  items,
  replacementType: 'partial', // <-- Here
});
```

This is of particular use if your mention atoms include whitespace. Instead of replacing the remainder of the text in a line, it will only replace up to the cursor.
