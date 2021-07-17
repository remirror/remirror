---
hide_title: true
title: Create an editor
---

# Create an editor

Creating an editor consists of two steps.

1. Creating the wrapper with `Remirror` which sets up the editor functionality by passing in the extension manager.

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = () => {
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};
```

The above editor created automatically renders the editor into the dom within a div. Everything you type will be passed through with keybindings for the provided extensions.

### Overriding defaults

It's likely that you want a bit more control. This is why the `Remirror` components provides the `RemirrorContext` to all children components. When there are no children provided it automatically renders as above. But once we provide children we can take full control.

Let's create a menu and custom div to render the editor into.

```tsx
import React from 'react';
import { useActive, useCommands } from '@remirror/react';

const Menu = () => {
  // Access the commands and the activity status of the editor.
  const commands = useCommands();
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

import { Menu } from './editor';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = () => {
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

### Setting initial content

To set the initial content for the editor you can pass additional properties to the `useRemirror` hook. Initial content is only supported in uncontrolled components. You can find the docs for creating controlled components [here](./controlled.md).

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

import { Menu } from './editor';

const extensions = () => [
  new CorePreset(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
];

const Editor = () => {
  const { manager, state } = useRemirror({
    extensions,

    // Set the initial content.
    content: '<p>Initial content</p>',

    // Place the cursor at the start of the document. This an also be set to
    // `end`, `all` or a numbered position.
    selection: 'start',

    // Set the string handler which means the content provided will be
    // automatically handled as html. `markdown` is also available when the
    // `MarkdownExtension` is added to the editor.
    stringHandler: 'html',
  });

  return <Remirror manager={manager} initialContent={state} />;
};
```

The initial content can also be set to a `RemirrorJSON` object which matches this shape of the data provided by remirror. It's up to you how you store the data.
