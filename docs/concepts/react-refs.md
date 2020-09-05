---
hide_title: true
title: React Refs
---

# React Refs

## Extract context as a `ref`

In order to access the context properties of your editor from externally the following snippet should work.

It makes use of the less well known `useImperativeHandle` to attach the context from the editor to the `ref` within a forward ref component.

```tsx
import React, { FC, forwardRef, useImperativeHandle } from 'react';
import { useRemirror } from 'remirror/react';

let EditorWithRef = (props: object, ref: RemirrorContext) => {
  const context = useRemirror();
  const { getRootProps } = context;

  useImperativeHandle(ref, () => context);

  return <div {...getRootProps} />;
};

EditorWithRef = forwardRef(EditorWithRef);
```
