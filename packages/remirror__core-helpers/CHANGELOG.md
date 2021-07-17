# @remirror/core-helpers

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

### Patch Changes

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`9b4a3bdb8`](https://github.com/remirror/remirror/commit/9b4a3bdb8e1c594d353c5c5be2844133cda0f51a)]:
  - @remirror/core-constants@1.0.0
  - @remirror/types@0.1.0

## 1.0.0-next.60

> 2020-12-17

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies [[`4504aadb`](https://github.com/remirror/remirror/commit/4504aadb09be7d632ea8c5861755f31b150781d0)]:
  - @remirror/core-constants@1.0.0-next.60
  - @remirror/core-types@1.0.0-next.60

## 1.0.0-next.59

> 2020-12-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.59
  - @remirror/core-types@1.0.0-next.59

## 1.0.0-next.58

> 2020-11-29

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.58
  - @remirror/core-types@1.0.0-next.58

## 1.0.0-next.57

> 2020-11-25

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.57
  - @remirror/core-types@1.0.0-next.57

## 1.0.0-next.56

> 2020-11-24

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.56
  - @remirror/core-types@1.0.0-next.56

## 1.0.0-next.55

> 2020-11-20

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.55
  - @remirror/core-types@1.0.0-next.55

## 1.0.0-next.54

> 2020-11-19

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.54
  - @remirror/core-types@1.0.0-next.54

## 1.0.0-next.53

> 2020-11-12

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.53
  - @remirror/core-types@1.0.0-next.53

## 1.0.0-next.52

> 2020-11-06

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.52
  - @remirror/core-types@1.0.0-next.52

## 1.0.0-next.51

> 2020-10-27

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.51
  - @remirror/core-types@1.0.0-next.51

## 1.0.0-next.50

> 2020-10-15

### Patch Changes

- [`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade package dependencies.

- Updated dependencies [[`bd8ac67d`](https://github.com/remirror/remirror/commit/bd8ac67da57c85e67f84cf41e04900f99f4f0455)]:
  - @remirror/core-constants@1.0.0-next.50
  - @remirror/core-types@1.0.0-next.50

## 1.0.0-next.49

> 2020-10-10

### Patch Changes

- Forced update in pre-release mode.

- Updated dependencies []:
  - @remirror/core-constants@1.0.0-next.49
  - @remirror/core-types@1.0.0-next.49

## 1.0.0-next.47

> 2020-10-08

### Patch Changes

- [`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update external dependencies.

- Updated dependencies [[`4658d45c`](https://github.com/remirror/remirror/commit/4658d45ce2c60eb609cb54b19a86cc3fd4a1f33e)]:
  - @remirror/core-types@1.0.0-next.47

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies []:
  - @remirror/core-types@1.0.0-next.44

## 1.0.0-next.40

> 2020-09-24

### Patch Changes

- Updated dependencies [[`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4)]:
  - @remirror/core-types@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies []:
  - @remirror/core-types@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Major Changes

- [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a) [#689](https://github.com/remirror/remirror/pull/689) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove `logError` method from the `RemirrorError`. Add `disableLogging` as a property instead.

### Patch Changes

- Updated dependencies []:
  - @remirror/core-types@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies []:
  - @remirror/core-types@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Patch Changes

- [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- Updated dependencies [[`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec)]:
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Major Changes

- [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0) [#667](https://github.com/remirror/remirror/pull/667) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove `Merge` export from `@remirror/core-helpers`.

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc)]:
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Patch Changes

- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [92ed4135]
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Minor Changes

- [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3) [#633](https://github.com/remirror/remirror/pull/633) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make `focus` command chainable and add `manager.tr` property for creating chainable commands. This means that the `focus` method returned by `useRemirror()` can now be safely used within a controlled editor. It uses the shared chainable transaction so that the state update does not override other state updates.

### Patch Changes

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32

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

## 1.0.0-next.28

> 2020-08-27

### Major Changes

- [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - BREAKING: Remove `trim` export.

### Patch Changes

- Updated dependencies []:
  - @remirror/core-types@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26

## 1.0.0-next.22

> 2020-08-17

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
  - @remirror/core-types@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- 770e3d4a: Update package dependencies.
- Updated dependencies [8f9eb16c]
  - @remirror/core-types@1.0.0-next.20

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [6528323e]
- Updated dependencies [a7037832]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-types@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- 92342ab0: Throw error in `Preset` and `Extension` when attempting to update a non-dynamic option at runtime.
- Updated dependencies [e45706e5]
- Updated dependencies [92342ab0]
  - @remirror/core-types@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Minor Changes

- d8aa2432: Remove type guard from `isEmptyArray` and `isEmptyObject` as they were incorrect.

## 1.0.0-next.11

> 2020-07-26

### Major Changes

- 21a9650c: Rename `getArray` to `getLazyArray`. Also bump the version of `@remirror/core-helpers` to make sure it is released.

## 1.0.0-next.6

> 2020-07-20

### Patch Changes

- e06a3623: Upgrade package dependencies.
- Updated dependencies [e06a3623]
  - @remirror/core-constants@1.0.0-next.6
  - @remirror/core-types@1.0.0-next.6

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1

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

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core-types@0.9.0

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-types@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
