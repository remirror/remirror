# @remirror/react

## 1.0.0

> 2021-07-17

### Major Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Here's what's changed in the beta release.

  - [x] Improved `react` API
  - [x] Full `markdown` support with the `@remirror/extension-markdown` package.
  - [x] Full formatting support
  - [x] i18n support
  - [x] A11y support for react via `reakit`
  - [ ] Component Library (work in progress)
  - [ ] Start adding experimental react native support (mostly done)
  - [ ] Todo list extension (not started)
  - [ ] New math extension (not started)
  - [ ] New pagination extension (not started)
  - [ ] New text wrap extension (not started)

  ### Delayed

  - ~Experimental svelte support~ - This will be added later in the year.

  ## Breaking

  - Upgrade minimum TypeScript version to `4.1`.
  - Editor selection now defaults to the `end` of the document.
  - Rename all `*Parameter` interfaces to `*Props`. With the exception of \[React\]FrameworkParameter which is now \[React\]FrameworkOptions.
  - Remove `Presets` completely. In their place a function that returns a list of `Extension`s should be used. They were clunky, difficult to use and provided little to no value.
  - Add core exports to `remirror` package
  - Add all Extensions and Preset package exports to the `remirror/extensions` subdirectory. It doesn't include framework specific exports which are made available from `@remirror/react`
  - Remove `remirror/react` which has been replaced by `@remirror/react`
  - `@remirror/react` includes which includes all the react exports from all the react packages which can be used with remirror.
  - Remove `@remirror/showcase` - examples have been provided on how to achieve the same effect.
  - Remove `@remirror/react-social`
  - Remove `@remirror/react-wysiwyg`
  - Rename `useRemirror` -> `useRemirrorContext`
  - Replace `useManager` with better `useRemirror` which provides a lot more functionality.
  - Rename `preset-table` to `extension-tables`
  - Rename `preset-list` to `extension-lists`. `ListPreset` is now `BulletListExtension` and `OrderListExtension`.
  - New `createDecorations` extension method for adding decorations to the prosemirror view.
  - Create new decorator pattern for adding `@commands`, `@helper` functions and `@keyBindings`.
  - Deprecate `tags` property on extension and encourage the use of `createTags` which is a method instead.
  - Add `onApplyState` and `onInitState` lifecycle methods.
  - Add `onApplyTransaction` method.
  - Rename interface `CreatePluginReturn` to `CreateExtensionPlugin`.
  - Rewrite the `DropCursor` to support animations and interactions with media.
  - Add support updating the doc attributes.
  - Deprecate top level context methods `focus` and `blur`. They should now be consumed as commands
  - Remove package `@remirror/extension-auto-link`.

  ### `ExtensionStore`

  - Rename `addOrReplacePlugins` to `updatePlugins` in `ExtensionStore`.
  - Remove `reconfigureStatePlugins` and auto apply it for all plugin updating methods.

  One of the big changes is a hugely improved API for `@remirror/react`.

  ### `@remirror/extension-positioner`

  - New `Rect` interface returned by the positioner `x: number; y: number; width: number; height: number;`
  - Added `visible` property which shows if the position currently visible within the editor viewport.
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

    return <Remirror manager={manager} onChange={onChange} state={state} />;
  };
  ```

  When no children are provided to the

  The previous `useRemirror` is now called `useRemirrorContext` since it plucks the context from the outer `Remirror` Component. The `<RemirrorProvider />` has been renamed to `<Remirror />` and automatically renders an editor.

  `useManager` has been marked as `@internal` (although it is still exported) and going forward you should be using `useRemirror` as shown in the above example.

  Per library expected changes.

  ### `@remirror/extension-tables`

  With the new support for extensions which act as parents to other extensions the table extension has now become a preset extension. It is no longer needed and has been renamed to it's initial name

  ### UI Commands

  - Add commands with UI configuration and i18n text descriptions
  - `@command`, `@keyBinding`, `@helper` decorators for more typesafe configuration of extensions.
  - `NameShortcut` keybindings which can be set in the keymap extension
  - `overrides` property

  ### Accessibility as a priority

  Actively test for the following

  - [ ] Screen Readers
  - [ ] Braille display
  - [ ] Zoom functionality
  - [ ] High contrast for the default theme

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

  ### `@remirror/react-hooks`

  - Rename `useKeymap` to `useKeymaps`. The original `useKeymap` now has a different signature.

  ```tsx
  import { useCallback } from 'react';
  import { BoldExtension } from 'remirror/extensions';
  import {
    Remirror,
    useHelpers,
    useKeymap,
    useRemirror,
    useRemirrorContext,
  } from '@remirror/react';

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
    - All `prosemirror-*` packages.

  ### Issues addressed

  - Fixes #569
  - Fixes #452
  - Fixes #407
  - Fixes #533
  - Fixes #652
  - Fixes #654
  - Fixes #480
  - Fixes #566
  - Fixes #453
  - Fixes #508
  - Fixes #715
  - Fixes #531
  - Fixes #535
  - Fixes #536
  - Fixes #537
  - Fixes #538
  - Fixes #541
  - Fixes #542
  - Fixes #709
  - Fixes #532
  - Fixes #836
  - Fixes #834
  - Fixes #823
  - Fixes #820
  - Fixes #695
  - Fixes #793
  - Fixes #800
  - Fixes #453
  - Fixes #778
  - Fixes #757
  - Fixes #804
  - Fixes #504
  - Fixes #566
  - Fixes #714
  - Fixes #37

