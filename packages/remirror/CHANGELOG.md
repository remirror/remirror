# remirror

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

- [#837](https://github.com/remirror/remirror/pull/837) [`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b) Thanks [@cmanou](https://github.com/cmanou)! - Add @remirror/extension-sub extension

* [#706](https://github.com/remirror/remirror/pull/706) [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make peer dependencies of `CodeBlockExtension`, `YjsExtension` and `CollaborationExtension` dependencies of `remirror`. This is so that `remirror/extensions` can be imported safely.

- [#839](https://github.com/remirror/remirror/pull/839) [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f) Thanks [@cmanou](https://github.com/cmanou)! - Add @remirror/extension-sup extension

### Patch Changes

- [#865](https://github.com/remirror/remirror/pull/865) [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add missing `y-protocols` dependency for `remirror` package.

* [#954](https://github.com/remirror/remirror/pull/954) [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1) Thanks [@zofiag](https://github.com/zofiag)! - Fix decreasing node indent with keyboard shortcut `Shift-Tab`.

* Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`979c4cb6b`](https://github.com/remirror/remirror/commit/979c4cb6bd1fa301a1716915514b27542f972c9f), [`d9bc9180b`](https://github.com/remirror/remirror/commit/d9bc9180ba85e0edd4ae11b7e53ee5aa73acb9e5), [`f6fc2729d`](https://github.com/remirror/remirror/commit/f6fc2729d3a39c76f52dbf1c73d4f2ce1f7f361b), [`e0f1bec4a`](https://github.com/remirror/remirror/commit/e0f1bec4a1e8073ce8f5500d62193e52321155b9), [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`2214e6054`](https://github.com/remirror/remirror/commit/2214e6054c345a265bfdba6f2004c3047d69901e), [`5c981d96d`](https://github.com/remirror/remirror/commit/5c981d96d9344f2507f32a4213bd55c17bfcd92f), [`9fe4191e1`](https://github.com/remirror/remirror/commit/9fe4191e171d5e693c0f72cd7dd44a0dcab89297), [`6bba1782e`](https://github.com/remirror/remirror/commit/6bba1782e838fbe94e0d0aee0824a45371644c88), [`123a20ae8`](https://github.com/remirror/remirror/commit/123a20ae8067d97d46373d079728f942e1daed0c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`221316411`](https://github.com/remirror/remirror/commit/2213164114480feaa22638bd6dae1a8acafacb8f), [`6de1e675c`](https://github.com/remirror/remirror/commit/6de1e675c9f502197a31a1e0e21ba0bd91919fe2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`862a0c8ec`](https://github.com/remirror/remirror/commit/862a0c8ec4e90c2108abe8c2f50cdcb562ffa713), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`9cb393ec5`](https://github.com/remirror/remirror/commit/9cb393ec58a8070dc43b7f2805c0920a04578f20), [`281ba2172`](https://github.com/remirror/remirror/commit/281ba2172713e40448c6208cc728ff60af2b2761), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`675243004`](https://github.com/remirror/remirror/commit/675243004231db49df37404576c393ab7305ede9), [`8b9522257`](https://github.com/remirror/remirror/commit/8b95222571ed2925be43d6eabe7340bbf9a2cd62), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`d896c3196`](https://github.com/remirror/remirror/commit/d896c3196d0a2ec372e9515ea5d9362205a352a7), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b884f04ae`](https://github.com/remirror/remirror/commit/b884f04ae45090fc95155b4cdae5f98d0377cc19), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`e7a1d7c1d`](https://github.com/remirror/remirror/commit/e7a1d7c1db1b42ce5cffc4a821669b734c73eae2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`4966eedae`](https://github.com/remirror/remirror/commit/4966eedaeb37cdb8c40b7b1dcce5eabf27dc1fd1), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`4d3b81c6e`](https://github.com/remirror/remirror/commit/4d3b81c6e1b691f22061f7c152421b807965fc0d), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`f9780e645`](https://github.com/remirror/remirror/commit/f9780e645f4b6ddd80d07d11ed70741a54e7af31), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`28b81a858`](https://github.com/remirror/remirror/commit/28b81a8580670c4ebc06ad04db088a4b684237bf), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`db49e4678`](https://github.com/remirror/remirror/commit/db49e467811c3c95f48c29f7bd267dac4c3ff85f), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`561ae7792`](https://github.com/remirror/remirror/commit/561ae7792e9a6632f220429c8b9add3061f964dc), [`b6f29f0e3`](https://github.com/remirror/remirror/commit/b6f29f0e3dfa2806023d13e68f34ee57ba5c1ae9), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/extension-link@1.0.0
  - @remirror/extension-mention-atom@1.0.0
  - @remirror/extension-sub@1.0.0
  - @remirror/extension-image@1.0.0
  - @remirror/extension-tables@1.0.0
  - @remirror/extension-events@1.0.0
  - @remirror/extension-markdown@1.0.0
  - @remirror/extension-callout@1.0.0
  - @remirror/extension-yjs@1.0.0
  - @remirror/extension-annotation@1.0.0
  - @remirror/extension-list@1.0.0
  - @remirror/extension-positioner@1.0.0
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/core-types@1.0.0
  - @remirror/core-utils@1.0.0
  - @remirror/dom@1.0.0
  - @remirror/extension-bidi@1.0.0
  - @remirror/extension-blockquote@1.0.0
  - @remirror/extension-bold@1.0.0
  - @remirror/extension-code@1.0.0
  - @remirror/extension-code-block@1.0.0
  - @remirror/extension-codemirror5@1.0.0
  - @remirror/extension-collaboration@1.0.0
  - @remirror/extension-columns@1.0.0
  - @remirror/extension-diff@1.0.0
  - @remirror/extension-doc@1.0.0
  - @remirror/extension-drop-cursor@1.0.0
  - @remirror/extension-embed@1.0.0
  - @remirror/extension-emoji@1.0.0
  - @remirror/extension-epic-mode@1.0.0
  - @remirror/extension-font-family@1.0.0
  - @remirror/extension-font-size@1.0.0
  - @remirror/extension-gap-cursor@1.0.0
  - @remirror/extension-hard-break@1.0.0
  - @remirror/extension-heading@1.0.0
  - @remirror/extension-history@1.0.0
  - @remirror/extension-horizontal-rule@1.0.0
  - @remirror/extension-italic@1.0.0
  - @remirror/extension-mention@1.0.0
  - @remirror/extension-node-formatting@1.0.0
  - @remirror/extension-paragraph@1.0.0
  - @remirror/extension-placeholder@1.0.0
  - @remirror/extension-search@1.0.0
  - @remirror/extension-strike@1.0.0
  - @remirror/extension-sup@1.0.0
  - @remirror/extension-text@1.0.0
  - @remirror/extension-text-case@1.0.0
  - @remirror/extension-text-color@1.0.0
  - @remirror/extension-text-highlight@1.0.0
  - @remirror/extension-trailing-node@1.0.0
  - @remirror/extension-underline@1.0.0
  - @remirror/extension-whitespace@1.0.0
  - @remirror/icons@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0
  - @remirror/preset-formatting@1.0.0
  - @remirror/preset-wysiwyg@1.0.0
  - @remirror/theme@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`34a7981d`](https://github.com/remirror/remirror/commit/34a7981de827e9d804a0fb5e1304ddf5a8ae4505), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`302bdf7e`](https://github.com/remirror/remirror/commit/302bdf7e92c5df562d0402b83da9d7b7240aa2f6), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/extension-yjs@1.0.0-next.60
  - @remirror/core-utils@1.0.0-next.60
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/extension-image@1.0.0-next.60
  - @remirror/core@1.0.0-next.60
  - @remirror/core-helpers@1.0.0-next.60
  - @remirror/core-types@1.0.0-next.60
  - @remirror/dom@1.0.0-next.60
  - @remirror/extension-annotation@1.0.0-next.60
  - @remirror/extension-auto-link@1.0.0-next.60
  - @remirror/extension-bidi@1.0.0-next.60
  - @remirror/extension-blockquote@1.0.0-next.60
  - @remirror/extension-bold@1.0.0-next.60
  - @remirror/extension-callout@1.0.0-next.60
  - @remirror/extension-code@1.0.0-next.60
  - @remirror/extension-code-block@1.0.0-next.60
  - @remirror/extension-codemirror5@1.0.0-next.60
  - @remirror/extension-collaboration@1.0.0-next.60
  - @remirror/extension-diff@1.0.0-next.60
  - @remirror/extension-doc@1.0.0-next.60
  - @remirror/extension-drop-cursor@1.0.0-next.60
  - @remirror/extension-emoji@1.0.0-next.60
  - @remirror/extension-epic-mode@1.0.0-next.60
  - @remirror/extension-events@1.0.0-next.60
  - @remirror/extension-gap-cursor@1.0.0-next.60
  - @remirror/extension-hard-break@1.0.0-next.60
  - @remirror/extension-heading@1.0.0-next.60
  - @remirror/extension-history@1.0.0-next.60
  - @remirror/extension-horizontal-rule@1.0.0-next.60
  - @remirror/extension-italic@1.0.0-next.60
  - @remirror/extension-link@1.0.0-next.60
  - @remirror/extension-mention@1.0.0-next.60
  - @remirror/extension-mention-atom@1.0.0-next.60
  - @remirror/extension-paragraph@1.0.0-next.60
  - @remirror/extension-placeholder@1.0.0-next.60
  - @remirror/extension-positioner@1.0.0-next.60
  - @remirror/extension-react-component@1.0.0-next.60
  - @remirror/extension-react-ssr@1.0.0-next.60
  - @remirror/extension-search@1.0.0-next.60
  - @remirror/extension-strike@1.0.0-next.60
  - @remirror/extension-text@1.0.0-next.60
  - @remirror/extension-trailing-node@1.0.0-next.60
  - @remirror/extension-underline@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - @remirror/preset-core@1.0.0-next.60
  - @remirror/preset-embed@1.0.0-next.60
  - @remirror/preset-list@1.0.0-next.60
  - @remirror/preset-react@1.0.0-next.60
  - @remirror/preset-social@1.0.0-next.60
  - @remirror/preset-table@1.0.0-next.60
  - @remirror/preset-wysiwyg@1.0.0-next.60
  - @remirror/react@1.0.0-next.60
  - @remirror/react-hooks@1.0.0-next.60
  - @remirror/react-social@1.0.0-next.60
  - @remirror/react-utils@1.0.0-next.60
  - @remirror/react-wysiwyg@1.0.0-next.60
  - @remirror/theme@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e69115f1`](https://github.com/remirror/remirror/commit/e69115f141c12c7dd21bd89c716b12b279414364)]:
  - @remirror/core@1.0.0-next.59
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-helpers@1.0.0-next.59
  - @remirror/core-types@1.0.0-next.59
  - @remirror/dom@1.0.0-next.59
  - @remirror/extension-annotation@1.0.0-next.59
  - @remirror/extension-auto-link@1.0.0-next.59
  - @remirror/extension-bidi@1.0.0-next.59
  - @remirror/extension-blockquote@1.0.0-next.59
  - @remirror/extension-bold@1.0.0-next.59
  - @remirror/extension-callout@1.0.0-next.59
  - @remirror/extension-code@1.0.0-next.59
  - @remirror/extension-code-block@1.0.0-next.59
  - @remirror/extension-codemirror5@1.0.0-next.59
  - @remirror/extension-collaboration@1.0.0-next.59
  - @remirror/extension-diff@1.0.0-next.59
  - @remirror/extension-doc@1.0.0-next.59
  - @remirror/extension-drop-cursor@1.0.0-next.59
  - @remirror/extension-emoji@1.0.0-next.59
  - @remirror/extension-epic-mode@1.0.0-next.59
  - @remirror/extension-events@1.0.0-next.59
  - @remirror/extension-gap-cursor@1.0.0-next.59
  - @remirror/extension-hard-break@1.0.0-next.59
  - @remirror/extension-heading@1.0.0-next.59
  - @remirror/extension-history@1.0.0-next.59
  - @remirror/extension-horizontal-rule@1.0.0-next.59
  - @remirror/extension-image@1.0.0-next.59
  - @remirror/extension-italic@1.0.0-next.59
  - @remirror/extension-link@1.0.0-next.59
  - @remirror/extension-mention@1.0.0-next.59
  - @remirror/extension-mention-atom@1.0.0-next.59
  - @remirror/extension-paragraph@1.0.0-next.59
  - @remirror/extension-placeholder@1.0.0-next.59
  - @remirror/extension-positioner@1.0.0-next.59
  - @remirror/extension-react-component@1.0.0-next.59
  - @remirror/extension-react-ssr@1.0.0-next.59
  - @remirror/extension-search@1.0.0-next.59
  - @remirror/extension-strike@1.0.0-next.59
  - @remirror/extension-text@1.0.0-next.59
  - @remirror/extension-trailing-node@1.0.0-next.59
  - @remirror/extension-underline@1.0.0-next.59
  - @remirror/extension-yjs@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - @remirror/preset-core@1.0.0-next.59
  - @remirror/preset-embed@1.0.0-next.59
  - @remirror/preset-list@1.0.0-next.59
  - @remirror/preset-react@1.0.0-next.59
  - @remirror/preset-social@1.0.0-next.59
  - @remirror/preset-table@1.0.0-next.59
  - @remirror/preset-wysiwyg@1.0.0-next.59
  - @remirror/react@1.0.0-next.59
  - @remirror/react-hooks@1.0.0-next.59
  - @remirror/react-social@1.0.0-next.59
  - @remirror/react-utils@1.0.0-next.59
  - @remirror/react-wysiwyg@1.0.0-next.59
  - @remirror/theme@1.0.0-next.59
  - @remirror/core-utils@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`3d3da227`](https://github.com/remirror/remirror/commit/3d3da227fd582d388ed2587f0ccd0ac6e5b6ae73)]:
  - @remirror/core@1.0.0-next.58
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-helpers@1.0.0-next.58
  - @remirror/core-types@1.0.0-next.58
  - @remirror/core-utils@1.0.0-next.58
  - @remirror/dom@1.0.0-next.58
  - @remirror/extension-annotation@1.0.0-next.58
  - @remirror/extension-auto-link@1.0.0-next.58
  - @remirror/extension-bidi@1.0.0-next.58
  - @remirror/extension-blockquote@1.0.0-next.58
  - @remirror/extension-bold@1.0.0-next.58
  - @remirror/extension-callout@1.0.0-next.58
  - @remirror/extension-code@1.0.0-next.58
  - @remirror/extension-code-block@1.0.0-next.58
  - @remirror/extension-codemirror5@1.0.0-next.58
  - @remirror/extension-collaboration@1.0.0-next.58
  - @remirror/extension-diff@1.0.0-next.58
  - @remirror/extension-doc@1.0.0-next.58
  - @remirror/extension-drop-cursor@1.0.0-next.58
  - @remirror/extension-emoji@1.0.0-next.58
  - @remirror/extension-epic-mode@1.0.0-next.58
  - @remirror/extension-events@1.0.0-next.58
  - @remirror/extension-gap-cursor@1.0.0-next.58
  - @remirror/extension-hard-break@1.0.0-next.58
  - @remirror/extension-heading@1.0.0-next.58
  - @remirror/extension-history@1.0.0-next.58
  - @remirror/extension-horizontal-rule@1.0.0-next.58
  - @remirror/extension-image@1.0.0-next.58
  - @remirror/extension-italic@1.0.0-next.58
  - @remirror/extension-link@1.0.0-next.58
  - @remirror/extension-mention@1.0.0-next.58
  - @remirror/extension-mention-atom@1.0.0-next.58
  - @remirror/extension-paragraph@1.0.0-next.58
  - @remirror/extension-placeholder@1.0.0-next.58
  - @remirror/extension-positioner@1.0.0-next.58
  - @remirror/extension-react-component@1.0.0-next.58
  - @remirror/extension-react-ssr@1.0.0-next.58
  - @remirror/extension-search@1.0.0-next.58
  - @remirror/extension-strike@1.0.0-next.58
  - @remirror/extension-text@1.0.0-next.58
  - @remirror/extension-trailing-node@1.0.0-next.58
  - @remirror/extension-underline@1.0.0-next.58
  - @remirror/extension-yjs@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - @remirror/preset-core@1.0.0-next.58
  - @remirror/preset-embed@1.0.0-next.58
  - @remirror/preset-list@1.0.0-next.58
  - @remirror/preset-react@1.0.0-next.58
  - @remirror/preset-social@1.0.0-next.58
  - @remirror/preset-table@1.0.0-next.58
  - @remirror/preset-wysiwyg@1.0.0-next.58
  - @remirror/react@1.0.0-next.58
  - @remirror/react-hooks@1.0.0-next.58
  - @remirror/react-social@1.0.0-next.58
  - @remirror/react-utils@1.0.0-next.58
  - @remirror/react-wysiwyg@1.0.0-next.58
  - @remirror/theme@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4ae3c9b2`](https://github.com/remirror/remirror/commit/4ae3c9b2a1f2073aa243d093a2da4b110e7d246e)]:
  - @remirror/extension-link@1.0.0-next.57
  - @remirror/core@1.0.0-next.57
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-helpers@1.0.0-next.57
  - @remirror/core-types@1.0.0-next.57
  - @remirror/core-utils@1.0.0-next.57
  - @remirror/dom@1.0.0-next.57
  - @remirror/extension-annotation@1.0.0-next.57
  - @remirror/extension-auto-link@1.0.0-next.57
  - @remirror/extension-bidi@1.0.0-next.57
  - @remirror/extension-blockquote@1.0.0-next.57
  - @remirror/extension-bold@1.0.0-next.57
  - @remirror/extension-callout@1.0.0-next.57
  - @remirror/extension-code@1.0.0-next.57
  - @remirror/extension-code-block@1.0.0-next.57
  - @remirror/extension-codemirror5@1.0.0-next.57
  - @remirror/extension-collaboration@1.0.0-next.57
  - @remirror/extension-diff@1.0.0-next.57
  - @remirror/extension-doc@1.0.0-next.57
  - @remirror/extension-drop-cursor@1.0.0-next.57
  - @remirror/extension-emoji@1.0.0-next.57
  - @remirror/extension-epic-mode@1.0.0-next.57
  - @remirror/extension-events@1.0.0-next.57
  - @remirror/extension-gap-cursor@1.0.0-next.57
  - @remirror/extension-hard-break@1.0.0-next.57
  - @remirror/extension-heading@1.0.0-next.57
  - @remirror/extension-history@1.0.0-next.57
  - @remirror/extension-horizontal-rule@1.0.0-next.57
  - @remirror/extension-image@1.0.0-next.57
  - @remirror/extension-italic@1.0.0-next.57
  - @remirror/extension-mention@1.0.0-next.57
  - @remirror/extension-mention-atom@1.0.0-next.57
  - @remirror/extension-paragraph@1.0.0-next.57
  - @remirror/extension-placeholder@1.0.0-next.57
  - @remirror/extension-positioner@1.0.0-next.57
  - @remirror/extension-react-component@1.0.0-next.57
  - @remirror/extension-react-ssr@1.0.0-next.57
  - @remirror/extension-search@1.0.0-next.57
  - @remirror/extension-strike@1.0.0-next.57
  - @remirror/extension-text@1.0.0-next.57
  - @remirror/extension-trailing-node@1.0.0-next.57
  - @remirror/extension-underline@1.0.0-next.57
  - @remirror/extension-yjs@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - @remirror/preset-core@1.0.0-next.57
  - @remirror/preset-embed@1.0.0-next.57
  - @remirror/preset-list@1.0.0-next.57
  - @remirror/preset-react@1.0.0-next.57
  - @remirror/preset-social@1.0.0-next.57
  - @remirror/preset-table@1.0.0-next.57
  - @remirror/preset-wysiwyg@1.0.0-next.57
  - @remirror/react@1.0.0-next.57
  - @remirror/react-hooks@1.0.0-next.57
  - @remirror/react-social@1.0.0-next.57
  - @remirror/react-utils@1.0.0-next.57
  - @remirror/react-wysiwyg@1.0.0-next.57
  - @remirror/theme@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`cba35d51`](https://github.com/remirror/remirror/commit/cba35d51f2c95c2b930b083959dccdf7cf521615), [`01e5c2d2`](https://github.com/remirror/remirror/commit/01e5c2d2707c715cd4e0006f9ac10c0cc3b11042)]:
  - @remirror/core@1.0.0-next.56
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-helpers@1.0.0-next.56
  - @remirror/core-types@1.0.0-next.56
  - @remirror/core-utils@1.0.0-next.56
  - @remirror/dom@1.0.0-next.56
  - @remirror/extension-annotation@1.0.0-next.56
  - @remirror/extension-auto-link@1.0.0-next.56
  - @remirror/extension-bidi@1.0.0-next.56
  - @remirror/extension-blockquote@1.0.0-next.56
  - @remirror/extension-bold@1.0.0-next.56
  - @remirror/extension-callout@1.0.0-next.56
  - @remirror/extension-code@1.0.0-next.56
  - @remirror/extension-code-block@1.0.0-next.56
  - @remirror/extension-codemirror5@1.0.0-next.56
  - @remirror/extension-collaboration@1.0.0-next.56
  - @remirror/extension-diff@1.0.0-next.56
  - @remirror/extension-doc@1.0.0-next.56
  - @remirror/extension-drop-cursor@1.0.0-next.56
  - @remirror/extension-emoji@1.0.0-next.56
  - @remirror/extension-epic-mode@1.0.0-next.56
  - @remirror/extension-events@1.0.0-next.56
  - @remirror/extension-gap-cursor@1.0.0-next.56
  - @remirror/extension-hard-break@1.0.0-next.56
  - @remirror/extension-heading@1.0.0-next.56
  - @remirror/extension-history@1.0.0-next.56
  - @remirror/extension-horizontal-rule@1.0.0-next.56
  - @remirror/extension-image@1.0.0-next.56
  - @remirror/extension-italic@1.0.0-next.56
  - @remirror/extension-link@1.0.0-next.56
  - @remirror/extension-mention@1.0.0-next.56
  - @remirror/extension-mention-atom@1.0.0-next.56
  - @remirror/extension-paragraph@1.0.0-next.56
  - @remirror/extension-placeholder@1.0.0-next.56
  - @remirror/extension-react-component@1.0.0-next.56
  - @remirror/extension-react-ssr@1.0.0-next.56
  - @remirror/extension-search@1.0.0-next.56
  - @remirror/extension-strike@1.0.0-next.56
  - @remirror/extension-text@1.0.0-next.56
  - @remirror/extension-trailing-node@1.0.0-next.56
  - @remirror/extension-underline@1.0.0-next.56
  - @remirror/extension-yjs@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - @remirror/preset-core@1.0.0-next.56
  - @remirror/preset-embed@1.0.0-next.56
  - @remirror/preset-list@1.0.0-next.56
  - @remirror/preset-react@1.0.0-next.56
  - @remirror/preset-social@1.0.0-next.56
  - @remirror/preset-table@1.0.0-next.56
  - @remirror/preset-wysiwyg@1.0.0-next.56
  - @remirror/react@1.0.0-next.56
  - @remirror/react-hooks@1.0.0-next.56
  - @remirror/react-social@1.0.0-next.56
  - @remirror/react-utils@1.0.0-next.56
  - @remirror/react-wysiwyg@1.0.0-next.56
  - @remirror/extension-positioner@1.0.0-next.56
  - @remirror/theme@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b65ea785`](https://github.com/remirror/remirror/commit/b65ea785c96b52cc54be205be66918de104d28bc), [`3ee20d40`](https://github.com/remirror/remirror/commit/3ee20d40c90cac71c39320aaefbfb476d9f74101), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`4bdcac77`](https://github.com/remirror/remirror/commit/4bdcac775c38196ad76431e55fd817d04810f367), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`ee1ab4f3`](https://github.com/remirror/remirror/commit/ee1ab4f38bc1a169821b66017d5d24eb00275f0f), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`c2268721`](https://github.com/remirror/remirror/commit/c226872161dab8e212407d3d4bc2d177f4f3a6d4)]:
  - @remirror/extension-link@1.0.0-next.55
  - @remirror/extension-mention@1.0.0-next.55
  - @remirror/core@1.0.0-next.55
  - @remirror/extension-events@1.0.0-next.55
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-helpers@1.0.0-next.55
  - @remirror/core-types@1.0.0-next.55
  - @remirror/dom@1.0.0-next.55
  - @remirror/extension-annotation@1.0.0-next.55
  - @remirror/extension-auto-link@1.0.0-next.55
  - @remirror/extension-bidi@1.0.0-next.55
  - @remirror/extension-blockquote@1.0.0-next.55
  - @remirror/extension-bold@1.0.0-next.55
  - @remirror/extension-callout@1.0.0-next.55
  - @remirror/extension-code@1.0.0-next.55
  - @remirror/extension-code-block@1.0.0-next.55
  - @remirror/extension-codemirror5@1.0.0-next.55
  - @remirror/extension-collaboration@1.0.0-next.55
  - @remirror/extension-diff@1.0.0-next.55
  - @remirror/extension-doc@1.0.0-next.55
  - @remirror/extension-drop-cursor@1.0.0-next.55
  - @remirror/extension-emoji@1.0.0-next.55
  - @remirror/extension-epic-mode@1.0.0-next.55
  - @remirror/extension-gap-cursor@1.0.0-next.55
  - @remirror/extension-hard-break@1.0.0-next.55
  - @remirror/extension-heading@1.0.0-next.55
  - @remirror/extension-history@1.0.0-next.55
  - @remirror/extension-horizontal-rule@1.0.0-next.55
  - @remirror/extension-image@1.0.0-next.55
  - @remirror/extension-italic@1.0.0-next.55
  - @remirror/extension-paragraph@1.0.0-next.55
  - @remirror/extension-placeholder@1.0.0-next.55
  - @remirror/extension-positioner@1.0.0-next.55
  - @remirror/extension-react-component@1.0.0-next.55
  - @remirror/extension-react-ssr@1.0.0-next.55
  - @remirror/extension-search@1.0.0-next.55
  - @remirror/extension-strike@1.0.0-next.55
  - @remirror/extension-text@1.0.0-next.55
  - @remirror/extension-trailing-node@1.0.0-next.55
  - @remirror/extension-underline@1.0.0-next.55
  - @remirror/extension-yjs@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - @remirror/preset-core@1.0.0-next.55
  - @remirror/preset-embed@1.0.0-next.55
  - @remirror/preset-list@1.0.0-next.55
  - @remirror/preset-react@1.0.0-next.55
  - @remirror/preset-social@1.0.0-next.55
  - @remirror/preset-table@1.0.0-next.55
  - @remirror/preset-wysiwyg@1.0.0-next.55
  - @remirror/react@1.0.0-next.55
  - @remirror/react-hooks@1.0.0-next.55
  - @remirror/react-social@1.0.0-next.55
  - @remirror/react-utils@1.0.0-next.55
  - @remirror/react-wysiwyg@1.0.0-next.55
  - @remirror/theme@1.0.0-next.55
  - @remirror/core-utils@1.0.0-next.55
  - @remirror/extension-mention-atom@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`d720bcd4`](https://github.com/remirror/remirror/commit/d720bcd43cd8589bbb2bcc7c12104229113f212a), [`1a0348e7`](https://github.com/remirror/remirror/commit/1a0348e795e1bef83ef31489e0aa3c256da9e434), [`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764), [`b1df359b`](https://github.com/remirror/remirror/commit/b1df359b32996212a4357fb78bb6a8d2929bcf4f), [`8a6d5c34`](https://github.com/remirror/remirror/commit/8a6d5c34778a5ac877876bd24d1a252851fb4882), [`e9d95fa4`](https://github.com/remirror/remirror/commit/e9d95fa4891b256d26432e63fbdbeeeabc63f764), [`1b5bf359`](https://github.com/remirror/remirror/commit/1b5bf35999898ab82c8868f25444edeee82486ad)]:
  - @remirror/extension-codemirror5@1.0.0-next.54
  - @remirror/core-utils@1.0.0-next.54
  - @remirror/core@1.0.0-next.54
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-helpers@1.0.0-next.54
  - @remirror/core-types@1.0.0-next.54
  - @remirror/dom@1.0.0-next.54
  - @remirror/extension-annotation@1.0.0-next.54
  - @remirror/extension-auto-link@1.0.0-next.54
  - @remirror/extension-bidi@1.0.0-next.54
  - @remirror/extension-blockquote@1.0.0-next.54
  - @remirror/extension-bold@1.0.0-next.54
  - @remirror/extension-callout@1.0.0-next.54
  - @remirror/extension-code@1.0.0-next.54
  - @remirror/extension-code-block@1.0.0-next.54
  - @remirror/extension-collaboration@1.0.0-next.54
  - @remirror/extension-diff@1.0.0-next.54
  - @remirror/extension-doc@1.0.0-next.54
  - @remirror/extension-drop-cursor@1.0.0-next.54
  - @remirror/extension-emoji@1.0.0-next.54
  - @remirror/extension-epic-mode@1.0.0-next.54
  - @remirror/extension-events@1.0.0-next.54
  - @remirror/extension-gap-cursor@1.0.0-next.54
  - @remirror/extension-hard-break@1.0.0-next.54
  - @remirror/extension-heading@1.0.0-next.54
  - @remirror/extension-history@1.0.0-next.54
  - @remirror/extension-horizontal-rule@1.0.0-next.54
  - @remirror/extension-image@1.0.0-next.54
  - @remirror/extension-italic@1.0.0-next.54
  - @remirror/extension-mention@1.0.0-next.54
  - @remirror/extension-paragraph@1.0.0-next.54
  - @remirror/extension-placeholder@1.0.0-next.54
  - @remirror/extension-positioner@1.0.0-next.54
  - @remirror/extension-react-component@1.0.0-next.54
  - @remirror/extension-react-ssr@1.0.0-next.54
  - @remirror/extension-search@1.0.0-next.54
  - @remirror/extension-strike@1.0.0-next.54
  - @remirror/extension-text@1.0.0-next.54
  - @remirror/extension-trailing-node@1.0.0-next.54
  - @remirror/extension-underline@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - @remirror/preset-core@1.0.0-next.54
  - @remirror/preset-embed@1.0.0-next.54
  - @remirror/preset-list@1.0.0-next.54
  - @remirror/preset-react@1.0.0-next.54
  - @remirror/preset-social@1.0.0-next.54
  - @remirror/preset-table@1.0.0-next.54
  - @remirror/preset-wysiwyg@1.0.0-next.54
  - @remirror/react@1.0.0-next.54
  - @remirror/react-hooks@1.0.0-next.54
  - @remirror/react-social@1.0.0-next.54
  - @remirror/react-utils@1.0.0-next.54
  - @remirror/react-wysiwyg@1.0.0-next.54
  - @remirror/theme@1.0.0-next.54
  - @remirror/extension-link@1.0.0-next.54
  - @remirror/extension-yjs@1.0.0-next.54
  - @remirror/extension-mention-atom@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655), [`5fd944c6`](https://github.com/remirror/remirror/commit/5fd944c64880ec3e7c60a954d22770ff1c613aee)]:
  - @remirror/core@1.0.0-next.53
  - @remirror/core-utils@1.0.0-next.53
  - @remirror/extension-auto-link@1.0.0-next.53
  - @remirror/extension-callout@1.0.0-next.53
  - @remirror/extension-image@1.0.0-next.53
  - @remirror/extension-link@1.0.0-next.53
  - @remirror/extension-mention-atom@1.0.0-next.53
  - @remirror/preset-embed@1.0.0-next.53
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-helpers@1.0.0-next.53
  - @remirror/core-types@1.0.0-next.53
  - @remirror/dom@1.0.0-next.53
  - @remirror/extension-annotation@1.0.0-next.53
  - @remirror/extension-bidi@1.0.0-next.53
  - @remirror/extension-blockquote@1.0.0-next.53
  - @remirror/extension-bold@1.0.0-next.53
  - @remirror/extension-code@1.0.0-next.53
  - @remirror/extension-code-block@1.0.0-next.53
  - @remirror/extension-collaboration@1.0.0-next.53
  - @remirror/extension-diff@1.0.0-next.53
  - @remirror/extension-doc@1.0.0-next.53
  - @remirror/extension-drop-cursor@1.0.0-next.53
  - @remirror/extension-emoji@1.0.0-next.53
  - @remirror/extension-epic-mode@1.0.0-next.53
  - @remirror/extension-events@1.0.0-next.53
  - @remirror/extension-gap-cursor@1.0.0-next.53
  - @remirror/extension-hard-break@1.0.0-next.53
  - @remirror/extension-heading@1.0.0-next.53
  - @remirror/extension-history@1.0.0-next.53
  - @remirror/extension-horizontal-rule@1.0.0-next.53
  - @remirror/extension-italic@1.0.0-next.53
  - @remirror/extension-mention@1.0.0-next.53
  - @remirror/extension-paragraph@1.0.0-next.53
  - @remirror/extension-placeholder@1.0.0-next.53
  - @remirror/extension-positioner@1.0.0-next.53
  - @remirror/extension-react-component@1.0.0-next.53
  - @remirror/extension-react-ssr@1.0.0-next.53
  - @remirror/extension-search@1.0.0-next.53
  - @remirror/extension-strike@1.0.0-next.53
  - @remirror/extension-text@1.0.0-next.53
  - @remirror/extension-trailing-node@1.0.0-next.53
  - @remirror/extension-underline@1.0.0-next.53
  - @remirror/extension-yjs@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - @remirror/preset-core@1.0.0-next.53
  - @remirror/preset-list@1.0.0-next.53
  - @remirror/preset-react@1.0.0-next.53
  - @remirror/preset-social@1.0.0-next.53
  - @remirror/preset-table@1.0.0-next.53
  - @remirror/preset-wysiwyg@1.0.0-next.53
  - @remirror/react@1.0.0-next.53
  - @remirror/react-hooks@1.0.0-next.53
  - @remirror/react-social@1.0.0-next.53
  - @remirror/react-utils@1.0.0-next.53
  - @remirror/react-wysiwyg@1.0.0-next.53
  - @remirror/theme@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Minor Changes

- [`bdaa6af7`](https://github.com/remirror/remirror/commit/bdaa6af7d4daf365bd13c491420ce3e04add571e) [#767](https://github.com/remirror/remirror/pull/767) Thanks [@whawker](https://github.com/whawker)! - 🎉 New extension `@remirror/extension-callout`

  This extension adds support for a new callout node.

  These can be used to add `info`, `warning`, `error` or `success` banners to your document.

  The default callout type is `info`, but this can be changed by using the `defaultType` option of `CalloutExtension`.

  ```ts
  import { RemirrorManager } from 'remirror/core';
  import { CalloutExtension } from 'remirror/extension/callout';
  import { CorePreset } from 'remirror/preset/core';

  // Create the callout extension
  const calloutExtension = new CalloutExtension();
  const corePreset = new CorePreset();

  // Create the Editor Manager with the callout extension passed through.
  const manager = RemirrorManager.create([calloutExtension, corePreset]);

  // Pass the dom element to the editor. If you are using `@remirror/react` or
  // other framework wrappers then this is handled for you.
  const element = document.createElement('div');
  document.body.append(element);

  // Add the view to the editor manager.
  manager.addView(element);

  // Wrap with an error callout at the current selection
  manager.store.commands.toggleCallout({ type: 'error' });
  ```

### Patch Changes

- Updated dependencies [[`3da2b5fd`](https://github.com/remirror/remirror/commit/3da2b5fd41e088c1d24969b53853a2b6f003455c), [`caf2588d`](https://github.com/remirror/remirror/commit/caf2588d52e939cf939773837938d54f54f999a6), [`bdaa6af7`](https://github.com/remirror/remirror/commit/bdaa6af7d4daf365bd13c491420ce3e04add571e)]:
  - @remirror/preset-embed@1.0.0-next.52
  - @remirror/extension-link@1.0.0-next.52
  - @remirror/core@1.0.0-next.52
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-helpers@1.0.0-next.52
  - @remirror/core-types@1.0.0-next.52
  - @remirror/core-utils@1.0.0-next.52
  - @remirror/dom@1.0.0-next.52
  - @remirror/extension-annotation@1.0.0-next.52
  - @remirror/extension-auto-link@1.0.0-next.52
  - @remirror/extension-bidi@1.0.0-next.52
  - @remirror/extension-blockquote@1.0.0-next.52
  - @remirror/extension-bold@1.0.0-next.52
  - @remirror/extension-code@1.0.0-next.52
  - @remirror/extension-code-block@1.0.0-next.52
  - @remirror/extension-collaboration@1.0.0-next.52
  - @remirror/extension-diff@1.0.0-next.52
  - @remirror/extension-doc@1.0.0-next.52
  - @remirror/extension-drop-cursor@1.0.0-next.52
  - @remirror/extension-emoji@1.0.0-next.52
  - @remirror/extension-epic-mode@1.0.0-next.52
  - @remirror/extension-events@1.0.0-next.52
  - @remirror/extension-gap-cursor@1.0.0-next.52
  - @remirror/extension-hard-break@1.0.0-next.52
  - @remirror/extension-heading@1.0.0-next.52
  - @remirror/extension-history@1.0.0-next.52
  - @remirror/extension-horizontal-rule@1.0.0-next.52
  - @remirror/extension-image@1.0.0-next.52
  - @remirror/extension-italic@1.0.0-next.52
  - @remirror/extension-mention@1.0.0-next.52
  - @remirror/extension-mention-atom@1.0.0-next.52
  - @remirror/extension-paragraph@1.0.0-next.52
  - @remirror/extension-placeholder@1.0.0-next.52
  - @remirror/extension-positioner@1.0.0-next.52
  - @remirror/extension-react-component@1.0.0-next.52
  - @remirror/extension-react-ssr@1.0.0-next.52
  - @remirror/extension-search@1.0.0-next.52
  - @remirror/extension-strike@1.0.0-next.52
  - @remirror/extension-text@1.0.0-next.52
  - @remirror/extension-trailing-node@1.0.0-next.52
  - @remirror/extension-underline@1.0.0-next.52
  - @remirror/extension-yjs@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - @remirror/preset-core@1.0.0-next.52
  - @remirror/preset-list@1.0.0-next.52
  - @remirror/preset-react@1.0.0-next.52
  - @remirror/preset-social@1.0.0-next.52
  - @remirror/preset-table@1.0.0-next.52
  - @remirror/preset-wysiwyg@1.0.0-next.52
  - @remirror/react@1.0.0-next.52
  - @remirror/react-hooks@1.0.0-next.52
  - @remirror/react-social@1.0.0-next.52
  - @remirror/react-utils@1.0.0-next.52
  - @remirror/react-wysiwyg@1.0.0-next.52
  - @remirror/theme@1.0.0-next.52
  - @remirror/extension-callout@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`b79e4142`](https://github.com/remirror/remirror/commit/b79e414219ffc4f8435b7b934bf503c2c3b128f5), [`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/extension-link@1.0.0-next.51
  - @remirror/core@1.0.0-next.51
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-helpers@1.0.0-next.51
  - @remirror/core-types@1.0.0-next.51
  - @remirror/core-utils@1.0.0-next.51
  - @remirror/dom@1.0.0-next.51
  - @remirror/extension-annotation@1.0.0-next.51
  - @remirror/extension-auto-link@1.0.0-next.51
  - @remirror/extension-bidi@1.0.0-next.51
  - @remirror/extension-blockquote@1.0.0-next.51
  - @remirror/extension-bold@1.0.0-next.51
  - @remirror/extension-code@1.0.0-next.51
  - @remirror/extension-code-block@1.0.0-next.51
  - @remirror/extension-collaboration@1.0.0-next.51
  - @remirror/extension-diff@1.0.0-next.51
  - @remirror/extension-doc@1.0.0-next.51
  - @remirror/extension-drop-cursor@1.0.0-next.51
  - @remirror/extension-epic-mode@1.0.0-next.51
  - @remirror/extension-events@1.0.0-next.51
  - @remirror/extension-gap-cursor@1.0.0-next.51
  - @remirror/extension-hard-break@1.0.0-next.51
  - @remirror/extension-heading@1.0.0-next.51
  - @remirror/extension-history@1.0.0-next.51
  - @remirror/extension-horizontal-rule@1.0.0-next.51
  - @remirror/extension-image@1.0.0-next.51
  - @remirror/extension-italic@1.0.0-next.51
  - @remirror/extension-mention@1.0.0-next.51
  - @remirror/extension-mention-atom@1.0.0-next.51
  - @remirror/extension-paragraph@1.0.0-next.51
  - @remirror/extension-placeholder@1.0.0-next.51
  - @remirror/extension-positioner@1.0.0-next.51
  - @remirror/extension-react-component@1.0.0-next.51
  - @remirror/extension-react-ssr@1.0.0-next.51
  - @remirror/extension-search@1.0.0-next.51
  - @remirror/extension-strike@1.0.0-next.51
  - @remirror/extension-text@1.0.0-next.51
  - @remirror/extension-trailing-node@1.0.0-next.51
  - @remirror/extension-underline@1.0.0-next.51
  - @remirror/extension-yjs@1.0.0-next.51
  - @remirror/preset-core@1.0.0-next.51
  - @remirror/preset-embed@1.0.0-next.51
  - @remirror/preset-list@1.0.0-next.51
  - @remirror/preset-react@1.0.0-next.51
  - @remirror/preset-social@1.0.0-next.51
  - @remirror/preset-table@1.0.0-next.51
  - @remirror/preset-wysiwyg@1.0.0-next.51
  - @remirror/react@1.0.0-next.51
  - @remirror/react-hooks@1.0.0-next.51
  - @remirror/react-social@1.0.0-next.51
  - @remirror/react-utils@1.0.0-next.51
  - @remirror/react-wysiwyg@1.0.0-next.51
  - @remirror/theme@1.0.0-next.51
  - @remirror/extension-emoji@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`359486f6`](https://github.com/remirror/remirror/commit/359486f6a7383588de16e6bd34c94545d3350f90), [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24)]:
  - @remirror/extension-link@1.0.0-next.50
  - @remirror/preset-wysiwyg@1.0.0-next.50
  - @remirror/core@1.0.0-next.50
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-helpers@1.0.0-next.50
  - @remirror/core-types@1.0.0-next.50
  - @remirror/core-utils@1.0.0-next.50
  - @remirror/dom@1.0.0-next.50
  - @remirror/extension-annotation@1.0.0-next.50
  - @remirror/extension-auto-link@1.0.0-next.50
  - @remirror/extension-bidi@1.0.0-next.50
  - @remirror/extension-blockquote@1.0.0-next.50
  - @remirror/extension-bold@1.0.0-next.50
  - @remirror/extension-code@1.0.0-next.50
  - @remirror/extension-code-block@1.0.0-next.50
  - @remirror/extension-collaboration@1.0.0-next.50
  - @remirror/extension-diff@1.0.0-next.50
  - @remirror/extension-doc@1.0.0-next.50
  - @remirror/extension-drop-cursor@1.0.0-next.50
  - @remirror/extension-emoji@1.0.0-next.50
  - @remirror/extension-epic-mode@1.0.0-next.50
  - @remirror/extension-events@1.0.0-next.50
  - @remirror/extension-gap-cursor@1.0.0-next.50
  - @remirror/extension-hard-break@1.0.0-next.50
  - @remirror/extension-heading@1.0.0-next.50
  - @remirror/extension-history@1.0.0-next.50
  - @remirror/extension-horizontal-rule@1.0.0-next.50
  - @remirror/extension-image@1.0.0-next.50
  - @remirror/extension-italic@1.0.0-next.50
  - @remirror/extension-mention@1.0.0-next.50
  - @remirror/extension-mention-atom@1.0.0-next.50
  - @remirror/extension-paragraph@1.0.0-next.50
  - @remirror/extension-placeholder@1.0.0-next.50
  - @remirror/extension-positioner@1.0.0-next.50
  - @remirror/extension-react-component@1.0.0-next.50
  - @remirror/extension-react-ssr@1.0.0-next.50
  - @remirror/extension-search@1.0.0-next.50
  - @remirror/extension-strike@1.0.0-next.50
  - @remirror/extension-text@1.0.0-next.50
  - @remirror/extension-trailing-node@1.0.0-next.50
  - @remirror/extension-underline@1.0.0-next.50
  - @remirror/extension-yjs@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - @remirror/preset-core@1.0.0-next.50
  - @remirror/preset-embed@1.0.0-next.50
  - @remirror/preset-list@1.0.0-next.50
  - @remirror/preset-react@1.0.0-next.50
  - @remirror/preset-social@1.0.0-next.50
  - @remirror/preset-table@1.0.0-next.50
  - @remirror/react@1.0.0-next.50
  - @remirror/react-hooks@1.0.0-next.50
  - @remirror/react-social@1.0.0-next.50
  - @remirror/react-utils@1.0.0-next.50
  - @remirror/react-wysiwyg@1.0.0-next.50
  - @remirror/theme@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`cd91b689`](https://github.com/remirror/remirror/commit/cd91b6893e9f0609d95e4945075d98eb3fe53b76), [`049134a3`](https://github.com/remirror/remirror/commit/049134a3d8e99c3b56243579a59e5a316e07444d)]:
  - @remirror/react-hooks@1.0.0-next.49
  - @remirror/core@1.0.0-next.49
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-helpers@1.0.0-next.49
  - @remirror/core-types@1.0.0-next.49
  - @remirror/core-utils@1.0.0-next.49
  - @remirror/dom@1.0.0-next.49
  - @remirror/extension-annotation@1.0.0-next.49
  - @remirror/extension-auto-link@1.0.0-next.49
  - @remirror/extension-bidi@1.0.0-next.49
  - @remirror/extension-blockquote@1.0.0-next.49
  - @remirror/extension-bold@1.0.0-next.49
  - @remirror/extension-code@1.0.0-next.49
  - @remirror/extension-code-block@1.0.0-next.49
  - @remirror/extension-collaboration@1.0.0-next.49
  - @remirror/extension-diff@1.0.0-next.49
  - @remirror/extension-doc@1.0.0-next.49
  - @remirror/extension-drop-cursor@1.0.0-next.49
  - @remirror/extension-emoji@1.0.0-next.49
  - @remirror/extension-epic-mode@1.0.0-next.49
  - @remirror/extension-events@1.0.0-next.49
  - @remirror/extension-gap-cursor@1.0.0-next.49
  - @remirror/extension-hard-break@1.0.0-next.49
  - @remirror/extension-heading@1.0.0-next.49
  - @remirror/extension-history@1.0.0-next.49
  - @remirror/extension-horizontal-rule@1.0.0-next.49
  - @remirror/extension-image@1.0.0-next.49
  - @remirror/extension-italic@1.0.0-next.49
  - @remirror/extension-link@1.0.0-next.49
  - @remirror/extension-mention@1.0.0-next.49
  - @remirror/extension-mention-atom@1.0.0-next.49
  - @remirror/extension-paragraph@1.0.0-next.49
  - @remirror/extension-placeholder@1.0.0-next.49
  - @remirror/extension-positioner@1.0.0-next.49
  - @remirror/extension-react-component@1.0.0-next.49
  - @remirror/extension-react-ssr@1.0.0-next.49
  - @remirror/extension-search@1.0.0-next.49
  - @remirror/extension-strike@1.0.0-next.49
  - @remirror/extension-text@1.0.0-next.49
  - @remirror/extension-trailing-node@1.0.0-next.49
  - @remirror/extension-underline@1.0.0-next.49
  - @remirror/extension-yjs@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - @remirror/preset-core@1.0.0-next.49
  - @remirror/preset-embed@1.0.0-next.49
  - @remirror/preset-list@1.0.0-next.49
  - @remirror/preset-react@1.0.0-next.49
  - @remirror/preset-social@1.0.0-next.49
  - @remirror/preset-table@1.0.0-next.49
  - @remirror/preset-wysiwyg@1.0.0-next.49
  - @remirror/react@1.0.0-next.49
  - @remirror/react-social@1.0.0-next.49
  - @remirror/react-utils@1.0.0-next.49
  - @remirror/react-wysiwyg@1.0.0-next.49
  - @remirror/theme@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e), [`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core@1.0.0-next.48
  - @remirror/core-utils@1.0.0-next.48
  - @remirror/dom@1.0.0-next.48
  - @remirror/extension-annotation@1.0.0-next.48
  - @remirror/extension-auto-link@1.0.0-next.48
  - @remirror/extension-bidi@1.0.0-next.48
  - @remirror/extension-blockquote@1.0.0-next.48
  - @remirror/extension-bold@1.0.0-next.48
  - @remirror/extension-code@1.0.0-next.48
  - @remirror/extension-code-block@1.0.0-next.48
  - @remirror/extension-collaboration@1.0.0-next.48
  - @remirror/extension-diff@1.0.0-next.48
  - @remirror/extension-doc@1.0.0-next.48
  - @remirror/extension-drop-cursor@1.0.0-next.48
  - @remirror/extension-emoji@1.0.0-next.48
  - @remirror/extension-epic-mode@1.0.0-next.48
  - @remirror/extension-events@1.0.0-next.48
  - @remirror/extension-gap-cursor@1.0.0-next.48
  - @remirror/extension-hard-break@1.0.0-next.48
  - @remirror/extension-heading@1.0.0-next.48
  - @remirror/extension-history@1.0.0-next.48
  - @remirror/extension-horizontal-rule@1.0.0-next.48
  - @remirror/extension-image@1.0.0-next.48
  - @remirror/extension-italic@1.0.0-next.48
  - @remirror/extension-link@1.0.0-next.48
  - @remirror/extension-mention@1.0.0-next.48
  - @remirror/extension-mention-atom@1.0.0-next.48
  - @remirror/extension-paragraph@1.0.0-next.48
  - @remirror/extension-placeholder@1.0.0-next.48
  - @remirror/extension-positioner@1.0.0-next.48
  - @remirror/extension-react-component@1.0.0-next.48
  - @remirror/extension-react-ssr@1.0.0-next.48
  - @remirror/extension-search@1.0.0-next.48
  - @remirror/extension-strike@1.0.0-next.48
  - @remirror/extension-text@1.0.0-next.48
  - @remirror/extension-trailing-node@1.0.0-next.48
  - @remirror/extension-underline@1.0.0-next.48
  - @remirror/extension-yjs@1.0.0-next.48
  - @remirror/preset-core@1.0.0-next.48
  - @remirror/preset-embed@1.0.0-next.48
  - @remirror/preset-list@1.0.0-next.48
  - @remirror/preset-react@1.0.0-next.48
  - @remirror/preset-social@1.0.0-next.48
  - @remirror/preset-table@1.0.0-next.48
  - @remirror/preset-wysiwyg@1.0.0-next.48
  - @remirror/react@1.0.0-next.48
  - @remirror/react-hooks@1.0.0-next.48
  - @remirror/react-social@1.0.0-next.48
  - @remirror/react-wysiwyg@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e), [`911cc6d8`](https://github.com/remirror/remirror/commit/911cc6d85f7668cecdfd7e252e9431c1ae2ae845), [`56349ca5`](https://github.com/remirror/remirror/commit/56349ca5f638b90b743f7f008fbf190fa0ab1e12), [`c0867ced`](https://github.com/remirror/remirror/commit/c0867ced744d69c92e7ddef63ac9b11cc6e79846)]:
  - @remirror/core@1.0.0-next.47
  - @remirror/core-helpers@1.0.0-next.47
  - @remirror/core-types@1.0.0-next.47
  - @remirror/core-utils@1.0.0-next.47
  - @remirror/dom@1.0.0-next.47
  - @remirror/extension-code-block@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - @remirror/preset-social@1.0.0-next.47
  - @remirror/react@1.0.0-next.47
  - @remirror/react-hooks@1.0.0-next.47
  - @remirror/react-social@1.0.0-next.47
  - @remirror/react-wysiwyg@1.0.0-next.47
  - @remirror/theme@1.0.0-next.47
  - @remirror/extension-yjs@1.0.0-next.47
  - @remirror/extension-positioner@1.0.0-next.47
  - @remirror/extension-annotation@1.0.0-next.47
  - @remirror/extension-auto-link@1.0.0-next.47
  - @remirror/extension-bidi@1.0.0-next.47
  - @remirror/extension-blockquote@1.0.0-next.47
  - @remirror/extension-bold@1.0.0-next.47
  - @remirror/extension-code@1.0.0-next.47
  - @remirror/extension-collaboration@1.0.0-next.47
  - @remirror/extension-diff@1.0.0-next.47
  - @remirror/extension-doc@1.0.0-next.47
  - @remirror/extension-drop-cursor@1.0.0-next.47
  - @remirror/extension-emoji@1.0.0-next.47
  - @remirror/extension-epic-mode@1.0.0-next.47
  - @remirror/extension-events@1.0.0-next.47
  - @remirror/extension-gap-cursor@1.0.0-next.47
  - @remirror/extension-hard-break@1.0.0-next.47
  - @remirror/extension-heading@1.0.0-next.47
  - @remirror/extension-history@1.0.0-next.47
  - @remirror/extension-horizontal-rule@1.0.0-next.47
  - @remirror/extension-image@1.0.0-next.47
  - @remirror/extension-italic@1.0.0-next.47
  - @remirror/extension-link@1.0.0-next.47
  - @remirror/extension-mention@1.0.0-next.47
  - @remirror/extension-mention-atom@1.0.0-next.47
  - @remirror/extension-paragraph@1.0.0-next.47
  - @remirror/extension-placeholder@1.0.0-next.47
  - @remirror/extension-react-component@1.0.0-next.47
  - @remirror/extension-react-ssr@1.0.0-next.47
  - @remirror/extension-search@1.0.0-next.47
  - @remirror/extension-strike@1.0.0-next.47
  - @remirror/extension-text@1.0.0-next.47
  - @remirror/extension-trailing-node@1.0.0-next.47
  - @remirror/extension-underline@1.0.0-next.47
  - @remirror/preset-core@1.0.0-next.47
  - @remirror/preset-embed@1.0.0-next.47
  - @remirror/preset-list@1.0.0-next.47
  - @remirror/preset-react@1.0.0-next.47
  - @remirror/preset-table@1.0.0-next.47
  - @remirror/preset-wysiwyg@1.0.0-next.47
  - @remirror/react-utils@1.0.0-next.47

## 1.0.0-next.46

> 2020-10-06

### Patch Changes

- Updated dependencies [[`73e81b43`](https://github.com/remirror/remirror/commit/73e81b43aa2bd685ad12bfe94942ef16c1c0a006)]:
  - @remirror/extension-annotation@1.0.0-next.46

## 1.0.0-next.45

> 2020-10-01

### Patch Changes

- Updated dependencies [[`2175be1d`](https://github.com/remirror/remirror/commit/2175be1d4b3fb1d4d1ec7edd8f6054e4e1873fc0)]:
  - @remirror/core@1.0.0-next.45
  - @remirror/dom@1.0.0-next.45
  - @remirror/extension-annotation@1.0.0-next.45
  - @remirror/extension-auto-link@1.0.0-next.45
  - @remirror/extension-bidi@1.0.0-next.45
  - @remirror/extension-blockquote@1.0.0-next.45
  - @remirror/extension-bold@1.0.0-next.45
  - @remirror/extension-code@1.0.0-next.45
  - @remirror/extension-code-block@1.0.0-next.45
  - @remirror/extension-collaboration@1.0.0-next.45
  - @remirror/extension-diff@1.0.0-next.45
  - @remirror/extension-doc@1.0.0-next.45
  - @remirror/extension-drop-cursor@1.0.0-next.45
  - @remirror/extension-emoji@1.0.0-next.45
  - @remirror/extension-epic-mode@1.0.0-next.45
  - @remirror/extension-events@1.0.0-next.45
  - @remirror/extension-gap-cursor@1.0.0-next.45
  - @remirror/extension-hard-break@1.0.0-next.45
  - @remirror/extension-heading@1.0.0-next.45
  - @remirror/extension-history@1.0.0-next.45
  - @remirror/extension-horizontal-rule@1.0.0-next.45
  - @remirror/extension-image@1.0.0-next.45
  - @remirror/extension-italic@1.0.0-next.45
  - @remirror/extension-link@1.0.0-next.45
  - @remirror/extension-mention@1.0.0-next.45
  - @remirror/extension-mention-atom@1.0.0-next.45
  - @remirror/extension-paragraph@1.0.0-next.45
  - @remirror/extension-placeholder@1.0.0-next.45
  - @remirror/extension-positioner@1.0.0-next.45
  - @remirror/extension-react-component@1.0.0-next.45
  - @remirror/extension-react-ssr@1.0.0-next.45
  - @remirror/extension-search@1.0.0-next.45
  - @remirror/extension-strike@1.0.0-next.45
  - @remirror/extension-text@1.0.0-next.45
  - @remirror/extension-trailing-node@1.0.0-next.45
  - @remirror/extension-underline@1.0.0-next.45
  - @remirror/extension-yjs@1.0.0-next.45
  - @remirror/preset-core@1.0.0-next.45
  - @remirror/preset-embed@1.0.0-next.45
  - @remirror/preset-list@1.0.0-next.45
  - @remirror/preset-react@1.0.0-next.45
  - @remirror/preset-social@1.0.0-next.45
  - @remirror/preset-table@1.0.0-next.45
  - @remirror/preset-wysiwyg@1.0.0-next.45
  - @remirror/react@1.0.0-next.45
  - @remirror/react-hooks@1.0.0-next.45
  - @remirror/react-social@1.0.0-next.45
  - @remirror/react-wysiwyg@1.0.0-next.45

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`60776b1f`](https://github.com/remirror/remirror/commit/60776b1fc683408480a5e9502d104f79146a7977), [`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/extension-events@1.0.0-next.44
  - @remirror/extension-yjs@1.0.0-next.44
  - @remirror/pm@1.0.0-next.44
  - @remirror/preset-core@1.0.0-next.44
  - @remirror/react-hooks@1.0.0-next.44
  - @remirror/react-social@1.0.0-next.44
  - @remirror/core@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-utils@1.0.0-next.44
  - @remirror/dom@1.0.0-next.44
  - @remirror/extension-annotation@1.0.0-next.44
  - @remirror/extension-auto-link@1.0.0-next.44
  - @remirror/extension-bidi@1.0.0-next.44
  - @remirror/extension-blockquote@1.0.0-next.44
  - @remirror/extension-bold@1.0.0-next.44
  - @remirror/extension-code@1.0.0-next.44
  - @remirror/extension-code-block@1.0.0-next.44
  - @remirror/extension-collaboration@1.0.0-next.44
  - @remirror/extension-diff@1.0.0-next.44
  - @remirror/extension-doc@1.0.0-next.44
  - @remirror/extension-drop-cursor@1.0.0-next.44
  - @remirror/extension-emoji@1.0.0-next.44
  - @remirror/extension-epic-mode@1.0.0-next.44
  - @remirror/extension-gap-cursor@1.0.0-next.44
  - @remirror/extension-hard-break@1.0.0-next.44
  - @remirror/extension-heading@1.0.0-next.44
  - @remirror/extension-history@1.0.0-next.44
  - @remirror/extension-horizontal-rule@1.0.0-next.44
  - @remirror/extension-image@1.0.0-next.44
  - @remirror/extension-italic@1.0.0-next.44
  - @remirror/extension-link@1.0.0-next.44
  - @remirror/extension-mention@1.0.0-next.44
  - @remirror/extension-mention-atom@1.0.0-next.44
  - @remirror/extension-paragraph@1.0.0-next.44
  - @remirror/extension-placeholder@1.0.0-next.44
  - @remirror/extension-positioner@1.0.0-next.44
  - @remirror/extension-react-component@1.0.0-next.44
  - @remirror/extension-react-ssr@1.0.0-next.44
  - @remirror/extension-search@1.0.0-next.44
  - @remirror/extension-strike@1.0.0-next.44
  - @remirror/extension-text@1.0.0-next.44
  - @remirror/extension-trailing-node@1.0.0-next.44
  - @remirror/extension-underline@1.0.0-next.44
  - @remirror/preset-embed@1.0.0-next.44
  - @remirror/preset-list@1.0.0-next.44
  - @remirror/preset-react@1.0.0-next.44
  - @remirror/preset-social@1.0.0-next.44
  - @remirror/preset-table@1.0.0-next.44
  - @remirror/preset-wysiwyg@1.0.0-next.44
  - @remirror/react@1.0.0-next.44
  - @remirror/react-wysiwyg@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44
  - @remirror/react-utils@1.0.0-next.44
  - @remirror/theme@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies [[`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`a02dd7d1`](https://github.com/remirror/remirror/commit/a02dd7d1c02b2eec2946d4300c3ef90ec0ff79db), [`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`b674f906`](https://github.com/remirror/remirror/commit/b674f906815776d9c07b608a7de8cbaa9554a3a1), [`bdea98bf`](https://github.com/remirror/remirror/commit/bdea98bf230d2be59ab3caef8b3cc35273883691), [`b030cb6e`](https://github.com/remirror/remirror/commit/b030cb6e50cb6fdc045a4680f4861ad145609197)]:
  - @remirror/extension-image@1.0.0-next.43
  - @remirror/extension-annotation@1.0.0-next.43
  - @remirror/extension-code-block@1.0.0-next.43
  - @remirror/core-utils@1.0.0-next.43
  - @remirror/preset-wysiwyg@1.0.0-next.43
  - @remirror/core@1.0.0-next.43
  - @remirror/react-wysiwyg@1.0.0-next.43
  - @remirror/dom@1.0.0-next.43
  - @remirror/extension-auto-link@1.0.0-next.43
  - @remirror/extension-bidi@1.0.0-next.43
  - @remirror/extension-blockquote@1.0.0-next.43
  - @remirror/extension-bold@1.0.0-next.43
  - @remirror/extension-code@1.0.0-next.43
  - @remirror/extension-collaboration@1.0.0-next.43
  - @remirror/extension-diff@1.0.0-next.43
  - @remirror/extension-doc@1.0.0-next.43
  - @remirror/extension-drop-cursor@1.0.0-next.43
  - @remirror/extension-emoji@1.0.0-next.43
  - @remirror/extension-epic-mode@1.0.0-next.43
  - @remirror/extension-events@1.0.0-next.43
  - @remirror/extension-gap-cursor@1.0.0-next.43
  - @remirror/extension-hard-break@1.0.0-next.43
  - @remirror/extension-heading@1.0.0-next.43
  - @remirror/extension-history@1.0.0-next.43
  - @remirror/extension-horizontal-rule@1.0.0-next.43
  - @remirror/extension-italic@1.0.0-next.43
  - @remirror/extension-link@1.0.0-next.43
  - @remirror/extension-mention@1.0.0-next.43
  - @remirror/extension-mention-atom@1.0.0-next.43
  - @remirror/extension-paragraph@1.0.0-next.43
  - @remirror/extension-placeholder@1.0.0-next.43
  - @remirror/extension-positioner@1.0.0-next.43
  - @remirror/extension-react-component@1.0.0-next.43
  - @remirror/extension-react-ssr@1.0.0-next.43
  - @remirror/extension-search@1.0.0-next.43
  - @remirror/extension-strike@1.0.0-next.43
  - @remirror/extension-text@1.0.0-next.43
  - @remirror/extension-trailing-node@1.0.0-next.43
  - @remirror/extension-underline@1.0.0-next.43
  - @remirror/extension-yjs@1.0.0-next.43
  - @remirror/preset-core@1.0.0-next.43
  - @remirror/preset-embed@1.0.0-next.43
  - @remirror/preset-list@1.0.0-next.43
  - @remirror/preset-react@1.0.0-next.43
  - @remirror/preset-social@1.0.0-next.43
  - @remirror/preset-table@1.0.0-next.43
  - @remirror/react@1.0.0-next.43
  - @remirror/react-hooks@1.0.0-next.43
  - @remirror/react-social@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies [[`ef1f57c2`](https://github.com/remirror/remirror/commit/ef1f57c2b055d00ca910a0e5aa2e282875f6dde5), [`44754a5d`](https://github.com/remirror/remirror/commit/44754a5de1354ab45d2be16fb02aa2fd017319c1), [`802d5f04`](https://github.com/remirror/remirror/commit/802d5f042ea64974f6db5dc52006f858fa5e3e28), [`6f2ababd`](https://github.com/remirror/remirror/commit/6f2ababd44dbfdf4b1f7248457d8d481c33a5d13), [`9fa07878`](https://github.com/remirror/remirror/commit/9fa078780504bff81d28183ee8cda3b599412cf0), [`d33f43bf`](https://github.com/remirror/remirror/commit/d33f43bfcb8d7f578f05434b42c938b4132b544a)]:
  - @remirror/extension-annotation@1.0.0-next.42
  - @remirror/extension-code-block@1.0.0-next.42
  - @remirror/core-utils@1.0.0-next.42
  - @remirror/extension-diff@1.0.0-next.42
  - @remirror/extension-heading@1.0.0-next.42
  - @remirror/extension-mention@1.0.0-next.42
  - @remirror/extension-mention-atom@1.0.0-next.42
  - @remirror/extension-collaboration@1.0.0-next.42
  - @remirror/extension-emoji@1.0.0-next.42
  - @remirror/extension-search@1.0.0-next.42
  - @remirror/extension-strike@1.0.0-next.42
  - @remirror/preset-embed@1.0.0-next.42
  - @remirror/preset-list@1.0.0-next.42
  - @remirror/react-social@1.0.0-next.42
  - @remirror/react-wysiwyg@1.0.0-next.42
  - @remirror/preset-wysiwyg@1.0.0-next.42
  - @remirror/core@1.0.0-next.42
  - @remirror/preset-social@1.0.0-next.42
  - @remirror/react-hooks@1.0.0-next.42
  - @remirror/dom@1.0.0-next.42
  - @remirror/extension-auto-link@1.0.0-next.42
  - @remirror/extension-bidi@1.0.0-next.42
  - @remirror/extension-blockquote@1.0.0-next.42
  - @remirror/extension-bold@1.0.0-next.42
  - @remirror/extension-code@1.0.0-next.42
  - @remirror/extension-doc@1.0.0-next.42
  - @remirror/extension-drop-cursor@1.0.0-next.42
  - @remirror/extension-epic-mode@1.0.0-next.42
  - @remirror/extension-events@1.0.0-next.42
  - @remirror/extension-gap-cursor@1.0.0-next.42
  - @remirror/extension-hard-break@1.0.0-next.42
  - @remirror/extension-history@1.0.0-next.42
  - @remirror/extension-horizontal-rule@1.0.0-next.42
  - @remirror/extension-image@1.0.0-next.42
  - @remirror/extension-italic@1.0.0-next.42
  - @remirror/extension-link@1.0.0-next.42
  - @remirror/extension-paragraph@1.0.0-next.42
  - @remirror/extension-placeholder@1.0.0-next.42
  - @remirror/extension-positioner@1.0.0-next.42
  - @remirror/extension-react-component@1.0.0-next.42
  - @remirror/extension-react-ssr@1.0.0-next.42
  - @remirror/extension-text@1.0.0-next.42
  - @remirror/extension-trailing-node@1.0.0-next.42
  - @remirror/extension-underline@1.0.0-next.42
  - @remirror/extension-yjs@1.0.0-next.42
  - @remirror/preset-core@1.0.0-next.42
  - @remirror/preset-react@1.0.0-next.42
  - @remirror/preset-table@1.0.0-next.42
  - @remirror/react@1.0.0-next.42

## 1.0.0-next.41

> 2020-09-26

### Patch Changes

- Updated dependencies [[`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9), [`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2), [`6644a391`](https://github.com/remirror/remirror/commit/6644a3912a2c168a0d29db617271ec8407ba0f4f)]:
  - @remirror/core@1.0.0-next.41
  - @remirror/react@1.0.0-next.41
  - @remirror/extension-annotation@1.0.0-next.41
  - @remirror/dom@1.0.0-next.41
  - @remirror/extension-auto-link@1.0.0-next.41
  - @remirror/extension-bidi@1.0.0-next.41
  - @remirror/extension-blockquote@1.0.0-next.41
  - @remirror/extension-bold@1.0.0-next.41
  - @remirror/extension-code@1.0.0-next.41
  - @remirror/extension-code-block@1.0.0-next.41
  - @remirror/extension-collaboration@1.0.0-next.41
  - @remirror/extension-diff@1.0.0-next.41
  - @remirror/extension-doc@1.0.0-next.41
  - @remirror/extension-drop-cursor@1.0.0-next.41
  - @remirror/extension-emoji@1.0.0-next.41
  - @remirror/extension-epic-mode@1.0.0-next.41
  - @remirror/extension-events@1.0.0-next.41
  - @remirror/extension-gap-cursor@1.0.0-next.41
  - @remirror/extension-hard-break@1.0.0-next.41
  - @remirror/extension-heading@1.0.0-next.41
  - @remirror/extension-history@1.0.0-next.41
  - @remirror/extension-horizontal-rule@1.0.0-next.41
  - @remirror/extension-image@1.0.0-next.41
  - @remirror/extension-italic@1.0.0-next.41
  - @remirror/extension-link@1.0.0-next.41
  - @remirror/extension-mention@1.0.0-next.41
  - @remirror/extension-mention-atom@1.0.0-next.41
  - @remirror/extension-paragraph@1.0.0-next.41
  - @remirror/extension-placeholder@1.0.0-next.41
  - @remirror/extension-positioner@1.0.0-next.41
  - @remirror/extension-react-component@1.0.0-next.41
  - @remirror/extension-react-ssr@1.0.0-next.41
  - @remirror/extension-search@1.0.0-next.41
  - @remirror/extension-strike@1.0.0-next.41
  - @remirror/extension-text@1.0.0-next.41
  - @remirror/extension-trailing-node@1.0.0-next.41
  - @remirror/extension-underline@1.0.0-next.41
  - @remirror/extension-yjs@1.0.0-next.41
  - @remirror/preset-core@1.0.0-next.41
  - @remirror/preset-embed@1.0.0-next.41
  - @remirror/preset-list@1.0.0-next.41
  - @remirror/preset-react@1.0.0-next.41
  - @remirror/preset-social@1.0.0-next.41
  - @remirror/preset-table@1.0.0-next.41
  - @remirror/preset-wysiwyg@1.0.0-next.41
  - @remirror/react-hooks@1.0.0-next.41
  - @remirror/react-social@1.0.0-next.41
  - @remirror/react-wysiwyg@1.0.0-next.41

## 1.0.0-next.40

> 2020-09-24

### Major Changes

- [`227657ae`](https://github.com/remirror/remirror/commit/227657ae1e30b0aca4c91450b2fab2b8772e5570) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING:** 💥 Remove `@remirror/position-tracker` extension from the repository and remove `remirror/extension/position-tracker` as a potential import.

### Patch Changes

- [`07aab2e8`](https://github.com/remirror/remirror/commit/07aab2e85f79eab332a3f561274e97d9746be65d) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Improve style output and fix CSS output issues.

- Updated dependencies [[`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef), [`89bd1e86`](https://github.com/remirror/remirror/commit/89bd1e86e56c60ffbd94a7f5e75adca438d75555), [`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e), [`1808a9e9`](https://github.com/remirror/remirror/commit/1808a9e9607f7b4951210dbde2c5d5367497cdcb), [`643555cc`](https://github.com/remirror/remirror/commit/643555cc7ba22ee0a8ba3cb1333ea488830fce30)]:
  - @remirror/core@1.0.0-next.40
  - @remirror/react@1.0.0-next.40
  - @remirror/core-utils@1.0.0-next.40
  - @remirror/extension-annotation@1.0.0-next.40
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/react-social@1.0.0-next.40
  - @remirror/dom@1.0.0-next.40
  - @remirror/extension-auto-link@1.0.0-next.40
  - @remirror/extension-bidi@1.0.0-next.40
  - @remirror/extension-blockquote@1.0.0-next.40
  - @remirror/extension-bold@1.0.0-next.40
  - @remirror/extension-code@1.0.0-next.40
  - @remirror/extension-code-block@1.0.0-next.40
  - @remirror/extension-collaboration@1.0.0-next.40
  - @remirror/extension-diff@1.0.0-next.40
  - @remirror/extension-doc@1.0.0-next.40
  - @remirror/extension-drop-cursor@1.0.0-next.40
  - @remirror/extension-emoji@1.0.0-next.40
  - @remirror/extension-epic-mode@1.0.0-next.40
  - @remirror/extension-events@1.0.0-next.40
  - @remirror/extension-gap-cursor@1.0.0-next.40
  - @remirror/extension-hard-break@1.0.0-next.40
  - @remirror/extension-heading@1.0.0-next.40
  - @remirror/extension-history@1.0.0-next.40
  - @remirror/extension-horizontal-rule@1.0.0-next.40
  - @remirror/extension-image@1.0.0-next.40
  - @remirror/extension-italic@1.0.0-next.40
  - @remirror/extension-link@1.0.0-next.40
  - @remirror/extension-mention@1.0.0-next.40
  - @remirror/extension-mention-atom@1.0.0-next.40
  - @remirror/extension-paragraph@1.0.0-next.40
  - @remirror/extension-placeholder@1.0.0-next.40
  - @remirror/extension-positioner@1.0.0-next.40
  - @remirror/extension-react-component@1.0.0-next.40
  - @remirror/extension-react-ssr@1.0.0-next.40
  - @remirror/extension-search@1.0.0-next.40
  - @remirror/extension-strike@1.0.0-next.40
  - @remirror/extension-text@1.0.0-next.40
  - @remirror/extension-trailing-node@1.0.0-next.40
  - @remirror/extension-underline@1.0.0-next.40
  - @remirror/extension-yjs@1.0.0-next.40
  - @remirror/preset-core@1.0.0-next.40
  - @remirror/preset-embed@1.0.0-next.40
  - @remirror/preset-list@1.0.0-next.40
  - @remirror/preset-react@1.0.0-next.40
  - @remirror/preset-social@1.0.0-next.40
  - @remirror/preset-table@1.0.0-next.40
  - @remirror/preset-wysiwyg@1.0.0-next.40
  - @remirror/react-hooks@1.0.0-next.40
  - @remirror/react-wysiwyg@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40
  - @remirror/react-utils@1.0.0-next.40
  - @remirror/theme@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-utils@1.0.0-next.39
  - @remirror/dom@1.0.0-next.39
  - @remirror/extension-annotation@1.0.0-next.39
  - @remirror/extension-auto-link@1.0.0-next.39
  - @remirror/extension-bidi@1.0.0-next.39
  - @remirror/extension-blockquote@1.0.0-next.39
  - @remirror/extension-bold@1.0.0-next.39
  - @remirror/extension-code@1.0.0-next.39
  - @remirror/extension-code-block@1.0.0-next.39
  - @remirror/extension-collaboration@1.0.0-next.39
  - @remirror/extension-diff@1.0.0-next.39
  - @remirror/extension-doc@1.0.0-next.39
  - @remirror/extension-drop-cursor@1.0.0-next.39
  - @remirror/extension-emoji@1.0.0-next.39
  - @remirror/extension-epic-mode@1.0.0-next.39
  - @remirror/extension-events@1.0.0-next.39
  - @remirror/extension-gap-cursor@1.0.0-next.39
  - @remirror/extension-hard-break@1.0.0-next.39
  - @remirror/extension-heading@1.0.0-next.39
  - @remirror/extension-history@1.0.0-next.39
  - @remirror/extension-horizontal-rule@1.0.0-next.39
  - @remirror/extension-image@1.0.0-next.39
  - @remirror/extension-italic@1.0.0-next.39
  - @remirror/extension-link@1.0.0-next.39
  - @remirror/extension-mention@1.0.0-next.39
  - @remirror/extension-mention-atom@1.0.0-next.39
  - @remirror/extension-paragraph@1.0.0-next.39
  - @remirror/extension-placeholder@1.0.0-next.39
  - @remirror/extension-position-tracker@1.0.0-next.39
  - @remirror/extension-positioner@1.0.0-next.39
  - @remirror/extension-react-component@1.0.0-next.39
  - @remirror/extension-react-ssr@1.0.0-next.39
  - @remirror/extension-search@1.0.0-next.39
  - @remirror/extension-strike@1.0.0-next.39
  - @remirror/extension-text@1.0.0-next.39
  - @remirror/extension-trailing-node@1.0.0-next.39
  - @remirror/extension-underline@1.0.0-next.39
  - @remirror/extension-yjs@1.0.0-next.39
  - @remirror/preset-core@1.0.0-next.39
  - @remirror/extension-embed@1.0.0-next.39
  - @remirror/extension-list@1.0.0-next.39
  - @remirror/preset-react@1.0.0-next.39
  - @remirror/preset-social@1.0.0-next.39
  - @remirror/preset-table@1.0.0-next.39
  - @remirror/preset-wysiwyg@1.0.0-next.39
  - @remirror/react@1.0.0-next.39
  - @remirror/react-hooks@1.0.0-next.39
  - @remirror/react-social@1.0.0-next.39
  - @remirror/react-wysiwyg@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39
  - @remirror/react-utils@1.0.0-next.39
  - @remirror/theme@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671), [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295), [`8cd47216`](https://github.com/remirror/remirror/commit/8cd472168967d95959740ae7b04a51815fa866c8), [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a), [`54ae06d4`](https://github.com/remirror/remirror/commit/54ae06d488cf127116b5be75e93261f23c4fb4a2)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core@1.0.0-next.38
  - @remirror/dom@1.0.0-next.38
  - @remirror/react@1.0.0-next.38
  - @remirror/react-utils@1.0.0-next.38
  - @remirror/react-social@1.0.0-next.38
  - @remirror/react-wysiwyg@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38
  - @remirror/core-utils@1.0.0-next.38
  - @remirror/extension-annotation@1.0.0-next.38
  - @remirror/extension-auto-link@1.0.0-next.38
  - @remirror/extension-bidi@1.0.0-next.38
  - @remirror/extension-blockquote@1.0.0-next.38
  - @remirror/extension-bold@1.0.0-next.38
  - @remirror/extension-code@1.0.0-next.38
  - @remirror/extension-code-block@1.0.0-next.38
  - @remirror/extension-collaboration@1.0.0-next.38
  - @remirror/extension-diff@1.0.0-next.38
  - @remirror/extension-doc@1.0.0-next.38
  - @remirror/extension-drop-cursor@1.0.0-next.38
  - @remirror/extension-emoji@1.0.0-next.38
  - @remirror/extension-epic-mode@1.0.0-next.38
  - @remirror/extension-events@1.0.0-next.38
  - @remirror/extension-gap-cursor@1.0.0-next.38
  - @remirror/extension-hard-break@1.0.0-next.38
  - @remirror/extension-heading@1.0.0-next.38
  - @remirror/extension-history@1.0.0-next.38
  - @remirror/extension-horizontal-rule@1.0.0-next.38
  - @remirror/extension-image@1.0.0-next.38
  - @remirror/extension-italic@1.0.0-next.38
  - @remirror/extension-link@1.0.0-next.38
  - @remirror/extension-mention@1.0.0-next.38
  - @remirror/extension-mention-atom@1.0.0-next.38
  - @remirror/extension-paragraph@1.0.0-next.38
  - @remirror/extension-placeholder@1.0.0-next.38
  - @remirror/extension-position-tracker@1.0.0-next.38
  - @remirror/extension-positioner@1.0.0-next.38
  - @remirror/extension-react-component@1.0.0-next.38
  - @remirror/extension-react-ssr@1.0.0-next.38
  - @remirror/extension-search@1.0.0-next.38
  - @remirror/extension-strike@1.0.0-next.38
  - @remirror/extension-text@1.0.0-next.38
  - @remirror/extension-trailing-node@1.0.0-next.38
  - @remirror/extension-underline@1.0.0-next.38
  - @remirror/extension-yjs@1.0.0-next.38
  - @remirror/preset-core@1.0.0-next.38
  - @remirror/extension-embed@1.0.0-next.38
  - @remirror/extension-list@1.0.0-next.38
  - @remirror/preset-react@1.0.0-next.38
  - @remirror/preset-social@1.0.0-next.38
  - @remirror/preset-table@1.0.0-next.38
  - @remirror/preset-wysiwyg@1.0.0-next.38
  - @remirror/react-hooks@1.0.0-next.38
  - @remirror/theme@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Minor Changes

- [`fb046735`](https://github.com/remirror/remirror/commit/fb046735fa67b4d469074faedae3320d09a7d755) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `@remirror/pm` as a direct dependency of the `remirror` package to reduce the number of packages that need to be installed.

  1. Install `remirror`.
  2. Create an editor??
  3. Profit.

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405), [`a3383ca4`](https://github.com/remirror/remirror/commit/a3383ca4958712ebaf735f5fb25c039e6295d137), [`9b48d110`](https://github.com/remirror/remirror/commit/9b48d1101655ef89e960267b582d560f11a89e4a), [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/core@1.0.0-next.37
  - @remirror/extension-annotation@1.0.0-next.37
  - @remirror/extension-auto-link@1.0.0-next.37
  - @remirror/extension-bidi@1.0.0-next.37
  - @remirror/extension-blockquote@1.0.0-next.37
  - @remirror/extension-bold@1.0.0-next.37
  - @remirror/extension-code@1.0.0-next.37
  - @remirror/extension-code-block@1.0.0-next.37
  - @remirror/extension-collaboration@1.0.0-next.37
  - @remirror/extension-diff@1.0.0-next.37
  - @remirror/extension-doc@1.0.0-next.37
  - @remirror/extension-drop-cursor@1.0.0-next.37
  - @remirror/extension-emoji@1.0.0-next.37
  - @remirror/extension-epic-mode@1.0.0-next.37
  - @remirror/extension-events@1.0.0-next.37
  - @remirror/extension-gap-cursor@1.0.0-next.37
  - @remirror/extension-hard-break@1.0.0-next.37
  - @remirror/extension-heading@1.0.0-next.37
  - @remirror/extension-history@1.0.0-next.37
  - @remirror/extension-horizontal-rule@1.0.0-next.37
  - @remirror/extension-image@1.0.0-next.37
  - @remirror/extension-italic@1.0.0-next.37
  - @remirror/extension-link@1.0.0-next.37
  - @remirror/extension-mention@1.0.0-next.37
  - @remirror/extension-mention-atom@1.0.0-next.37
  - @remirror/extension-paragraph@1.0.0-next.37
  - @remirror/extension-placeholder@1.0.0-next.37
  - @remirror/extension-position-tracker@1.0.0-next.37
  - @remirror/extension-positioner@1.0.0-next.37
  - @remirror/extension-react-component@1.0.0-next.37
  - @remirror/extension-react-ssr@1.0.0-next.37
  - @remirror/extension-search@1.0.0-next.37
  - @remirror/extension-strike@1.0.0-next.37
  - @remirror/extension-text@1.0.0-next.37
  - @remirror/extension-trailing-node@1.0.0-next.37
  - @remirror/extension-underline@1.0.0-next.37
  - @remirror/extension-yjs@1.0.0-next.37
  - @remirror/extension-embed@1.0.0-next.37
  - @remirror/extension-list@1.0.0-next.37
  - @remirror/preset-table@1.0.0-next.37
  - @remirror/react@1.0.0-next.37
  - @remirror/react-social@1.0.0-next.37
  - @remirror/pm@1.0.0-next.37
  - @remirror/dom@1.0.0-next.37
  - @remirror/preset-core@1.0.0-next.37
  - @remirror/preset-react@1.0.0-next.37
  - @remirror/preset-social@1.0.0-next.37
  - @remirror/preset-wysiwyg@1.0.0-next.37
  - @remirror/react-hooks@1.0.0-next.37
  - @remirror/react-wysiwyg@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-utils@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37
  - @remirror/react-utils@1.0.0-next.37
  - @remirror/theme@1.0.0-next.37

## 1.0.0-next.36

> 2020-09-13

### Patch Changes

- Updated dependencies [[`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7), [`0876a5cc`](https://github.com/remirror/remirror/commit/0876a5cc8cedb1f99e72ab7684b5478b3402b9e7)]:
  - @remirror/dom@1.0.0-next.36
  - @remirror/preset-table@1.0.0-next.36
  - @remirror/preset-wysiwyg@1.0.0-next.36
  - @remirror/react-wysiwyg@1.0.0-next.36

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa), [`2a43f303`](https://github.com/remirror/remirror/commit/2a43f3035856f6a6f6ce00938321a40b745b223b), [`3a5ad917`](https://github.com/remirror/remirror/commit/3a5ad917b061117f4b94682e023295cd437fb226), [`273db89f`](https://github.com/remirror/remirror/commit/273db89f923000e42b010a4c00f2a15a0d1d9685), [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec), [`ec941d73`](https://github.com/remirror/remirror/commit/ec941d736582d6fe3efbc5682ceec303637dbdc6), [`ffa36163`](https://github.com/remirror/remirror/commit/ffa36163f7bd41409a32dd1fbec90f85da74bb5b), [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3), [`b155ff47`](https://github.com/remirror/remirror/commit/b155ff47c14f24618a5a503d38b495aef5bc0b69)]:
  - @remirror/core@1.0.0-next.35
  - @remirror/extension-auto-link@1.0.0-next.35
  - @remirror/react-hooks@1.0.0-next.35
  - @remirror/preset-table@1.0.0-next.35
  - @remirror/core-utils@1.0.0-next.35
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/dom@1.0.0-next.35
  - @remirror/extension-annotation@1.0.0-next.35
  - @remirror/extension-bidi@1.0.0-next.35
  - @remirror/extension-blockquote@1.0.0-next.35
  - @remirror/extension-bold@1.0.0-next.35
  - @remirror/extension-code@1.0.0-next.35
  - @remirror/extension-code-block@1.0.0-next.35
  - @remirror/extension-collaboration@1.0.0-next.35
  - @remirror/extension-diff@1.0.0-next.35
  - @remirror/extension-doc@1.0.0-next.35
  - @remirror/extension-drop-cursor@1.0.0-next.35
  - @remirror/extension-emoji@1.0.0-next.35
  - @remirror/extension-epic-mode@1.0.0-next.35
  - @remirror/extension-events@1.0.0-next.35
  - @remirror/extension-gap-cursor@1.0.0-next.35
  - @remirror/extension-hard-break@1.0.0-next.35
  - @remirror/extension-heading@1.0.0-next.35
  - @remirror/extension-history@1.0.0-next.35
  - @remirror/extension-horizontal-rule@1.0.0-next.35
  - @remirror/extension-image@1.0.0-next.35
  - @remirror/extension-italic@1.0.0-next.35
  - @remirror/extension-link@1.0.0-next.35
  - @remirror/extension-mention@1.0.0-next.35
  - @remirror/extension-mention-atom@1.0.0-next.35
  - @remirror/extension-paragraph@1.0.0-next.35
  - @remirror/extension-placeholder@1.0.0-next.35
  - @remirror/extension-position-tracker@1.0.0-next.35
  - @remirror/extension-positioner@1.0.0-next.35
  - @remirror/extension-react-component@1.0.0-next.35
  - @remirror/extension-react-ssr@1.0.0-next.35
  - @remirror/extension-search@1.0.0-next.35
  - @remirror/extension-strike@1.0.0-next.35
  - @remirror/extension-text@1.0.0-next.35
  - @remirror/extension-trailing-node@1.0.0-next.35
  - @remirror/extension-underline@1.0.0-next.35
  - @remirror/extension-yjs@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - @remirror/preset-core@1.0.0-next.35
  - @remirror/extension-embed@1.0.0-next.35
  - @remirror/extension-list@1.0.0-next.35
  - @remirror/preset-react@1.0.0-next.35
  - @remirror/preset-social@1.0.0-next.35
  - @remirror/preset-wysiwyg@1.0.0-next.35
  - @remirror/react@1.0.0-next.35
  - @remirror/react-social@1.0.0-next.35
  - @remirror/react-utils@1.0.0-next.35
  - @remirror/react-wysiwyg@1.0.0-next.35
  - @remirror/theme@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be), [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core@1.0.0-next.34
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/dom@1.0.0-next.34
  - @remirror/react-social@1.0.0-next.34
  - @remirror/extension-react-component@1.0.0-next.34
  - @remirror/preset-core@1.0.0-next.34
  - @remirror/react@1.0.0-next.34
  - @remirror/react-wysiwyg@1.0.0-next.34
  - @remirror/extension-code@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/extension-annotation@1.0.0-next.34
  - @remirror/extension-auto-link@1.0.0-next.34
  - @remirror/extension-bidi@1.0.0-next.34
  - @remirror/extension-blockquote@1.0.0-next.34
  - @remirror/extension-bold@1.0.0-next.34
  - @remirror/extension-code-block@1.0.0-next.34
  - @remirror/extension-collaboration@1.0.0-next.34
  - @remirror/extension-diff@1.0.0-next.34
  - @remirror/extension-doc@1.0.0-next.34
  - @remirror/extension-drop-cursor@1.0.0-next.34
  - @remirror/extension-emoji@1.0.0-next.34
  - @remirror/extension-epic-mode@1.0.0-next.34
  - @remirror/extension-events@1.0.0-next.34
  - @remirror/extension-gap-cursor@1.0.0-next.34
  - @remirror/extension-hard-break@1.0.0-next.34
  - @remirror/extension-heading@1.0.0-next.34
  - @remirror/extension-history@1.0.0-next.34
  - @remirror/extension-horizontal-rule@1.0.0-next.34
  - @remirror/extension-image@1.0.0-next.34
  - @remirror/extension-italic@1.0.0-next.34
  - @remirror/extension-link@1.0.0-next.34
  - @remirror/extension-mention@1.0.0-next.34
  - @remirror/extension-mention-atom@1.0.0-next.34
  - @remirror/extension-paragraph@1.0.0-next.34
  - @remirror/extension-placeholder@1.0.0-next.34
  - @remirror/extension-position-tracker@1.0.0-next.34
  - @remirror/extension-positioner@1.0.0-next.34
  - @remirror/extension-react-ssr@1.0.0-next.34
  - @remirror/extension-search@1.0.0-next.34
  - @remirror/extension-strike@1.0.0-next.34
  - @remirror/extension-text@1.0.0-next.34
  - @remirror/extension-trailing-node@1.0.0-next.34
  - @remirror/extension-underline@1.0.0-next.34
  - @remirror/extension-yjs@1.0.0-next.34
  - @remirror/extension-embed@1.0.0-next.34
  - @remirror/extension-list@1.0.0-next.34
  - @remirror/preset-react@1.0.0-next.34
  - @remirror/preset-social@1.0.0-next.34
  - @remirror/preset-table@1.0.0-next.34
  - @remirror/preset-wysiwyg@1.0.0-next.34
  - @remirror/react-hooks@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/core-utils@1.0.0-next.34
  - @remirror/react-utils@1.0.0-next.34
  - @remirror/theme@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [04378b54]
- Updated dependencies [92ed4135]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [92ed4135]
- Updated dependencies [d47bd78f]
- Updated dependencies [92ed4135]
  - @remirror/extension-mention@1.0.0-next.33
  - @remirror/core@1.0.0-next.33
  - @remirror/preset-table@1.0.0-next.33
  - @remirror/core-utils@1.0.0-next.33
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/extension-italic@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33
  - @remirror/extension-history@1.0.0-next.33
  - @remirror/react@1.0.0-next.33
  - @remirror/react-hooks@1.0.0-next.33
  - @remirror/preset-social@1.0.0-next.33
  - @remirror/react-social@1.0.0-next.33
  - @remirror/dom@1.0.0-next.33
  - @remirror/extension-annotation@1.0.0-next.33
  - @remirror/extension-auto-link@1.0.0-next.33
  - @remirror/extension-bidi@1.0.0-next.33
  - @remirror/extension-blockquote@1.0.0-next.33
  - @remirror/extension-bold@1.0.0-next.33
  - @remirror/extension-code@1.0.0-next.33
  - @remirror/extension-code-block@1.0.0-next.33
  - @remirror/extension-collaboration@1.0.0-next.33
  - @remirror/extension-diff@1.0.0-next.33
  - @remirror/extension-doc@1.0.0-next.33
  - @remirror/extension-drop-cursor@1.0.0-next.33
  - @remirror/extension-emoji@1.0.0-next.33
  - @remirror/extension-epic-mode@1.0.0-next.33
  - @remirror/extension-events@1.0.0-next.33
  - @remirror/extension-gap-cursor@1.0.0-next.33
  - @remirror/extension-hard-break@1.0.0-next.33
  - @remirror/extension-heading@1.0.0-next.33
  - @remirror/extension-horizontal-rule@1.0.0-next.33
  - @remirror/extension-image@1.0.0-next.33
  - @remirror/extension-link@1.0.0-next.33
  - @remirror/extension-mention-atom@1.0.0-next.33
  - @remirror/extension-paragraph@1.0.0-next.33
  - @remirror/extension-placeholder@1.0.0-next.33
  - @remirror/extension-position-tracker@1.0.0-next.33
  - @remirror/extension-positioner@1.0.0-next.33
  - @remirror/extension-react-component@1.0.0-next.33
  - @remirror/extension-react-ssr@1.0.0-next.33
  - @remirror/extension-search@1.0.0-next.33
  - @remirror/extension-strike@1.0.0-next.33
  - @remirror/extension-text@1.0.0-next.33
  - @remirror/extension-trailing-node@1.0.0-next.33
  - @remirror/extension-underline@1.0.0-next.33
  - @remirror/extension-yjs@1.0.0-next.33
  - @remirror/preset-core@1.0.0-next.33
  - @remirror/extension-embed@1.0.0-next.33
  - @remirror/extension-list@1.0.0-next.33
  - @remirror/preset-react@1.0.0-next.33
  - @remirror/preset-wysiwyg@1.0.0-next.33
  - @remirror/react-wysiwyg@1.0.0-next.33
  - @remirror/core-helpers@1.0.0-next.33
  - @remirror/react-utils@1.0.0-next.33
  - @remirror/theme@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Major Changes

- [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37) [#646](https://github.com/remirror/remirror/pull/646) Thanks [@ifiokjr](https://github.com/ifiokjr)! - TypeScript 4.0.2 is now the minimum supported version.

### Patch Changes

- Updated dependencies [[`55e11ba3`](https://github.com/remirror/remirror/commit/55e11ba3515d54dda1352a15c4e86b85fb587016), [`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`28d1fd48`](https://github.com/remirror/remirror/commit/28d1fd486f1c73d66d6c678821cfa744751250b8), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3), [`3bf621c5`](https://github.com/remirror/remirror/commit/3bf621c57086f8de8084e9f2edba6b2a5c2dc0db), [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d), [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3)]:
  - @remirror/extension-mention-atom@1.0.0-next.32
  - @remirror/react@1.0.0-next.32
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core@1.0.0-next.32
  - @remirror/react-hooks@1.0.0-next.32
  - @remirror/core-utils@1.0.0-next.32
  - @remirror/extension-positioner@1.0.0-next.32
  - @remirror/extension-horizontal-rule@1.0.0-next.32
  - @remirror/core-helpers@1.0.0-next.32
  - @remirror/extension-code-block@1.0.0-next.32
  - @remirror/react-social@1.0.0-next.32
  - @remirror/react-wysiwyg@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32
  - @remirror/react-utils@1.0.0-next.32
  - @remirror/dom@1.0.0-next.32
  - @remirror/extension-annotation@1.0.0-next.32
  - @remirror/extension-auto-link@1.0.0-next.32
  - @remirror/extension-bidi@1.0.0-next.32
  - @remirror/extension-blockquote@1.0.0-next.32
  - @remirror/extension-bold@1.0.0-next.32
  - @remirror/extension-code@1.0.0-next.32
  - @remirror/extension-collaboration@1.0.0-next.32
  - @remirror/extension-diff@1.0.0-next.32
  - @remirror/extension-doc@1.0.0-next.32
  - @remirror/extension-drop-cursor@1.0.0-next.32
  - @remirror/extension-emoji@1.0.0-next.32
  - @remirror/extension-epic-mode@1.0.0-next.32
  - @remirror/extension-events@1.0.0-next.32
  - @remirror/extension-gap-cursor@1.0.0-next.32
  - @remirror/extension-hard-break@1.0.0-next.32
  - @remirror/extension-heading@1.0.0-next.32
  - @remirror/extension-history@1.0.0-next.32
  - @remirror/extension-image@1.0.0-next.32
  - @remirror/extension-italic@1.0.0-next.32
  - @remirror/extension-link@1.0.0-next.32
  - @remirror/extension-mention@1.0.0-next.32
  - @remirror/extension-paragraph@1.0.0-next.32
  - @remirror/extension-placeholder@1.0.0-next.32
  - @remirror/extension-position-tracker@1.0.0-next.32
  - @remirror/extension-react-component@1.0.0-next.32
  - @remirror/extension-react-ssr@1.0.0-next.32
  - @remirror/extension-search@1.0.0-next.32
  - @remirror/extension-strike@1.0.0-next.32
  - @remirror/extension-text@1.0.0-next.32
  - @remirror/extension-trailing-node@1.0.0-next.32
  - @remirror/extension-underline@1.0.0-next.32
  - @remirror/extension-yjs@1.0.0-next.32
  - @remirror/preset-core@1.0.0-next.32
  - @remirror/extension-embed@1.0.0-next.32
  - @remirror/extension-list@1.0.0-next.32
  - @remirror/preset-react@1.0.0-next.32
  - @remirror/preset-social@1.0.0-next.32
  - @remirror/preset-table@1.0.0-next.32
  - @remirror/preset-wysiwyg@1.0.0-next.32
  - @remirror/theme@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Major Changes

- [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d) [#608](https://github.com/remirror/remirror/pull/608) Thanks [@ifiokjr](https://github.com/ifiokjr)! - 🚀 Update the `onError` handler with a new improved type signature for better management of errors. See the following example.

  ```tsx
  import React from 'react';
  import { InvalidContentHandler, RemirrorProvider } from 'remirror/core';
  import { WysiwygPreset } from 'remirror/preset/wysiwyg';
  import { RemirrorProvider, useManager } from '@remirror/react';

  const EditorWrapper = () => {
    const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
      // Automatically remove all invalid nodes and marks.
      return transformers.remove(json, invalidContent);
    }, []);

    const manager = useManager([new WysiwygPreset()]);

    return (
      <RemirrorProvider manager={manager} onError={onError}>
        <div />
      </RemirrorProvider>
    );
  };
  ```

  - 🚀 Add `set` and `unset` methods to `@remirror/core-helpers`.
  - 🚀 Add `getInvalidContent` export from `@remirror/core-utils`.
  - 🚀 Add logging support for `RemirrorError` for better readability.
  - 🚀 Add new `ErrorConstant.INVALID_CONTENT` constant for content related errors.
  - 🚀 Add `Manager.createEmptyDoc()` instance method for creating any empty doc (with default content) for the current schema.
  - 💥 Remove `Fallback`, `CreateDocumentErrorHandler`, `getLineHeight`, `getPluginMeta`, `getPluginState`, `nodeNameMatchesList` and `setPluginMeta` exports from `@remirror/core-utils`.
  - 💥 Rename `getNearestNonTextNode` function to `getNearestNonTextElement`.
  - 💥 Rename `getNearestNonTextNode` function to `getNearestNonTextElement`.
  - 💥 Rename `StateOrTransactionParameter` interface to `TrStateParameter`.

  General refactor of types to use the `EditorSchema` rather than `any`. If you notice any downstream issues please open an issue.

### Minor Changes

- [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for creating mentions as uneditable nodes with a new package `@remirror/extension-mention-atom`.

* [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - New package `@remirror/react-hooks` with support for all core hooks`.

### Patch Changes

- Updated dependencies [[`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6), [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6)]:
  - @remirror/extension-mention-atom@1.0.0-next.31
  - @remirror/core@1.0.0-next.31
  - @remirror/core-helpers@1.0.0-next.31
  - @remirror/core-utils@1.0.0-next.31
  - @remirror/react-hooks@1.0.0-next.31
  - @remirror/extension-emoji@1.0.0-next.31
  - @remirror/extension-mention@1.0.0-next.31
  - @remirror/dom@1.0.0-next.31
  - @remirror/extension-annotation@1.0.0-next.31
  - @remirror/extension-auto-link@1.0.0-next.31
  - @remirror/extension-bidi@1.0.0-next.31
  - @remirror/extension-blockquote@1.0.0-next.31
  - @remirror/extension-bold@1.0.0-next.31
  - @remirror/extension-code@1.0.0-next.31
  - @remirror/extension-code-block@1.0.0-next.31
  - @remirror/extension-collaboration@1.0.0-next.31
  - @remirror/extension-diff@1.0.0-next.31
  - @remirror/extension-doc@1.0.0-next.31
  - @remirror/extension-drop-cursor@1.0.0-next.31
  - @remirror/extension-epic-mode@1.0.0-next.31
  - @remirror/extension-events@1.0.0-next.31
  - @remirror/extension-gap-cursor@1.0.0-next.31
  - @remirror/extension-hard-break@1.0.0-next.31
  - @remirror/extension-heading@1.0.0-next.31
  - @remirror/extension-history@1.0.0-next.31
  - @remirror/extension-horizontal-rule@1.0.0-next.31
  - @remirror/extension-image@1.0.0-next.31
  - @remirror/extension-italic@1.0.0-next.31
  - @remirror/extension-link@1.0.0-next.31
  - @remirror/extension-paragraph@1.0.0-next.31
  - @remirror/extension-placeholder@1.0.0-next.31
  - @remirror/extension-position-tracker@1.0.0-next.31
  - @remirror/extension-positioner@1.0.0-next.31
  - @remirror/extension-react-component@1.0.0-next.31
  - @remirror/extension-react-ssr@1.0.0-next.31
  - @remirror/extension-search@1.0.0-next.31
  - @remirror/extension-strike@1.0.0-next.31
  - @remirror/extension-text@1.0.0-next.31
  - @remirror/extension-trailing-node@1.0.0-next.31
  - @remirror/extension-underline@1.0.0-next.31
  - @remirror/extension-yjs@1.0.0-next.31
  - @remirror/preset-core@1.0.0-next.31
  - @remirror/extension-embed@1.0.0-next.31
  - @remirror/extension-list@1.0.0-next.31
  - @remirror/preset-react@1.0.0-next.31
  - @remirror/preset-social@1.0.0-next.31
  - @remirror/preset-table@1.0.0-next.31
  - @remirror/preset-wysiwyg@1.0.0-next.31
  - @remirror/react@1.0.0-next.31
  - @remirror/react-social@1.0.0-next.31
  - @remirror/react-wysiwyg@1.0.0-next.31
  - @remirror/react-utils@1.0.0-next.31

## 1.0.0-next.30

> 2020-08-28

### Patch Changes

- Updated dependencies [[`de0ba243`](https://github.com/remirror/remirror/commit/de0ba2436729f2fbd3bc8531b0e5fd01d3f34210)]:
  - @remirror/react@1.0.0-next.30
  - @remirror/react-social@1.0.0-next.30
  - @remirror/react-wysiwyg@1.0.0-next.30

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core@1.0.0-next.29
  - @remirror/react@1.0.0-next.29
  - @remirror/core-utils@1.0.0-next.29
  - @remirror/dom@1.0.0-next.29
  - @remirror/extension-annotation@1.0.0-next.29
  - @remirror/extension-auto-link@1.0.0-next.29
  - @remirror/extension-bidi@1.0.0-next.29
  - @remirror/extension-blockquote@1.0.0-next.29
  - @remirror/extension-bold@1.0.0-next.29
  - @remirror/extension-code@1.0.0-next.29
  - @remirror/extension-code-block@1.0.0-next.29
  - @remirror/extension-collaboration@1.0.0-next.29
  - @remirror/extension-diff@1.0.0-next.29
  - @remirror/extension-doc@1.0.0-next.29
  - @remirror/extension-drop-cursor@1.0.0-next.29
  - @remirror/extension-emoji@1.0.0-next.29
  - @remirror/extension-epic-mode@1.0.0-next.29
  - @remirror/extension-events@1.0.0-next.29
  - @remirror/extension-gap-cursor@1.0.0-next.29
  - @remirror/extension-hard-break@1.0.0-next.29
  - @remirror/extension-heading@1.0.0-next.29
  - @remirror/extension-history@1.0.0-next.29
  - @remirror/extension-horizontal-rule@1.0.0-next.29
  - @remirror/extension-image@1.0.0-next.29
  - @remirror/extension-italic@1.0.0-next.29
  - @remirror/extension-link@1.0.0-next.29
  - @remirror/extension-mention@1.0.0-next.29
  - @remirror/extension-paragraph@1.0.0-next.29
  - @remirror/extension-placeholder@1.0.0-next.29
  - @remirror/extension-position-tracker@1.0.0-next.29
  - @remirror/extension-positioner@1.0.0-next.29
  - @remirror/extension-react-component@1.0.0-next.29
  - @remirror/extension-react-ssr@1.0.0-next.29
  - @remirror/extension-search@1.0.0-next.29
  - @remirror/extension-strike@1.0.0-next.29
  - @remirror/extension-text@1.0.0-next.29
  - @remirror/extension-trailing-node@1.0.0-next.29
  - @remirror/extension-underline@1.0.0-next.29
  - @remirror/extension-yjs@1.0.0-next.29
  - @remirror/preset-core@1.0.0-next.29
  - @remirror/extension-embed@1.0.0-next.29
  - @remirror/extension-list@1.0.0-next.29
  - @remirror/preset-react@1.0.0-next.29
  - @remirror/preset-social@1.0.0-next.29
  - @remirror/preset-table@1.0.0-next.29
  - @remirror/preset-wysiwyg@1.0.0-next.29
  - @remirror/react-social@1.0.0-next.29
  - @remirror/react-wysiwyg@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- Updated dependencies [[`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`0400fbc8`](https://github.com/remirror/remirror/commit/0400fbc8a5f97441f70528f7d6c6f11d560b381d), [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a)]:
  - @remirror/core@1.0.0-next.28
  - @remirror/extension-blockquote@1.0.0-next.28
  - @remirror/extension-gap-cursor@1.0.0-next.28
  - @remirror/extension-placeholder@1.0.0-next.28
  - @remirror/extension-search@1.0.0-next.28
  - @remirror/extension-yjs@1.0.0-next.28
  - @remirror/pm@1.0.0-next.28
  - @remirror/extension-embed@1.0.0-next.28
  - @remirror/preset-react@1.0.0-next.28
  - @remirror/preset-table@1.0.0-next.28
  - @remirror/react@1.0.0-next.28
  - @remirror/react-social@1.0.0-next.28
  - @remirror/react-wysiwyg@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/extension-react-component@1.0.0-next.28
  - @remirror/extension-react-ssr@1.0.0-next.28
  - @remirror/dom@1.0.0-next.28
  - @remirror/extension-annotation@1.0.0-next.28
  - @remirror/extension-auto-link@1.0.0-next.28
  - @remirror/extension-bidi@1.0.0-next.28
  - @remirror/extension-bold@1.0.0-next.28
  - @remirror/extension-code@1.0.0-next.28
  - @remirror/extension-code-block@1.0.0-next.28
  - @remirror/extension-collaboration@1.0.0-next.28
  - @remirror/extension-diff@1.0.0-next.28
  - @remirror/extension-doc@1.0.0-next.28
  - @remirror/extension-drop-cursor@1.0.0-next.28
  - @remirror/extension-emoji@1.0.0-next.28
  - @remirror/extension-epic-mode@1.0.0-next.28
  - @remirror/extension-events@1.0.0-next.28
  - @remirror/extension-hard-break@1.0.0-next.28
  - @remirror/extension-heading@1.0.0-next.28
  - @remirror/extension-history@1.0.0-next.28
  - @remirror/extension-horizontal-rule@1.0.0-next.28
  - @remirror/extension-image@1.0.0-next.28
  - @remirror/extension-italic@1.0.0-next.28
  - @remirror/extension-link@1.0.0-next.28
  - @remirror/extension-mention@1.0.0-next.28
  - @remirror/extension-paragraph@1.0.0-next.28
  - @remirror/extension-position-tracker@1.0.0-next.28
  - @remirror/extension-positioner@1.0.0-next.28
  - @remirror/extension-strike@1.0.0-next.28
  - @remirror/extension-text@1.0.0-next.28
  - @remirror/extension-trailing-node@1.0.0-next.28
  - @remirror/extension-underline@1.0.0-next.28
  - @remirror/preset-core@1.0.0-next.28
  - @remirror/extension-list@1.0.0-next.28
  - @remirror/preset-social@1.0.0-next.28
  - @remirror/preset-wysiwyg@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28
  - @remirror/core-utils@1.0.0-next.28
  - @remirror/react-utils@1.0.0-next.28
  - @remirror/theme@1.0.0-next.28

## 1.0.0-next.27

> 2020-08-25

### Minor Changes

- a7436f03: 🎉 Add support for consuming styles with `styled-components` and `emotion` as requested by a sponsor - [#550](https://github.com/remirror/remirror/issues/550).

  💥 BREAKING CHANGE - Remove exports from `@remirror/theme`.

  - ❌ `createAtomClasses`
  - ❌ `defaultRemirrorAtoms`

### Patch Changes

- Updated dependencies [a7436f03]
  - @remirror/theme@1.0.0-next.27
  - @remirror/preset-table@1.0.0-next.27
  - @remirror/react@1.0.0-next.27
  - @remirror/react-social@1.0.0-next.27
  - @remirror/react-wysiwyg@1.0.0-next.27
  - @remirror/preset-wysiwyg@1.0.0-next.27

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core@1.0.0-next.26
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-utils@1.0.0-next.26
  - @remirror/extension-blockquote@1.0.0-next.26
  - @remirror/extension-bold@1.0.0-next.26
  - @remirror/extension-code@1.0.0-next.26
  - @remirror/extension-code-block@1.0.0-next.26
  - @remirror/extension-hard-break@1.0.0-next.26
  - @remirror/extension-heading@1.0.0-next.26
  - @remirror/extension-image@1.0.0-next.26
  - @remirror/extension-italic@1.0.0-next.26
  - @remirror/extension-link@1.0.0-next.26
  - @remirror/extension-mention@1.0.0-next.26
  - @remirror/extension-paragraph@1.0.0-next.26
  - @remirror/extension-strike@1.0.0-next.26
  - @remirror/extension-text@1.0.0-next.26
  - @remirror/extension-trailing-node@1.0.0-next.26
  - @remirror/extension-underline@1.0.0-next.26
  - @remirror/extension-embed@1.0.0-next.26
  - @remirror/extension-list@1.0.0-next.26
  - @remirror/preset-table@1.0.0-next.26
  - @remirror/dom@1.0.0-next.26
  - @remirror/extension-annotation@1.0.0-next.26
  - @remirror/extension-auto-link@1.0.0-next.26
  - @remirror/extension-bidi@1.0.0-next.26
  - @remirror/extension-collaboration@1.0.0-next.26
  - @remirror/extension-diff@1.0.0-next.26
  - @remirror/extension-doc@1.0.0-next.26
  - @remirror/extension-drop-cursor@1.0.0-next.26
  - @remirror/extension-emoji@1.0.0-next.26
  - @remirror/extension-epic-mode@1.0.0-next.26
  - @remirror/extension-events@1.0.0-next.26
  - @remirror/extension-gap-cursor@1.0.0-next.26
  - @remirror/extension-history@1.0.0-next.26
  - @remirror/extension-horizontal-rule@1.0.0-next.26
  - @remirror/extension-placeholder@1.0.0-next.26
  - @remirror/extension-position-tracker@1.0.0-next.26
  - @remirror/extension-positioner@1.0.0-next.26
  - @remirror/extension-react-component@1.0.0-next.26
  - @remirror/extension-react-ssr@1.0.0-next.26
  - @remirror/extension-search@1.0.0-next.26
  - @remirror/extension-yjs@1.0.0-next.26
  - @remirror/preset-core@1.0.0-next.26
  - @remirror/preset-react@1.0.0-next.26
  - @remirror/preset-social@1.0.0-next.26
  - @remirror/preset-wysiwyg@1.0.0-next.26
  - @remirror/react@1.0.0-next.26
  - @remirror/react-social@1.0.0-next.26
  - @remirror/react-wysiwyg@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - @remirror/react-utils@1.0.0-next.26
  - @remirror/theme@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [e37d64de]
- Updated dependencies [3f2625bf]
  - @remirror/core@1.0.0-next.25
  - @remirror/core-utils@1.0.0-next.25
  - @remirror/extension-link@1.0.0-next.25
  - @remirror/dom@1.0.0-next.25
  - @remirror/extension-annotation@1.0.0-next.25
  - @remirror/extension-auto-link@1.0.0-next.25
  - @remirror/extension-bidi@1.0.0-next.25
  - @remirror/extension-blockquote@1.0.0-next.25
  - @remirror/extension-bold@1.0.0-next.25
  - @remirror/extension-code@1.0.0-next.25
  - @remirror/extension-code-block@1.0.0-next.25
  - @remirror/extension-collaboration@1.0.0-next.25
  - @remirror/extension-diff@1.0.0-next.25
  - @remirror/extension-doc@1.0.0-next.25
  - @remirror/extension-drop-cursor@1.0.0-next.25
  - @remirror/extension-emoji@1.0.0-next.25
  - @remirror/extension-epic-mode@1.0.0-next.25
  - @remirror/extension-events@1.0.0-next.25
  - @remirror/extension-gap-cursor@1.0.0-next.25
  - @remirror/extension-hard-break@1.0.0-next.25
  - @remirror/extension-heading@1.0.0-next.25
  - @remirror/extension-history@1.0.0-next.25
  - @remirror/extension-horizontal-rule@1.0.0-next.25
  - @remirror/extension-image@1.0.0-next.25
  - @remirror/extension-italic@1.0.0-next.25
  - @remirror/extension-mention@1.0.0-next.25
  - @remirror/extension-paragraph@1.0.0-next.25
  - @remirror/extension-placeholder@1.0.0-next.25
  - @remirror/extension-position-tracker@1.0.0-next.25
  - @remirror/extension-positioner@1.0.0-next.25
  - @remirror/extension-react-component@1.0.0-next.25
  - @remirror/extension-react-ssr@1.0.0-next.25
  - @remirror/extension-search@1.0.0-next.25
  - @remirror/extension-strike@1.0.0-next.25
  - @remirror/extension-text@1.0.0-next.25
  - @remirror/extension-trailing-node@1.0.0-next.25
  - @remirror/extension-underline@1.0.0-next.25
  - @remirror/extension-yjs@1.0.0-next.25
  - @remirror/preset-core@1.0.0-next.25
  - @remirror/extension-embed@1.0.0-next.25
  - @remirror/extension-list@1.0.0-next.25
  - @remirror/preset-react@1.0.0-next.25
  - @remirror/preset-social@1.0.0-next.25
  - @remirror/preset-table@1.0.0-next.25
  - @remirror/preset-wysiwyg@1.0.0-next.25
  - @remirror/react@1.0.0-next.25
  - @remirror/react-social@1.0.0-next.25
  - @remirror/react-wysiwyg@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Patch Changes

- Updated dependencies [65a7ea24]
- Updated dependencies [387ab938]
  - @remirror/core@1.0.0-next.24
  - @remirror/extension-annotation@1.0.0-next.24
  - @remirror/dom@1.0.0-next.24
  - @remirror/extension-auto-link@1.0.0-next.24
  - @remirror/extension-bidi@1.0.0-next.24
  - @remirror/extension-blockquote@1.0.0-next.24
  - @remirror/extension-bold@1.0.0-next.24
  - @remirror/extension-code@1.0.0-next.24
  - @remirror/extension-code-block@1.0.0-next.24
  - @remirror/extension-collaboration@1.0.0-next.24
  - @remirror/extension-diff@1.0.0-next.24
  - @remirror/extension-doc@1.0.0-next.24
  - @remirror/extension-drop-cursor@1.0.0-next.24
  - @remirror/extension-emoji@1.0.0-next.24
  - @remirror/extension-epic-mode@1.0.0-next.24
  - @remirror/extension-events@1.0.0-next.24
  - @remirror/extension-gap-cursor@1.0.0-next.24
  - @remirror/extension-hard-break@1.0.0-next.24
  - @remirror/extension-heading@1.0.0-next.24
  - @remirror/extension-history@1.0.0-next.24
  - @remirror/extension-horizontal-rule@1.0.0-next.24
  - @remirror/extension-image@1.0.0-next.24
  - @remirror/extension-italic@1.0.0-next.24
  - @remirror/extension-link@1.0.0-next.24
  - @remirror/extension-mention@1.0.0-next.24
  - @remirror/extension-paragraph@1.0.0-next.24
  - @remirror/extension-placeholder@1.0.0-next.24
  - @remirror/extension-position-tracker@1.0.0-next.24
  - @remirror/extension-positioner@1.0.0-next.24
  - @remirror/extension-react-component@1.0.0-next.24
  - @remirror/extension-react-ssr@1.0.0-next.24
  - @remirror/extension-search@1.0.0-next.24
  - @remirror/extension-strike@1.0.0-next.24
  - @remirror/extension-text@1.0.0-next.24
  - @remirror/extension-trailing-node@1.0.0-next.24
  - @remirror/extension-underline@1.0.0-next.24
  - @remirror/extension-yjs@1.0.0-next.24
  - @remirror/preset-core@1.0.0-next.24
  - @remirror/extension-embed@1.0.0-next.24
  - @remirror/extension-list@1.0.0-next.24
  - @remirror/preset-react@1.0.0-next.24
  - @remirror/preset-social@1.0.0-next.24
  - @remirror/preset-table@1.0.0-next.24
  - @remirror/preset-wysiwyg@1.0.0-next.24
  - @remirror/react@1.0.0-next.24
  - @remirror/react-social@1.0.0-next.24
  - @remirror/react-wysiwyg@1.0.0-next.24

## 1.0.0-next.23

> 2020-08-18

### Patch Changes

- d505ebc1: Fixes #555 `onChange` callback not being updated when using a controlled editor in `StrictMode`.
- Updated dependencies [d505ebc1]
  - @remirror/react@1.0.0-next.23
  - @remirror/react-social@1.0.0-next.23
  - @remirror/react-wysiwyg@1.0.0-next.23

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [8ccbd07b]
- Updated dependencies [45d82746]
- Updated dependencies [21c5807e]
- Updated dependencies [d300c5f0]
- Updated dependencies [f0377808]
  - @remirror/core@1.0.0-next.22
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/extension-hard-break@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-utils@1.0.0-next.22
  - @remirror/extension-bidi@1.0.0-next.22
  - @remirror/extension-link@1.0.0-next.22
  - @remirror/preset-wysiwyg@1.0.0-next.22
  - @remirror/react@1.0.0-next.22
  - @remirror/extension-positioner@1.0.0-next.22
  - @remirror/react-social@1.0.0-next.22
  - @remirror/extension-code-block@1.0.0-next.22
  - @remirror/dom@1.0.0-next.22
  - @remirror/extension-annotation@1.0.0-next.22
  - @remirror/extension-auto-link@1.0.0-next.22
  - @remirror/extension-blockquote@1.0.0-next.22
  - @remirror/extension-bold@1.0.0-next.22
  - @remirror/extension-code@1.0.0-next.22
  - @remirror/extension-collaboration@1.0.0-next.22
  - @remirror/extension-diff@1.0.0-next.22
  - @remirror/extension-doc@1.0.0-next.22
  - @remirror/extension-drop-cursor@1.0.0-next.22
  - @remirror/extension-emoji@1.0.0-next.22
  - @remirror/extension-epic-mode@1.0.0-next.22
  - @remirror/extension-events@1.0.0-next.22
  - @remirror/extension-gap-cursor@1.0.0-next.22
  - @remirror/extension-heading@1.0.0-next.22
  - @remirror/extension-history@1.0.0-next.22
  - @remirror/extension-horizontal-rule@1.0.0-next.22
  - @remirror/extension-image@1.0.0-next.22
  - @remirror/extension-italic@1.0.0-next.22
  - @remirror/extension-mention@1.0.0-next.22
  - @remirror/extension-paragraph@1.0.0-next.22
  - @remirror/extension-placeholder@1.0.0-next.22
  - @remirror/extension-position-tracker@1.0.0-next.22
  - @remirror/extension-react-component@1.0.0-next.22
  - @remirror/extension-react-ssr@1.0.0-next.22
  - @remirror/extension-search@1.0.0-next.22
  - @remirror/extension-strike@1.0.0-next.22
  - @remirror/extension-text@1.0.0-next.22
  - @remirror/extension-trailing-node@1.0.0-next.22
  - @remirror/extension-underline@1.0.0-next.22
  - @remirror/extension-yjs@1.0.0-next.22
  - @remirror/preset-core@1.0.0-next.22
  - @remirror/extension-embed@1.0.0-next.22
  - @remirror/extension-list@1.0.0-next.22
  - @remirror/preset-react@1.0.0-next.22
  - @remirror/preset-social@1.0.0-next.22
  - @remirror/preset-table@1.0.0-next.22
  - @remirror/react-wysiwyg@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22
  - @remirror/react-utils@1.0.0-next.22
  - @remirror/theme@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [8c34030e]
- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/extension-horizontal-rule@1.0.0-next.21
  - @remirror/core@1.0.0-next.21
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-utils@1.0.0-next.21
  - @remirror/extension-code@1.0.0-next.21
  - @remirror/extension-bold@1.0.0-next.21
  - @remirror/extension-italic@1.0.0-next.21
  - @remirror/extension-strike@1.0.0-next.21
  - @remirror/preset-wysiwyg@1.0.0-next.21
  - @remirror/dom@1.0.0-next.21
  - @remirror/extension-annotation@1.0.0-next.21
  - @remirror/extension-auto-link@1.0.0-next.21
  - @remirror/extension-bidi@1.0.0-next.21
  - @remirror/extension-blockquote@1.0.0-next.21
  - @remirror/extension-code-block@1.0.0-next.21
  - @remirror/extension-collaboration@1.0.0-next.21
  - @remirror/extension-diff@1.0.0-next.21
  - @remirror/extension-doc@1.0.0-next.21
  - @remirror/extension-drop-cursor@1.0.0-next.21
  - @remirror/extension-emoji@1.0.0-next.21
  - @remirror/extension-epic-mode@1.0.0-next.21
  - @remirror/extension-events@1.0.0-next.21
  - @remirror/extension-gap-cursor@1.0.0-next.21
  - @remirror/extension-hard-break@1.0.0-next.21
  - @remirror/extension-heading@1.0.0-next.21
  - @remirror/extension-history@1.0.0-next.21
  - @remirror/extension-image@1.0.0-next.21
  - @remirror/extension-link@1.0.0-next.21
  - @remirror/extension-mention@1.0.0-next.21
  - @remirror/extension-paragraph@1.0.0-next.21
  - @remirror/extension-placeholder@1.0.0-next.21
  - @remirror/extension-position-tracker@1.0.0-next.21
  - @remirror/extension-positioner@1.0.0-next.21
  - @remirror/extension-react-component@1.0.0-next.21
  - @remirror/extension-react-ssr@1.0.0-next.21
  - @remirror/extension-search@1.0.0-next.21
  - @remirror/extension-text@1.0.0-next.21
  - @remirror/extension-trailing-node@1.0.0-next.21
  - @remirror/extension-underline@1.0.0-next.21
  - @remirror/extension-yjs@1.0.0-next.21
  - @remirror/preset-core@1.0.0-next.21
  - @remirror/extension-embed@1.0.0-next.21
  - @remirror/extension-list@1.0.0-next.21
  - @remirror/preset-react@1.0.0-next.21
  - @remirror/preset-social@1.0.0-next.21
  - @remirror/preset-table@1.0.0-next.21
  - @remirror/react@1.0.0-next.21
  - @remirror/react-social@1.0.0-next.21
  - @remirror/react-wysiwyg@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - @remirror/react-utils@1.0.0-next.21
  - @remirror/theme@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Major Changes

- 6d7edc85: Rename `areSchemaCompatible` to `areSchemasCompatible`.

### Minor Changes

- Fix the controlled editor when used in `StrictMode`.

- 8f9eb16c: Enable `all` selection when setting initial content and focusing on the editor.

  ```tsx
  import React from 'react';
  import { useRemirror } from '@remirror/react';

  const EditorButton = () => {
    const { focus } = useRemirror();

    return <button onClick={() => focus('all')} />;
  };
  ```

### Patch Changes

- 7c603a5e: Ensure the `markInputRule` doesn't reactivate previous marks when rules are nested and activated consecutively.
- 48cce3a0: Remove misleading documentation. The matchOffset field isn't defaulted to zero for MentionExtension.
- Updated dependencies [95697fbd]
- Updated dependencies [6d7edc85]
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [7c603a5e]
- Updated dependencies [92653907]
  - @remirror/react@1.0.0-next.20
  - @remirror/core-utils@1.0.0-next.20
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/extension-code-block@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - @remirror/react-social@1.0.0-next.20
  - @remirror/react-wysiwyg@1.0.0-next.20
  - @remirror/core@1.0.0-next.20
  - @remirror/react-utils@1.0.0-next.20
  - @remirror/theme@1.0.0-next.20
  - @remirror/preset-wysiwyg@1.0.0-next.20
  - @remirror/dom@1.0.0-next.20
  - @remirror/extension-annotation@1.0.0-next.20
  - @remirror/extension-auto-link@1.0.0-next.20
  - @remirror/extension-bidi@1.0.0-next.20
  - @remirror/extension-blockquote@1.0.0-next.20
  - @remirror/extension-bold@1.0.0-next.20
  - @remirror/extension-code@1.0.0-next.20
  - @remirror/extension-collaboration@1.0.0-next.20
  - @remirror/extension-diff@1.0.0-next.20
  - @remirror/extension-doc@1.0.0-next.20
  - @remirror/extension-drop-cursor@1.0.0-next.20
  - @remirror/extension-emoji@1.0.0-next.20
  - @remirror/extension-epic-mode@1.0.0-next.20
  - @remirror/extension-events@1.0.0-next.20
  - @remirror/extension-gap-cursor@1.0.0-next.20
  - @remirror/extension-hard-break@1.0.0-next.20
  - @remirror/extension-heading@1.0.0-next.20
  - @remirror/extension-history@1.0.0-next.20
  - @remirror/extension-horizontal-rule@1.0.0-next.20
  - @remirror/extension-image@1.0.0-next.20
  - @remirror/extension-italic@1.0.0-next.20
  - @remirror/extension-link@1.0.0-next.20
  - @remirror/extension-mention@1.0.0-next.20
  - @remirror/extension-paragraph@1.0.0-next.20
  - @remirror/extension-placeholder@1.0.0-next.20
  - @remirror/extension-position-tracker@1.0.0-next.20
  - @remirror/extension-positioner@1.0.0-next.20
  - @remirror/extension-react-component@1.0.0-next.20
  - @remirror/extension-react-ssr@1.0.0-next.20
  - @remirror/extension-search@1.0.0-next.20
  - @remirror/extension-strike@1.0.0-next.20
  - @remirror/extension-text@1.0.0-next.20
  - @remirror/extension-trailing-node@1.0.0-next.20
  - @remirror/extension-underline@1.0.0-next.20
  - @remirror/extension-yjs@1.0.0-next.20
  - @remirror/preset-core@1.0.0-next.20
  - @remirror/extension-embed@1.0.0-next.20
  - @remirror/extension-list@1.0.0-next.20
  - @remirror/preset-react@1.0.0-next.20
  - @remirror/preset-social@1.0.0-next.20
  - @remirror/preset-table@1.0.0-next.20

## 1.0.0-next.19

> 2020-08-04

### Patch Changes

- Updated dependencies [2db38fec]
  - @remirror/extension-annotation@1.0.0-next.19

## 1.0.0-next.18

> 2020-08-03

### Patch Changes

- 2059da35: Fix broken entry point `remirror/extension/annotation` from `remirror`.

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- 4498814f: Rename `UsePositionerHookReturn` and `UseMultiPositionerHookReturn` to `UsePositionerReturn` and `UseMultiPositionerReturn`.

  - Add `active: boolean` property to `UsePositionerHookReturn`.
  - Fix the floating emoji menu for the social editor and showcase. Now hidden when text selection spans multiple characters.

- 338746fa: Pin `@remirror/extension-annotation` version.
- 2d72ca94: Export `Positioner` as a value.

  - Enable creating a positioner from another positioner with `Positioner.fromPositioner`

  Closes #441

- Updated dependencies [4498814f]
- Updated dependencies [2d72ca94]
- Updated dependencies [898c62e0]
  - @remirror/react@1.0.0-next.17
  - @remirror/react-social@1.0.0-next.17
  - @remirror/extension-positioner@1.0.0-next.17
  - @remirror/core@1.0.0-next.17
  - @remirror/react-wysiwyg@1.0.0-next.17
  - @remirror/preset-core@1.0.0-next.17
  - @remirror/dom@1.0.0-next.17
  - @remirror/extension-annotation@1.0.0-next.17
  - @remirror/extension-auto-link@1.0.0-next.17
  - @remirror/extension-bidi@1.0.0-next.17
  - @remirror/extension-blockquote@1.0.0-next.17
  - @remirror/extension-bold@1.0.0-next.17
  - @remirror/extension-code@1.0.0-next.17
  - @remirror/extension-code-block@1.0.0-next.17
  - @remirror/extension-collaboration@1.0.0-next.17
  - @remirror/extension-diff@1.0.0-next.17
  - @remirror/extension-doc@1.0.0-next.17
  - @remirror/extension-drop-cursor@1.0.0-next.17
  - @remirror/extension-emoji@1.0.0-next.17
  - @remirror/extension-epic-mode@1.0.0-next.17
  - @remirror/extension-events@1.0.0-next.17
  - @remirror/extension-gap-cursor@1.0.0-next.17
  - @remirror/extension-hard-break@1.0.0-next.17
  - @remirror/extension-heading@1.0.0-next.17
  - @remirror/extension-history@1.0.0-next.17
  - @remirror/extension-horizontal-rule@1.0.0-next.17
  - @remirror/extension-image@1.0.0-next.17
  - @remirror/extension-italic@1.0.0-next.17
  - @remirror/extension-link@1.0.0-next.17
  - @remirror/extension-mention@1.0.0-next.17
  - @remirror/extension-paragraph@1.0.0-next.17
  - @remirror/extension-placeholder@1.0.0-next.17
  - @remirror/extension-position-tracker@1.0.0-next.17
  - @remirror/extension-react-component@1.0.0-next.17
  - @remirror/extension-react-ssr@1.0.0-next.17
  - @remirror/extension-search@1.0.0-next.17
  - @remirror/extension-strike@1.0.0-next.17
  - @remirror/extension-text@1.0.0-next.17
  - @remirror/extension-trailing-node@1.0.0-next.17
  - @remirror/extension-underline@1.0.0-next.17
  - @remirror/extension-yjs@1.0.0-next.17
  - @remirror/extension-embed@1.0.0-next.17
  - @remirror/extension-list@1.0.0-next.17
  - @remirror/preset-react@1.0.0-next.17
  - @remirror/preset-social@1.0.0-next.17
  - @remirror/preset-table@1.0.0-next.17
  - @remirror/preset-wysiwyg@1.0.0-next.17

## 1.0.0-next.16

> 2020-08-01

### Major Changes

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

- be9a9c17: Move all keymap functionality to `KeymapExtension` from `@remirror/core`. Remove all references to `@remirror/extension-base-keymap`.

### Minor Changes

- 206c1405: Extension to annotate content in your editor
- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from `@remirror/core-utils`.
- 2592b7b3: Allow runtime updates of `PlaceholderExtension` `emptyNodeClass` option.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [206c1405]
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
- Updated dependencies [1918da2c]
- Updated dependencies [2592b7b3]
- Updated dependencies [720c9b43]
  - @remirror/preset-core@1.0.0-next.16
  - @remirror/preset-wysiwyg@1.0.0-next.16
  - @remirror/react@1.0.0-next.16
  - @remirror/react-social@1.0.0-next.16
  - @remirror/core-types@1.0.0-next.16
  - @remirror/react-wysiwyg@1.0.0-next.16
  - @remirror/extension-annotation@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/dom@1.0.0-next.16
  - @remirror/extension-auto-link@1.0.0-next.16
  - @remirror/extension-bidi@1.0.0-next.16
  - @remirror/extension-blockquote@1.0.0-next.16
  - @remirror/extension-bold@1.0.0-next.16
  - @remirror/extension-code@1.0.0-next.16
  - @remirror/extension-code-block@1.0.0-next.16
  - @remirror/extension-collaboration@1.0.0-next.16
  - @remirror/extension-diff@1.0.0-next.16
  - @remirror/extension-doc@1.0.0-next.16
  - @remirror/extension-drop-cursor@1.0.0-next.16
  - @remirror/extension-emoji@1.0.0-next.16
  - @remirror/extension-epic-mode@1.0.0-next.16
  - @remirror/extension-events@1.0.0-next.16
  - @remirror/extension-gap-cursor@1.0.0-next.16
  - @remirror/extension-hard-break@1.0.0-next.16
  - @remirror/extension-heading@1.0.0-next.16
  - @remirror/extension-history@1.0.0-next.16
  - @remirror/extension-horizontal-rule@1.0.0-next.16
  - @remirror/extension-image@1.0.0-next.16
  - @remirror/extension-italic@1.0.0-next.16
  - @remirror/extension-link@1.0.0-next.16
  - @remirror/extension-mention@1.0.0-next.16
  - @remirror/extension-paragraph@1.0.0-next.16
  - @remirror/extension-placeholder@1.0.0-next.16
  - @remirror/extension-position-tracker@1.0.0-next.16
  - @remirror/extension-positioner@1.0.0-next.16
  - @remirror/extension-react-component@1.0.0-next.16
  - @remirror/extension-react-ssr@1.0.0-next.16
  - @remirror/extension-search@1.0.0-next.16
  - @remirror/extension-strike@1.0.0-next.16
  - @remirror/extension-text@1.0.0-next.16
  - @remirror/extension-trailing-node@1.0.0-next.16
  - @remirror/extension-underline@1.0.0-next.16
  - @remirror/extension-yjs@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - @remirror/extension-embed@1.0.0-next.16
  - @remirror/extension-list@1.0.0-next.16
  - @remirror/preset-react@1.0.0-next.16
  - @remirror/preset-social@1.0.0-next.16
  - @remirror/preset-table@1.0.0-next.16
  - @remirror/react-utils@1.0.0-next.16
  - @remirror/theme@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`, `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

- 0ff4fd5c: Default to inserting a new paragraph node after the `HorizontalRuleExtension`.

  BREAKING: 💥 Rename `horizonalRule` command to `insertHorizontalRule`.

  Add a new option `insertionNode` to the `HorizontalRuleExtension` which sets the default node to automatically append after insertion.

  Update the css styles for the default `hr` tag.

  Closes #417

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

- e5ea0c84: Add support for `Handler` options with custom return values and early returns.

  Previously handlers would ignore any return values. Now a handler will honour the return value. The earlyReturn value can be specified in the static options using the `extensionDecorator`. Currently it only supports primitives. Support for a function to check the return value will be added later.

- 08e51078: Add `insertHardBreak` command.

  Add inline documentation instructing developers to use the `TrailingNodeExtension` when using `hardBreak` to exit a `codeBlock`.

- f91dcab1: 🎉 New extension `@remirror/extension-events`.

  This extension adds handlers for the events happening within the remirror editor. The extension is part of the `CorePreset` but it doesn't make it's handlers available to the preset. In order to use the handlers you will need direct access to the `EventsExtension`.

  ```ts
  import { EventsExtension } from 'remirror/extension-events';
  import { useExtension } from '@remirror/react';

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

### Patch Changes

- 0dd4d621: Prevent mid word emoji matches on colon press.
- 273d0a71: Hide social popups when the editor is blurred.
- 9d708c03: Reduce the `AutoLinkExtension` priority and remove priority override for the mention and emoji extensions.
- a404f5a1: Add the option `excludeExtensions` to `CorePreset`'s `constructor` to exclude any extensions.

  Remove the option `excludeHistory` from `CorePreset`'s `constructor`.

- e3d937f0: Support chaining for `setBold` and `removeBold` commands.
- 6c3b278b: Make sure the `transaction` has all the latest updates if changed between `onStateUpdate` events. This allows chaining to be supported properly.
- 7477b935: Use `NonChainableCommandFunction` annotation to indicate commands are not chainable.
- Updated dependencies [cdc5b801]
- Updated dependencies [0dd4d621]
- Updated dependencies [0ff4fd5c]
- Updated dependencies [273d0a71]
- Updated dependencies [44516da4]
- Updated dependencies [9d708c03]
- Updated dependencies [e5ea0c84]
- Updated dependencies [a404f5a1]
- Updated dependencies [e3d937f0]
- Updated dependencies [6c3b278b]
- Updated dependencies [7477b935]
- Updated dependencies [08e51078]
- Updated dependencies [f91dcab1]
  - @remirror/core-utils@1.0.0-next.15
  - @remirror/core@1.0.0-next.15
  - @remirror/extension-emoji@1.0.0-next.15
  - @remirror/extension-horizontal-rule@1.0.0-next.15
  - @remirror/react-social@1.0.0-next.15
  - @remirror/extension-code@1.0.0-next.15
  - @remirror/extension-code-block@1.0.0-next.15
  - @remirror/extension-heading@1.0.0-next.15
  - @remirror/extension-italic@1.0.0-next.15
  - @remirror/extension-paragraph@1.0.0-next.15
  - @remirror/extension-strike@1.0.0-next.15
  - @remirror/extension-underline@1.0.0-next.15
  - @remirror/preset-social@1.0.0-next.15
  - @remirror/extension-bold@1.0.0-next.15
  - @remirror/extension-history@1.0.0-next.15
  - @remirror/extension-yjs@1.0.0-next.15
  - @remirror/extension-hard-break@1.0.0-next.15
  - @remirror/extension-events@1.0.0-next.15
  - @remirror/preset-core@1.0.0-next.15
  - @remirror/dom@1.0.0-next.15
  - @remirror/extension-auto-link@1.0.0-next.15
  - @remirror/extension-base-keymap@1.0.0-next.15
  - @remirror/extension-bidi@1.0.0-next.15
  - @remirror/extension-blockquote@1.0.0-next.15
  - @remirror/extension-collaboration@1.0.0-next.15
  - @remirror/extension-diff@1.0.0-next.15
  - @remirror/extension-doc@1.0.0-next.15
  - @remirror/extension-drop-cursor@1.0.0-next.15
  - @remirror/extension-epic-mode@1.0.0-next.15
  - @remirror/extension-gap-cursor@1.0.0-next.15
  - @remirror/extension-image@1.0.0-next.15
  - @remirror/extension-link@1.0.0-next.15
  - @remirror/extension-mention@1.0.0-next.15
  - @remirror/extension-placeholder@1.0.0-next.15
  - @remirror/extension-position-tracker@1.0.0-next.15
  - @remirror/extension-positioner@1.0.0-next.15
  - @remirror/extension-react-component@1.0.0-next.15
  - @remirror/extension-react-ssr@1.0.0-next.15
  - @remirror/extension-search@1.0.0-next.15
  - @remirror/extension-text@1.0.0-next.15
  - @remirror/extension-trailing-node@1.0.0-next.15
  - @remirror/extension-embed@1.0.0-next.15
  - @remirror/extension-list@1.0.0-next.15
  - @remirror/preset-react@1.0.0-next.15
  - @remirror/preset-table@1.0.0-next.15
  - @remirror/preset-wysiwyg@1.0.0-next.15
  - @remirror/react@1.0.0-next.15
  - @remirror/react-wysiwyg@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 4030b506: For some reason `changesets` is not picking up updates to the depedencies of `remirror`.
- Updated dependencies [d877adb3]
- Updated dependencies [38941404]
- Updated dependencies [cc5c1c1c]
- Updated dependencies [38941404]
- Updated dependencies [e45706e5]
- Updated dependencies [38941404]
- Updated dependencies [3fbb2325]
- Updated dependencies [02704d42]
- Updated dependencies [38941404]
- Updated dependencies [38941404]
- Updated dependencies [f3155b5f]
- Updated dependencies [4571a447]
- Updated dependencies [92342ab0]
  - @remirror/core@1.0.0-next.13
  - @remirror/extension-auto-link@1.0.0-next.13
  - @remirror/extension-base-keymap@1.0.0-next.13
  - @remirror/extension-blockquote@1.0.0-next.13
  - @remirror/extension-bold@1.0.0-next.13
  - @remirror/extension-code@1.0.0-next.13
  - @remirror/extension-code-block@1.0.0-next.13
  - @remirror/extension-emoji@1.0.0-next.13
  - @remirror/extension-hard-break@1.0.0-next.13
  - @remirror/extension-heading@1.0.0-next.13
  - @remirror/extension-history@1.0.0-next.13
  - @remirror/extension-horizontal-rule@1.0.0-next.13
  - @remirror/extension-italic@1.0.0-next.13
  - @remirror/extension-link@1.0.0-next.13
  - @remirror/extension-mention@1.0.0-next.13
  - @remirror/extension-search@1.0.0-next.13
  - @remirror/extension-strike@1.0.0-next.13
  - @remirror/extension-underline@1.0.0-next.13
  - @remirror/extension-yjs@1.0.0-next.13
  - @remirror/extension-list@1.0.0-next.13
  - @remirror/extension-bidi@1.0.0-next.13
  - @remirror/extension-collaboration@1.0.0-next.13
  - @remirror/extension-diff@1.0.0-next.13
  - @remirror/extension-doc@1.0.0-next.13
  - @remirror/extension-drop-cursor@1.0.0-next.13
  - @remirror/extension-epic-mode@1.0.0-next.13
  - @remirror/extension-gap-cursor@1.0.0-next.13
  - @remirror/extension-image@1.0.0-next.13
  - @remirror/extension-paragraph@1.0.0-next.13
  - @remirror/extension-placeholder@1.0.0-next.13
  - @remirror/extension-position-tracker@1.0.0-next.13
  - @remirror/extension-positioner@1.0.0-next.13
  - @remirror/extension-react-component@1.0.0-next.13
  - @remirror/extension-react-ssr@1.0.0-next.13
  - @remirror/extension-text@1.0.0-next.13
  - @remirror/extension-trailing-node@1.0.0-next.13
  - @remirror/preset-core@1.0.0-next.13
  - @remirror/extension-embed@1.0.0-next.13
  - @remirror/preset-react@1.0.0-next.13
  - @remirror/preset-social@1.0.0-next.13
  - @remirror/preset-table@1.0.0-next.13
  - @remirror/preset-wysiwyg@1.0.0-next.13
  - @remirror/core-types@1.0.0-next.13
  - @remirror/react@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13
  - @remirror/core-helpers@1.0.0-next.13
  - @remirror/dom@1.0.0-next.13
  - @remirror/react-social@1.0.0-next.13
  - @remirror/react-wysiwyg@1.0.0-next.13

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 65efac96: Add entrypoint for `remirror/react/renderers`.

### Patch Changes

- Updated dependencies [6468058a]
- Updated dependencies [76d1df83]
- Updated dependencies [3702a83a]
- Updated dependencies [e554ce8c]
- Updated dependencies [5539bc32]
- Updated dependencies [16a683f3]
  - @remirror/core@1.0.0-next.10
  - @remirror/react@1.0.0-next.10
  - @remirror/preset-core@1.0.0-next.10
  - @remirror/extension-react-component@1.0.0-next.10
  - @remirror/extension-react-ssr@1.0.0-next.10
  - @remirror/preset-wysiwyg@1.0.0-next.10
  - @remirror/react-social@1.0.0-next.10
  - @remirror/dom@1.0.0-next.10
  - @remirror/extension-auto-link@1.0.0-next.10
  - @remirror/extension-base-keymap@1.0.0-next.10
  - @remirror/extension-bidi@1.0.0-next.10
  - @remirror/extension-blockquote@1.0.0-next.10
  - @remirror/extension-bold@1.0.0-next.10
  - @remirror/extension-code@1.0.0-next.10
  - @remirror/extension-code-block@1.0.0-next.10
  - @remirror/extension-collaboration@1.0.0-next.10
  - @remirror/extension-diff@1.0.0-next.10
  - @remirror/extension-doc@1.0.0-next.10
  - @remirror/extension-drop-cursor@1.0.0-next.10
  - @remirror/extension-emoji@1.0.0-next.10
  - @remirror/extension-epic-mode@1.0.0-next.10
  - @remirror/extension-gap-cursor@1.0.0-next.10
  - @remirror/extension-hard-break@1.0.0-next.10
  - @remirror/extension-heading@1.0.0-next.10
  - @remirror/extension-history@1.0.0-next.10
  - @remirror/extension-horizontal-rule@1.0.0-next.10
  - @remirror/extension-image@1.0.0-next.10
  - @remirror/extension-italic@1.0.0-next.10
  - @remirror/extension-link@1.0.0-next.10
  - @remirror/extension-mention@1.0.0-next.10
  - @remirror/extension-paragraph@1.0.0-next.10
  - @remirror/extension-placeholder@1.0.0-next.10
  - @remirror/extension-position-tracker@1.0.0-next.10
  - @remirror/extension-positioner@1.0.0-next.10
  - @remirror/extension-search@1.0.0-next.10
  - @remirror/extension-strike@1.0.0-next.10
  - @remirror/extension-text@1.0.0-next.10
  - @remirror/extension-trailing-node@1.0.0-next.10
  - @remirror/extension-underline@1.0.0-next.10
  - @remirror/extension-yjs@1.0.0-next.10
  - @remirror/extension-embed@1.0.0-next.10
  - @remirror/extension-list@1.0.0-next.10
  - @remirror/preset-react@1.0.0-next.10
  - @remirror/preset-social@1.0.0-next.10
  - @remirror/preset-table@1.0.0-next.10
  - @remirror/react-wysiwyg@1.0.0-next.10

## 1.0.0-next.9

> 2020-07-23

### Patch Changes

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

- b332942b: Fix broken SSR and add unit tests back.
- Updated dependencies [02fdafff]
- Updated dependencies [b332942b]
  - @remirror/react@1.0.0-next.9
  - @remirror/core@1.0.0-next.9
  - @remirror/dom@1.0.0-next.9
  - @remirror/react-social@1.0.0-next.9
  - @remirror/react-wysiwyg@1.0.0-next.9
  - @remirror/extension-auto-link@1.0.0-next.9
  - @remirror/extension-base-keymap@1.0.0-next.9
  - @remirror/extension-bidi@1.0.0-next.9
  - @remirror/extension-blockquote@1.0.0-next.9
  - @remirror/extension-bold@1.0.0-next.9
  - @remirror/extension-code@1.0.0-next.9
  - @remirror/extension-code-block@1.0.0-next.9
  - @remirror/extension-collaboration@1.0.0-next.9
  - @remirror/extension-diff@1.0.0-next.9
  - @remirror/extension-doc@1.0.0-next.9
  - @remirror/extension-drop-cursor@1.0.0-next.9
  - @remirror/extension-emoji@1.0.0-next.9
  - @remirror/extension-epic-mode@1.0.0-next.9
  - @remirror/extension-gap-cursor@1.0.0-next.9
  - @remirror/extension-hard-break@1.0.0-next.9
  - @remirror/extension-heading@1.0.0-next.9
  - @remirror/extension-history@1.0.0-next.9
  - @remirror/extension-horizontal-rule@1.0.0-next.9
  - @remirror/extension-image@1.0.0-next.9
  - @remirror/extension-italic@1.0.0-next.9
  - @remirror/extension-link@1.0.0-next.9
  - @remirror/extension-mention@1.0.0-next.9
  - @remirror/extension-paragraph@1.0.0-next.9
  - @remirror/extension-placeholder@1.0.0-next.9
  - @remirror/extension-position-tracker@1.0.0-next.9
  - @remirror/extension-positioner@1.0.0-next.9
  - @remirror/extension-react-component@1.0.0-next.9
  - @remirror/extension-react-ssr@1.0.0-next.9
  - @remirror/extension-search@1.0.0-next.9
  - @remirror/extension-strike@1.0.0-next.9
  - @remirror/extension-text@1.0.0-next.9
  - @remirror/extension-trailing-node@1.0.0-next.9
  - @remirror/extension-underline@1.0.0-next.9
  - @remirror/extension-yjs@1.0.0-next.9
  - @remirror/preset-core@1.0.0-next.9
  - @remirror/extension-embed@1.0.0-next.9
  - @remirror/extension-list@1.0.0-next.9
  - @remirror/preset-react@1.0.0-next.9
  - @remirror/preset-social@1.0.0-next.9
  - @remirror/preset-table@1.0.0-next.9
  - @remirror/preset-wysiwyg@1.0.0-next.9

## 1.0.0-next.5

> 2020-07-17

### Patch Changes

- d186b75a: Correct the incorrect `remirror/react/ssr` and `remirror/react/component` exports. They were incorrectly referencing each other.
- Updated dependencies [4628d342]
- Updated dependencies [e9286ed9]
  - @remirror/react@1.0.0-next.5
  - @remirror/extension-paragraph@1.0.0-next.5
  - @remirror/react-social@1.0.0-next.5
  - @remirror/react-wysiwyg@1.0.0-next.5

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [64edeec2]
- Updated dependencies [e1a1b6ec]
- Updated dependencies [9f495078]
- Updated dependencies [2d74596b]
- Updated dependencies [5d5970ae]
- Updated dependencies [64edeec2]
  - @remirror/core@1.0.0-next.4
  - @remirror/react@1.0.0-next.4
  - @remirror/preset-table@1.0.0-next.4
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/dom@1.0.0-next.4
  - @remirror/extension-auto-link@1.0.0-next.4
  - @remirror/extension-base-keymap@1.0.0-next.4
  - @remirror/extension-bidi@1.0.0-next.4
  - @remirror/extension-blockquote@1.0.0-next.4
  - @remirror/extension-bold@1.0.0-next.4
  - @remirror/extension-code@1.0.0-next.4
  - @remirror/extension-code-block@1.0.0-next.4
  - @remirror/extension-collaboration@1.0.0-next.4
  - @remirror/extension-diff@1.0.0-next.4
  - @remirror/extension-doc@1.0.0-next.4
  - @remirror/extension-drop-cursor@1.0.0-next.4
  - @remirror/extension-emoji@1.0.0-next.4
  - @remirror/extension-epic-mode@1.0.0-next.4
  - @remirror/extension-gap-cursor@1.0.0-next.4
  - @remirror/extension-hard-break@1.0.0-next.4
  - @remirror/extension-heading@1.0.0-next.4
  - @remirror/extension-history@1.0.0-next.4
  - @remirror/extension-horizontal-rule@1.0.0-next.4
  - @remirror/extension-image@1.0.0-next.4
  - @remirror/extension-italic@1.0.0-next.4
  - @remirror/extension-link@1.0.0-next.4
  - @remirror/extension-mention@1.0.0-next.4
  - @remirror/extension-paragraph@1.0.0-next.4
  - @remirror/extension-placeholder@1.0.0-next.4
  - @remirror/extension-position-tracker@1.0.0-next.4
  - @remirror/extension-positioner@1.0.0-next.4
  - @remirror/extension-react-ssr@1.0.0-next.4
  - @remirror/extension-search@1.0.0-next.4
  - @remirror/extension-strike@1.0.0-next.4
  - @remirror/extension-text@1.0.0-next.4
  - @remirror/extension-trailing-node@1.0.0-next.4
  - @remirror/extension-underline@1.0.0-next.4
  - @remirror/extension-yjs@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - @remirror/preset-core@1.0.0-next.4
  - @remirror/extension-embed@1.0.0-next.4
  - @remirror/extension-list@1.0.0-next.4
  - @remirror/preset-react@1.0.0-next.4
  - @remirror/preset-social@1.0.0-next.4
  - @remirror/preset-wysiwyg@1.0.0-next.4
  - @remirror/react-social@1.0.0-next.4
  - @remirror/react-utils@1.0.0-next.4
  - @remirror/react-wysiwyg@1.0.0-next.4
  - @remirror/theme@1.0.0-next.4
  - @remirror/extension-react-component@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3
  - @remirror/core-utils@1.0.0-next.3
  - @remirror/dom@1.0.0-next.3
  - @remirror/extension-auto-link@1.0.0-next.3
  - @remirror/extension-base-keymap@1.0.0-next.3
  - @remirror/extension-bidi@1.0.0-next.3
  - @remirror/extension-blockquote@1.0.0-next.3
  - @remirror/extension-bold@1.0.0-next.3
  - @remirror/extension-code@1.0.0-next.3
  - @remirror/extension-code-block@1.0.0-next.3
  - @remirror/extension-collaboration@1.0.0-next.3
  - @remirror/extension-diff@1.0.0-next.3
  - @remirror/extension-doc@1.0.0-next.3
  - @remirror/extension-drop-cursor@1.0.0-next.3
  - @remirror/extension-emoji@1.0.0-next.3
  - @remirror/extension-epic-mode@1.0.0-next.3
  - @remirror/extension-gap-cursor@1.0.0-next.3
  - @remirror/extension-hard-break@1.0.0-next.3
  - @remirror/extension-heading@1.0.0-next.3
  - @remirror/extension-history@1.0.0-next.3
  - @remirror/extension-horizontal-rule@1.0.0-next.3
  - @remirror/extension-image@1.0.0-next.3
  - @remirror/extension-italic@1.0.0-next.3
  - @remirror/extension-link@1.0.0-next.3
  - @remirror/extension-mention@1.0.0-next.3
  - @remirror/extension-paragraph@1.0.0-next.3
  - @remirror/extension-placeholder@1.0.0-next.3
  - @remirror/extension-position-tracker@1.0.0-next.3
  - @remirror/extension-positioner@1.0.0-next.3
  - @remirror/extension-react-ssr@1.0.0-next.3
  - @remirror/extension-search@1.0.0-next.3
  - @remirror/extension-strike@1.0.0-next.3
  - @remirror/extension-text@1.0.0-next.3
  - @remirror/extension-trailing-node@1.0.0-next.3
  - @remirror/extension-underline@1.0.0-next.3
  - @remirror/extension-yjs@1.0.0-next.3
  - @remirror/preset-core@1.0.0-next.3
  - @remirror/extension-embed@1.0.0-next.3
  - @remirror/extension-list@1.0.0-next.3
  - @remirror/preset-react@1.0.0-next.3
  - @remirror/preset-social@1.0.0-next.3
  - @remirror/preset-table@1.0.0-next.3
  - @remirror/preset-wysiwyg@1.0.0-next.3
  - @remirror/react@1.0.0-next.3
  - @remirror/react-social@1.0.0-next.3
  - @remirror/react-wysiwyg@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core@1.0.0-next.1
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1
  - @remirror/dom@1.0.0-next.1
  - @remirror/extension-auto-link@1.0.0-next.1
  - @remirror/extension-base-keymap@1.0.0-next.1
  - @remirror/extension-bidi@1.0.0-next.1
  - @remirror/extension-blockquote@1.0.0-next.1
  - @remirror/extension-bold@1.0.0-next.1
  - @remirror/extension-code@1.0.0-next.1
  - @remirror/extension-code-block@1.0.0-next.1
  - @remirror/extension-collaboration@1.0.0-next.1
  - @remirror/extension-diff@1.0.0-next.1
  - @remirror/extension-doc@1.0.0-next.1
  - @remirror/extension-drop-cursor@1.0.0-next.1
  - @remirror/extension-emoji@1.0.0-next.1
  - @remirror/extension-epic-mode@1.0.0-next.1
  - @remirror/extension-gap-cursor@1.0.0-next.1
  - @remirror/extension-hard-break@1.0.0-next.1
  - @remirror/extension-heading@1.0.0-next.1
  - @remirror/extension-history@1.0.0-next.1
  - @remirror/extension-horizontal-rule@1.0.0-next.1
  - @remirror/extension-image@1.0.0-next.1
  - @remirror/extension-italic@1.0.0-next.1
  - @remirror/extension-link@1.0.0-next.1
  - @remirror/extension-mention@1.0.0-next.1
  - @remirror/extension-paragraph@1.0.0-next.1
  - @remirror/extension-placeholder@1.0.0-next.1
  - @remirror/extension-position-tracker@1.0.0-next.1
  - @remirror/extension-positioner@1.0.0-next.1
  - @remirror/extension-react-ssr@1.0.0-next.1
  - @remirror/extension-search@1.0.0-next.1
  - @remirror/extension-strike@1.0.0-next.1
  - @remirror/extension-text@1.0.0-next.1
  - @remirror/extension-trailing-node@1.0.0-next.1
  - @remirror/extension-underline@1.0.0-next.1
  - @remirror/extension-yjs@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - @remirror/preset-core@1.0.0-next.1
  - @remirror/extension-embed@1.0.0-next.1
  - @remirror/extension-list@1.0.0-next.1
  - @remirror/preset-react@1.0.0-next.1
  - @remirror/preset-social@1.0.0-next.1
  - @remirror/preset-table@1.0.0-next.1
  - @remirror/preset-wysiwyg@1.0.0-next.1
  - @remirror/react@1.0.0-next.1
  - @remirror/react-social@1.0.0-next.1
  - @remirror/react-utils@1.0.0-next.1
  - @remirror/react-wysiwyg@1.0.0-next.1
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

- 8334294e: Make `react`, `react-dom` and their `@type` counterparts optional peer depedencies. This means users will no longer receive a warning if they install the package without react.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [undefined]
- Updated dependencies [09e990cb]
- Updated dependencies [141c7864]
  - @remirror/core@1.0.0-next.0
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/dom@1.0.0-next.0
  - @remirror/extension-auto-link@1.0.0-next.0
  - @remirror/extension-base-keymap@1.0.0-next.0
  - @remirror/extension-bidi@1.0.0-next.0
  - @remirror/extension-blockquote@1.0.0-next.0
  - @remirror/extension-bold@1.0.0-next.0
  - @remirror/extension-code@1.0.0-next.0
  - @remirror/extension-code-block@1.0.0-next.0
  - @remirror/extension-collaboration@1.0.0-next.0
  - @remirror/extension-diff@1.0.0-next.0
  - @remirror/extension-doc@1.0.0-next.0
  - @remirror/extension-drop-cursor@1.0.0-next.0
  - @remirror/extension-emoji@1.0.0-next.0
  - @remirror/extension-epic-mode@1.0.0-next.0
  - @remirror/extension-gap-cursor@1.0.0-next.0
  - @remirror/extension-hard-break@1.0.0-next.0
  - @remirror/extension-heading@1.0.0-next.0
  - @remirror/extension-history@1.0.0-next.0
  - @remirror/extension-horizontal-rule@1.0.0-next.0
  - @remirror/extension-image@1.0.0-next.0
  - @remirror/extension-italic@1.0.0-next.0
  - @remirror/extension-link@1.0.0-next.0
  - @remirror/extension-mention@1.0.0-next.0
  - @remirror/extension-paragraph@1.0.0-next.0
  - @remirror/extension-placeholder@1.0.0-next.0
  - @remirror/extension-position-tracker@1.0.0-next.0
  - @remirror/extension-positioner@1.0.0-next.0
  - @remirror/extension-react-ssr@1.0.0-next.0
  - @remirror/extension-search@1.0.0-next.0
  - @remirror/extension-strike@1.0.0-next.0
  - @remirror/extension-text@1.0.0-next.0
  - @remirror/extension-trailing-node@1.0.0-next.0
  - @remirror/extension-underline@1.0.0-next.0
  - @remirror/extension-yjs@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - @remirror/preset-core@1.0.0-next.0
  - @remirror/extension-embed@1.0.0-next.0
  - @remirror/extension-list@1.0.0-next.0
  - @remirror/preset-react@1.0.0-next.0
  - @remirror/preset-social@1.0.0-next.0
  - @remirror/preset-table@1.0.0-next.0
  - @remirror/preset-wysiwyg@1.0.0-next.0
  - @remirror/react@1.0.0-next.0
  - @remirror/react-social@1.0.0-next.0
  - @remirror/react-utils@1.0.0-next.0
  - @remirror/react-wysiwyg@1.0.0-next.0
  - @remirror/theme@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/react@0.13.1

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - @remirror/react@0.7.7

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react@0.7.6

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react@0.7.5

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react@0.7.3
