---
'@remirror/extension-code-block': patch
'@remirror/extension-diff': patch
'@remirror/extension-heading': patch
'@remirror/extension-mention': patch
'@remirror/extension-mention-atom': patch
'@remirror/extension-collaboration': patch
'@remirror/extension-emoji': patch
'@remirror/extension-search': patch
'@remirror/extension-strike': patch
'@remirror/preset-embed': patch
'@remirror/preset-list': patch
---

Fix type annotations for `createCommands` functions. This was causing issues with inferring all the commands available across the extensions since the types were compiling as `any`.

The following should now work with full type inference.

```tsx
import { useRemirror } from 'remirror/react';

const EditorButton = () => {
  const { commands, chain } = useRemirror();

  return (
    <>
      <button onClick={() => commands.toggleBulletList()}>Toggle List</button>
      <button onClick={() => chain.toggleBold().toggleStrike().toggleItalic()}>Cray!</button>
    </>
  );
};
```
