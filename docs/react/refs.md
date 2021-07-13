---
hide_title: true
title: Sharing editor context
---

# Sharing editor context

## Extract context as a `ref`

In order to access the context properties of your editor from an external component the following snippet should work.

It makes use of `useImperativeHandle` to attach the context from the editor to the `ref` within a forward ref component.

Here's the pure **JavaScript** version.

```jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import {
  ReactExtensions,
  ReactFrameworkOutput,
  ReactFrameworkOutput,
  Remirror,
  useRemirror,
} from '@remirror/react';

const extensions = () => [new BoldExtension()];

const EditorWithRef = forwardRef((_, ref) => {
  const { manager, state, setState, getContext } = useRemirror({ extensions });

  useImperativeHandle(ref, () => getContext(), [getContext]);

  // Add the state and create an `onChange` handler for the state.
  return (
    <Remirror
      manager={manager}
      state={state}
      onChange={(parameter) => {
        // Update the state to the latest value.
        setState(parameter.state);
      }}
    />
  );
});
```

Here's the **TypeScript** version which, as a bonus should pass type checks.

```tsx
import React, { forwardRef, useImperativeHandle } from 'react';
import {
  ReactExtensions,
  ReactFrameworkOutput,
  ReactFrameworkOutput,
  Remirror,
  useRemirror,
} from '@remirror/react';

const extensions = () => [new BoldExtension()];
type Extensions = ReactExtensions<BoldExtension>;

const EditorWithRef = forwardRef<ReactFrameworkOutput<Extensions>>((_, ref) => {
  const { manager, state, setState, getContext } = useRemirror({ extensions });

  useImperativeHandle(ref, () => getContext(), [getContext]);

  // Add the state and create an `onChange` handler for the state.
  return (
    <Remirror
      manager={manager}
      state={state}
      onChange={(parameter) => {
        // Update the state to the latest value.
        setState(parameter.state);
      }}
    />
  );
});
```
