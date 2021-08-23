---
hide_title: true
title: Create a manager
---

## Creating a manager

To initialise a Remirror editor we must first create a _manager_. The manager stores the commands and helpers from your chosen extensions.

### Extensions

Some extensions are provided by default, like the `DocExenstion`, `ParagraphExtension` and `HistoryExtension`, but in the vast majority of cases, **you need to chose the extensions required for your end goal**.

You can see a list of provided extensions [here](/docs/extensions/index).

```ts
import { BoldExtension, ItalicExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const { manager } = useRemirror({
  extensions: () => [new BoldExtension(), new ItalicExtension()],
});
```

Some extensions can be passed options, to tweak configuration options. For example here we are setting the default type for callouts.

```ts
import { BoldExtension, CalloutExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const { manager } = useRemirror({
  extensions: () => [
    new CalloutExtension({ defaultType: 'blank' }), // Override defaultType: 'info'
    new BoldExtension(),
  ],
});
```

:::note

Some extension options are _static_ (can only be set on initialisation), whilst other are _dynamic_ (and can be changed at run time).

There is more detailed information in [extension concepts](../concepts/extension.md#options).

:::note

### Setting initial content

To set the initial content for the editor you can pass additional properties to the `useRemirror` hook.

:::note

Initial content is only supported in uncontrolled components (which is recommended for most use cases).

You can find the docs for creating controlled components [here](../react/controlled.md).

:::note

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

import { Menu } from './menu';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

export const MyEditor = () => {
  const { manager, state } = useRemirror({
    extensions,

    // Set the initial content.
    content: '<p>Initial content</p>',

    // Place the cursor at the start of the document. This an also be set to
    // `end`, `all` or a numbered position.
    selection: 'start',

    // Set the string handler which means the content provided will be
    // automatically handled as html.
    // `markdown` is also available when the `MarkdownExtension`
    // is added to the editor.
    stringHandler: 'html',
  });

  return <Remirror manager={manager} initialContent={state} />;
};
```

The initial content can also be set to a `RemirrorJSON` object which matches this shape of the data provided by Remirror. It's up to you how you store the data.

Now we have created a manager, we need to render our editor.
