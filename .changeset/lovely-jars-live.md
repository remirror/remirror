---
'@remirror/core': minor
---

**BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured as `'selection'` to enable persistent selection.

If you are using `@remirror/react`, you can enable it like this:

```tsx
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

function Editor(): JSX.Element {
  const { manager } = useRemirror({ builtin: { persistentSelectionClass: 'selection' } });
  return (
    <ThemeProvider>
      <Remirror manager={manager} />
    </ThemeProvider>
  );
}
```



The persistent selection will only be enable if the editor loses focus.
