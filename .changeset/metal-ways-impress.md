---
'@remirror/core': major
---

Remove `custom` and `restore` chainable commands. Instead the `chain` command object is now callable. In order to pass in a custom transaction it should be called with something like the following

```tsx
import { useChainableCommands, useEditorView } from '@remirror/react';

function useInsertHello() {
  const view = useEditorView();
  const chain = useChainableCommands();

  return () => chain(view.state.tr).insertText(' Hello ');
}
```
