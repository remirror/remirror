# @remirror/core-utils

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies
  [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448),
  [`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Minor Changes

- 147d0f2a: 🚀 Now featuring support for `DynamicExtraAttributes` as mentioned in
  [#387](https://github.com/remirror/remirror/issues/387).

  - Also add support for `action` method being passed to `findChildren`, `findTextNodes`,
    `findInlineNodes`, `findBlockNodes`, `findChildrenByAttribute`, `findChildrenByNode`,
    `findChildrenByMark` and `containsNodesOfType`.
  - Deprecate `flattenNodeDescendants`. `findChildren` is now the preferred method and automatically
    flattens the returned output.

### Patch Changes

- a2bc3bfb: Support for extending the `ExtensionTag` with your own custom types and names to close
  #465. Deprecates `NodeGroup` and `MarkGroup` which will be removed in a future version.

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

- 3f2625bf: Add a new mark input rule parameter property, `updateCaptured` which allows the
  developer to tweak the details of the captured detail rule. This provides a workaround for the a
  lack of support for the `lookbehind` regex in **Safari** and other browsers.

  Fixes #574.

## 1.0.0-next.22

> 2020-08-17

### Minor Changes

- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the
  `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

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

- 8c34030e: 💥 Remove property `updateSelection` from the `nodeInputRule`, `markInputRule` and
  `plainInputRule` functions. You should use the new `beforeDispatch` method instead.

  Add new `beforeDispatch` method to the `nodeInputRule`, `markInputRule` and `plainInputRule`
  parameter. This method allows users to add extra steps to the transaction after a matching input
  rule has been run and just before it is dispatched.

  ```ts
  import { nodeInputRule } from 'remirror/core';

  nodeInputRule({
    type,
    regexp: /abc/,
    beforeDispatch: ({ tr }) => tr.insertText('hello'),
  });
  ```

### Minor Changes

- baf3f56d: Add `ignoreWhitespace` option to `markInputRule` for ignoring a matching input rule if
  the capture groups is only whitespace. Apply to all wrapping input rules for `MarkExtension`'s in
  the `project`.

  Fix #506 `ItalicExtension` issue with input rule being greedy and capturing one preceding
  character when activated within a text block.

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
  import { useRemirror } from 'remirror/react';

  const { focus } = useRemirror();
  focus('all');
  ```

### Patch Changes

- 7c603a5e: Ensure the `markInputRule` doesn't reactivate previous marks when rules are nested and
  activated consecutively. Closes #505
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - @remirror/pm@1.0.0-next.20

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- f032db7e: Remove `isEmptyParagraphNode` and `absoluteCoordinates` exports from
  `@remirror/core-utils`.
- 6e8b749a: Rename `nodeEqualsType` to `isNodeOfType`.
- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method:
  `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()`
  and type:
  `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags`
  exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from
  `multishift`.

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

- cdc5b801: Add three new helpers to `@remirror/core-utils` / `@remirror/core`: `isStateEqual`,
  `areSchemaCompatible` and `getRemirrorJSON`.

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
  - Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with
    mentions.
  - Update extension order in the `SocialPreset`
  - `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit
    was due to a selection change or a character entry.

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

- The whole API for remirror has completely changed. These pre-release versions are a breaking
  change across all packages. The best way to know what's changed is to read the documentaion on the
  new documentation site `https://remirror.io`.
- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`.
  If your code was importing any matching interface you will need to update the name.

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

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
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
