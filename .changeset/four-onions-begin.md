---
'@remirror/react-core': patch
---

Add a hook, and 2 React components to simplify subscribing to document changes.

Adds a `useDocChanged` hook, which when given a handler function, calls it with the transactions and state when document is changed.

```js
import { useCallback } from 'react';
import { useDocChanged } from '@remirror/react';

useDocChanged(
  useCallback(({ tr, transactions, state }) => {
    console.log('Transaction', tr);
    console.log('Transactions', transactions);
    console.log('EditorState', state);
  }, []),
);
```

Also adds two React components, `OnChangeJSON` and `OnChangeHTML` which accept a handler function, which is called with the JSON or HTML serialisation of doc state, whenever the document is changed.

```jsx
import { useCallback } from 'react';
import { OnChangeJSON, OnChangeHTML } from '@remirror/react';

const handleChangeJSON = useCallback((json) => {
  console.log('JSON serialised state', json);
}, []);

const handleChangeHTML = useCallback((html) => {
  console.log('HTML serialised state', html);
}, []);

return (
  <Remirror manager={manager} autoRender>
    <OnChangeJSON onChange={handleChangeJSON} />
    <OnChangeHTML onChange={handleChangeHTML} />
  </Remirror>
);
```
