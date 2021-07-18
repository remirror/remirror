---
slug: remirror-1.0.0
title: v1.0 Release
author: Ifiok Jr.
author_title: Remirror Maintainer
author_url: https://github.com/ifiokjr
author_image_url: https://avatars1.githubusercontent.com/u/1160934?v=4
tags: [remirror, beta]
---

The new version of `remirror` comes with a number of enhancements and quite a few breaking changes if you were using the `remirror@1.0.0-next.*` pre-releases.

The following sections outline the breaking changes and how they can be migrated if your last version was `@next`. For those upgrading from `0.11.0` the library has changed drastically and you'd be better off browsing the documentation.

## Changes

### All extensions are available via `remirror/extensions`

When you install the top level `remirror` package you are given access to every extension developed by `remirror` via the `remirror/extension` entry point.

```diff
- import { BoldExtension } from 'remirror/extension/bold';
- import { ItalicExtension } from 'remirror/extension/italic';
+ import { BoldExtension, ItalicExtension } from 'remirror/extensions';
```

You can also still install the extensions directly from their scoped packages.

```ts
import { BoldExtension } from '@remirror/extension-bold';
```

### Remove `remirror/react` which has been replaced by `@remirror/react`

If your code is importing from `remirror/react` you should now change the import to `@remirror/react`.

```diff
- import { useManager } from 'remirror/react';
+ import { useRemirror } from '@remirror/react';
```

### Update the `@remirror/react` API

- Rename the original `useRemirror` to now be called `useRemirrorContext`.
- Add new `@remirror/react-components` package.
- `@remirror/react` exports all the hooks, components, core modules and react specific extensions from `@remirror/react-core`, `@remirror/react-components` and `@remirror/react-hooks`.

`useManager` was too focused on the implementation details. We've updated the API to be used in a different way and `useRemirror` is now the way to initialize an editor.

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = () => {
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};
```

The previous `useRemirror` is now called `useRemirrorContext` since it plucks the context from the outer `Remirror` Component. The ~~`<RemirrorProvider />`~~ has been renamed to `<Remirror />` and automatically renders an editor.

When no children are provided to the `<Remirror />` component it will automatically render a container `div` where the prosemirror editor will be placed. If you do add children it is up to you to import the `<EditorComponent />` and add it to the children or set the `autoRender` prop to `'start' | 'end' | true`.

~~`useManager`~~ has been marked as `@internal` (although it is still exported) and going forward you should be using `useRemirror` as shown in the above example.

### `@remirror/extension-tables`

`@remirror/preset-table` is now `@remirror/extension-tables`. The `TableExtension` uses the new `createExtension` method to inject the `TableRowExtension` which in turn injects the `TableCellExtension` and `TableHeaderCellExtension`. To use tables in your editor the following is sufficient.

```tsx
import { TableExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const Editor = () => {
  const { manager } = useRemirror({ extensions: () => [TableExtension()] });

  return <Remirror manager={manager} />;
};
```

### `@remirror/extension-positioner`

- New `Rect` interface returned by the positioner `x: number; y: number; width: number; height: number;`
- Added `visible` property which shows if the position currently visible within the editor viewport.
- Improved scrolling when using the positioner.
- Fixed a lot of bugs in the positioner API.
- This DOMRect represents an absolute position within the document. It is up to your consuming component to consume the rect.

- Renamed the positioners in line with the new functionality.

```tsx
import React from 'react';
import { BoldExtension, CorePreset, ItalicExtension, MarkdownExtension } from 'remirror/extension';
import { Remirror, useRemirror } from '@remirror/react';

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions: () => [new BoldExtension(), new ItalicExtension()],
    content: '<p><strong>I am strong.</strong> and <em>I am emphasized</em></p>',
    stringHandler: 'html',
  });

  return <Remirror manager={manager} onChange={onChange} state={state} />;
};
```

### `@remirror/react-hooks`

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

## Breaking Changes

- Editor selection now defaults to the `end` of the document. You can change the starting point as shown below.

  ```tsx
  import { Remirror, useRemirror } from '@remirror/react';

  const Editor = () => {
    const { manager, state } = useRemirror({ selection: 'start' });

    return <Remirror manger={manager} initialContent={state} />;
  };
  ```

- All interfaces which were named with the pattern `*Parameter` have been renamed to to `*Props`. The only exceptions are `*FrameworkParameter` which are now `*FrameworkOptions`.
- Remove `Presets` completely. In their place a function that returns a list of `Extension`s should be used. They were clunky, difficult to use and provided little to no value.
- Remove `@remirror/core` entry-point and add all core exports to the main `remirror` entry-point.
- Add all `Extension`s and `Preset` package exports to the `remirror/extensions` subdirectory. It doesn't include framework specific exports which are made available from `@remirror/react`.
- Rename `@remirror/preset-table` to `@remirror/extension-tables`.
- Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
- Create new decorator pattern for adding `@commands`, `@helper` functions and `@keyBindings`.
- Deprecate `tags` property on extension and encourage the use of `createTags` which is a method instead.
- Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
- Add support for directly updating the `doc` attributes.
- Deprecate top level context methods `focus` and `blur`. They should now be consumed as commands.

## Removed Packages

The following packages have been removed.

- Remove `@remirror/showcase`
- Remove `@remirror/react-social`
- Remove `@remirror/react-wysiwyg`
- Remove package `@remirror/extension-auto-link`. The functionality is now self-contained within `@remirror/extension-link`.

### `ExtensionStore`

### Extensions

- New `createDecorations` extension method for adding decorations to the ProseMirror `EditorView`.
- New lifecycle methods: `onInitState`, `onApplyState`, and `onApplyTransaction` lifecycle methods. These correspond exactly the the plugin methods which ProseMirror exposes and can be used to create plugin functionality without creating a new plugin.
- `@command`, `@keyBinding`, `@helper` decorators for increased type safety when configuring extensions.
- `NamedShortcut` keybindings which can be set on the keymap extension. Currently `remirror` defaults to using the same shortcuts as Google Docs.
- Add the `nodeOverrides` property to the extensions which for advanced users allows overriding of the default `NodeSpec` and `MarkSpec`.
- Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
- Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

### Inference of Extension Types

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
- Upgrade TypeScript to a minimum of `4.3`. Several of the new features make use of the new types and it is a requirement to upgrade.
- General upgrades across all dependencies to using the latest versions.
  - All `prosemirror-*` packages.
