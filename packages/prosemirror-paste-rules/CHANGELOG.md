# prosemirror-paste-rules

## 3.0.0-beta.4

> 2024-07-18

### Patch Changes

- 760d9739d: Add a validate property to each of the Node or Mark attributes used in Remirror (v3 branch)
- Updated dependencies [760d9739d]
  - @remirror/core-constants@3.0.0-beta.3
  - @remirror/core-helpers@4.0.0-beta.3

## 3.0.0-beta.3

> 2023-11-20

### Patch Changes

- Updated dependencies [469d7ce8f]
  - @remirror/core-constants@3.0.0-beta.2
  - @remirror/core-helpers@4.0.0-beta.2

## 3.0.0-beta.2

> 2023-11-08

### Patch Changes

- 93f4ebdc2: Bump all packages to rebuild for browsers since 2017
- Updated dependencies [93f4ebdc2]
  - @remirror/core-constants@3.0.0-beta.1
  - @remirror/core-helpers@4.0.0-beta.1

## 3.0.0-beta.1

> 2023-11-06

### Patch Changes

- b1d683fdb: Update ProseMirror packages to latest versions.

  Use newly provided `Transform.setDocAttribute` to update doc node attributes, rather than custom step type.

## 3.0.0-beta.0

> 2023-10-06

### Major Changes

