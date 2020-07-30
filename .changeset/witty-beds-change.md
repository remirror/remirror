---
'@remirror/extension-events': major
'@remirror/preset-core': minor
'remirror': minor
---

🎉 New extension `@remirror/extension-events`.

This extension adds handlers for the events happening within the remirror editor. The extension is part of the `CorePreset` but it doesn't make it's handlers available to the preset. In order to use the handlers you will need direct access to the `EventsExtension`.

```ts
import { EventsExtension } from 'remirror/extension-events';
import { useExtension } from 'remirror/react';

const Editor = () => {
  useExtension(
    EventsExtension,
    ({ addHandler }) => {
      addHandler('focus', () => log('focused'));
    },
    [],
  );
};
```

To begin with the only events added are `focus` and `blur`.
