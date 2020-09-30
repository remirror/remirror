# @remirror/core-utils

## 1.0.0-next.44

> 2020-09-30

### Patch Changes

- Updated dependencies [[`bcf3b2c4`](https://github.com/remirror/remirror/commit/bcf3b2c4c0eabc90e1690593d4a9dfb2a9d39c68)]:
  - @remirror/pm@1.0.0-next.44
  - @remirror/core-types@1.0.0-next.44
  - @remirror/core-helpers@1.0.0-next.44

## 1.0.0-next.43

> 2020-09-28

### Minor Changes

- [`b030cb6e`](https://github.com/remirror/remirror/commit/b030cb6e50cb6fdc045a4680f4861ad145609197) [#728](https://github.com/remirror/remirror/pull/728) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `text` property to the return value from `getMarkRange`. It's a common use case when getting the range of the mark to also extract the text content.

## 1.0.0-next.42

> 2020-09-26

### Minor Changes

- [`9fa07878`](https://github.com/remirror/remirror/commit/9fa078780504bff81d28183ee8cda3b599412cf0) [#721](https://github.com/remirror/remirror/pull/721) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add new helpers `getChangedRanges`, `getChangedNodeRanges` and `getChangedNodes` which take a transaction and return a list of changed ranges, node ranges or nodes with positions.

  This is useful for increasing the performance and only checking the parts of the document that have changed between updates.

## 1.0.0-next.40

> 2020-09-24

### Major Changes

- [`add65c90`](https://github.com/remirror/remirror/commit/add65c90162612037e1bf9abd98b6436db9ba6ef) [#700](https://github.com/remirror/remirror/pull/700) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING:** 💥 Remove exports for `flatten` and `emptyCommandFunction` which are unused in the codebase and not very practical.

  Update API for `findChildrenByAttribute` to only support an object of attributeNames and literal value or predicate value.

  ```ts
  const mergedCells = findChildrenByAttribute({
    node: table,
    attrs: { colspan: 2, id: (_, exists) => exists },
  });
  ```

### Patch Changes

- Updated dependencies [[`4b1d99a6`](https://github.com/remirror/remirror/commit/4b1d99a60c9cf7c652b69967179be39ae5db3ff4), [`fd694d61`](https://github.com/remirror/remirror/commit/fd694d610e12bef9e43682074f71ef3097f6ea6e)]:
  - @remirror/core-types@1.0.0-next.40
  - @remirror/pm@1.0.0-next.40
  - @remirror/core-helpers@1.0.0-next.40

## 1.0.0-next.39

> 2020-09-16

### Patch Changes

- Updated dependencies [[`61894188`](https://github.com/remirror/remirror/commit/61894188781ca9f6e0571b1e425261028545385c)]:
  - @remirror/pm@1.0.0-next.39
  - @remirror/core-types@1.0.0-next.39
  - @remirror/core-helpers@1.0.0-next.39

## 1.0.0-next.38

> 2020-09-16

### Patch Changes

- Updated dependencies [[`14e48698`](https://github.com/remirror/remirror/commit/14e48698a28c3ec54a475970e0a6375f446a3a73), [`6855ee77`](https://github.com/remirror/remirror/commit/6855ee773bf25a4b30d45a7e09eeab78d6b3f67a)]:
  - @remirror/pm@1.0.0-next.38
  - @remirror/core-helpers@1.0.0-next.38
  - @remirror/core-types@1.0.0-next.38

## 1.0.0-next.37

> 2020-09-14

### Patch Changes

- Updated dependencies [[`5a3dd95f`](https://github.com/remirror/remirror/commit/5a3dd95f11edee885c1d07b1ece8413d830b3405)]:
  - @remirror/pm@1.0.0-next.37
  - @remirror/core-types@1.0.0-next.37
  - @remirror/core-helpers@1.0.0-next.37

## 1.0.0-next.35

> 2020-09-13

### Minor Changes

- [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec) [#676](https://github.com/remirror/remirror/pull/676) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `chainableEditorState` which makes the `EditorState` chainable with a shared transaction. Also set the `@remirror/pm` entry point to export types and utility methods. This is now used in the core libraries.

### Patch Changes

- [`1b6b2922`](https://github.com/remirror/remirror/commit/1b6b2922cdc83d5a426cf43d3ad9540c18b799d9) [#670](https://github.com/remirror/remirror/pull/670) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fixes `toggleList` command to only update the transaction when dispatch is provided \[[#669](https://github.com/remirror/remirror/issues/669)].

* [`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813) [#672](https://github.com/remirror/remirror/pull/672) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Reduce bundle size by updating babel configuration thanks to help from [preconstruct/preconstruct/297](https://github.com/preconstruct/preconstruct/issues/297#issuecomment-690964802). [Fixes #358](https://github.com/remirror/remirror/issues/358).

* Updated dependencies [[`725df02b`](https://github.com/remirror/remirror/commit/725df02b53fa16b9c7a3768b0c9464e739e35813), [`4fee3e94`](https://github.com/remirror/remirror/commit/4fee3e9400dd5557ddb24f6256e6d7219cef34ec)]:
  - @remirror/core-constants@1.0.0-next.35
  - @remirror/core-helpers@1.0.0-next.35
  - @remirror/core-types@1.0.0-next.35
  - @remirror/pm@1.0.0-next.35

## 1.0.0-next.34

> 2020-09-10

### Patch Changes

- Updated dependencies [[`27b358e4`](https://github.com/remirror/remirror/commit/27b358e4cb877a1e8df61c9d5326f366e66f30dc), [`5945dffe`](https://github.com/remirror/remirror/commit/5945dffeadac8ae568be1ab0014e1186e03d5fb0)]:
  - @remirror/core-constants@1.0.0-next.34
  - @remirror/core-helpers@1.0.0-next.34
  - @remirror/core-types@1.0.0-next.34
  - @remirror/pm@1.0.0-next.34

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 7a34e15d: Update return signature of `getMarkRange` from `@remirror/core-utils` to also include the `mark` found. Additionally, to better support optional chaining it now returns `undefined` instead of `false` when no range can be found.
- 7a34e15d: Add `invalidMarks` support.

  - Add the ability to disable all input rules if a certain mark is active.
  - Fix the `ItalicExtension` regex which was over eager.
  - Expose `decorationSet` for the `prosemirror-suggest` state.
  - Export `markActiveInRange`, `rangeHasMarks`, `positionHasMarks` from `prosemirror-suggest`.
  - Add helpers `getMarksByTags` and `getNodesByTags` to the `TagsExtension`.

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

### Patch Changes

- 92ed4135: Fix editable mentions support for exiting when text is selected. Also update `getSelection` to support `anchor` and `head` selections.
- Updated dependencies [7a34e15d]
- Updated dependencies [525ac3d8]
- Updated dependencies [92ed4135]
  - @remirror/core-constants@1.0.0-next.33
  - @remirror/core-types@1.0.0-next.33
  - @remirror/core-helpers@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Minor Changes

- [`e7b0bb0f`](https://github.com/remirror/remirror/commit/e7b0bb0ffdb7e2d6ac6be38baadde4a4dd402847) [#641](https://github.com/remirror/remirror/pull/641) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Move `isEmptyBlockNode` function from `@remirror/extension-positioner` to `@remirror/core-utils`. Re-export to prevent breaking change.

* [`aa27e968`](https://github.com/remirror/remirror/commit/aa27e96853aaaa701409a04e9b5135c94c371044) [#635](https://github.com/remirror/remirror/pull/635) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `onError` and `stringHandler` methods to the `Remirror.ManagerSettings`.

### Patch Changes

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3), [`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
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

### Patch Changes

- Updated dependencies [[`1a7da61a`](https://github.com/remirror/remirror/commit/1a7da61a483358214f8f24e193d837b171dd4e1d)]:
  - @remirror/core-helpers@1.0.0-next.31

## 1.0.0-next.29

> 2020-08-28

### Patch Changes

- [`05446a62`](https://github.com/remirror/remirror/commit/05446a62d4f1d1cf3c940b2766a7ea5f66a77ebf) [#598](https://github.com/remirror/remirror/pull/598) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix the broken build in production caused by comparing the mangled `Constructor.name` to an expected value.

  - Make `@types/node` an optional peer dependency of `@remirror/core-utils`.

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448), [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Minor Changes

- 147d0f2a: 🚀 Now featuring support for `DynamicExtraAttributes` as mentioned in [#387](https://github.com/remirror/remirror/issues/387).

  - Also add support for `action` method being passed to `findChildren`, `findTextNodes`, `findInlineNodes`, `findBlockNodes`, `findChildrenByAttribute`, `findChildrenByNode`, `findChildrenByMark` and `containsNodesOfType`.
  - Deprecate `flattenNodeDescendants`. `findChildren` is now the preferred method and automatically flattens the returned output.

### Patch Changes

- a2bc3bfb: Support for extending the `ExtensionTag` with your own custom types and names to close #465. Deprecates `NodeGroup` and `MarkGroup` which will be removed in a future version.

  - A small breaking change removes some related type exports from `@remirror/core`.
  - Add the ability to `mutateTag` for creating custom tags in custom extensions.
  - Update several to use `tags` as a replacement for the spec group.

- Updated dependencies [a2bc3bfb]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.25

> 2020-08-23

### Minor Changes

- 3f2625bf: Add a new mark input rule parameter property, `updateCaptured` which allows the developer to tweak the details of the captured detail rule. This provides a workaround for the a lack of support for the `lookbehind` regex in **Safari** and other browsers.

  Fixes #574.

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
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

- Updated dependencies [3673a0f0]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21
  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Major Changes

- 6d7edc85: Rename `areSchemaCompatible` to `areSchemasCompatible`.

  Closes #500

### Minor Changes

- 8f9eb16c: Enable `all` selection when setting initial content and focusing on the editor.

  ```tsx
  import React from 'react';
  import { useRemirror } from 'remirror/react';

  const EditorButton = () => {
    const { focus } = useRemirror();

    return <button onClick={() => focus('all')} />;
  };
  ```

### Patch Changes

- 7c603a5e: Ensure the `markInputRule` doesn't reactivate previous marks when rules are nested and activated consecutively. Closes #505
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from `@remirror/core-utils`.
- 6e8b749a: Rename `nodeEqualsType` to `isNodeOfType`.
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
  - @remirror/core-helpers@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.15

> 2020-07-31

### Major Changes

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`, `areSchemaCompatible` and `getRemirrorJSON`.

  BREAKING: 💥 Rename `getObjectNode` to `getRemirrorJSON`.

### Minor Changes

- 44516da4: Support `chained` commands and multiple command updates in controlled editors.

  Fixes #418

## 1.0.0-next.12

> 2020-07-28

### Minor Changes

- 19b3595f: `isNodeActive` now matches partial attribute objects. Fixes #385.

### Patch Changes

- Updated dependencies [d8aa2432]
  - @remirror/core-helpers@1.0.0-next.12

## 1.0.0-next.8

> 2020-07-21

### Minor Changes

- a93c83bd: - Add `keepSelection` property to the `replaceText` command function.
  - Prevent mentions from trapping the cursor when arrowing left and right through the mention.
  - Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with mentions.
  - Update extension order in the `SocialPreset`
  - `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit was due to a selection change or a character entry.

## 1.0.0-next.6

> 2020-07-20

### Patch Changes

- e06a3623: Upgrade package dependencies.
- Updated dependencies [e06a3623]
  - @remirror/core-constants@1.0.0-next.6
  - @remirror/core-helpers@1.0.0-next.6
  - @remirror/core-types@1.0.0-next.6

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3
  - @remirror/core-types@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0

## 0.8.0

### Minor Changes

- c4645570: - Allow toggling between bullet and ordered list and vice versa.
  - Add depth to findParentNode(), findPositionOfNodeBefore(), findPositionOfNodeAfter().
  - Fix findPositionOfNodeBefore(), findPositionOfNodeAfter() returning incorrect start position.

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core-types@0.9.0
  - @remirror/core-helpers@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
