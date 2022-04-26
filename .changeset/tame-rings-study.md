---
'@remirror/react-core': minor
---

Add a new hook `useExtensionEvent`. You can use it to add event handlers to your extension. It's simpler and easier to use than the existed `useExtension` hook.

It accepts an extension class, an event name and a memoized handler. It's important to make sure that the handler is memoized to avoid needless updates.

Here is an example of using `useExtensionEvent`:

```ts
import { useCallback } from 'react';
import { HistoryExtension } from 'remirror/extensions';
import { useExtensionEvent } from '@remirror/react';

const RedoLogger = () => {
  useExtensionEvent(
    HistoryExtension,
    'onRedo',
    useCallback(() => log('a redo just happened'), []),
  );

  return null;
};
```
