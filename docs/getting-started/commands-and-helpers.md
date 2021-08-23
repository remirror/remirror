---
hide_title: true
title: Commands and helpers
---

# Commands and helpers

So now we have an editor, but how do we make changes to the document, and observe changes to save them to a backend?

Remirror providers **commands** and **helpers** to enable this. You can think of commands as _write_ actions, and helpers as _read_ actions.

## Commands

The only way to modify a Remirror document is via _commands_ - even when you are typing in a Remirror editor, you are creating `insertText` commands behind the scenes.

Commands are provided by extensions, and they may be triggered by input rules (i.e. `**bold**`), or keyboard shortcuts (i.e. `Ctrl/Cmd + B`).

They can also be triggered manually, this is useful when creating custom components that trigger behaviour. `@remirror/react` exposes the hooks `useCommands` or `useChainedCommands` for exactly this purpose.

### `useCommands`

```tsx
import React from 'react';
import { useActive, useCommands } from '@remirror/react';

export const BoldButton = () => {
  // Access the commands individually
  const { toggleBold, focus } = useCommands();
  const active = useActive();

  return (
    <button
      onClick={() => {
        toggleBold();
        focus();
      }}
      style={{ fontWeight: active.bold() ? 'bold' : undefined }}
    >
      B
    </button>
  );
};
```

### `useChainedCommands`

```tsx
import React from 'react';
import { useActive, useChainedCommands } from '@remirror/react';

export const BoldButton = () => {
  // Using command chaining
  const chain = useChainedCommands();
  const active = useActive();

  return (
    <button
      onClick={() => {
        chain // Begin a chain
          .toggleBold()
          .focus()
          .run(); // A chain must always be terminated with `.run()`
      }}
      style={{ fontWeight: active.bold() ? 'bold' : undefined }}
    >
      B
    </button>
  );
};
```

However be aware a command might not make sense in the current selection context - for instance, you cannot bold or italicise text within a code block, or you cannot change callout attributes, if the selected node is not a callout.

It is good UX practice to hide (or disable) actions that are not available at the moment. With Remirror you can check if a command is enabled using its `.enabled()` property.

In the example below we check if `toggleBold` is enabled, by checking the `toggleBold.enabled()` property. If not enabled, we disable the button.

```tsx
import React from 'react';
import { useActive, useCommands } from '@remirror/react';

export const BoldButton = () => {
  // Access the commands and the activity status of the editor.
  const { toggleBold } = useCommands();
  const active = useActive();

  return (
    <button
      onClick={() => toggleBold()}
      disabled={toggleBold.enabled() === false}
      style={{ fontWeight: active.bold() ? 'bold' : undefined }}
    >
      B
    </button>
  );
};
```

`toggleBold` is a very simple command with no arguments, others are more complex and expect arguments, like `insertImage`

```ts
insertImage({ src: 'https://web.site/image.png' });
```

In these cases it is good practice to pass the same arguments to `.enabled`, to ensure accurate results.

```ts
insertImage.enabled({ src: 'https://web.site/image.png' });
```

:::note

#### How this works (advanced)

Commands and there `.enabled` property execute the **exact same code** - the difference is whether they are _dispatched_ to the document or not.

Commands must do 2 things

1. Return `true` or `false`, to indicate whether they are enabled right now.
2. Check whether the `dispatch` property is present.
   - If `dispatch` **is** present, the command will modify the document.
   - If `dispatch` is **not** present, the command will **not** modify the document (this is the `.enabled()` case, checking if we _could_ execute the command).

[Example here](https://github.com/remirror/remirror/blob/a2ca7a83f35b3831b97817eb2cb38b1a82d60ab8/packages/remirror__extension-embed/src/iframe-extension.ts#L148-L161)

:::note

## Helpers

Helpers allow you to read state from the Remirror document, they are provided by extensions, just as commands are.

`@remirror/react` exposes the hook `useHelpers` to enable you to create custom components that use document state.

For instance if you want to save your Remirror document when the user presses `Ctrl/Cmd + S`, you could use a helper to extract the JSON representation of the document state.

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useHelpers, useKeymap, useRemirror } from '@remirror/react';

// Hooks can be added to the context without the need for creating custom components
const hooks = [
  () => {
    const { getJSON } = useHelpers();

    const handleSaveShortcut = useCallback(
      (props) => {
        const { state } = props;
        saveToBackend(getJSON(state));

        return true; // Prevents any further key handlers from being run.
      },
      [getJSON],
    );

    // "Mod" means platform agnostic modifier key - i.e. Ctrl on Windows, or Cmd on MacOS
    useKeymap('Mod-s', handleSaveShortcut);
  },
];

const Editor = () => {
  const { manager, state } = useRemirror({ extensions: () => [new BoldExtension()] });

  // Using the hooks prop to inject functionality that doesn't require rendered elements
  return <Remirror manager={manager} initialContent={state} hooks={hooks} />;
};
```

Here are a few useful helpers, but there are many more!

| Helper        | Extension            | Description                                       |
| ------------- | -------------------- | ------------------------------------------------- |
| `getJSON`     | (Built in)           | JSON representation (not stringified)             |
| `getText`     | (Built in)           | Plain text representation (maintains line breaks) |
| `getHTML`     | (Built in)           | HTML representation (using schema `toDOM`)        |
| `getMarkdown` | `markdown-extension` | Markdown representation (where possible)          |
