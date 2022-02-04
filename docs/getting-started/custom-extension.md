---
hide_title: true
title: Custom extension
---

# Custom extension

So far, we built a UI to interact with the existing features of the editor. Now, we want to extend the feature set of the editor itself. In particular, we will add support for [`<samp>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp) tags.

Remirror enables this via **extensions**.

## Add extension

We want to add extra styling to our inline content. The way to do this in Prosemirror are [marks](https://prosemirror.net/docs/guide/#schema.marks).

Remirror provides the `MarkExtension` class to easily declare new Prosemirror marks. The initial `SampExtension` only renders our marks as `<samp>` tags and parses them back to marks:

```ts
import {
  ApplySchemaAttributes,
  extension,
  ExtensionTag,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
} from '@remirror/core';

export interface SampOptions {}

@extension<SampOptions>({ defaultOptions: {} })
export class SampExtension extends MarkExtension<SampOptions> {
  get name() {
    return 'samp' as const;
  }

  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      ...override,
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: 'samp',
          getAttrs: extra.parse,
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        return ['samp', extra.dom(node), 0];
      },
    };
  }
}
```

## Add commands

By now, our editor knows about `samp` marks but we still can't create a UI to interact with them. For that, we need to add a couple of commands:

```ts
export class SampExtension extends MarkExtension<SampOptions> {
  // ...

  @command()
  toggleSamp(selection?: PrimitiveSelection): CommandFunction {
    return toggleMark({ type: this.type, selection });
  }

  @command()
  setSamp(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      dispatch?.(tr.addMark(from, to, this.type.create()));

      return true;
    };
  }

  @command()
  removeSamp(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);

      if (!tr.doc.rangeHasMark(from, to, this.type)) {
        return false;
      }

      dispatch?.(tr.removeMark(from, to, this.type));

      return true;
    };
  }
}
```

## Use extension

Our custom extension is identical to any other extension provided by Remirror. Hence, we can use it in the same way:

```ts
import 'remirror/styles/all.css';

import { EditorComponent, Remirror, useCommands, useRemirror } from '@remirror/react';
import { SampExtension } from './samp-extension';

export const Menu = () => {
  const { toggleSamp, focus } = useCommands();

  return (
    <button
      onClick={() => {
        toggleSamp();
        focus();
      }}
    >
      Samp
    </button>
  );
};

export const MyEditor = () => {
  const { manager, state } = useRemirror({
    extensions: () => [new SampExtension()],
  });

  return (
    <div className='remirror-theme'>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <Menu />
      </Remirror>
    </div>
  );
};
```

## Summing up

Congratulations! You created a manager, rendered the editor UI, added a menu, and extend the editor with your own extension.

With that, you've all the basic tools to start [exploring Remirror](https://remirror.vercel.app).

Have fun & happy coding!

PS: Getting stuck with something? Reach out on [Discord](https://remirror.io/chat)!
