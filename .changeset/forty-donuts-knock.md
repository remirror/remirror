---
'@remirror/core': minor
'@remirror/react-hooks': minor
---

Add support for prioritized keymap handlers. It's now possible to make sure that a hook which consumes `useKeymap` runs before the extension keybindings.

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

- By default hooks the hooks from `remirror/react/hooks` which consume `useKeymap are given a priority of`ExtensionPriority.High`.
- `useKeymap` is given a priority of `ExtensionPriority.Medium`.
- The `createKeymap` method on all extensions is given a priority of `ExtensionPriority.Default`.
- The `baseKeymap` which is added by default is given a priority of `ExtensionPriority.Low`.
