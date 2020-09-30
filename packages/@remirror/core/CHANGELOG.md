# @remirror/core

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-utils@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44

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

## 1.0.0-next.41

> 2020-09-26

### Major Changes

- [`e4701dc4`](https://github.com/remirror/remirror/commit/e4701dc4c045e92e9864f9dabfcee515c4f90bb2) [#712](https://github.com/remirror/remirror/pull/712) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING:** 💥 Rename `Remirror.All` to `Remirror.AllExtensionUnion`.

* [`83217437`](https://github.com/remirror/remirror/commit/8321743733d1aa794c5b5f5b2f07a9e1065d9ac9) [#712](https://github.com/remirror/remirror/pull/712) Thanks [@ifiokjr](https://github.com/ifiokjr)! - 🎉 Add `findPositionerTracker`, `findAllPositionTrackers` and `isSelectionEmpty` to builtin helpers.

## 1.0.0-next.40

> 2020-09-24

### Major Changes

- [`7c5778ed`](https://github.com/remirror/remirror/commit/7c5778edf123e6a812c77b1fd6181d16887b0fa1) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - 🎉 Add support for position tracking to `CommandsExtension`.

  - New commands are available.
    - `commands.addPositionTracker`
    - `commands.removePositionTracker`.
    - `commands.clearPositionTrackers`.
  - New exports from `@remirror/core` including `delayedCommand` which is a building block for creating your own delayed commands.
  - **BREAKING:** 💥 Rename `clearRangeSelection` to `emptySelection` and fix a bug where it would always select the `from` rather than the `anchor`.
  - Add store property `this.store.rawCommands` for access to the original command functions which can sometimes come in handy. Also add it to the manager store and export new type named `RawCommandsFromExtensions`
  - Add `initialState` as a property of the `BaseFramework`.
  - **BREAKING** 💥 Require the `Framework` to be attached to the manager before any calls to `getState` are allowed. If you're using `jest-remirror` this change might break some of your tests that don't recreate the editor between tests.
  - `commands.insertText` now support delayed commands.
  - `commands.insertText` now supports adding marks to the added text.

  ```ts
  commands.insertText('Hello', {
    marks: {
      // The empty object `{}` represents the attributes being added.
      bold: {},
    },
  });
  ```

### Patch Changes

- [`cbf15ec4`](https://github.com/remirror/remirror/commit/cbf15ec4e38832ccf1495442c306d2c0bc6d6f2c) [#698](https://github.com/remirror/remirror/pull/698) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Check `EditorView` has been added to framework before removing the focus and blur listeners.

- Updated dependencies [[`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef), [`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core-utils@1.0.0-next.40
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-utils@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Major Changes

- [`913e8e68`](https://github.com/remirror/remirror/commit/913e8e688081560e53c862adb1187f2f635f7671) [#689](https://github.com/remirror/remirror/pull/689) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: 💥 Rename `Framework.frameworkHelpers` to `baseOutput` and make it protected.

  - Add required `abstract` getter `frameworkOutput`.
  - Add third generic property `Output` which extends `FrameworkOutput`.
  - Remove `manager` property from `FrameworkOutput`.

### Minor Changes

- [`efd2e537`](https://github.com/remirror/remirror/commit/efd2e53779666876bb2d9bdcb917923c0a3a6295) [#689](https://github.com/remirror/remirror/pull/689) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `output` property to the `RemirrorManager`. The property will throw an error if used before the framework is attached.

  Add the `frameworkAttached` property to the `RemirrorManager` which is true when the `manager.output` is available.

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38
  - @remirror/core-utils@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Minor Changes

- [`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405) [#686](https://github.com/remirror/remirror/pull/686) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add all extensions to the `Remirror.AllExtensions` interface to support automatic TypeScript inference for every installed extension package.

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/pm@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-utils@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Minor Changes

- [`34b0f0b3`](https://github.com/remirror/remirror/commit/34b0f0b3c502e5c43712085b9d0da4f4168797aa) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new `store.getCommandParameter` method which returns the properties required to run a command.

* [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.

### Patch Changes

- [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9) [#670](https://github.com/remirror/remirror/pull/670) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fixes `toggleList` command to only update the transaction when dispatch is provided \[[#669](https://github.com/remirror/remirror/issues/669)].

* [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

- [`f9760792`](https://github.com/remirror/remirror/commit/f9760792c887a24336cb0a3777e1b47f6ac87ad3) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade linaria and other dependencies

- Updated dependencies [[`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9), [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec)]:
  - @remirror/core-utils@1.0.0-next.35
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Major Changes

- [`db7165f1`](https://github.com/remirror/remirror/commit/db7165f15c3161e1e51faae4f85571b4319c61be) [#665](https://github.com/remirror/remirror/pull/665) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Refactor `RemirrorManager` and rename `EditorWrapper` to `Framework`.

  - New `BaseFramework` interface which is implemented by the abstract `Framework` class and used by the `RemirrorManager` to keep hold of an instance of the `Framework`.
  - New `attachFramework` method on the manager.
  - Update `doc` property to `document` throughout the codebase. `doc` could be confused with the `doc` node or the actual document. Now it's clearer. Any time `doc` is mentioned in the code base it refers to the `ProseMirror` node. Any time `document` is mentioned it is referring to the DOM.
  - Remove `SocialEditorWrapperComponent` export from `@remirror/react-social`.

### Minor Changes

- [`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc) [#668](https://github.com/remirror/remirror/pull/668) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `MarkSupportsExit` tag to `ExtensionTag` constant export.

  Add `KeymapExtension` option `exitMarksOnArrowPress` which allows the user to exit marks with the `MarkSupportExit` tag from the beginning or the end of the document.

  Store tags as `markTags`, `nodeTags`, `plainTags` and deprecate the helper methods which were previously doing this.

  Add `extraTags` option to the extension and `RemirrorManager` now extra can be added as part of the configuration.

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/core-utils@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 7a34e15d: Add support for returning a `Dispose` method from the `onCreate` and `onView` lifecycle methods for automatic cleanup in the `onDestroy` handler.
- 7a34e15d: Add support for early return handler predicate checks. Now it's possible to use a function to check if the value received from a handler should trigger an early return.
- 7a34e15d: Update return signature of `getMarkRange` from `@remirror/core-utils` to also include the `mark` found. Additionally, to better support optional chaining it now returns `undefined` instead of `false` when no range can be found.
- 7a34e15d: Add `invalidMarks` support.

  - Add the ability to disable all input rules if a certain mark is active.
  - Fix the `ItalicExtension` regex which was over eager.
  - Expose `decorationSet` for the `prosemirror-suggest` state.
  - Export `markActiveInRange`, `rangeHasMarks`, `positionHasMarks` from `prosemirror-suggest`.
  - Add helpers `getMarksByTags` and `getNodesByTags` to the `TagsExtension`.

- 7a34e15d: Add new properties `chain`, `commands` and `helpers` to simplify usage of commands and helpers within extensions. Also allow using `setExtensionStore` within the `onView` lifecycle handler, which previously was prevented.

  Deprecate `getCommands`, `getChain` and `getHelpers` methods on the `Remirror.ExtensionStore` interface. They will be removed in a future release.

- 7a34e15d: Add priority parameter to the `addHandler` method. Now hooks which consume the `addHandler` methods can alter the priority with which they will be run.
- 525ac3d8: Add `AcceptUndefined` annotation which allows options to accept undefined as their default value.
- 7a34e15d: Add `isSuggesterActive` helper to the `SuggestExtension`.
- 7a34e15d: Enable disabling input rules with a `shouldSkip` method. This is now available as a handler for the `InputRulesExtension` via `shouldSkipInputRule`.

  Consuming this API looks something like this.

  ```ts
  import { Dispose, PlainExtension } from 'remirror/core';

  class CoolExtension extends PlainExtension {
    get name() {
      return 'cool';
    }

    onCreate(): Dispose {
      // Add the `shouldSkip` predicate check to this extension.
      return this.store.getExtension(InputRulesExtension).addHandler('shouldSkipInputRule', () => {
        if (something) {
          return true;
        }

        return false;
      });
    }
  }
  ```

- 7a34e15d: Add `getExtension` and `getPreset` methods to the `Remirror.ExtensionStore`.
- d47bd78f: 🎉 Brings support for adding extra attributes to the `RemirrorManager` via extension tags. Attributes can now be added to all nodes and marks with a specific tag like `ExtensionTag.Alignment` or `ExtensionTag.NodeBlock`. Every matching tag in the `Schema` receives the extra attributes defined.

  With tags, you can select a specific sub selection of marks and nodes. This will be the basis for adding advanced formatting to `remirror`.

  ```ts
  import { ExtensionTag } from 'remirror/core';
  import { CorePreset, createCoreManager } from 'remirror/preset/core';
  import { WysiwygPreset } from 'remirror/preset/wysiwyg';
  const manager = createCoreManager(() => [new WysiwygPreset(), new CorePreset()], {
    extraAttributes: [
      {
        identifiers: {
          tags: [ExtensionTag.NodeBlock],

          // Can be limited by type to `node | mark`.
          type: 'node',
        },
        attributes: { role: 'presentation' },
      },
    ],
  });
  ```

  Each item in the tags array should be read as an `OR` so the following would match `Tag1` OR `Tag2` OR `Tag3`.

  ```json
  { "tags": ["Tag1", "Tag2", "Tag3"] }
  ```

  The `type` property (`mark | node`) is exclusive and limits the type of matches that will be matched.

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

## 1.0.0-next.32

> 2020-09-05

### Major Changes

- [`c8239120`](https://github.com/remirror/remirror/commit/c823912099e9906a21a04bd80d92bc89e251bd37) [#646](https://github.com/remirror/remirror/pull/646) Thanks [@ifiokjr](https://github.com/ifiokjr)! - TypeScript 4.0.2 is now the minimum supported version.

### Minor Changes

- [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3) [#645](https://github.com/remirror/remirror/pull/645) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for prioritized keymaps. It's now possible to make sure that a hook which consumes `useKeymap` runs before the extension keybindings.

  ```tsx
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

  Here is a breakdown of the default priorities when consuming keymaps.

  - Hooks within `remirror/react/hooks` which consume `useKeymap` have a priority of `ExtensionPriority.High`.
  - `useKeymap` is given a priority of `ExtensionPriority.Medium`.
  - The `createKeymap` method for extensions is given a priority of `ExtensionPriority.Default`.
  - The `baseKeymap` which is added by default is given a priority of `ExtensionPriority.Low`.

  To change the default priority of the `createKeymap` method in a custom extension wrap the `KeyBindings` return in a tuple with the priority as the first parameter.

  ```ts
  import { ExtensionPriority, KeyBindings, KeyBindingsTuple, PlainExtension } from 'remirror/core';

  class CustomExtension extends PlainExtension {
    get name() {
      return 'custom' as const;
    }

    createKeymap(): KeyBindingsTuple {
      const bindings = {
        Enter: () => true,
        Backspace: () => true,
      };

      return [ExtensionPriority.High, bindings];
    }
  }
  ```

* [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044) [#635](https://github.com/remirror/remirror/pull/635) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `onError` and `stringHandler` methods to the `Remirror.ManagerSettings`.

- [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3) [#633](https://github.com/remirror/remirror/pull/633) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make `focus` command chainable and add `manager.tr` property for creating chainable commands. This means that the `focus` method returned by `useRemirror()` can now be safely used within a controlled editor. It uses the shared chainable transaction so that the state update does not override other state updates.

* [`bed5a9e3`](https://github.com/remirror/remirror/commit/bed5a9e37026dcbdee323c921f5c05e15d49c93d) [#616](https://github.com/remirror/remirror/pull/616) Thanks [@ankon](https://github.com/ankon)! - Optionally allow to style the currently selected text

  This adds a new option for the builtin preset, `persistentSelectionClass`. If that is set to a valid CSS class name any selection in the editor will be decorated with this class.

  This can be used to keep an indication for the current selection even when the focus changes away from the editor.

### Patch Changes

- [`5786901c`](https://github.com/remirror/remirror/commit/5786901c58d717c0921415f7bfd1f480c39a44f3) [#645](https://github.com/remirror/remirror/pull/645) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix broken styles for firefox as raised on **discord**.

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847), [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/core-utils@1.0.0-next.32
  - @remirror/core-helpers@1.0.0-next.32
  - @remirror/core-types@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.31

> 2020-09-03

### Major Changes

- [`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d) [#608](https://github.com/remirror/remirror/pull/608) Thanks [@ifiokjr](https://github.com/ifiokjr)! - 🚀 Update the `onError` handler with a new improved type signature for better management of errors. See the following example.

  ```tsx
  import React from 'react';
  import { InvalidContentHandler, RemirrorProvider } from 'remirror/core';
  import { WysiwygPreset } from 'remirror/preset/wysiwyg';
  import { RemirrorProvider, useManager } from 'remirror/react';

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

* [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove keybindings from `createSuggesters` and update packages to match the new `prosemirror-suggest` API.

### Minor Changes

- [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `selectText` command to `CommandsExtension`. Also add `dispatchCommand` for running custom commands to `CommandsExtension`.

  Fix broken command text selection in `jest-remirror` and improve `jest-remirror` type inference for the `renderEditor().view` property.

* [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for using a custom schema when creating the editor.

  - Also add support for additional `plugins` and `nodeView`'s via the manager settings.

- [`e8458bc5`](https://github.com/remirror/remirror/commit/e8458bc54402d55355bd5315526fb239bce65ed6) [#623](https://github.com/remirror/remirror/pull/623) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add manager setting `schema` for creating a remirror manager with a custom `EditorSchema`. When provided this is used to bypass the default schema creation. Be aware that when this is used `extraAttributes` will no longer work.

### Patch Changes

- Updated dependencies [[`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d)]:
  - @remirror/core-helpers@1.0.0-next.31
  - @remirror/core-utils@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- [`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf) [#598](https://github.com/remirror/remirror/pull/598) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix the broken build in production caused by comparing the mangled `Constructor.name` to an expected value.

  - Make `@types/node` an optional peer dependency of `@remirror/core-utils`.

- Updated dependencies [[`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf)]:
  - @remirror/core-utils@1.0.0-next.29

## 1.0.0-next.28

> 2020-08-27

### Major Changes

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

- [`c0dce043`](https://github.com/remirror/remirror/commit/c0dce0433780e1ddb8b21384eef4b67ae1f74e47) [#595](https://github.com/remirror/remirror/pull/595) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix a bug on `Chrome` which caused the autofocus="false" to trigger the autofocus action. Now `autofocus` being falsey removes the attribute from the dom.

* [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448) [#585](https://github.com/remirror/remirror/pull/585) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies and `linaria`.

- [`d23a0434`](https://github.com/remirror/remirror/commit/d23a0434c49ecd5bbaccffd9b8d8c42bc626219a) [#593](https://github.com/remirror/remirror/pull/593) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix issue with focusing the editor after every command.

- Updated dependencies [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28
  - @remirror/core-utils@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Major Changes

- a2bc3bfb: Support for extending the `ExtensionTag` with your own custom types and names to close #465. Deprecates `NodeGroup` and `MarkGroup` which will be removed in a future version.

  - A small breaking change removes some related type exports from `@remirror/core`.
  - Add the ability to `mutateTag` for creating custom tags in custom extensions.
  - Update several to use `tags` as a replacement for the spec group.

### Minor Changes

- 147d0f2a: 🚀 Now featuring support for `DynamicExtraAttributes` as mentioned in [#387](https://github.com/remirror/remirror/issues/387).

  - Also add support for `action` method being passed to `findChildren`, `findTextNodes`, `findInlineNodes`, `findBlockNodes`, `findChildrenByAttribute`, `findChildrenByNode`, `findChildrenByMark` and `containsNodesOfType`.
  - Deprecate `flattenNodeDescendants`. `findChildren` is now the preferred method and automatically flattens the returned output.

### Patch Changes

- Updated dependencies [a2bc3bfb]
- Updated dependencies [147d0f2a]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-utils@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Minor Changes

- e37d64de: Add range parameter to `commands.insertText`. Closes #327.
- 3f2625bf: Add a new mark input rule parameter property, `updateCaptured` which allows the developer to tweak the details of the captured detail rule. This provides a workaround for the a lack of support for the `lookbehind` regex in **Safari** and other browsers.

  Fixes #574.

### Patch Changes

- Updated dependencies [3f2625bf]
  - @remirror/core-utils@1.0.0-next.25

## 1.0.0-next.24

> 2020-08-20

### Minor Changes

- 65a7ea24: Add command to clear current range selection

## 1.0.0-next.22

> 2020-08-17

### Major Changes

- 9ab1d0f3: Remove `ExtensionType` enum which is no longer used.
- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-utils@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Major Changes

- 8c34030e: 💥 Remove property `updateSelection` from the `nodeInputRule`, `markInputRule` and `plainInputRule` functions. You should use the new `beforeDispatch` method instead.

  Add new `beforeDispatch` method to the `nodeInputRule`, `markInputRule` and `plainInputRule` parameter. This method allows users to add extra steps to the transaction after a matching input rule has been run and just before it is dispatched.

  ```ts
  import { nodeInputRule } from 'remirror/core';

  nodeInputRule({
    type,
    regexp: /abc/,
    beforeDispatch: ({ tr }) => tr.insertText('hello'),
  });
  ```

### Minor Changes

- baf3f56d: Add `ignoreWhitespace` option to `markInputRule` for ignoring a matching input rule if the capture groups is only whitespace. Apply to all wrapping input rules for `MarkExtension`'s in the `project`.

  Fix #506 `ItalicExtension` issue with input rule being greedy and capturing one preceding character when activated within a text block.

### Patch Changes

- 3673a0f0: Fix #518 caused by the way the `EditorWrapper` was setting up listeners to events from the `RemirrorManager`. Previously the failure became apparent when used in an uncontrolled editor in `StrictMode`.

  Set the default `CommandFunction` type parameter to be `EditorSchema` for better code completion when creating an extension.

- Updated dependencies [3673a0f0]
- Updated dependencies [8c34030e]
- Updated dependencies [baf3f56d]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-utils@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Patch Changes

- Updated dependencies [6d7edc85]
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [7c603a5e]
- Updated dependencies [92653907]
  - @remirror/core-utils@1.0.0-next.20
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20

## 1.0.0-next.17

> 2020-08-02

### Patch Changes

- 898c62e0: Export `BuiltinOptions` interface from `@remirror/core`.

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from `@remirror/core-utils`.
- 6e8b749a: Rename `nodeEqualsType` to `isNodeOfType`.
- 982a6b15: **BREAKING:**: rename `createSuggestions` to `createSuggesters` to keep in line with the update from `prosemirror-suggest`.

  **BREAKING:** `@remirror-core` - rename `SuggestionsExtension` to `SuggestExtension`

  `@remirror-core` - Add `builtins` parameter to `Remirror.ManagerSettings`.

- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.

### Minor Changes

- be9a9c17: Move all keymap functionality to `KeymapExtension` from `@remirror/core`. Remove all references to `@remirror/extension-base-keymap`.
- 720c9b43: Public `dynamicKeys` property now available on `Extension`'s and `Preset`'s.

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
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-types@1.0.0-next.16
  - @remirror/core-utils@1.0.0-next.16
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`, `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

- a404f5a1: Add the option `excludeExtensions` to `CorePreset`'s `constructor` to exclude any extensions.

  Remove the option `excludeHistory` from `CorePreset`'s `constructor`.

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

- e5ea0c84: Add support for `Handler` options with custom return values and early returns.

  Previously handlers would ignore any return values. Now a handler will honour the return value. The earlyReturn value can be specified in the static options using the `extensionDecorator`. Currently it only supports primitives. Support for a function to check the return value will be added later.

- 6c3b278b: Make sure the `transaction` has all the latest updates if changed between `onStateUpdate` events. This allows chaining to be supported properly.

### Patch Changes

- Updated dependencies [cdc5b801]
- Updated dependencies [44516da4]
  - @remirror/core-utils@1.0.0-next.15

## 1.0.0-next.13

> 2020-07-29

### Major Changes

- 92342ab0: Throw error in `Preset` and `Extension` when attempting to update a non-dynamic option at runtime.

### Minor Changes

- e45706e5: Add new `extensionDecorator` function which augments the static properties of an `Extension` constructor when used as a decorator.

  The following code will add a decorator to the extension.

  ```ts
  import { extensionDecorator, ExtensionPriority, PlainExtension } from 'remirror/core';

  interface ExampleOptions {
    color?: string;

    /**
     * This option is annotated as a handler and needs a static property.
     **/
    onChange?: Handler<() => void>;
  }

  @extensionDecorator<ExampleOptions>({
    defaultOptions: { color: 'red' },
    defaultPriority: ExtensionPriority.Lowest,
    handlerKeys: ['onChange'],
  })
  class ExampleExtension extends PlainExtension<ExampleOptions> {
    get name() {
      return 'example' as const;
    }
  }
  ```

  The extension decorator updates the static properties of the extension. If you prefer not to use decorators it can also be called as a function. The `Extension` constructor is mutated by the function call and does not need to be returned.

  ```ts
  extensionDecorator({ defaultSettings: { color: 'red' } })(ExampleExtension);
  ```

- f3155b5f: Add new `presetDecorator` function which augments the static properties of an `Preset` constructor when used as a decorator.

  The following code will add a decorator to the preset.

  ```ts
  import { Preset, presetDecorator } from 'remirror/core';

  interface ExampleOptions {
    color?: string;

    /**
     * This option is annotated as a handler and needs a static property.
     **/
    onChange?: Handler<() => void>;
  }

  @presetDecorator<ExampleOptions>({
    defaultOptions: { color: 'red' },
    handlerKeys: ['onChange'],
  })
  class ExamplePreset extends Preset<ExampleOptions> {
    get name() {
      return 'example' as const;
    }
  }
  ```

  The preset decorator updates the static properties of the preset. If you prefer not to use decorators it can also be called as a function. The `Preset` constructor is mutated by the function call and does not need to be returned.

  ```ts
  presetDecorator({ defaultSettings: { color: 'red' }, handlerKeys: ['onChange'] })(ExamplePreset);
  ```

- 4571a447: Use methods for `addHandler` and `addCustomHandler`

  `@remirror/react` - Bind `addHandler` and `addCustomHandler` for `Preset` and `Extension` hooks.

### Patch Changes

- d877adb3: Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

  ```
  createKeymap
  createInputRules
  createPasteRules
  ```

- cc5c1c1c: Remove static properties and use the `@extensionDecorator` instead.
- Updated dependencies [e45706e5]
- Updated dependencies [92342ab0]
  - @remirror/core-types@1.0.0-next.13
  - @remirror/core-constants@1.0.0-next.13
  - @remirror/core-helpers@1.0.0-next.13

## 1.0.0-next.12

> 2020-07-28

### Minor Changes

- 19b3595f: `isNodeActive` now matches partial attribute objects. Fixes #385.
- d8aa2432: Remove type guard from `isEmptyArray` and `isEmptyObject` as they were incorrect.

### Patch Changes

- Updated dependencies [19b3595f]
- Updated dependencies [d8aa2432]
  - @remirror/core-utils@1.0.0-next.12
  - @remirror/core-helpers@1.0.0-next.12

## 1.0.0-next.11

> 2020-07-26

### Minor Changes

- 54461006: Remove the first parameter `extensions` from the lifecycle methods `onCreate`, `onView` and `onDestroy`.

  Switch to using method signatures for extension class methods as discussed in #360. The following methods have been affected:

  ```
  onCreate
  onView
  onStateUpdate
  onDestroy
  createAttributes
  createCommands
  createPlugin
  createExternalPlugins
  createSuggestions
  createHelpers
  fromObject
  onSetOptions
  ```

### Patch Changes

- Updated dependencies [21a9650c]
  - @remirror/core-helpers@1.0.0-next.11

## 1.0.0-next.10

> 2020-07-26

### Minor Changes

- 6468058a: `RemirrorManager.create` can now accept a function to which returns an array of extensions and presets. This lazy creation allows for optimizations to be made elsewhere in the codebase.

## 1.0.0-next.9

> 2020-07-23

### Major Changes

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

## 1.0.0-next.4

> 2020-07-16

### Minor Changes

- 64edeec2: Add blur method to the editor context which is used in the `@remirror/react` and `@remirror/dom` libraries.
- 9f495078: Move `suppressHydrationWarning` prop from core to to react editor. It makes no sense for it to be in core since it only impacts the react editor.

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3
  - @remirror/core-utils@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-06

### Minor Changes

- Add support for `React.StrictMode`.

  Previously, activating `StrictMode` would cause the components to render twice and break functionality of `RemirrorProvider` due to an outdated check on whether `getRootProps` had been called. This check has been removed since it isn't needed anymore.

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
- 09e990cb: Update `EditorManager` / `ExtensionManager` name to be \*\*`RemirrorManager`.

### Minor Changes

- Previously the `useRemirror` hook only updated when the provider was updated. There are times when you want to listen to specific changes from inside the editor.

  The `useRemirror` hook now takes an optional `onChange` argument which is called on every change to the editor state. With this you can react to updates in your editor and add some really cool effects.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0

## 0.11.0

### Patch Changes

- c2237aa0: Allow empty string default value for extraAttrs

## 0.9.0

### Minor Changes

- 0300d01c: - Auto defined `isEnabled` via commands with `dispatch=undefined`.
  - `HistoryExtension` now checks that whether `dispatch=undefined`.
  - Remove `CommandStatusCheck`.
  - Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
  - Remove `isEnabled` from `Extension` interface.

### Patch Changes

- Updated dependencies [c4645570]
- Updated dependencies [0300d01c]
  - @remirror/core-utils@0.8.0
  - @remirror/core-types@0.9.0
  - prosemirror-suggest@0.7.6
  - @remirror/core-helpers@0.7.6

## 0.8.1

### Patch Changes

- 2904ebfd: Fix problem with build outputting native classes which can't be extended when the build process converts classes to their ES% function equivalent.

## 0.8.0

### Minor Changes

- 24f83413: - Change the signature of `CommandFunction` to only accept one parameter which contains `dispatch`, `view`, `state`.

  - Create a new exported `ProsemirrorCommandFunction` type to describe the prosemirror commands which are still used in the codebase.
  - Rename `KeyboardBindings` to `KeyBindings`. Allow `CommandFunctionParams` to provide extra parameters like `next` in the newly named `KeyBindings`.
  - Create a new `KeyBindingCommandFunction` to describe the `Extension.keys()` return type. Update the name of the `ExcludeOptions.keymaps` -> `ExcludeOptions.keys`.

  **BREAKING CHANGE**

- 24f83413: Improve the way `ExtensionManager` calls `Extension.keys` methods. Keys now use the new api for CommandFunctions which provides a `next` method. This method allows for better control when deciding whether or not to defer to the next keybinding in the chain.

  To override, create a new keybinding with another extension. Make sure the extension is created with a higher priority. The keybinding you create can either return true or false. By default if it returns true, no other keybindings will run. However if it returns `false` all other keybindings will be run until one returns `true`

  `next` basically calls the every lower priority keybinding in the extensions list. It gives you full control of how the bindings are called.

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5
  - prosemirror-suggest@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/core-utils@0.7.4
  - @remirror/react-portals@0.7.4
  - prosemirror-suggest@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/core-utils@0.7.3
  - @remirror/react-portals@0.7.3
  - prosemirror-suggest@0.7.3
