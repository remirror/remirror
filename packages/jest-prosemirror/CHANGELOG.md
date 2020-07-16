# jest-prosemirror

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

- 24f83413: Create a new class `ProsemirrorTestChain` for chaining the return from `createEditor`.
  Previously it was manually chained with a function. The plan is to extend this class within the
  `jest-remirror` codebase.

### Patch Changes

- Updated dependencies [24f83413]
  - @remirror/core-types@0.8.0
  - @remirror/core-helpers@0.7.5
  - @remirror/core-utils@0.7.5
  - test-keyboard@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
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
