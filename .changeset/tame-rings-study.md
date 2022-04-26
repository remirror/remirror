---
'@remirror/react-core': minor
---

Add two new hook `useExtensionEvent` and `useExtensionCustomEvent`. You can use them to add event handlers to your extension. They are simpler and easier to use than the existed `useExtension` hook.

Both of them accept a extension class, a event name and a memoized handler. It's important to make sure that the handler is memoized to avoid needless updates.

Here is an example of using `useExtensionEvent`:

```ts
import { useCallback } from 'react';
import { HistoryExtension } from 'remirror/extensions';
import { useExtensionEvent } from '@remirror/react';

const Editor = ({ placeholder = 'Your magnum opus' }) => {
  useExtensionEvent(
    HistoryExtension,
    'onRedo',
    useCallback(() => log('a redo just happened'), []),
  );

  return null;
};
```
