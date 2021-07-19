---
hide_title: true
title: 'focus'
---

# `focus`

Set the focus for the editor.

If using this with chaining this should only be placed at the end of the chain. It can cause hard to debug issues when used in the middle of a chain.

```tsx
import { useCallback } from 'react';
import { useRemirrorContext } from '@remirror/react';

const MenuButton = () => {
  const { chain } = useRemirrorContext();
  const onClick = useCallback(() => {
    chain.toggleBold().focus('end').run();
  }, [chain]);

  return <button onClick={onClick}>Bold</button>;
};
```
