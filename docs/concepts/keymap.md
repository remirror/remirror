---
hide_title: true
title: Keymaps
---

# Keymaps

:::note

Parts of this document are for more advanced user cases and you probably won't ever need to use them.

:::

Keymaps allow users to use shortcuts to manipulate the text in their editor. `Cmd-b` is an example for setting the selected text to be **bold**.

The following is an example where the enter key can be customised to ignore all lower priority `Enter` key bindings.

The `next` method allows full control beyond the return value. It allows both calling all lower priority key bindings regardless of whether true or false has been called.

```tsx
import { BaseExtensionOptions, extensionDecorator, KeyBindings, PlainExtension } from 'remirror';

interface CustomKeymapExtensionOptions {
  override?: boolean;
}

@extensionDecorator({ defaultOptions: { override: false } })
export class CustomKeymapExtension extends PlainExtension<CustomKeymapExtensionOptions> {
  get name() {
    return 'customKeymap' as const;
  }

  /**
   * Injects the baseKeymap into the editor.
   */
  public createKeymap(): KeyBindings {
    const { override } = this.options;

    return {
      Enter({ next }) {
        if (override) {
          // No other commands will be run
          return true;
        }

        next(); // Runs all lower priority commands

        return true;
      },
    };
  }
}
```

### Usage

To use the above example you could do the following.

```ts
import { RemirrorManager } from '@remirror/core';
import { baseExtensions } from '@remirror/core-extensions';

import { CustomKeymapExtension } from './custom-keymap-extension';

const manager = RemirrorManager.create([new CustomKeymapExtension({ override: true })]);
```

This manager can now be used to create an editor where the baseKeymap for the `Enter` key is overridden.

If override is set to `false`, the keybinding will defer to lower priority keybindings while still allowing the behaviour you want for the extension.
