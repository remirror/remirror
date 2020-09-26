---
'@remirror/core-types': minor
'@remirror/core-utils': minor
---

Enable `all` selection when setting initial content and focusing on the editor.

```tsx
import React from 'react';
import { useRemirror } from 'remirror/react';

const EditorButton = () => {
  const { focus } = useRemirror();

  return <button onClick={() => focus('all')} />;
};
```
