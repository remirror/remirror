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

- Todo list support
- Markdown support
- Experimental svelte support
- Experimental react native support
- Better testing with `jest-runner-browser`

- Remove `Presets` completely from the library. In their place a function that returns a list of `Extension`s. They were clunky, difficult to use and provided little to no value. The change reduces the bundle size quite significantly.
- `remirror` includes all the core imports from the library as well as extensions and presets. It doesn't include framework specific exports.
- `remirror/react` now includes all the react exports from `remirror/react-hooks`, `remirror/react-utils`, `remirror/preset-react`.
- `remirror/extensions` now includes all the presets and extension libraries.
- Remove `@remirror/showcase`
- Remove `@remirror/react-social`
- Remove `@remirror/react-wysiwyg`
- Rename `useRemirror` -> `useRemirrorContext`
- Replace `useManager` with better `useRemirror` which provides a lot more functionality.
- Rename `preset-table` to `extension-tables`
- Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
- Create decorations extension
- Add markdown support via markdown extension
- Add media extension and media placeholder extension
- Add support for media placeholder
- Support handlers used as reducers
- Deprecate `tags` property on extension and use the `createTags` which is a method instead.
- Add `onApplyState` and `onInitState` lifecycle methods.
- Add `onApplyTransaction` method.
- Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
- Rewrite the `DropCursor` to support animations and interactions with media.
- Support updating the doc attributes.
- Remove package `@remirror/extension-auto-link`.
- `focus` and `blur` are now commands.

### `ExtensionStore`

- Rename plugin update method in the store from `updateExtensionPlugins`.
- Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
- Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

One of the big changes is a hugely improved API for `@remirror/react`.

### Positioners

- Positioners now return a `DOMRect` only. This DOMRect represents an absolute position within the document. It is up to your consuming component to consume the rect.
- `@remirror/react-components` exports `PositionerComponent` which internally
- Renamed the positioners in line with the new functionality.

```tsx
import React from 'react';
import { fromHtml, toHtml } from 'remirror';
import { BoldExtension, CorePreset, ItalicExtension } from 'remirror/extension';
import { Remirror, useRemirror, useRemirrorContext } from 'remirror/react';

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
