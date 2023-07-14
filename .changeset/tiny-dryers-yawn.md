---
'@remirror/extension-tables': minor
---

Expose a `toggleTableHeader` command, which only toggles the first row or column in a table.

```tsx
const { toggleTableHeader } = useCommands();

const handleClick = useCallback(() => {
  toggleTableHeader(); // row by default

  // Or
  toggleTableHeader('column');
}, [toggleTableHeader]);
```

Expose a `tableHasHeader` helper, which returns a boolean stating if the first column or row in a table is a header.

```tsx
const { tableHasHeader } = useHelpers(true);

console.log('first row is header', tableHasHeader());

console.log('first column is header', tableHasHeader('column'));
```
