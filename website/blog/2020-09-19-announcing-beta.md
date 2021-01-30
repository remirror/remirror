---
slug: remirror-1.0.0-beta
title: Beta Release
author: Ifiok Jr.
author_title: Remirror Maintainer
author_url: https://github.com/ifiokjr
author_image_url: https://avatars1.githubusercontent.com/u/1160934?v=4
tags: [remirror, beta]
---

I've thought about it for a while now. How do you introduce a breaking change?

Progress slowed because I was scared of introducing breaking changes. It has become hard to envisiage getting everything ready in time.

Here's what's changing in the upcoming beta release.

- [x] Improved React API
- [x] Markdown support
- [ ] Todo list support
- ~Experimental svelte support~
- ~Experimental react native support~

- Remove `Presets` completely from the library. In their place a function that returns a list of `Extension`s. They were clunky, difficult to use and provided little to no value. The change reduces the bundle size quite significantly.
- `remirror` includes all the core imports from the library as well as extensions and presets. It doesn't include framework specific exports.
- `remirror/react` has been removed and instead you should install `@remirror/react` which includes all the react exports from all the react libraries.
- `remirror/extensions` now includes all the presets and extension libraries.
- Remove `@remirror/showcase` - examples have been provided on how to achieve the same effect.
- Remove `@remirror/react-social`
- Remove `@remirror/react-wysiwyg`
- Rename `useRemirror` -> `useRemirrorContext`
- Replace `useManager` with better `useRemirror` which provides a lot more functionality.
- Rename `preset-table` to `extension-tables`
- Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
- New `createDecorations` extension method for adding decorations to the prosemirror view.
- Add full markdown support via `@remirror/extension-markdown`

- Create new decorator pattern for adding commands, helper functions and keyBindings. This opens up the door to

- Deprecate `tags` property on extension and encourage the use of `createTags` which is a method instead.
- Add `onApplyState` and `onInitState` lifecycle methods.
- Add `onApplyTransaction` method.
- Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
- Rewrite the `DropCursor` to support animations and interactions with media.
- Support updating the doc attributes.
- Deprecate top level context methods `focus` and `blur`. They should now be consumed as commands
- Remove package `@remirror/extension-auto-link`.

### `ExtensionStore`

- Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
- Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

One of the big changes is a hugely improved API for `@remirror/react`.

### Positioners

- Positioners now return a `visible` property which shows if they are currently visible within the editor viewport.
- Improved scrolling when using the positioner.
- Fixed a lot of bugs in the positioner API.
- This DOMRect represents an absolute position within the document. It is up to your consuming component to consume the rect.
- `@remirror/react-components` exports `PositionerComponent` which internally
- Renamed the positioners in line with the new functionality.

```tsx
import React from 'react';
import { fromHtml, toHtml } from 'remirror';
import { BoldExtension, CorePreset, ItalicExtension } from 'remirror/extension';
import { Remirror, useRemirror, useRemirrorContext } from '@remirror/react';

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions: () => [new BoldExtension(), new ItalicExtension()],
    content: 'asdfasdf',
    stringHandler: '',
  });

  return <Remirror manager={manager} onChange={onChange} state={state}></Remirror>;
};
```

When no children are provided to the

The previous `useRemirror` is now called `useRemirrorContext` since it plucks the context from the outer `Remirror` Component. The `<RemirrorProvider />` has been renamed to `<Remirror />` and automatically renders an editor.

`useManager` has been marked as `@internal` (although it is still exported) and going forward you should be using `useRemirror` as shown in the above example.

Per library expected changes.

### `@remirror/extension-tables`

With the new support for extensions which act as parents to other extensions the table extension has now become a preset extension. It is no longer needed and has been renamed to it's initial name

### Misc

Editor selection now defaults to the `end` of the document.

Remove social preset Deprecate packages

Rename all `*Parameter` interfaces to `*Props`. With the exception of \[React\]FrameworkParameter which is now \[React\]FrameworkOptions.

### UI Commands

- Add commands with UI configuration and i18n text descriptions
- `@command`, `@keyBinding`, `@helper` decorators for more typesafe configuration of extensions.
- `NameShortcut` keybindings which can be set in the keymap extension
- `overrides` property

### Accessibility as a priority

Actively test for the following

- Screen Readers
- Braille display
- Zoom functionality
- High contrast for the default theme

### Caveats around inference

- Make sure all your commands in an extension are annotated with a return type of `CommandFunction`. Failure to do so will break all type inference wherever the extension is used.

  ```ts
  import { CommandFunction } from 'remirror';
  ```

- When setting the name of the extension make sure to use `as const` otherwise it will be a string and ruin autocompletion for extension names, nodes and marks.

  ```ts
  class MyExtension extends PlainExtension {
    get name() {
      return 'makeItConst' as const;
    }
  }
  ```

### Hooks

- Rename `useKeymap` to `useKeymaps`. The original `useKeymap` now has a different signature.

```tsx
import { useCallback } from 'react';
import { BoldExtension } from 'remirror/extensions';
import { Remirror, useHelpers, useKeymap, useRemirror, useRemirrorContext } from '@remirror/react';

const hooks = [
  () => {
    const active = useActive();
    const { insertText } = useCommands();
    const boldActive = active.bold();
    const handler = useCallback(() => {
      if (!boldActive) {
        return false;
      }

      return insertText.original('\n\nWoah there!')(props);
    }, [boldActive, insertText]);

    useKeymap('Shift-Enter', handler); // Add the handler to the keypress pattern.
  },
];

const Editor = () => {
  const { manager } = useRemirror({ extensions: () => [new BoldExtension()] });

  return <Remirror manager={manager} hooks={hooks} />;
};
```

- The `Remirror` component now has a convenient hooks props. The hooks prop takes an array of zero parameter hook functions which are rendered into the `RemirrorContext`. It's a shorthand to writing out your own components. You can see the pattern in use above.

### Commands

There are new hooks for working with commands.

- Each command has an `original` method attached for using the original command that was used to create the command. The original command has the same type signature as the `(...args: any[]) => CommandFunction`. So you would call it with the command arguments and then also provide the CommandProps. This is useful when composing commands together or using commands within keyBindings which need to return a boolean.

  - You can see the `insertText.original` being used in the `useKeymap` example above.

- `useCommands()` provides all the commands as hook. `useChainedCommands` provides all the chainable commands.

  ```tsx
  import { useCallback } from 'react';
  import { useChainedCommands, useKeymap } from '@remirror/react';

  function useLetItGo() {
    const chain = useChainedCommands();
    const handler = useCallback(() => {
      chain.selectText('all').insertText('Let it goo 🤫').run();
    }, [chain]);

    // Whenever the user types `a` they let it all go
    useKeymap('a', handler);
  }
  ```

### Dependencies

- Upgrade React to require minimum versions of ^16.14.0 || ^17. This is because of the codebase now using the [new jsx transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).
- Upgrade TypeScript to a minimum of `4.1`. Several of the new features make use of the new types and it is a requirement to upgrade.
- General upgrades across all dependencies to using the latest versions.
  - All `prosemirror-*` packages
