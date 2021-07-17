---
hide_title: true
title: Extra Attributes
---

# Extra Attributes

In ProseMirror each node and mark can define attributes that affect it's behaviour at runtime. These attribute are stored on the dom and can be retrieved from the dom via the created `MarkSpec` / `NodeSpec`.

Attributes can also set default values.

One constraint that ProseMirror sets is that attributes must be declared ahead of time. There is no runtime ability to dynamically add attributes. This can be an issue when consuming a library like `Remirror`. Perhaps you want the `paragraph` functionality, but also want to add an extra attribute as well. This is where extra attributes come into play.

:::note

The following is a work in progress. Please edit the page and provide your suggestions if you notice any problems.

:::

## Extension

Every extension can be given extra attributes when created.

```ts
import { uniqueId } from 'remirror';
import { ParagraphExtension } from 'remirror/extensions';

const paragraphExtension = new ParagraphExtension({
  extraAttributes: {
    id: {
      default: () => uniqueId(),
      parseDOM: (dom) => dom.id,
      toDOM: (node) => node.attrs.id as string,
    },
  },
});
```

The above has given a dynamic attribute `id`, which assigns a unique `id` to every paragraph node as well as giving instruction on how to retrieve that node from the dom and pass the node back to the DOM.

The above could have also been defined like this.

```ts
import { uniqueId } from 'remirror';
import { ParagraphExtension } from 'remirror/extensions';

const paragraphExtension = new ParagraphExtension({
  extraAttributes: {
    // Remirror is smart enough to search the dom for the id if no `parseDOM`
    // method or `toDOM` method provided.
    id: () => uniqueId(),
  },
});
```

This example accomplishes the same things as the previous example and remirror is smart enough to automatically parse the dom and write to the dom the required values.

### Render as data attributes

You can return an array of a key value pair, to determine how your extra attribute is rendered in the DOM.

```ts
import { ParagraphExtension } from 'remirror/extension/paragraph';

const paragraphExtension = new ParagraphExtension({
  extraAttributes: {
    custom: {
      default: 'my default',
      parseDOM: (dom) => dom.getAttribute('data-custom'),
      toDOM: (attrs) => ['data-custom', attrs.custom],
    },
  },
});
```

## RemirrorManager

Extra attributes can also be added via the `RemirrorManager`. This can set attributes for a collection of nodes, marks and tags. This is very useful when adding attributes to multiple places in one sweep.

```ts
import { RemirrorManager } from 'remirror';
import { CorePreset, WysiwygPreset } from 'remirror/extensions';

const manager = RemirrorManager.create(() => [new WysiwygPreset(), new CorePreset()], {
  extraAttributes: [
    // Can match by grouping of `nodes` | `marks` | `all`.
    { identifiers: 'nodes', attributes: { totallyNodes: 'abc' } },
    { identifiers: 'marks', attributes: { totallyMarks: 'abc' } },
    { identifiers: 'all', attributes: { totallyAll: 'abc' } },

    // Can match by node or mark name when `identifiers` is set to an array.
    { identifiers: ['paragraph', 'italic'], attributes: { fun: 'abc' } },

    // Can match by `tags`.
    {
      identifiers: { tags: [ExtensionTag.Alignment] },
      attributes: { matchesEverything: 'abc' },
    },

    // Can match by `tags` and type of `node` | `mark`.
    {
      identifiers: { tags: [ExtensionTag.Alignment], type: 'node' },
      attributes: { matchesEverything: 'abc' },
    },

    // This would never match as block node tags aren't marks.
    {
      identifiers: { tags: [ExtensionTag.BlockNode], type: 'mark' },
      attributes: { onlyMarks: 'abc' },
    },

    // This would also never match since there are no tags given.
    { identifiers: { tags: [] }, attributes: { emptyTags: 'abc' } },
  ],
});
```