### Minor Changes

- [#706](https://github.com/remirror/remirror/pull/706) [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new hook `useSelectedText`. This is always updated to the currently selected text value. `undefined` when the selection is empty, or a non-text selection.

* [#880](https://github.com/remirror/remirror/pull/880) [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `useEditorView` hook for retrieving the `EditorView`.

### Patch Changes

- [#880](https://github.com/remirror/remirror/pull/880) [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `useSuggest` so that it updates the `change` property when a suggestion is deleted.

- Updated dependencies [[`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`ce3bd9b06`](https://github.com/remirror/remirror/commit/ce3bd9b069f9d587958c0fc73c8a1d02109e4677), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`0ba71790f`](https://github.com/remirror/remirror/commit/0ba71790fcd0b69fb835e744c6dccace120e6ee7), [`3df15a8a2`](https://github.com/remirror/remirror/commit/3df15a8a2a9f594b48ba2abc755109eaf3ee0999), [`f848ba64b`](https://github.com/remirror/remirror/commit/f848ba64ba686c868c651e004cbbe25e2d405957), [`3feb9188a`](https://github.com/remirror/remirror/commit/3feb9188a6747f496ea4ed224357d268cf1da8cc), [`18b8d1b2b`](https://github.com/remirror/remirror/commit/18b8d1b2b336e2611c469e7b637f11b00b8b4399), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`838a2942d`](https://github.com/remirror/remirror/commit/838a2942df854be80bc74dfdae39786a8bae863b), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`0b32e1698`](https://github.com/remirror/remirror/commit/0b32e169875c40551898acf29126070d5b5c798f), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`b1fc65313`](https://github.com/remirror/remirror/commit/b1fc65313f5be376bb1128c90f54cd1fa168c5c0), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`1982aa447`](https://github.com/remirror/remirror/commit/1982aa447706850093d1d544db2c6de2aefa478b), [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25), [`63268b8eb`](https://github.com/remirror/remirror/commit/63268b8ebc03bd9b6d410516abb794f872e571c8)]:
  - @remirror/extension-react-tables@1.0.0
  - @remirror/react-renderer@1.0.0
  - @remirror/react-hooks@1.0.0
  - @remirror/react-components@1.0.0
  - @remirror/react-core@1.0.0
  - @remirror/extension-positioner@1.0.0
  - @remirror/extension-placeholder@1.0.0
  - @remirror/extension-react-component@1.0.0
  - @remirror/extension-react-ssr@1.0.0
  - @remirror/preset-react@1.0.0
  - @remirror/react-ssr@1.0.0
  - @remirror/react-utils@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.60
  - @remirror/extension-placeholder@1.0.0-next.60
  - @remirror/extension-positioner@1.0.0-next.60
  - @remirror/extension-react-component@1.0.0-next.60
  - @remirror/extension-react-ssr@1.0.0-next.60
  - @remirror/i18n@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/preset-core@1.0.0-next.60
  - @remirror/preset-react@1.0.0-next.60
  - @remirror/react-utils@1.0.0-next.60
  - @remirror/theme@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.59
  - @remirror/extension-placeholder@1.0.0-next.59
  - @remirror/extension-positioner@1.0.0-next.59
  - @remirror/extension-react-component@1.0.0-next.59
  - @remirror/extension-react-ssr@1.0.0-next.59
  - @remirror/i18n@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/preset-core@1.0.0-next.59
  - @remirror/preset-react@1.0.0-next.59
  - @remirror/react-utils@1.0.0-next.59
  - @remirror/theme@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/extension-placeholder@1.0.0-next.58
  - @remirror/extension-positioner@1.0.0-next.58
  - @remirror/extension-react-component@1.0.0-next.58
  - @remirror/extension-react-ssr@1.0.0-next.58
  - @remirror/i18n@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/preset-core@1.0.0-next.58
  - @remirror/preset-react@1.0.0-next.58
  - @remirror/react-utils@1.0.0-next.58
  - @remirror/theme@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.57
  - @remirror/extension-placeholder@1.0.0-next.57
  - @remirror/extension-positioner@1.0.0-next.57
  - @remirror/extension-react-component@1.0.0-next.57
  - @remirror/extension-react-ssr@1.0.0-next.57
  - @remirror/i18n@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/preset-core@1.0.0-next.57
  - @remirror/preset-react@1.0.0-next.57
  - @remirror/react-utils@1.0.0-next.57
  - @remirror/theme@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`cba35d51`](https://github.com/remirror/remirror/commit/cba35d51f2c95c2b930b083959dccdf7cf521615), [`01e5c2d2`](https://github.com/remirror/remirror/commit/01e5c2d2707c715cd4e0006f9ac10c0cc3b11042)]:
  - @remirror/core@1.0.0-next.56
  - @remirror/extension-placeholder@1.0.0-next.56
  - @remirror/extension-react-component@1.0.0-next.56
  - @remirror/extension-react-ssr@1.0.0-next.56
  - @remirror/i18n@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/preset-core@1.0.0-next.56
  - @remirror/preset-react@1.0.0-next.56
  - @remirror/react-utils@1.0.0-next.56
  - @remirror/extension-positioner@1.0.0-next.56
  - @remirror/theme@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/core@1.0.0-next.55
  - @remirror/extension-placeholder@1.0.0-next.55
  - @remirror/extension-positioner@1.0.0-next.55
  - @remirror/extension-react-component@1.0.0-next.55
  - @remirror/extension-react-ssr@1.0.0-next.55
  - @remirror/i18n@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/preset-core@1.0.0-next.55
  - @remirror/preset-react@1.0.0-next.55
  - @remirror/react-utils@1.0.0-next.55
  - @remirror/theme@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764)]:
  - @remirror/core@1.0.0-next.54
  - @remirror/extension-placeholder@1.0.0-next.54
  - @remirror/extension-positioner@1.0.0-next.54
  - @remirror/extension-react-component@1.0.0-next.54
  - @remirror/extension-react-ssr@1.0.0-next.54
  - @remirror/i18n@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/preset-core@1.0.0-next.54
  - @remirror/preset-react@1.0.0-next.54
  - @remirror/react-utils@1.0.0-next.54
  - @remirror/theme@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/extension-placeholder@1.0.0-next.53
  - @remirror/extension-positioner@1.0.0-next.53
  - @remirror/extension-react-component@1.0.0-next.53
  - @remirror/extension-react-ssr@1.0.0-next.53
  - @remirror/i18n@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/preset-core@1.0.0-next.53
  - @remirror/preset-react@1.0.0-next.53
  - @remirror/react-utils@1.0.0-next.53
  - @remirror/theme@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.52
  - @remirror/extension-placeholder@1.0.0-next.52
  - @remirror/extension-positioner@1.0.0-next.52
  - @remirror/extension-react-component@1.0.0-next.52
  - @remirror/extension-react-ssr@1.0.0-next.52
  - @remirror/i18n@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/preset-core@1.0.0-next.52
  - @remirror/preset-react@1.0.0-next.52
  - @remirror/react-utils@1.0.0-next.52
  - @remirror/theme@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core@1.0.0-next.51
  - @remirror/extension-placeholder@1.0.0-next.51
  - @remirror/extension-positioner@1.0.0-next.51
  - @remirror/extension-react-component@1.0.0-next.51
  - @remirror/extension-react-ssr@1.0.0-next.51
  - @remirror/i18n@1.0.0-next.51
  - @remirror/preset-core@1.0.0-next.51
  - @remirror/preset-react@1.0.0-next.51
  - @remirror/react-utils@1.0.0-next.51
  - @remirror/theme@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core@1.0.0-next.50
  - @remirror/extension-placeholder@1.0.0-next.50
  - @remirror/extension-positioner@1.0.0-next.50
  - @remirror/extension-react-component@1.0.0-next.50
  - @remirror/extension-react-ssr@1.0.0-next.50
  - @remirror/i18n@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/preset-core@1.0.0-next.50
  - @remirror/preset-react@1.0.0-next.50
  - @remirror/react-utils@1.0.0-next.50
  - @remirror/theme@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core@1.0.0-next.49
  - @remirror/extension-placeholder@1.0.0-next.49
  - @remirror/extension-positioner@1.0.0-next.49
  - @remirror/extension-react-component@1.0.0-next.49
  - @remirror/extension-react-ssr@1.0.0-next.49
  - @remirror/i18n@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/preset-core@1.0.0-next.49
  - @remirror/preset-react@1.0.0-next.49
  - @remirror/react-utils@1.0.0-next.49
  - @remirror/theme@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/extension-placeholder@1.0.0-next.48
  - @remirror/extension-positioner@1.0.0-next.48
  - @remirror/extension-react-component@1.0.0-next.48
  - @remirror/extension-react-ssr@1.0.0-next.48
  - @remirror/preset-core@1.0.0-next.48
  - @remirror/preset-react@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e), [`c0867ced`](https://github.com/remirror/remirror/commit/c0867ced744d69c92e7ddef63ac9b11cc6e79846)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - @remirror/theme@1.0.0-next.47
  - @remirror/extension-positioner@1.0.0-next.47
  - @remirror/extension-placeholder@1.0.0-next.47
  - @remirror/extension-react-component@1.0.0-next.47
  - @remirror/extension-react-ssr@1.0.0-next.47
  - @remirror/preset-core@1.0.0-next.47
  - @remirror/preset-react@1.0.0-next.47
  - @remirror/i18n@1.0.0-next.47
  - @remirror/react-utils@1.0.0-next.47

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/extension-placeholder@1.0.0-next.45
  - @remirror/extension-positioner@1.0.0-next.45
  - @remirror/extension-react-component@1.0.0-next.45
  - @remirror/extension-react-ssr@1.0.0-next.45
  - @remirror/preset-core@1.0.0-next.45
  - @remirror/preset-react@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/preset-core@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/extension-placeholder@1.0.0-next.44
  - @remirror/extension-positioner@1.0.0-next.44
  - @remirror/extension-react-component@1.0.0-next.44
  - @remirror/extension-react-ssr@1.0.0-next.44
  - @remirror/i18n@1.0.0-next.44
  - @remirror/preset-react@1.0.0-next.44
  - @remirror/react-utils@1.0.0-next.44
  - @remirror/theme@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.43
  - @remirror/extension-placeholder@1.0.0-next.43
  - @remirror/extension-positioner@1.0.0-next.43
  - @remirror/extension-react-component@1.0.0-next.43
  - @remirror/extension-react-ssr@1.0.0-next.43
  - @remirror/preset-core@1.0.0-next.43
  - @remirror/preset-react@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies []:
  - @remirror/core@1.0.0-next.42
  - @remirror/extension-placeholder@1.0.0-next.42
  - @remirror/extension-positioner@1.0.0-next.42
  - @remirror/extension-react-component@1.0.0-next.42
  - @remirror/extension-react-ssr@1.0.0-next.42
  - @remirror/preset-core@1.0.0-next.42
  - @remirror/preset-react@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- [`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2) [#712](https://github.com/remirror/remirror/pull/712) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `Remirror.AllExtensionUnion` to the `useRemirror` hook. Now the commands and helpers for all extensions should automatically discover their API's.

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/extension-placeholder@1.0.0-next.41
  - @remirror/extension-positioner@1.0.0-next.41
  - @remirror/extension-react-component@1.0.0-next.41
  - @remirror/extension-react-ssr@1.0.0-next.41
  - @remirror/preset-core@1.0.0-next.41
  - @remirror/preset-react@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Minor Changes

- [`643555cc`](https://github.com/remirror/remirror/commit/643555cc7ba22ee0a8ba3cb1333ea488830fce30) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Export `createEditorView` from `@remirror/react`.

### Patch Changes

- [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c) [#698](https://github.com/remirror/remirror/pull/698) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix bad `setState()` warning when rendering a controlled `RemirrorProvider` with child component. By wrapping the controlled state update within `useLayoutEffect` hook,updates now synchronously happen during the commit phase. `useEffect` caused errors in ProseMirror due to the asynchronous update.

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/extension-placeholder@1.0.0-next.40
  - @remirror/extension-positioner@1.0.0-next.40
  - @remirror/extension-react-component@1.0.0-next.40
  - @remirror/extension-react-ssr@1.0.0-next.40
  - @remirror/preset-core@1.0.0-next.40
  - @remirror/preset-react@1.0.0-next.40
  - @remirror/react-utils@1.0.0-next.40
  - @remirror/theme@1.0.0-next.40
  - @remirror/i18n@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/extension-placeholder@1.0.0-next.39
  - @remirror/extension-positioner@1.0.0-next.39
  - @remirror/extension-react-component@1.0.0-next.39
  - @remirror/extension-react-ssr@1.0.0-next.39
  - @remirror/i18n@1.0.0-next.39
  - @remirror/preset-core@1.0.0-next.39
  - @remirror/preset-react@1.0.0-next.39
  - @remirror/react-utils@1.0.0-next.39
  - @remirror/theme@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Major Changes

- [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671) [#689](https://github.com/remirror/remirror/pull/689) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: 💥 Rename `Framework.frameworkHelpers` to `baseOutput` and make it protected.

  - Add required `abstract` getter `frameworkOutput`.
  - Add third generic property `Output` which extends `FrameworkOutput`.
  - Remove `manager` property from `FrameworkOutput`.

* [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2) [#689](https://github.com/remirror/remirror/pull/689) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove `childAsRoot` prop from `RemirrorProvider`.

  - Accept child-less rendering for `RemirrorProvider`.
  - Add `autoRender` prop to the `RemirrorProvider` which automatically adds an editable `div` to contain the ProseMirror editor. it can take values `start` and `end` to determine whether the div is insert before (`start`) all other children, or after (`end`).

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295), [`8cd47216`](https://github.com/remirror/remirror/commit/8cd472168967d95959740ae7b04a51815fa866c8)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/react-utils@1.0.0-next.38
  - @remirror/extension-placeholder@1.0.0-next.38
  - @remirror/extension-positioner@1.0.0-next.38
  - @remirror/extension-react-component@1.0.0-next.38
  - @remirror/extension-react-ssr@1.0.0-next.38
  - @remirror/i18n@1.0.0-next.38
  - @remirror/preset-core@1.0.0-next.38
  - @remirror/preset-react@1.0.0-next.38
  - @remirror/theme@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Major Changes

- [`a3383ca4`](https://github.com/remirror/remirror/commit/a3383ca4958712ebaf735f5fb25c039e6295d137) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: 💥 Complete move of `useMultiPositioner` and `usePositioner` to `@remirror/react-hooks`. The imports are no longer available via `@remirror/react` after being deprecated for a few weeks.

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/extension-placeholder@1.0.0-next.37
  - @remirror/extension-positioner@1.0.0-next.37
  - @remirror/extension-react-component@1.0.0-next.37
  - @remirror/extension-react-ssr@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - @remirror/preset-core@1.0.0-next.37
  - @remirror/preset-react@1.0.0-next.37
  - @remirror/i18n@1.0.0-next.37
  - @remirror/react-utils@1.0.0-next.37
  - @remirror/theme@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

* [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.

- [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade linaria and other dependencies

- Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/extension-placeholder@1.0.0-next.35
  - @remirror/extension-positioner@1.0.0-next.35
  - @remirror/extension-react-component@1.0.0-next.35
  - @remirror/extension-react-ssr@1.0.0-next.35
  - @remirror/i18n@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/preset-core@1.0.0-next.35
  - @remirror/preset-react@1.0.0-next.35
  - @remirror/react-utils@1.0.0-next.35
  - @remirror/theme@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Major Changes

- [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0) [#667](https://github.com/remirror/remirror/pull/667) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove unused `useMeasure` hook from `@remirror/react`.

### Patch Changes

- [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be) [#665](https://github.com/remirror/remirror/pull/665) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Refactor `RemirrorManager` and rename `EditorWrapper` to `Framework`.

  - New `BaseFramework` interface which is implemented by the abstract `Framework` class and used by the `RemirrorManager` to keep hold of an instance of the `Framework`.
  - New `attachFramework` method on the manager.
  - Update `doc` property to `document` throughout the codebase. `doc` could be confused with the `doc` node or the actual document. Now it's clearer. Any time `doc` is mentioned in the code base it refers to the `ProseMirror` node. Any time `document` is mentioned it is referring to the DOM.
  - Remove `SocialEditorWrapperComponent` export from `@remirror/react-social`.

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/extension-react-component@1.0.0-next.34
  - @remirror/preset-core@1.0.0-next.34
  - @remirror/extension-placeholder@1.0.0-next.34
  - @remirror/extension-positioner@1.0.0-next.34
  - @remirror/extension-react-ssr@1.0.0-next.34
  - @remirror/preset-react@1.0.0-next.34
  - @remirror/react-utils@1.0.0-next.34
  - @remirror/i18n@1.0.0-next.34
  - @remirror/theme@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Major Changes

- 92ed4135: **BREAKING**: 💥 Remove export of `useSetState` and use default `useState` instead.

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [d47bd78f]
  - @remirror/core@1.0.0-next.33
  - @remirror/extension-placeholder@1.0.0-next.33
  - @remirror/extension-positioner@1.0.0-next.33
  - @remirror/extension-react-component@1.0.0-next.33
  - @remirror/extension-react-ssr@1.0.0-next.33
  - @remirror/preset-core@1.0.0-next.33
  - @remirror/preset-react@1.0.0-next.33
  - @remirror/react-utils@1.0.0-next.33
  - @remirror/theme@1.0.0-next.33
  - @remirror/i18n@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Minor Changes

- [`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8) [#642](https://github.com/remirror/remirror/pull/642) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new signature return for `useExtension` and `usePreset`. If only provided the constructor they return a the extension or preset instance from within the manager.

### Patch Changes

- [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3) [#645](https://github.com/remirror/remirror/pull/645) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Deprecate `@remirror/react` exports for `usePositioner` and `useMultiPositioner` to push adoption of `remirror/react/hooks`.

- Updated dependencies [[`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d)]:
  - @remirror/core@1.0.0-next.32
  - @remirror/extension-positioner@1.0.0-next.32
  - @remirror/react-utils@1.0.0-next.32
  - @remirror/extension-placeholder@1.0.0-next.32
  - @remirror/extension-react-component@1.0.0-next.32
  - @remirror/extension-react-ssr@1.0.0-next.32
  - @remirror/preset-core@1.0.0-next.32
  - @remirror/preset-react@1.0.0-next.32
  - @remirror/i18n@1.0.0-next.32
  - @remirror/theme@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/core@1.0.0-next.31
  - @remirror/extension-placeholder@1.0.0-next.31
  - @remirror/extension-positioner@1.0.0-next.31
  - @remirror/extension-react-component@1.0.0-next.31
  - @remirror/extension-react-ssr@1.0.0-next.31
  - @remirror/preset-core@1.0.0-next.31
  - @remirror/preset-react@1.0.0-next.31
  - @remirror/i18n@1.0.0-next.31
  - @remirror/react-utils@1.0.0-next.31

## 1.0.0-next.30

> 2020-08-28

### Patch Changes

- [`de0ba243`](https://github.com/remirror/remirror/commit/de0ba2436729f2fbd3bc8531b0e5fd01d3f34210) [#603](https://github.com/remirror/remirror/pull/603) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove requirement for `CorePreset` and `ReactPreset` when using the `React` framework.

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- [`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf) [#598](https://github.com/remirror/remirror/pull/598) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix the broken build in production caused by comparing the mangled `Constructor.name` to an expected value.

  - Make `@types/node` an optional peer dependency of `@remirror/core-utils`.

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/extension-placeholder@1.0.0-next.29
  - @remirror/extension-positioner@1.0.0-next.29
  - @remirror/extension-react-component@1.0.0-next.29
  - @remirror/extension-react-ssr@1.0.0-next.29
  - @remirror/preset-core@1.0.0-next.29
  - @remirror/preset-react@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Minor Changes

- [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d) [#591](https://github.com/remirror/remirror/pull/591) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for nested content within `ReactComponent` node views. Also support adding multiple components to the manager via the `nodeViewComponents` setting. Currently `ReactNodeView` components must be defined at initialization, and marks are not supported.

  - Also enforce minimum required extensions for the manager passed to the `RemirrorProvider`.
  - Some general cleanup and refactoring.
  - Add support for composing refs when using `getRootProps`. Now you can add your own ref to the `getRootProps({ ref })` function call which will be populated at the same time.
  - Test the names of `Extension`'s and `Preset`'s in with `extensionValidityTest`.
  - **BREAKING CHANGES** 💥
    - Rename: `ReactSSRExtension` => `ReactSsrExtension`
    - Rename: `ReactComponentExtension.name` from `reactNodeView` => `reactComponent`.
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `NodeViewsExtension` => `NodeViewExtension`
    - Rename: `SuggestExtension.name` from `suggestions` => `suggest`

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/extension-placeholder@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/preset-react@1.0.0-next.28
  - @remirror/extension-react-component@1.0.0-next.28
  - @remirror/extension-react-ssr@1.0.0-next.28
  - @remirror/extension-positioner@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - @remirror/i18n@1.0.0-next.28
  - @remirror/react-utils@1.0.0-next.28
  - @remirror/theme@1.0.0-next.28

## 1.0.0-next.27

> 2020-08-25

### Patch Changes

- Updated dependencies [a7436f03]
  - @remirror/theme@1.0.0-next.27

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/extension-placeholder@1.0.0-next.26
  - @remirror/extension-positioner@1.0.0-next.26
  - @remirror/extension-react-component@1.0.0-next.26
  - @remirror/extension-react-ssr@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - @remirror/preset-react@1.0.0-next.26
  - @remirror/react-utils@1.0.0-next.26
  - @remirror/i18n@1.0.0-next.26
  - @remirror/theme@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/extension-placeholder@1.0.0-next.25
  - @remirror/extension-positioner@1.0.0-next.25
  - @remirror/extension-react-component@1.0.0-next.25
  - @remirror/extension-react-ssr@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - @remirror/preset-react@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-placeholder@1.0.0-next.24
  - @remirror/extension-positioner@1.0.0-next.24
  - @remirror/extension-react-component@1.0.0-next.24
  - @remirror/extension-react-ssr@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24
  - @remirror/preset-react@1.0.0-next.24

## 1.0.0-next.23

> 2020-08-18

### Patch Changes

- d505ebc1: Fixes #555 `onChange` callback not being updated when using a controlled editor in `StrictMode`.

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- d300c5f0: Fix #516 with social emoji popup when scroll bars are visible.

  Export `emptyCoords` object from `@remirror/extension-positioner`.

  Add second parameter to `usePositioner` hook which can override when a positioner should be set to active.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
- Updated dependencies [d300c5f0]
  - @remirror/core@1.0.0-next.22
  - @remirror/extension-positioner@1.0.0-next.22
  - @remirror/extension-placeholder@1.0.0-next.22
  - @remirror/extension-react-component@1.0.0-next.22
  - @remirror/extension-react-ssr@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/preset-react@1.0.0-next.22
  - @remirror/react-utils@1.0.0-next.22
  - @remirror/theme@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22
  - @remirror/i18n@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core@1.0.0-next.21
  - @remirror/extension-placeholder@1.0.0-next.21
  - @remirror/extension-positioner@1.0.0-next.21
  - @remirror/extension-react-component@1.0.0-next.21
  - @remirror/extension-react-ssr@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - @remirror/preset-react@1.0.0-next.21
  - @remirror/react-utils@1.0.0-next.21
  - @remirror/theme@1.0.0-next.21
  - @remirror/i18n@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- 95697fbd: Fix the controlled editor when used in `StrictMode`. Closes #482
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/pm@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/react-utils@1.0.0-next.20
  - @remirror/theme@1.0.0-next.20
  - @remirror/i18n@1.0.0-next.20
  - @remirror/extension-placeholder@1.0.0-next.20
  - @remirror/extension-positioner@1.0.0-next.20
  - @remirror/extension-react-component@1.0.0-next.20
  - @remirror/extension-react-ssr@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20
  - @remirror/preset-react@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Major Changes

- 4498814f: Rename `UsePositionerHookReturn` and `UseMultiPositionerHookReturn` to `UsePositionerReturn` and `UseMultiPositionerReturn`.

  - Add `active: boolean` property to `UsePositionerHookReturn`.
  - Fix the floating emoji menu for the social editor and showcase. Now hidden when text selection spans multiple characters.

### Patch Changes

- Updated dependencies [2d72ca94]
- Updated dependencies [898c62e0]
  - @remirror/extension-positioner@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/extension-placeholder@1.0.0-next.17
  - @remirror/extension-react-component@1.0.0-next.17
  - @remirror/extension-react-ssr@1.0.0-next.17
  - @remirror/preset-react@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6528323e: **Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`. **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a `settings` property for manager settings.

  `@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from extension. Apply it to the packages mentioned above.

  - `@remirror/react-wysiwyg` - Update imports from `@remirror/preset-wysiwyg`.

- e518ef1d: Rewrite the positioner extension with a new API for creating positioners.

  Positioners now return an array of `VirtualPositions` or an empty array if no positions extension.

  `@remirror/react` - Add `useMultiPositioner`. `@remirror/react` - Add `virtualNode` property for compatibility with `popper-react`

  An example of creating a new positioner with the new api is below.

  ```ts
  import { Coords, hasStateChanged, Positioner } from '@remirror/extension-positioner';

  export const cursorPopupPositioner = Positioner.create<Coords>({
    hasChanged: hasStateChanged,

    /**
     * Only active when the selection is empty (one character)
     */
    getActive: (parameter) => {
      const { state, view } = parameter;

      if (!state.selection.empty) {
        return [];
      }

      return [view.coordsAtPos(state.selection.from)];
    },

    getPosition(parameter) {
      const { element, data: cursor } = parameter;
      const parent = element.offsetParent;

      if (!parent) {
        return emptyVirtualPosition;
      }

      // The box in which the bubble menu is positioned, to use as an anchor
      const parentBox = parent.getBoundingClientRect();

      // The popup menu element
      const elementBox = element.getBoundingClientRect();

      const calculatedLeft = cursor.left - parentBox.left;
      const calculatedRight = parentBox.right - cursor.right;

      const bottom = Math.trunc(cursor.bottom - parentBox.top);
      const top = Math.trunc(cursor.top - parentBox.top);
      const rect = new DOMRect(cursor.left, cursor.top, 0, cursor.bottom - cursor.top);
      const left =
        calculatedLeft + elementBox.width > parentBox.width
          ? calculatedLeft - elementBox.width
          : calculatedLeft;
      const right =
        calculatedRight + elementBox.width > parentBox.width
          ? calculatedRight - elementBox.width
          : calculatedRight;

      return { rect, right, left, bottom, top };
    },
  });
  ```

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [982a6b15]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
- Updated dependencies [e518ef1d]
- Updated dependencies [be9a9c17]
- Updated dependencies [2592b7b3]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/extension-placeholder@1.0.0-next.16
  - @remirror/extension-positioner@1.0.0-next.16
  - @remirror/extension-react-component@1.0.0-next.16
  - @remirror/extension-react-ssr@1.0.0-next.16
  - @remirror/i18n@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/preset-react@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [6c3b278b]
- Updated dependencies [f91dcab1]
  - @remirror/core@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/extension-placeholder@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-react-component@1.0.0-next.15
  - @remirror/extension-react-ssr@1.0.0-next.15
  - @remirror/preset-react@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 4571a447: Use methods for `addHandler` and `addCustomHandler`

  `@remirror/react` - Bind `addHandler` and `addCustomHandler` for `Preset` and `Extension` hooks.

- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [e45706e5]
- Updated dependencies [02704d42]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-placeholder@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-react-component@1.0.0-next.13
  - @remirror/extension-react-ssr@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/preset-react@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core@1.0.0-next.12
  - @remirror/extension-placeholder@1.0.0-next.12
  - @remirror/extension-positioner@1.0.0-next.12
  - @remirror/extension-react-component@1.0.0-next.12
  - @remirror/extension-react-ssr@1.0.0-next.12
  - @remirror/preset-core@1.0.0-next.12
  - @remirror/preset-react@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Patch Changes

- 21a9650c: Rename `getArray` to `getLazyArray`. Also bump the version of `@remirror/core-helpers` to make sure it is released.
- Updated dependencies [54461006]
  - @remirror/core@1.0.0-next.11
  - @remirror/extension-placeholder@1.0.0-next.11
  - @remirror/extension-positioner@1.0.0-next.11
  - @remirror/extension-react-ssr@1.0.0-next.11
  - @remirror/extension-react-component@1.0.0-next.11
  - @remirror/preset-core@1.0.0-next.11
  - @remirror/preset-react@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 3702a83a: Remove requirement for `readonly` arrays when passing a list of extensions / presets to manager creators.

  - **`@remirror/react`** - Add support for a function as the first parameter to the `useManager` hook and `createReactManager` function.
  - **`@remirror/preset-core`** - Add support for a function as the first parameter to the `createCoreManager` function.

- e554ce8c: - Use `ReactComponent` for SSR.
  - Add `environment to`NodeViewComponentProps`.
  - Export `NodeViewComponentProps` from `@remirror/extension-react-component`.
  - Refactor `manager.store.components` to use `ManagerStoreReactComponent` interface.

### Patch Changes

- 76d1df83: - Prevent `createReactManager` being called on every render.
  - Accept a `manager` as a parameter for ``createReactManager`
  - Improve internal performance of components by caching the `ReactEditorWrapper` after the first render.
- Updated dependencies [6468058a]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
  - @remirror/core@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-react-component@1.0.0-next.10
  - @remirror/extension-react-ssr@1.0.0-next.10
  - @remirror/extension-placeholder@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/preset-react@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Minor Changes

- 02fdafff: - Rename `change` event to `updated`. `updated` is called with the `EventListenerParameter`.

  - Add new manager `stateUpdate` to the `editorWrapper`
  - Add `autoUpdate` option to `useRemirror` hook from `@remirror/react` which means that the context object returned by the hook is always up to date with the latest editor state. It will also cause the component to rerender so be careful to only use it when necessary.

  ```tsx
  import React from 'react';

  const Editor = () => {
    const { active, commands } = useRemirror({ autoUpdate: true });

    return (
      <button
        onClick={() => commands.toggleBold}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        B
      </button>
    );
  };
  ```

  - Fix broken `onChangeHandler` parameter for the use `useRemirror` hook.

### Patch Changes

- b332942b: Fix broken SSR and add unit tests back.
- Updated dependencies [02fdafff]
  - @remirror/core@1.0.0-next.9
  - @remirror/extension-placeholder@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-react-component@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/preset-react@1.0.0-next.9

## 1.0.0-next.7

> 2020-07-21

### Patch Changes

- 6c5a93c8: Fix a bug where the previous state was always equal to the updated state for controlled editors. This caused problems with functionality that relies on comparing state values e.g. `PositionerExtension`.

## 1.0.0-next.5

> 2020-07-17

### Minor Changes

- 4628d342: Add new entry point `@remirror/react/renderers`. It provides utilities for rendering the editor directly from the exported json.

## 1.0.0-next.4

> 2020-07-16

### Major Changes

- 64edeec2: Add a new extension package `@remirror/extension-react-component` for creating ProseMirror `NodeView`'s from React components.

  - Move `ReactPortal` implementation from `@remirror/react` to `@remirror/react-utils` for usage in other parts of the application.
  - Move `ReactNodeView` into new package `@remirror/extension-react-component`.
  - Rename `ReactNodeView.createNodeView` to `ReactNodeView.create`.

  The new package adds the `ReactComponent` property to the extension interface. An extension with a component attached will use it to override the automatic DOM representation with a ProseMirror `NodeView`.

### Patch Changes

- e1a1b6ec: Prevent multiple editors being attached with a single Provider. This error flags you when you are attaching `getRootProps` to the dom in multiple placeswithin a single editor instance. This can help prevent unwanted behaviour.
- 9f495078: Move `suppressHydrationWarning` prop from core to to react editor. It makes no sense for it to be in core since it only impacts the react editor.
- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [9f495078]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/extension-placeholder@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/i18n@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/preset-react@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - @remirror/extension-react-component@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/extension-placeholder@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/i18n@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/preset-react@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Minor Changes

- Add support for `React.StrictMode`.

  Previously, activating `StrictMode` would cause the components to render twice and break functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been called. This check has been removed since it isn't needed anymore.

### Patch Changes

- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.2
  - @remirror/react-utils@1.0.0-next.2
  - @remirror/extension-placeholder@1.0.0-next.2
  - @remirror/extension-positioner@1.0.0-next.2
  - @remirror/preset-core@1.0.0-next.2
  - @remirror/preset-react@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/extension-placeholder@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/i18n@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/preset-react@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
  - @remirror/theme@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

### Minor Changes

- 09e990cb: Update `EditorManager` / `ExtensionManager` name to be \*\*`RemirrorManager`.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
  - @remirror/core@1.0.0-next.0
  - @remirror/extension-placeholder@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/i18n@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/preset-react@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1

## 0.11.0

### Minor Changes

- 026d4238: Add a `focus` method to the remirror editor context object. It allows focusing at a provided position which can be `start`, `end`, a specific position or a range using the `{from: number; to: number}` type signature.

  To use this run

  ```tsx
  import React from 'react';
  import { useRemirrorContext } from '@remirror/react';

  const MyEditor = () => {
    const { focus, getRootProps } = useRemirrorContext();

    useEffect(() => {
      focus('end'); // Autofocus to the end once
    }, [focus]);
  };
  return <div {...getRootProps()} />;
  ```

  Resolves the initial issue raised in #229.

- 69d00c62: Add custom arguments to `autoFocus` props. The same arguments that can added to the `focus()` context method can now be passed as a prop.

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0
  - @remirror/react-ssr@0.11.0

## 0.7.7

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/react-utils@0.7.6
  - @remirror/ui@0.7.6
  - @remirror/react-ssr@0.7.6

## 0.7.6

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/ui@0.7.5
  - @remirror/react-ssr@0.7.5

## 0.7.5

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react-portals@0.7.4
  - @remirror/react-ssr@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/ui@0.7.4

## 0.7.4

### Patch Changes

- 416d65da: Better code comment docs around how to apply additional extensions (#186).

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react-portals@0.7.3
  - @remirror/react-ssr@0.7.3
  - @remirror/react-utils@0.7.3
  - @remirror/ui@0.7.3
