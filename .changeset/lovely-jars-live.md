---
'@remirror/core': minor
---

**BREAKING CHANGE**: The option `persistentSelectionClass` for `DecorationsExtension` is now `undefined` by default. It needs to be explicitly configured to enable persistent selection. You can set it as `'selection'` to match the default styles provided by `@remirror/styles`.

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

In the interest of performance, the persistent selection will only be displayed if the editor loses focus.
