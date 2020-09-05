---
'@remirror/core': minor
'@remirror/react-hooks': minor
---

Add support for prioritized keymaps. It's now possible to make sure that a hook which consumes `useKeymap` runs before the extension keybindings.

```ts
import React from 'react';
import { ExtensionPriority } from 'remirror/core';
import { useKeymap } from 'remirror/react/hooks';

const KeymapHook = () => {
  // Make sure this keybinding group is run first!
  useKeymap({ Enter: () => doSomething() }, ExtensionPriority.Highest);

  // This one we don't care about 🤷‍♀️
  useKeymap({ 'Shift-Delete': () => notImportant() }, ExtensionPriority.Lowest);

  return <div />;
};
```

Here is a breakdown of the default priorities when consuming keymaps.

- Hooks within `remirror/react/hooks` which consume `useKeymap` have a priority of `ExtensionPriority.High`.
- `useKeymap` is given a priority of `ExtensionPriority.Medium`.
- The `createKeymap` method for extensions is given a priority of `ExtensionPriority.Default`.
- The `baseKeymap` which is added by default is given a priority of `ExtensionPriority.Low`.

To change the default priority of the `createKeymap` method in a custom extension wrap the `KeyBindings` return in a tuple with the priority as the first parameter.

```ts
import { PlainExtension, KeyBindingsTuple, ExtensionPriority, KeyBindings } from 'remirror/core';

class CustomExtension extends PlainExtension {
  get name() {
    return 'custom' as const;
  }

  createKeymap(): KeyBindingsTuple {
    const bindings = {
      Enter: () => return true,
      Backspace: () => return true,
    }

    return [ExtensionPriority.High, bindings];
  }
}
```