- 8f5467ae6: Use ES [Stage-3 decorators](https://github.com/tc39/proposal-decorators) syntax.

### Patch Changes

- Updated dependencies [8f5467ae6]
  - @remirror/core-constants@3.0.0-beta.0
  - @remirror/core-helpers@4.0.0-beta.0

## 2.0.8

> 2024-07-17

### Patch Changes

- 7caff8388: Add a validate property to each of the Node or Mark attributes used in Remirror
- 7caff8388: Bump ProseMirror to latest versions to address potential XSS vulnerability found in ProseMirror's DOMSerializer

  See: https://discuss.prosemirror.net/t/heads-up-xss-risk-in-domserializer/6572

## 2.0.7

> 2023-07-31

### Patch Changes

- d50dadf27: Update dependencies.

## 2.0.6

> 2023-07-30

### Patch Changes

- Updated dependencies [2f542ccb0]
  - @remirror/core-helpers@3.0.0

## 2.0.5

> 2023-04-26

### Patch Changes

- 7b2c3928d: Rollup `.d.ts` file.
- Updated dependencies [7b2c3928d]
  - @remirror/core-constants@2.0.1
  - @remirror/core-helpers@2.0.2

## 2.0.4

> 2023-03-10

### Patch Changes

- 414fa25d5: Update the type for `BaseRegexPasteRule.getAttributes`. Now you can use `match.groups` in `getAttributes` callback.

## 2.0.3

> 2022-12-29

### Patch Changes

- Updated dependencies [6a93233e2]
  - @remirror/core-helpers@2.0.1

## 2.0.2

> 2022-12-10

### Patch Changes

- f62c04ad3: Update all `prosemirror` dependencies to latest version.
- 46c1762e3: Fixes the `Cannot read properties of null (reading 'lastChild')` error when pasting a part of a nested list from ProseMirror into ProseMirror with paste rules.

## 2.0.1

> 2022-10-27

### Patch Changes

- b637f9f3e: Update dependencies.

## 2.0.0

> 2022-09-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0
  - @remirror/core-constants@2.0.0

## 2.0.0-beta.19

> 2022-09-12

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.19
  - @remirror/core-helpers@2.0.0-beta.19

## 2.0.0-beta.18

> 2022-09-12

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.18
  - @remirror/core-helpers@2.0.0-beta.18

## 2.0.0-beta.17

> 2022-09-11

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Support both ESM and CJS.
- Update ProseMirror packages to latest versions.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.17
  - @remirror/core-constants@2.0.0-beta.17

## 2.0.0-beta.16

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Support both ESM and CJS.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.16
  - @remirror/core-helpers@2.0.0-beta.16

## 2.0.0-beta.15

> 2022-09-08

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Support both ESM and CJS.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.15
  - @remirror/core-constants@2.0.0-beta.15

## 2.0.0-beta.14

> 2022-09-05

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Support both ESM and CJS.
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.14
  - @remirror/core-constants@2.0.0-beta.14

## 2.0.0-beta.13

> 2022-08-04

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.13
  - @remirror/core-constants@2.0.0-beta.13

## 2.0.0-beta.12

> 2022-07-20

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.12
  - @remirror/core-helpers@2.0.0-beta.12

## 2.0.0-beta.11

> 2022-07-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.11
  - @remirror/core-constants@2.0.0-beta.11

## 2.0.0-beta.10

> 2022-07-19

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.10
  - @remirror/core-constants@2.0.0-beta.10

## 2.0.0-beta.9

> 2022-07-18

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- When pasting some text that should be transformed into multiple adjacent inline nodes, avoid creating an empty text node.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.9
  - @remirror/core-constants@2.0.0-beta.9

## 2.0.0-beta.8

> 2022-07-13

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.8
  - @remirror/core-constants@2.0.0-beta.8

## 2.0.0-beta.7

> 2022-07-11

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.7
  - @remirror/core-helpers@2.0.0-beta.7

## 2.0.0-beta.6

> 2022-07-08

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.6
  - @remirror/core-constants@2.0.0-beta.6

## 2.0.0-beta.5

> 2022-07-01

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.5
  - @remirror/core-constants@2.0.0-beta.5

## 2.0.0-beta.4

> 2022-06-29

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.4
  - @remirror/core-constants@2.0.0-beta.4

## 2.0.0-beta.3

> 2022-06-26

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.3
  - @remirror/core-constants@2.0.0-beta.3

## 2.0.0-beta.2

> 2022-06-26

### Major Changes

- Migrate to pure ESM!
- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Update ProseMirror packages to latest versions.
- Expose the return type of the throttle and debounce helpers
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-constants@2.0.0-beta.2
  - @remirror/core-helpers@2.0.0-beta.2

## 2.0.0-beta.1

> 2022-06-20

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.
- Migrate to pure ESM!

### Patch Changes

- Expose the return type of the throttle and debounce helpers
- Update ProseMirror packages to latest versions.
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.1
  - @remirror/core-constants@2.0.0-beta.1

## 2.0.0-beta.0

> 2022-05-31

### Major Changes

- Use [official TypeScript type definitions](https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624) from ProseMirror.

### Patch Changes

- Updated dependencies
  - @remirror/core-helpers@2.0.0-beta.0
  - @remirror/core-constants@2.0.0-beta.0

## 1.1.2

> 2022-05-31

### Patch Changes

- Lock ProseMirror pacakges to lower versions.

  The latest ProseMirror includes the buit-in TypeScript declaration, which is incompatible with the TypeScript definition in Remirror v1.

  See also: https://discuss.prosemirror.net/t/prosemirror-is-now-a-typescript-project/4624

## 1.1.1

> 2022-05-16

### Patch Changes

- Fix open depths in node paste rules.

  When excuting a node paste rule, only reset open depths ([openStart](https://prosemirror.net/docs/ref/#model.Slice.openStart) and [openEnd](https://prosemirror.net/docs/ref/#model.Slice.openEnd)) when the node paste rule is actually applied and it's for a block node.

  This patch will fix the extra paragraph after pasting text.

## 1.1.0

> 2022-05-05

### Minor Changes

- Allow `transformMatch` to invalidate a paste rule by explicitly returning `false`

### Patch Changes

- Update ProseMirror packages.

## 1.0.11

> 2022-05-03

### Patch Changes

- Paste multiple block nodes correctly.

## 1.0.10

> 2022-04-04

### Patch Changes

- Update dependency prosemirror-view.

## 1.0.9

> 2022-03-01

### Patch Changes

- Fix an issue that causes the selected text being deleted when pasting.

## 1.0.8

> 2022-02-25

### Patch Changes

- Fixes an issue that causes invalid duplicate marks when using `pasteRules` plugin.

* Fixes an issue that causes some text nodes to be deleted when using `replaceSelection`.

## 1.0.7

> 2022-01-17

### Patch Changes

- Update ProseMirror dependencies.

## 1.0.6

> 2022-01-03

### Patch Changes

- Make sure that "main", "module" and "types" fields within the `package.json` are prefixed with `./`. This is a [best practice](https://github.com/remirror/remirror/pull/1451#issuecomment-1003858682) according to node.js, esbuild and vite's documentation.

- Updated dependencies []:
  - @remirror/core-constants@1.0.2
  - @remirror/core-helpers@1.0.5

## 1.0.5

> 2021-11-04

### Patch Changes

- Always reset regexp lastIndex before matching.

- Updated dependencies []:
  - @remirror/core-helpers@1.0.4

## 1.0.4

> 2021-10-23

### Patch Changes

- ## '@remirror/core-types': patch

  Fix types so extraAttributes can be any JSON primitivee value

  Previously only strings were allowed, now any JSON primitive value maybe used as an extraAttributes value

- Updated dependencies []:
  - @remirror/core-helpers@1.0.3

## 1.0.3

> 2021-10-01

### Patch Changes

- Correct the error message for `ErrorConstant.REACT_PROVIDER_CONTEXT`.

* Stop hiding error details in production.

* Updated dependencies []:
  - @remirror/core-helpers@1.0.2
  - @remirror/core-constants@1.0.1

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core-helpers@1.0.1

## 1.0.0

> 2021-07-17

### Major Changes

- [#960](https://github.com/remirror/remirror/pull/960) [`494551041`](https://github.com/remirror/remirror/commit/494551041b5453dba16ac6fbc3fa77103c61b1f7) Thanks [@ocavue](https://github.com/ocavue)! - Update the API:

  - For `type: "node"`: removed the `transformMatch` parameter and added a new optional `getContent` parameter, which is a function that transforms the match into content when creating the node. By using `getContent`, users can set content as not only a text node, but also `undefined` or something more complex.

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

- [#905](https://github.com/remirror/remirror/pull/905) [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Allow paste rules to replace the current selection.

### Patch Changes

- [#978](https://github.com/remirror/remirror/pull/978) [`9680a3612`](https://github.com/remirror/remirror/commit/9680a36127448c963453993fc9b6dd1f05abb911) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for replacing the selection of nested nodes. This fixes the issue when pasting a link on text within a list.

- [#901](https://github.com/remirror/remirror/pull/901) [`a88440788`](https://github.com/remirror/remirror/commit/a88440788736e157278f4f81ce5eeec19f55703c) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix paste rules which caused an Maximum call stack size error when active.

- Updated dependencies [[`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8)]:
  - @remirror/core-constants@1.0.0
  - @remirror/core-helpers@1.0.0
