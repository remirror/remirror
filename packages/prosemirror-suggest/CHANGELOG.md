# prosemirror-suggest

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies
  [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/core-helpers@1.0.0-next.28
  - @remirror/core-types@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/core-helpers@1.0.0-next.26
  - @remirror/core-types@1.0.0-next.26

## 1.0.0-next.22

> 2020-08-17

### Major Changes

- 113560bb: Required temporary fix to resolve issue with unlinked packages in prerelease mode. See
  the [issue](https://github.com/atlassian/changesets/issues/442) for more details.

### Patch Changes

- Updated dependencies [9ab1d0f3]
- Updated dependencies [45d82746]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/core-types@1.0.0-next.22
  - @remirror/core-helpers@1.0.0-next.22

## 0.7.7-next.6

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21

## 1.0.0-next.5

> 2020-08-14

### Patch Changes

- 48cce3a0: Remove misleading documentation. The matchOffset field isn't defaulted to zero for
  MentionExtension.
- 770e3d4a: Update package dependencies.
- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20

## 1.0.0-next.4

> 2020-08-01

### Major Changes

- 4463d117: **Rename `Suggestion` to `Suggester`**

  The name `Suggestion` implies something offered to a user. For example typing `@a` offers a
  suggestion to tag a certain username. Using `Suggestion` as the name for the configuration object
  is confusing. Going forward `Suggester` will be used as the name of the configuration object.

  The `Suggester` configures the editor to behave in a desired way so that it can provide
  suggestions to end users.

  **Make `prosemirror-state` and `prosemirror-keymap` peerDependencies.**

  Make all `@type/*` peer dependencies optional.

  Remove `@remirror/core-utils` from dependencies to avoid bloating the size.

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

### Minor Changes

- 068d2e07: Allow runtime additions to the `prosemirror-suggest` plugin.

  You can now add suggester configurations to active suggest plugin instances. The name is used as
  an identifier and identical names will automatically be replaced.

- 4eb56ecd: Make `removed` and `setMarkRemoved()` methods public on `SuggestState`.

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

## 1.0.0-next.3

> 2020-07-21

### Minor Changes

- a93c83bd: - Add `keepSelection` property to the `replaceText` command function.
  - Prevent mentions from trapping the cursor when arrowing left and right through the mention.
  - Set low priority for `AutoLinkExtension` to prevent `appendTransaction` interfering with
    mentions.
  - Update extension order in the `SocialPreset`
  - `prosemirror-suggest` - New export `isSelectionExitReason` which let's the user know if the exit
    was due to a selection change or a character entry.

### Patch Changes

- Updated dependencies [a93c83bd]
  - @remirror/core-utils@1.0.0-next.8

## 1.0.0-next.2

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - @remirror/core-utils@1.0.0-next.4

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - @remirror/core-utils@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking
  change across all packages. The best way to know what's changed is to read the documentaion on the
  new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from
    '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`.
  If your code was importing any matching interface you will need to update the name.
- f212b90a: Rename the `Suggester` interface to a more understandable name of `Suggestion`.

  So change this:

  ```ts
  import { Suggester } from 'prosemirror-suggest';
  ```

  To this:

  ```ts
  import { Suggestion } from 'prosemirror-suggest';
  ```

### Minor Changes

- 968cdc4d: Add `ignoreNext` exit method to prosemirror suggest which enables ignoring one exit when
  the suggestion has already been applied outside of the `prosemirror-suggest` `command` helper.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - @remirror/core-utils@1.0.0-next.0

## 0.7.6

### Patch Changes

- Updated dependencies [c4645570]
- Updated dependencies [0300d01c]
  - @remirror/core-utils@0.8.0
  - @remirror/core-types@0.9.0
  - @remirror/core-helpers@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/core-utils@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-constants@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/core-utils@0.7.3
