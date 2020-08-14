---
'@remirror/core-types': minor
'@remirror/core-utils': minor
---

Enable `all` selection when setting initial content and focusing on the editor.

```tsx
import { useRemirror } from 'remirror/react';

const { focus } = useRemirror();
focus('all');
```
