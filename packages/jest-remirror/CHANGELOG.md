# jest-remirror

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

- 9a699e80: Upgrade dependencies to use v26.0.0 of jest.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [8334294e]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
- Updated dependencies [9a699e80]
- Updated dependencies [dd16d45d]
- Updated dependencies [8334294e]
  - @remirror/pm@1.0.0-next.0
  - jest-prosemirror@1.0.0-next.0
  - remirror@1.0.0-next.0

## 0.13.1

### Patch Changes

- Updated dependencies [4dbb7461]
  - @remirror/core-extensions@0.13.1
  - @remirror/react@0.13.1

## 0.11.1

### Patch Changes

- 000fdfb0: Upgraded external dependencies with major releases.
- Updated dependencies [d2a288aa]
- Updated dependencies [5888a7aa]
- Updated dependencies [000fdfb0]
  - jest-prosemirror@0.8.2
  - @remirror/core-extensions@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [026d4238]
- Updated dependencies [69d00c62]
- Updated dependencies [c2237aa0]
  - @remirror/react@0.11.0
  - @remirror/core@0.11.0
  - @remirror/core-extensions@0.11.0

## 0.8.1

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/core-extensions@0.7.6
  - jest-prosemirror@0.8.1
  - @remirror/react-utils@0.7.6
  - @remirror/react@0.7.7

## 0.8.0

### Minor Changes

- 527395be: `renderEditor` now accepts PrioritizedExtensions for more flexible testing.

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - jest-prosemirror@0.8.0
  - @remirror/core-extensions@0.7.5
  - @remirror/react-utils@0.7.5
  - @remirror/react@0.7.6

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub
  organisation.
- Updated dependencies [10419145]
- Updated dependencies [7380e18f]
  - @remirror/core-extensions@0.7.4
  - @remirror/core@0.7.4
  - @remirror/react-utils@0.7.4
  - @remirror/react@0.7.5
  - jest-prosemirror@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/core-extensions@0.7.3
  - @remirror/react@0.7.3
  - @remirror/react-utils@0.7.3
  - jest-prosemirror@0.7.3
