# jest-prosemirror

## 1.0.0

> 2021-07-17

### Major Changes

- [#983](https://github.com/remirror/remirror/pull/983) [`47df75996`](https://github.com/remirror/remirror/commit/47df75996e26b9e8fc9b070e5444494605321610) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade to [`@testing-library/dom@8.0.0`](https://github.com/testing-library/dom-testing-library/releases/tag/v8.0.0) which has breaking changes for downstream users.

* [#706](https://github.com/remirror/remirror/pull/706) [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Here's what's changed in the beta release.

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

- [#948](https://github.com/remirror/remirror/pull/948) [`5c981d96d`](https://github.com/remirror/remirror/commit/5c981d96d9344f2507f32a4213bd55c17bfcd92f) Thanks [@whawker](https://github.com/whawker)! - - Add `toBeValidNode` matcher to assert valid marks and content
  - Fix callout extension input rule followed by enter key

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`b6f29f0e3`](https://github.com/remirror/remirror/commit/b6f29f0e3dfa2806023d13e68f34ee57ba5c1ae9), [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c)]:
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
  - @remirror/core-types@1.0.0
  - @remirror/core-utils@1.0.0
  - @remirror/pm@1.0.0
  - test-keyboard@1.0.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0), [`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/core-utils@1.0.0-next.60
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/core-helpers@1.0.0-next.60
  - @remirror/core-types@1.0.0-next.60
  - @remirror/pm@1.0.0-next.60
  - test-keyboard@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`e69115f1`](https://github.com/remirror/remirror/commit/e69115f141c12c7dd21bd89c716b12b279414364)]:
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-helpers@1.0.0-next.59
  - @remirror/core-types@1.0.0-next.59
  - @remirror/pm@1.0.0-next.59
  - test-keyboard@1.0.0-next.59
  - @remirror/core-utils@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-helpers@1.0.0-next.58
  - @remirror/core-types@1.0.0-next.58
  - @remirror/core-utils@1.0.0-next.58
  - @remirror/pm@1.0.0-next.58
  - test-keyboard@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-helpers@1.0.0-next.57
  - @remirror/core-types@1.0.0-next.57
  - @remirror/core-utils@1.0.0-next.57
  - @remirror/pm@1.0.0-next.57
  - test-keyboard@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-helpers@1.0.0-next.56
  - @remirror/core-types@1.0.0-next.56
  - @remirror/core-utils@1.0.0-next.56
  - @remirror/pm@1.0.0-next.56
  - test-keyboard@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3), [`ee1ab4f3`](https://github.com/remirror/remirror/commit/ee1ab4f38bc1a169821b66017d5d24eb00275f0f), [`1adea88a`](https://github.com/remirror/remirror/commit/1adea88a600ea5f92f4403f6817a4acd140eb0b3)]:
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-helpers@1.0.0-next.55
  - @remirror/core-types@1.0.0-next.55
  - @remirror/pm@1.0.0-next.55
  - test-keyboard@1.0.0-next.55
  - @remirror/core-utils@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`1a0348e7`](https://github.com/remirror/remirror/commit/1a0348e795e1bef83ef31489e0aa3c256da9e434)]:
  - @remirror/core-utils@1.0.0-next.54
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-helpers@1.0.0-next.54
  - @remirror/core-types@1.0.0-next.54
  - @remirror/pm@1.0.0-next.54
  - test-keyboard@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`a1d65df6`](https://github.com/remirror/remirror/commit/a1d65df634f5a575a1cd37b584f52b7b526d3655)]:
  - @remirror/core-utils@1.0.0-next.53
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-helpers@1.0.0-next.53
  - @remirror/core-types@1.0.0-next.53
  - @remirror/pm@1.0.0-next.53
  - test-keyboard@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-helpers@1.0.0-next.52
  - @remirror/core-types@1.0.0-next.52
  - @remirror/core-utils@1.0.0-next.52
  - @remirror/pm@1.0.0-next.52
  - test-keyboard@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`997eb56a`](https://github.com/remirror/remirror/commit/997eb56a49ad653544fcd00b83e394e63df3a116)]:
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-helpers@1.0.0-next.51
  - @remirror/core-types@1.0.0-next.51
  - @remirror/core-utils@1.0.0-next.51
  - test-keyboard@1.0.0-next.51
  - @remirror/pm@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455), [`d27c6e1a`](https://github.com/remirror/remirror/commit/d27c6e1aa83bfd59bde0f1659f0989deb66dad24)]:
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-helpers@1.0.0-next.50
  - @remirror/core-types@1.0.0-next.50
  - @remirror/core-utils@1.0.0-next.50
  - @remirror/pm@1.0.0-next.50
  - test-keyboard@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-helpers@1.0.0-next.49
  - @remirror/core-types@1.0.0-next.49
  - @remirror/core-utils@1.0.0-next.49
  - @remirror/pm@1.0.0-next.49
  - test-keyboard@1.0.0-next.49

## 1.0.0-next.48

> 2020-10-08

### Patch Changes

- Updated dependencies [[`a2fa2c2b`](https://github.com/remirror/remirror/commit/a2fa2c2b935a6fce99e3f79aad8a207c920e236e)]:
  - @remirror/core-utils@1.0.0-next.48

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core-helpers@1.0.0-next.47
  - @remirror/core-types@1.0.0-next.47
  - @remirror/core-utils@1.0.0-next.47
  - @remirror/pm@1.0.0-next.47
  - test-keyboard@1.0.0-next.47

## 1.0.0-next.46

> 2020-10-06

### Minor Changes

- [`0198b9fc`](https://github.com/remirror/remirror/commit/0198b9fce5caa1c7d4670e615b92b1231a0c2e26) [#740](https://github.com/remirror/remirror/pull/740) Thanks [@whawker](https://github.com/whawker)! - Add strike mark to the `jest-prosemirror` schema

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-utils@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44
  - test-keyboard@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Patch Changes

- Updated dependencies [[`b030cb6e`](https://github.com/remirror/remirror/commit/b030cb6e50cb6fdc045a4680f4861ad145609197)]:
  - @remirror/core-utils@1.0.0-next.43

## 1.0.0-next.42

> 2020-09-26

### Patch Changes

- Updated dependencies [[`9fa07878`](https://github.com/remirror/remirror/commit/9fa078780504bff81d28183ee8cda3b599412cf0)]:
  - @remirror/core-utils@1.0.0-next.42

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade external dependencies.

- Updated dependencies [[`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef), [`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core-utils@1.0.0-next.40
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40
  - test-keyboard@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-utils@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39
  - test-keyboard@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38
  - @remirror/core-utils@1.0.0-next.38
  - test-keyboard@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/pm@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-utils@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37
  - test-keyboard@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Minor Changes

- [`f1b8fc46`](https://github.com/remirror/remirror/commit/f1b8fc46a56877c1b7274f19e808901f9716e25e) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Cleanup matchers.

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec)]:
  - @remirror/core-utils@1.0.0-next.35
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35
  - test-keyboard@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc) [#668](https://github.com/remirror/remirror/pull/668) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `node` cursor selection. Now it selects the right node position.

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/core-utils@1.0.0-next.34
  - test-keyboard@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 7a34e15d: Add `forwardDelete` to `jest-remirror` and `jest-prosemirror`.
- 92ed4135: Add support for `anchor` and `head` cursors when writing tests. Also fix `selectText` when position is `0`.

### Patch Changes

- Updated dependencies [92ed4135]
- Updated dependencies [7a34e15d]
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [7a34e15d]
- Updated dependencies [92ed4135]
  - @remirror/core-utils@1.0.0-next.33
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33
  - @remirror/core-helpers@1.0.0-next.33
  - test-keyboard@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core-utils@1.0.0-next.32
  - @remirror/core-helpers@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32
  - test-keyboard@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Patch Changes

- Updated dependencies [[`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d)]:
  - @remirror/core-helpers@1.0.0-next.31
  - @remirror/core-utils@1.0.0-next.31
  - test-keyboard@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core-utils@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28
  - @remirror/core-utils@1.0.0-next.28
  - test-keyboard@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-utils@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - test-keyboard@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Patch Changes

- Updated dependencies [3f2625bf]
  - @remirror/core-utils@1.0.0-next.25

## 1.0.0-next.22

> 2020-08-17

### Major Changes

- 113560bb: Required temporary fix to resolve issue with unlinked packages in prerelease mode. See the [issue](https://github.com/atlassian/changesets/issues/442) for more details.

### Patch Changes

- 65638a1c: Fix cyclic JSON error when tests when tests failed.
- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
- Updated dependencies [113560bb]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-utils@1.0.0-next.22
  - test-keyboard@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 0.8.4-next.6

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-utils@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - test-keyboard@0.7.7-next.7
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.5

> 2020-08-14

### Patch Changes

- 770e3d4a: Update package dependencies.
- 92653907: Upgrade package dependencies.
- Updated dependencies [6d7edc85]
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [7c603a5e]
- Updated dependencies [92653907]
  - @remirror/core-utils@1.0.0-next.20
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20
  - test-keyboard@0.7.7-next.6

## 1.0.0-next.4

> 2020-08-01

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- 68c524ee: Remove ESModule build which is not supported by jest.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [f032db7e]
- Updated dependencies [a7037832]
- Updated dependencies [6e8b749a]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-types@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16
  - test-keyboard@1.0.0-next.5

## 1.0.0-next.3

> 2020-07-17

### Patch Changes

- 5ebf2827: Fix broken `jest-prosemirror/environment` import and `jest-remirror/environment` for automatic setup. Also enable the `jest-prosemirror/serializer` to correctly serialize the prosemirror content.

## 1.0.0-next.2

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4
  - test-keyboard@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1
  - test-keyboard@1.0.0-next.1

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
- dd16d45d: Rewrite packages using the new API

### Minor Changes

- 8334294e: `jest-prosemirror` no longer relies on any react dependencies.
- 9a699e80: Upgrade dependencies to use v26.0.0 of jest.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0
  - test-keyboard@1.0.0-next.0

## 0.8.3

### Patch Changes

- b134e437: Support `jest` v25+.

## 0.8.2

### Patch Changes

- d2a288aa: Remove @types/prosemirror-tables from dependencies
- 000fdfb0: Upgraded external dependencies with major releases.

## 0.8.1

### Patch Changes

- Updated dependencies [c4645570]
- Updated dependencies [0300d01c]
  - @remirror/core-utils@0.8.0
  - @remirror/core-types@0.9.0
  - @remirror/core-helpers@0.7.6
  - test-keyboard@0.7.6

## 0.8.0

### Minor Changes

- 24f83413: Create a new class `ProsemirrorTestChain` for chaining the return from `createEditor`. Previously it was manually chained with a function. The plan is to extend this class within the `jest-remirror` codebase.

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5
  - test-keyboard@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/core-utils@0.7.4
  - test-keyboard@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/core-utils@0.7.3
  - test-keyboard@0.7.3
