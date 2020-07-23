---
title: Create an editor
---

Creating an editor consists of two steps.

1. Creating the wrapper with `RemirrorProvider` which sets up the editor functionality by passing in
   the extension manager.

```tsx
import { CorePreset } from 'remirror/preset/core';
import { RemirrorProvider, useManager } from 'remirror/react';
import { BoldExtension } from 'remirror/extension/bold';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';

import { Menu, TextEditor } from './my-editor';

const EditorWrapper = () => {
  const manager = useManager([
    new CorePreset(),
    new BoldExtension(),
    new ItalicExtension(),
    new UnderlineExtension(),
  ]);

  return (
    <RemirrorProvider manager={manager}>
      <div>
        <Menu />
        <TextEditor />
      </div>
    </RemirrorProvider>
  );
};
```

2. Creating the inner editor which has access to the editor commands, functionality, updating
   dynamic props cursor position and more. This is where the editor specifics UI will live.

```tsx
import { useRemirror } from '@remirror/react';

const Menu = () => {
  const { getRootProps, commands, active } = useRemirror({ autoUpdate: true });

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

export const TextEditor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};
```

`getRootProps` is used to inject the editor into a specific UI element. In the example above the
root props are added to the div.

```js live
function example() {
  function Menu() {
    const { getRootProps, commands, active } = useRemirror({ autoUpdate: true });

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
  }

  function TextEditor() {
    const { getRootProps } = useRemirror();

    return <div {...getRootProps()} />;
  }

  function EditorWrapper() {
    const manager = useManager([
      new CorePreset(),
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
    ]);

    return (
      <RemirrorProvider manager={manager}>
        <div>
          <Menu />
          <TextEditor />
        </div>
      </RemirrorProvider>
    );
  }

  return <EditorWrapper />;
}
```
