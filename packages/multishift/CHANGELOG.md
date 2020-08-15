# multishift

## 0.7.8-next.5

> 2020-08-15

### Patch Changes

- Updated dependencies [3673a0f0]
  - @remirror/core-types@1.0.0-next.21
  - @remirror/core-helpers@1.0.0-next.21

## 0.7.8-next.4

> 2020-08-14

### Patch Changes

- Updated dependencies [8f9eb16c]
- Updated dependencies [770e3d4a]
  - @remirror/core-types@1.0.0-next.20
  - @remirror/core-helpers@1.0.0-next.20
  - a11y-status@1.0.0-next.4

## 1.0.0-next.3

> 2020-08-01

### Major Changes

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
  - @remirror/core-helpers@1.0.0-next.16
  - a11y-status@1.0.0-next.3

## 1.0.0-next.2

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-helpers@1.0.0-next.4
  - @remirror/core-types@1.0.0-next.4
  - a11y-status@1.0.0-next.2

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-helpers@1.0.0-next.1
  - @remirror/core-types@1.0.0-next.1
  - a11y-status@1.0.0-next.1

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

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [09d91abf]
  - @remirror/core-helpers@1.0.0-next.0
  - @remirror/core-types@1.0.0-next.0
  - a11y-status@1.0.0-next.0

## 0.7.7

### Patch Changes

- 000fdfb0: Upgraded external dependencies with major releases.
- Updated dependencies [000fdfb0]
  - @remirror/ui-icons@0.7.8

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core-types@0.9.0
  - @remirror/core-helpers@0.7.6
  - @remirror/react-hooks@0.7.6
  - @remirror/react-utils@0.7.6
  - @remirror/ui@0.7.6
  - @remirror/ui-icons@0.7.7
  - @remirror/ui-text@0.7.6
  - @remirror/ui-buttons@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/react-hooks@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/ui@0.7.5
  - @remirror/ui-icons@0.7.6
  - @remirror/ui-text@0.7.5
  - @remirror/ui-buttons@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-helpers@0.7.4
  - @remirror/core-types@0.7.4
  - @remirror/react-hooks@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/ui-a11y-status@0.7.4
  - @remirror/ui-buttons@0.7.4
  - @remirror/ui-icons@0.7.5
  - @remirror/ui-text@0.7.4
  - @remirror/ui@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-helpers@0.7.3
  - @remirror/core-types@0.7.3
  - @remirror/react-hooks@0.7.3
  - @remirror/react-utils@0.7.3
  - @remirror/ui@0.7.3
  - @remirror/ui-a11y-status@0.7.3
  - @remirror/ui-buttons@0.7.3
  - @remirror/ui-icons@0.7.3
  - @remirror/ui-text@0.7.3
