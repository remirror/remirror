---
'@remirror/react': minor
---

Add a `focus` method to the remirror editor context object. It allows focusing at a provided position which
can be `start`, `end`, a specific position or a range using the `{from: number; to: number}` type signature.

To use this run

```tsx
import { useRemirrorContext } from '@remirror/react';

const MyEditor = () => {
  const { focus, getRootProps } = useRemirrorContext();

  useEffect(() => {
    focus('end'); // Autofocus to the end once
  }, []);
};
return <div {...getRootProps()} />;
```

Resolves the initial issue raised in #229.
