---
hide_title: true
title: Render the editor
---

# Render the editor

Next, we render the UI of our editor, which will be controlled by the manager. For that, we add a `Remirror` component and pass it the manager and state created in the previous step:

```tsx
import 'remirror/styles/all.css';

import { BoldExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

export const MyEditor = () => {
  const { manager, state } = useRemirror({
    extensions: () => [new BoldExtension()],
    content: '<p>I love <b>Remirror</b></p>',
    selection: 'start',
    stringHandler: 'html',
  });

  return (
    <div className='remirror-theme'>
      {/* the className is used to define css variables necessary for the editor */}
      <Remirror manager={manager} initialContent={state} />
    </div>
  );
};
```

The `<Remirror>` component renders automatically an editor into the DOM. Everything you type will be passed through with keybindings to the Remirror extensions.

Users can even bold text via input rules: Type `**bold**` to add bold text.

## Add components into the editor

The automatic rendering kickstarts our development but we want to have a bit more control. For example, we'd like to have a menu where users can bold text.

When there are no children provided to the `Remirror` component it automatically renders as above. But once we provide children we can take full control.

The `Remirror` component provides access to the editor to all children components via the `RemirrorContext`. We'll take advantage of this in the next step. For now, we render just a shell where we can later add our menu:

```tsx
import 'remirror/styles/all.css';

import { BoldExtension } from 'remirror/extensions';
import { EditorComponent, Remirror, useRemirror } from '@remirror/react';

const Menu = () => <button onClick={() => alert('TBD')}>B</button>;

export const MyEditor = () => {
  const { manager, state } = useRemirror({
    extensions: () => [new BoldExtension()],
    content: '<p>I love <b>Remirror</b></p>',
    selection: 'start',
    stringHandler: 'html',
  });

  return (
    <div className='remirror-theme'>
      <Remirror manager={manager} initialContent={state}>
        {/* The text editor is placed above the menu to make the zIndex easier to manage for popups */}
        <EditorComponent />
        <Menu />
      </Remirror>
    </div>
  );
};
```

Notice the `EditorComponent` above, this component was automatically rendered in the first example, but now we are rendering it ourselves to have full control of the DOM structure.

With that, we have an UI for our editor and we prepared a menu to bold text. Next, we'll bring the menu to life.
