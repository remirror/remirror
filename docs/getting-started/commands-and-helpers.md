---
hide_title: true
title: Commands and helpers
---

# Commands and helpers

Now we have a working editor and the beginning of a menu. Time to wire up the menu, so users can change the document. And there is another important piece missing: We need to observe changes to save them to a backend.

Remirror enables this via **commands** and **helpers**. You can think of commands as _write_ actions, and helpers as _read_ actions.

## Commands

The only way to modify a Remirror document is via _commands_ - even when you are typing in a Remirror editor, you are creating `insertText` commands behind the scenes.

Commands are provided by extensions, and they may be triggered by input rules (i.e. `**bold**`), or keyboard shortcuts (i.e. `Ctrl/Cmd + B`).

They can also be triggered manually, this is useful when creating custom components that trigger behaviour. `@remirror/react` exposes the hooks `useCommands` or `useChainedCommands` for exactly this purpose.

### Bold content

Let's toggle the bold status when the user clicks the bold button:

```tsx
import { useCommands } from '@remirror/react';

export const Menu = () => {
  const { toggleBold, focus } = useCommands();

  return (
    <button
      onClick={() => {
        toggleBold();
        focus();
      }}
    >
      B
    </button>
  );
};
```

### Visualize if content is bold

Users can now toggle the bold state but the button doesn't give any indication if the current text is bold or not. This can be added via another hook: `useActive`:

```tsx
import { useActive, useCommands } from '@remirror/react';

export const Menu = () => {
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

### Another way of bolding

One cumbersome part of above click handler is that we have to execute the `toggleBold` and `focus` command after each other. Remirror offers chaining for a more natural way of executing multiple commands:

```tsx
import React from 'react';
import { useActive, useChainedCommands } from '@remirror/react';

export const Menu = () => {
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

### Disable menu button if it can't be used

However, be aware that a command might not make sense in the current selection context. For instance, you cannot bold text within a code block.

It is good UX practice to disable (or hide) actions that are not available at the moment. With Remirror you can check if a command is enabled using its `.enabled()` property:

```tsx
import React from 'react';
import { useCommands } from '@remirror/react';

export const Menu = () => {
  // Access the commands and the activity status of the editor.
  const { toggleBold } = useCommands();

  return (
    <button onClick={() => toggleBold()} disabled={toggleBold.enabled() === false}>
      B
    </button>
  );
};
```

`toggleBold` is a very simple command with no arguments, others are more complex and expect arguments, like `toggleHeading`

```ts
toggleHeading({ level: 1 });
```

In these cases it is good practice to pass the same arguments to `.enabled`, to ensure accurate results.

```ts
toggleHeading.enabled({ level: 1 });
```

:::note

#### How this works (advanced)

Commands and their `.enabled` property execute the **exact same code** - the difference is whether they are _dispatched_ to the document or not.

Commands must do two things:

1. Return `true` or `false`, to indicate whether they are enabled right now.
2. Check whether the `dispatch` property is present.
   - If `dispatch` **is** present, the command will modify the document.
   - If `dispatch` is **not** present, the command will **not** modify the document (this is the `.enabled()` case, checking if we _could_ execute the command).

[Example here](https://github.com/remirror/remirror/blob/2666698102afd15d118a1e0bdf5c983fec0ba103/packages/remirror__extension-embed/src/iframe-extension.ts#L154-L170)

:::note

## Helpers

Helpers allow you to read state from the Remirror document. They are provided by extensions - just as commands are. You can access the helpers via the `useHelpers` hook.

Let's save the Remirror document when the user presses `Ctrl/Cmd + S`! For that, we'll use a helper to extract the JSON representation of the document state:

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useHelpers, useKeymap, useRemirror } from '@remirror/react';

// Hooks can be added to the context without the need for creating custom components
const hooks = [
  () => {
    const { getJSON } = useHelpers();

    const handleSaveShortcut = useCallback(
      ({ state }) => {
        console.log(`Save to backend: ${JSON.stringify(getJSON(state))}`);

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

With that, we have a UI to interact with our editor. Next, we'll extend the functionalities of the editor itself.
