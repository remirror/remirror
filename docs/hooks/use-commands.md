---
hide_title: true
title: 'useCommands'
---

# `useCommands`

A core hook which provides the commands for usage in your editor.

```tsx
import { useCommands } from '@remirror/react';

const EditorButton = () => {
  const commands = useCommands();

  return (
    <>
      <button onClick={() => commands.toggleBold()}>Click me!</button>
    </>
  );
};
```
