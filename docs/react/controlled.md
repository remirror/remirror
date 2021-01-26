---
hide_title: true
title: Controlled
---

# Controlled

There are times when you will want complete control over the content in your editor. For this reason remirror supports **controlled editors**. Setting up your editor like this is more complicated due to the asynchronous nature of react updates versus the synchronous nature of ProseMirror `dispatch`. It's easy to get yourself in trouble without taking care to understand the concepts. If in doubt, start with an uncontrolled editor and upgrade to **controlled** once you're more comfortable with `remirror`.

Get started by creating the editor below, which is currently uncontrolled.

```tsx
import React from 'react';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

// This is a function that returns the list of extensions and presets we want to
// use. It's helpful to set up this way since the template can be reused
// multiple times in your app.
const extensions = () => [new BoldExtension()];

// Adds the `<Remirror />` which is responsible for wrapping the editor with
// the context and state of the rendered editor.
const Editor = () => {
  // A convenient hooks for creating the manager in a react editor.
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};
```

In order to make an editor **controlled** the `<Remirror />` component exposes two required props. `state` and `onChange`. When these props are passed as props the editor will be treated as a controlled instance.

To simplify this process there are two properties provided by the `useRemirror` hook; `state` and `setState`.

```tsx
import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension()];

const Editor = () => {
  const { manager, state, setState } = useRemirror({
    extensions,

    // Add the string handler import so that the initial
    // state can created from a html string.
    stringHandler: 'html',

    // This content is used to create the initial value. It is never referred to again after the first render.
    content: '<p>This is the initial value</p>',
  });

  // Add the state and create an `onChange` handler for the state.
  return (
    <Remirror
      autoRender={'start'}
      manager={manager}
      state={state}
      onChange={(parameter) => {
        // Update the state to the latest value.
        setState(parameter.state);
      }}
    />
  );
};
```

The editor now behaves in a similar way to what you'd expect from a non controlled editor. The main thing is that we've been able to intercept the state update and can do some pretty interesting things with this power.

For example, the following change handler now intercepts the state update in order to insert `NO!!!` into the editor whenever the user types any content.

```tsx
import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension()];

const Editor = () => {
  const { manager, state, setState } = useRemirror({
    extensions,
    stringHandler: htmlToProsemirrorNode,
    content: '<p>This is the initial value</p>',
  });

  // Add the state and create an `onChange` handler for the state.
  return (
    <Remirror
      manager={manager}
      state={state}
      onChange={(parameter) => {
        let nextState = parameter.state;

        // Check if the document content for the editor changed.
        if (tr?.docChanged) {
          // Insert text into the editor via a new state.
          nextState = state.applyTransaction(state.tr.insertText(' NO!!!'));
        }

        // Update the state to the latest value.
        setState(nextState);
      }}
    />
  );
};
```

Maybe you don't need to intercept the onChange callback, all you need is access to the `state` value. For this use case the `useRemirror` hook provides an escape hatch with a property named `onChange`. This callback does what we've been doing by calling `setState` with the new state value when the `onChange` callback is called.

```tsx
import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension()];

const Editor = () => {
  const { manager, state, onChange } = useRemirror({
    extensions,

    // Add the `htmlToProsemirrorNode` string handler import so that the initial
    // state can created from a html string.
    stringHandler: htmlToProsemirrorNode,

    // This content is used to create the initial value. It is never referred to again after the first render.
    content: '<p>This is the initial value</p>',
  });

  // Add the state and create an `onChange` handler for the state.
  return (
    <Remirror
      manager={manager}
      state={state}
      // Apply the controlled state updates automatically.
      onChange={onChange}
    />
  );
};
```

### Potential pitfalls

Commands use the current state stored on `view.state` to dispatch transactions and create a new state. In an uncontrolled editor this is perfectly fine since the source of truth is `view.state`. Once an update is dispatched the state is updated synchronously and `onChange` is immediately called. With **controlled** editors there's often a delay between the `view.dispatch` and the state being updated.

When attempting to synchronously run multiple commands in a **controlled** editor, each command operates on the current state, not the state as applied by the previous command. As a result, we find ourselves in a situation where the last command wins. i.e. the last state update before the controlled editor can apply the new state is the one that will be used.

Since the playground supports controlled editors, you can also observe the phenomenon there.

I created a [controlled editor test](https://github.com/remirror/remirror/blob/7477b9357368d62e201d05db4d9872954ae13c11/packages/%40remirror/react/src/components/__tests__/react-editor-controlled.spec.tsx#L368-L418) showing that this is actually expected behaviour. Making multiple state updates before the state has been updated will not work in a controlled editor.

### Chained Commands

The advised workaround is to use `chained` commands.

```tsx
import React from 'react';

const ChainedButton = () => {
  const { chained } = useRemirror();

  return <button onClick={() => chained.toggleBold().toggleItalic().toggleUnderline().run()} />;
};
```

Chained commands allow composing different commands together that have been updated to work with the ProseMirror `transaction` rather than the fixed state. This means that each command adds new steps and when the `.run()` is called all these steps are dispatched at the same time.

However, not all commands are chainable.

**There are some that will never be chainable.**

- `undo`
- `redo`

These only work with **synchronous** state updates and it doesn't really make sense to use them as part of a chain. Calling them with `chained` will throw an error and if you're using TypeScript your code will complain at compile time.

### Workarounds

- Use `chained` commands where possible.
- Commands that update the transaction will also work since the transaction is across commands within remirror, however it's advisable to be explicit about the intent to chain commands together.
- Certain commands will never be chainable. If you are using TypeScript this will be obvious as they are **non-callable**.
