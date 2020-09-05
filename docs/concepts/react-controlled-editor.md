---
hide_title: true
title: React controlled editor
---

# React controlled editor

There are times when you will want complete control over the content in your editor. For this reason remirror supports **controlled editors**. Setting up your editor like this is more complicated due to the asynchronous nature of react updates versus the synchronous nature of ProseMirror `dispatch`. It's easy to get yourself in trouble without taking care to understand the concepts. If in doubt, start with an uncontrolled editor and upgrade to **controlled** once you're more comfortable with `remirror`.

:::note Advanced Topic

The following is considered an advanced topic. If you are struggling to understand some of the concepts don't feel bad. It can be hard to understand initially.

:::

Get started in the usual way.

```tsx
import React from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

// This is a function that returns the list of extensions and presets we want to
// use. It's helpful to set up this way since the template can be reused
// multiple times in your app.
const extensionTemplate = () => [new BoldExtension()];

// Adds the `RemirrorProvider` which is responsible for wrapping the editor with
// the context and state of the rendered editor.
const EditorWrapper = () => {
  // A convenient hooks for creating the manager in a react editor.
  const manager = useManager(extensionTemplate);

  return (
    <RemirrorProvider manager={manager}>
      <Editor />
    </RemirrorProvider>
  );
};

const Editor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};
```

The main difference is that you will need to create the state value that is passed into the editor. This value is called the `EditorState` and is an object that will be familiar to you if you have used `ProseMirror` in the past. When remirror sees the value it knows to treat the editor as a controlled instance. For things to work correctly you are required to add an `onChange` handler for the `RemirrorProvider`.

```tsx
// Add the `useState` hook to keep track of the state.
import React, { useState } from 'react';
// Add the `fromHtml` string handler import so that the initial state can be a
// html string.
import { fromHtml } from 'remirror/core';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

const extensionTemplate = () => [new BoldExtension()];

const EditorWrapper = () => {
  const manager = useManager(extensionTemplate);

  // Store the editor value in a state variable.
  const [value, setValue] = useState(() =>
    // Use the `remirror` manager to create the state.
    manager.createState({
      content: '<p>This is the initial value</p>',
      stringHandler: fromHtml,
    }),
  );

  // Add the value and change handler to the editor.
  return (
    <RemirrorProvider
      manager={manager}
      value={value}
      onChange={(parameter) => {
        // Update the state to the latest value.
        setValue(parameter.state);
      }}
    >
      <Editor />
    </RemirrorProvider>
  );
};

export const Editor = (): JSX.Element => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};
```

The editor now behaves in a similar way to what you'd expect from a non controlled editor. The main thing is that we've been able to intercept the state update and can do some pretty interesting things with this power.

For example, the following change handler now intercepts the state update in order to insert `NO!!!` into the editor whenever the user types any content.

```tsx
import React from 'react';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

import { Editor } from './editor';

const EditorWrapper = () => {
  const manager = useManager(extensionTemplate);

  const [value, setValue] = useState(() =>
    manager.createState({
      content: '<p>This is the initial value</p>',
      stringHandler: fromHtml,
    }),
  );

  return (
    <RemirrorProvider
      manager={manager}
      value={value}
      onChange={(parameter) => {
        const { state, tr } = parameter;
        let nextState = state;

        // Check if the document content for the editor changed.
        if (tr?.docChanged) {
          // Insert text into the editor via a new state.
          nextState = state.applyTransaction(state.tr.insertText('NO!!!'));
        }

        // Update to using a new value
        setValue(nextState);
      }}
    >
      <Editor />
    </RemirrorProvider>
  );
};
```

### Potential pitfalls

Commands use the current state stored on `view.state` to dispatch transactions and create a new state. In an uncontrolled editor this is perfectly fine since the source of truth is `view.state`. Once an update is dispatched the state is updated synchronously and `onChange` is immediately called. With **controlled** editors there's often a delay between the `view.dispatch` and the state being updated.

When attempting to synchronously run multiple commands in a **controlled** editor, each command operates on the current state, not the state as applied by the previous command. As a result, we find ourselves in a situation where the last command wins. i.e. the last state update before the controlled editor can apply the new state is the one that will be used.

Since the playground is a controlled editor, you can observe the phenomenom there.

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

**There are some that still need to be made chainable**

In [#422](https://github.com/remirror/remirror/pull/422) most commands have been made chainable. `@remirror/preset-table` and `@remirror/preset-list` have been left out for now since they require a bit more work to convert their commands to rely on transactions rather than state.

When I have time, I'll need to convert the commands that are currently being imported by `prosemirror-tables` and `prosemirror-schema-list` to use transactions instead of state. At this point it might even make sense to remove these libraries from `@remirror/pm`.

You can see an example of one such conversion [here](https://github.com/remirror/remirror/blob/7477b9357368d62e201d05db4d9872954ae13c11/packages/%40remirror/core-utils/src/command-utils.ts#L128-L164).

### Workarounds

- Use `chained` commands where possible.
- Commands that update the transaction will also work since the same transaction is shared, however it's advisable to be explicit about the intent to chain commands together.
- Certain commands will never be chainable. If you are using TypeScript this will be obvious as they are **non-callable**.
- Work will be done to convert the `@remirror/preset-tables` library and `@remirror/preset-list` to use chainable commands.
