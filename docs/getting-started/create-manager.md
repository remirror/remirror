---
hide_title: true
title: Create a manager
---

# Creating a manager

To initialise a Remirror editor we must first create a _manager_. The manager controls what your editor will be able to do.

## Add extensions

The manager itself brings only extremely basic functionality. Everything else is packaged in Remirror extensions. In fact, a manager without extensions isn't usable at all. So, when creating a manager, Remirror will automatically add a minimal set of extensions like support for paragraphs (`ParagraphExtension`) and undo (`HistoryExtension`). Beyond that, you can freely pick & choose what you need for your specific use case.

Let's add to our editor support for bold and italic formatting:

```ts
import { BoldExtension, ItalicExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const { manager } = useRemirror({
  extensions: () => [new BoldExtension(), new ItalicExtension()],
});
```

Bold and italic is very straight forward. Hence, there are no configuration options.

Other extensions can be tweaked. For example, here we add support for callouts and default them to warnings:

```ts
import { BoldExtension, CalloutExtension, ItalicExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const { manager } = useRemirror({
  extensions: () => [
    new BoldExtension(),
    new ItalicExtension(),
    new CalloutExtension({ defaultType: 'warn' }), // Override defaultType: 'info'
  ],
});
```

Remirror comes with many ready-made extensions. Check out the [list of extensions](/docs/extensions/index).

:::note

Extensions allow you not only to fine-tune the editor to your specific needs. They also allow you to add your custom features to the editor. Read the [extension guide](../concepts/extension.md) for more details.

:::note

## Set initial content

We can also set the initial content of our editor via the `useRemirror` hook. We get access to the initialized editor state via the returned `state` variable:

```tsx
import { BoldExtension, CalloutExtension, ItalicExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const { manager, state } = useRemirror({
  extensions: () => [
    new BoldExtension(),
    new ItalicExtension(),
    new CalloutExtension({ defaultType: 'warn' }),
  ],

  // Set the initial content.
  content: '<p>I love <b>Remirror</b></p>',

  // Place the cursor at the start of the document. This can also be set to
  // `end`, `all` or a numbered position.
  selection: 'start',

  // Set the string handler which means the content provided will be
  // automatically handled as html.
  // `markdown` is also available when the `MarkdownExtension`
  // is added to the editor.
  stringHandler: 'html',
});
```

With that, we have a manager and a prefilled state! Next up, we will use those to render our editor.

:::note

HTML is a great format for demo code because it's compact and easy to read. It's less ideal for real applications because HTML can't capture all the nuances of the editor content. This means that you might lose data when persisting Remirror content to HTML.

Hence, you want to persist Remirror's native JSON format, and load this in your editor:

```tsx
import { BoldExtension, CalloutExtension, ItalicExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const remirrorJsonFromStorage = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Hello world' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'word' },
      ],
    },
  ],
};

const { manager, state } = useRemirror({
  extensions: () => [
    new BoldExtension(),
    new ItalicExtension(),
    new CalloutExtension({ defaultType: 'warn' }),
  ],

  content: remirrorJsonFromStorage,
});
```

:::note

:::note

Initial content is only supported in uncontrolled components (which is recommended for most use cases).

You can find the docs for creating controlled components [here](../controlled-editor.md).

:::note
