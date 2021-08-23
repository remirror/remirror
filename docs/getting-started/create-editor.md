---
hide_title: true
title: Create an editor
---

# Create an editor

Creating an editor consists of two steps.

1. Creating a manager, with extensions for your desired functionality (see previous guide).
2. Rendering the `Remirror` component, by passing in the extension manager.

```tsx
import 'remirror/styles/all.css';

import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

export const MyEditor = () => {
  const { manager } = useRemirror({ extensions });

  return (
    <div className='remirror-theme'>
      {/* the className is used to define css variables necessary for the editor */}
      <Remirror manager={manager} />;
    </div>
  );
};
```

The above editor automatically renders an editor into the DOM within a div. Everything you type will be passed through with keybindings for the provided extensions.

### Overriding defaults

It's likely that you want a bit more control, you likely want a menu for instance. When there are no children provided to the `Remirror` component it automatically renders as above. But once we provide children we can take full control.

This is why the `Remirror` component provides the `RemirrorContext` to all children components.

Let's create a menu and custom div to render the editor into.

```tsx
import React from 'react';
import { useActive, useCommands } from '@remirror/react';

export const Menu = () => {
  // Access the commands and the activity status of the editor.
  const commands = useCommands();
  // Whether bold/italic etc is active at the current selection.
  const active = useActive();

  return (
    <div>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        B
      </button>
      <button
        onClick={() => commands.toggleItalic()}
        style={{ fontWeight: active.italic() ? 'bold' : undefined }}
      >
        I
      </button>
      <button
        onClick={() => commands.toggleUnderline()}
        style={{ fontWeight: active.underline() ? 'bold' : undefined }}
      >
        U
      </button>
    </div>
  );
};
```

In the above snippet we are retrieving commands and active status via two builtin hooks `useCommands` and `useActive`. These hooks rely on the `useRemirrorContext` hook which provides the context.

This menu can be used within the `<Remirror />` component as shown below.

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { EditorComponent, Remirror, useRemirror } from '@remirror/react';

import { Menu } from './my-menu';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

export const MyEditor = () => {
  const { manager } = useRemirror({ extensions });

  return (
    <Remirror manager={manager}>
      {/* The text editor is placed above the menu to make the zIndex easier to manage for popups */}
      <EditorComponent />
      <Menu />
    </Remirror>
  );
};
```

Notice the `EditorComponent` above, this component was automatically rendered in the first example, but now we are rendering it ourselves to have full control of the DOM structure.

Rendering components as children of the `Remirror` component, that utilise `RemirrorContext` via hooks allows you to create very customised and powerful experiences.
